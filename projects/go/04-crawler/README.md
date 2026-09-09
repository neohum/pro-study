# 04. 동시 링크 크롤러

## 무엇을 만드는가

지정된 시작 URL에서 출발하여 HTML 문서 내의 링크를 추출하고, 지정된 동시성 수준(Worker 수)과 최대 탐색 깊이(MaxDepth), 최대 페이지 수(MaxPages) 제한 내에서 웹 페이지를 동시 탐색하는 웹 크롤러 CLI 도구다.

```
$ build/app.exe -workers 3 -depth 2 -max-pages 10 http://127.0.0.1:8080
[200] http://127.0.0.1:8080 (links: 3, depth: 0)
[200] http://127.0.0.1:8080/docs (links: 2, depth: 1)
[200] http://127.0.0.1:8080/blog (links: 5, depth: 1)
[200] http://127.0.0.1:8080/about (links: 1, depth: 1)
[200] http://127.0.0.1:8080/docs/guide (links: 0, depth: 2)

=== 크롤링 완료 요약 ===
총 수집 페이지: 5
발견된 고유 링크: 8
소요 시간: 120ms
```

## 왜 이 프로젝트인가

Go 언어의 가장 강력한 무기는 고루틴(Goroutine)과 채널(Channel)을 기반으로 하는 경량 동시성 모델이다. 그러나 동시성 프로그래밍은 교착 상태(Deadlock), 경쟁 상태(Race Condition), 고루틴 누수(Goroutine Leak) 등의 위험을 수반한다.

이 프로젝트에서는 워커 풀(Worker Pool) 패턴과 디스패처 이벤트 루프를 통해 안전하게 작업을 분배하고, `sync.Mutex`로 방문 URL 집합의 동시성 안전을 보장하며, `context.WithTimeout`을 통한 작업 수명주기 취소/타임아웃 제어, 그리고 `net/http/httptest`를 이용해 외부 네트워크 의존성 없는 격리된 단위/통합 테스트를 작성하는 실무 동시성 기법을 체득한다.

## 핵심 개념

### Worker Pool 패턴과 디스패처

무제한으로 고루틴을 띄우면 시스템 리소스(소켓, 메모리)가 고갈된다. 고정된 수(`Config.Workers`)의 워커 고루틴을 실행하고, 작업 채널(`jobs`)과 결과 채널(`results`)을 두어 제어된 동시성을 유지한다. 디스패처 루프에서 `select` 문으로 새로운 작업 할당과 수집 결과 처리를 단일 루프에서 조율하면 데드락 없이 안정적으로 동작한다.

```go
for i := 0; i < cfg.Workers; i++ {
    go func() {
        for job := range jobs {
            res := crawlOne(ctx, job)
            results <- res
        }
    }()
}
```

### sync.Mutex와 방문 URL 중복 방지

여러 워커가 동시에 새로운 링크를 발견할 때 동일한 URL을 중복 방문하거나 순환 참조(A -> B -> A)에 빠지지 않도록 `sync.Mutex`로 보호된 `VisitedSet`을 구성한다. `Add` 메서드가 원자적으로 "이미 존재하는지 확인 후 없으면 추가"하여 불필요한 네트워크 요청을 차단한다.

```go
type VisitedSet struct {
    mu   sync.Mutex
    urls map[string]bool
}

func (v *VisitedSet) Add(u string) bool {
    v.mu.Lock()
    defer v.mu.Unlock()
    if v.urls[u] {
        return false
    }
    v.urls[u] = true
    return true
}
```

### context.WithTimeout과 수명주기 제어

네트워크 요청이 무한히 지연되거나 사용자가 취소했을 때 모든 워커가 즉시 작업을 정리하고 종료해야 한다. `context.Context`를 `http.NewRequestWithContext`에 주입하면 타임아웃 도달 시 진행 중인 HTTP 연결이 즉시 닫힌다.

```go
ctx, cancel := context.WithTimeout(context.Background(), timeout)
defer cancel()

req, err := http.NewRequestWithContext(ctx, "GET", targetURL, nil)
```

### net/http/httptest를 활용한 오프라인 검증

외부 실제 웹 사이트를 대상으로 테스트하면 네트워크 단절, 사이트 변경, 외부 서버 과부하 등의 문제가 발생한다. `httptest.NewServer`를 사용하면 테스트 실행 중 로컬 메모리 HTTP 서버를 띄워 다양한 HTML 응답(상대 경로, 순환 참조, 지연 응답 등)을 완벽하게 재현할 수 있다.

```go
ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, `<a href="/sub">Subpage</a>`)
}))
defer ts.Close()
```

## 단계별 구현

`starter/crawler.go`와 `starter/main.go`의 `TODO(step-N)` 주석이 아래 단계와 1:1이다.

### Step 1: HTML 링크 추출과 URL 정규화

`ExtractLinks(body io.Reader, baseURL *url.URL) ([]string, error)` 함수를 작성한다.
- 정규식을 이용해 `<a ... href="...">` 태그의 속성값을 추출한다.
- `baseURL.ResolveReference`를 사용해 상대 경로(`/about` 등)를 절대 URL로 변환한다.
- 프래그먼트(`#section` 등)를 제거하고 `http`/`https` 스킴만 유지한다.
- 중복된 링크를 필터링하여 반환한다.

확인: `go test -run TestExtractLinks ./...`

### Step 2: 스레드 안전한 방문 관리

`VisitedSet` 구조체와 메서드를 작성한다.
- `sync.Mutex`와 `map[string]bool`을 사용한다.
- `Add(u string) bool`: 아직 방문하지 않은 URL이면 등록 후 true, 이미 등록되었으면 false를 반환한다.
- `Has(u string) bool`, `Count() int`, `All() []string` 메서드를 구현한다.

확인: `go test -run TestVisitedSet ./...`

### Step 3: HTTP 요청과 Fetcher 추상화

`Fetcher` 인터페이스와 `HTTPFetcher` 구조체를 구현한다.
- `Fetch(ctx context.Context, targetURL string) (statusCode int, body io.ReadCloser, err error)`
- `http.NewRequestWithContext(ctx, "GET", targetURL, nil)`를 사용해 타임아웃 취소가 연동되도록 한다.
- 응답 상태 코드와 본문(`io.ReadCloser`)을 반환한다.

확인: `go test -run TestHTTPFetcher ./...`

### Step 4: Worker Pool 동시성 크롤링 엔진

`Crawler` 구조체와 `Crawl(ctx context.Context, startURL string) ([]CrawlResult, error)` 메서드를 작성한다.
- 지정된 `Config.Workers` 수만큼 워커 고루틴을 실행한다.
- 매니저 디스패처 루프에서 작업 큐(`queue`)와 인플라이트(`inFlight`) 작업을 `select` 문으로 관리한다.
- `Config.MaxDepth`, `Config.MaxPages`, `Config.SameHost` 제약을 준수하며, `ctx.Done()` 발생 시 즉시 중단한다.
- 모든 수집 결과를 슬라이스에 담아 반환한다.

확인: `go test -run TestCrawler ./...`

### Step 5: CLI 플래그 및 결과 리포트

`run(args []string, stdin io.Reader, stdout, stderr io.Writer) int` 함수를 작성한다.
- `flag.NewFlagSet`으로 `-workers`(기본 4), `-depth`(기본 2), `-max-pages`(기본 20), `-same-host`(기본 true), `-timeout`(기본 10s) 플래그를 처리한다.
- 대상 URL 인자를 검증하고 `Crawl`을 실행하여 페이지별 상태와 최종 통계를 `stdout`에 출력한다.
- 정상 완료 시 0, 크롤링 실패 시 1, 인자 오류 시 2를 반환한다.

확인: `go test -run TestRun ./...`

## 막혔을 때

| 증상 | 원인 |
| --- | --- |
| 크롤러가 무한 루프에 빠지거나 끝나지 않음 | 링크 간 상호 참조(A -> B -> A)가 발생했을 때 `VisitedSet` 검증이 누락되었거나 `depth` 증가 처리가 되지 않았다 |
| 채널 전송 중 데드락 (`fatal error: all goroutines are asleep - deadlock!`) | 워커가 작업 채널과 결과 채널을 동시에 대기하거나, 큐가 가득 찬 상태에서 버퍼 없는 채널로 전송을 시도했다 |
| `go test -race` 실행 시 데이터 레이스 경고 | `VisitedSet`이나 `queue`, 카운터 변수를 고루틴 간 락 없이 직접 읽고 썼다 |
| 상대 경로 링크가 깨지거나 잘못된 URL로 해석됨 | `url.Parse` 후 `baseURL.ResolveReference`를 거치지 않고 단순 문자열 결합을 수행했다 |

## 더 나아가기

- `robots.txt`를 파싱하여 크롤링 차단 경로를 준수하는 정책 준수 기능
- 웹 페이지 제목(`<title>`) 및 메타 설명(meta description) 추출 기능 추가
- 수집된 웹 그래프(URL 간 연결 관계)를 Graphviz DOT 형식이나 JSON으로 저장

## 참고

- Go Blog: Pipelines and cancellation (<https://go.dev/blog/pipelines>)
- Go 표준 라이브러리: `sync.Mutex` (<https://pkg.go.dev/sync#Mutex>)
- Go 표준 라이브러리: `net/http/httptest` (<https://pkg.go.dev/net/http/httptest>)
- Go 표준 라이브러리: `context` (<https://pkg.go.dev/context>)
