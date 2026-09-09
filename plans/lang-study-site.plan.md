---
plan: lang-study-site
status: approved
risk: medium
owner: neohum
---
# Plan: C23·Go 학습용 로컬 웹 사이트 (pro-study)

## Intent
`scripts/dev.ps1` 한 번으로 `http://127.0.0.1:8787`이 뜨고, 브라우저에서 C23 프로젝트 10개와
Go 프로젝트 10개의 가이드(목표·개념·단계별 설명)와 코드를 읽은 뒤 **[VS Code에서 열기]**
버튼으로 작업 폴더를 열어 코딩하고, 다시 브라우저의 **[빌드] [실행] [테스트]** 버튼으로
결과와 통과/실패 판정을 확인하며 진행률이 저장된다.

## Non-goals
- 브라우저 안에서 코드를 편집하거나 컴파일하는 기능 (편집은 VS Code, 컴파일은 로컬 툴체인)
- 외부 네트워크 접속·인증·배포 (127.0.0.1 바인딩 전용, 단일 사용자)
- Linux/macOS 지원 (1차 타깃은 Windows 11 + MinGW gcc 15 + Go 1.26; 경로·명령은 추상화만 해둔다)
- C와 Go 프로젝트를 1:1로 맞추는 것 (언어가 잘 가르치는 주제를 각각 고른다)
- 동영상·퀴즈·채점 서버 등 LMS 기능

## 배경: 확인된 로컬 환경 (2026-09-10)

| 도구 | 버전 | 비고 |
| --- | --- | --- |
| gcc | 15.2.0 (MinGW) | `-std=c23` 컴파일 확인됨. clang 없음 |
| go | 1.26.1 windows/386 | 32비트 툴체인. `GOARCH=386`이 기본 |
| VS Code | 1.125.1 | `code` CLI가 PATH에 있음 |
| node | 24.14.1 | 하네스 스크립트용. 사이트 런타임에는 쓰지 않는다 |

## 아키텍처

사이트 서버 자체를 **Go로 작성**한다. 학습자가 Go 10번째 프로젝트를 끝낼 즈음
사이트 코드를 읽을 수 있게 되므로, 서버가 곧 마지막 교재가 된다.

```
pro-study/
├─ site/                       Go 모듈 (module pro-study/site) — 로컬 웹 서버
│  ├─ main.go                  127.0.0.1:8787, 브라우저 자동 오픈, graceful shutdown
│  ├─ internal/catalog/        projects/*/*/project.json 로드·검증, 언어별 목록
│  ├─ internal/guide/          README.md → HTML (goldmark), 코드 블록 하이라이트
│  ├─ internal/opener/         `code <dir> -g <file>` 실행 + vscode:// URL 생성
│  ├─ internal/runner/         빌드/실행/테스트 실행기, 타임아웃, SSE 스트리밍
│  ├─ internal/progress/       data/progress.json 읽기·쓰기 (sync.Mutex)
│  └─ web/                     templates/*.html, static/{app.css,app.js,logo.svg,favicon.ico} (go:embed)
├─ projects/
│  ├─ c/01-calc/ … c/10-http-server/
│  └─ go/01-todo-cli/ … go/10-metrics-dashboard/
│     └─ <각 프로젝트>
│        ├─ project.json       제목·개념·난이도·빌드/실행/테스트 명령·테스트 케이스
│        ├─ README.md          가이드: 목표 → 핵심 개념 → 단계별 구현 → 힌트 → 더 나아가기
│        ├─ starter/           TODO가 있는 뼈대 코드 (읽기 전용 원본)
│        ├─ solution/          완성 코드 (웹에서 기본 접힘, "정답 보기" 토글)
│        ├─ tests/             입력·기대 출력 (`cases/NN.in`, `NN.out`) 또는 `*_test.go`
│        └─ .vscode/           tasks.json(빌드·실행), launch.json(디버그), settings.json
├─ work/                       학습자 작업 폴더. 첫 [열기] 때 starter/를 복사. git-ignored
├─ data/progress.json          프로젝트별 상태(not-started/in-progress/passed), 마지막 실행 결과
└─ scripts/dev.ps1             툴체인 점검(doctor) → go run ./site → 브라우저 오픈
```

### 화면 구성

| 화면 | 내용 |
| --- | --- |
| `/` 홈 | 언어 탭(C23 / Go) → 프로젝트 카드 10개(번호·제목·난이도·핵심 개념·상태 뱃지), 전체 진행률 바 |
| `/p/{lang}/{slug}` 상세 | **왼쪽** 가이드(README 렌더, 목차 고정) · **오른쪽** 코드 뷰어(starter / solution / 내 작업 탭, 파일 트리) · **하단** 실행 패널 |
| 실행 패널 | `[VS Code에서 열기]` `[초기화]` `[빌드]` `[실행]` `[테스트]` 버튼, 출력 스트림(SSE), 테스트 케이스별 ✅/❌, 소요 시간 |
| `/doctor` | gcc·go·code 감지 결과와 버전, 누락 시 설치 안내 |

### 핵심 흐름: VS Code 실행 버튼과 결과 확인

1. `[VS Code에서 열기]` 클릭 → `POST /api/open/{lang}/{slug}`
   - `work/{lang}/{slug}/`가 없으면 `starter/`와 `.vscode/`를 복사한다
   - 서버가 `code work/{lang}/{slug} -g work/{lang}/{slug}/main.c:1`(Go는 `main.go`)를 실행한다
   - 실패(코드 CLI 없음) 시 응답에 `vscode://file/D:/works/pro-study/work/...` 링크를 담아 브라우저가 대신 연다
2. 학습자는 VS Code에서 코딩한다. `Ctrl+Shift+B`가 같은 빌드 명령을 돌리도록 `tasks.json`을 넣어둔다
3. `[테스트]` 클릭 → `POST /api/run/{lang}/{slug}?stage=test` → `GET /api/events/{id}`(SSE)
   - runner가 `project.json`의 `build`/`run`/`test` 명령을 `work/` 디렉터리에서 실행한다
   - C: `gcc -std=c23 -Wall -Wextra -o build/app.exe *.c` 후 `tests/cases/*.in`을 stdin으로 넣어 `*.out`과 비교
   - Go: `go vet ./... && go test ./... -json` 결과를 파싱해 케이스별 표시
   - 타임아웃 30초, 출력 1MB 상한, 작업 디렉터리 밖 명령 금지(allowlist: gcc, go, `build/app.exe`)
4. 전부 통과하면 `data/progress.json`에 `passed`로 기록되고 홈 카드 뱃지가 바뀐다

### project.json 스키마 (모든 프로젝트 공통)

```json
{
  "id": "c/01-calc",
  "title": "재귀 하강 계산기",
  "lang": "c",
  "order": 1,
  "difficulty": 1,
  "concepts": ["토큰화", "재귀 하강 파서", "constexpr", "nullptr", "[[nodiscard]]"],
  "entry": "main.c",
  "build": ["gcc", "-std=c23", "-Wall", "-Wextra", "-o", "build/app.exe", "main.c"],
  "run":   ["build/app.exe"],
  "test":  { "kind": "stdio-cases", "dir": "tests/cases" }
}
```
Go 프로젝트는 `"build": ["go","build","-o","build/app.exe","."]`, `"test": {"kind":"go-test"}`.

## C23 프로젝트 10개

각 프로젝트는 앞 프로젝트의 코드를 재사용하도록 배열해, 10번이 끝나면 작은 서버 하나를
바닥부터 만든 경험이 되게 한다. C23 신문법은 굵게.

| # | slug | 제목 | 배우는 것 | 난이도 |
| --- | --- | --- | --- | --- |
| 1 | `01-calc` | 재귀 하강 계산기 | 토큰화, 재귀 하강 파서, **bool/true/false 키워드, nullptr, constexpr, 자리 구분자 `1'000`, 0b 리터럴, [[nodiscard]]** | ★ |
| 2 | `02-dynarray` | 제네릭 동적 배열·문자열 빌더 | malloc/realloc/free, 소유권, 매크로 기반 제네릭, **typeof, auto, _Generic, [[maybe_unused]]** | ★ |
| 3 | `03-hashmap` | 오픈 어드레싱 해시맵 | FNV-1a 해시, 선형 탐사, 리사이즈, 구조체/포인터, 함수 포인터 | ★★ |
| 4 | `04-textkit` | wc·grep·sort 통합 CLI | 파일 I/O, 스트림 처리, argv 파싱, 서브커맨드, `errno`, **#embed로 도움말 텍스트 내장** | ★★ |
| 5 | `05-json` | JSON 파서·직렬화기 | 태그드 유니언, 재귀 자료구조, 에러 전파, 유니코드 이스케이프, 2·3번 재사용 | ★★★ |
| 6 | `06-arena` | 아레나·풀 메모리 할당자 | 정렬(`alignas/alignof`), 포인터 산술, 메모리 레이아웃, 단편화, `[[gnu::cleanup]]`와 비교 | ★★★ |
| 7 | `07-vm` | 스택 기반 바이트코드 VM | enum 명령어, switch 디스패치 vs computed goto, 어셈블러, 콜 프레임, **enum 기반 타입 지정 `enum : uint8_t`** | ★★★ |
| 8 | `08-kvstore` | 파일 기반 KV 저장소 | append-only 로그 + 인메모리 인덱스, 바이너리 직렬화, 엔디안, 크래시 복구, **_BitInt, unreachable()** | ★★★★ |
| 9 | `09-threadpool` | 스레드풀과 생산자/소비자 | `threads.h`, `stdatomic.h`, 뮤텍스/조건변수, 데이터 레이스, 백프레셔 (MinGW winpthreads 확인, 없으면 pthread 폴백) | ★★★★ |
| 10 | `10-http-server` | 정적 파일 HTTP/1.1 서버 | Winsock2/BSD 소켓 추상화, 요청 파싱, 9번 스레드풀로 동시 처리, 5번 JSON으로 `/api/status` 응답 | ★★★★★ |

## Go 프로젝트 10개

Go는 표준 라이브러리와 동시성이 강점이므로 그쪽으로 기울인다. 마지막 프로젝트는
이 사이트의 서버와 같은 구조라서 완성 후 `site/`를 읽을 수 있다.

| # | slug | 제목 | 배우는 것 | 난이도 |
| --- | --- | --- | --- | --- |
| 1 | `01-todo-cli` | JSON 저장 TODO CLI | 모듈·패키지, struct/메서드, slice/map, `flag`, `encoding/json`, `os` 파일 저장, 에러 반환 관례 | ★ |
| 2 | `02-wordfreq` | 단어 빈도 분석기 | `bufio`, `strings`/`unicode`, 정렬(`slices.SortFunc`), 테이블 주도 `go test`, 벤치마크 | ★ |
| 3 | `03-logparse` | 로그 파서·리포터 | 인터페이스(`io.Reader` 파이프라인), 에러 래핑 `errors.Is/As`, `time` 파싱, 텍스트 템플릿 리포트 | ★★ |
| 4 | `04-crawler` | 동시 링크 크롤러 | goroutine, channel, `sync.WaitGroup`, worker pool, `context` 취소, `httptest`로 로컬 사이트 크롤링 | ★★★ |
| 5 | `05-rest-api` | 메모 REST API | `net/http` 1.22+ 패턴 라우팅, JSON 핸들러, 미들웨어(로깅·복구), `httptest` 핸들러 테스트 | ★★★ |
| 6 | `06-kvstore` | WAL 기반 KV 저장소 | `sync.RWMutex`, `encoding/gob`, 파일 동기화, 스냅샷·복구, 벤치마크로 잠금 비교 | ★★★ |
| 7 | `07-chat` | TCP 채팅 서버 | `net`, 연결당 goroutine, `select`, 브로드캐스트 허브, graceful shutdown, 레이스 검출 `go test -race` | ★★★★ |
| 8 | `08-generics` | 제네릭 자료구조 라이브러리 | 타입 파라미터·제약, 스택/큐/우선순위 큐/LRU 캐시, `iter.Seq` 이터레이터, 퍼징 `go test -fuzz` | ★★★★ |
| 9 | `09-interp` | 스크립트 언어 인터프리터 | 렉서·파서·AST·트리 워커, 클로저·환경, REPL, `go tool pprof`로 프로파일링 | ★★★★★ |
| 10 | `10-metrics-dashboard` | 실시간 메트릭 대시보드 | `embed`, `html/template`, SSE 스트리밍, `runtime/metrics`, `pprof` 엔드포인트, 이 사이트와 동일한 구조 | ★★★★★ |

## 가이드(README.md) 공통 목차

1. **무엇을 만드는가** — 완성 시 실행 예시(입력/출력 스크린샷 대신 텍스트)
2. **왜 이 프로젝트인가** — 어떤 프로그래밍 개념이 깊어지는가
3. **핵심 개념** — 개념당 5~10줄 + 최소 코드 조각
4. **단계별 구현** — 단계당 `starter/`의 `// TODO(step-N)` 주석과 1:1 대응, 각 단계 끝에 실행해 볼 명령
5. **막혔을 때** — 흔한 컴파일 에러·런타임 오류와 원인
6. **더 나아가기** — 선택 과제 2~3개
7. **참고** — 표준 문서 링크(C23 N3220 초안 절, Go spec/블로그)

## Steps

### Step 1: site-scaffold
- Goal: `go run ./site`로 127.0.0.1:8787에 홈 페이지가 뜨고 `projects/` 카탈로그를 읽어 언어별 카드 목록을 보여준다
- Files: site/go.mod, site/main.go, site/internal/catalog/catalog.go, site/internal/catalog/catalog_test.go, site/web/templates/layout.html, site/web/templates/home.html, site/web/static/app.css, site/web/static/app.js, site/web/static/logo.svg, site/web/static/favicon.ico, site/web/embed.go, projects/README.md, projects/_schema/project.schema.json, .gitignore
- Acceptance: AC-1: `go test ./site/...`가 통과하고 catalog 테스트가 잘못된 project.json(필수 필드 누락)을 거부한다
- Acceptance: AC-2: 서버 기동 후 `curl http://127.0.0.1:8787/`이 200과 `html lang="ko"`, `meta charset=utf-8`, 로고·favicon 참조를 포함한 HTML을 반환한다
- Acceptance: AC-3: 홈 화면 스크린샷이 evidence에 첨부되고 C23/Go 탭과 빈 카드 상태가 보인다
- Tests: cd site && go vet ./... && go test ./... ; go run ./site & ; curl -s http://127.0.0.1:8787/ | grep -c 'lang="ko"'
- Risk: low
- Complexity: medium

### Step 2: guide-and-code-view
- Goal: `/p/{lang}/{slug}`에서 README.md가 HTML 가이드로, starter/solution 파일이 하이라이트된 코드 뷰어로 나란히 보인다
- Files: site/internal/guide/guide.go, site/internal/guide/guide_test.go, site/internal/catalog/files.go, site/web/templates/project.html, site/web/static/app.css, site/web/static/app.js, site/web/static/vendor/highlight.min.js, site/web/static/vendor/highlight.min.css, site/main.go, projects/_template/README.md, projects/_template/project.json
- Acceptance: AC-1: `projects/_template`을 카탈로그에 넣으면 상세 페이지가 목차·개념·단계 섹션과 파일 트리를 렌더한다
- Acceptance: AC-2: solution 탭은 기본 접힘이고 "정답 보기" 클릭 전에는 DOM에 코드가 없다(스포일러 방지)
- Acceptance: AC-3: 코드 뷰어는 `..` 경로 탈출 요청에 404를 반환한다(guide_test)
- Tests: cd site && go test ./internal/guide/ ./internal/catalog/
- Depends on: site-scaffold
- Risk: low
- Complexity: medium

### Step 3: vscode-opener
- Goal: `[VS Code에서 열기]` 버튼이 `work/{lang}/{slug}`를 starter에서 복사해 만들고 `code` CLI로 열며, CLI가 없으면 `vscode://` 링크로 폴백한다
- Files: site/internal/opener/opener.go, site/internal/opener/opener_test.go, site/internal/workspace/workspace.go, site/internal/workspace/workspace_test.go, site/main.go, site/web/static/app.js, site/web/templates/project.html, projects/_template/.vscode/tasks.json, projects/_template/.vscode/launch.json, projects/_template/.vscode/settings.json
- Acceptance: AC-1: `POST /api/open/c/_template` 후 `work/c/_template/`에 starter 파일과 `.vscode/`가 존재하고 두 번째 호출은 기존 파일을 덮어쓰지 않는다
- Acceptance: AC-2: `[초기화]`(`POST /api/reset/...`)는 확인 후 work 폴더를 starter로 되돌린다
- Acceptance: AC-3: `code`가 PATH에 없는 환경을 흉내낸 테스트에서 응답 JSON에 `vscode://file/` 절대 경로 URL이 담긴다
- Acceptance: AC-4: 실제 VS Code가 열린 스크린샷이 evidence에 첨부된다
- Tests: cd site && go test ./internal/opener/ ./internal/workspace/
- Depends on: guide-and-code-view
- Risk: medium
- Complexity: medium

### Step 4: runner-and-progress
- Goal: `[빌드][실행][테스트]` 버튼이 work 폴더에서 project.json의 명령을 실행하고 출력을 SSE로 스트리밍하며 테스트 케이스별 통과/실패와 진행률을 저장한다
- Files: site/internal/runner/runner.go, site/internal/runner/stdio_cases.go, site/internal/runner/gotest.go, site/internal/runner/runner_test.go, site/internal/runner/testdata/, site/internal/progress/progress.go, site/internal/progress/progress_test.go, site/main.go, site/web/static/app.js, site/web/templates/project.html, site/web/templates/home.html, data/.gitkeep
- Acceptance: AC-1: stdio-cases 러너가 `tests/cases/01.in`을 stdin으로 넣고 stdout을 `01.out`과 비교해 케이스별 결과를 낸다(줄 끝 CRLF/LF 정규화)
- Acceptance: AC-2: go-test 러너가 `go test -json` 출력을 파싱해 테스트 함수별 pass/fail을 낸다
- Acceptance: AC-3: 30초 초과 프로세스는 강제 종료되고 `timeout` 상태로 표시된다(무한 루프 testdata)
- Acceptance: AC-4: 명령 첫 토큰이 allowlist(gcc, go, build/app.exe) 밖이면 거부한다
- Acceptance: AC-5: 전부 통과하면 `data/progress.json`에 `passed`가 기록되고 홈 카드 뱃지가 바뀐다
- Tests: cd site && go test ./internal/runner/ ./internal/progress/ -race
- Depends on: vscode-opener
- Risk: medium
- Complexity: high

### Step 5: c-projects-01-05
- Goal: C23 프로젝트 1~5(calc, dynarray, hashmap, textkit, json)의 가이드·starter·solution·tests가 완성되고 solution이 러너에서 전부 통과한다
- Files: projects/c/01-calc/, projects/c/02-dynarray/, projects/c/03-hashmap/, projects/c/04-textkit/, projects/c/05-json/
- Acceptance: AC-1: 각 프로젝트의 solution을 work에 복사해 `[테스트]`를 돌리면 모든 케이스가 통과한다(5개 프로젝트 × 케이스 5개 이상)
- Acceptance: AC-2: 각 starter는 `-std=c23 -Wall -Wextra`로 경고 없이 컴파일되며 TODO 단계 번호가 README 단계와 1:1이다
- Acceptance: AC-3: README가 공통 목차 7개 절을 모두 갖고 각 프로젝트의 C23 신문법이 "핵심 개념"에 코드와 함께 설명된다
- Tests: pwsh scripts/verify-projects.ps1 -Lang c -Range 1..5
- Depends on: runner-and-progress
- Parallel: no
- Risk: low
- Complexity: high

### Step 6: c-projects-06-10
- Goal: C23 프로젝트 6~10(arena, vm, kvstore, threadpool, http-server)의 가이드·starter·solution·tests가 완성되고 solution이 러너에서 전부 통과한다
- Files: projects/c/06-arena/, projects/c/07-vm/, projects/c/08-kvstore/, projects/c/09-threadpool/, projects/c/10-http-server/
- Acceptance: AC-1: solution 5개가 러너에서 모든 케이스를 통과한다
- Acceptance: AC-2: 09는 MinGW gcc 15에서 `threads.h` 가용 여부를 README에 기록하고, 불가 시 pthread 폴백 빌드 명령이 project.json에 있다
- Acceptance: AC-3: 10은 `build/app.exe 8090` 기동 후 `curl 127.0.0.1:8090/api/status`가 JSON을 반환하는 테스트 스크립트(tests/run.ps1)로 검증된다
- Tests: pwsh scripts/verify-projects.ps1 -Lang c -Range 6..10
- Depends on: runner-and-progress
- Parallel: yes
- Risk: medium
- Complexity: high

### Step 7: go-projects-01-05
- Goal: Go 프로젝트 1~5(todo-cli, wordfreq, logparse, crawler, rest-api)의 가이드·starter·solution·tests가 완성되고 solution이 `go test`를 전부 통과한다
- Files: projects/go/01-todo-cli/, projects/go/02-wordfreq/, projects/go/03-logparse/, projects/go/04-crawler/, projects/go/05-rest-api/
- Acceptance: AC-1: solution 5개가 `go vet ./... && go test ./... -race`를 통과한다
- Acceptance: AC-2: starter는 `go build`가 되고 테스트는 실패 상태로 시작한다(TDD 흐름), TODO 단계가 README와 1:1이다
- Acceptance: AC-3: 04·05는 외부 네트워크 없이 `httptest`만으로 테스트된다
- Tests: pwsh scripts/verify-projects.ps1 -Lang go -Range 1..5
- Depends on: runner-and-progress
- Parallel: yes
- Risk: low
- Complexity: high

### Step 8: go-projects-06-10
- Goal: Go 프로젝트 6~10(kvstore, chat, generics, interp, metrics-dashboard)의 가이드·starter·solution·tests가 완성되고 solution이 `go test`를 전부 통과한다
- Files: projects/go/06-kvstore/, projects/go/07-chat/, projects/go/08-generics/, projects/go/09-interp/, projects/go/10-metrics-dashboard/
- Acceptance: AC-1: solution 5개가 `go vet ./... && go test ./... -race`를 통과한다
- Acceptance: AC-2: 08은 `go test -fuzz` 시드 코퍼스를 포함하고, 09는 REPL 세션 예시가 README에 있다
- Acceptance: AC-3: 10의 README 마지막 절이 `site/` 코드 읽기 순서를 안내한다
- Tests: pwsh scripts/verify-projects.ps1 -Lang go -Range 6..10
- Depends on: runner-and-progress
- Parallel: yes
- Risk: low
- Complexity: high

### Step 9: doctor-and-launcher
- Goal: `scripts/dev.ps1`이 gcc·go·code를 점검(doctor)하고 서버를 띄운 뒤 브라우저를 열며, `/doctor` 페이지가 같은 정보를 보여준다
- Files: scripts/dev.ps1, scripts/verify-projects.ps1, site/internal/doctor/doctor.go, site/internal/doctor/doctor_test.go, site/main.go, site/web/templates/doctor.html, README.md
- Acceptance: AC-1: 도구가 하나라도 없으면 dev.ps1이 설치 안내를 출력하고 종료 코드 1을 반환한다(PATH를 비운 테스트)
- Acceptance: AC-2: `/doctor`가 gcc 15.2·go 1.26·code 1.125를 감지해 표로 보여준다
- Acceptance: AC-3: README.md에 설치·실행·프로젝트 추가 방법이 한국어로 적혀 있다
- Tests: pwsh scripts/dev.ps1 -DoctorOnly ; cd site && go test ./internal/doctor/
- Depends on: runner-and-progress
- Parallel: yes
- Risk: low
- Complexity: low

### Step 10: e2e-walkthrough
- Goal: 학습자 시나리오(홈 → 프로젝트 열기 → VS Code 편집 → 테스트 통과 → 뱃지 변경)를 처음부터 끝까지 실행한 증거와 20개 프로젝트 전체 검증 결과가 남는다
- Files: scripts/verify-projects.ps1, docs/WALKTHROUGH.md, site/internal/e2e/e2e_test.go
- Acceptance: AC-1: `scripts/verify-projects.ps1 -All`이 20개 solution 전부 통과를 출력한다
- Acceptance: AC-2: e2e 테스트가 httptest 서버로 open→run→progress 흐름을 검증한다
- Acceptance: AC-3: 홈·상세·실행 결과·VS Code 화면 스크린샷 4장과 진행률 100%가 아닌 부분 통과 상태 스크린샷 1장이 evidence에 있다
- Tests: pwsh scripts/verify-projects.ps1 -All ; cd site && go test ./... -race
- Depends on: c-projects-01-05, c-projects-06-10, go-projects-01-05, go-projects-06-10, doctor-and-launcher
- Risk: medium
- Complexity: medium

## 일정 (wave 기준, maxParallel 3)

| Wave | 카드 | 비고 |
| --- | --- | --- |
| 1 | site-scaffold | |
| 2 | guide-and-code-view | |
| 3 | vscode-opener | |
| 4 | runner-and-progress | 가장 위험한 카드. 여기서 실행 보안·타임아웃을 끝낸다 |
| 5 | c-projects-01-05, c-projects-06-10, go-projects-01-05, go-projects-06-10, doctor-and-launcher | 독립 카드 5장, 동시 3장씩 |
| 6 | e2e-walkthrough | |

## Verification
- Tier 1 (정적): `cd site && go vet ./... && gofmt -l .`이 비어 있음, 모든 starter/solution이 경고 없이 컴파일
- Tier 2 (테스트): `cd site && go test ./... -race`, `scripts/verify-projects.ps1 -All`(20개 solution 러너 통과)
- Tier 3 (실행·시각): `scripts/dev.ps1`로 실제 기동 → 홈·상세·실행 패널·VS Code 오픈 스크린샷, 한 프로젝트를 starter 상태에서 직접 고쳐 passed로 바꾼 기록

## 주요 리스크와 대응

| 리스크 | 대응 |
| --- | --- |
| 러너가 임의 명령을 실행하는 구멍 | 명령 첫 토큰 allowlist, 작업 디렉터리 고정, 127.0.0.1 바인딩, `Origin` 헤더 검사 |
| MinGW에서 `threads.h`/Winsock 차이 | Step 6에서 먼저 실험 후 README에 확인 결과 기록, pthread·Winsock 폴백 |
| Go 툴체인이 386이라 일부 벤치마크 수치가 다름 | 가이드에 수치 대신 상대 비교만 적음 |
| 프로젝트 20개 콘텐츠 품질 편차 | README 공통 목차 강제, verify 스크립트가 절 제목 7개를 검사 |
| `code` CLI 미설치 | vscode:// 폴백 + `/doctor` 안내 |

## Reviewer topology
builder=codex, reviewer=claude(독립 프로바이더), challenge=on
