package idea

import (
	"path/filepath"
	"testing"
)

func TestIdeaStore(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "ideas.json")

	store, err := Open(path)
	if err != nil {
		t.Fatalf("Open 실패: %v", err)
	}

	initial := store.List()
	if len(initial) == 0 {
		t.Fatal("기본 초기 아이디어가 생성되어야 함")
	}

	created, err := store.Add("코틀린 프로젝트 추가", "신규 언어", "Jetpack Compose와 코루틴 프로젝트를 추가해주세요", "Gopher")
	if err != nil {
		t.Fatalf("Add 실패: %v", err)
	}

	if created.Title != "코틀린 프로젝트 추가" {
		t.Errorf("제목 불일치: %s", created.Title)
	}

	votes, err := store.Vote(created.ID)
	if err != nil {
		t.Fatalf("Vote 실패: %v", err)
	}
	if votes != 2 {
		t.Errorf("초기 1표 + 1표 = 2표여야 하나 %d", votes)
	}

	// 다시 열었을 때 데이터 영속성 확인
	store2, err := Open(path)
	if err != nil {
		t.Fatalf("재오픈 실패: %v", err)
	}
	list2 := store2.List()
	if len(list2) != len(initial)+1 {
		t.Errorf("아이디어 개수가 %d개여야 하나 %d개", len(initial)+1, len(list2))
	}
}
