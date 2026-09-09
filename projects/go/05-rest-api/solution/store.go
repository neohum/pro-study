package main

import (
	"errors"
	"strings"
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

func (s *Store) Create(title, content string) (Memo, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		return Memo{}, ErrEmptyTitle
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now().UTC()
	memo := Memo{
		ID:        s.nextID,
		Title:     title,
		Content:   content,
		CreatedAt: now,
		UpdatedAt: now,
	}
	s.memos[memo.ID] = memo
	s.nextID++
	return memo, nil
}

func (s *Store) Get(id int) (Memo, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	m, ok := s.memos[id]
	return m, ok
}

func (s *Store) List() []Memo {
	s.mu.RLock()
	defer s.mu.RUnlock()

	list := make([]Memo, 0, len(s.memos))
	for _, m := range s.memos {
		list = append(list, m)
	}
	for i := 0; i < len(list)-1; i++ {
		for j := i + 1; j < len(list); j++ {
			if list[i].ID > list[j].ID {
				list[i], list[j] = list[j], list[i]
			}
		}
	}
	return list
}

func (s *Store) Update(id int, title, content string) (Memo, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		return Memo{}, ErrEmptyTitle
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	memo, ok := s.memos[id]
	if !ok {
		return Memo{}, ErrNotFound
	}
	memo.Title = title
	memo.Content = content
	memo.UpdatedAt = time.Now().UTC()
	s.memos[id] = memo
	return memo, nil
}

func (s *Store) Delete(id int) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.memos[id]; !ok {
		return false
	}
	delete(s.memos, id)
	return true
}
