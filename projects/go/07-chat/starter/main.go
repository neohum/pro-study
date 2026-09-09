package main

import (
	"flag"
	"fmt"
	"io"
	"os"
)

// TODO(step-5): Graceful Shutdown과 서버 진입점
// flag.NewFlagSet으로 -port 플래그(기본 9000) 파싱.
// NewServer(addr) 생성 후 srv.Start() 호출.
// os.Interrupt 및 syscall.SIGTERM 수신 대기(signal.Notify).
// 시그널 수신 시 srv.Shutdown() 호출하여 정리 후 종료.
func run(args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("chat", flag.ContinueOnError)
	fs.SetOutput(stderr)
	port := fs.Int("port", 9000, "TCP 수신 포트")
	if err := fs.Parse(args); err != nil {
		return 2
	}
	_ = port
	fmt.Fprintln(stdout, "채팅 서버 대기 중")
	return 0
}

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}
