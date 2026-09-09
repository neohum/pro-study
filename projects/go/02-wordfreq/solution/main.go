// 02-wordfreq — 단어 빈도 분석기 (solution)
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

const usageText = `사용법: app.exe [-top N] [-min-len N] [-ignore-case] [file...]

flags:
  -top N          상위 N개 단어 출력 (기본: 10, 0 이하면 전체)
  -min-len N      최소 단어 길이 (기본: 1)
  -ignore-case    대소문자 무시 (기본: true)
`

func main() {
	os.Exit(run(os.Args[1:], os.Stdin, os.Stdout, os.Stderr))
}

// run은 CLI를 실행하고 종료 코드를 반환한다.
func run(args []string, stdin io.Reader, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("wordfreq", flag.ContinueOnError)
	fs.SetOutput(stderr)
	top := fs.Int("top", 10, "상위 N개 단어 출력 (0 이하면 전체)")
	minLen := fs.Int("min-len", 1, "최소 단어 길이")
	ignoreCase := fs.Bool("ignore-case", true, "대소문자 무시")

	if err := fs.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			fmt.Fprint(stderr, usageText)
			return 0
		}
		return 2
	}

	files := fs.Args()
	totalCounts := make(map[string]int)

	if len(files) == 0 || (len(files) == 1 && files[0] == "-") {
		c, err := CountWords(stdin, *minLen, *ignoreCase)
		if err != nil {
			fmt.Fprintf(stderr, "wordfreq: stdin 읽기 오류: %v\n", err)
			return 1
		}
		totalCounts = c
	} else {
		for _, f := range files {
			file, err := os.Open(f)
			if err != nil {
				fmt.Fprintf(stderr, "wordfreq: %v\n", err)
				return 1
			}
			c, err := CountWords(file, *minLen, *ignoreCase)
			file.Close()
			if err != nil {
				fmt.Fprintf(stderr, "wordfreq: %s 읽기 오류: %v\n", f, err)
				return 1
			}
			for w, count := range c {
				totalCounts[w] += count
			}
		}
	}

	ranked := TopN(totalCounts, *top)
	FormatResults(stdout, ranked)
	return 0
}
