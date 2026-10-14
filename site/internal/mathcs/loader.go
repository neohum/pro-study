// Package mathcs는 courses/math-cs/ 커리큘럼(manifest, lessons, fill-blanks, quizzes)을
// 로드하고 학습자의 수식·코드 필사 및 퀴즈 진도를 관리한다.
package mathcs

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

type ManifestModule struct {
	ID               string   `json:"id"`
	Order            int      `json:"order"`
	TitleKo          string   `json:"titleKo"`
	MathConcept      string   `json:"mathConcept"`
	TargetAlgorithms string   `json:"targetAlgorithms"`
	Prerequisites    []string `json:"prerequisites"`
}

type ManifestStage struct {
	ID               string           `json:"id"`
	Title            string           `json:"title"`
	CurriculumOrigin string           `json:"curriculumOrigin"`
	Modules          []ManifestModule `json:"modules"`
}

type Manifest struct {
	CourseID           string          `json:"courseId"`
	Title              string          `json:"title"`
	Description        string          `json:"description"`
	SupportedLanguages []string        `json:"supportedLanguages"`
	TotalStages        int             `json:"totalStages"`
	TotalModules       int             `json:"totalModules"`
	Stages             []ManifestStage `json:"stages"`
}

type Term struct {
	Term       string `json:"term"`
	Definition string `json:"definition"`
}

type FormulaToTrace struct {
	Title       string `json:"title"`
	Latex       string `json:"latex"`
	Explanation string `json:"explanation"`
}

type SymbolGuideItem struct {
	Symbol  string `json:"symbol"`
	Name    string `json:"name"`
	Meaning string `json:"meaning"`
}

type DerivationStep struct {
	StepNumber     int    `json:"stepNumber"`
	MathExpression string `json:"mathExpression"`
	Justification  string `json:"justification"`
}

type WorkedExample struct {
	Problem      string   `json:"problem"`
	StepsToTrace []string `json:"stepsToTrace"`
	FinalAnswer  string   `json:"finalAnswer"`
}

type CodeImplementation struct {
	Lang      string `json:"lang"`
	EntryFile string `json:"entryFile"`
	Code      string `json:"code"`
	Notes     string `json:"notes"`
}

type FillBlankItem struct {
	ModuleTitle   string   `json:"moduleTitle"`
	LatexTemplate string   `json:"latexTemplate"`
	Blanks        []string `json:"blanks"`
	Hint          string   `json:"hint"`
}

type QuizQuestion struct {
	ID          string   `json:"id"`
	Question    string   `json:"question"`
	Options     []string `json:"options"`
	AnswerIndex int      `json:"answerIndex"`
	Explanation string   `json:"explanation"`
}

type Lesson struct {
	ID                     string                        `json:"id"`
	Stage                  string                        `json:"stage"`
	Order                  int                           `json:"order"`
	TitleKo                string                        `json:"titleKo"`
	TitleEn                string                        `json:"titleEn"`
	KoreanCurriculumUnit   string                        `json:"koreanCurriculumUnit"`
	GraphType              string                        `json:"graphType"`
	GraphCaption           string                        `json:"graphCaption"`
	Terms                  []Term                        `json:"terms"`
	MathExplanation        string                        `json:"mathExplanation"`
	MathFormulasToTrace    []FormulaToTrace              `json:"mathFormulasToTrace"`
	SymbolGuide            []SymbolGuideItem             `json:"symbolGuide"`
	DerivationStepsToTrace []DerivationStep              `json:"derivationStepsToTrace"`
	WorkedExample          WorkedExample                 `json:"workedExample"`
	CSIntuition            string                        `json:"csIntuition"`
	CodeImplementations    map[string]CodeImplementation `json:"codeImplementations"`
	FillBlank              *FillBlankItem                `json:"fillBlank,omitempty"`
	Quizzes                []QuizQuestion                `json:"quizzes,omitempty"`
}

type LessonProgress struct {
	LessonID        string          `json:"lessonId"`
	FormulaTraced   bool            `json:"formulaTraced"`
	CodeTracedLangs map[string]bool `json:"codeTracedLangs"`
	BlankSolved     bool            `json:"blankSolved"`
	QuizScore       int             `json:"quizScore"`
	QuizTotal       int             `json:"quizTotal"`
	QuizPassed      bool            `json:"quizPassed"`
	UpdatedAt       string          `json:"updatedAt"`
}

type ProgressPayload struct {
	LessonID      string `json:"lessonId"`
	FormulaTraced *bool  `json:"formulaTraced,omitempty"`
	CodeLang      string `json:"codeLang,omitempty"`
	BlankSolved   *bool  `json:"blankSolved,omitempty"`
	QuizScore     *int   `json:"quizScore,omitempty"`
	QuizTotal     *int   `json:"quizTotal,omitempty"`
}

type Store struct {
	mu           sync.RWMutex
	manifest     *Manifest
	lessons      map[string]*Lesson
	ordered      []*Lesson
	blanks       map[string]FillBlankItem
	quizzes      map[string][]QuizQuestion
	progressPath string
	progress     map[string]LessonProgress
}

func Load(rootDir string) (*Store, error) {
	baseDir := filepath.Join(rootDir, "courses", "math-cs")

	mBytes, err := os.ReadFile(filepath.Join(baseDir, "manifest.json"))
	if err != nil {
		return nil, fmt.Errorf("math-cs manifest.json 읽기 실패: %w", err)
	}
	var manifest Manifest
	if err := json.Unmarshal(mBytes, &manifest); err != nil {
		return nil, fmt.Errorf("math-cs manifest.json 파싱 실패: %w", err)
	}

	lBytes, err := os.ReadFile(filepath.Join(baseDir, "lessons.json"))
	if err != nil {
		return nil, fmt.Errorf("math-cs lessons.json 읽기 실패: %w", err)
	}
	var rawLessons []*Lesson
	if err := json.Unmarshal(lBytes, &rawLessons); err != nil {
		return nil, fmt.Errorf("math-cs lessons.json 파싱 실패: %w", err)
	}

	bBytes, err := os.ReadFile(filepath.Join(baseDir, "derivations", "fill-blanks.json"))
	if err != nil {
		return nil, fmt.Errorf("math-cs fill-blanks.json 읽기 실패: %w", err)
	}
	var blanks map[string]FillBlankItem
	if err := json.Unmarshal(bBytes, &blanks); err != nil {
		return nil, fmt.Errorf("math-cs fill-blanks.json 파싱 실패: %w", err)
	}

	qBytes, err := os.ReadFile(filepath.Join(baseDir, "quizzes", "checkpoint-quizzes.json"))
	if err != nil {
		return nil, fmt.Errorf("math-cs checkpoint-quizzes.json 읽기 실패: %w", err)
	}
	var quizzes map[string][]QuizQuestion
	if err := json.Unmarshal(qBytes, &quizzes); err != nil {
		return nil, fmt.Errorf("math-cs checkpoint-quizzes.json 파싱 실패: %w", err)
	}

	lessonMap := make(map[string]*Lesson, len(rawLessons))
	for _, l := range rawLessons {
		if l.CodeImplementations == nil {
			l.CodeImplementations = map[string]CodeImplementation{}
		}
		if _, hasLisp := l.CodeImplementations["lisp"]; !hasLisp {
			l.CodeImplementations["lisp"] = defaultLispImplementation(l)
		}
		if fb, ok := blanks[l.ID]; ok {
			cp := fb
			l.FillBlank = &cp
		} else if l.ID == "mod-1-5-pythagoras-distance" {
			if fb, ok := blanks["mod-1-4-pythagoras-distance"]; ok {
				cp := fb
				l.FillBlank = &cp
			}
		}
		if l.FillBlank == nil && len(l.MathFormulasToTrace) > 0 {
			l.FillBlank = &FillBlankItem{
				ModuleTitle:   l.TitleKo,
				LatexTemplate: l.MathFormulasToTrace[0].Latex + " \\implies [BLANK_1]",
				Blanks:        []string{"\\text{verified}"},
				Hint:          l.MathFormulasToTrace[0].Explanation,
			}
		}

		if qz, ok := quizzes[l.ID]; ok {
			l.Quizzes = qz
		} else if l.ID == "mod-1-5-pythagoras-distance" {
			if qz, ok := quizzes["mod-1-4-pythagoras-distance"]; ok {
				l.Quizzes = qz
			}
		}
		if len(l.Quizzes) == 0 && len(l.Terms) > 0 {
			l.Quizzes = []QuizQuestion{
				{
					ID:          l.ID + "-q1",
					Question:    fmt.Sprintf("%s에서 '%s'의 올바른 수학적 정의는?", l.TitleKo, l.Terms[0].Term),
					Options:     []string{l.Terms[0].Definition, "항상 0이 되는 상수항", "정의역이 공집합인 관계", "부호 비트가 반전된 부동소수점"},
					AnswerIndex: 0,
					Explanation: l.Terms[0].Definition,
				},
			}
		}
		lessonMap[l.ID] = l
	}

	progPath := filepath.Join(rootDir, "data", "math_cs_progress.json")
	progMap := map[string]LessonProgress{}
	if pBytes, err := os.ReadFile(progPath); err == nil && len(pBytes) > 0 {
		_ = json.Unmarshal(pBytes, &progMap)
	}

	return &Store{
		manifest:     &manifest,
		lessons:      lessonMap,
		ordered:      rawLessons,
		blanks:       blanks,
		quizzes:      quizzes,
		progressPath: progPath,
		progress:     progMap,
	}, nil
}

func defaultLispImplementation(l *Lesson) CodeImplementation {
	switch l.ID {
	case "mod-1-1-gcd-euclid":
		return CodeImplementation{
			Lang:      "lisp",
			EntryFile: "gcd.lisp",
			Code:      "(defun euclid-gcd (a b)\n  (if (zerop b)\n      a\n      (euclid-gcd b (mod a b))))\n\n(format t \"GCD(1071, 462) = ~A~%\" (euclid-gcd 1071 462))\n",
			Notes:     "Common Lisp 꼬리 재귀 유클리드 호제법",
		}
	default:
		return CodeImplementation{
			Lang:      "lisp",
			EntryFile: "main.lisp",
			Code:      fmt.Sprintf(";; %s (%s)\n(defun solve-math-module (x)\n  (* x x))\n\n(format t \"Result = ~A~%%\" (solve-math-module 4))\n", l.TitleKo, l.ID),
			Notes:     "Common Lisp 순수 함수형 수식 구현",
		}
	}
}

func (s *Store) Manifest() *Manifest {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.manifest
}

func (s *Store) AllLessons() []*Lesson {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return append([]*Lesson(nil), s.ordered...)
}

func (s *Store) GetLesson(id string) (*Lesson, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	l, ok := s.lessons[id]
	return l, ok
}

func (s *Store) FillBlanks() map[string]FillBlankItem {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make(map[string]FillBlankItem, len(s.blanks))
	for k, v := range s.blanks {
		out[k] = v
	}
	return out
}

func (s *Store) CheckpointQuizzes() map[string][]QuizQuestion {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make(map[string][]QuizQuestion, len(s.quizzes))
	for k, v := range s.quizzes {
		out[k] = append([]QuizQuestion(nil), v...)
	}
	return out
}

func (s *Store) AllProgress() map[string]LessonProgress {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make(map[string]LessonProgress, len(s.progress))
	for k, v := range s.progress {
		langs := make(map[string]bool, len(v.CodeTracedLangs))
		for lk, lv := range v.CodeTracedLangs {
			langs[lk] = lv
		}
		v.CodeTracedLangs = langs
		out[k] = v
	}
	return out
}

func (s *Store) UpdateProgress(p ProgressPayload) (LessonProgress, error) {
	if strings.TrimSpace(p.LessonID) == "" {
		return LessonProgress{}, fmt.Errorf("lessonId가 비어 있습니다")
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	cur, ok := s.progress[p.LessonID]
	if !ok {
		cur = LessonProgress{
			LessonID:        p.LessonID,
			CodeTracedLangs: map[string]bool{},
		}
	}
	if cur.CodeTracedLangs == nil {
		cur.CodeTracedLangs = map[string]bool{}
	}
	if p.FormulaTraced != nil {
		cur.FormulaTraced = *p.FormulaTraced
	}
	if p.CodeLang != "" {
		cur.CodeTracedLangs[strings.ToLower(strings.TrimSpace(p.CodeLang))] = true
	}
	if p.BlankSolved != nil {
		cur.BlankSolved = *p.BlankSolved
	}
	if p.QuizScore != nil && p.QuizTotal != nil {
		cur.QuizScore = *p.QuizScore
		cur.QuizTotal = *p.QuizTotal
		cur.QuizPassed = *p.QuizTotal > 0 && *p.QuizScore >= *p.QuizTotal
	}
	cur.UpdatedAt = time.Now().Format(time.RFC3339)
	s.progress[p.LessonID] = cur

	if err := os.MkdirAll(filepath.Dir(s.progressPath), 0o755); err == nil {
		if raw, err := json.MarshalIndent(s.progress, "", "  "); err == nil {
			_ = os.WriteFile(s.progressPath, raw, 0o644)
		}
	}
	return cur, nil
}
