package main

import (
	"flag"
	"fmt"
	"io"
	"os"
	"os/signal"
	"syscall"
)

func run(args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("chat", flag.ContinueOnError)
	fs.SetOutput(stderr)
	port := fs.Int("port", 9000, "TCP 수신 포트")
	if err := fs.Parse(args); err != nil {
		return 2
	}

	addr := fmt.Sprintf(":%d", *port)
	srv := NewServer(addr)
	if err := srv.Start(); err != nil {
		fmt.Fprintf(stderr, "서버 시작 실패: %v\n", err)
		return 1
	}
	defer srv.Shutdown()

	fmt.Fprintf(stdout, "채팅 서버 시작 (포트: %d)\n", *port)

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	<-sigChan

	fmt.Fprintln(stdout, "서버를 종료합니다...")
	return 0
}

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}
