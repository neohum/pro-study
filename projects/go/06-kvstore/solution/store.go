package main

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
)

var (
	ErrKeyNotFound = errors.New("key not found")
	ErrEmptyKey    = errors.New("key cannot be empty")
	ErrStoreClosed = errors.New("store is closed")
)

type OpType string

const (
	OpSet OpType = "SET"
	OpDel OpType = "DEL"
)

type Record struct {
	Op    OpType `json:"op"`
	Key   string `json:"key"`
	Value string `json:"val,omitempty"`
}

type KVStore struct {
	mu      sync.RWMutex
	dir     string
	data    map[string]string
	walFile *os.File
	closed  bool
}

// Open은 지정된 디렉터리에서 저장소를 초기화하고 시작한다.
// 기존 snapshot.json이 있으면 먼저 로드하고, wal.log를 재생한 뒤 추가 모드로 WAL을 연다.
func Open(dir string) (*KVStore, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, fmt.Errorf("mkdir %s: %w", dir, err)
	}

	data := make(map[string]string)

	// 1. 스냅샷 로드
	snapPath := filepath.Join(dir, "snapshot.json")
	if snapBytes, err := os.ReadFile(snapPath); err == nil {
		_ = json.Unmarshal(snapBytes, &data)
	}

	// 2. WAL 재생
	walPath := filepath.Join(dir, "wal.log")
	if walBytes, err := os.ReadFile(walPath); err == nil {
		replayWAL(walBytes, data)
	}

	// 3. 추가 모드로 WAL 파일 오픈
	f, err := os.OpenFile(walPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		return nil, fmt.Errorf("open wal: %w", err)
	}

	return &KVStore{
		dir:     dir,
		data:    data,
		walFile: f,
	}, nil
}

// replayWAL은 WAL 바이트를 한 줄씩 파싱하여 메모리 맵에 반영한다.
// 손상되었거나 불완전한 마지막 줄이 있으면 안전하게 무시한다.
func replayWAL(b []byte, data map[string]string) {
	sc := bufio.NewScanner(strings.NewReader(string(b)))
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" {
			continue
		}
		var rec Record
		if err := json.Unmarshal([]byte(line), &rec); err != nil {
			continue
		}
		switch rec.Op {
		case OpSet:
			data[rec.Key] = rec.Value
		case OpDel:
			delete(data, rec.Key)
		}
	}
}

func (s *KVStore) Get(key string) (string, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.closed {
		return "", false
	}
	val, ok := s.data[key]
	return val, ok
}

func (s *KVStore) Keys() []string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.closed {
		return nil
	}
	keys := make([]string, 0, len(s.data))
	for k := range s.data {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

func (s *KVStore) Set(key, value string) error {
	if key == "" {
		return ErrEmptyKey
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.closed {
		return ErrStoreClosed
	}

	rec := Record{Op: OpSet, Key: key, Value: value}
	if err := s.appendWAL(rec); err != nil {
		return err
	}
	s.data[key] = value
	return nil
}

func (s *KVStore) Delete(key string) (bool, error) {
	if key == "" {
		return false, ErrEmptyKey
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.closed {
		return false, ErrStoreClosed
	}

	if _, ok := s.data[key]; !ok {
		return false, nil
	}

	rec := Record{Op: OpDel, Key: key}
	if err := s.appendWAL(rec); err != nil {
		return false, err
	}
	delete(s.data, key)
	return true, nil
}

func (s *KVStore) appendWAL(rec Record) error {
	bytes, err := json.Marshal(rec)
	if err != nil {
		return err
	}
	bytes = append(bytes, '\n')
	if _, err := s.walFile.Write(bytes); err != nil {
		return err
	}
	return s.walFile.Sync()
}

func (s *KVStore) Snapshot() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.closed {
		return ErrStoreClosed
	}

	// 1. 현재 데이터 JSON 직렬화
	dataBytes, err := json.MarshalIndent(s.data, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal snapshot: %w", err)
	}

	// 2. 임시 파일에 기록
	snapPath := filepath.Join(s.dir, "snapshot.json")
	tmpPath := snapPath + ".tmp"
	if err := os.WriteFile(tmpPath, dataBytes, 0o644); err != nil {
		return fmt.Errorf("write snapshot tmp: %w", err)
	}

	// 3. 원자적 이름 변경
	if err := os.Rename(tmpPath, snapPath); err != nil {
		return fmt.Errorf("rename snapshot: %w", err)
	}

	// 4. WAL 파일 초기화(Compaction)
	if err := s.walFile.Close(); err != nil {
		return fmt.Errorf("close wal: %w", err)
	}
	walPath := filepath.Join(s.dir, "wal.log")
	f, err := os.OpenFile(walPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o644)
	if err != nil {
		return fmt.Errorf("reopen wal: %w", err)
	}
	s.walFile = f
	return nil
}

func (s *KVStore) Close() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.closed {
		return nil
	}
	s.closed = true
	if s.walFile != nil {
		return s.walFile.Close()
	}
	return nil
}
