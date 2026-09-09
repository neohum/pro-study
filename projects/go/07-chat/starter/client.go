package main

import (
	"net"
	"sync"
)

type Client struct {
	hub  *Hub
	conn net.Conn
	send chan string
	mu   sync.RWMutex
	name string
}

func NewClient(hub *Hub, conn net.Conn, defaultName string) *Client {
	return &Client{
		hub:  hub,
		conn: conn,
		send: make(chan string, 32),
		name: defaultName,
	}
}

func (c *Client) Name() string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.name
}

func (c *Client) SetName(name string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.name = name
}

// TODO(step-1): Client 구조체와 송수신 펌프
// readPump: c.conn에서 bufio.Scanner로 줄바꿈 단위로 읽어 handleMessage 호출.
//   종료 시 defer func() { c.hub.unregister <- c; c.conn.Close() }()
// writePump: c.send 채널에서 메시지를 꺼내 c.conn으로 출력(fmt.Fprintln).
//   채널이 닫히면 소켓을 닫고 종료.
func (c *Client) readPump() {
}

func (c *Client) writePump() {
}

// TODO(step-3): 프로토콜 파싱과 메시지 분기
// handleMessage:
// 1. text가 "/nick "으로 시작하면 새 닉네임을 파싱하여 c.SetName()으로 변경하고,
//    c.hub.broadcast로 "[알림] <이전> 님이 <새이름> 으로 이름을 변경했습니다." 전송.
// 2. 일반 메시지이면 c.hub.broadcast로 "[<닉네임>] <메시지>" 전송.
func (c *Client) handleMessage(text string) {
	_ = text
}
