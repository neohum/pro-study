package guide

import (
	"strings"
	"testing"
)

func TestRenderTOCAndKoreanIDs(t *testing.T) {
	src := []byte("# 제목\n\n## 무엇을 만드는가\n\n본문\n\n### 핵심 개념 `constexpr`\n\n## 무엇을 만드는가\n\n| a | b |\n|---|---|\n| 1 | 2 |\n")
	doc, err := Render(src)
	if err != nil {
		t.Fatal(err)
	}
	if len(doc.TOC) != 3 {
		t.Fatalf("TOC = %+v", doc.TOC)
	}
	if doc.TOC[0].ID != "무엇을-만드는가" || doc.TOC[0].Level != 2 {
		t.Errorf("TOC[0] = %+v", doc.TOC[0])
	}
	if doc.TOC[1].Text != "핵심 개념 constexpr" || doc.TOC[1].ID != "핵심-개념-constexpr" {
		t.Errorf("TOC[1] = %+v", doc.TOC[1])
	}
	if doc.TOC[2].ID != "무엇을-만드는가-1" {
		t.Errorf("중복 제목 id = %q", doc.TOC[2].ID)
	}
	html := string(doc.HTML)
	if !strings.Contains(html, `<h2 id="무엇을-만드는가">`) {
		t.Errorf("h2 id 누락: %s", html)
	}
	if !strings.Contains(html, "<table>") {
		t.Errorf("GFM 표가 렌더되지 않음")
	}
}

func TestRenderCodeFenceKeepsLanguageClass(t *testing.T) {
	doc, err := Render([]byte("```c\nint x = 0b1010;\n```\n"))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(doc.HTML), `<code class="language-c">`) {
		t.Errorf("language class 누락: %s", doc.HTML)
	}
}
