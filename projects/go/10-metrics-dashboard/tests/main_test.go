package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCollector(t *testing.T) {
	c := NewCollector(5)
	snap := c.Record()

	if snap.Goroutines == 0 {
		t.Fatal("수집된 활성 고루틴 수가 0입니다")
	}
	if snap.TotalBytes == 0 {
		t.Fatal("수집된 런타임 전체 메모리가 0입니다")
	}

	history := c.History()
	if len(history) != 1 {
		t.Fatalf("기대 히스토리 개수 1, 실제 %d", len(history))
	}

	latest := c.Latest()
	if latest.Timestamp != snap.Timestamp {
		t.Fatal("Latest() 스냅샷 불일치")
	}

	// 10회 추가 기록하여 버퍼 최대 용량(5) 초과 검증
	for i := 0; i < 10; i++ {
		c.Record()
	}
	if len(c.History()) != 5 {
		t.Fatalf("버퍼 최대 크기 제한 실패: 기대 5, 실제 %d", len(c.History()))
	}
}

func TestRingBuffer(t *testing.T) {
	rb := NewRingBuffer(3)
	if _, ok := rb.Latest(); ok {
		t.Fatal("빈 버퍼에서 Latest 성공 반환")
	}

	rb.Push(Snapshot{Goroutines: 1})
	rb.Push(Snapshot{Goroutines: 2})
	rb.Push(Snapshot{Goroutines: 3})
	rb.Push(Snapshot{Goroutines: 4})

	if rb.Len() != 3 {
		t.Fatalf("기대 크기 3, 실제 %d", rb.Len())
	}

	latest, ok := rb.Latest()
	if !ok || latest.Goroutines != 4 {
		t.Fatalf("최신 스냅샷 불일치: 기대 4, 실제 %d", latest.Goroutines)
	}

	all := rb.All()
	if len(all) != 3 || all[0].Goroutines != 2 || all[2].Goroutines != 4 {
		t.Fatalf("RingBuffer 슬라이딩 순서 오류: %v", all)
	}
}

func TestFormatBytes(t *testing.T) {
	tests := []struct {
		bytes    uint64
		expected string
	}{
		{500, "500 B"},
		{1024, "1.0 KB"},
		{1536, "1.5 KB"},
		{1048576, "1.0 MB"},
		{1073741824, "1.0 GB"},
	}

	for _, tt := range tests {
		actual := FormatBytes(tt.bytes)
		if actual != tt.expected {
			t.Errorf("FormatBytes(%d) 불일치: 기대 %q, 실제 %q", tt.bytes, tt.expected, actual)
		}
	}
}

func TestDashboardRender(t *testing.T) {
	snap := Snapshot{
		Goroutines:       12,
		HeapObjectsBytes: 2048576,
		TotalBytes:       4194304,
		GCCycles:         3,
	}

	var buf bytes.Buffer
	err := RenderDashboard(&buf, snap)
	if err != nil {
		t.Fatalf("대시보드 렌더링 실패: %v", err)
	}

	out := buf.String()
	if !strings.Contains(out, "Go 런타임 메트릭 대시보드") {
		t.Fatal("대시보드 타이틀 누락")
	}
	if !strings.Contains(out, "12") {
		t.Fatal("고루틴 값 누락")
	}
	if !strings.Contains(out, "/api/stream") {
		t.Fatal("SSE 스트림 엔드포인트 스크립트 누락")
	}
}

func TestServerRoutes(t *testing.T) {
	collector := NewCollector(10)
	collector.Record()
	hub := NewSSEHub()
	srv := NewServer(collector, hub)
	handler := srv.Handler()

	// 1. GET /
	req := httptest.NewRequest("GET", "/", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("GET / 기대 200, 실제 %d", rec.Code)
	}
	if !strings.Contains(rec.Header().Get("Content-Type"), "text/html") {
		t.Fatalf("GET / Content-Type 오류: %q", rec.Header().Get("Content-Type"))
	}

	// 2. GET /api/metrics
	req = httptest.NewRequest("GET", "/api/metrics", nil)
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("GET /api/metrics 기대 200, 실제 %d", rec.Code)
	}
	var metricsResp struct {
		Latest  Snapshot   `json:"latest"`
		History []Snapshot `json:"history"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &metricsResp); err != nil {
		t.Fatalf("GET /api/metrics JSON 파싱 실패: %v", err)
	}
	if metricsResp.Latest.Goroutines == 0 {
		t.Fatal("응답받은 latest 고루틴 수가 0입니다")
	}

	// 3. POST /api/workload
	req = httptest.NewRequest("POST", "/api/workload?mb=2", nil)
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("POST /api/workload 기대 200, 실제 %d", rec.Code)
	}
	var workloadResp map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &workloadResp); err != nil {
		t.Fatalf("POST /api/workload JSON 파싱 실패: %v", err)
	}
	if workloadResp["status"] != "ok" {
		t.Fatalf("기대 status 'ok', 실제 %v", workloadResp["status"])
	}

	// 4. GET /not-found 404 테스트
	req = httptest.NewRequest("GET", "/unknown-route", nil)
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("미등록 라우트 기대 404, 실제 %d", rec.Code)
	}
}

func TestSSEHub(t *testing.T) {
	hub := NewSSEHub()
	if hub.ClientCount() != 0 {
		t.Fatalf("새 허브 클라이언트 수 0이어야 함: 실제 %d", hub.ClientCount())
	}

	clientChan := hub.Register()
	if hub.ClientCount() != 1 {
		t.Fatalf("등록 후 클라이언트 수 불일치: 기대 1, 실제 %d", hub.ClientCount())
	}

	msg := []byte(`{"test":"sse"}`)
	hub.Broadcast(msg)

	received := <-clientChan
	if string(received) != string(msg) {
		t.Fatalf("SSE 브로드캐스트 메시지 불일치: 기대 %s, 실제 %s", msg, received)
	}

	hub.Unregister(clientChan)
	if hub.ClientCount() != 0 {
		t.Fatalf("등록 해제 후 클라이언트 수 불일치: 기대 0, 실제 %d", hub.ClientCount())
	}
}

func TestMainExecution(t *testing.T) {
	var stdout, stderr bytes.Buffer
	code := run([]string{"-once"}, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("기대 종료 코드 0, 실제 %d (stderr: %s)", code, stderr.String())
	}
	out := stdout.String()
	if !strings.Contains(out, "현재 Go 런타임 메트릭 스냅샷") {
		t.Fatalf("출력 내용 누락: %s", out)
	}
	if !strings.Contains(out, "활성 고루틴") {
		t.Fatalf("고루틴 항목 누락: %s", out)
	}

	// 인자 없는 기본 실행
	stdout.Reset()
	stderr.Reset()
	code = run(nil, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("기본 인자 실행 기대 0, 실제 %d", code)
	}
}
