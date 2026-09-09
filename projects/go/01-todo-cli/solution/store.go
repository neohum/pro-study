// 01-todo-cli — JSON 저장 TODO CLI (solution)
//
// store.go: 데이터 모델과 저장/불러오기. 화면 출력이나 플래그는 main.go가 맡는다.
// "데이터를 다루는 코드"와 "사용자와 대화하는 코드"를 파일로 나누면
// 테스트가 쉬워지고, 나중에 웹 서버나 GUI를 붙일 때도 이 파일은 그대로 쓴다.
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"slices"
	"strings"
	"time"
)

// 센티널 에러(sentinel error): 패키지 수준 변수로 만든 "이름 있는 에러 값".
// 호출자는 문자열을 비교하지 않고 errors.Is(err, ErrNotFound)로 종류를 판별한다.
var (
	ErrNotFound  = errors.New("not found")
	ErrEmptyText = errors.New("empty text")
)

// Item은 할 일 하나다.
// 백틱 안의 `json:"..."`은 구조체 태그다. encoding/json이 필드 이름 대신 이 이름을 쓴다.
// 필드는 대문자로 시작해야(exported) json 패키지가 볼 수 있다 — 소문자 필드는 저장되지 않는다.
type Item struct {
	ID        int       `json:"id"`
	Text      string    `json:"text"`
	Done      bool      `json:"done"`
	CreatedAt time.Time `json:"created_at"`
}

// Store는 전체 목록과 다음에 줄 ID다.
// ID는 한 번 쓰면 다시 쓰지 않는다. 삭제 후 len(Items)+1을 쓰면
// "3번 지웠더니 4번이 3번이 됐다"는 혼란이 생기므로 NextID를 따로 저장한다.
type Store struct {
	Items  []Item `json:"items"`
	NextID int    `json:"next_id"`
}

// NewStore는 빈 저장소를 만든다. ID는 1부터 시작한다.
func NewStore() *Store {
	return &Store{NextID: 1}
}

// ---- Step 1: Add ----

// Add는 항목을 추가하고 추가된 항목을 돌려준다.
// 포인터 리시버(*Store)인 이유: Items와 NextID를 바꿔야 한다.
// 값 리시버(s Store)였다면 복사본을 고치고 버리는 셈이라 호출자에게 아무 변화가 없다.
func (s *Store) Add(text string) (Item, error) {
	text = strings.TrimSpace(text)
	if text == "" {
		return Item{}, ErrEmptyText
	}
	item := Item{
		ID:        s.NextID,
		Text:      text,
		Done:      false,
		CreatedAt: time.Now(),
	}
	// append는 용량이 모자라면 새 배열을 만들어 옮기고 새 슬라이스 헤더를 돌려준다.
	// 그래서 결과를 반드시 다시 대입해야 한다: s.Items = append(s.Items, ...)
	s.Items = append(s.Items, item)
	s.NextID++
	return item, nil
}

// ---- Step 3: Find / Done / Undone / Remove ----

// Find는 ID로 항목을 찾아 그 항목을 가리키는 포인터를 돌려준다.
// 포인터를 돌려주는 이유: 호출자가 *it.Done = true처럼 원본을 바로 고칠 수 있게 하려고.
// 복사본(Item)을 돌려주면 고쳐도 슬라이스 안의 원본은 그대로다.
func (s *Store) Find(id int) (*Item, error) {
	for i := range s.Items {
		if s.Items[i].ID == id {
			return &s.Items[i], nil // 슬라이스 원소의 주소
		}
	}
	// %w로 감싸면 메시지는 "id 7 not found"가 되고, errors.Is(err, ErrNotFound)도 참이다.
	return nil, fmt.Errorf("id %d %w", id, ErrNotFound)
}

// Done은 항목을 완료로 표시한다.
func (s *Store) Done(id int) error {
	it, err := s.Find(id)
	if err != nil {
		return err
	}
	it.Done = true
	return nil
}

// Undone은 완료 표시를 지운다.
func (s *Store) Undone(id int) error {
	it, err := s.Find(id)
	if err != nil {
		return err
	}
	it.Done = false
	return nil
}

// Remove는 항목을 지운다.
func (s *Store) Remove(id int) error {
	i := slices.IndexFunc(s.Items, func(it Item) bool { return it.ID == id })
	if i < 0 {
		return fmt.Errorf("id %d %w", id, ErrNotFound)
	}
	// slices.Delete는 [i, i+1) 구간을 지우고 뒤 원소를 앞으로 당긴다.
	// append(s.Items[:i], s.Items[i+1:]...)와 같지만 읽기 쉽고, 비워진 꼬리를 0값으로 정리한다.
	s.Items = slices.Delete(s.Items, i, i+1)
	return nil
}

// Clear는 모든 항목을 지운다. NextID는 유지한다 — ID는 재사용하지 않는다.
func (s *Store) Clear() {
	s.Items = nil
}

// ---- Step 4: List ----

// List는 목록을 한 줄에 하나씩 쓴다. os.Stdout 대신 io.Writer를 받으므로
// 테스트에서는 bytes.Buffer를 넘겨 출력을 문자열로 검사할 수 있다.
func (s *Store) List(w io.Writer) {
	if len(s.Items) == 0 {
		fmt.Fprintln(w, "(비어 있음)")
		return
	}
	for _, it := range s.Items {
		fmt.Fprintln(w, formatItem(it))
	}
}

// formatItem은 "1  [ ] 우유 사기" 꼴의 한 줄을 만든다.
// %-3d: 왼쪽 정렬, 최소 3칸. ID가 두 자리가 되어도 체크박스 열이 흔들리지 않는다.
func formatItem(it Item) string {
	mark := " "
	if it.Done {
		mark = "x"
	}
	return fmt.Sprintf("%-3d[%s] %s", it.ID, mark, it.Text)
}

// ---- Step 2: Load / Save ----

// Load는 JSON 파일을 읽어 Store를 만든다. 파일이 없으면 빈 저장소다 —
// 처음 실행할 때 "todo.json이 없습니다"라고 실패하면 곤란하기 때문이다.
func Load(path string) (*Store, error) {
	data, err := os.ReadFile(path)
	if errors.Is(err, fs.ErrNotExist) {
		return NewStore(), nil
	}
	if err != nil {
		return nil, fmt.Errorf("load %s: %w", path, err)
	}
	s := NewStore()
	if err := json.Unmarshal(data, s); err != nil {
		return nil, fmt.Errorf("load %s: %w", path, err)
	}
	if s.NextID < 1 { // 손으로 고친 파일 등 next_id가 빠진 경우를 방어한다
		s.NextID = 1
		for _, it := range s.Items {
			s.NextID = max(s.NextID, it.ID+1)
		}
	}
	return s, nil
}

// Save는 Store를 들여쓰기된 JSON으로 저장한다.
//
// 원자적 저장: 바로 path에 쓰다가 도중에 죽으면 반쯤 쓰인 파일이 남는다.
// 그래서 임시 파일에 다 쓴 뒤 os.Rename으로 바꿔치기한다. 이름 바꾸기는
// 운영체제가 한 번에 처리하므로 "옛 파일" 아니면 "새 파일"만 존재한다.
// Windows 10 이후의 os.Rename은 기존 파일을 덮어쓰지만, 다른 프로그램이
// path를 열어 두고 있으면 실패할 수 있다.
func (s *Store) Save(path string) error {
	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return fmt.Errorf("save %s: %w", path, err)
	}
	data = append(data, '\n')
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, data, 0o644); err != nil {
		return fmt.Errorf("save %s: %w", path, err)
	}
	if err := os.Rename(tmp, path); err != nil {
		os.Remove(tmp) // 실패했으면 임시 파일을 치운다. 이 에러는 무시해도 된다.
		return fmt.Errorf("save %s: %w", path, err)
	}
	return nil
}
