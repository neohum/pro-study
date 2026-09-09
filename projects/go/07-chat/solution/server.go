package main

import (
	"fmt"
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

func (s *Server) Start() error {
	ln, err := net.Listen("tcp", s.addr)
	if err != nil {
		return err
	}
	s.listener = ln

	go s.hub.Run()

	s.wg.Add(1)
	go s.acceptLoop()

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
	for {
		conn, err := s.listener.Accept()
		if err != nil {
			select {
			case <-s.quit:
				return
			default:
				continue
			}
		}

		s.mu.Lock()
		s.nextID++
		name := fmt.Sprintf("guest-%d", s.nextID)
		s.mu.Unlock()

		client := NewClient(s.hub, conn, name)
		s.hub.register <- client

		go client.writePump()
		go client.readPump()
	}
}

func (s *Server) Shutdown() error {
	s.mu.Lock()
	select {
	case <-s.quit:
		s.mu.Unlock()
		return nil
	default:
		close(s.quit)
	}
	s.mu.Unlock()

	var err error
	if s.listener != nil {
		err = s.listener.Close()
	}
	s.wg.Wait()
	s.hub.Stop()
	return err
}
