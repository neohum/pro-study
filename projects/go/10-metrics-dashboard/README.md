# 10. 런타임 메트릭 대시보드 서버

## 무엇을 만드는가

Go 런타임 표준 패키지 `runtime/metrics`를 활용하여 메모리 할당량, 활성 고루틴 수, GC 사이클 등을 실시간으로 수집하고, Server-Sent Events(SSE) 스트리밍 및 `html/template` 기반의 웹 대시보드로 시각화하는 모니터링 서버다.

```
$ build/app.exe
=== 10-metrics-dashboard ===
현재 Go 런타임 메트릭 스냅샷:
  - 활성 고루틴: 2개
  - 힙 객체 메모리: 342.1 KB (350312 bytes)
  - 전체 런타임 메모리: 1.2 MB (1258291 bytes)
  - GC 완료 사이클: 0회

웹 대시보드 서버 모드로 실행하려면: app.exe -serve [-addr 127.0.0.1:8080]

$ build/app.exe -serve
=== 10-metrics-dashboard 웹 서버 시작 ===
대시보드 주소: http://127.0.0.1:8080
수집 주기: 1s
서버를 종료하려면 Ctrl+C를 누르세요.
```

## 왜 이 프로젝트인가

프로덕션 Go 애플리케이션의 성능 문제를 진단할 때 가장 핵심적인 도구는 런타임 메트릭이다.

과거 `runtime.ReadMemStats`는 전역 STW(Stop-The-World)를 유발하여 고성능 서비스에서 호출하기 부담스러웠으나, Go 1.16부터 도입된 `runtime/metrics` 패키지는 STW 없이 나노초 단위로 런타임 내부 통계를 안전하고 효율적으로 읽을 수 있도록 설계되었다.

이 프로젝트에서는 `runtime/metrics`의 작동 원리를 체득하고, `net/http` 라우팅, `html/template` 렌더링, WebSocket보다 가벼운 실시간 단방향 스트리밍 기술인 Server-Sent Events(SSE), 그리고 동시성 안전한 시계열 링 버퍼를 결합해 완전한 관측성(Observability) 도구를 제작한다.

## 핵심 개념

### runtime/metrics API

`runtime/metrics`는 계층화된 문자열 경로(`Name`)로 원하는 메트릭을 샘플 배열에 지정한 뒤, `metrics.Read`로 한 번에 효율적으로 추출한다.

```go
import "runtime/metrics"

samples := []metrics.Sample{
    {Name: "/sched/goroutines:goroutines"},
    {Name: "/memory/classes/heap/objects:bytes"},
}
metrics.Read(samples)
goroutines := samples[0].Value.Uint64()
```

### Server-Sent Events (SSE)

SSE는 클라이언트의 추가 요청 없이 서버가 HTTP 연결(`text/event-stream`)을 유지한 채 데이터를 지속적으로 밀어주는 표준 웹 기술이다. `http.Flusher`를 사용하여 버퍼링 없이 즉시 패킷을 방출한다.

```go
w.Header().Set("Content-Type", "text/event-stream")
w.Header().Set("Cache-Control", "no-cache")
w.Header().Set("Connection", "keep-alive")

flusher := w.(http.Flusher)
fmt.Fprintf(w, "data: %s\n\n", jsonData)
flusher.Flush()
```

### 동시성 안전 시계열 링 버퍼

웹 대시보드는 최근 N개의 메트릭 히스토리를 필요로 한다. 무한히 메모리가 증가하는 슬라이스 대신 고정 크기의 링 버퍼(Ring Buffer)와 `sync.RWMutex`를 사용하여 O(1) 삽입과 동시 읽기를 보장한다.

```go
type RingBuffer struct {
    mu       sync.RWMutex
    capacity int
    items    []Snapshot
}
```

### net/http ServeMux 라우팅과 html/template

Go 1.22+의 새로운 HTTP 라우팅 패턴(`GET /api/metrics`, `POST /api/workload`)과 표준 `html/template`을 활용하여 정적 자산과 동적 데이터를 단일 실행 파일 바이너리로 서빙한다.

```go
mux.HandleFunc("GET /", handleDashboard)
mux.HandleFunc("GET /api/metrics", handleMetricsAPI)
mux.HandleFunc("GET /api/stream", hub.ServeHTTP)
```

## 단계별 구현

각 단계는 `starter/` 폴더 내 소스코드의 `TODO(step-N)` 주석과 1:1로 일치한다.

### Step 1: runtime/metrics 수집기와 링 버퍼

`collector.go`에서 `Snapshot`과 `RingBuffer` 구조체를 정의하고, `runtime/metrics` API를 이용해 활성 고루틴, 힙 메모리, 전체 메모리, GC 사이클을 수집하는 `Collector.Collect` 및 `Record`를 구현한다.

확인: `Record()`를 호출했을 때 0이 아닌 유효한 고루틴 수와 메모리 크기가 반환되는지 확인한다.

### Step 2: Server-Sent Events 브로드캐스터

`sse.go`에서 다수의 브라우저 클라이언트 연결을 스레드 안전하게 관리하고 채널을 통해 메트릭 JSON을 실시간 전송하는 `SSEHub`와 `ServeHTTP` 핸들러를 구현한다.

확인: `curl -N http://localhost:8080/api/stream` 명령으로 주기적인 메트릭 이벤트가 스트리밍되는지 확인한다.

### Step 3: html/template 대시보드 템플릿

`template.go`에서 대시보드 UI를 구성하고 `FormatBytes` 헬퍼 함수를 통해 바이트 단위를 사람이 읽기 쉬운 KB/MB 단위로 변환해 HTML에 렌더링하는 `RenderDashboard`를 작성한다.

확인: 템플릿 렌더링 결과에 고루틴과 메모리 수치가 정상적으로 삽입되는지 확인한다.

### Step 4: HTTP 라우터와 REST API

`server.go`에서 `GET /`, `GET /api/metrics`, `GET /api/stream`, `POST /api/workload` 라우트를 등록하고, 메모리 할당 부하를 발생시켜 실시간 차트의 변동을 관찰할 수 있는 부하 시뮬레이터를 연동한다.

확인: `/api/metrics` 호출 시 최신 스냅샷과 히스토리가 담긴 JSON이 응답되는지 확인한다.

### Step 5: 서버 기동과 CLI 연동

`main.go`에서 `-serve`, `-addr`, `-interval`, `-once` 플래그를 처리하고 백그라운드 틱커 고루틴으로 주기적 메트릭 수집 및 브로드캐스트 루프를 가동한다.

확인: 플래그 없이 실행하면 1회 콘솔 요약이 출력되고, `-serve` 옵션 실행 시 웹 브라우저에서 실시간 대시보드가 열리는지 확인한다.

## 막혔을 때

| 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| `metrics.Read` 호출 후 모든 값이 0으로 나옴 | 메트릭 이름 문자열 끝의 타입 접미사(예: `:bytes`, `:goroutines`)가 누락됨 | 지원 메트릭 경로를 정확히 지정한다 |
| 브라우저에서 SSE 스트림이 실시간으로 갱신되지 않음 | HTTP 응답 후 `flusher.Flush()`가 호출되지 않아 버퍼에 머물러 있음 | 각 데이터 전송마다 `flusher.Flush()`를 호출한다 |
| SSE 연결 시 브라우저 콘솔에 CORS 에러 표시 | `Access-Control-Allow-Origin: *` 헤더 누락 | SSE 핸들러 헤더에 CORS 허용 설정을 추가한다 |
| 장시간 실행 시 메모리가 끝없이 증가함 | 링 버퍼에 최대 개수 제한이 없거나 슬라이스 누수 발생 | 고정된 `capacity` 이상의 데이터는 슬라이딩 윈도우로 제거한다 |

## 더 나아가기

- Chart.js 또는 SVG 기반 시계열 꺾은선 그래프(Line Chart)를 대시보드에 추가하기
- CPU 프로파일링(`/debug/pprof`) 엔드포인트 연동하기
- 메트릭 임계치(예: 고루틴 1000개 초과, 힙 메모리 급증) 감지 시 알림 이벤트 발행하기

## 참고

- The Go Blog: A Proposal for a New Metrics API (<https://go.dev/blog/metrics>)
- Go 표준 라이브러리: `runtime/metrics` 패키지 (<https://pkg.go.dev/runtime/metrics>)
- MDN Web Docs: Server-sent events (<https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events>)
