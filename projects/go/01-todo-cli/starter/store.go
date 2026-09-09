// 01-todo-cli — JSON 저장 TODO CLI (starter)
//
// store.go: 데이터 모델과 저장/불러오기.
package main

import (
	"errors"
	"io"
	"time"
)

var (
	ErrNotFound  = errors.New("not found")
	ErrEmptyText = errors.New("empty text")
)

type Item struct {
	ID        int       `json:"id"`
	Text      string    `json:"text"`
	Done      bool      `json:"done"`
	CreatedAt time.Time `json:"created_at"`
}

type Store struct {
	Items  []Item `json:"items"`
	NextID int    `json:"next_id"`
}

func NewStore() *Store {
	return &Store{NextID: 1}
}

// TODO(step-1): Add — 텍스트 앞뒤 공백을 제거하고(TrimSpace), 비었으면 ErrEmptyText 반환.
// 새 Item(ID: s.NextID, Text: text, Done: false, CreatedAt: time.Now())을 생성해
// s.Items에 append하고 s.NextID를 1 증가시킨 뒤 반환한다.
func (s *Store) Add(text string) (Item, error) {
	_ = text
	return Item{}, nil
}

// TODO(step-2): Load / Save — JSON 직렬화와 역직렬화.
// Load: 파일이 없으면 NewStore() 반환(fs.ErrNotExist). 있으면 Unmarshal 후 NextID 보정.
// Save: MarshalIndent 후 .tmp 임시 파일에 쓰고 os.Rename으로 원자적 교체.
func Load(path string) (*Store, error) {
	_ = path
	return NewStore(), nil
}

func (s *Store) Save(path string) error {
	_ = path
	return nil
}

// TODO(step-3): Find / Done / Undone / Remove / Clear
// Find: ID로 항목을 찾아 *Item 포인터 반환. 없으면 %w로 ErrNotFound 감싼 에러 반환.
// Done / Undone: it.Done = true / false 설정.
// Remove: slices.IndexFunc / slices.Delete로 삭제. 없으면 ErrNotFound.
// Clear: s.Items = nil
func (s *Store) Find(id int) (*Item, error) {
	_ = id
	return nil, ErrNotFound
}

func (s *Store) Done(id int) error {
	_ = id
	return nil
}

func (s *Store) Undone(id int) error {
	_ = id
	return nil
}

func (s *Store) Remove(id int) error {
	_ = id
	return nil
}

func (s *Store) Clear() {
}

// TODO(step-4): List / formatItem
// List: 항목이 없으면 "(비어 있음)" 출력. 있으면 각 항목을 formatItem으로 포맷팅해 출력.
// formatItem: "%-3d[%s] %s" 형식 (Done이면 "x", 아니면 " ")
func (s *Store) List(w io.Writer) {
	_ = w
}

func formatItem(it Item) string {
	_ = it
	return ""
}
