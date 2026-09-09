package main

import (
	"flag"
	"fmt"
	"io"
	"os"
)

// TODO(step-5): CLI 플래그(-serve, -addr, -interval, -once) 파싱 및 서버 실행/단발 출력 처리
func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}

func run(args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("metrics-dashboard", flag.ContinueOnError)
	fs.SetOutput(stderr)
	_ = fs.Parse(args)
	fmt.Fprintln(stdout, "=== 10-metrics-dashboard starter ===")
	return 0
}
