// 03-logparse — 웹 서버 로그 파서 (solution)
//
// parser.go: 로그 파싱, 에러 래핑, 통계 요약 및 템플릿 리포팅 로직.
package main

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"text/template"
	"time"
)

var (
	ErrInvalidFormat = errors.New("invalid log format")
	ErrInvalidStatus = errors.New("invalid status code")
)

const timeLayout = "02/Jan/2006:15:04:05 -0700"

var logRegex = regexp.MustCompile(
	`^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)\s+(\S+)"\s+(\d{3})\s+(\S+)$`,
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

// ParseError는 줄 번호와 실패한 텍스트, 하위 원인 에러를 감싸는 커스텀 에러 타입이다.
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

// ParseLine은 Common Log Format 한 줄을 파싱하여 LogEntry를 반환한다.
func ParseLine(line string, lineNum int) (LogEntry, error) {
	m := logRegex.FindStringSubmatch(line)
	if m == nil {
		return LogEntry{}, &ParseError{LineNum: lineNum, Line: line, Err: ErrInvalidFormat}
	}

	ts, err := time.Parse(timeLayout, m[2])
	if err != nil {
		return LogEntry{}, &ParseError{LineNum: lineNum, Line: line, Err: ErrInvalidFormat}
	}

	code, err := strconv.Atoi(m[6])
	if err != nil || code < 100 || code > 599 {
		return LogEntry{}, &ParseError{LineNum: lineNum, Line: line, Err: ErrInvalidStatus}
	}

	var byteCount int64
	if m[7] != "-" {
		b, err := strconv.ParseInt(m[7], 10, 64)
		if err != nil {
			return LogEntry{}, &ParseError{LineNum: lineNum, Line: line, Err: ErrInvalidFormat}
		}
		byteCount = b
	}

	return LogEntry{
		IP:         m[1],
		Timestamp:  ts,
		Method:     m[3],
		Path:       m[4],
		Protocol:   m[5],
		StatusCode: code,
		Bytes:      byteCount,
	}, nil
}

// ParseReader는 io.Reader 스트림에서 줄 단위로 로그를 파싱한다.
func ParseReader(r io.Reader, ignoreErrors bool) ([]LogEntry, []error, error) {
	var entries []LogEntry
	var parseErrors []error
	scanner := bufio.NewScanner(r)
	lineNum := 0

	for scanner.Scan() {
		lineNum++
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		entry, err := ParseLine(line, lineNum)
		if err != nil {
			parseErrors = append(parseErrors, err)
			if !ignoreErrors {
				return entries, parseErrors, err
			}
			continue
		}
		entries = append(entries, entry)
	}

	if err := scanner.Err(); err != nil {
		return entries, parseErrors, err
	}
	return entries, parseErrors, nil
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

// Summarize는 파싱된 엔트리 목록을 집계하여 정렬된 Summary 구조체를 생성한다.
func Summarize(entries []LogEntry, errorCount int) Summary {
	s := Summary{
		TotalRequests: len(entries),
		ErrorLines:    errorCount,
	}
	statusMap := make(map[int]int)
	methodMap := make(map[string]int)
	pathMap := make(map[string]int)

	for _, e := range entries {
		s.TotalBytes += e.Bytes
		statusMap[e.StatusCode]++
		methodMap[e.Method]++
		pathMap[e.Path]++
	}

	for code, count := range statusMap {
		s.Statuses = append(s.Statuses, StatusCount{Code: code, Count: count})
	}
	slices.SortFunc(s.Statuses, func(a, b StatusCount) int {
		return a.Code - b.Code
	})

	for method, count := range methodMap {
		s.Methods = append(s.Methods, MethodCount{Method: method, Count: count})
	}
	slices.SortFunc(s.Methods, func(a, b MethodCount) int {
		return strings.Compare(a.Method, b.Method)
	})

	for path, count := range pathMap {
		s.TopPaths = append(s.TopPaths, PathCount{Path: path, Count: count})
	}
	slices.SortFunc(s.TopPaths, func(a, b PathCount) int {
		if a.Count != b.Count {
			return b.Count - a.Count // 빈도 내림차순
		}
		return strings.Compare(a.Path, b.Path) // 경로 오름차순
	})

	return s
}

const reportTemplate = `=== 웹 서버 로그 분석 리포트 ===
총 요청 수: {{.TotalRequests}} (오류 라인: {{.ErrorLines}})
총 전송량: {{.TotalBytes}} 바이트

[상태 코드]
{{range .Statuses}}  {{.Code}}: {{.Count}}
{{end}}
[HTTP 메서드]
{{range .Methods}}  {{.Method}}: {{.Count}}
{{end}}
[상위 경로]
{{range .TopPaths}}  {{.Path}}: {{.Count}}
{{end}}`

// RenderReport는 text/template으로 요약 리포트를 서식화하여 w에 렌더링한다.
func RenderReport(w io.Writer, summary Summary, topN int) error {
	if topN > 0 && topN < len(summary.TopPaths) {
		summary.TopPaths = summary.TopPaths[:topN]
	}
	tmpl, err := template.New("report").Parse(reportTemplate)
	if err != nil {
		return err
	}
	return tmpl.Execute(w, summary)
}
