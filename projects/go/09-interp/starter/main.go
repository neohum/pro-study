package main

import (
	"flag"
	"fmt"
	"io"
	"os"
)

// TODO(step-5): RunScript 함수와 main CLI(플래그 파싱 및 데모 코드 실행) 구현
func RunScript(code string, out io.Writer) error {
	_ = code
	_ = out
	return nil
}

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}

func run(args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("interp", flag.ContinueOnError)
	fs.SetOutput(stderr)
	_ = fs.Parse(args)
	fmt.Fprintln(stdout, "=== 09-interp starter ===")
	return 0
}
