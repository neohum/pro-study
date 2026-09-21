package reference

import (
	"path/filepath"
	"testing"
)

func TestLoadReferences(t *testing.T) {
	// pro-study 루트 찾기
	root, err := filepath.Abs("../../..")
	if err != nil {
		t.Fatal(err)
	}

	store, err := Load(root)
	if err != nil {
		t.Fatalf("Load 실패: %v", err)
	}

	if len(store.List()) != 6 {
		t.Fatalf("6개 언어가 로드되어야 하나 %d개 로드됨", len(store.List()))
	}

	for _, lang := range TargetLangs {
		doc, ok := store.Get(lang)
		if !ok || doc == nil {
			t.Fatalf("언어 %s 레퍼런스 누락", lang)
		}
		if len(doc.Grammar) < 6 {
			t.Errorf("언어 %s 문법 항목이 6개 미만: %d", lang, len(doc.Grammar))
		}
		if len(doc.Functions) < 20 {
			t.Errorf("언어 %s 함수 항목이 20개 미만: %d", lang, len(doc.Functions))
		}
	}
}
