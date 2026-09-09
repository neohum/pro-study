package main

import (
	"bufio"
	"fmt"
	"net"
	"strings"
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

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	sc := bufio.NewScanner(c.conn)
	for sc.Scan() {
		text := strings.TrimSpace(sc.Text())
		if text == "" {
			continue
		}
		c.handleMessage(text)
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()
	for msg := range c.send {
		_, err := fmt.Fprintln(c.conn, msg)
		if err != nil {
			return
		}
	}
}

func (c *Client) handleMessage(text string) {
	if strings.HasPrefix(text, "/nick ") {
		newNick := strings.TrimSpace(strings.TrimPrefix(text, "/nick "))
		if newNick == "" {
			select {
			case c.send <- "[서버] 닉네임은 비어 있을 수 없습니다.":
			default:
			}
			return
		}
		oldNick := c.Name()
		c.SetName(newNick)
		c.hub.broadcast <- fmt.Sprintf("[알림] %s 님이 %s 으로 이름을 변경했습니다.", oldNick, newNick)
		return
	}

	c.hub.broadcast <- fmt.Sprintf("[%s] %s", c.Name(), text)
}
