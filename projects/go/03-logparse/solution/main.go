// 03-logparse — 웹 서버 로그 파서 (solution)
//
// main.go: CLI 플래그와 실행 제어.
package main

import (
	"errors"
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

// run은 CLI를 실행하고 종료 코드를 반환한다.
func run(args []string, stdin io.Reader, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("logparse", flag.ContinueOnError)
	fs.SetOutput(stderr)
	top := fs.Int("top", 5, "상위 요청 경로 개수")
	ignoreErrors := fs.Bool("ignore-errors", true, "오류 줄 무시 여부")

	if err := fs.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			fmt.Fprint(stderr, usageText)
			return 0
		}
		return 2
	}

	files := fs.Args()
	var allEntries []LogEntry
	totalErrors := 0

	if len(files) == 0 || (len(files) == 1 && files[0] == "-") {
		entries, parseErrs, err := ParseReader(stdin, *ignoreErrors)
		if err != nil {
			fmt.Fprintf(stderr, "logparse: stdin 파싱 오류: %v\n", err)
			return 1
		}
		allEntries = entries
		totalErrors = len(parseErrs)
	} else {
		for _, f := range files {
			file, err := os.Open(f)
			if err != nil {
				fmt.Fprintf(stderr, "logparse: %v\n", err)
				return 1
			}
			entries, parseErrs, err := ParseReader(file, *ignoreErrors)
			file.Close()
			if err != nil {
				fmt.Fprintf(stderr, "logparse: %s 파싱 오류: %v\n", f, err)
				return 1
			}
			allEntries = append(allEntries, entries...)
			totalErrors += len(parseErrs)
		}
	}

	summary := Summarize(allEntries, totalErrors)
	if err := RenderReport(stdout, summary, *top); err != nil {
		fmt.Fprintf(stderr, "logparse: 리포트 렌더링 실패: %v\n", err)
		return 1
	}
	return 0
}
