package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}

func run(args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("metrics-dashboard", flag.ContinueOnError)
	fs.SetOutput(stderr)

	serveFlag := fs.Bool("serve", false, "웹 대시보드 HTTP 서버 시작")
	addrFlag := fs.String("addr", "127.0.0.1:8080", "서버 수신 주소")
	intervalFlag := fs.Duration("interval", 1*time.Second, "메트릭 수집 및 브로드캐스트 주기")
	onceFlag := fs.Bool("once", false, "메트릭을 1회 출력하고 즉시 종료")

	if err := fs.Parse(args); err != nil {
		return 2
	}

	collector := NewCollector(60)

	// -serve 플래그가 없거나 -once 플래그가 있으면 단발성 출력 후 정상 종료
	if !*serveFlag || *onceFlag {
		snap := collector.Record()
		fmt.Fprintln(stdout, "=== 10-metrics-dashboard ===")
		fmt.Fprintln(stdout, "현재 Go 런타임 메트릭 스냅샷:")
		fmt.Fprintf(stdout, "  - 활성 고루틴: %d개\n", snap.Goroutines)
		fmt.Fprintf(stdout, "  - 힙 객체 메모리: %s (%d bytes)\n", FormatBytes(snap.HeapObjectsBytes), snap.HeapObjectsBytes)
		fmt.Fprintf(stdout, "  - 전체 런타임 메모리: %s (%d bytes)\n", FormatBytes(snap.TotalBytes), snap.TotalBytes)
		fmt.Fprintf(stdout, "  - GC 완료 사이클: %d회\n", snap.GCCycles)
		fmt.Fprintln(stdout, "\n웹 대시보드 서버 모드로 실행하려면: app.exe -serve [-addr 127.0.0.1:8080]")
		return 0
	}

	hub := NewSSEHub()
	server := NewServer(collector, hub)

	// 백그라운드 주기적 수집 및 SSE 브로드캐스트
	ticker := time.NewTicker(*intervalFlag)
	defer ticker.Stop()
	go func() {
		for range ticker.C {
			snap := collector.Record()
			if data, err := json.Marshal(snap); err == nil {
				hub.Broadcast(data)
			}
		}
	}()

	fmt.Fprintf(stdout, "=== 10-metrics-dashboard 웹 서버 시작 ===\n")
	fmt.Fprintf(stdout, "대시보드 주소: http://%s\n", *addrFlag)
	fmt.Fprintf(stdout, "수집 주기: %v\n", *intervalFlag)
	fmt.Fprintln(stdout, "서버를 종료하려면 Ctrl+C를 누르세요.")

	if err := http.ListenAndServe(*addrFlag, server.Handler()); err != nil {
		fmt.Fprintf(stderr, "서버 실행 오류: %v\n", err)
		return 1
	}
	return 0
}
