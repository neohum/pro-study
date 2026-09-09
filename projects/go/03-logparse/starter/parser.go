// 03-logparse — 웹 서버 로그 파서 (starter)
//
// parser.go: 로그 파싱, 에러 래핑, 통계 요약 및 템플릿 리포팅 로직.
package main

import (
	"errors"
	"io"
	"time"
)

var (
	ErrInvalidFormat = errors.New("invalid log format")
	ErrInvalidStatus = errors.New("invalid status code")
)

// LogEntry는 파싱된 로그 한 줄의 데이터다.
type LogEntry struct {
	IP         string
	Timestamp  time.Time
	Method     string
	Path       string
	Protocol   string
	StatusCode int
	Bytes      int64
}

// TODO(step-1): ParseError와 ParseLine
// ParseError는 LineNum, Line, Err 필드를 가지며 Error()와 Unwrap() error를 구현한다.
// ParseLine은 정규식으로 Common Log Format을 파싱하고 타임스탬프, 상태 코드, 바이트를 변환한다.
// 형식 불일치 시 ErrInvalidFormat, 상태 코드(100~599) 범위 초과 시 ErrInvalidStatus를 래핑해 반환한다.
type ParseError struct {
	LineNum int
	Line    string
	Err     error
}

func (e *ParseError) Error() string {
	return ""
}

func (e *ParseError) Unwrap() error {
	return e.Err
}

func ParseLine(line string, lineNum int) (LogEntry, error) {
	_ = line
	_ = lineNum
	return LogEntry{}, nil
}

// TODO(step-2): ParseReader
// bufio.Scanner로 r을 한 줄씩 읽어 ParseLine을 호출한다.
// 빈 줄은 무시하고, 에러 발생 시 ignoreErrors에 따라 계속 진행하거나 즉시 중단한다.
// 파싱된 entries 슬라이스와 누적된 parseErrors 슬라이스를 반환한다.
func ParseReader(r io.Reader, ignoreErrors bool) ([]LogEntry, []error, error) {
	_ = r
	_ = ignoreErrors
	return nil, nil, nil
}

type StatusCount struct {
	Code  int
	Count int
}

type MethodCount struct {
	Method string
	Count  int
}

type PathCount struct {
	Path  string
	Count int
}

type Summary struct {
	TotalRequests int
	ErrorLines    int
	TotalBytes    int64
	Statuses      []StatusCount // Code 오름차순
	Methods       []MethodCount // Method 오름차순
	TopPaths      []PathCount   // Count 내림차순, Path 오름차순
}

// TODO(step-3): Summarize
// entries를 순회하며 상태 코드, HTTP 메서드, 경로별 빈도 및 전송 바이트를 집계한다.
// 각 통계를 slices.SortFunc를 이용해 정렬된 슬라이스로 변환하고 Summary 구조체에 담아 반환한다.
func Summarize(entries []LogEntry, errorCount int) Summary {
	_ = entries
	_ = errorCount
	return Summary{}
}

// TODO(step-4): RenderReport
// text/template 패키지를 사용하여 summary 데이터를 w에 포맷팅하여 출력한다.
// topN > 0이고 topN < len(TopPaths)인 경우 상위 topN개 경로만 출력한다.
func RenderReport(w io.Writer, summary Summary, topN int) error {
	_ = w
	_ = summary
	_ = topN
	return nil
}
