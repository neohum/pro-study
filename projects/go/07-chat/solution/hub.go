package main

import (
	"fmt"
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

func (h *Hub) Run() {
	defer close(h.done)
	for {
		select {
		case <-h.quit:
			for client := range h.clients {
				close(client.send)
				delete(h.clients, client)
			}
			return
		case client := <-h.register:
			h.clients[client] = true
			select {
			case client.send <- "[서버] 환영합니다! /nick <이름> 으로 닉네임을 변경할 수 있습니다.":
			default:
			}
			h.broadcastMessage(fmt.Sprintf("[입장] %s 님이 입장하셨습니다.", client.Name()))
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				h.broadcastMessage(fmt.Sprintf("[퇴장] %s 님이 퇴장하셨습니다.", client.Name()))
			}
		case msg := <-h.broadcast:
			h.broadcastMessage(msg)
		}
	}
}

func (h *Hub) broadcastMessage(msg string) {
	for client := range h.clients {
		select {
		case client.send <- msg:
		default:
		}
	}
}

func (h *Hub) Stop() {
	h.mu.Lock()
	defer h.mu.Unlock()
	select {
	case <-h.quit:
	default:
		close(h.quit)
		<-h.done
	}
}
