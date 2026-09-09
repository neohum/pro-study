// Package web은 템플릿과 정적 파일을 바이너리에 내장한다.
package web

import "embed"

// Templates는 web/templates/*.html.
//
//go:embed templates/*.html
var Templates embed.FS

// Static은 web/static 아래 전부(css, js, vendor, 로고).
//
//go:embed static
var Static embed.FS
