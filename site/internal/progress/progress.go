// Package progress는 data/progress.json에 프로젝트별 학습 상태를 저장한다.
package progress

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// 상태 값. 홈 카드 뱃지와 1:1이다.
const (
	NotStarted = "not-started"
	InProgress = "in-progress"
	Passed     = "passed"
)

// Entry는 프로젝트 하나의 상태다.
type Entry struct {
	Status    string    `json:"status"`
	Passed    int       `json:"passed"`
	Total     int       `json:"total"`
	LastStage string    `json:"lastStage,omitempty"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Store는 파일 기반 저장소다. 쓰기는 임시 파일 + rename으로 원자적이다.
type Store struct {
	path string
	mu   sync.Mutex
	data map[string]Entry
}

// Open은 path를 읽어 Store를 만든다. 파일이 없으면 빈 상태로 시작한다.
func Open(path string) (*Store, error) {
	s := &Store{path: path, data: map[string]Entry{}}
	raw, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return s, nil
		}
		return nil, err
	}
	if len(raw) == 0 {
		return s, nil
	}
	if err := json.Unmarshal(raw, &s.data); err != nil {
		return nil, err
	}
	return s, nil
}

// Get은 항목을 돌려준다. 없으면 NotStarted.
func (s *Store) Get(id string) Entry {
	s.mu.Lock()
	defer s.mu.Unlock()
	if e, ok := s.data[id]; ok {
		return e
	}
	return Entry{Status: NotStarted}
}

// All은 전체 복사본을 돌려준다.
func (s *Store) All() map[string]Entry {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make(map[string]Entry, len(s.data))
	for k, v := range s.data {
		out[k] = v
	}
	return out
}

// Set은 항목을 갱신하고 디스크에 쓴다.
func (s *Store) Set(id string, e Entry) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	e.UpdatedAt = time.Now()
	s.data[id] = e
	return s.flush()
}

// Touch는 아직 시작 전인 프로젝트를 진행 중으로 바꾼다. 이미 통과했으면 그대로 둔다.
func (s *Store) Touch(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if e, ok := s.data[id]; ok && e.Status != NotStarted {
		return nil
	}
	s.data[id] = Entry{Status: InProgress, UpdatedAt: time.Now()}
	return s.flush()
}

// Record는 실행 결과를 반영한다. test 단계를 전부 통과했을 때만 Passed가 된다.
func (s *Store) Record(id, stage string, ok bool, passed, total int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	e := s.data[id]
	e.LastStage = stage
	e.UpdatedAt = time.Now()
	if stage == "test" {
		e.Passed, e.Total = passed, total
		if ok {
			e.Status = Passed
		} else if e.Status != Passed {
			e.Status = InProgress
		}
	} else if e.Status == "" || e.Status == NotStarted {
		e.Status = InProgress
	}
	s.data[id] = e
	return s.flush()
}

func (s *Store) flush() error {
	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return err
	}
	raw, err := json.MarshalIndent(s.data, "", "  ")
	if err != nil {
		return err
	}
	tmp := s.path + ".tmp"
	if err := os.WriteFile(tmp, raw, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, s.path)
}

// Summary는 언어별 통과 수 계산에 쓰는 집계다.
type Summary struct {
	Passed, InProgress, Total int
}

// Summarize는 주어진 id 목록의 집계를 돌려준다.
func (s *Store) Summarize(ids []string) Summary {
	s.mu.Lock()
	defer s.mu.Unlock()
	sum := Summary{Total: len(ids)}
	for _, id := range ids {
		switch s.data[id].Status {
		case Passed:
			sum.Passed++
		case InProgress:
			sum.InProgress++
		}
	}
	return sum
}
