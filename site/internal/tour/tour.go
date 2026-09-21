package tour

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

type LessonMeta struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	TitleKo string `json:"titleKo"`
}

type Chapter struct {
	ID      string       `json:"id"`
	Title   string       `json:"title"`
	Lessons []LessonMeta `json:"lessons"`
}

type Manifest struct {
	CourseID      string    `json:"courseId"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	TotalChapters int       `json:"totalChapters"`
	TotalLessons  int       `json:"totalLessons"`
	Chapters      []Chapter `json:"chapters"`
}

type Lesson struct {
	ID           string   `json:"id"`
	Chapter      string   `json:"chapter"`
	ChapterTitle string   `json:"chapterTitle"`
	Order        int      `json:"order"`
	Title        string   `json:"title"`
	TitleKo      string   `json:"titleKo"`
	SummaryKo    string   `json:"summaryKo"`
	Code         string   `json:"code"`
	Entry        string   `json:"entry"`
	Concepts     []string `json:"concepts"`
}

type Store struct {
	mu       sync.RWMutex
	manifest *Manifest
	lessons  map[string]*Lesson
	ordered  []*Lesson
}

// Load는 courses/tour-go 디렉터리에서 manifest와 lessons를 읽어 적재한다.
func Load(rootDir string) (*Store, error) {
	tourDir := filepath.Join(rootDir, "courses", "tour-go")
	manifestPath := filepath.Join(tourDir, "manifest.json")
	mData, err := os.ReadFile(manifestPath)
	if err != nil {
		return nil, fmt.Errorf("tour manifest 읽기 실패: %w", err)
	}

	var manifest Manifest
	if err := json.Unmarshal(mData, &manifest); err != nil {
		return nil, fmt.Errorf("tour manifest 파싱 실패: %w", err)
	}

	lessonsPath := filepath.Join(tourDir, "lessons.json")
	lData, err := os.ReadFile(lessonsPath)
	if err != nil {
		return nil, fmt.Errorf("tour lessons 읽기 실패: %w", err)
	}

	var rawLessons []*Lesson
	if err := json.Unmarshal(lData, &rawLessons); err != nil {
		return nil, fmt.Errorf("tour lessons 파싱 실패: %w", err)
	}

	lessonMap := make(map[string]*Lesson)
	for _, l := range rawLessons {
		lessonMap[l.ID] = l
	}

	return &Store{
		manifest: &manifest,
		lessons:  lessonMap,
		ordered:  rawLessons,
	}, nil
}

func (s *Store) Manifest() *Manifest {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.manifest
}

func (s *Store) GetLesson(id string) (*Lesson, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	l, ok := s.lessons[id]
	return l, ok
}

func (s *Store) AllLessons() []*Lesson {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return append([]*Lesson(nil), s.ordered...)
}
