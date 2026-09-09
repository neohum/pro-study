package main

import (
	"bytes"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// ---- Step 1: ParseLine 및 ParseError 테스트 ----

func TestParseLine_Valid(t *testing.T) {
	tests := []struct {
		name       string
		line       string
		wantIP     string
		wantMethod string
		wantPath   string
		wantStatus int
		wantBytes  int64
	}{
		{
			name:       "표준 성공 로그",
			line:       `192.168.1.1 - - [10/Sep/2026:13:55:36 +0900] "GET /index.html HTTP/1.1" 200 2326`,
			wantIP:     "192.168.1.1",
			wantMethod: "GET",
			wantPath:   "/index.html",
			wantStatus: 200,
			wantBytes:  2326,
		},
		{
			name:       "본문 없는 응답 (바이트 수 -)",
			line:       `10.0.0.2 - frank [10/Sep/2026:13:55:37 +0900] "POST /api/login HTTP/1.1" 401 -`,
			wantIP:     "10.0.0.2",
			wantMethod: "POST",
			wantPath:   "/api/login",
			wantStatus: 401,
			wantBytes:  0,
		},
		{
			name:       "리다이렉트 응답",
			line:       `172.16.0.5 - - [10/Sep/2026:14:00:00 +0900] "GET /old-path HTTP/2.0" 301 150`,
			wantIP:     "172.16.0.5",
			wantMethod: "GET",
			wantPath:   "/old-path",
			wantStatus: 301,
			wantBytes:  150,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			entry, err := ParseLine(tc.line, 1)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if entry.IP != tc.wantIP {
				t.Errorf("IP = %q; want %q", entry.IP, tc.wantIP)
			}
			if entry.Method != tc.wantMethod {
				t.Errorf("Method = %q; want %q", entry.Method, tc.wantMethod)
			}
			if entry.Path != tc.wantPath {
				t.Errorf("Path = %q; want %q", entry.Path, tc.wantPath)
			}
			if entry.StatusCode != tc.wantStatus {
				t.Errorf("StatusCode = %d; want %d", entry.StatusCode, tc.wantStatus)
			}
			if entry.Bytes != tc.wantBytes {
				t.Errorf("Bytes = %d; want %d", entry.Bytes, tc.wantBytes)
			}
			if entry.Timestamp.IsZero() {
				t.Error("Timestamp must not be zero")
			}
		})
	}
}

func TestParseLine_Errors(t *testing.T) {
	t.Run("형식 오류", func(t *testing.T) {
		badLine := "not a valid log line format"
		_, err := ParseLine(badLine, 42)
		if err == nil {
			t.Fatal("expected error for bad format, got nil")
		}

		if !errors.Is(err, ErrInvalidFormat) {
			t.Errorf("expected errors.Is(err, ErrInvalidFormat); got %v", err)
		}

		var parseErr *ParseError
		if !errors.As(err, &parseErr) {
			t.Fatalf("expected errors.As to ParseError, got %v", err)
		}
		if parseErr.LineNum != 42 {
			t.Errorf("parseErr.LineNum = %d; want 42", parseErr.LineNum)
		}
		if parseErr.Line != badLine {
			t.Errorf("parseErr.Line = %q; want %q", parseErr.Line, badLine)
		}
	})

	t.Run("상태 코드 오류", func(t *testing.T) {
		badStatusLine := `127.0.0.1 - - [10/Sep/2026:13:55:36 +0900] "GET /index.html HTTP/1.1" 999 100`
		_, err := ParseLine(badStatusLine, 5)
		if err == nil {
			t.Fatal("expected error for invalid status code")
		}
		if !errors.Is(err, ErrInvalidStatus) {
			t.Errorf("expected errors.Is(err, ErrInvalidStatus); got %v", err)
		}
	})
}

// ---- Step 2: ParseReader 테스트 ----

func TestParseReader(t *testing.T) {
	logContent := `
192.168.1.1 - - [10/Sep/2026:13:55:36 +0900] "GET /index.html HTTP/1.1" 200 1000
INVALID LINE HERE
192.168.1.2 - - [10/Sep/2026:13:55:37 +0900] "POST /api/users HTTP/1.1" 201 500
`

	// ignoreErrors = true: 잘못된 줄을 건너뛰고 정상 엔트리 2개 수집
	entries, parseErrs, err := ParseReader(strings.NewReader(logContent), true)
	if err != nil {
		t.Fatalf("unexpected terminal error: %v", err)
	}
	if len(entries) != 2 {
		t.Errorf("len(entries) = %d; want 2", len(entries))
	}
	if len(parseErrs) != 1 {
		t.Errorf("len(parseErrs) = %d; want 1", len(parseErrs))
	}

	// ignoreErrors = false: 잘못된 줄에서 즉시 중단
	entries, parseErrs, err = ParseReader(strings.NewReader(logContent), false)
	if err == nil {
		t.Fatal("expected error when ignoreErrors=false")
	}
	if len(entries) != 1 {
		t.Errorf("len(entries) = %d; want 1 before failure", len(entries))
	}
}

// ---- Step 3: Summarize 테스트 ----

func TestSummarize(t *testing.T) {
	now := time.Now()
	entries := []LogEntry{
		{Method: "GET", Path: "/home", StatusCode: 200, Bytes: 100, Timestamp: now},
		{Method: "GET", Path: "/home", StatusCode: 200, Bytes: 200, Timestamp: now},
		{Method: "POST", Path: "/login", StatusCode: 401, Bytes: 50, Timestamp: now},
		{Method: "GET", Path: "/about", StatusCode: 404, Bytes: 30, Timestamp: now},
		{Method: "GET", Path: "/home", StatusCode: 200, Bytes: 150, Timestamp: now},
	}

	summary := Summarize(entries, 1)

	if summary.TotalRequests != 5 {
		t.Errorf("TotalRequests = %d; want 5", summary.TotalRequests)
	}
	if summary.ErrorLines != 1 {
		t.Errorf("ErrorLines = %d; want 1", summary.ErrorLines)
	}
	if summary.TotalBytes != 530 {
		t.Errorf("TotalBytes = %d; want 530", summary.TotalBytes)
	}

	// 상태 코드 오름차순 검증: 200, 401, 404
	if len(summary.Statuses) != 3 {
		t.Fatalf("len(Statuses) = %d; want 3", len(summary.Statuses))
	}
	if summary.Statuses[0].Code != 200 || summary.Statuses[0].Count != 3 {
		t.Errorf("Statuses[0] = %+v; want 200: 3", summary.Statuses[0])
	}
	if summary.Statuses[1].Code != 401 || summary.Statuses[1].Count != 1 {
		t.Errorf("Statuses[1] = %+v; want 401: 1", summary.Statuses[1])
	}
	if summary.Statuses[2].Code != 404 || summary.Statuses[2].Count != 1 {
		t.Errorf("Statuses[2] = %+v; want 404: 1", summary.Statuses[2])
	}

	// 상위 경로 정렬 검증: /home (3), 그 다음 동점(1)인 /about, /login 사전순
	if len(summary.TopPaths) != 3 {
		t.Fatalf("len(TopPaths) = %d; want 3", len(summary.TopPaths))
	}
	if summary.TopPaths[0].Path != "/home" || summary.TopPaths[0].Count != 3 {
		t.Errorf("TopPaths[0] = %+v; want /home: 3", summary.TopPaths[0])
	}
	if summary.TopPaths[1].Path != "/about" || summary.TopPaths[1].Count != 1 {
		t.Errorf("TopPaths[1] = %+v; want /about: 1", summary.TopPaths[1])
	}
}

// ---- Step 4: RenderReport 테스트 ----

func TestRenderReport(t *testing.T) {
	summary := Summary{
		TotalRequests: 10,
		ErrorLines:    2,
		TotalBytes:    4096,
		Statuses:      []StatusCount{{Code: 200, Count: 8}, {Code: 500, Count: 2}},
		Methods:       []MethodCount{{Method: "GET", Count: 10}},
		TopPaths: []PathCount{
			{Path: "/api/test", Count: 6},
			{Path: "/login", Count: 3},
			{Path: "/logout", Count: 1},
		},
	}

	var buf bytes.Buffer
	err := RenderReport(&buf, summary, 2)
	if err != nil {
		t.Fatalf("RenderReport failed: %v", err)
	}

	out := buf.String()
	if !strings.Contains(out, "총 요청 수: 10") {
		t.Errorf("missing TotalRequests: %s", out)
	}
	if !strings.Contains(out, "총 전송량: 4096 바이트") {
		t.Errorf("missing TotalBytes: %s", out)
	}
	if !strings.Contains(out, "200: 8") {
		t.Errorf("missing status 200: %s", out)
	}
	if !strings.Contains(out, "/api/test: 6") {
		t.Errorf("missing top path /api/test: %s", out)
	}
	// topN=2 이므로 /logout 은 잘려야 함
	if strings.Contains(out, "/logout") {
		t.Errorf("/logout should be cut by topN=2: %s", out)
	}
}

// ---- Step 5: run CLI 테스트 ----

func TestRun_Stdin(t *testing.T) {
	log := `127.0.0.1 - - [10/Sep/2026:13:55:36 +0900] "GET /index.html HTTP/1.1" 200 512`
	var stdout, stderr bytes.Buffer

	code := run([]string{"-top", "3"}, strings.NewReader(log), &stdout, &stderr)
	if code != 0 {
		t.Fatalf("run failed with exit code %d: %s", code, stderr.String())
	}

	out := stdout.String()
	if !strings.Contains(out, "총 요청 수: 1") || !strings.Contains(out, "/index.html: 1") {
		t.Errorf("unexpected output: %s", out)
	}
}

func TestRun_File(t *testing.T) {
	tmpDir := t.TempDir()
	logPath := filepath.Join(tmpDir, "access.log")
	content := `
127.0.0.1 - - [10/Sep/2026:13:55:36 +0900] "GET /test HTTP/1.1" 200 100
127.0.0.1 - - [10/Sep/2026:13:55:37 +0900] "POST /test HTTP/1.1" 201 200
`
	if err := os.WriteFile(logPath, []byte(content), 0o644); err != nil {
		t.Fatalf("WriteFile failed: %v", err)
	}

	var stdout, stderr bytes.Buffer
	code := run([]string{logPath}, nil, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("run failed with code %d: %s", code, stderr.String())
	}

	out := stdout.String()
	if !strings.Contains(out, "총 요청 수: 2") || !strings.Contains(out, "총 전송량: 300 바이트") {
		t.Errorf("unexpected output: %s", out)
	}
}

func TestRun_InvalidFlag(t *testing.T) {
	var stdout, stderr bytes.Buffer
	code := run([]string{"-unknown-flag"}, nil, &stdout, &stderr)
	if code != 2 {
		t.Errorf("run with invalid flag = %d; want 2", code)
	}
}

func TestRun_FileNotFound(t *testing.T) {
	var stdout, stderr bytes.Buffer
	code := run([]string{"missing-file-404.log"}, nil, &stdout, &stderr)
	if code != 1 {
		t.Errorf("run with missing file = %d; want 1", code)
	}
}
