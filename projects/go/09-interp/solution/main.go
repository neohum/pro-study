package main

import (
	"flag"
	"fmt"
	"io"
	"os"
)

func RunScript(code string, out io.Writer) error {
	l := NewLexer(code)
	p := NewParser(l)
	prog := p.ParseProgram()
	if len(p.Errors()) > 0 {
		for _, msg := range p.Errors() {
			fmt.Fprintln(out, "문법 에러:", msg)
		}
		return fmt.Errorf("구문 분석 에러 %d건", len(p.Errors()))
	}

	env := NewEnvironment(nil, out)
	result := Eval(prog, env)
	if result != nil && result.Type() == "ERROR" {
		fmt.Fprintln(out, result.Inspect())
		return fmt.Errorf("실행 에러: %s", result.Inspect())
	}
	return nil
}

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}

func run(args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("interp", flag.ContinueOnError)
	fs.SetOutput(stderr)
	exprFlag := fs.String("e", "", "실행할 스크립트 코드")
	if err := fs.Parse(args); err != nil {
		return 2
	}

	if *exprFlag != "" {
		if err := RunScript(*exprFlag, stdout); err != nil {
			return 1
		}
		return 0
	}

	rest := fs.Args()
	if len(rest) > 0 {
		content, err := os.ReadFile(rest[0])
		if err != nil {
			fmt.Fprintf(stderr, "파일 읽기 실패: %v\n", err)
			return 1
		}
		if err := RunScript(string(content), stdout); err != nil {
			return 1
		}
		return 0
	}

	// 기본 데모 실행
	fmt.Fprintln(stdout, "=== 09-interp 스크립트 실행 데모 ===")
	demo := `let x = 1;
let sum = 0;
while (x <= 5) {
    sum = sum + x;
    print("x=" + x + ", 누적합=" + sum);
    x = x + 1;
}
if (sum == 15) {
    print("성공: 1부터 5까지의 합 = " + sum);
}
`
	if err := RunScript(demo, stdout); err != nil {
		return 1
	}
	return 0
}
