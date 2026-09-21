# A Tour of Go 실전 필사(Code Tracing) 및 다국어 레퍼런스 가이드

pro-study는 단순한 눈으로 보는 학습을 넘어, **직접 키보드로 타이핑하고 E-ink 스타일러스 펜으로 한 줄씩 덧써 내려가며 언어의 관용적(idiomatic) 구조를 체화하는 필사(Code Tracing) 학습 시스템**을 제공합니다.

---

## 1. A Tour of Go 필사 코스 (`courses/tour-go/`)

공식 Go 튜토리얼(`go.dev/tour`, `github.com/golang/website`)의 핵심 아티클과 예제 코드를 기반으로 총 6개 챕터, 19개 핵심 레슨으로 구성되어 있습니다.

| 챕터 | 영문명 | 레슨 수 | 다루는 핵심 개념 |
| :--- | :--- | :---: | :--- |
| **1. 기본 문법** | Basics | 5개 | 패키지 선언, 그룹 임포트, 함수 매개변수/반환값, 다중 반환, 변수 타입 추론(`:=`) |
| **2. 제어 흐름** | Flow Control | 4개 | for 루프, 조건 검사 전 초기화 if, switch 문, defer 지연 실행 |
| **3. 자료구조** | More Types | 4개 | 포인터 연산 배제, 구조체 필드 접근, 슬라이스 동적 분할 및 append, map 컬렉션 |
| **4. 메서드 & 인터페이스** | Methods & Interfaces | 3개 | 값/포인터 리시버 메서드, 암시적 인터페이스 구현, error 인터페이스 예외 처리 |
| **5. 제네릭** | Generics | 1개 | `comparable` 타입 제약 조건을 활용한 제네릭 함수 및 인덱스 검색 |
| **6. 동시성** | Concurrency | 2개 | goroutine 경량 스레드, typed channel 송수신 및 select 다중화 |

### 웹 필사 인터페이스 (`/trace/go`)
- **실시간 타이핑 검증**: Ghost 코드를 보며 한 줄씩 키보드로 입력하면 글자 단위로 매칭을 검증합니다.
- **오타 방지 & 진행률**: 오타 발생 시 붉은색 경고와 진동 피드백을 제공하며, 한 줄 입력 완료 후 `Enter`를 누르면 다음 줄로 자동 포커싱됩니다.
- **전체 코드 복사**: 원본 코드를 언제든 클립보드에 복사해 로컬 터미널(`go run main.go`)에서 바로 실행해볼 수 있습니다.

### Android E-ink 스타일러스 필사 모드
- **Onyx Boox, Galaxy Tab 최적화**: 16sp 대형 고대비 모노크롬 폰트 위에 투명 드로잉 캔버스(`TracingDrawingView`)가 오버레이됩니다.
- **Palm Rejection**: 손가락 터치로는 스크롤을, 스타일러스 펜으로는 딜레이 없는 덧쓰기 필사를 수행합니다.
- **원터치 지우기 & 새로고침**: `[지우기]` 버튼으로 잉크를 리셋하고, `[새로고침]`으로 E-ink 패널 잔상을 완전히 제거합니다.

---

## 2. 6개 프로그래밍 언어 문법 & 표준 함수 레퍼런스 (`content/reference/`)

초보자부터 실무 개발자까지 빠르게 찾아볼 수 있는 실전 치트시트 사전입니다.

- **지원 언어**:
  - `c.json`: C23 현대 표준 (nullptr, constexpr, auto, stdio.h, stdlib.h, string.h, math.h 등 22개 함수)
  - `go.json`: Go 1.24+ (고루틴, 채널, 슬라이스, fmt, strings, strconv, os, json, http, slices 등 20개 함수)
  - `rust.json`: Rust 2024 / 1.85+ (소유권, 빌림, Option/Result, std::vec, std::fs, std::thread 등 20개 함수)
  - `python.json`: Python 3.13+ (타입 힌트, 패턴 매칭, 컴프리헨션, asyncio, json, pathlib 등 20개 함수)
  - `typescript.json`: TypeScript 5.8+ (인터페이스, 제네릭, 유니언, 유틸리티 타입, Promise, Object 등 20개 함수)
  - `javascript.json`: ECMAScript 2024+ (스코프, 구조 분해, 화살표 함수, 클래스, Array, String 등 20개 함수)
- **웹 페이지**: `/ref` 및 `/ref/{lang}`에서 실시간 검색창으로 함수명이나 개념을 즉시 필터링할 수 있습니다.
- **Android E-ink 앱**: 상단 `[📖 문법사전]` 버튼을 통해 태블릿 화면에서 6개 언어 문법 및 122개 표준 함수를 실시간 검색하고 고대비 카드로 열람할 수 있습니다.

---

## 3. 아이디어 제안소 (`/ideas`)

- 학습자가 원하는 신규 프로젝트 주제, 새로운 언어(Kotlin, C++, C# 등), 기능 개선 아이디어를 자유롭게 등록할 수 있습니다.
- 등록된 아이디어는 `data/ideas.json`에 안전하게 영속 저장되며, 다른 학습자들이 추천(투표)할 수 있습니다.
