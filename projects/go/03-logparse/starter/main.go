// 03-logparse — 웹 서버 로그 파서 (starter)
//
// main.go: CLI 플래그와 실행 제어.
package main

import (
	"flag"
	"fmt"
	"io"
	"os"
)

const usageText = `사용법: app.exe [-top N] [-ignore-errors] [file...]

flags:
  -top N           상위 요청 경로 개수 (기본: 5)
  -ignore-errors   오류 줄 무시하고 계속 진행 (기본: true)
`

func main() {
	os.Exit(run(os.Args[1:], os.Stdin, os.Stdout, os.Stderr))
}

// TODO(step-5): run
// flag.NewFlagSet으로 -top, -ignore-errors 플래그를 처리한다.
// 인자가 없거나 "-"이면 stdin에서 읽고, 파일 인자가 있으면 각 파일을 열어 순회 파싱한다.
// Summarize와 RenderReport를 통해 stdout에 요약 리포트를 출력한다.
// 정상 종료 시 0, 파일 읽기/파싱 오류 시 1, 플래그 오류 시 2를 반환한다.
func run(args []string, stdin io.Reader, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("logparse", flag.ContinueOnError)
	fs.SetOutput(stderr)
	top := fs.Int("top", 5, "상위 요청 경로 개수")
	ignoreErrors := fs.Bool("ignore-errors", true, "오류 줄 무시 여부")

	if err := fs.Parse(args); err != nil {
		return 2
	}
	_ = top
	_ = ignoreErrors
	_ = stdin
	_ = stdout
	fmt.Fprint(stderr, usageText)
	return 0
}
