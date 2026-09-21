// Package runner는 작업 폴더에서 빌드/실행/테스트 명령을 돌리고 결과를 이벤트로 흘린다.
//
// 보안 경계: 명령의 첫 토큰은 gcc, go, 또는 build/ 아래 산출물만 허용하고, 작업
// 디렉터리는 work/ 아래로 고정되며, 명령마다 타임아웃과 출력 상한이 걸린다. 사이트는
// 127.0.0.1에만 열리지만 브라우저에서 임의 명령을 돌릴 수 있는 구멍은 만들지 않는다.
package runner

import (
	"bufio"
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"pro-study/site/internal/catalog"
	"pro-study/site/internal/workspace"
)

// Event는 SSE로 나가는 한 조각이다.
type Event struct {
	Type     string `json:"type"`             // stage | line | case | done
	Stage    string `json:"stage,omitempty"`  // build | run | test
	Status   string `json:"status,omitempty"` // running | ok | fail | timeout | error
	Stream   string `json:"stream,omitempty"` // stdout | stderr | sys
	Text     string `json:"text,omitempty"`
	Name     string `json:"name,omitempty"` // case 이름
	Pass     bool   `json:"pass,omitempty"`
	Expected string `json:"expected,omitempty"`
	Actual   string `json:"actual,omitempty"`
	Passed   int    `json:"passed,omitempty"`
	Total    int    `json:"total,omitempty"`
	Millis   int64  `json:"millis,omitempty"`
}

// Result는 작업 전체의 최종 결과다.
type Result struct {
	OK     bool
	Passed int
	Total  int
}

// Job은 실행 중이거나 끝난 작업 하나다. 이벤트는 버퍼에 남아 늦게 붙은 구독자도 처음부터 본다.
type Job struct {
	ID      string
	Project *catalog.Project
	Stage   string

	mu     sync.Mutex
	events []Event
	done   bool
	result Result
	subs   map[chan Event]struct{}
}

func (j *Job) emit(e Event) {
	j.mu.Lock()
	defer j.mu.Unlock()
	j.events = append(j.events, e)
	for ch := range j.subs {
		select {
		case ch <- e:
		default: // 느린 구독자는 버린다. 버퍼에 남아 있으니 재접속하면 된다.
		}
	}
}

func (j *Job) line(stage, stream, text string) {
	j.emit(Event{Type: "line", Stage: stage, Stream: stream, Text: text})
}

func (j *Job) finish(res Result) {
	j.mu.Lock()
	j.done = true
	j.result = res
	j.mu.Unlock()
	j.emit(Event{Type: "done", Status: statusOf(res.OK), Passed: res.Passed, Total: res.Total})
	j.mu.Lock()
	for ch := range j.subs {
		close(ch)
	}
	j.subs = nil
	j.mu.Unlock()
}

// Done은 작업이 끝났는지와 결과를 돌려준다.
func (j *Job) Done() (bool, Result) {
	j.mu.Lock()
	defer j.mu.Unlock()
	return j.done, j.result
}

// Subscribe는 지금까지의 이벤트와 앞으로의 이벤트 채널을 돌려준다. 끝난 작업이면 채널은 닫혀 있다.
func (j *Job) Subscribe() (replay []Event, live <-chan Event, cancel func()) {
	j.mu.Lock()
	defer j.mu.Unlock()
	replay = append([]Event(nil), j.events...)
	ch := make(chan Event, 256)
	if j.done {
		close(ch)
		return replay, ch, func() {}
	}
	if j.subs == nil {
		j.subs = map[chan Event]struct{}{}
	}
	j.subs[ch] = struct{}{}
	return replay, ch, func() {
		j.mu.Lock()
		defer j.mu.Unlock()
		if _, ok := j.subs[ch]; ok {
			delete(j.subs, ch)
			close(ch)
		}
	}
}

// Runner는 작업을 만들고 보관한다.
type Runner struct {
	Timeout   time.Duration // 명령 하나의 상한
	OutputCap int           // 명령 하나의 출력 바이트 상한
	OnDone    func(job *Job, res Result)

	mu   sync.Mutex
	jobs map[string]*Job
}

// New는 기본값(30초, 1MB)으로 Runner를 만든다.
func New() *Runner {
	return &Runner{Timeout: 30 * time.Second, OutputCap: 1 << 20, jobs: map[string]*Job{}}
}

// Get은 ID로 작업을 찾는다.
func (r *Runner) Get(id string) (*Job, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	j, ok := r.jobs[id]
	return j, ok
}

// Start는 stage(build|run|test)를 백그라운드로 시작한다. stdin은 run 단계의 표준 입력.
func (r *Runner) Start(p *catalog.Project, workDir, stage, stdin string) (*Job, error) {
	switch stage {
	case "build", "run", "test":
	default:
		return nil, fmt.Errorf("알 수 없는 단계 %q", stage)
	}
	if st, err := os.Stat(workDir); err != nil || !st.IsDir() {
		return nil, workspace.ErrNoWorkspace
	}
	if err := checkAllowed(p.Build); err != nil {
		return nil, err
	}
	if err := checkAllowed(p.Run); err != nil {
		return nil, err
	}
	buf := make([]byte, 8)
	rand.Read(buf)
	job := &Job{ID: hex.EncodeToString(buf), Project: p, Stage: stage}
	r.mu.Lock()
	r.jobs[job.ID] = job
	if len(r.jobs) > 200 {
		for id, j := range r.jobs {
			if done, _ := j.Done(); done {
				delete(r.jobs, id)
			}
		}
	}
	r.mu.Unlock()
	go r.execute(job, workDir, stdin)
	return job, nil
}

// RunSync는 Start 후 끝날 때까지 기다린다(검증 스크립트용).
func (r *Runner) RunSync(p *catalog.Project, workDir, stage, stdin string) (*Job, Result, error) {
	job, err := r.Start(p, workDir, stage, stdin)
	if err != nil {
		return nil, Result{}, err
	}
	_, live, cancel := job.Subscribe()
	defer cancel()
	for range live {
	}
	_, res := job.Done()
	return job, res, nil
}

func (r *Runner) execute(job *Job, workDir, stdin string) {
	p := job.Project
	start := time.Now()
	var res Result
	defer func() {
		job.finish(res)
		if r.OnDone != nil {
			r.OnDone(job, res)
		}
	}()

	os.MkdirAll(filepath.Join(workDir, "build"), 0o755)

	// 1. 빌드는 모든 단계의 전제다.
	if !r.stageBuild(job, workDir) {
		return
	}
	if job.Stage == "build" {
		res = Result{OK: true}
		job.line("build", "sys", fmt.Sprintf("빌드 완료 (%.1fs)", time.Since(start).Seconds()))
		return
	}

	// 2. 실행
	if job.Stage == "run" {
		job.emit(Event{Type: "stage", Stage: "run", Status: "running"})
		argv := append(append([]string{}, p.Run...), p.RunArgs...)
		out := r.exec(job, "run", workDir, argv, strings.NewReader(stdin), false)
		res = Result{OK: out.code == 0 && out.err == nil}
		job.emit(Event{Type: "stage", Stage: "run", Status: out.status(), Millis: out.millis})
		return
	}

	// 3. 테스트 — tests/는 종류와 무관하게 작업 폴더로 동기화한다(항상 원본으로 덮어씀).
	// C 프로젝트는 .args로 tests/fixtures/... 를 참조할 수 있고, Go 테스트는 같은 패키지에 놓인다.
	job.emit(Event{Type: "stage", Stage: "test", Status: "running"})
	if err := workspace.SyncTests(p, workDir); err != nil {
		job.line("test", "sys", "테스트 파일 동기화 실패: "+err.Error())
		job.emit(Event{Type: "stage", Stage: "test", Status: "error"})
		return
	}
	switch p.Test.Kind {
	case "stdio-cases":
		res = r.testStdioCases(job, workDir)
	case "go-test":
		res = r.testGo(job, workDir)
	case "script":
		res = r.testScript(job, workDir)
	default:
		job.line("test", "sys", "지원하지 않는 test.kind: "+p.Test.Kind)
	}
	job.emit(Event{Type: "stage", Stage: "test", Status: statusOf(res.OK), Passed: res.Passed, Total: res.Total,
		Millis: time.Since(start).Milliseconds()})
}

func (r *Runner) stageBuild(job *Job, workDir string) bool {
	job.emit(Event{Type: "stage", Stage: "build", Status: "running"})
	job.line("build", "sys", "$ "+strings.Join(job.Project.Build, " "))
	out := r.exec(job, "build", workDir, job.Project.Build, nil, false)
	ok := out.code == 0 && out.err == nil
	job.emit(Event{Type: "stage", Stage: "build", Status: out.status(), Millis: out.millis})
	return ok
}

// ---- 명령 실행 ----

type output struct {
	stdout   string
	code     int
	err      error
	timedOut bool
	millis   int64
}

func (o output) status() string {
	switch {
	case o.timedOut:
		return "timeout"
	case o.err != nil:
		return "error"
	case o.code != 0:
		return "fail"
	}
	return "ok"
}

func statusOf(ok bool) string {
	if ok {
		return "ok"
	}
	return "fail"
}

// exec는 argv를 workDir에서 실행한다. captureStdout이면 stdout을 모아 돌려주고
// 아니면 줄 단위로 이벤트에 흘린다. stderr는 언제나 흘린다.
func (r *Runner) exec(job *Job, stage, workDir string, argv []string, stdin io.Reader, captureStdout bool) output {
	if err := checkAllowed(argv); err != nil {
		job.line(stage, "sys", err.Error())
		return output{err: err}
	}
	return r.execRaw(job, stage, workDir, argv, stdin, captureStdout)
}

// execTrusted는 코드에서 고정한 명령(테스트 스크립트 실행기)만 위해 허용 목록을 건너뛴다.
func (r *Runner) execTrusted(job *Job, stage, workDir string, argv []string) output {
	return r.execRaw(job, stage, workDir, argv, nil, true)
}

func (r *Runner) execRaw(job *Job, stage, workDir string, argv []string, stdin io.Reader, captureStdout bool) output {
	var out output
	ctx, cancel := context.WithTimeout(context.Background(), r.Timeout)
	defer cancel()

	exe := argv[0]
	if isBuildArtifact(exe) {
		exe = filepath.Join(workDir, filepath.FromSlash(exe))
	}
	cmd := exec.CommandContext(ctx, exe, argv[1:]...)
	cmd.Dir = workDir
	cmd.Env = append(os.Environ(), "GOTOOLCHAIN=local", "GOFLAGS=-mod=mod")
	cmd.WaitDelay = 2 * time.Second
	if stdin != nil {
		cmd.Stdin = stdin
	}
	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		out.err = err
		return out
	}
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		out.err = err
		return out
	}
	started := time.Now()
	if err := cmd.Start(); err != nil {
		out.err = err
		job.line(stage, "sys", "실행 실패: "+err.Error())
		return out
	}

	var wg sync.WaitGroup
	var sb strings.Builder
	var total int64
	var capped bool
	var capMu sync.Mutex
	consume := func(rc io.Reader, stream string) {
		defer wg.Done()
		sc := bufio.NewScanner(rc)
		sc.Buffer(make([]byte, 64*1024), 1<<20)
		for sc.Scan() {
			line := sc.Text()
			capMu.Lock()
			total += int64(len(line)) + 1
			over := total > int64(r.OutputCap)
			if over && !capped {
				capped = true
				capMu.Unlock()
				job.line(stage, "sys", "출력이 상한을 넘어 프로세스를 종료합니다")
				cancel()
				continue
			}
			capMu.Unlock()
			if over {
				continue
			}
			if stream == "stdout" && captureStdout {
				sb.WriteString(line)
				sb.WriteByte('\n')
			} else {
				job.line(stage, stream, line)
			}
		}
	}
	wg.Add(2)
	go consume(stdoutPipe, "stdout")
	go consume(stderrPipe, "stderr")
	wg.Wait()
	err = cmd.Wait()
	out.millis = time.Since(started).Milliseconds()
	out.stdout = sb.String()
	if errors.Is(ctx.Err(), context.DeadlineExceeded) {
		out.timedOut = true
		out.err = ctx.Err()
		job.line(stage, "sys", fmt.Sprintf("시간 초과 (%.0fs) — 프로세스를 강제 종료했습니다", r.Timeout.Seconds()))
		return out
	}
	if capped {
		out.err = errors.New("output cap exceeded")
		return out
	}
	var exitErr *exec.ExitError
	switch {
	case err == nil:
		out.code = 0
	case errors.As(err, &exitErr):
		out.code = exitErr.ExitCode()
		if out.code == 0 {
			out.code = 1
		}
		job.line(stage, "sys", fmt.Sprintf("종료 코드 %d", out.code))
	default:
		out.err = err
		job.line(stage, "sys", "실행 실패: "+err.Error())
	}
	return out
}

// ---- 명령 허용 목록 ----

var allowedBases = map[string]bool{
	"gcc":     true,
	"go":      true,
	"rustc":   true,
	"cargo":   true,
	"python":  true,
	"python3": true,
	"node":    true,
	"tsc":     true,
}

func isBuildArtifact(tok string) bool {
	return strings.HasPrefix(tok, "build/") || strings.HasPrefix(tok, `build\`)
}

func checkAllowed(argv []string) error {
	if len(argv) == 0 {
		return errors.New("빈 명령")
	}
	tok := argv[0]
	if isBuildArtifact(tok) {
		if strings.Contains(tok, "..") {
			return fmt.Errorf("허용되지 않는 명령: %q", tok)
		}
		return nil
	}
	if strings.ContainsAny(tok, `/\`) {
		return fmt.Errorf("허용되지 않는 명령: %q (도구는 PATH 이름으로만 지정)", tok)
	}
	base := strings.TrimSuffix(strings.ToLower(tok), ".exe")
	if !allowedBases[base] {
		return fmt.Errorf("허용되지 않는 명령: %q (허용: gcc, go, rustc, cargo, python, node, tsc, build/...)", tok)
	}
	return nil
}

// powershell은 script 종류 테스트에서만 쓰며 명령 목록이 아니라 코드에서 고정된다.
func powershell() string {
	if runtime.GOOS == "windows" {
		if p, err := exec.LookPath("pwsh"); err == nil {
			return p
		}
		return "powershell"
	}
	return "pwsh"
}
