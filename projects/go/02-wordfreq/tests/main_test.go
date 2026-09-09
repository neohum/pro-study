package main

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// ---- Step 1: CleanWord 테스트 ----

func TestCleanWord(t *testing.T) {
	tests := []struct {
		name       string
		raw        string
		minLen     int
		ignoreCase bool
		expected   string
	}{
		{"기본 단어", "hello", 1, true, "hello"},
		{"앞뒤 구두점 제거", "...Hello, World!...", 1, true, "hello, world"},
		{"대문자 소문자화", "GOPHER", 1, true, "gopher"},
		{"대소문자 유지", "GOPHER", 1, false, "GOPHER"},
		{"최소 길이 필터링 만족", "go", 2, true, "go"},
		{"최소 길이 미만 제외", "a", 2, true, ""},
		{"숫자 포함 단어", "#v1.26#", 1, true, "v1.26"},
		{"특수문자만 있는 경우", "!!@@##", 1, true, ""},
		{"한글 단어 지원", "\"안녕하세요!\"", 1, true, "안녕하세요"},
		{"한글 최소 길이 미만", "글!", 2, true, ""},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := CleanWord(tc.raw, tc.minLen, tc.ignoreCase)
			if got != tc.expected {
				t.Errorf("CleanWord(%q, %d, %v) = %q; want %q",
					tc.raw, tc.minLen, tc.ignoreCase, got, tc.expected)
			}
		})
	}
}

// ---- Step 2: CountWords 테스트 ----

func TestCountWords(t *testing.T) {
	input := `
The Go programming language is an open source project to make programmers
more productive. Go is expressive, concise, clean, and efficient.
`
	counts, err := CountWords(strings.NewReader(input), 2, true)
	if err != nil {
		t.Fatalf("CountWords failed: %v", err)
	}

	expected := map[string]int{
		"go":          2,
		"is":          2,
		"the":         1,
		"programming": 1,
		"language":    1,
		"an":          1,
		"open":        1,
		"source":      1,
		"project":     1,
		"to":          1,
		"make":        1,
		"programmers": 1,
		"more":        1,
		"productive":  1,
		"expressive":  1,
		"concise":     1,
		"clean":       1,
		"and":         1,
		"efficient":   1,
	}

	for word, expCount := range expected {
		if got := counts[word]; got != expCount {
			t.Errorf("Count(%q) = %d; want %d", word, got, expCount)
		}
	}
}

func TestCountWords_Empty(t *testing.T) {
	counts, err := CountWords(strings.NewReader(""), 1, true)
	if err != nil {
		t.Fatalf("CountWords failed: %v", err)
	}
	if len(counts) != 0 {
		t.Errorf("expected empty counts, got %d items", len(counts))
	}
}

// ---- Step 3: TopN 테스트 ----

func TestTopN(t *testing.T) {
	counts := map[string]int{
		"apple":  3,
		"banana": 5,
		"cherry": 5,
		"date":   1,
	}

	// n = 3: banana와 cherry는 동점(5)이므로 사전순 banana -> cherry
	// 그 다음 apple(3)
	top3 := TopN(counts, 3)
	if len(top3) != 3 {
		t.Fatalf("len(TopN) = %d; want 3", len(top3))
	}

	if top3[0].Word != "banana" || top3[0].Count != 5 {
		t.Errorf("1st = %+v; want banana (5)", top3[0])
	}
	if top3[1].Word != "cherry" || top3[1].Count != 5 {
		t.Errorf("2nd = %+v; want cherry (5)", top3[1])
	}
	if top3[2].Word != "apple" || top3[2].Count != 3 {
		t.Errorf("3rd = %+v; want apple (3)", top3[2])
	}

	// n <= 0이면 전체 반환
	all := TopN(counts, 0)
	if len(all) != 4 {
		t.Errorf("len(TopN(0)) = %d; want 4", len(all))
	}
	if all[3].Word != "date" || all[3].Count != 1 {
		t.Errorf("4th = %+v; want date (1)", all[3])
	}
}

// ---- Step 4: FormatResults 테스트 ----

func TestFormatResults(t *testing.T) {
	var buf bytes.Buffer
	pairs := []Pair{
		{Word: "gopher", Count: 10},
		{Word: "golang", Count: 5},
	}
	FormatResults(&buf, pairs)
	out := buf.String()
	if !strings.Contains(out, "gopher") || !strings.Contains(out, "(10)") {
		t.Errorf("FormatResults output missing gopher: %q", out)
	}
	if !strings.Contains(out, "golang") || !strings.Contains(out, "(5)") {
		t.Errorf("FormatResults output missing golang: %q", out)
	}

	buf.Reset()
	FormatResults(&buf, nil)
	if !strings.Contains(buf.String(), "(결과 없음)") {
		t.Errorf("expected '(결과 없음)', got %q", buf.String())
	}
}

// ---- Step 5: run CLI 테스트 ----

func TestRun_Stdin(t *testing.T) {
	stdin := strings.NewReader("apple banana apple cherry apple banana")
	var stdout, stderr bytes.Buffer

	code := run([]string{"-top", "2"}, stdin, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("run exit code = %d; stderr = %s", code, stderr.String())
	}

	out := stdout.String()
	if !strings.Contains(out, "apple") || !strings.Contains(out, "(3)") {
		t.Errorf("expected apple (3) in output: %s", out)
	}
	if !strings.Contains(out, "banana") || !strings.Contains(out, "(2)") {
		t.Errorf("expected banana (2) in output: %s", out)
	}
	if strings.Contains(out, "cherry") {
		t.Errorf("cherry should not appear in top 2: %s", out)
	}
}

func TestRun_File(t *testing.T) {
	tmpDir := t.TempDir()
	filePath := filepath.Join(tmpDir, "test.txt")
	err := os.WriteFile(filePath, []byte("Go is simple. Go is fast."), 0o644)
	if err != nil {
		t.Fatalf("WriteFile failed: %v", err)
	}

	var stdout, stderr bytes.Buffer
	code := run([]string{"-min-len", "3", filePath}, nil, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("run exit code = %d; stderr = %s", code, stderr.String())
	}

	out := stdout.String()
	if strings.Contains(out, "is") {
		t.Errorf("'is' should be filtered out by min-len 3: %s", out)
	}
	if !strings.Contains(out, "simple") || !strings.Contains(out, "fast") {
		t.Errorf("expected 'simple' and 'fast' in output: %s", out)
	}
}

func TestRun_InvalidFlag(t *testing.T) {
	var stdout, stderr bytes.Buffer
	code := run([]string{"-invalid-flag-123"}, nil, &stdout, &stderr)
	if code != 2 {
		t.Errorf("run with invalid flag exit code = %d; want 2", code)
	}
}

func TestRun_FileNotFound(t *testing.T) {
	var stdout, stderr bytes.Buffer
	code := run([]string{"no-such-file-exists-999.txt"}, nil, &stdout, &stderr)
	if code != 1 {
		t.Errorf("run with missing file exit code = %d; want 1", code)
	}
}
