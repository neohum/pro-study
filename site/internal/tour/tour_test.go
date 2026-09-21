package tour

import (
	"path/filepath"
	"testing"
)

func TestLoadTour(t *testing.T) {
	root, err := filepath.Abs("../../..")
	if err != nil {
		t.Fatal(err)
	}

	store, err := Load(root)
	if err != nil {
		t.Fatalf("Load 실패: %v", err)
	}

	m := store.Manifest()
	if m.TotalChapters != 6 {
		t.Errorf("총 챕터가 6개여야 하나 %d개", m.TotalChapters)
	}
	if m.TotalLessons < 19 {
		t.Errorf("레슨 수가 19개 이상이어야 하나 %d개", m.TotalLessons)
	}

	lesson, ok := store.GetLesson("basics-packages")
	if !ok || lesson == nil {
		t.Fatal("basics-packages 레슨을 찾을 수 없음")
	}

	if len(lesson.Code) == 0 {
		t.Error("레슨 코드가 비어있음")
	}
}
