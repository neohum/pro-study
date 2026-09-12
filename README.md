# pro-study — C23 & Go 프로젝트 학습 플랫폼

프로그래밍 언어를 깊이 있게 체화할 수 있도록 설계된 **20개 심층 프로젝트**(C23 10개, Go 10개) 학습 플랫폼입니다. 로컬 웹 환경에서 VS Code와 연동하여 코딩하고 결과를 확인하거나, **E-ink 전자책 태블릿에서 스타일러스 펜으로 코드를 직접 따라 쓰며(필사)** 학습할 수 있습니다.

---

## 1. 플랫폼 구성

### ① 로컬 학습 웹 사이트 (`site/`)
- Go 언어로 바닥부터 구현된 경량 웹 서버 (`127.0.0.1:8787`).
- **[VS Code에서 열기]** 버튼으로 작업 디렉터리 자동 생성 및 에디터 연동.
- 웹 화면에서 **[빌드] [실행] [테스트]** 버튼을 통해 SSE 실시간 출력 및 단위 테스트 통과 여부 확인, 진행률 자동 저장.
- 실행 방법:
  ```powershell
  pwsh scripts/dev.ps1
  ```
- **바탕화면 크롬 앱 바로가기 생성**:
  ```powershell
  pwsh scripts/create-desktop-shortcut.ps1
  ```
  *(바탕화면에 생성된 바로가기를 더블 클릭하면 웹 서버가 백그라운드로 자동 실행되고 크롬 앱 모드로 열립니다.)*

### ② 내부 네트워크(LAN / Wi-Fi) 디바이스 APK 다운로드 웹 페이지 (`/apk`)
- 동일 Wi-Fi에 연결된 스마트폰이나 태블릿(Onyx Boox, Galaxy Tab 등)에서 PC 웹 서버에 접속하여 **APK를 직접 다운로드 및 설치**할 수 있습니다.
- **QR 코드 지원**: PC 화면의 QR 코드를 태블릿 카메라로 비추면 바로 다운로드 페이지로 이동.
- **원클릭 APK 빌드**: 웹 화면에서 [최신 소스로 APK 다시 빌드]를 누르면 백엔드에서 에셋 패키징과 Gradle 빌드를 자동 수행하며 실시간 터미널 로그를 스트리밍.
- **내부망 서버 실행**:
  ```bash
  # Windows
  pwsh scripts/serve-lan.ps1

  # macOS / Linux
  bash scripts/serve-lan.sh
  ```
- **터미널에서 직접 APK 빌드**:
  ```bash
  # Windows
  pwsh scripts/build-apk.ps1

  # macOS / Linux
  bash scripts/build-apk.sh
  ```

### ③ E-ink Book 전용 Android 애플리케이션 (`android-app/`)
- Onyx Boox, Likebook, Galaxy Tab S-Pen 등 **E-ink 전자책 단말기 특화 안드로이드 앱**.
- **손/펜 입력 분리 (Palm Rejection)**:
  - **손가락 터치**: 본문 및 소스코드 부드러운 스크롤(Scroll / Pan).
  - **전용 펜(Stylus)**: 화면 위 자유 필기, 획 단위 지우개.
- **코드 따라쓰기(Tracing / 필사) 모드**:
  - 원본 코드가 흐린 회색(Ghost Text)과 노트선으로 표시되며, 펜으로 코드를 한 줄씩 덧써 내려가며 문법과 키워드를 손으로 완벽히 체화.
- **순수 흑백 고대비 테마**: E-ink 패널의 잔상과 깜빡임을 최소화하는 모노크롬 UI 및 원터치 화면 새로고침(Flash Refresh) 지원.
- **완전 오프라인 구동**: 20개 프로젝트 전체가 로컬 에셋으로 내장되어 네트워크 없이 사용 가능.
- 상세 안내: [`docs/EINK_APP_GUIDE.md`](docs/EINK_APP_GUIDE.md)

---

## 2. 20개 프로젝트 커리큘럼

### C23 프로젝트 (10개)
1. **01-calc**: 재귀 하강 계산기 (`constexpr`, `nullptr`, `auto`, `[[nodiscard]]`, `0b`, `'` 리터럴)
2. **02-dynarray**: 제네릭 동적 배열·문자열 빌더 (`typeof`, `_Generic`, 분할 상환 O(1) 성장)
3. **03-hashmap**: 오픈 어드레싱 해시맵 (FNV-1a, 선형 탐사, 툼스톤 삭제, 비트마스크 재해시)
4. **04-textkit**: wc·grep·sort 통합 CLI (C23 `#embed`로 도움말 바이너리 내장, 스트림 I/O)
5. **05-json**: 재귀 하강 JSON 파서·직렬화기 (태그드 유니언, 이스케이프 복원, `--pretty` 포맷팅)
6. **06-arena**: 아레나·풀 메모리 할당자 (`alignas`/`alignof` 메모리 정렬, 고속 블록 할당)
7. **07-vm**: 스택 기반 바이트코드 VM (`enum : uint8_t` OpCode, 2-Pass 라벨 어셈블러)
8. **08-kvstore**: 파일 기반 KV 저장소 (Bitcask Append-only 로그, 인메모리 인덱스, 크래시 복구)
9. **09-threadpool**: 스레드풀과 생산자/소비자 (`pthread.h` 뮤텍스/조건변수, 원형 큐, 동시 작업)
10. **10-http-server**: 정적 파일 HTTP/1.1 서버 (`winsock2.h`, REST 엔드포인트 및 파일 서빙)

### Go 프로젝트 (10개)
1. **01-todo-cli**: JSON 저장 TODO CLI (struct 태그, `encoding/json`, `flag.FlagSet`, 원자적 파일 쓰기)
2. **02-wordfreq**: 단어 빈도 분석기 (`bufio.Scanner`, `strings`/`unicode`, `slices.SortFunc`)
3. **03-logparse**: 웹 서버 로그 파서 (`io.Reader` 파이프라인, 커스텀 에러 래핑 `errors.Is/As`, `text/template`)
4. **04-crawler**: 동시 링크 크롤러 (goroutine, channel, Worker Pool, `context.WithTimeout`, `httptest`)
5. **05-rest-api**: 메모 REST API (Go 1.22+ `net/http` 라우팅, JSON 핸들러, 로깅/패닉 미들웨어)
6. **06-kvstore**: WAL 기반 KV 저장소 (`sync.RWMutex`, Write-Ahead Log, 스냅샷 및 무결성 복구)
7. **07-chat**: TCP 브로드캐스트 채팅 서버 (`net.Listen`, 연결당 고루틴, Hub 브로드캐스트, graceful shutdown)
8. **08-generics**: 제네릭 컬렉션 라이브러리 (Stack, Queue, PriorityQueue, LRUCache, Go 1.23+ `iter.Seq`)
9. **09-interp**: 소형 스크립트 언어 인터프리터 (Lexer, Pratt 재귀 하강 파서, AST, 환경 스코프, 트리 평가기)
10. **10-metrics-dashboard**: 런타임 메트릭 대시보드 서버 (`runtime/metrics`, Server-Sent Events, 실시간 시각화)

---

## 3. 품질 게이트 검증

모든 프로젝트는 엄격한 4대 품질 게이트를 100% 통과하도록 검증되어 있습니다:

```powershell
pwsh scripts/verify-projects.ps1 -All
```

- README.md 필수 7개 절 준수
- starter 소스 코드 TODO 주석과 README 단계 1:1 일치
- starter 소스 코드 무경고 빌드
- solution 완성 코드 단위 테스트 100% 통과
