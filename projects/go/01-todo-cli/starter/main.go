// 01-todo-cli — JSON 저장 TODO CLI (starter)
//
// main.go: 플래그와 서브커맨드.
package main

import (
	"flag"
	"fmt"
	"io"
	"os"
)

const usageText = `사용법: app.exe [-file PATH] <command> [args]

commands:
  add "text"   항목 추가
  list         목록 출력
  done ID      완료 표시
  undone ID    완료 해제
  rm ID        삭제
  clear        전부 삭제
`

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}

// TODO(step-5): run / dispatch
// flag.NewFlagSet으로 -file 파싱.
// dispatch로 add, list, done, undone, rm, clear 처리.
// 변경 사항이 있으면 store.Save 호출.
func run(args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("todo", flag.ContinueOnError)
	fs.SetOutput(stderr)
	file := fs.String("file", "todo.json", "저장 파일 경로")
	if err := fs.Parse(args); err != nil {
		return 2
	}
	_ = file
	_ = stdout
	fmt.Fprint(stderr, usageText)
	return 0
}
