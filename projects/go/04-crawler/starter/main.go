// 04-crawler — 동시 링크 크롤러 (starter)
//
// main.go: CLI 플래그와 실행 제어.
package main

import (
	"flag"
	"fmt"
	"io"
	"os"
	"time"
)

const usageText = `사용법: app.exe [flags] <start-url>

flags:
  -workers N       동시 워커 고루틴 수 (기본: 4)
  -depth N         최대 탐색 깊이 (기본: 2)
  -max-pages N     최대 수집 페이지 수 (기본: 20)
  -same-host       동일 호스트 링크만 수집 (기본: true)
  -timeout D       전체 실행 타임아웃 (기본: 10s)
`

func main() {
	os.Exit(run(os.Args[1:], os.Stdin, os.Stdout, os.Stderr))
}

// TODO(step-5): run
// flag.NewFlagSet으로 -workers, -depth, -max-pages, -same-host, -timeout 플래그를 처리한다.
// 인자로 주어진 시작 URL을 검증하고 context.WithTimeout으로 타임아웃 컨텍스트를 생성한다.
// NewCrawler를 생성하여 Crawl을 호출하고 각 페이지별 결과 및 요약 통계를 stdout에 출력한다.
// 정상 완료 시 0, 크롤링 실패 시 1, 인자 오류 시 2를 반환한다.
func run(args []string, stdin io.Reader, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("crawler", flag.ContinueOnError)
	fs.SetOutput(stderr)
	workers := fs.Int("workers", 4, "동시 워커 수")
	depth := fs.Int("depth", 2, "최대 깊이")
	maxPages := fs.Int("max-pages", 20, "최대 페이지 수")
	sameHost := fs.Bool("same-host", true, "동일 호스트만 수집")
	timeout := fs.Duration("timeout", 10*time.Second, "전체 타임아웃")

	if err := fs.Parse(args); err != nil {
		return 2
	}
	_ = workers
	_ = depth
	_ = maxPages
	_ = sameHost
	_ = timeout
	_ = stdin
	_ = stdout
	fmt.Fprint(stderr, usageText)
	return 0
}
