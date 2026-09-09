// 04-crawler — 동시 링크 크롤러 (starter)
//
// crawler.go: 링크 추출, 방문 관리, HTTP Fetcher 및 동시성 워커 풀 크롤링 로직.
package main

import (
	"context"
	"io"
	"net/http"
	"net/url"
	"sync"
	"time"
)

// TODO(step-1): ExtractLinks
// body에서 <a ... href="..."> 속성을 정규식으로 추출한다.
// baseURL.ResolveReference를 거쳐 상대 경로를 절대 URL로 변환하고,
// 프래그먼트(#) 제거 및 http/https 스킴만 유지한 뒤 중복을 제거한 고유 링크 목록을 반환한다.
func ExtractLinks(body io.Reader, baseURL *url.URL) ([]string, error) {
	_ = body
	_ = baseURL
	return nil, nil
}

// TODO(step-2): VisitedSet
// sync.Mutex와 map[string]bool을 사용하여 고루틴 간 안전하게 방문 URL을 기록한다.
// Add(u string) bool은 새로운 URL이면 등록하고 true를, 이미 등록된 URL이면 false를 반환한다.
// Has, Count, All 메서드를 함께 구현한다.
type VisitedSet struct {
	mu   sync.Mutex
	urls map[string]bool
}

func NewVisitedSet() *VisitedSet {
	return &VisitedSet{urls: make(map[string]bool)}
}

func (v *VisitedSet) Add(u string) bool {
	_ = u
	return false
}

func (v *VisitedSet) Has(u string) bool {
	_ = u
	return false
}

func (v *VisitedSet) Count() int {
	return 0
}

func (v *VisitedSet) All() []string {
	return nil
}

// TODO(step-3): Fetcher 및 HTTPFetcher
// Fetcher는 HTTP 요청을 보내고 응답 상태 코드 및 본문을 반환하는 인터페이스다.
// HTTPFetcher는 http.Client를 감싸고 http.NewRequestWithContext를 통해 context 취소/타임아웃을 지원한다.
type Fetcher interface {
	Fetch(ctx context.Context, targetURL string) (statusCode int, body io.ReadCloser, err error)
}

type HTTPFetcher struct {
	Client *http.Client
}

func NewHTTPFetcher(timeout time.Duration) *HTTPFetcher {
	return &HTTPFetcher{Client: &http.Client{Timeout: timeout}}
}

func (f *HTTPFetcher) Fetch(ctx context.Context, targetURL string) (int, io.ReadCloser, error) {
	_ = ctx
	_ = targetURL
	return 0, nil, nil
}

// Config는 크롤러의 동작 파라미터다.
type Config struct {
	Workers  int
	MaxDepth int
	MaxPages int
	SameHost bool
	Timeout  time.Duration
}

// CrawlResult는 한 페이지를 크롤링한 결과다.
type CrawlResult struct {
	URL        string
	StatusCode int
	Links      []string
	Err        error
	Depth      int
}

type Crawler struct {
	cfg     Config
	fetcher Fetcher
	visited *VisitedSet
}

func NewCrawler(cfg Config, fetcher Fetcher) *Crawler {
	return &Crawler{
		cfg:     cfg,
		fetcher: fetcher,
		visited: NewVisitedSet(),
	}
}

// TODO(step-4): Crawl
// Config.Workers 수만큼의 고루틴을 실행하여 jobs 채널로부터 작업을 받아 fetcher.Fetch와 ExtractLinks를 수행한다.
// 디스패처 이벤트 루프에서 select 문을 통해 작업 큐와 inFlight 카운터를 조율하며,
// MaxDepth, MaxPages, SameHost 및 ctx.Done() 조건을 준수하여 CrawlResult 슬라이스를 반환한다.
func (c *Crawler) Crawl(ctx context.Context, startURL string) ([]CrawlResult, error) {
	_ = ctx
	_ = startURL
	return nil, nil
}
