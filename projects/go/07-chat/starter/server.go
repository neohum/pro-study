package main

import (
	"net"
	"sync"
)

type Server struct {
	addr     string
	listener net.Listener
	hub      *Hub
	quit     chan struct{}
	wg       sync.WaitGroup
	nextID   int
	mu       sync.Mutex
}

func NewServer(addr string) *Server {
	return &Server{
		addr: addr,
		hub:  NewHub(),
		quit: make(chan struct{}),
	}
}

// TODO(step-4): TCP 리스너와 연결 수락 루프
// Start: net.Listen("tcp", s.addr)로 리스너 생성.
//   go s.hub.Run()으로 허브 기동.
//   s.wg.Add(1) 후 go s.acceptLoop() 기동.
// acceptLoop: 무한 루프에서 s.listener.Accept() 호출.
//   연결 수락 시 NewClient 생성 후 s.hub.register로 등록.
//   go client.writePump(), go client.readPump() 실행.
func (s *Server) Start() error {
	return nil
}

func (s *Server) Addr() net.Addr {
	if s.listener == nil {
		return nil
	}
	return s.listener.Addr()
}

func (s *Server) acceptLoop() {
	defer s.wg.Done()
}

func (s *Server) Shutdown() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	select {
	case <-s.quit:
		return nil
	default:
		close(s.quit)
	}
	return nil
}
