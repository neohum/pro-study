package opener

import (
	"errors"
	"runtime"
	"strings"
	"testing"
)

func TestFileURL(t *testing.T) {
	var in, want string
	if runtime.GOOS == "windows" {
		in, want = `D:\works\pro-study\work\c\01-calc\main.c`, "vscode://file/D:/works/pro-study/work/c/01-calc/main.c"
	} else {
		in, want = "/home/u/pro-study/work/c/01-calc/main.c", "vscode://file/home/u/pro-study/work/c/01-calc/main.c"
	}
	if got := FileURL(in); got != want {
		t.Errorf("FileURL = %q, want %q", got, want)
	}
}

func TestOpenFallsBackWhenCLIMissing(t *testing.T) {
	orig := LookPath
	LookPath = func(string) (string, error) { return "", errors.New("not found") }
	t.Cleanup(func() { LookPath = orig })

	res := Open(t.TempDir(), "main.c")
	if res.Opened {
		t.Fatal("CLI가 없는데 Opened=true")
	}
	if !strings.HasPrefix(res.URL, "vscode://file/") {
		t.Errorf("폴백 URL 누락: %+v", res)
	}
	if res.Error == "" {
		t.Errorf("이유가 비어 있음")
	}
}
