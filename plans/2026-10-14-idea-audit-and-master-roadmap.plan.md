---
plan: 2026-10-14-idea-audit-and-master-roadmap
slug: 2026-10-14-idea-audit-and-master-roadmap
title: "pro-study 기존 9개 플랜 실현 여부 전수 대조 및 Lisp·NASM 로컬 워크스페이스·수식-코드 필사 라우트 완결 로드맵"
status: done
owner: neohum
risk: medium
created: 2026-10-14
---

## Intent

`pro-study` 저장소의 기존 9개 계획서(`plans/*.plan.md`)를 Go 웹 서버(`site/`), 로컬 프로젝트 카탈로그(`projects/`), 커리큘럼 데이터(`courses/`, `content/`), 안드로이드 E-ink 앱(`android-app/`)과 전수 대조하여 **구현 완료 / 부분 구현 / 미구현** 상태를 판정하고, 대조 결과 발견된 2가지 핵심 미완결 지점인 **① `projects/lisp` 및 `projects/nasm` 로컬 프로젝트 디렉터리 누락 복원(현재 APK 에셋에만 존재)**과 **② `courses/math-cs` 수식-코드 2중 필사 전용 Go 웹 라우트(`/math`, `/trace/math`, `/math/progress`) 누락 완성**, 그리고 **③ 시뮬레이터 파라미터 프리셋 북마크 및 필사 오답 복습 덱**을 단계별 실행 계획으로 통합한다.

## 기존 플랜 실현 여부 대조 및 가치 평가

| 번호 | 플랜 파일명 | 판정 | 실제 코드 근거 (`site/`, `projects/`, `courses/`, `android-app/`) | 추가 가치 평가 및 우선순위 |
| --- | --- | --- | --- | --- |
| 1 | `lang-study-site.plan.md` | **구현 완료** | `site/main.go`, `site/internal/catalog/`, `guide/`, `opener/`, `runner/`, `progress/`, `projects/c/01..10`, `projects/go/01..10` | **유지 (P3)** — Go 웹 학습 포털 및 C/Go/Rust/Python/JS/TS 로컬 프로젝트 완비 |
| 2 | `eink-study-app.plan.md` | **구현 완료** | `android-app/`, `android-app/app/src/main/assets/content/` | **유지 (P3)** — 오프라인 E-ink 안드로이드 리더 및 필사 앱 구축 완료 |
| 3 | `lang-reference-and-tour-tracing.plan.md` | **구현 완료** | `content/reference/*.json` (8개 언어), `courses/tour-go/`, `site/internal/reference/`, `site/internal/tour/` | **유지 (P3)** — 8개 언어 문법 레퍼런스 및 Go 투어 필사 완료 |
| 4 | `k12-math-complete-guide.plan.md` | **구현 완료** | `courses/k12-math/` (중1~고3 70개 유닛 JSON), `site/web/static/math/`, `android-app/app/src/main/assets/k12-math/` | **유지 (P3)** — 중·고교 수학 70단원 개념·유도·검증 완료 |
| 5 | `math-ee-curriculum-suite.plan.md` | **구현 완료** | `courses/math-symbols/`, `courses/electrical-eng/`, `courses/electronics-eng/`, `site/web/static/simulators/ee/`, `electronics/`, `site/web/static/math-ee/` | **유지 (P3)** — 수학 기호 사전 및 전기·전자공학 커리큘럼·시뮬레이터 완료 |
| 6 | `ee-roadmap-curriculum-and-simulators.plan.md` | **구현 완료** | `courses/ee-comparative/roadmap-curriculum.json`, `site/web/static/simulators/computer/cpu-sim.js`, `circuit/circuit-sandbox.js`, `ee/inverter-motor.js` | **유지 (P3)** — 8비트 CPU, 회로 샌드박스, 인버터-모터 시뮬레이터 완료 |
| 7 | `color-eink-contrast-and-white-simulators.plan.md` | **구현 완료** | `site/web/static/math-ee/viewer.css`, `cpu-sim.css`, `circuit-sandbox.js`, `inverter-motor.js` | **유지 (P3)** — 컬러/흑백 E-ink 순백 배경 및 고대비 팔레트 적용 완료 |
| 8 | `lisp-nasm-curriculum-suite.plan.md` | **부분 구현** | `android-app/app/src/main/assets/content/lisp_01..10.json`, `nasm_01..10.json` 및 `content/reference/lisp.json`, `nasm.json`은 구현되어 있으나, 정작 Go 웹 서버(`site/internal/catalog`)가 스캔하는 **`projects/lisp/01..10` 및 `projects/nasm/01..10` 디렉터리가 누락**되어 웹 포털에서 Lisp과 NASM 20개 프로젝트를 열거나 실행할 수 없음 | **최우선 완결 (P1, Critical Gap)** — 이미 작성된 고품질 Lisp/NASM 20개 프로젝트 에셋을 `projects/lisp/*`, `projects/nasm/*` 표준 워크스페이스 구조(`project.json`, `README.md`, `starter/`, `solution/`, `tests/`)로 복원하여 웹과 데스크톱 IDE 연동을 완성 |
| 9 | `math-programming-transcription.plan.md` | **부분 구현** | `courses/math-cs/manifest.json`, `lessons.json`, `quizzes/checkpoint-quizzes.json`, `derivations/fill-blanks.json`, `tests/test_mastery_suite.ts` 및 안드로이드 에셋은 존재하나, 플랜 Step 6에 명시된 **Go 웹 서버의 `/math`, `/trace/math`, `/math/progress` 전용 라우트(`site/internal/math/`)가 미구현** 상태 | **최우선 완결 (P1, High Value)** — `courses/math-cs/`의 이산수학·선형대수·미적분·확률통계 수식 필사 및 6개 언어 코드 필사, 빈칸 유도(Fill-in-the-blank), 체크포인트 퀴즈를 Go 웹 서버에서도 완벽히 수행할 수 있도록 라우트 및 UI 연결 |
| 10 | *(신규 발굴)* 시뮬레이터 실험 프리셋 저장 및 수식·코드 필사 복습 북마크 | **신규 제안** | CPU·회로·모터 시뮬레이터와 필사 뷰어에서 사용자가 실험한 파라미터나 다시 보고 싶은 수식/코드를 저장해 모아보는 기능이 없음 | **고부가가치 확장 (P2)** — 학습자가 회로/CPU 상태나 어려운 유도 단계를 원클릭 북마크하고 복습 카드 모드로 재점검 |

## Non-goals

- 이미 완결된 중·고교 수학 70개 유닛(`courses/k12-math/`)이나 전기·전자공학 JSON 본문을 재작성하지 않는다.
- E-ink 디바이스의 고대비 순백 테마 원칙(다크 글로우 금지, 명확한 `2px` 실선 테두리)을 어기지 않는다.

## Steps

### Step 1: restore-lisp-and-nasm-project-workspaces
- Goal: `android-app/app/src/main/assets/content/lisp_01..10.json` 및 `nasm_01..10.json`에 담긴 20개 프로젝트 데이터를 기반으로 `projects/lisp/01..10-*` 및 `projects/nasm/01..10-*` 로컬 프로젝트 디렉터리(`project.json`, `README.md`, `starter/`, `solution/`, `tests/`)를 생성하고, `site/internal/catalog` 및 `runner`에서 8개 언어(C, Go, Rust, Python, JS, TS, Lisp, NASM) 전체가 정상 로드되도록 연결한다.
- Files: `scripts/sync_lisp_nasm_projects.ts`, `projects/lisp/`, `projects/nasm/`, `site/internal/catalog/catalog_test.go`
- Acceptance: AC-1: `projects/lisp/` 하위 10개 프로젝트와 `projects/nasm/` 하위 10개 프로젝트가 `project.json`, `README.md`, `starter/`, `solution/`, `tests/` 구조를 갖추어 생성된다. AC-2: Go 카탈로그 로더(`catalog.Load`) 실행 시 총 8개 언어 80개 프로젝트가 누락 없이 검색되며 `go test ./...`를 통과한다.
- Tests: `cd site && go test ./internal/catalog/...`
- Risk: low
- Complexity: medium
- Agent: codex
- Reviewer: claude

### Step 2: math-cs-dual-transcription-web-routes
- Goal: `courses/math-cs/`(`manifest.json`, `lessons.json`, `derivations/fill-blanks.json`, `quizzes/checkpoint-quizzes.json`)를 로드하여 Go 웹 서버에서 제공하는 `site/internal/math/` 패키지 및 `/math-cs`, `/trace/math-cs`, `/api/math-cs/progress` 핸들러와 E-ink 고대비 2중 필사(LaTeX 수식 필사 + 6개 언어 코드 필사 + 빈칸 채우기 + 체크포인트 퀴즈) 템플릿을 구현한다.
- Files: `site/internal/mathcs/loader.go`, `site/internal/mathcs/loader_test.go`, `site/main.go`, `site/web/templates/math_cs.html`, `site/web/static/math-ee/math-cs-tracer.js`
- Acceptance: AC-1: `/math-cs` 접속 시 Stage 1~4(기초 이산수학, 선형대수, 미적분/최적화, 확률/정보이론) 레슨 목록과 수식 기호 해부도가 렌더링된다. AC-2: `/trace/math-cs`에서 LaTeX 수식 타이핑 정합 검사와 6개 언어(Python, C, Go, Rust, JS, Lisp) 코드 타이핑 검사, 빈칸 유도 검증, 체크포인트 퀴즈 채점 및 진도 저장이 동작한다.
- Tests: `cd site && go test ./...`
- Risk: medium
- Complexity: medium
- Agent: codex
- Reviewer: claude

### Step 3: simulator-preset-bookmarks-and-review-deck
- Goal: 8비트 CPU·회로 샌드박스·인버터 모터 시뮬레이터 및 수식-코드 필사 화면에서 현재 실험 파라미터나 헷갈리는 수식/코드 블록을 로컬 북마크(`proStudyBookmarks`)로 저장하고, E-ink 친화적 플래시카드 모드로 모아 복습할 수 있는 통합 복습 드로어를 추가한다.
- Files: `site/web/static/math-ee/review-bookmarks.js`, `site/web/static/math-ee/viewer.css`, `tests/test_mastery_suite.ts`
- Acceptance: AC-1: 필사 뷰어 및 시뮬레이터에서 '복습 카드 담기' 클릭 시 레슨 ID, 수식/코드 스니펫(또는 시뮬레이터 프리셋 JSON), 사용자 메모가 저장된다. AC-2: 복습 덱 모달에서 문제(수식/개념) 보기 → 정답/유도 과정 펼치기 → '완전히 이해함' 완료 체크 루프가 애니메이션 잔상 없이 즉시 전환된다.
- Tests: `npx tsx tests/test_mastery_suite.ts`
- Risk: low
- Complexity: medium
- Agent: codex
- Reviewer: claude

## Verification

- `cd site && go test ./...` Go 웹 서버 전체 패키지 단위/통합 테스트 통과
- `npx tsx tests/test_mastery_suite.ts` 커리큘럼 및 마스터리 검증 스위트 통과

## Reviewer topology

- Builder: `codex`
- Reviewer: `claude` (빌더와 독립된 프로바이더가 8개 언어 카탈로그 정합성, 수식-코드 필사 라우트 동작, E-ink 고대비 스타일 규칙 준수를 교차 검증)
