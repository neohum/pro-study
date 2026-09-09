// 01-todo-cli — JSON 저장 TODO CLI (solution)
//
// main.go: 플래그와 서브커맨드. 실제 일은 store.go의 Store가 한다.
//
//	app.exe add "우유 사기"     항목 추가
//	app.exe list               목록 출력
//	app.exe done 1 / undone 1  완료 표시 / 해제
//	app.exe rm 1               삭제
//	app.exe clear              전부 삭제
//	-file PATH                 저장 파일 (기본 todo.json)
package main

import (
	"errors"
	"flag"
	"fmt"
	"io"
	"os"
	"strconv"
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

// main은 얇다. 진짜 진입점은 run이다 — os.Args와 os.Stdout을 직접 쓰면
// 테스트가 프로세스를 띄워야 하지만, 인자와 Writer를 넘겨받으면 함수 호출로 끝난다.
func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}

// ---- Step 5: run ----

// run은 CLI 전체를 실행하고 종료 코드를 돌려준다. 0이면 성공, 1이면 실패, 2면 사용법 오류.
func run(args []string, stdout, stderr io.Writer) int {
	// flag.CommandLine(전역) 대신 FlagSet을 새로 만든다. 전역을 쓰면 테스트에서
	// run을 두 번 부를 때 "flag redefined" 패닉이 난다.
	fs := flag.NewFlagSet("todo", flag.ContinueOnError)
	fs.SetOutput(stderr)
	file := fs.String("file", "todo.json", "저장 파일 경로")
	if err := fs.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			fmt.Fprint(stderr, usageText)
			return 0
		}
		return 2
	}
	rest := fs.Args() // 플래그를 뺀 나머지: [command, args...]
	if len(rest) == 0 {
		fmt.Fprint(stderr, usageText)
		return 1
	}

	store, err := Load(*file)
	if err != nil {
		fmt.Fprintln(stderr, "todo:", err)
		return 1
	}

	// 각 서브커맨드는 (변경 여부, 에러)를 돌려준다. 변경이 있을 때만 저장한다.
	changed, err := dispatch(store, rest[0], rest[1:], stdout, stderr)
	if err != nil {
		fmt.Fprintln(stderr, "todo:", err)
		return 1
	}
	if changed {
		if err := store.Save(*file); err != nil {
			fmt.Fprintln(stderr, "todo:", err)
			return 1
		}
	}
	return 0
}

// dispatch는 서브커맨드 하나를 실행한다.
func dispatch(store *Store, cmd string, args []string, stdout, stderr io.Writer) (changed bool, err error) {
	switch cmd {
	case "add":
		if len(args) == 0 {
			return false, ErrEmptyText
		}
		// add "사과 사기" 처럼 따옴표로 묶지 않고 add 사과 사기 라고 쳐도 되게 인자를 합친다.
		item, err := store.Add(joinArgs(args))
		if err != nil {
			return false, err
		}
		fmt.Fprintln(stdout, formatItem(item))
		return true, nil

	case "list":
		store.List(stdout)
		return false, nil

	case "done", "undone", "rm":
		id, err := parseID(args)
		if err != nil {
			return false, err
		}
		switch cmd {
		case "done":
			err = store.Done(id)
		case "undone":
			err = store.Undone(id)
		case "rm":
			err = store.Remove(id)
		}
		if err != nil {
			return false, err
		}
		if cmd != "rm" {
			it, _ := store.Find(id) // 방금 성공했으므로 반드시 있다
			fmt.Fprintln(stdout, formatItem(*it))
		}
		return true, nil

	case "clear":
		store.Clear()
		return true, nil

	default:
		fmt.Fprint(stderr, usageText)
		return false, fmt.Errorf("unknown command %q", cmd)
	}
}

// parseID는 "done 3"의 "3"을 정수로 바꾼다.
func parseID(args []string) (int, error) {
	if len(args) != 1 {
		return 0, errors.New("expected exactly one ID")
	}
	id, err := strconv.Atoi(args[0])
	if err != nil {
		return 0, fmt.Errorf("bad id %q", args[0])
	}
	return id, nil
}

func joinArgs(args []string) string {
	s := ""
	for i, a := range args {
		if i > 0 {
			s += " "
		}
		s += a
	}
	return s
}
