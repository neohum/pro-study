package main

import (
	"net/http"
)

// TODO(step-4): Server 구조체 및 라우팅(/, /api/metrics, /api/stream, /api/workload) 구현
type Server struct {
	collector *Collector
	hub       *SSEHub
	mux       *http.ServeMux
}

func NewServer(collector *Collector, hub *SSEHub) *Server {
	return &Server{
		collector: collector,
		hub:       hub,
		mux:       http.NewServeMux(),
	}
}

func (s *Server) Handler() http.Handler {
	return s.mux
}
