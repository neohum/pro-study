// Package opener는 작업 폴더를 VS Code로 연다.
//
// 1순위는 `code <dir> -g <file>:1` CLI, CLI가 없으면 브라우저가 대신 열 수 있는
// vscode://file/ URL을 돌려준다. 두 경로 모두 실패해도 URL은 항상 채워진다.
package opener

import (
	"context"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

// Result는 열기 시도의 결과다. Opened가 false면 프런트가 URL을 연다.
type Result struct {
	Opened bool   `json:"opened"`
	URL    string `json:"url"`
	Error  string `json:"error,omitempty"`
}

// LookPath는 테스트에서 바꿔 끼우기 위한 훅이다.
var LookPath = exec.LookPath

// Open은 dir을 VS Code 창으로 열고 entry 파일을 첫 줄에 놓는다.
func Open(dir, entry string) Result {
	res := Result{URL: FileURL(entry)}
	if _, err := LookPath("code"); err != nil {
		res.Error = "code CLI를 PATH에서 찾지 못했습니다"
		return res
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	args := []string{dir, "-g", entry + ":1"}
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		// code는 code.cmd 배치 파일이라 cmd.exe를 거쳐야 한다.
		cmd = exec.CommandContext(ctx, "cmd", append([]string{"/c", "code"}, args...)...)
	} else {
		cmd = exec.CommandContext(ctx, "code", args...)
	}
	if out, err := cmd.CombinedOutput(); err != nil {
		res.Error = strings.TrimSpace(string(out) + " " + err.Error())
		return res
	}
	res.Opened = true
	return res
}

// FileURL은 절대 경로를 vscode://file/ URL로 바꾼다. Windows 드라이브 경로는
// vscode://file/D:/works/... 형태가 된다.
func FileURL(path string) string {
	abs, err := filepath.Abs(path)
	if err != nil {
		abs = path
	}
	slash := filepath.ToSlash(abs)
	if !strings.HasPrefix(slash, "/") {
		slash = "/" + slash
	}
	return "vscode://file" + slash
}
