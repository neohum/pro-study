// Package catalog는 projects/<lang>/<slug>/project.json을 읽어 프로젝트 목록을 만든다.
//
// 카탈로그는 사이트의 유일한 콘텐츠 원천이다. 잘못된 project.json은 사이트 전체를
// 죽이지 않고 Problem으로 보고된 뒤 목록에서 빠진다 — 프로젝트 하나를 고치는 동안에도
// 나머지 19개는 열려 있어야 하기 때문이다.
package catalog

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// 지원 언어와 화면 표시 이름. 순서가 홈 화면 탭 순서다.
var langs = []struct{ Key, Name string }{
	{"c", "C23"},
	{"go", "Go"},
}

var testKinds = map[string]bool{
	"stdio-cases": true, // tests/cases/NN.in → stdout 비교
	"go-test":     true, // go vet + go test -json
	"script":      true, // tests/run.ps1 <workDir>
}

// TestSpec은 project.json의 "test" 항목이다.
type TestSpec struct {
	Kind   string   `json:"kind"`
	Dir    string   `json:"dir,omitempty"`    // stdio-cases: 케이스 디렉터리 (기본 tests/cases)
	Args   []string `json:"args,omitempty"`   // go-test: 추가 인자 (예: -race)
	Script string   `json:"script,omitempty"` // script: 실행할 스크립트 (기본 tests/run.ps1)
}

// Project는 프로젝트 하나의 메타데이터다. Dir은 project.json이 있는 절대 경로.
type Project struct {
	ID         string   `json:"id"`
	Title      string   `json:"title"`
	Summary    string   `json:"summary"`
	Lang       string   `json:"lang"`
	Order      int      `json:"order"`
	Difficulty int      `json:"difficulty"`
	Concepts   []string `json:"concepts"`
	Entry      string   `json:"entry"`
	Build      []string `json:"build"`
	Run        []string `json:"run"`
	RunArgs    []string `json:"runArgs,omitempty"`
	Test       TestSpec `json:"test"`

	Slug string `json:"-"`
	Dir  string `json:"-"`
}

// LangName은 언어 키의 표시 이름을 돌려준다.
func LangName(key string) string {
	for _, l := range langs {
		if l.Key == key {
			return l.Name
		}
	}
	return key
}

// Lang은 언어별 프로젝트 묶음이다.
type Lang struct {
	Key      string
	Name     string
	Projects []*Project
}

// Problem은 목록에서 제외된 project.json과 그 이유다.
type Problem struct {
	Path string
	Err  error
}

func (p Problem) String() string { return p.Path + ": " + p.Err.Error() }

// Catalog는 로드된 전체 프로젝트다.
type Catalog struct {
	Root  string // 저장소 루트 (projects/의 부모)
	Langs []Lang
	byID  map[string]*Project
}

// Load는 root/projects 아래를 읽는다. 하드 에러(projects/ 없음)만 error로 돌려주고
// 개별 project.json의 문제는 Problem 목록으로 돌려준다.
func Load(root string) (*Catalog, []Problem, error) {
	base := filepath.Join(root, "projects")
	if st, err := os.Stat(base); err != nil || !st.IsDir() {
		return nil, nil, fmt.Errorf("projects 디렉터리가 없습니다: %s", base)
	}
	c := &Catalog{Root: root, byID: map[string]*Project{}}
	var problems []Problem
	for _, l := range langs {
		lang := Lang{Key: l.Key, Name: l.Name}
		entries, err := os.ReadDir(filepath.Join(base, l.Key))
		if err != nil {
			if errors.Is(err, os.ErrNotExist) {
				c.Langs = append(c.Langs, lang)
				continue
			}
			return nil, nil, err
		}
		for _, e := range entries {
			if !e.IsDir() || strings.HasPrefix(e.Name(), "_") || strings.HasPrefix(e.Name(), ".") {
				continue
			}
			dir := filepath.Join(base, l.Key, e.Name())
			jsonPath := filepath.Join(dir, "project.json")
			if _, err := os.Stat(jsonPath); err != nil {
				continue // project.json이 없는 폴더는 프로젝트가 아니다
			}
			p, err := loadOne(jsonPath, l.Key, e.Name())
			if err != nil {
				problems = append(problems, Problem{Path: jsonPath, Err: err})
				continue
			}
			p.Dir = dir
			lang.Projects = append(lang.Projects, p)
			c.byID[p.ID] = p
		}
		sort.Slice(lang.Projects, func(i, j int) bool {
			if lang.Projects[i].Order != lang.Projects[j].Order {
				return lang.Projects[i].Order < lang.Projects[j].Order
			}
			return lang.Projects[i].Slug < lang.Projects[j].Slug
		})
		c.Langs = append(c.Langs, lang)
	}
	return c, problems, nil
}

func loadOne(path, lang, slug string) (*Project, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var p Project
	dec := json.NewDecoder(strings.NewReader(string(raw)))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&p); err != nil {
		return nil, fmt.Errorf("JSON 파싱 실패: %w", err)
	}
	p.Slug = slug
	if err := p.validate(lang, slug); err != nil {
		return nil, err
	}
	return &p, nil
}

func (p *Project) validate(lang, slug string) error {
	var missing []string
	if p.Title == "" {
		missing = append(missing, "title")
	}
	if p.Entry == "" {
		missing = append(missing, "entry")
	}
	if len(p.Build) == 0 {
		missing = append(missing, "build")
	}
	if len(p.Run) == 0 {
		missing = append(missing, "run")
	}
	if p.Test.Kind == "" {
		missing = append(missing, "test.kind")
	}
	if len(missing) > 0 {
		return fmt.Errorf("필수 필드 누락: %s", strings.Join(missing, ", "))
	}
	if p.Lang != lang {
		return fmt.Errorf("lang이 %q인데 디렉터리는 %q 아래에 있습니다", p.Lang, lang)
	}
	want := lang + "/" + slug
	if p.ID != want {
		return fmt.Errorf("id는 %q여야 합니다 (현재 %q)", want, p.ID)
	}
	if p.Order <= 0 {
		return errors.New("order는 1 이상이어야 합니다")
	}
	if p.Difficulty < 1 || p.Difficulty > 5 {
		return errors.New("difficulty는 1~5 사이여야 합니다")
	}
	if !testKinds[p.Test.Kind] {
		return fmt.Errorf("알 수 없는 test.kind %q (stdio-cases | go-test | script)", p.Test.Kind)
	}
	if p.Test.Kind == "stdio-cases" && p.Test.Dir == "" {
		p.Test.Dir = "tests/cases"
	}
	if p.Test.Kind == "script" && p.Test.Script == "" {
		p.Test.Script = "tests/run.ps1"
	}
	if strings.Contains(p.Entry, "..") || filepath.IsAbs(p.Entry) {
		return fmt.Errorf("entry는 starter/ 기준 상대 경로여야 합니다: %q", p.Entry)
	}
	return nil
}

// Get은 lang/slug로 프로젝트를 찾는다.
func (c *Catalog) Get(lang, slug string) (*Project, bool) {
	p, ok := c.byID[lang+"/"+slug]
	return p, ok
}

// All은 언어 순서 → order 순서로 전체 프로젝트를 돌려준다.
func (c *Catalog) All() []*Project {
	var out []*Project
	for _, l := range c.Langs {
		out = append(out, l.Projects...)
	}
	return out
}

// Neighbors는 같은 언어 안에서 앞·뒤 프로젝트를 돌려준다(없으면 nil).
func (c *Catalog) Neighbors(p *Project) (prev, next *Project) {
	for _, l := range c.Langs {
		if l.Key != p.Lang {
			continue
		}
		for i, q := range l.Projects {
			if q.ID == p.ID {
				if i > 0 {
					prev = l.Projects[i-1]
				}
				if i+1 < len(l.Projects) {
					next = l.Projects[i+1]
				}
				return
			}
		}
	}
	return
}

// Stars는 난이도를 ★ 문자열로 바꾼다(템플릿용).
func (p *Project) Stars() string {
	return strings.Repeat("★", p.Difficulty) + strings.Repeat("☆", 5-p.Difficulty)
}

// LangName은 프로젝트 언어의 표시 이름이다(템플릿용).
func (p *Project) LangName() string { return LangName(p.Lang) }
