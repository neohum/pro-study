package main

import (
	"bufio"
	"fmt"
	"net"
	"strings"
	"sync"
	"testing"
	"time"
)

func readLineWithDeadline(t *testing.T, conn net.Conn, sc *bufio.Scanner) string {
	t.Helper()
	_ = conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	if sc.Scan() {
		return sc.Text()
	}
	if err := sc.Err(); err != nil {
		t.Fatalf("scan error: %v", err)
	}
	t.Fatal("unexpected EOF while reading line")
	return ""
}

func TestChatBroadcast(t *testing.T) {
	srv := NewServer("127.0.0.1:0")
	if err := srv.Start(); err != nil {
		t.Fatalf("start server: %v", err)
	}
	defer srv.Shutdown()

	addr := srv.Addr().String()

	// 클라이언트 1 접속
	c1, err := net.Dial("tcp", addr)
	if err != nil {
		t.Fatalf("dial c1: %v", err)
	}
	defer c1.Close()
	sc1 := bufio.NewScanner(c1)

	// c1 환영 메시지 및 입장 알림
	line := readLineWithDeadline(t, c1, sc1)
	if !strings.Contains(line, "환영합니다") {
		t.Fatalf("c1 expected welcome, got %q", line)
	}
	line = readLineWithDeadline(t, c1, sc1)
	if !strings.Contains(line, "guest-1 님이 입장하셨습니다") {
		t.Fatalf("c1 expected join notice, got %q", line)
	}

	// 클라이언트 2 접속
	c2, err := net.Dial("tcp", addr)
	if err != nil {
		t.Fatalf("dial c2: %v", err)
	}
	defer c2.Close()
	sc2 := bufio.NewScanner(c2)

	// c2 환영 및 입장 알림
	_ = readLineWithDeadline(t, c2, sc2) // 환영
	_ = readLineWithDeadline(t, c2, sc2) // 입장 (guest-2)

	// c1은 guest-2의 입장 알림을 수신해야 함
	line = readLineWithDeadline(t, c1, sc1)
	if !strings.Contains(line, "guest-2 님이 입장하셨습니다") {
		t.Fatalf("c1 expected guest-2 join, got %q", line)
	}

	// c1이 메시지 전송
	fmt.Fprintln(c1, "안녕하세요!")

	// c2가 브로드캐스트 메시지 수신
	line = readLineWithDeadline(t, c2, sc2)
	if line != "[guest-1] 안녕하세요!" {
		t.Fatalf("c2 expected '[guest-1] 안녕하세요!', got %q", line)
	}
}

func TestNickChange(t *testing.T) {
	srv := NewServer("127.0.0.1:0")
	if err := srv.Start(); err != nil {
		t.Fatalf("start: %v", err)
	}
	defer srv.Shutdown()

	addr := srv.Addr().String()

	c1, _ := net.Dial("tcp", addr)
	defer c1.Close()
	sc1 := bufio.NewScanner(c1)
	_ = readLineWithDeadline(t, c1, sc1) // 환영
	_ = readLineWithDeadline(t, c1, sc1) // 입장

	c2, _ := net.Dial("tcp", addr)
	defer c2.Close()
	sc2 := bufio.NewScanner(c2)
	_ = readLineWithDeadline(t, c2, sc2) // 환영
	_ = readLineWithDeadline(t, c2, sc2) // c2 입장
	_ = readLineWithDeadline(t, c1, sc1) // c1이 받는 c2 입장

	// c1이 닉네임을 Alice로 변경
	fmt.Fprintln(c1, "/nick Alice")

	// c2가 닉네임 변경 알림을 수신
	line := readLineWithDeadline(t, c2, sc2)
	if !strings.Contains(line, "Alice 으로 이름을 변경했습니다") {
		t.Fatalf("expected nick change notification, got %q", line)
	}

	// Alice가 메시지 전송
	fmt.Fprintln(c1, "반가워요")
	line = readLineWithDeadline(t, c2, sc2)
	if line != "[Alice] 반가워요" {
		t.Fatalf("expected '[Alice] 반가워요', got %q", line)
	}
}

func TestJoinLeaveNotification(t *testing.T) {
	srv := NewServer("127.0.0.1:0")
	if err := srv.Start(); err != nil {
		t.Fatalf("start: %v", err)
	}
	defer srv.Shutdown()

	addr := srv.Addr().String()

	c1, _ := net.Dial("tcp", addr)
	defer c1.Close()
	sc1 := bufio.NewScanner(c1)
	_ = readLineWithDeadline(t, c1, sc1) // 환영
	_ = readLineWithDeadline(t, c1, sc1) // c1 입장

	c2, _ := net.Dial("tcp", addr)
	sc2 := bufio.NewScanner(c2)
	_ = readLineWithDeadline(t, c2, sc2)
	_ = readLineWithDeadline(t, c2, sc2)
	_ = readLineWithDeadline(t, c1, sc1) // c1이 c2 입장 확인

	// c2 연결 종료
	_ = c2.Close()

	// c1이 퇴장 알림 수신
	line := readLineWithDeadline(t, c1, sc1)
	if !strings.Contains(line, "guest-2 님이 퇴장하셨습니다") {
		t.Fatalf("expected leave notification, got %q", line)
	}
}

func TestGracefulShutdown(t *testing.T) {
	srv := NewServer("127.0.0.1:0")
	if err := srv.Start(); err != nil {
		t.Fatalf("start: %v", err)
	}

	addr := srv.Addr().String()
	c, err := net.Dial("tcp", addr)
	if err != nil {
		t.Fatalf("dial: %v", err)
	}
	defer c.Close()
	sc := bufio.NewScanner(c)
	_ = readLineWithDeadline(t, c, sc)
	_ = readLineWithDeadline(t, c, sc)

	// 서버 셧다운
	if err := srv.Shutdown(); err != nil {
		t.Fatalf("shutdown: %v", err)
	}

	// 셧다운 후 새 연결 시도 시 에러가 나야 함
	_, err = net.DialTimeout("tcp", addr, 100*time.Millisecond)
	if err == nil {
		t.Fatal("expected dial to fail after shutdown")
	}
}

func TestConcurrentClients(t *testing.T) {
	srv := NewServer("127.0.0.1:0")
	if err := srv.Start(); err != nil {
		t.Fatalf("start: %v", err)
	}
	defer srv.Shutdown()

	addr := srv.Addr().String()
	numClients := 5
	var wg sync.WaitGroup

	for i := 0; i < numClients; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			conn, err := net.Dial("tcp", addr)
			if err != nil {
				t.Errorf("dial: %v", err)
				return
			}
			defer conn.Close()
			sc := bufio.NewScanner(conn)
			_ = conn.SetReadDeadline(time.Now().Add(2 * time.Second))
			// 환영 메시지 1줄 읽기
			if sc.Scan() {
				_ = sc.Text()
			}
			fmt.Fprintf(conn, "메시지 %d\n", id)
			time.Sleep(20 * time.Millisecond)
		}(i)
	}
	wg.Wait()
}
