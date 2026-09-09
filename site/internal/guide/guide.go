// Package guide는 프로젝트 README.md를 HTML 가이드와 목차로 바꾼다.
package guide

import (
	"bytes"
	"fmt"
	"html/template"
	"strings"
	"unicode"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
	"github.com/yuin/goldmark/text"
)

// Heading은 목차 항목이다.
type Heading struct {
	ID    string
	Text  string
	Level int
}

// Doc은 렌더된 가이드다.
type Doc struct {
	HTML template.HTML
	TOC  []Heading
}

// Render는 마크다운을 HTML로 바꾸고 h2·h3 목차를 뽑는다.
func Render(src []byte) (Doc, error) {
	md := goldmark.New(
		goldmark.WithExtensions(extension.GFM),
		goldmark.WithParserOptions(parser.WithAutoHeadingID()),
		goldmark.WithRendererOptions(html.WithUnsafe()),
	)
	ctx := parser.NewContext(parser.WithIDs(newIDs()))
	reader := text.NewReader(src)
	node := md.Parser().Parse(reader, parser.WithContext(ctx))

	var toc []Heading
	ast.Walk(node, func(n ast.Node, entering bool) (ast.WalkStatus, error) {
		h, ok := n.(*ast.Heading)
		if !ok || !entering || h.Level < 2 || h.Level > 3 {
			return ast.WalkContinue, nil
		}
		id, _ := h.AttributeString("id")
		toc = append(toc, Heading{
			ID:    string(idBytes(id)),
			Text:  headingText(h, src),
			Level: h.Level,
		})
		return ast.WalkContinue, nil
	})

	var buf bytes.Buffer
	if err := md.Renderer().Render(&buf, src, node); err != nil {
		return Doc{}, err
	}
	return Doc{HTML: template.HTML(buf.String()), TOC: toc}, nil
}

func idBytes(v any) []byte {
	switch b := v.(type) {
	case []byte:
		return b
	case string:
		return []byte(b)
	}
	return nil
}

func headingText(h *ast.Heading, src []byte) string {
	var sb strings.Builder
	ast.Walk(h, func(n ast.Node, entering bool) (ast.WalkStatus, error) {
		if !entering {
			return ast.WalkContinue, nil
		}
		switch t := n.(type) {
		case *ast.Text:
			sb.Write(t.Segment.Value(src))
		case *ast.String:
			sb.Write(t.Value)
		case *ast.CodeSpan:
			for c := t.FirstChild(); c != nil; c = c.NextSibling() {
				if tx, ok := c.(*ast.Text); ok {
					sb.Write(tx.Segment.Value(src))
				}
			}
			return ast.WalkSkipChildren, nil
		}
		return ast.WalkContinue, nil
	})
	return strings.TrimSpace(sb.String())
}

// ids는 한글 제목도 그대로 id로 쓰는 생성기다. goldmark 기본 생성기는 ASCII만 남겨
// "무엇을 만드는가"가 "heading"이 되어 버린다.
type ids struct{ seen map[string]int }

func newIDs() parser.IDs { return &ids{seen: map[string]int{}} }

func (g *ids) Generate(value []byte, kind ast.NodeKind) []byte {
	var sb strings.Builder
	prevDash := true
	for _, r := range string(value) {
		switch {
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			sb.WriteRune(unicode.ToLower(r))
			prevDash = false
		case !prevDash:
			sb.WriteByte('-')
			prevDash = true
		}
	}
	id := strings.Trim(sb.String(), "-")
	if id == "" {
		id = "section"
	}
	return g.unique(id)
}

func (g *ids) Put(value []byte) { g.seen[string(value)]++ }

func (g *ids) unique(id string) []byte {
	n := g.seen[id]
	g.seen[id]++
	if n == 0 {
		return []byte(id)
	}
	return []byte(fmt.Sprintf("%s-%d", id, n))
}
