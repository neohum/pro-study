package main

import (
	"fmt"
	"io"
)

func FormatBytes(b uint64) string {
	return fmt.Sprintf("%d B", b)
}

// TODO(step-3): html/template 기반 대시보드 템플릿과 RenderDashboard 구현
func RenderDashboard(w io.Writer, s Snapshot) error {
	_ = w
	_ = s
	return nil
}
