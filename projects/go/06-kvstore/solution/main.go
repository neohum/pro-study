package main

import (
	"flag"
	"fmt"
	"io"
	"os"
)

const usageText = `사용법: app.exe -dir <DIR> <command> [args]

commands:
  set KEY VALUE   키에 값을 저장
  get KEY         키의 값 조회
  del KEY         키 삭제
  snapshot        스냅샷 생성 및 WAL 압축
  list            모든 키 목록 출력
`

func run(args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("kvstore", flag.ContinueOnError)
	fs.SetOutput(stderr)
	dir := fs.String("dir", "data", "데이터 저장 디렉터리")
	if err := fs.Parse(args); err != nil {
		return 2
	}

	rest := fs.Args()
	if len(rest) == 0 {
		fmt.Fprint(stderr, usageText)
		return 2
	}

	store, err := Open(*dir)
	if err != nil {
		fmt.Fprintf(stderr, "저장소 오픈 실패: %v\n", err)
		return 1
	}
	defer store.Close()

	cmd := rest[0]
	switch cmd {
	case "set":
		if len(rest) < 3 {
			fmt.Fprintln(stderr, "사용법: set KEY VALUE")
			return 2
		}
		if err := store.Set(rest[1], rest[2]); err != nil {
			fmt.Fprintf(stderr, "set 실패: %v\n", err)
			return 1
		}
		fmt.Fprintln(stdout, "OK")
	case "get":
		if len(rest) < 2 {
			fmt.Fprintln(stderr, "사용법: get KEY")
			return 2
		}
		val, ok := store.Get(rest[1])
		if !ok {
			fmt.Fprintln(stdout, "(not found)")
			return 1
		}
		fmt.Fprintln(stdout, val)
	case "del":
		if len(rest) < 2 {
			fmt.Fprintln(stderr, "사용법: del KEY")
			return 2
		}
		deleted, err := store.Delete(rest[1])
		if err != nil {
			fmt.Fprintf(stderr, "del 실패: %v\n", err)
			return 1
		}
		if !deleted {
			fmt.Fprintln(stdout, "(not found)")
			return 1
		}
		fmt.Fprintln(stdout, "OK")
	case "snapshot":
		if err := store.Snapshot(); err != nil {
			fmt.Fprintf(stderr, "snapshot 실패: %v\n", err)
			return 1
		}
		fmt.Fprintln(stdout, "스냅샷 생성 완료")
	case "list":
		keys := store.Keys()
		for _, k := range keys {
			val, _ := store.Get(k)
			fmt.Fprintf(stdout, "%s = %s\n", k, val)
		}
	default:
		fmt.Fprintf(stderr, "알 수 없는 명령: %s\n", cmd)
		return 2
	}
	return 0
}

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}
