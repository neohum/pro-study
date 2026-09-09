package runner

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"pro-study/site/internal/catalog"
)

func requireGo(t *testing.T) {
	t.Helper()
	if _, err := exec.LookPath("go"); err != nil {
		t.Skip("go 툴체인이 없어 건너뜀")
	}
}

// goProject는 stdio-cases 러너를 검증하기 위한 작은 Go 프로그램이다.
// (C 컴파일러가 없는 환경에서도 러너 로직 자체는 검증되어야 한다.)
func goProject(t *testing.T, root, mainSrc string, cases map[string]string) (*catalog.Project, string) {
	t.Helper()
	dir := filepath.Join(root, "projects", "go", "01-x")
	work := filepath.Join(root, "work", "go", "01-x")
	os.MkdirAll(filepath.Join(dir, "tests", "cases"), 0o755)
	os.MkdirAll(work, 0o755)
	os.WriteFile(filepath.Join(work, "go.mod"), []byte("module x\n\ngo 1.22\n"), 0o644)
	os.WriteFile(filepath.Join(work, "main.go"), []byte(mainSrc), 0o644)
	for name, body := range cases {
		os.WriteFile(filepath.Join(dir, "tests", "cases", name), []byte(body), 0o644)
	}
	p := &catalog.Project{
		ID: "go/01-x", Lang: "go", Slug: "01-x", Dir: dir, Entry: "main.go",
		Build: []string{"go", "build", "-o", "build/app.exe", "."},
		Run:   []string{"build/app.exe"},
		Test:  catalog.TestSpec{Kind: "stdio-cases", Dir: "tests/cases"},
	}
	return p, work
}

const echoUpper = `package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	sc := bufio.NewScanner(os.Stdin)
	for sc.Scan() {
		fmt.Println(strings.ToUpper(sc.Text()), strings.Join(os.Args[1:], ","))
	}
}
`

func TestStdioCasesPassAndFail(t *testing.T) {
	requireGo(t)
	root := t.TempDir()
	p, work := goProject(t, root, echoUpper, map[string]string{
		"01.in": "hi\n", "01.out": "HI \r\n", // CRLF·꼬리 공백은 정규화된다
		"02.in": "a\n", "02.args": "x y", "02.out": "A x,y\n",
		"03.in": "b\n", "03.out": "wrong\n",
	})
	r := New()
	var got Result
	r.OnDone = func(_ *Job, res Result) { got = res }
	job, res, err := r.RunSync(p, work, "test", "")
	if err != nil {
		t.Fatal(err)
	}
	if res.OK || res.Passed != 2 || res.Total != 3 {
		t.Fatalf("Result = %+v", res)
	}
	if got != res {
		t.Errorf("OnDone이 다른 결과를 받음: %+v", got)
	}
	replay, _, _ := job.Subscribe()
	var cases []Event
	for _, e := range replay {
		if e.Type == "case" {
			cases = append(cases, e)
		}
	}
	if len(cases) != 3 || !cases[0].Pass || !cases[1].Pass || cases[2].Pass {
		t.Fatalf("cases = %+v", cases)
	}
	if cases[2].Expected != "wrong" || cases[2].Actual != "B" {
		t.Errorf("실패 케이스 비교값 = %+v", cases[2])
	}
	if last := replay[len(replay)-1]; last.Type != "done" || last.Status != "fail" {
		t.Errorf("마지막 이벤트 = %+v", last)
	}
}

func TestRunStageStreamsStdin(t *testing.T) {
	requireGo(t)
	root := t.TempDir()
	p, work := goProject(t, root, echoUpper, nil)
	p.RunArgs = []string{"z"}
	r := New()
	job, res, err := r.RunSync(p, work, "run", "hello\n")
	if err != nil || !res.OK {
		t.Fatalf("run = %+v %v", res, err)
	}
	replay, _, _ := job.Subscribe()
	found := false
	for _, e := range replay {
		if e.Type == "line" && e.Stream == "stdout" && e.Text == "HELLO z" {
			found = true
		}
	}
	if !found {
		t.Errorf("stdout 줄이 스트리밍되지 않음: %+v", replay)
	}
}

func TestTimeoutKillsProcess(t *testing.T) {
	requireGo(t)
	root := t.TempDir()
	p, work := goProject(t, root, "package main\n\nfunc main() { for {} }\n", map[string]string{"01.out": ""})
	r := New()
	r.Timeout = 2 * time.Second
	start := time.Now()
	job, res, err := r.RunSync(p, work, "test", "")
	if err != nil {
		t.Fatal(err)
	}
	// 빌드(수 초) + 케이스 1개 타임아웃(2초)이 합쳐진 시간이므로 넉넉히 본다.
	if time.Since(start) > 60*time.Second {
		t.Fatalf("타임아웃이 걸리지 않음")
	}
	if res.OK {
		t.Fatal("무한 루프가 통과로 처리됨")
	}
	replay, _, _ := job.Subscribe()
	var sawTimeout bool
	for _, e := range replay {
		if e.Type == "case" && e.Status == "timeout" {
			sawTimeout = true
		}
	}
	if !sawTimeout {
		t.Errorf("timeout 상태의 case 이벤트가 없음: %+v", replay)
	}
}

func TestAllowlist(t *testing.T) {
	bad := [][]string{
		{"cmd", "/c", "dir"}, {"powershell"}, {"C:/tools/gcc.exe"}, {"../gcc"}, {"build/../x.exe"}, {},
		{"./gcc"},
	}
	for _, argv := range bad {
		if err := checkAllowed(argv); err == nil {
			t.Errorf("checkAllowed(%v) should fail", argv)
		}
	}
	good := [][]string{{"gcc", "-std=c23"}, {"GCC.EXE"}, {"go", "build"}, {"build/app.exe"}, {`build\app.exe`}}
	for _, argv := range good {
		if err := checkAllowed(argv); err != nil {
			t.Errorf("checkAllowed(%v) = %v", argv, err)
		}
	}
	r := New()
	p := &catalog.Project{Build: []string{"cmd", "/c", "echo"}, Run: []string{"build/app.exe"}, Test: catalog.TestSpec{Kind: "stdio-cases"}}
	if _, err := r.Start(p, t.TempDir(), "build", ""); err == nil || !strings.Contains(err.Error(), "허용되지 않는") {
		t.Errorf("Start가 허용되지 않은 명령을 거부하지 않음: %v", err)
	}
}

func TestStartRejectsMissingWorkspace(t *testing.T) {
	r := New()
	p := &catalog.Project{Build: []string{"gcc"}, Run: []string{"build/app.exe"}}
	if _, err := r.Start(p, filepath.Join(t.TempDir(), "nope"), "build", ""); err == nil {
		t.Fatal("작업 폴더가 없으면 실패해야 한다")
	}
	if _, err := r.Start(p, t.TempDir(), "deploy", ""); err == nil {
		t.Fatal("알 수 없는 단계는 실패해야 한다")
	}
}

func TestGoTestKind(t *testing.T) {
	requireGo(t)
	root := t.TempDir()
	dir := filepath.Join(root, "projects", "go", "02-x")
	work := filepath.Join(root, "work", "go", "02-x")
	os.MkdirAll(filepath.Join(dir, "tests"), 0o755)
	os.MkdirAll(work, 0o755)
	os.WriteFile(filepath.Join(work, "go.mod"), []byte("module x\n\ngo 1.22\n"), 0o644)
	os.WriteFile(filepath.Join(work, "main.go"), []byte("package main\n\nfunc Add(a, b int) int { return a + b }\n\nfunc main() {}\n"), 0o644)
	os.WriteFile(filepath.Join(dir, "tests", "main_test.go"), []byte(`package main

import "testing"

func TestAdd(t *testing.T)  { if Add(1, 2) != 3 { t.Fatal("no") } }
func TestFail(t *testing.T) { t.Errorf("일부러 실패: %d", Add(2, 2)) }
`), 0o644)
	p := &catalog.Project{
		ID: "go/02-x", Lang: "go", Slug: "02-x", Dir: dir, Entry: "main.go",
		Build: []string{"go", "build", "-o", "build/app.exe", "."},
		Run:   []string{"build/app.exe"},
		Test:  catalog.TestSpec{Kind: "go-test"},
	}
	r := New()
	r.Timeout = 120 * time.Second
	job, res, err := r.RunSync(p, work, "test", "")
	if err != nil {
		t.Fatal(err)
	}
	if res.OK || res.Passed != 1 || res.Total != 2 {
		t.Fatalf("Result = %+v", res)
	}
	replay, _, _ := job.Subscribe()
	var names []string
	for _, e := range replay {
		if e.Type == "case" {
			names = append(names, e.Name)
			if e.Name == "TestFail" && !strings.Contains(e.Actual, "일부러 실패: 4") {
				t.Errorf("실패 출력이 case에 붙지 않음: %+v", e)
			}
		}
	}
	if strings.Join(names, ",") != "TestAdd,TestFail" {
		t.Errorf("cases = %v", names)
	}
}

func TestNormalize(t *testing.T) {
	if normalize("a \r\nb\t\r\n\n") != "a\nb" {
		t.Errorf("normalize = %q", normalize("a \r\nb\t\r\n\n"))
	}
}
