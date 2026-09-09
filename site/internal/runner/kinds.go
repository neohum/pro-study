package runner

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"pro-study/site/internal/workspace"
)

// ---- stdio-cases: tests/cases/NN.out 마다 NN.in을 stdin으로, NN.args를 인자로 ----

type stdioCase struct {
	name     string
	in       string
	args     []string
	expected string
}

func loadStdioCases(dir string) ([]stdioCase, error) {
	outs, err := filepath.Glob(filepath.Join(dir, "*.out"))
	if err != nil {
		return nil, err
	}
	sort.Strings(outs)
	var cases []stdioCase
	for _, outPath := range outs {
		name := strings.TrimSuffix(filepath.Base(outPath), ".out")
		expected, err := os.ReadFile(outPath)
		if err != nil {
			return nil, err
		}
		c := stdioCase{name: name, expected: string(expected)}
		if b, err := os.ReadFile(filepath.Join(dir, name+".in")); err == nil {
			c.in = string(b)
		}
		if b, err := os.ReadFile(filepath.Join(dir, name+".args")); err == nil {
			c.args = strings.Fields(string(b))
		}
		cases = append(cases, c)
	}
	return cases, nil
}

// normalize는 줄 끝 공백과 CRLF/LF 차이, 마지막 개행 유무를 무시한다.
// Windows 콘솔 출력과 Unix 기대값이 그 차이로 어긋나면 학습자는 배우는 게 없다.
func normalize(s string) string {
	s = strings.ReplaceAll(s, "\r\n", "\n")
	lines := strings.Split(s, "\n")
	for i, l := range lines {
		lines[i] = strings.TrimRight(l, " \t\r")
	}
	return strings.TrimRight(strings.Join(lines, "\n"), "\n")
}

func (r *Runner) testStdioCases(job *Job, workDir string) Result {
	p := job.Project
	dir := filepath.Join(p.Dir, filepath.FromSlash(p.Test.Dir))
	cases, err := loadStdioCases(dir)
	if err != nil || len(cases) == 0 {
		job.line("test", "sys", "테스트 케이스가 없습니다: "+dir)
		return Result{}
	}
	res := Result{Total: len(cases)}
	for _, c := range cases {
		argv := append(append([]string{}, p.Run...), c.args...)
		job.line("test", "sys", fmt.Sprintf("▶ %s: $ %s", c.name, strings.Join(argv, " ")))
		out := r.exec(job, "test", workDir, argv, strings.NewReader(c.in), true)
		actual := normalize(out.stdout)
		expected := normalize(c.expected)
		pass := out.err == nil && !out.timedOut && actual == expected
		if pass {
			res.Passed++
		}
		job.emit(Event{Type: "case", Stage: "test", Name: c.name, Pass: pass,
			Expected: expected, Actual: actual, Millis: out.millis, Status: out.status()})
	}
	res.OK = res.Passed == res.Total
	return res
}

// ---- go-test: go vet + go test -json ----

type goTestEvent struct {
	Action  string  `json:"Action"`
	Package string  `json:"Package"`
	Test    string  `json:"Test"`
	Output  string  `json:"Output"`
	Elapsed float64 `json:"Elapsed"`
}

func (r *Runner) testGo(job *Job, workDir string) Result {
	if err := workspace.SyncTests(job.Project, workDir); err != nil {
		job.line("test", "sys", "테스트 파일 동기화 실패: "+err.Error())
		return Result{}
	}
	job.line("test", "sys", "$ go vet ./...")
	vet := r.exec(job, "test", workDir, []string{"go", "vet", "./..."}, nil, false)
	if vet.code != 0 || vet.err != nil {
		job.line("test", "sys", "go vet 실패 — 테스트를 실행하지 않습니다")
		return Result{}
	}
	argv := append([]string{"go", "test", "./...", "-json", "-count=1"}, job.Project.Test.Args...)
	job.line("test", "sys", "$ "+strings.Join(argv, " "))
	out := r.exec(job, "test", workDir, argv, nil, true)

	res := Result{}
	var outputs = map[string][]string{}
	for _, line := range strings.Split(out.stdout, "\n") {
		if !strings.HasPrefix(line, "{") {
			if strings.TrimSpace(line) != "" {
				job.line("test", "stdout", line)
			}
			continue
		}
		var ev goTestEvent
		if json.Unmarshal([]byte(line), &ev) != nil {
			continue
		}
		key := ev.Test
		switch ev.Action {
		case "output":
			text := strings.TrimRight(ev.Output, "\n")
			if key == "" {
				if text != "" && !strings.HasPrefix(text, "ok ") && !strings.HasPrefix(text, "FAIL") &&
					!strings.HasPrefix(text, "PASS") {
					job.line("test", "stdout", text)
				}
			} else if !strings.HasPrefix(strings.TrimSpace(text), "=== RUN") &&
				!strings.HasPrefix(strings.TrimSpace(text), "--- ") {
				outputs[key] = append(outputs[key], strings.TrimSpace(text))
			}
		case "pass", "fail":
			if key == "" {
				continue
			}
			res.Total++
			pass := ev.Action == "pass"
			if pass {
				res.Passed++
			}
			job.emit(Event{Type: "case", Stage: "test", Name: key, Pass: pass,
				Actual: strings.Join(outputs[key], "\n"), Millis: int64(ev.Elapsed * 1000),
				Status: statusOf(pass)})
		}
	}
	if res.Total == 0 {
		job.line("test", "sys", "실행된 테스트가 없습니다 (테스트 함수가 있는지, 컴파일 에러가 없는지 확인)")
		return res
	}
	res.OK = out.code == 0 && out.err == nil && res.Passed == res.Total
	return res
}

// ---- script: tests/run.ps1 <workDir> — 종료 코드 0이면 통과 ----

func (r *Runner) testScript(job *Job, workDir string) Result {
	script := filepath.Join(job.Project.Dir, filepath.FromSlash(job.Project.Test.Script))
	if _, err := os.Stat(script); err != nil {
		job.line("test", "sys", "테스트 스크립트가 없습니다: "+script)
		return Result{}
	}
	argv := []string{powershell(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script, workDir}
	job.line("test", "sys", "$ "+strings.Join(argv, " "))
	out := r.execTrusted(job, "test", workDir, argv)
	// 스크립트는 "PASS <name>" / "FAIL <name>" 줄로 케이스를 보고할 수 있다.
	res := Result{}
	for _, line := range strings.Split(out.stdout, "\n") {
		line = strings.TrimSpace(line)
		var name string
		switch {
		case strings.HasPrefix(line, "PASS "):
			name = strings.TrimPrefix(line, "PASS ")
			res.Total++
			res.Passed++
			job.emit(Event{Type: "case", Stage: "test", Name: name, Pass: true, Status: "ok"})
		case strings.HasPrefix(line, "FAIL "):
			name = strings.TrimPrefix(line, "FAIL ")
			res.Total++
			job.emit(Event{Type: "case", Stage: "test", Name: name, Pass: false, Status: "fail"})
		case line != "":
			job.line("test", "stdout", line)
		}
	}
	if res.Total == 0 {
		res.Total = 1
		if out.code == 0 && out.err == nil {
			res.Passed = 1
		}
		job.emit(Event{Type: "case", Stage: "test", Name: "run.ps1", Pass: res.Passed == 1, Status: out.status()})
	}
	res.OK = out.code == 0 && out.err == nil && res.Passed == res.Total
	return res
}
