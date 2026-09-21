// verify는 프로젝트 콘텐츠의 품질 게이트다.
//
//	go -C site run ./cmd/verify                 # 전체
//	go -C site run ./cmd/verify -lang c -range 1..5
//	go -C site run ./cmd/verify -only c/01-calc,go/02-wordfreq
//
// 프로젝트마다 검사한다:
//  1. README.md에 7개 절이 순서대로 있다
//  2. starter의 TODO(step-N)와 README의 "### Step N"이 같은 집합이다
//  3. starter가 경고 없이 빌드된다
//  4. solution이 테스트를 전부 통과한다 (케이스 1개 이상)
//
// 하나라도 실패하면 종료 코드 1.
package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"pro-study/site/internal/catalog"
	"pro-study/site/internal/runner"
	"pro-study/site/internal/workspace"
)

var requiredSections = []string{
	"## 무엇을 만드는가", "## 왜 이 프로젝트인가", "## 핵심 개념", "## 단계별 구현",
	"## 막혔을 때", "## 더 나아가기", "## 참고",
}

var (
	todoRe = regexp.MustCompile(`TODO\(step-(\d+)\)`)
	stepRe = regexp.MustCompile(`(?m)^### Step (\d+)\b`)
)

func main() {
	root := flag.String("root", "", "저장소 루트 (기본: projects/가 있는 현재 또는 상위)")
	lang := flag.String("lang", "", "c | go | rust | python | typescript | javascript (기본: 전부)")
	rng := flag.String("range", "", "order 범위, 예: 1..5")
	only := flag.String("only", "", "쉼표로 구분한 id 목록, 예: c/01-calc,go/02-wordfreq")
	timeout := flag.Duration("timeout", 180*time.Second, "명령 하나의 시간 상한")
	flag.Parse()

	r, err := findRoot(*root)
	if err != nil {
		fatal(err)
	}
	cat, problems, err := catalog.Load(r)
	if err != nil {
		fatal(err)
	}
	failed := 0
	for _, p := range problems {
		fmt.Printf("FAIL %s\n  - project.json: %v\n", p.Path, p.Err)
		failed++
	}
	lo, hi := 0, 1<<30
	if *rng != "" {
		parts := strings.SplitN(*rng, "..", 2)
		if len(parts) != 2 {
			fatal(fmt.Errorf("-range 형식은 A..B 입니다"))
		}
		lo, _ = strconv.Atoi(parts[0])
		hi, _ = strconv.Atoi(parts[1])
	}
	onlySet := map[string]bool{}
	for _, id := range strings.Split(*only, ",") {
		if id = strings.TrimSpace(id); id != "" {
			onlySet[id] = true
		}
	}

	rn := runner.New()
	rn.Timeout = *timeout
	var selected []*catalog.Project
	for _, p := range cat.All() {
		if *lang != "" && p.Lang != *lang {
			continue
		}
		if p.Order < lo || p.Order > hi {
			continue
		}
		if len(onlySet) > 0 && !onlySet[p.ID] {
			continue
		}
		selected = append(selected, p)
	}
	if len(selected) == 0 {
		fatal(fmt.Errorf("선택된 프로젝트가 없습니다"))
	}
	for _, p := range selected {
		errs := verify(rn, p)
		if len(errs) == 0 {
			fmt.Printf("PASS %s\n", p.ID)
			continue
		}
		failed++
		fmt.Printf("FAIL %s\n", p.ID)
		for _, e := range errs {
			fmt.Printf("  - %s\n", e)
		}
	}
	fmt.Printf("\n%d/%d 통과\n", len(selected)-failed+len(problems)*0, len(selected))
	if failed > 0 {
		os.Exit(1)
	}
}

func verify(rn *runner.Runner, p *catalog.Project) []string {
	var errs []string

	// 1. README 절
	readme, err := os.ReadFile(filepath.Join(p.Dir, "README.md"))
	if err != nil {
		errs = append(errs, "README.md 없음")
	} else {
		last := -1
		for _, sec := range requiredSections {
			idx := strings.Index(string(readme), "\n"+sec)
			if idx < 0 {
				errs = append(errs, "README 절 누락: "+sec)
				continue
			}
			if idx < last {
				errs = append(errs, "README 절 순서 어긋남: "+sec)
			}
			last = idx
		}
	}

	// 2. TODO(step-N) ↔ ### Step N
	todoSteps := map[int]bool{}
	filepath.WalkDir(filepath.Join(p.Dir, "starter"), func(path string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return nil
		}
		b, _ := os.ReadFile(path)
		for _, m := range todoRe.FindAllSubmatch(b, -1) {
			n, _ := strconv.Atoi(string(m[1]))
			todoSteps[n] = true
		}
		return nil
	})
	readmeSteps := map[int]bool{}
	for _, m := range stepRe.FindAllSubmatch(readme, -1) {
		n, _ := strconv.Atoi(string(m[1]))
		readmeSteps[n] = true
	}
	if len(todoSteps) == 0 {
		errs = append(errs, "starter에 TODO(step-N) 주석이 없음")
	}
	if len(readmeSteps) == 0 {
		errs = append(errs, "README에 '### Step N' 소절이 없음")
	}
	if d := diffKeys(todoSteps, readmeSteps); d != "" {
		errs = append(errs, "starter TODO에만 있는 단계: "+d)
	}
	if d := diffKeys(readmeSteps, todoSteps); d != "" {
		errs = append(errs, "README에만 있는 단계: "+d)
	}

	// 3. starter 빌드 (경고 0)
	if dir, err := stage(p, "starter"); err != nil {
		errs = append(errs, "starter 준비 실패: "+err.Error())
	} else {
		job, res, err := rn.RunSync(p, dir, "build", "")
		if err != nil {
			errs = append(errs, "starter 빌드 실행 실패: "+err.Error())
		} else if !res.OK {
			errs = append(errs, "starter 빌드 실패:\n"+indent(stderrOf(job)))
		} else if w := warningsOf(job); w != "" {
			errs = append(errs, "starter 빌드 경고:\n"+indent(w))
		}
		os.RemoveAll(dir)
	}

	// 4. solution 테스트 통과
	if !dirExists(filepath.Join(p.Dir, "solution")) {
		errs = append(errs, "solution/ 없음")
	} else if dir, err := stage(p, "solution"); err != nil {
		errs = append(errs, "solution 준비 실패: "+err.Error())
	} else {
		job, res, err := rn.RunSync(p, dir, "test", "")
		switch {
		case err != nil:
			errs = append(errs, "solution 테스트 실행 실패: "+err.Error())
		case res.Total == 0:
			errs = append(errs, "solution 테스트 케이스가 0개:\n"+indent(stderrOf(job)))
		case !res.OK:
			errs = append(errs, fmt.Sprintf("solution 테스트 %d/%d 통과:\n%s", res.Passed, res.Total, indent(failuresOf(job))))
		}
		if w := warningsOf(job); w != "" {
			errs = append(errs, "solution 빌드 경고:\n"+indent(w))
		}
		os.RemoveAll(dir)
	}
	return errs
}

// stage는 starter 또는 solution을 임시 작업 폴더로 복사한다.
func stage(p *catalog.Project, area string) (string, error) {
	dir, err := os.MkdirTemp("", "verify-"+p.Lang+"-"+p.Slug+"-")
	if err != nil {
		return "", err
	}
	// workspace.Ensure는 starter만 복사하므로 임시 프로젝트 뷰를 만든다.
	fake := *p
	fake.Dir = p.Dir
	if area == "starter" {
		root := filepath.Join(dir, "root")
		fake.Lang, fake.Slug = p.Lang, p.Slug
		w, _, err := workspace.Ensure(root, &fake)
		return w, err
	}
	src := filepath.Join(p.Dir, area)
	if err := copyTree(src, dir); err != nil {
		return "", err
	}
	if vs := filepath.Join(p.Dir, ".vscode"); dirExists(vs) {
		copyTree(vs, filepath.Join(dir, ".vscode"))
	}
	return dir, nil
}

func copyTree(src, dst string) error {
	return filepath.WalkDir(src, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(src, path)
		target := filepath.Join(dst, rel)
		if d.IsDir() {
			if d.Name() == "build" && rel != "." {
				return filepath.SkipDir
			}
			return os.MkdirAll(target, 0o755)
		}
		b, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		return os.WriteFile(target, b, 0o644)
	})
}

func stderrOf(job *runner.Job) string {
	replay, _, _ := job.Subscribe()
	var sb strings.Builder
	for _, e := range replay {
		if e.Type == "line" && (e.Stream == "stderr" || e.Stream == "sys") {
			sb.WriteString(e.Text + "\n")
		}
	}
	return sb.String()
}

func warningsOf(job *runner.Job) string {
	replay, _, _ := job.Subscribe()
	var sb strings.Builder
	for _, e := range replay {
		if e.Type == "line" && e.Stage == "build" && strings.Contains(e.Text, "warning:") {
			sb.WriteString(e.Text + "\n")
		}
	}
	return sb.String()
}

func failuresOf(job *runner.Job) string {
	replay, _, _ := job.Subscribe()
	var sb strings.Builder
	for _, e := range replay {
		if e.Type == "case" && !e.Pass {
			fmt.Fprintf(&sb, "❌ %s (%s)\n", e.Name, e.Status)
			if e.Expected != "" {
				fmt.Fprintf(&sb, "   기대: %s\n", strings.ReplaceAll(e.Expected, "\n", "\n         "))
			}
			if e.Actual != "" {
				fmt.Fprintf(&sb, "   실제: %s\n", strings.ReplaceAll(e.Actual, "\n", "\n         "))
			}
		}
	}
	if s := stderrOf(job); s != "" {
		sb.WriteString("stderr:\n" + s)
	}
	return sb.String()
}

func diffKeys(a, b map[int]bool) string {
	var out []int
	for k := range a {
		if !b[k] {
			out = append(out, k)
		}
	}
	sort.Ints(out)
	var parts []string
	for _, k := range out {
		parts = append(parts, strconv.Itoa(k))
	}
	return strings.Join(parts, ",")
}

func indent(s string) string {
	s = strings.TrimRight(s, "\n")
	if s == "" {
		return "    (출력 없음)"
	}
	return "    " + strings.ReplaceAll(s, "\n", "\n    ")
}

func dirExists(p string) bool {
	st, err := os.Stat(p)
	return err == nil && st.IsDir()
}

func findRoot(flagRoot string) (string, error) {
	if flagRoot != "" {
		return filepath.Abs(flagRoot)
	}
	cwd, _ := os.Getwd()
	for _, cand := range []string{cwd, filepath.Dir(cwd)} {
		if dirExists(filepath.Join(cand, "projects")) {
			return cand, nil
		}
	}
	return "", fmt.Errorf("projects/ 디렉터리를 찾지 못했습니다 (cwd=%s)", cwd)
}

func fatal(err error) {
	fmt.Fprintln(os.Stderr, "verify:", err)
	os.Exit(2)
}
