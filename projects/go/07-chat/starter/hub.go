package main

import (
	"sync"
)

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan string
	register   chan *Client
	unregister chan *Client
	quit       chan struct{}
	done       chan struct{}
	mu         sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan string, 64),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		quit:       make(chan struct{}),
		done:       make(chan struct{}),
	}
}

// TODO(step-2): Hub 브로드캐스트 이벤트 루프
// Run: select 문으로 4개 채널을 다중화 처리한다:
// 1. <-h.quit: 모든 client.send 채널을 닫고 h.clients 정리 후 종료.
// 2. client := <-h.register: h.clients[client] = true 및 환영/입장 메시지 전송.
// 3. client := <-h.unregister: h.clients에서 제거하고 client.send 닫기 및 퇴장 메시지 브로드캐스트.
// 4. msg := <-h.broadcast: 모든 접속 중인 client.send로 메시지 전송 (select default로 블로킹 방지).
func (h *Hub) Run() {
	defer close(h.done)
}

func (h *Hub) Stop() {
	h.mu.Lock()
	defer h.mu.Unlock()
	select {
	case <-h.quit:
	default:
		close(h.quit)
	}
}
