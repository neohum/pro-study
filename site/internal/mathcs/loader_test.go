package mathcs

import (
	"path/filepath"
	"testing"
)

func TestLoadAndProgress(t *testing.T) {
	repoRoot, err := filepath.Abs(filepath.Join("..", "..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	store, err := Load(repoRoot)
	if err != nil {
		t.Fatalf("Load(%s) failed: %v", repoRoot, err)
	}

	m := store.Manifest()
	if m == nil || m.CourseID != "math-cs" {
		t.Fatalf("unexpected manifest: %+v", m)
	}
	if len(m.Stages) < 4 {
		t.Fatalf("expected at least 4 stages, got %d", len(m.Stages))
	}

	lessons := store.AllLessons()
	if len(lessons) == 0 {
		t.Fatal("expected non-empty lessons")
	}

	first, ok := store.GetLesson("mod-1-1-gcd-euclid")
	if !ok {
		t.Fatal("mod-1-1-gcd-euclid not found")
	}
	if len(first.SymbolGuide) == 0 {
		t.Error("expected symbolGuide in mod-1-1-gcd-euclid")
	}
	for _, lang := range []string{"python", "c", "go", "rust", "javascript", "typescript", "lisp"} {
		if _, ok := first.CodeImplementations[lang]; !ok {
			t.Errorf("missing %s implementation in mod-1-1-gcd-euclid", lang)
		}
	}
	if first.FillBlank == nil || len(first.FillBlank.Blanks) == 0 {
		t.Error("expected FillBlank in mod-1-1-gcd-euclid")
	}
	if len(first.Quizzes) == 0 {
		t.Error("expected Quizzes in mod-1-1-gcd-euclid")
	}

	// Test progress update in temp file
	store.progressPath = filepath.Join(t.TempDir(), "math_cs_progress.json")
	traced := true
	solved := true
	score := 5
	total := 5
	updated, err := store.UpdateProgress(ProgressPayload{
		LessonID:      "mod-1-1-gcd-euclid",
		FormulaTraced: &traced,
		CodeLang:      "python",
		BlankSolved:   &solved,
		QuizScore:     &score,
		QuizTotal:     &total,
	})
	if err != nil {
		t.Fatalf("UpdateProgress failed: %v", err)
	}
	if !updated.FormulaTraced || !updated.BlankSolved || !updated.QuizPassed || !updated.CodeTracedLangs["python"] {
		t.Fatalf("unexpected updated progress: %+v", updated)
	}
}
