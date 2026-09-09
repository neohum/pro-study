package main

import (
	"net/http"
	"sync"
)

// TODO(step-2): SSEHub 구조체와 Register, Unregister, Broadcast, ServeHTTP(text/event-stream) 구현
type SSEHub struct {
	mu      sync.Mutex
	clients map[chan []byte]bool
}

func NewSSEHub() *SSEHub {
	return &SSEHub{clients: make(map[chan []byte]bool)}
}

func (h *SSEHub) Register() chan []byte {
	return nil
}

func (h *SSEHub) Unregister(ch chan []byte) {
	_ = ch
}

func (h *SSEHub) Broadcast(data []byte) {
	_ = data
}

func (h *SSEHub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	_ = w
	_ = r
}
