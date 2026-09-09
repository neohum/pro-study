package main

import (
	"bytes"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
)

func TestBasicSetGetDelete(t *testing.T) {
	dir := t.TempDir()
	store, err := Open(dir)
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	defer store.Close()

	// 1. Set and Get
	if err := store.Set("user:1", "Alice"); err != nil {
		t.Fatalf("Set: %v", err)
	}
	if err := store.Set("user:2", "Bob"); err != nil {
		t.Fatalf("Set: %v", err)
	}

	val, ok := store.Get("user:1")
	if !ok || val != "Alice" {
		t.Fatalf("Get(user:1) = %q, %v; want Alice, true", val, ok)
	}
	val, ok = store.Get("user:2")
	if !ok || val != "Bob" {
		t.Fatalf("Get(user:2) = %q, %v; want Bob, true", val, ok)
	}

	// 2. Nonexistent key
	_, ok = store.Get("user:999")
	if ok {
		t.Fatal("Get(user:999) should return false")
	}

	// 3. Empty key error
	if err := store.Set("", "value"); !errors.Is(err, ErrEmptyKey) {
		t.Fatalf("Set empty key: got %v, want ErrEmptyKey", err)
	}

	// 4. Keys list
	keys := store.Keys()
	if len(keys) != 2 || keys[0] != "user:1" || keys[1] != "user:2" {
		t.Fatalf("Keys() = %v; want [user:1, user:2]", keys)
	}

	// 5. Delete
	deleted, err := store.Delete("user:1")
	if err != nil || !deleted {
		t.Fatalf("Delete(user:1) = %v, %v; want true, nil", deleted, err)
	}
	deleted, err = store.Delete("user:1")
	if err != nil || deleted {
		t.Fatalf("second Delete(user:1) = %v, %v; want false, nil", deleted, err)
	}

	_, ok = store.Get("user:1")
	if ok {
		t.Fatal("user:1 must not exist after delete")
	}
}

func TestPersistenceAndReplay(t *testing.T) {
	dir := t.TempDir()

	// 1. 첫 번째 세션: 데이터 쓰기
	s1, err := Open(dir)
	if err != nil {
		t.Fatalf("Open 1: %v", err)
	}
	_ = s1.Set("k1", "v1")
	_ = s1.Set("k2", "v2")
	_ = s1.Set("k3", "v3")
	_, _ = s1.Delete("k2")
	if err := s1.Close(); err != nil {
		t.Fatalf("Close 1: %v", err)
	}

	// 2. 두 번째 세션: WAL 재생을 통한 데이터 복원
	s2, err := Open(dir)
	if err != nil {
		t.Fatalf("Open 2: %v", err)
	}
	defer s2.Close()

	if v, ok := s2.Get("k1"); !ok || v != "v1" {
		t.Fatalf("replayed k1 = %q, %v; want v1, true", v, ok)
	}
	if _, ok := s2.Get("k2"); ok {
		t.Fatal("deleted k2 should not exist after replay")
	}
	if v, ok := s2.Get("k3"); !ok || v != "v3" {
		t.Fatalf("replayed k3 = %q, %v; want v3, true", v, ok)
	}
}

func TestSnapshotAndCompaction(t *testing.T) {
	dir := t.TempDir()

	s, err := Open(dir)
	if err != nil {
		t.Fatalf("Open: %v", err)
	}

	_ = s.Set("a", "10")
	_ = s.Set("b", "20")
	_ = s.Set("c", "30")

	// 스냅샷 생성
	if err := s.Snapshot(); err != nil {
		t.Fatalf("Snapshot: %v", err)
	}

	// wal.log 파일 크기가 0이어야 함 (로그 압축)
	walStat, err := os.Stat(filepath.Join(dir, "wal.log"))
	if err != nil {
		t.Fatalf("stat wal.log: %v", err)
	}
	if walStat.Size() != 0 {
		t.Fatalf("expected wal.log size 0 after compaction, got %d", walStat.Size())
	}

	// snapshot.json 파일이 존재해야 함
	if _, err := os.Stat(filepath.Join(dir, "snapshot.json")); err != nil {
		t.Fatalf("snapshot.json missing: %v", err)
	}

	// 스냅샷 이후 새 데이터 쓰기
	_ = s.Set("d", "40")
	_ = s.Close()

	// 저장소를 다시 열었을 때 스냅샷 데이터 + 새 WAL 데이터가 모두 복구되어야 함
	s2, err := Open(dir)
	if err != nil {
		t.Fatalf("reopen: %v", err)
	}
	defer s2.Close()

	for k, want := range map[string]string{"a": "10", "b": "20", "c": "30", "d": "40"} {
		if got, ok := s2.Get(k); !ok || got != want {
			t.Fatalf("key %s = %q, %v; want %q", k, got, ok, want)
		}
	}
}

func TestCrashRecoveryCorruptTrailing(t *testing.T) {
	dir := t.TempDir()

	s, err := Open(dir)
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	_ = s.Set("valid1", "data1")
	_ = s.Set("valid2", "data2")
	_ = s.Close()

	// 비정상 종료 모사: WAL 끝에 불완전한 바이트를 덧붙임
	walPath := filepath.Join(dir, "wal.log")
	f, err := os.OpenFile(walPath, os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		t.Fatalf("open wal: %v", err)
	}
	_, _ = f.WriteString("{\"op\":\"SET\",\"key\":\"corrupted_tr\n")
	_ = f.Close()

	// 다시 열었을 때 손상된 마지막 줄은 무시하고 정상 데이터만 복구해야 함
	recovered, err := Open(dir)
	if err != nil {
		t.Fatalf("Open after crash: %v", err)
	}
	defer recovered.Close()

	if val, ok := recovered.Get("valid1"); !ok || val != "data1" {
		t.Fatalf("valid1 = %q, %v; want data1", val, ok)
	}
	if val, ok := recovered.Get("valid2"); !ok || val != "data2" {
		t.Fatalf("valid2 = %q, %v; want data2", val, ok)
	}
	if _, ok := recovered.Get("corrupted_tr"); ok {
		t.Fatal("corrupted entry should not be recovered")
	}
}

func TestConcurrentAccess(t *testing.T) {
	dir := t.TempDir()
	store, err := Open(dir)
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	defer store.Close()

	var wg sync.WaitGroup
	count := 20

	for i := 0; i < count; i++ {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			key := "concurrent"
			_ = store.Set(key, "val")
			_, _ = store.Get(key)
			_ = store.Keys()
		}(i)
	}
	wg.Wait()
}

func TestCLICommands(t *testing.T) {
	dir := t.TempDir()

	// 1. set
	out, errBuf := new(bytes.Buffer), new(bytes.Buffer)
	code := run([]string{"-dir", dir, "set", "name", "gopher"}, out, errBuf)
	if code != 0 || !strings.Contains(out.String(), "OK") {
		t.Fatalf("set failed: code %d, out %q, err %q", code, out.String(), errBuf.String())
	}

	// 2. get
	out.Reset()
	errBuf.Reset()
	code = run([]string{"-dir", dir, "get", "name"}, out, errBuf)
	if code != 0 || strings.TrimSpace(out.String()) != "gopher" {
		t.Fatalf("get failed: code %d, out %q", code, out.String())
	}

	// 3. list
	out.Reset()
	errBuf.Reset()
	code = run([]string{"-dir", dir, "list"}, out, errBuf)
	if code != 0 || !strings.Contains(out.String(), "name = gopher") {
		t.Fatalf("list failed: code %d, out %q", code, out.String())
	}

	// 4. snapshot
	out.Reset()
	errBuf.Reset()
	code = run([]string{"-dir", dir, "snapshot"}, out, errBuf)
	if code != 0 {
		t.Fatalf("snapshot failed: code %d, err %q", code, errBuf.String())
	}

	// 5. del
	out.Reset()
	errBuf.Reset()
	code = run([]string{"-dir", dir, "del", "name"}, out, errBuf)
	if code != 0 || !strings.Contains(out.String(), "OK") {
		t.Fatalf("del failed: code %d, out %q", code, out.String())
	}
}
