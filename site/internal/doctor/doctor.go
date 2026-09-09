// Package doctor는 학습에 필요한 로컬 도구(gcc, go, code)를 감지한다.
package doctor

import (
	"context"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

// Tool은 도구 하나의 감지 결과다.
type Tool struct {
	Name    string `json:"name"`
	Cmd     string `json:"cmd"`
	Found   bool   `json:"found"`
	Version string `json:"version"`
	Path    string `json:"path"`
	Hint    string `json:"hint"`
}

var tools = []struct {
	name, cmd string
	args      []string
	hint      string
}{
	{"gcc (C23)", "gcc", []string{"--version"}, "MinGW-w64 gcc 13 이상을 설치하고 bin 폴더를 PATH에 추가하세요. C23은 gcc 13부터, #embed는 gcc 15부터 지원합니다."},
	{"go", "go", []string{"version"}, "https://go.dev/dl 에서 Go 1.22 이상을 설치하세요."},
	{"VS Code CLI", "code", []string{"--version"}, "VS Code를 설치한 뒤 명령 팔레트에서 'Shell Command: Install code command in PATH'를 실행하거나, 설치 시 'PATH에 추가'를 켜세요."},
}

// LookPath는 테스트에서 바꿔 끼우기 위한 훅이다.
var LookPath = exec.LookPath

// Check는 모든 도구를 검사한다.
func Check() []Tool {
	var out []Tool
	for _, t := range tools {
		tool := Tool{Name: t.name, Cmd: t.cmd, Hint: t.hint}
		path, err := LookPath(t.cmd)
		if err != nil {
			out = append(out, tool)
			continue
		}
		tool.Found = true
		tool.Path = path
		tool.Version = firstLine(run(t.cmd, t.args...))
		out = append(out, tool)
	}
	return out
}

// AllFound는 하나라도 빠졌으면 false다.
func AllFound(ts []Tool) bool {
	for _, t := range ts {
		if !t.Found {
			return false
		}
	}
	return true
}

func run(cmd string, args ...string) string {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	var c *exec.Cmd
	if runtime.GOOS == "windows" {
		c = exec.CommandContext(ctx, "cmd", append([]string{"/c", cmd}, args...)...)
	} else {
		c = exec.CommandContext(ctx, cmd, args...)
	}
	out, err := c.CombinedOutput()
	if err != nil && len(out) == 0 {
		return "(버전 확인 실패: " + err.Error() + ")"
	}
	return string(out)
}

func firstLine(s string) string {
	s = strings.TrimSpace(s)
	if i := strings.IndexAny(s, "\r\n"); i >= 0 {
		s = s[:i]
	}
	return s
}
