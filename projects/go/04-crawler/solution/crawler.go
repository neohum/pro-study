// 04-crawler — 동시 링크 크롤러 (solution)
//
// crawler.go: 링크 추출, 방문 관리, HTTP Fetcher 및 동시성 워커 풀 크롤링 로직.
package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"sync"
	"time"
)

var hrefRegex = regexp.MustCompile(`(?i)<a\s+[^>]*?href=["']([^"']+)["']`)

// ExtractLinks는 HTML 본문에서 <a ... href="..."> 속성을 추출하고 baseURL 기준으로 정규화한다.
func ExtractLinks(body io.Reader, baseURL *url.URL) ([]string, error) {
	b, err := io.ReadAll(body)
	if err != nil {
		return nil, err
	}

	matches := hrefRegex.FindAllStringSubmatch(string(b), -1)
	seen := make(map[string]bool)
	var links []string

	for _, m := range matches {
		raw := strings.TrimSpace(m[1])
		if raw == "" || strings.HasPrefix(raw, "#") ||
			strings.HasPrefix(raw, "javascript:") || strings.HasPrefix(raw, "mailto:") {
			continue
		}

		u, err := url.Parse(raw)
		if err != nil {
			continue
		}

		resolved := baseURL.ResolveReference(u)
		if resolved.Scheme != "http" && resolved.Scheme != "https" {
			continue
		}

		resolved.Fragment = ""
		fullURL := resolved.String()
		if !seen[fullURL] {
			seen[fullURL] = true
			links = append(links, fullURL)
		}
	}

	return links, nil
}

// VisitedSet은 동시성 환경에서 URL의 방문 여부를 추적하는 스레드 안전 집합이다.
type VisitedSet struct {
	mu   sync.Mutex
	urls map[string]bool
}

func NewVisitedSet() *VisitedSet {
	return &VisitedSet{urls: make(map[string]bool)}
}

// Add는 새 URL이면 true를, 이미 방문한 URL이면 false를 반환한다.
func (v *VisitedSet) Add(u string) bool {
	v.mu.Lock()
	defer v.mu.Unlock()
	if v.urls[u] {
		return false
	}
	v.urls[u] = true
	return true
}

func (v *VisitedSet) Has(u string) bool {
	v.mu.Lock()
	defer v.mu.Unlock()
	return v.urls[u]
}

func (v *VisitedSet) Count() int {
	v.mu.Lock()
	defer v.mu.Unlock()
	return len(v.urls)
}

func (v *VisitedSet) All() []string {
	v.mu.Lock()
	defer v.mu.Unlock()
	res := make([]string, 0, len(v.urls))
	for u := range v.urls {
		res = append(res, u)
	}
	return res
}

// Fetcher는 웹 페이지를 조회하는 인터페이스다.
type Fetcher interface {
	Fetch(ctx context.Context, targetURL string) (statusCode int, body io.ReadCloser, err error)
}

// HTTPFetcher는 표준 http.Client를 감싸는 Fetcher 구현체다.
type HTTPFetcher struct {
	Client *http.Client
}

func NewHTTPFetcher(timeout time.Duration) *HTTPFetcher {
	return &HTTPFetcher{Client: &http.Client{Timeout: timeout}}
}

func (f *HTTPFetcher) Fetch(ctx context.Context, targetURL string) (int, io.ReadCloser, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", targetURL, nil)
	if err != nil {
		return 0, nil, err
	}
	resp, err := f.Client.Do(req)
	if err != nil {
		return 0, nil, err
	}
	return resp.StatusCode, resp.Body, nil
}

type Config struct {
	Workers  int
	MaxDepth int
	MaxPages int
	SameHost bool
	Timeout  time.Duration
}

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

type crawlJob struct {
	url   string
	depth int
}

// Crawl은 지정된 startURL로부터 워커 풀과 디스패처 루프를 사용해 동시 크롤링을 수행한다.
func (c *Crawler) Crawl(ctx context.Context, startURL string) ([]CrawlResult, error) {
	startParsed, err := url.Parse(startURL)
	if err != nil {
		return nil, err
	}
	if startParsed.Scheme != "http" && startParsed.Scheme != "https" {
		return nil, fmt.Errorf("invalid scheme: %s", startParsed.Scheme)
	}

	workers := c.cfg.Workers
	if workers <= 0 {
		workers = 1
	}
	maxPages := c.cfg.MaxPages
	if maxPages <= 0 {
		maxPages = 1
	}

	jobsChan := make(chan crawlJob)
	resultsChan := make(chan CrawlResult)

	var wg sync.WaitGroup
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for job := range jobsChan {
				status, body, fetchErr := c.fetcher.Fetch(ctx, job.url)
				res := CrawlResult{
					URL:        job.url,
					StatusCode: status,
					Depth:      job.depth,
					Err:        fetchErr,
				}
				if fetchErr == nil && body != nil {
					parsed, _ := url.Parse(job.url)
					links, _ := ExtractLinks(body, parsed)
					body.Close()
					res.Links = links
				}
				select {
				case resultsChan <- res:
				case <-ctx.Done():
					return
				}
			}
		}()
	}

	go func() {
		wg.Wait()
		close(resultsChan)
	}()

	queue := []crawlJob{{url: startURL, depth: 0}}
	c.visited.Add(startURL)

	var results []CrawlResult
	inFlight := 0

	for (len(queue) > 0 || inFlight > 0) && len(results) < maxPages {
		var nextJob crawlJob
		var sendChan chan crawlJob

		if len(queue) > 0 && inFlight < workers {
			nextJob = queue[0]
			sendChan = jobsChan
		}

		select {
		case <-ctx.Done():
			close(jobsChan)
			return results, ctx.Err()

		case sendChan <- nextJob:
			queue = queue[1:]
			inFlight++

		case res, ok := <-resultsChan:
			if !ok {
				inFlight = 0
				break
			}
			inFlight--
			results = append(results, res)

			if res.Err == nil && res.Depth < c.cfg.MaxDepth && len(results)+len(queue) < maxPages {
				for _, link := range res.Links {
					if c.cfg.SameHost && !isSameHost(startParsed.Host, link) {
						continue
					}
					if c.visited.Add(link) {
						queue = append(queue, crawlJob{url: link, depth: res.Depth + 1})
						if len(results)+len(queue) >= maxPages {
							break
						}
					}
				}
			}
		}
	}

	close(jobsChan)

	// 남아있는 인플라이트 작업 정리
	for inFlight > 0 {
		select {
		case res, ok := <-resultsChan:
			if !ok {
				inFlight = 0
				break
			}
			inFlight--
			if len(results) < maxPages {
				results = append(results, res)
			}
		case <-time.After(200 * time.Millisecond):
			inFlight = 0
		}
	}

	if ctx.Err() != nil {
		return results, ctx.Err()
	}

	return results, nil
}

func isSameHost(baseHost, target string) bool {
	u, err := url.Parse(target)
	if err != nil {
		return false
	}
	return strings.EqualFold(u.Host, baseHost)
}
