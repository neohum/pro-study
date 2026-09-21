package reference

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

type GrammarItem struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Category string `json:"category"`
	Summary  string `json:"summary"`
	Syntax   string `json:"syntax"`
	Example  string `json:"example"`
}

type FunctionItem struct {
	Name        string `json:"name"`
	Signature   string `json:"signature"`
	Module      string `json:"module"`
	Description string `json:"description"`
	Example     string `json:"example"`
}

type Doc struct {
	Lang      string         `json:"lang"`
	Name      string         `json:"name"`
	Version   string         `json:"version"`
	Overview  string         `json:"overview"`
	Grammar   []GrammarItem  `json:"grammar"`
	Functions []FunctionItem `json:"functions"`
}

type Store struct {
	mu   sync.RWMutex
	docs map[string]*Doc
	list []*Doc
}

var TargetLangs = []string{"c", "go", "rust", "python", "typescript", "javascript"}

// Load는 content/reference 디렉터리에서 모든 언어 레퍼런스 문서를 읽어 메모리에 적재한다.
func Load(rootDir string) (*Store, error) {
	refDir := filepath.Join(rootDir, "content", "reference")
	store := &Store{
		docs: make(map[string]*Doc),
	}

	for _, lang := range TargetLangs {
		filePath := filepath.Join(refDir, lang+".json")
		data, err := os.ReadFile(filePath)
		if err != nil {
			return nil, fmt.Errorf("reference %s 읽기 실패: %w", lang, err)
		}
		var doc Doc
		if err := json.Unmarshal(data, &doc); err != nil {
			return nil, fmt.Errorf("reference %s 파싱 실패: %w", lang, err)
		}
		store.docs[lang] = &doc
		store.list = append(store.list, &doc)
	}

	return store, nil
}

func (s *Store) Get(lang string) (*Doc, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	doc, ok := s.docs[lang]
	return doc, ok
}

func (s *Store) List() []*Doc {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return append([]*Doc(nil), s.list...)
}
