package main

import (
	"encoding/json"
	"net/http"
	"strconv"
)

type Server struct {
	collector *Collector
	hub       *SSEHub
	mux       *http.ServeMux
	// workload 유지를 위한 임시 버퍼
	workloadHold [][]byte
}

func NewServer(collector *Collector, hub *SSEHub) *Server {
	s := &Server{
		collector: collector,
		hub:       hub,
		mux:       http.NewServeMux(),
	}
	s.routes()
	return s
}

func (s *Server) Handler() http.Handler {
	return s.mux
}

func (s *Server) routes() {
	s.mux.HandleFunc("GET /", s.handleDashboard)
	s.mux.HandleFunc("GET /api/metrics", s.handleMetricsAPI)
	s.mux.HandleFunc("GET /api/stream", s.hub.ServeHTTP)
	s.mux.HandleFunc("POST /api/workload", s.handleWorkload)
}

func (s *Server) handleDashboard(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	latest := s.collector.Latest()
	if err := RenderDashboard(w, latest); err != nil {
		http.Error(w, "대시보드 렌더링 실패: "+err.Error(), http.StatusInternalServerError)
	}
}

func (s *Server) handleMetricsAPI(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	response := struct {
		Latest  Snapshot   `json:"latest"`
		History []Snapshot `json:"history"`
	}{
		Latest:  s.collector.Latest(),
		History: s.collector.History(),
	}

	json.NewEncoder(w).Encode(response)
}

func (s *Server) handleWorkload(w http.ResponseWriter, r *http.Request) {
	mbStr := r.URL.Query().Get("mb")
	mb := 50
	if val, err := strconv.Atoi(mbStr); err == nil && val > 0 && val <= 500 {
		mb = val
	}

	// 메모리 할당 시뮬레이션
	chunk := make([]byte, mb*1024*1024)
	for i := range chunk {
		chunk[i] = byte(i % 256)
	}

	// 최대 3개 청크만 유지하여 메모리 누수 방지
	if len(s.workloadHold) >= 3 {
		s.workloadHold = s.workloadHold[1:]
	}
	s.workloadHold = append(s.workloadHold, chunk)

	// 즉시 새 메트릭 수집 및 브로드캐스트
	snap := s.collector.Record()
	if snapBytes, err := json.Marshal(snap); err == nil {
		s.hub.Broadcast(snapBytes)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"status":       "ok",
		"allocated_mb": mb,
	})
}
