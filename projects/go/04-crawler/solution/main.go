// 04-crawler — 동시 링크 크롤러 (solution)
//
// main.go: CLI 플래그와 실행 제어.
package main

import (
	"context"
	"errors"
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

// run은 CLI를 실행하고 종료 코드를 반환한다.
func run(args []string, stdin io.Reader, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("crawler", flag.ContinueOnError)
	fs.SetOutput(stderr)
	workers := fs.Int("workers", 4, "동시 워커 수")
	depth := fs.Int("depth", 2, "최대 깊이")
	maxPages := fs.Int("max-pages", 20, "최대 페이지 수")
	sameHost := fs.Bool("same-host", true, "동일 호스트만 수집")
	timeout := fs.Duration("timeout", 10*time.Second, "전체 타임아웃")

	if err := fs.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			fmt.Fprint(stderr, usageText)
			return 0
		}
		return 2
	}

	targets := fs.Args()
	if len(targets) == 0 {
		fmt.Fprint(stderr, usageText)
		return 2
	}
	startURL := targets[0]

	ctx, cancel := context.WithTimeout(context.Background(), *timeout)
	defer cancel()

	cfg := Config{
		Workers:  *workers,
		MaxDepth: *depth,
		MaxPages: *maxPages,
		SameHost: *sameHost,
		Timeout:  *timeout,
	}

	fetcher := NewHTTPFetcher(*timeout)
	crawler := NewCrawler(cfg, fetcher)

	start := time.Now()
	results, err := crawler.Crawl(ctx, startURL)
	if err != nil && !errors.Is(err, context.DeadlineExceeded) && !errors.Is(err, context.Canceled) {
		fmt.Fprintf(stderr, "crawler: 오류: %v\n", err)
		return 1
	}

	for _, r := range results {
		if r.Err != nil {
			fmt.Fprintf(stdout, "[ERR] %s (depth: %d, err: %v)\n", r.URL, r.Depth, r.Err)
		} else {
			fmt.Fprintf(stdout, "[%d] %s (links: %d, depth: %d)\n", r.StatusCode, r.URL, len(r.Links), r.Depth)
		}
	}

	fmt.Fprintln(stdout)
	fmt.Fprintln(stdout, "=== 크롤링 완료 요약 ===")
	fmt.Fprintf(stdout, "총 수집 페이지: %d\n", len(results))
	fmt.Fprintf(stdout, "발견된 고유 링크: %d\n", crawler.visited.Count())
	fmt.Fprintf(stdout, "소요 시간: %v\n", time.Since(start).Round(time.Millisecond))

	return 0
}
