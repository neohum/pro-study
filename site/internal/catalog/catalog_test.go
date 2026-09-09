package catalog

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const validJSON = `{
  "id": "c/01-calc", "title": "계산기", "lang": "c", "order": 1, "difficulty": 1,
  "concepts": ["파서"], "entry": "main.c",
  "build": ["gcc", "-std=c23", "-o", "build/app.exe", "main.c"],
  "run": ["build/app.exe"],
  "test": {"kind": "stdio-cases"}
}`

func writeProject(t *testing.T, root, lang, slug, body string) {
	t.Helper()
	dir := filepath.Join(root, "projects", lang, slug)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "project.json"), []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
}

func TestLoadValid(t *testing.T) {
	root := t.TempDir()
	writeProject(t, root, "c", "01-calc", validJSON)
	writeProject(t, root, "c", "_template", validJSON) // 밑줄 폴더는 무시
	c, problems, err := Load(root)
	if err != nil {
		t.Fatal(err)
	}
	if len(problems) != 0 {
		t.Fatalf("problems = %v", problems)
	}
	p, ok := c.Get("c", "01-calc")
	if !ok {
		t.Fatal("c/01-calc not found")
	}
	if p.Test.Dir != "tests/cases" {
		t.Errorf("stdio-cases 기본 dir이 채워지지 않음: %q", p.Test.Dir)
	}
	if p.Dir != filepath.Join(root, "projects", "c", "01-calc") {
		t.Errorf("Dir = %q", p.Dir)
	}
	if got := len(c.All()); got != 1 {
		t.Errorf("All() = %d개, want 1", got)
	}
	if p.Stars() != "★☆☆☆☆" {
		t.Errorf("Stars = %q", p.Stars())
	}
}

func TestLoadRejectsInvalid(t *testing.T) {
	cases := map[string]struct {
		body string
		want string
	}{
		"missing fields": {`{"id":"c/x","lang":"c","order":1,"difficulty":1}`, "필수 필드 누락"},
		"wrong id":       {strings.Replace(validJSON, `"c/01-calc"`, `"c/other"`, 1), "id는"},
		"bad kind":       {strings.Replace(validJSON, `"stdio-cases"`, `"pytest"`, 1), "test.kind"},
		"bad json":       {`{not json`, "JSON 파싱"},
		"unknown field":  {strings.Replace(validJSON, `"order": 1`, `"order": 1, "bogus": true`, 1), "JSON 파싱"},
	}
	for name, tc := range cases {
		t.Run(name, func(t *testing.T) {
			root := t.TempDir()
			slug := "01-calc"
			if name == "missing fields" {
				slug = "x"
			}
			writeProject(t, root, "c", slug, tc.body)
			c, problems, err := Load(root)
			if err != nil {
				t.Fatal(err)
			}
			if len(problems) != 1 || !strings.Contains(problems[0].Err.Error(), tc.want) {
				t.Fatalf("problems = %v, want containing %q", problems, tc.want)
			}
			if len(c.All()) != 0 {
				t.Errorf("잘못된 프로젝트가 목록에 남아 있음")
			}
		})
	}
}

func TestLoadOrderAndNeighbors(t *testing.T) {
	root := t.TempDir()
	mk := func(slug string, order int) string {
		s := strings.Replace(validJSON, `"c/01-calc"`, `"c/`+slug+`"`, 1)
		return strings.Replace(s, `"order": 1`, `"order": `+string(rune('0'+order)), 1)
	}
	writeProject(t, root, "c", "02-b", mk("02-b", 2))
	writeProject(t, root, "c", "01-a", mk("01-a", 1))
	writeProject(t, root, "c", "03-c", mk("03-c", 3))
	c, _, err := Load(root)
	if err != nil {
		t.Fatal(err)
	}
	all := c.All()
	if all[0].Slug != "01-a" || all[1].Slug != "02-b" || all[2].Slug != "03-c" {
		t.Fatalf("정렬 순서가 틀림: %v", []string{all[0].Slug, all[1].Slug, all[2].Slug})
	}
	prev, next := c.Neighbors(all[1])
	if prev.Slug != "01-a" || next.Slug != "03-c" {
		t.Errorf("Neighbors = %v %v", prev, next)
	}
}

func TestSafeJoin(t *testing.T) {
	base := t.TempDir()
	for _, rel := range []string{"../x", "..", "a/../../b", "/abs", "C:/x"} {
		if _, err := SafeJoin(base, rel); err == nil {
			t.Errorf("SafeJoin(%q) should fail", rel)
		}
	}
	if _, err := SafeJoin(base, "a/b.c"); err != nil {
		t.Errorf("SafeJoin(a/b.c) = %v", err)
	}
}

func TestTreeAndReadFile(t *testing.T) {
	base := t.TempDir()
	os.MkdirAll(filepath.Join(base, "src"), 0o755)
	os.MkdirAll(filepath.Join(base, "build"), 0o755)
	os.WriteFile(filepath.Join(base, "src", "b.c"), []byte("b"), 0o644)
	os.WriteFile(filepath.Join(base, "a.c"), []byte("a"), 0o644)
	os.WriteFile(filepath.Join(base, "build", "app.exe"), []byte("x"), 0o644)
	nodes, err := Tree(base)
	if err != nil {
		t.Fatal(err)
	}
	if len(nodes) != 2 || !nodes[0].IsDir || nodes[0].Name != "src" || nodes[1].Name != "a.c" {
		t.Fatalf("Tree = %+v", nodes)
	}
	if nodes[0].Children[0].Path != "src/b.c" {
		t.Errorf("child path = %q", nodes[0].Children[0].Path)
	}
	if b, err := ReadFile(base, "src/b.c"); err != nil || string(b) != "b" {
		t.Errorf("ReadFile = %q, %v", b, err)
	}
	if _, err := ReadFile(base, "../etc"); err != ErrOutside {
		t.Errorf("ReadFile(../etc) err = %v", err)
	}
	if _, err := ReadFile(base, "src"); err == nil {
		t.Errorf("ReadFile(dir) should fail")
	}
}
