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

// TODO(step-5): CLI 명령 디스패치와 실행기
// flag.NewFlagSet으로 -dir 플래그 파싱.
// Open(dir)으로 저장소를 열고 defer store.Close() 호출.
// 서브커맨드(set, get, del, snapshot, list)에 따라 Store 메서드 호출 및 결과 출력.
func run(args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("kvstore", flag.ContinueOnError)
	fs.SetOutput(stderr)
	dir := fs.String("dir", "data", "데이터 저장 디렉터리")
	if err := fs.Parse(args); err != nil {
		return 2
	}
	_ = dir
	_ = stdout
	fmt.Fprint(stderr, usageText)
	return 0
}

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}
