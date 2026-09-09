package main

import (
	"errors"
	"sync"
	"time"
)

var (
	ErrNotFound   = errors.New("memo not found")
	ErrEmptyTitle = errors.New("title is required")
)

type Memo struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Store struct {
	mu     sync.RWMutex
	memos  map[int]Memo
	nextID int
}

func NewStore() *Store {
	return &Store{
		memos:  make(map[int]Memo),
		nextID: 1,
	}
}

// TODO(step-1): Memo 모델과 Store CRUD 구현
// Create: strings.TrimSpace(title)가 비었으면 ErrEmptyTitle 반환.
//   s.mu.Lock()으로 보호하고 ID 발급 후 s.memos에 저장.
// Get: s.mu.RLock()으로 조회.
// List: s.mu.RLock()으로 모든 메모를 ID 오름차순 슬라이스로 반환. (비어있으면 빈 슬라이스 반환)
// Update: s.mu.Lock()으로 해당 ID 메모 수정. 없으면 ErrNotFound 반환.
// Delete: s.mu.Lock()으로 삭제 성공 시 true, 없으면 false 반환.
func (s *Store) Create(title, content string) (Memo, error) {
	_ = title
	_ = content
	return Memo{}, nil
}

func (s *Store) Get(id int) (Memo, bool) {
	_ = id
	return Memo{}, false
}

func (s *Store) List() []Memo {
	return []Memo{}
}

func (s *Store) Update(id int, title, content string) (Memo, error) {
	_ = id
	_ = title
	_ = content
	return Memo{}, nil
}

func (s *Store) Delete(id int) bool {
	_ = id
	return false
}
