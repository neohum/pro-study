# projects/ — 학습 프로젝트 콘텐츠 규약

사이트(`site/`)는 이 디렉터리를 읽어 카탈로그를 만든다. 프로젝트 하나는 폴더 하나다.

```
projects/<lang>/<NN-slug>/
├─ project.json     메타데이터와 빌드·실행·테스트 명령 (필수)
├─ README.md        가이드. 아래 7개 절을 이 순서로 가진다 (필수)
├─ starter/         학습자가 복사해 가는 뼈대. TODO(step-N) 주석이 README 단계와 1:1 (필수)
├─ solution/        완성 코드. 웹에서는 "정답 보기"를 눌러야 열린다 (권장)
├─ tests/           러너가 쓰는 테스트 (필수)
└─ .vscode/         tasks.json(빌드·실행), settings.json, extensions.json — starter와 함께 work/로 복사된다
```

`_`로 시작하는 폴더(`_template`, `_schema`)는 카탈로그에서 무시된다.

## project.json

스키마: [`_schema/project.schema.json`](_schema/project.schema.json). 알 수 없는 필드는 거부된다.

| 필드 | 뜻 |
| --- | --- |
| `id` | `"<lang>/<폴더명>"` 과 정확히 같아야 한다 |
| `order`, `difficulty` | 홈 카드 순서(1부터), 난이도 1~5 |
| `concepts` | 카드에 뱃지로 보이는 핵심 개념 3~7개 |
| `entry` | VS Code가 처음 열 파일 (starter 기준 상대 경로) |
| `build`, `run` | 작업 폴더에서 실행할 argv. 첫 토큰은 `gcc`, `go`, 또는 `build/...`만 허용 |
| `runArgs` | [실행] 버튼이 붙이는 인자 (선택) |
| `test.kind` | `stdio-cases` \| `go-test` \| `script` |

### test.kind

- **stdio-cases** — `tests/cases/<name>.out`마다 케이스 하나. `<name>.in`이 stdin, `<name>.args`(공백 구분)가 인자.
  stdout을 `.out`과 비교한다(CRLF/LF, 줄 끝 공백, 마지막 개행은 무시).
- **go-test** — `tests/*_test.go`를 작업 폴더로 복사(항상 덮어씀)한 뒤 `go vet ./...` → `go test ./... -json`.
  테스트 함수 하나가 케이스 하나. `test.args`로 `-race` 등을 붙인다.
- **script** — `tests/run.ps1 <workDir>`를 실행. 종료 코드 0이면 통과. stdout의 `PASS <name>` / `FAIL <name>` 줄이 케이스로 표시된다.

## README.md의 7개 절

1. `## 무엇을 만드는가` — 완성 시 실행 예시
2. `## 왜 이 프로젝트인가` — 어떤 개념이 깊어지는지, 앞뒤 프로젝트와의 연결
3. `## 핵심 개념` — 개념당 `###` 소절, 5~10줄 + 최소 코드
4. `## 단계별 구현` — `### Step N: …` 소절이 starter의 `TODO(step-N)`과 1:1, 단계 끝마다 확인 방법
5. `## 막혔을 때` — 흔한 에러와 원인 표
6. `## 더 나아가기` — 선택 과제 2~3개
7. `## 참고` — 표준 문서·공식 자료 링크

## 이 환경에서 확인된 제약 (Windows 11, MinGW gcc 15.2, Go 1.26)

- C23: `constexpr`, `nullptr`, `auto`, `typeof`, `_BitInt`, `#embed`, `[[nodiscard]]`, `enum : T`, `0b`, `'` 모두 동작
- **없음**: `<threads.h>`(→ `<pthread.h>` 사용), `<stdbit.h>`, `stddef.h`의 `unreachable()`(→ `__builtin_unreachable()`), gdb
- 소켓: `<winsock2.h>` + 링크 옵션 `-lws2_32`
- gcc는 셸 없이도 `*.c`를 확장하지만, 명령은 파일을 명시하는 편이 읽기 쉽다
