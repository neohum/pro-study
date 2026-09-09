# 05. 메모 REST API

## 무엇을 만드는가

외부 웹 프레임워크(Gin, Echo 등) 없이 Go 1.22+ 표준 라이브러리 `net/http`만을 활용하여 구현하는 경량 RESTful 메모 API 서버다.

```
$ curl -X POST http://localhost:8080/memos -d '{"title":"장보기","content":"우유, 계란"}'
{"id":1,"title":"장보기","content":"우유, 계란","created_at":"2026-09-10T09:00:00Z","updated_at":"2026-09-10T09:00:00Z"}

$ curl http://localhost:8080/memos/1
{"id":1,"title":"장보기","content":"우유, 계란","created_at":"2026-09-10T09:00:00Z","updated_at":"2026-09-10T09:00:00Z"}

$ curl -X PUT http://localhost:8080/memos/1 -d '{"title":"장보기 목록","content":"우유, 계란, 빵"}'
{"id":1,"title":"장보기 목록","content":"우유, 계란, 빵","created_at":"2026-09-10T09:00:00Z","updated_at":"2026-09-10T09:01:00Z"}

$ curl -X DELETE http://localhost:8080/memos/1
(204 No Content)
```

## 왜 이 프로젝트인가

Go 1.22 이전에는 표준 라이브러리 `http.ServeMux`의 기능이 빈약하여 HTTP 메서드 구분이나 와일드카드 경로 파싱을 위해 서드파티 라우터가 필수적이었습니다.
하지만 Go 1.22부터 `"GET /memos/{id}"`와 같은 패턴 라우팅과 `r.PathValue("id")`가 기본 제공되면서, 외부 의존성 전혀 없이도 현대적이고 안정적인 마이크로서비스를 구축할 수 있게 되었습니다.

이 프로젝트는 `net/http`의 최신 라우팅 기법, 표준 미들웨어 체이닝 패턴, 동시 요청을 처리하기 위한 `sync.RWMutex`, 그리고 `net/http/httptest`를 활용한 실제 HTTP 단위 테스트 기법을 익힙니다.

## 핵심 개념

### Go 1.22+ 메서드 & 패턴 라우팅

`http.NewServeMux()`에 메서드와 경로 패턴을 공백으로 구분해 등록할 수 있습니다. 중괄호 `{param}`로 지정된 매개변수는 `r.PathValue("param")`로 읽어옵니다.

```go
mux := http.NewServeMux()
mux.HandleFunc("GET /memos/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    // ...
})
```

### JSON 인코딩 및 응답 헬퍼

API 서버에서 일관된 JSON 응답과 HTTP 상태 코드를 전송하기 위해 헬퍼 함수를 정의하는 것이 관례입니다.

```go
func respondJSON(w http.ResponseWriter, status int, data any) {
    w.Header().Set("Content-Type", "application/json; charset=utf-8")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}
```

### HTTP 미들웨어 체이닝

미들웨어는 `http.Handler`를 인자로 받아 새로운 `http.Handler`를 반환하는 함수입니다. 요청 전후에 로깅을 수행하거나 패닉을 안전하게 포획(recover)합니다.

```go
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s (%v)", r.Method, r.URL.Path, time.Since(start))
    })
}
```

## 단계별 구현

### Step 1: 메모 모델과 동시성 안전 저장소

`Memo` 구조체와 `Store` 구조체를 정의합니다. 메모 목록을 보관하는 슬라이스 또는 맵을 `sync.RWMutex`로 보호하여 다중 고루틴 환경에서도 안전하게 `Create`, `Get`, `List`, `Update`, `Delete`를 수행할 수 있게 만듭니다.

확인: 저장소의 추가, 조회, 수정, 삭제 메서드가 정상 작동하는지 확인합니다.

### Step 2: RESTful CRUD 핸들러와 JSON 헬퍼

`Handler` 구조체에 `Store`를 주입하고, `respondJSON` 및 `respondError` 유틸리티를 작성합니다. 각 요청(목록 조회, 생성, 상세 조회, 수정, 삭제)에 맞게 요청 바디를 디코딩하고 검증하며 올바른 HTTP 상태 코드(200, 201, 204, 400, 404)를 반환합니다.

확인: 잘못된 JSON이나 빈 제목 입력 시 400 Bad Request가 반환되는지 확인합니다.

### Step 3: Go 1.22+ ServeMux 라우팅 등록

`NewRouter` 함수에서 `http.NewServeMux()`를 생성하고 `"GET /memos"`, `"POST /memos"`, `"GET /memos/{id}"`, `"PUT /memos/{id}"`, `"DELETE /memos/{id}"`를 핸들러 메서드와 연결합니다. 경로 매개변수 `{id}`를 정수로 파싱합니다.

확인: `r.PathValue("id")`를 통해 URL 경로의 id 값이 올바르게 추출되는지 확인합니다.

### Step 4: 로깅 및 패닉 복구 미들웨어

`ResponseWriter`를 래핑한 `statusRecorder`를 작성하여 응답 HTTP 상태 코드를 가로채고, 요청 메서드·경로·상태코드·처리시간을 기록하는 `LoggingMiddleware`를 구현합니다. 또한 예기치 못한 핸들러 패닉 시 500 응답을 내보내는 `RecoverMiddleware`를 구현합니다.

확인: 핸들러 내부에서 패닉이 발생해도 프로세스가 죽지 않고 500 에러를 반환하는지 확인합니다.

### Step 5: 서버 구성과 메인 진입점

명령줄 플래그(`-addr`, 기본값 `":8080"`)를 파싱하여 HTTP 서버를 초기화하고 실행하는 `run` 함수와 `main` 진입점을 작성합니다.

확인: `go run .` 실행 시 포트 8080에서 서버가 정상 기동하는지 확인합니다.

## 막혔을 때

| 증상 | 원인 |
| --- | --- |
| `r.PathValue("id")`가 빈 문자열을 반환함 | 라우트 등록 시 `GET /memos/{id}`처럼 `{id}` 패턴을 정확히 쓰지 않았거나 Go 1.22 미만 버전 사용 |
| 슬라이스가 비어 있을 때 JSON 결과가 `null`로 나옴 | 슬라이스가 `nil`인 상태에서 직렬화됨. `make([]Memo, 0)`으로 초기화 필요 |
| `WriteHeader`를 호출한 뒤 헤더를 설정해도 반영되지 않음 | `WriteHeader`가 호출되는 순간 헤더 버퍼가 전송되므로 헤더 설정(`Set`)을 먼저 해야 함 |
| `DELETE` 요청에서 204 대신 200이 반환됨 | `w.WriteHeader(http.StatusNoContent)` 호출이 누락되었거나 바디 작성 함수가 먼저 실행됨 |

## 더 나아가기

- 제목 또는 내용 검색 쿼리 파라미터(`GET /memos?q=검색어`) 지원
- 페이지네이션(`GET /memos?limit=10&offset=0`) 구현
- `context.WithTimeout`을 통한 요청별 타임아웃 미들웨어 추가

## 참고

- Go 공식 문서: net/http ServeMux 라우팅 향상 (<https://go.dev/blog/routing-enhancements>)
- Go 표준 라이브러리: net/http (<https://pkg.go.dev/net/http>)
- Go 표준 라이브러리: net/http/httptest (<https://pkg.go.dev/net/http/httptest>)
