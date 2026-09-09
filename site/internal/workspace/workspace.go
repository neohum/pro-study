// Package workspace는 학습자의 작업 폴더 work/<lang>/<slug>를 관리한다.
//
// starter/는 읽기 전용 원본으로 남고, 학습자는 그 복사본(work/)에서 코딩한다.
// 그래서 [초기화]가 언제나 가능하고 저장소 diff에 학습자 코드가 섞이지 않는다.
package workspace

import (
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"pro-study/site/internal/catalog"
)

// Dir은 프로젝트의 작업 폴더 절대 경로다.
func Dir(root string, p *catalog.Project) string {
	return filepath.Join(root, "work", p.Lang, p.Slug)
}

// Exists는 작업 폴더가 이미 만들어졌는지 알려준다.
func Exists(root string, p *catalog.Project) bool {
	st, err := os.Stat(Dir(root, p))
	return err == nil && st.IsDir()
}

// Ensure는 작업 폴더가 없으면 starter/와 .vscode/를 복사해 만든다.
// 이미 있으면 아무것도 덮어쓰지 않는다 — 학습자의 코드가 원본보다 우선한다.
func Ensure(root string, p *catalog.Project) (dir string, created bool, err error) {
	dir = Dir(root, p)
	if Exists(root, p) {
		return dir, false, nil
	}
	starter := filepath.Join(p.Dir, "starter")
	if st, err := os.Stat(starter); err != nil || !st.IsDir() {
		return "", false, fmt.Errorf("starter 폴더가 없습니다: %s", starter)
	}
	if err := os.MkdirAll(filepath.Dir(dir), 0o755); err != nil {
		return "", false, err
	}
	tmp := dir + ".partial"
	os.RemoveAll(tmp)
	if err := copyDir(starter, tmp); err != nil {
		os.RemoveAll(tmp)
		return "", false, err
	}
	if vs := filepath.Join(p.Dir, ".vscode"); dirExists(vs) {
		if err := copyDir(vs, filepath.Join(tmp, ".vscode")); err != nil {
			os.RemoveAll(tmp)
			return "", false, err
		}
	}
	if err := os.Rename(tmp, dir); err != nil {
		os.RemoveAll(tmp)
		return "", false, err
	}
	return dir, true, nil
}

// Reset은 작업 폴더를 지우고 starter 상태로 되돌린다.
func Reset(root string, p *catalog.Project) (string, error) {
	dir := Dir(root, p)
	if err := os.RemoveAll(dir); err != nil {
		return "", err
	}
	dir, _, err := Ensure(root, p)
	return dir, err
}

// SyncTests는 프로젝트의 tests/ 안 파일을 작업 폴더로 복사한다(항상 덮어쓴다).
// Go 테스트는 코드와 같은 패키지 디렉터리에 있어야 하므로 work/ 루트로 복사하고,
// 매 실행 전에 원본으로 되돌려 테스트 변조를 막는다.
func SyncTests(p *catalog.Project, workDir string) error {
	tests := filepath.Join(p.Dir, "tests")
	if !dirExists(tests) {
		return nil
	}
	return filepath.WalkDir(tests, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(tests, path)
		if rel == "." {
			return nil
		}
		dst := filepath.Join(workDir, rel)
		if d.IsDir() {
			return os.MkdirAll(dst, 0o755)
		}
		return copyFile(path, dst)
	})
}

// EntryPath는 VS Code가 처음 열 파일의 절대 경로다.
func EntryPath(p *catalog.Project, workDir string) string {
	return filepath.Join(workDir, filepath.FromSlash(p.Entry))
}

func dirExists(p string) bool {
	st, err := os.Stat(p)
	return err == nil && st.IsDir()
}

func copyDir(src, dst string) error {
	return filepath.WalkDir(src, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(src, path)
		target := filepath.Join(dst, rel)
		if d.IsDir() {
			if strings.EqualFold(d.Name(), "build") && rel != "." {
				return filepath.SkipDir
			}
			return os.MkdirAll(target, 0o755)
		}
		return copyFile(path, target)
	})
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		return err
	}
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	if _, err := io.Copy(out, in); err != nil {
		out.Close()
		return err
	}
	return out.Close()
}

// ErrNoWorkspace는 아직 [열기]를 누르지 않은 프로젝트를 실행하려 할 때 쓴다.
var ErrNoWorkspace = errors.New("작업 폴더가 없습니다. 먼저 [VS Code에서 열기]를 누르세요")
