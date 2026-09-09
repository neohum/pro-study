package main

import (
	"flag"
	"fmt"
	"io"
	"os"
)

// TODO(step-5): 서버 구성과 main 진입점
// flag.NewFlagSet으로 -addr 플래그(기본 ":8080") 파싱
// NewStore()와 NewRouter() 초기화 후 http.ListenAndServe 호출
func run(args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("rest-api", flag.ContinueOnError)
	fs.SetOutput(stderr)
	addr := fs.String("addr", ":8080", "서버 수신 주소")
	if err := fs.Parse(args); err != nil {
		return 2
	}
	_ = addr
	fmt.Fprintln(stdout, "서버 설정 완료")
	return 0
}

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}
