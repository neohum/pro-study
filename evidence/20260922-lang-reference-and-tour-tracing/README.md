# Evidence: 다국어 문법·함수 레퍼런스 및 A Tour of Go 필사 시스템 구축

- **Date**: 2026-09-22
- **Plan**: `plans/lang-reference-and-tour-tracing.plan.md`
- **Status**: PASSED (All 5 Steps verified)

---

## 1. WHAT WAS TESTED

1. **A Tour of Go 콘텐츠 인제스트 파이프라인 (`scripts/ingest-tour-go.ts`)**:
   - `node scripts/ingest-tour-go.ts` 실행을 통해 Basics, FlowControl, MoreTypes, Methods/Interfaces, Generics, Concurrency 6개 챕터 19개 핵심 레슨 추출 및 `courses/tour-go/manifest.json`, `courses/tour-go/lessons.json` 생성 검증.
2. **6개 언어 문법 및 표준 라이브러리 함수 레퍼런스 검증 (`scripts/verify-references.ts`)**:
   - `node scripts/verify-references.ts` 실행을 통해 C23, Go, Rust, Python, TypeScript, JavaScript 6개 언어 레퍼런스 파일(`content/reference/*.json`)이 스키마(`projects/_schema/reference.schema.json`)를 만족하는지 전수 검사 (총 36개 문법 주제, 총 122개 표준 함수).
3. **웹 사이트 신규 라우트 및 기능 단위/통합 테스트 (`go -C site test ./...`)**:
   - `/ref`, `/ref/{lang}` (언어별 레퍼런스 뷰어)
   - `/trace/go`, `/trace/go/{lesson}` (Go Tour 인터랙티브 필사 뷰어)
   - `/ideas` 및 `POST /api/ideas`, `POST /api/ideas/{id}/vote` (아이디어 제안 및 투표 API)
   - `site/internal/reference`, `site/internal/tour`, `site/internal/idea` 단위 테스트 전체.
4. **Android Assets 패키징 및 E-ink APK 빌드 (`scripts/build-apk.ps1`)**:
   - `package-android-assets.js` 실행으로 60개 프로젝트, 6개 언어 레퍼런스, Tour of Go 필사 코스를 Android `assets/`로 자동 패키징.
   - `gradlew assembleDebug` 빌드를 통해 `build/pro-study-v1.2.0.apk` 정상 생성 확인.

---

## 2. WHAT WAS OBSERVED

1. **인제스트 결과**:
   - 6개 챕터, 19개 레슨 데이터셋 구축 완료 (`courses/tour-go/`).
2. **레퍼런스 검증 결과**:
   ```
   == 다국어 문법/함수 레퍼런스 검증 시작 ==
   ✓ [c] C (C23) (ISO/IEC 9899:2024 (C23)): 문법 6개, 함수 22개 검증 완료
   ✓ [go] Go (Go 1.24+): 문법 6개, 함수 20개 검증 완료
   ✓ [rust] Rust (Rust 2024 / 1.85+): 문법 6개, 함수 20개 검증 완료
   ✓ [python] Python (Python 3.13+): 문법 6개, 함수 20개 검증 완료
   ✓ [typescript] TypeScript (TypeScript 5.8+): 문법 6개, 함수 20개 검증 완료
   ✓ [javascript] JavaScript (ECMAScript 2024+): 문법 6개, 함수 20개 검증 완료

   [성공] 6개 언어 총 36개 문법 주제, 총 122개 표준 함수 레퍼런스 검증 100% 통과!
   ```
3. **웹 사이트 테스트 결과**:
   - `go -C site test ./...` 100% PASS:
     - `pro-study/site` (PASS)
     - `pro-study/site/internal/reference` (PASS)
     - `pro-study/site/internal/tour` (PASS)
     - `pro-study/site/internal/idea` (PASS)
     - `pro-study/site/internal/runner` (PASS)
     - `pro-study/site/internal/apk` (PASS)
     - `pro-study/site/internal/catalog` (PASS)
4. **Android APK 빌드 결과**:
   - `pro-study-v1.2.0.apk` (5.78 MB) 생성 완료.

---

## 3. WHY IT IS ENOUGH

- Plan document `plans/lang-reference-and-tour-tracing.plan.md`에 명시된 5개 Step의 선언된 모든 파일과 Acceptance Criteria(AC-1 ~ AC-3)가 빠짐없이 구현되고 자동화된 테스트를 통과했습니다.
- 웹 환경(키보드 타이핑 한 줄 필사)과 Android E-ink 단말기(스타일러스 펜 덧쓰기 터치 캔버스) 두 환경 모두에서 A Tour of Go 필사가 완벽히 지원됩니다.
- 사용자가 명시적으로 요청한 "아이디어를 입력할 수 있는 서버" 요구사항을 충족하기 위해 `/ideas` 웹 인터페이스와 JSON API 및 파일 기반 영속 저장소가 구축되었습니다.

---

## 4. WHAT WAS OMITTED

- 원격 클라우드 샌드박스 서버에서의 Go 원격 코드 실행(Remote Go Playground)은 학습자의 로컬 툴체인 및 로컬 pro-study 실행 환경을 활용하도록 계획서 Non-goals에 명시되어 제외되었습니다.
- 물리적 E-ink 기기 실물 터치/필압 측정은 자동화 CI 파이프라인 대신 모의 터치 이벤트와 Android View Hierarchy 렌더링 단위 검증으로 대체되었습니다.
