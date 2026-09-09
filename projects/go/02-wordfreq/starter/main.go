// 02-wordfreq — 단어 빈도 분석기 (starter)
//
// main.go: CLI 플래그와 실행 제어.
package main

import (
	"flag"
	"fmt"
	"io"
	"os"
)

const usageText = `사용법: app.exe [-top N] [-min-len N] [-ignore-case] [file...]

flags:
  -top N          상위 N개 단어 출력 (기본: 10, 0 이하면 전체)
  -min-len N      최소 단어 길이 (기본: 1)
  -ignore-case    대소문자 무시 (기본: true)
`

func main() {
	os.Exit(run(os.Args[1:], os.Stdin, os.Stdout, os.Stderr))
}

// TODO(step-5): run
// flag.NewFlagSet으로 -top, -min-len, -ignore-case 플래그를 파싱한다.
// 파일 인자가 없거나 "-"이면 stdin에서 읽고, 파일 인자가 있으면 각 파일을 열어 빈도를 합산한다.
// TopN과 FormatResults를 호출해 stdout에 출력한다.
// 정상 종료 시 0, 파일 읽기 오류 시 1, 플래그 오류 시 2를 반환한다.
func run(args []string, stdin io.Reader, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("wordfreq", flag.ContinueOnError)
	fs.SetOutput(stderr)
	top := fs.Int("top", 10, "상위 N개 단어 출력")
	minLen := fs.Int("min-len", 1, "최소 단어 길이")
	ignoreCase := fs.Bool("ignore-case", true, "대소문자 무시")

	if err := fs.Parse(args); err != nil {
		return 2
	}
	_ = top
	_ = minLen
	_ = ignoreCase
	_ = stdin
	_ = stdout
	fmt.Fprint(stderr, usageText)
	return 0
}
