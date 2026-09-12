# E-ink Book용 pro-study 안드로이드 앱 사용자 및 개발자 가이드

`android-app/`은 E-ink 전자책 단말기(Onyx Boox, Likebook, Kobo/Kindle 안드로이드 포팅 기기, Galaxy Tab S-Pen 등)에서 C23 및 Go 언어의 20개 프로젝트를 흑백 고대비 화면으로 학습하고, **손가락 터치는 스크롤**, **전용 펜(Stylus)은 필기 및 코드 따라쓰기(Tracing)** 로 입력 수단을 하드웨어 레벨에서 분리하여 학습하는 특화 애플리케이션입니다.

---

## 1. 핵심 기능

### 1) 손가락 스크롤 vs 전용 펜 필기 분리 (Palm Rejection)
- **손가락 터치 (`TOOL_TYPE_FINGER`)**: 화면을 상하로 자연스럽게 스크롤(Scroll / Pan)하고 탭을 전환합니다.
- **전용 펜 (`TOOL_TYPE_STYLUS` / Wacom EMR / S-Pen / Active Pen)**: 화면에 닿는 즉시 베지어 보간된 검은색 잉크로 필기 및 주석을 남깁니다.
- **완벽한 손바닥 방지(Palm Rejection)**: 스타일러스로 글씨를 쓰는 동안 손바닥이 화면에 닿아도 선이 그어지거나 화면이 튀지 않습니다.

### 2) 코드 따라쓰기(Tracing / 필사) 모드
- 프로그래밍 언어의 구문과 키워드를 손으로 직접 체화하는 모드입니다.
- 원본 코드가 **옅은 회색(Ghost Text / 25% 회색 가이드라인)** 과 **노트 밑선(Ruled line)** 으로 깔립니다.
- 사용자는 전용 펜으로 코드를 한 줄씩 덧써 내려가며 타이핑과는 다른 깊이 있는 학습을 경험합니다.
- **원문 토글**: 원본 가이드 글자를 끄고 내가 쓴 필기만 확인하여 자가 진단 가능.
- **스크롤 동기화**: 손가락으로 코드 페이지를 넘기면 작성한 필기 획도 코드 라인에 정확히 고정되어 함께 이동합니다.

### 3) E-ink 디스플레이 최적화
- **순수 흑백 고대비 (Pure Black & White)**: 배경 `#FFFFFF`, 텍스트 `#000000`, 보조선 `#E0E0E0`.
- **불필요한 리프레시 배제**: 화면 전환 애니메이션, 그림자 효과(`elevation`), 페이드 효과를 전면 비활성화하여 잔상과 깜빡임을 최소화.
- **원터치 잔상 제거 (Flash Refresh)**: 상단 **[화면 새로고침]** 버튼을 누르면 120ms 동안 화면을 흑백 반전 후 재렌더링하여 E-ink 고유의 잔상을 깨끗하게 정리합니다.

- 20개 프로젝트(C23 10개, Go 10개)의 상세 학습 가이드가 `assets/content/`에 패키징되어 있어 Wi-Fi 연결 없이도 산속이나 비행기 안에서 사용 가능합니다.
- **E-ink 대화면 맞춤 타이포그래피**: 가이드 본문 텍스트 크기를 1.5배(23sp, 행간 10dp)로 시원하게 확대하여 단말기 가독성을 극대화하고, 불필요한 스켈레톤/정답 탭을 배제하여 가이드 학습과 펜 필기·따라쓰기 본연에 집중합니다.
- 작성한 필기 데이터는 기기 내부 스토리지(`ink_sessions/`)에 프로젝트별로 자동 보관됩니다.

---

## 2. 기기별 최적화 권장 설정

| 기기군 | 권장 화면 리프레시 모드 | 스타일러스 팁 |
| --- | --- | --- |
| **Onyx Boox** (Note Air, Tab Ultra, Palma) | **Regal 모드** 또는 **Normal 모드**<br>(텍스트 가독성 최우선) | 네이티브 스타일러스 지우개 버튼 매핑 지원 |
| **Meebook / Likebook** | **Clear 모드** | 지우개 토글 버튼 활용 |
| **Samsung Galaxy Tab** | **기본 디스플레이 모드** | S-Pen 측면 버튼을 누른 채 터치하면 지우개로 즉시 전환 |

---

## 3. 프로젝트 빌드 및 설치 방법

### 1) 사전 준비
- Android Studio Hedgehog (2023.1.1) 이상 또는 JDK 17
- Android SDK 34 (Android 14) / Min SDK 26 (Android 8.0 이상)

### 2) 에셋 동기화
`projects/`의 최신 소스코드와 가이드를 안드로이드 에셋으로 동기화하려면 다음 스크립트를 실행합니다:
```bash
node scripts/package-android-assets.js
```

### 3) APK 빌드
Android Studio에서 `android-app/` 폴더를 열고 `Build > Build Bundle(s) / APK(s) > Build APK(s)`를 선택하거나, 터미널에서 Gradle로 빌드합니다:
```bash
cd android-app
./gradlew assembleDebug
```

생성된 APK 파일 경로:
`android-app/app/build/outputs/apk/debug/app-debug.apk`

### 4) 기기에 설치

#### 방법 A. 내부 네트워크(Wi-Fi) 웹 페이지에서 무선 다운로드 (가장 편리함)
1. PC에서 내부 네트워크 모드로 서버를 엽니다:
   ```bash
   # Windows
   pwsh scripts/serve-lan.ps1

   # macOS / Linux
   bash scripts/serve-lan.sh
   ```
2. PC 브라우저 또는 E-ink 단말기 카메라로 콘솔/화면에 표시된 **QR 코드를 스캔**하거나 `http://<PC의-LAN-IP>:8787/apk`로 접속합니다.
3. 화면의 **[APK 다운로드]** 버튼을 누르면 기기로 `pro-study.apk`가 즉시 다운로드됩니다.
4. 다운로드 완료 후 알림창을 터치하여 '출처를 알 수 없는 앱 설치 허용' 후 설치를 완료합니다.
5. (선택) 웹 화면에서 **[최신 소스로 APK 다시 빌드]**를 누르면 언제든 최신 코드가 패키징된 APK를 다시 빌드할 수 있습니다.

#### 방법 B. USB 연결 (ADB)
USB 디버깅을 켠 E-ink 기기를 연결하고 터미널에서 설치합니다:
```bash
adb install android-app/app/build/outputs/apk/debug/app-debug.apk
```
