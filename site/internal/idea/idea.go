package idea

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type Idea struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Category    string `json:"category"`
	Description string `json:"description"`
	Author      string `json:"author"`
	CreatedAt   string `json:"createdAt"`
	Votes       int    `json:"votes"`
}

type Store struct {
	mu       sync.RWMutex
	filePath string
	ideas    []Idea
}

// Open은 data/ideas.json 파일을 열거나 없으면 초기화하여 Store를 반환한다.
func Open(filePath string) (*Store, error) {
	s := &Store{
		filePath: filePath,
		ideas:    []Idea{},
	}

	if err := os.MkdirAll(filepath.Dir(filePath), 0o755); err != nil {
		return nil, fmt.Errorf("디렉터리 생성 실패: %w", err)
	}

	data, err := os.ReadFile(filePath)
	if errors.Is(err, os.ErrNotExist) {
		// 초기 기본 아이디어 추가
		s.ideas = []Idea{
			{
				ID:          "idea-default-1",
				Title:       "C++20 및 C# 언어 코스 추가",
				Category:    "신규 언어",
				Description: "현재 6개 언어에 이어 현대 C++20 모듈과 C# .NET 코어가 추가되면 더 폭넓은 시스템 및 엔터프라이즈 프로그래밍 학습이 가능할 것 같습니다.",
				Author:      "pro-study 러너",
				CreatedAt:   time.Now().Format("2006-01-02 15:04"),
				Votes:       5,
			},
			{
				ID:          "idea-default-2",
				Title:       "웹 필사 시 타이핑 타자 속도(WPM) 및 오타율 분석기",
				Category:    "기능 개선",
				Description: "Tour of Go 필사 시 타자 속도(WPM)와 오타 발생 지점을 분석해주는 대시보드 통계 기능 제안합니다.",
				Author:      "타이핑 마스터",
				CreatedAt:   time.Now().Format("2006-01-02 15:04"),
				Votes:       8,
			},
		}
		_ = s.saveLocked()
		return s, nil
	} else if err != nil {
		return nil, fmt.Errorf("ideas.json 읽기 실패: %w", err)
	}

	if len(data) > 0 {
		if err := json.Unmarshal(data, &s.ideas); err != nil {
			return nil, fmt.Errorf("ideas.json 파싱 실패: %w", err)
		}
	}

	return s, nil
}

func (s *Store) List() []Idea {
	s.mu.RLock()
	defer s.mu.RUnlock()
	res := make([]Idea, len(s.ideas))
	copy(res, s.ideas)
	return res
}

func (s *Store) Add(title, category, description, author string) (Idea, error) {
	if title == "" {
		return Idea{}, errors.New("아이디어 제목은 필수입니다")
	}
	if category == "" {
		category = "기타"
	}
	if author == "" {
		author = "익명 러너"
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	item := Idea{
		ID:          fmt.Sprintf("idea-%d", time.Now().UnixNano()),
		Title:       title,
		Category:    category,
		Description: description,
		Author:      author,
		CreatedAt:   time.Now().Format("2006-01-02 15:04"),
		Votes:       1,
	}

	// 최신 글이 위로 오도록 prepend
	s.ideas = append([]Idea{item}, s.ideas...)
	if err := s.saveLocked(); err != nil {
		return Idea{}, err
	}
	return item, nil
}

func (s *Store) Vote(id string) (int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.ideas {
		if s.ideas[i].ID == id {
			s.ideas[i].Votes++
			votes := s.ideas[i].Votes
			if err := s.saveLocked(); err != nil {
				return 0, err
			}
			return votes, nil
		}
	}
	return 0, fmt.Errorf("아이디어를 찾을 수 없습니다: %s", id)
}

func (s *Store) saveLocked() error {
	data, err := json.MarshalIndent(s.ideas, "", "  ")
	if err != nil {
		return err
	}
	tmp := s.filePath + ".tmp"
	if err := os.WriteFile(tmp, data, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, s.filePath)
}
