# 03. 웹 서버 로그 파서

## 무엇을 만드는가

Apache 및 Nginx의 표준 웹 서버 액세스 로그(Common Log Format)를 읽고 파싱하여 상태 코드별, HTTP 메서드별, 상위 요청 경로별 통계를 템플릿 기반 리포트로 생성하는 CLI 도구다.

```
$ build/app.exe access.log
=== 웹 서버 로그 분석 리포트 ===
총 요청 수: 15 (오류 라인: 1)
총 전송량: 45210 바이트

[상태 코드]
  200: 10
  401: 2
  404: 2
  500: 1

[HTTP 메서드]
  GET: 12
  POST: 3

[상위 경로]
  /index.html: 6
  /api/v1/users: 4
  /images/logo.png: 3
  /login: 2
```

## 왜 이 프로젝트인가

서버 모니터링, 로그 감사, 데이터 파이프라인 구축 등 실무 백엔드 개발에서 비정형 또는 반정형 텍스트를 구조화된 데이터 모델로 변환하는 일은 빈번하다.

이 프로젝트는 Go의 강력한 에러 처리 메커니즘인 커스텀 에러 구조체와 `Unwrap()` 메서드를 활용한 에러 래핑(`errors.Is`, `errors.As`), `io.Reader` 기반의 스트림 파이프라인 설계, Go 표준 `text/template` 패키지를 통한 리포트 서식 렌더링을 심도 있게 다룬다.

## 핵심 개념

### 커스텀 에러 구조체와 Unwrap()

Go 1.13부터 `Unwrap() error` 메서드를 구현한 타입은 상위 에러의 원인 에러를 노출할 수 있다. 줄 번호와 원본 텍스트를 담는 `ParseError`를 정의하고 `Unwrap()`을 제공하면, 호출자는 `errors.Is(err, ErrInvalidFormat)`로 에러 종류를 식별하면서도 `errors.As(err, &target)`로 실패한 줄 번호를 추출할 수 있다.

```go
type ParseError struct {
    LineNum int
    Line    string
    Err     error
}

func (e *ParseError) Error() string {
    return fmt.Sprintf("line %d: %v: %q", e.LineNum, e.Err, e.Line)
}

func (e *ParseError) Unwrap() error {
    return e.Err
}
```

### 정규식 컴파일과 그룹 캡처

로그 라인의 각 필드(IP, 타임스탬프, 메서드, 경로, 프로토콜, 상태 코드, 바이트 수)를 추출할 때 `regexp.MustCompile`을 패키지 수준에서 1회만 초기화하여 컴파일 오버헤드를 없앤다. `FindStringSubmatch`는 캡처 그룹을 문자열 슬라이스로 반환한다.

```go
var logRegex = regexp.MustCompile(
    `^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)\s+(\S+)"\s+(\d{3})\s+(\S+)$`,
)
```

### io.Reader 스트림 파이프라인

`os.File`뿐 아니라 `strings.Reader`, 네트워크 소켓 등 모든 입력 원천을 `io.Reader` 추상 인터페이스로 받아들이면 테스트 시 임시 파일을 생성하지 않고도 메모리 버퍼로 손쉽게 테스트할 수 있다.

```go
func ParseReader(r io.Reader, ignoreErrors bool) ([]LogEntry, []error, error) {
    scanner := bufio.NewScanner(r)
    for scanner.Scan() {
        // 한 줄씩 파싱
    }
    return entries, parseErrors, scanner.Err()
}
```

### text/template을 이용한 리포트 생성

`text/template`은 Go 구조체나 맵의 데이터를 텍스트 템플릿에 주입하여 포맷팅된 결과물을 만든다. 반복문(`{{range}}`)과 조건문(`{{if}}`)을 지원하여 서식 변경에 유연하게 대응할 수 있다.

```go
tmpl, err := template.New("report").Parse(reportTemplate)
if err != nil {
    return err
}
return tmpl.Execute(w, summary)
```

## 단계별 구현

`starter/parser.go`와 `starter/main.go`의 `TODO(step-N)` 주석이 아래 단계와 1:1이다.

### Step 1: 커스텀 에러와 한 줄 파싱

`ParseError` 구조체와 `ParseLine(line string, lineNum int) (LogEntry, error)`를 작성한다.
- `ErrInvalidFormat`, `ErrInvalidStatus` 센티널 에러를 정의한다.
- `ParseError`에 `Error()`, `Unwrap()` 메서드를 구현한다.
- 정규식으로 한 줄을 매칭하고, 타임스탬프(`"02/Jan/2006:15:04:05 -0700"`)와 상태 코드(100~599), 전송 바이트(`"-"`는 0)를 파싱한다.
- 형식 불일치 시 `&ParseError{lineNum, line, ErrInvalidFormat}`, 상태 코드 오류 시 `&ParseError{lineNum, line, ErrInvalidStatus}`를 반환한다.

확인: `go test -run TestParseLine ./...`

### Step 2: io.Reader 파이프라인과 스트림 파싱

`ParseReader(r io.Reader, ignoreErrors bool) ([]LogEntry, []error, error)` 함수를 구현한다.
- `bufio.NewScanner(r)`로 줄 단위로 읽고 빈 줄은 건너뛴다.
- `ParseLine`을 호출하여 정상 항목은 `[]LogEntry`에 추가한다.
- 에러 발생 시 `[]error`에 추가하며, `ignoreErrors`가 거짓이면 즉시 파싱을 중단하고 반환한다. 참이면 에러를 기록하고 다음 줄로 계속 진행한다.

확인: `go test -run TestParseReader ./...`

### Step 3: 통계 요약과 다중 기준 정렬

`Summarize(entries []LogEntry, errorCount int) Summary` 함수를 구현한다.
- 총 요청 수, 오류 라인 수, 총 전송 바이트를 합산한다.
- 상태 코드별 빈도를 오름차순(`Code asc`)으로 정렬하여 `Statuses`에 담는다.
- HTTP 메서드별 빈도를 알파벳순(`Method asc`)으로 정렬하여 `Methods`에 담는다.
- 경로별 빈도를 빈도 내림차순(`Count desc`), 동점 시 경로 오름차순(`Path asc`)으로 정렬하여 `TopPaths`에 담는다.

확인: `go test -run TestSummarize ./...`

### Step 4: text/template 리포트 렌더링

`RenderReport(w io.Writer, summary Summary, topN int) error` 함수를 구현한다.
- `topN > 0 && topN < len(summary.TopPaths)`인 경우 상위 `topN`개 경로만 잘라낸다.
- `text/template`을 파싱하고 `summary`를 전달하여 `w`에 리포트를 렌더링한다.

확인: `go test -run TestRenderReport ./...`

### Step 5: CLI 플래그 및 실행 결합

`run(args []string, stdin io.Reader, stdout, stderr io.Writer) int` 함수를 완성한다.
- `flag.NewFlagSet`으로 `-top`(기본 5), `-ignore-errors`(기본 true) 플래그를 처리한다.
- 인자가 없거나 `"-"`이면 `stdin`을, 파일명이 주어지면 해당 파일들을 순회 파싱한다.
- `Summarize`와 `RenderReport`를 거쳐 `stdout`에 출력한다.
- 정상 시 0, 파일 읽기 오류 시 1, 플래그 오류 시 2를 반환한다.

확인: `go test -run TestRun ./...`

## 막혔을 때

| 증상 | 원인 |
| --- | --- |
| `errors.Is`가 참을 반환하지 않음 | 커스텀 에러 구조체에 `Unwrap() error` 메서드가 구현되지 않았거나 값 리시버/포인터 리시버가 불일치한다 |
| 타임스탬프 파싱 실패 (`time.Parse`) | Go는 표준 기준시각(`Mon Jan 2 15:04:05 MST 2006`) 레이아웃을 사용해야 한다. CLF 형식은 `"02/Jan/2006:15:04:05 -0700"`이다 |
| 템플릿 실행 시 패닉 또는 런타임 에러 | 템플릿 내 필드명 대소문자가 구조체의 Exported 필드(`TotalRequests` 등)와 일치해야 한다 |
| 바이트 수가 `-`인 줄에서 파싱 오류 | HTTP 304 또는 응답 본문이 없는 경우 바이트 수가 `-`로 표기된다. 이를 0바이트로 예외 처리해야 한다 |

## 더 나아가기

- 특정 상태 코드(예: 4xx, 5xx)만 필터링하여 출력하는 `-status` 플래그 추가
- 시간대별(시간당 요청 수) 추이를 그래프(ASCII 바 차트)로 시각화
- 리포트 출력 형식으로 텍스트 외에 JSON(`-format json`) 출력 지원

## 참고

- The Go Blog: Working with Errors in Go 1.13 (<https://go.dev/blog/go1.13-errors>)
- Go 표준 라이브러리: `text/template` (<https://pkg.go.dev/text/template>)
- Go 표준 라이브러리: `regexp` (<https://pkg.go.dev/regexp>)
