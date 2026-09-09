package main

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"sync"
	"testing"
	"time"
)

// ---- Step 1: ExtractLinks 테스트 ----

func TestExtractLinks(t *testing.T) {
	baseURL, _ := url.Parse("http://example.com/blog/index.html")

	html := `
<!DOCTYPE html>
<html>
<body>
  <a href="/about">About Us</a>
  <a href="post1.html">Post 1</a>
  <a href="http://example.com/contact">Contact</a>
  <a href="https://other.com/page">External</a>
  <a href="#section1">Anchor</a>
  <a href="javascript:void(0)">JS</a>
  <a href="mailto:admin@example.com">Email</a>
  <a href="/about">Duplicate About</a>
</body>
</html>
`

	links, err := ExtractLinks(strings.NewReader(html), baseURL)
	if err != nil {
		t.Fatalf("ExtractLinks failed: %v", err)
	}

	expected := []string{
		"http://example.com/about",
		"http://example.com/blog/post1.html",
		"http://example.com/contact",
		"https://other.com/page",
	}

	if len(links) != len(expected) {
		t.Fatalf("len(links) = %d; want %d (%v)", len(links), len(expected), links)
	}

	for i, want := range expected {
		if links[i] != want {
			t.Errorf("links[%d] = %q; want %q", i, links[i], want)
		}
	}
}

// ---- Step 2: VisitedSet 동시성 테스트 ----

func TestVisitedSet_Concurrency(t *testing.T) {
	v := NewVisitedSet()
	const goroutines = 20
	const itemsPerGoroutine = 50

	var wg sync.WaitGroup
	wg.Add(goroutines)

	for g := 0; g < goroutines; g++ {
		go func(gid int) {
			defer wg.Done()
			for i := 0; i < itemsPerGoroutine; i++ {
				// 일부 중복되는 URL 생성
				u := fmt.Sprintf("http://example.com/page/%d", i)
				v.Add(u)
				v.Has(u)
			}
		}(g)
	}

	wg.Wait()

	if v.Count() != itemsPerGoroutine {
		t.Errorf("v.Count() = %d; want %d", v.Count(), itemsPerGoroutine)
	}
}

// ---- Step 3: HTTPFetcher 로컬 서버 테스트 ----

func TestHTTPFetcher_LocalServer(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, "Hello Gopher")
	}))
	defer ts.Close()

	fetcher := NewHTTPFetcher(2 * time.Second)
	status, body, err := fetcher.Fetch(context.Background(), ts.URL)
	if err != nil {
		t.Fatalf("Fetch failed: %v", err)
	}
	defer body.Close()

	if status != http.StatusOK {
		t.Errorf("status = %d; want 200", status)
	}
}

// ---- Step 4: Crawler 동시 크롤링 및 순환 방지 테스트 ----

func TestCrawler_LocalServer(t *testing.T) {
	var ts *httptest.Server
	ts = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		switch r.URL.Path {
		case "/":
			fmt.Fprintf(w, `<a href="%s/page1">1</a> <a href="%s/page2">2</a>`, ts.URL, ts.URL)
		case "/page1":
			// page2로의 링크 및 루트(/)로의 역참조(순환 테스트)
			fmt.Fprintf(w, `<a href="%s/page2">2</a> <a href="%s/">root</a> <a href="%s/page3">3</a>`, ts.URL, ts.URL, ts.URL)
		case "/page2":
			// 루트(/)로의 순환
			fmt.Fprintf(w, `<a href="%s/">root</a>`, ts.URL)
		case "/page3":
			// 자식 없음
			fmt.Fprint(w, `end of line`)
		default:
			http.NotFound(w, r)
		}
	}))
	defer ts.Close()

	cfg := Config{
		Workers:  3,
		MaxDepth: 3,
		MaxPages: 10,
		SameHost: true,
		Timeout:  5 * time.Second,
	}

	crawler := NewCrawler(cfg, NewHTTPFetcher(2*time.Second))
	results, err := crawler.Crawl(context.Background(), ts.URL+"/")
	if err != nil {
		t.Fatalf("Crawl failed: %v", err)
	}

	// 4개 페이지(/, /page1, /page2, /page3)가 모두 수집되어야 함
	if len(results) != 4 {
		t.Errorf("len(results) = %d; want 4", len(results))
	}

	for _, r := range results {
		if r.StatusCode != http.StatusOK {
			t.Errorf("page %s status = %d; want 200", r.URL, r.StatusCode)
		}
	}
}

func TestCrawler_MaxPages(t *testing.T) {
	var ts *httptest.Server
	ts = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		// 매 페이지마다 끝없이 새 링크 생성
		fmt.Fprintf(w, `<a href="%s/next1">1</a> <a href="%s/next2">2</a> <a href="%s/next3">3</a>`, ts.URL, ts.URL, ts.URL)
	}))
	defer ts.Close()

	cfg := Config{
		Workers:  2,
		MaxDepth: 5,
		MaxPages: 3, // 최대 3페이지만
		SameHost: true,
		Timeout:  3 * time.Second,
	}

	crawler := NewCrawler(cfg, NewHTTPFetcher(2*time.Second))
	results, err := crawler.Crawl(context.Background(), ts.URL)
	if err != nil {
		t.Fatalf("Crawl failed: %v", err)
	}

	if len(results) > 3 {
		t.Errorf("results count = %d; want <= 3", len(results))
	}
}

func TestCrawler_MaxDepth(t *testing.T) {
	var ts *httptest.Server
	ts = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		switch r.URL.Path {
		case "/":
			fmt.Fprintf(w, `<a href="%s/depth1">D1</a>`, ts.URL)
		case "/depth1":
			fmt.Fprintf(w, `<a href="%s/depth2">D2</a>`, ts.URL)
		case "/depth2":
			fmt.Fprintf(w, `<a href="%s/depth3">D3</a>`, ts.URL)
		}
	}))
	defer ts.Close()

	cfg := Config{
		Workers:  1,
		MaxDepth: 1, // depth 1까지만
		MaxPages: 10,
		SameHost: true,
		Timeout:  3 * time.Second,
	}

	crawler := NewCrawler(cfg, NewHTTPFetcher(2*time.Second))
	results, err := crawler.Crawl(context.Background(), ts.URL)
	if err != nil {
		t.Fatalf("Crawl failed: %v", err)
	}

	// depth 0(/)과 depth 1(/depth1)만 수집되어야 함
	if len(results) != 2 {
		t.Errorf("results count = %d; want 2 (depth 0 and 1)", len(results))
	}
	for _, r := range results {
		if r.Depth > 1 {
			t.Errorf("collected page %s with depth %d > 1", r.URL, r.Depth)
		}
	}
}

func TestCrawler_Timeout(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(300 * time.Millisecond)
		w.WriteHeader(http.StatusOK)
	}))
	defer ts.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()

	cfg := Config{
		Workers:  1,
		MaxDepth: 1,
		MaxPages: 5,
		SameHost: true,
		Timeout:  50 * time.Millisecond,
	}

	crawler := NewCrawler(cfg, NewHTTPFetcher(50*time.Millisecond))
	results, err := crawler.Crawl(ctx, ts.URL)
	if err == nil && (len(results) == 0 || results[0].Err == nil) {
		t.Error("expected error on timeout, got nil")
	}
}

// ---- Step 5: run CLI 테스트 ----

func TestRun_CLI(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		fmt.Fprint(w, `<p>No links</p>`)
	}))
	defer ts.Close()

	var stdout, stderr bytes.Buffer
	code := run([]string{"-workers", "2", "-max-pages", "5", ts.URL}, nil, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("run failed with code %d: %s", code, stderr.String())
	}

	out := stdout.String()
	if !strings.Contains(out, "총 수집 페이지: 1") {
		t.Errorf("expected summary in output: %s", out)
	}
}

func TestRun_NoURL(t *testing.T) {
	var stdout, stderr bytes.Buffer
	code := run([]string{}, nil, &stdout, &stderr)
	if code != 2 {
		t.Errorf("run with no args code = %d; want 2", code)
	}
}

func TestRun_InvalidFlag(t *testing.T) {
	var stdout, stderr bytes.Buffer
	code := run([]string{"-bad-flag"}, nil, &stdout, &stderr)
	if code != 2 {
		t.Errorf("run with bad flag code = %d; want 2", code)
	}
}
