package main

import (
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
)

func run(args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("rest-api", flag.ContinueOnError)
	fs.SetOutput(stderr)
	addr := fs.String("addr", ":8080", "서버 수신 주소")
	if err := fs.Parse(args); err != nil {
		return 2
	}

	store := NewStore()
	router := NewRouter(store)

	fmt.Fprintf(stdout, "서버 시작: %s\n", *addr)
	if err := http.ListenAndServe(*addr, router); err != nil {
		fmt.Fprintf(stderr, "서버 오류: %v\n", err)
		return 1
	}
	return 0
}

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}
