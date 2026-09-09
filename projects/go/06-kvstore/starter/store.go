package main

import (
	"errors"
	"os"
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

// TODO(step-1): 레코드 정의와 메모리 Map
// Get: s.mu.RLock()으로 키 조회, 존재 여부(bool) 반환.
// Keys: s.mu.RLock()으로 모든 키를 슬라이스로 모은 뒤 sort.Strings로 정렬하여 반환.
func (s *KVStore) Get(key string) (string, bool) {
	_ = key
	return "", false
}

func (s *KVStore) Keys() []string {
	return []string{}
}

// TODO(step-2): WAL(Write-Ahead Log) 추가 및 동기화
// Set: 키가 비었으면 ErrEmptyKey 반환.
//   s.mu.Lock() 후 Record{Op: OpSet, Key: key, Value: value}를 JSON으로 직렬화하여
//   s.walFile에 추가(\n 포함)하고 s.walFile.Sync() 호출. 그 후 s.data[key] = value.
// Delete: 키가 비었으면 ErrEmptyKey 반환.
//   s.mu.Lock() 후 s.data에 없으면 false 반환.
//   있으면 Record{Op: OpDel, Key: key}를 WAL에 기록하고 Sync(), delete(s.data, key) 후 true 반환.
func (s *KVStore) Set(key, value string) error {
	_ = key
	_ = value
	return nil
}

func (s *KVStore) Delete(key string) (bool, error) {
	_ = key
	return false, nil
}

// TODO(step-3): WAL 재생 및 시작 시 복구
// Open: os.MkdirAll(dir) 실행.
//   1. snapshot.json 파일이 존재하면 읽어서 data 맵에 Unmarshal.
//   2. wal.log 파일이 존재하면 읽어서 한 줄씩 Record를 파싱하여 data 맵에 재생(Replay).
//   3. wal.log 파일을 os.O_CREATE|os.O_WRONLY|os.O_APPEND 모드로 열어 s.walFile에 보관.
func Open(dir string) (*KVStore, error) {
	_ = dir
	return &KVStore{
		data: make(map[string]string),
	}, nil
}

// TODO(step-4): 스냅샷 저장과 로그 압축(Compaction)
// Snapshot: s.mu.Lock() 획득.
//   1. s.data를 JSON 직렬화(MarshalIndent)하여 snapshot.json.tmp 파일에 기록.
//   2. os.Rename으로 snapshot.json으로 원자적 교체.
//   3. s.walFile을 닫고 os.O_TRUNC 모드로 다시 열어 파일 크기를 0으로 초기화.
func (s *KVStore) Snapshot() error {
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
