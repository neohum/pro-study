package workspace

import (
	"os"
	"path/filepath"
	"testing"

	"pro-study/site/internal/catalog"
)

func fakeProject(t *testing.T, root string) *catalog.Project {
	t.Helper()
	dir := filepath.Join(root, "projects", "c", "01-x")
	for _, f := range []struct{ rel, body string }{
		{"starter/main.c", "int main(void){}"},
		{"starter/build/app.exe", "stale"},
		{".vscode/tasks.json", "{}"},
		{"tests/cases/01.in", "1"},
		{"tests/main_test.go", "package main"},
	} {
		p := filepath.Join(dir, filepath.FromSlash(f.rel))
		os.MkdirAll(filepath.Dir(p), 0o755)
		os.WriteFile(p, []byte(f.body), 0o644)
	}
	return &catalog.Project{ID: "c/01-x", Lang: "c", Slug: "01-x", Dir: dir, Entry: "main.c"}
}

func TestEnsureCopiesOnceAndKeepsEdits(t *testing.T) {
	root := t.TempDir()
	p := fakeProject(t, root)
	dir, created, err := Ensure(root, p)
	if err != nil || !created {
		t.Fatalf("Ensure = %q %v %v", dir, created, err)
	}
	if dir != filepath.Join(root, "work", "c", "01-x") {
		t.Errorf("dir = %q", dir)
	}
	if _, err := os.Stat(filepath.Join(dir, ".vscode", "tasks.json")); err != nil {
		t.Errorf(".vscode 복사 안 됨: %v", err)
	}
	if _, err := os.Stat(filepath.Join(dir, "build", "app.exe")); err == nil {
		t.Errorf("starter의 build/ 산출물이 복사되면 안 된다")
	}
	edited := filepath.Join(dir, "main.c")
	os.WriteFile(edited, []byte("edited"), 0o644)
	_, created, err = Ensure(root, p)
	if err != nil || created {
		t.Fatalf("두 번째 Ensure = created=%v err=%v", created, err)
	}
	if b, _ := os.ReadFile(edited); string(b) != "edited" {
		t.Errorf("학습자 편집이 덮어써짐: %q", b)
	}
	if EntryPath(p, dir) != edited {
		t.Errorf("EntryPath = %q", EntryPath(p, dir))
	}
}

func TestResetRestoresStarter(t *testing.T) {
	root := t.TempDir()
	p := fakeProject(t, root)
	dir, _, _ := Ensure(root, p)
	os.WriteFile(filepath.Join(dir, "main.c"), []byte("edited"), 0o644)
	os.WriteFile(filepath.Join(dir, "extra.c"), []byte("x"), 0o644)
	if _, err := Reset(root, p); err != nil {
		t.Fatal(err)
	}
	if b, _ := os.ReadFile(filepath.Join(dir, "main.c")); string(b) != "int main(void){}" {
		t.Errorf("main.c 복원 안 됨: %q", b)
	}
	if _, err := os.Stat(filepath.Join(dir, "extra.c")); err == nil {
		t.Errorf("추가 파일이 남아 있음")
	}
}

func TestSyncTestsOverwrites(t *testing.T) {
	root := t.TempDir()
	p := fakeProject(t, root)
	dir, _, _ := Ensure(root, p)
	os.WriteFile(filepath.Join(dir, "main_test.go"), []byte("tampered"), 0o644)
	if err := SyncTests(p, dir); err != nil {
		t.Fatal(err)
	}
	if b, _ := os.ReadFile(filepath.Join(dir, "main_test.go")); string(b) != "package main" {
		t.Errorf("테스트 파일이 원본으로 돌아오지 않음: %q", b)
	}
	if b, _ := os.ReadFile(filepath.Join(dir, "cases", "01.in")); string(b) != "1" {
		t.Errorf("하위 디렉터리 동기화 실패: %q", b)
	}
}

func TestEnsureWithoutStarterFails(t *testing.T) {
	root := t.TempDir()
	p := &catalog.Project{Lang: "c", Slug: "none", Dir: filepath.Join(root, "projects", "c", "none")}
	if _, _, err := Ensure(root, p); err == nil {
		t.Fatal("starter가 없으면 실패해야 한다")
	}
}
