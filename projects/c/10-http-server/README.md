# 10. HTTP/1.1 웹 서버

## 무엇을 만드는가

Windows 소켓 API(Winsock2)와 표준 C23을 결합하여 HTTP/1.1 프로토콜의 요청 라인·헤더·바디를
직접 파싱하고, REST 엔드포인트와 상태 코드에 맞는 HTTP 응답을 생성하는 경량 웹 서버를 만든다.

서버는 독립 소켓 서버 모드(`serve`)와 단위 테스트/채점을 위한 표준 입출력 모드(`test`)를 모두 지원한다:

```
$ build/app.exe
GET /health HTTP/1.1
Host: localhost:8080

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 31
Connection: close

{"status":"ok","version":"1.0"}
```

실제 브라우저나 `curl`로 통신할 때는 소켓 모드로 실행한다:
```
$ build/app.exe serve 8080
Server listening on port 8080...
```

지원하는 엔드포인트:
- `GET /`: 환영 HTML 페이지 반환 (200 OK)
- `GET /health`: JSON 헬스체크 응답 (200 OK)
- `GET /echo?msg=<text>`: 쿼리 매개변수 에코 (200 OK)
- `POST /echo`: 요청 바디 에코 (200 OK)
- 미지원 메소드: 405 Method Not Allowed
- 존재하지 않는 경로: 404 Not Found
- 잘못된 문법: 400 Bad Request

## 왜 이 프로젝트인가

HTTP는 웹과 분산 시스템의 근간 프로토콜이다. 고수준 프레임워크(Express, Spring, Gin 등)를
쓰면 몇 줄로 API를 띄우지만, 하부 네트워크 바이트 스트림이 어떻게 흘러가고 파싱되는지는
가려진다.

이 프로젝트를 통해 다음 핵심을 체득한다:
1. **프로토콜 명세(RFC 9112)의 문자열 수준 파싱**: `\r\n` 구분자, 헤더 키-값 쌍, `Content-Length` 프레이밍.
2. **Winsock2 소켓 프로그래밍**: `WSAStartup`, `socket`, `bind`, `listen`, `accept`, `send`/`recv`의 생명주기.
3. **C23을 통한 견고한 버퍼 처리**: `nullptr`, `constexpr`, `[[nodiscard]]`, `enum : unsigned char`를 통한 타입 안전성.
4. **테스트 용이성(Testability)을 고려한 아키텍처**: 네트워크 I/O와 프로토콜 파싱/핸들러 로직을 분리하여 표준 입출력(`stdio-cases`)으로 100% 자동 검증 가능.

## 핵심 개념

### HTTP/1.1 메시지 구조

HTTP 요청은 세 부분으로 구성된다:
```http
GET /echo?msg=hello HTTP/1.1\r\n        <-- 1. Request Line (메소드, 경로, 프로토콜)
Host: localhost:8080\r\n                 <-- 2. Headers (키: 값)
User-Agent: curl/8.0.0\r\n
\r\n                                     <-- 빈 줄 (헤더의 끝)
{"name": "test"}                         <-- 3. Body (POST/PUT 등에서 Content-Length만큼)
```

응답 또한 동일한 프레이밍 구조를 가진다:
```http
HTTP/1.1 200 OK\r\n                      <-- Status Line (버전, 상태 코드, 사유 구절)
Content-Type: text/plain\r\n            <-- Headers
Content-Length: 5\r\n
Connection: close\r\n
\r\n                                     <-- 빈 줄
hello                                    <-- Body
```

### Content-Length와 메시지 경계

HTTP/1.1에서 `Connection: close` 모델을 쓰더라도, 바디가 있는 요청(`POST`)은
반드시 `Content-Length` 헤더를 읽어 그 바이트 수만큼만 정확히 바디 버퍼로 읽어야 한다.
바디가 끝난 뒤 이어지는 추가 데이터나 파이프라인 요청과 섞이지 않도록 하기 위함이다.

### Winsock2 네트워킹 생명주기

Windows에서 소켓 프로그래밍을 하려면 `<winsock2.h>`를 포함하고 링크 옵션에 `-lws2_32`를 전달해야 한다.
1. `WSAStartup(MAKEWORD(2, 2), &wsa)`: 소켓 라이브러리 초기화.
2. `socket(AF_INET, SOCK_STREAM, IPPROTO_TCP)`: TCP 스트림 소켓 생성.
3. `bind(server_fd, ...)`: 로컬 IP 및 포트 바인딩.
4. `listen(server_fd, backlog)`: 수신 대기 큐 생성.
5. `accept(server_fd, ...)`: 클라이언트 연결 수락 (`SOCKET client_fd` 반환).
6. `closesocket(fd)` 및 `WSACleanup()`: 리소스 해제.

```c
#include <winsock2.h>
#include <ws2tcpip.h>

constexpr int PORT = 8080;
SOCKET server_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
```

### C23 기능 활용

```c
constexpr size_t MAX_REQUEST_SIZE = 8'192;
constexpr size_t MAX_RESPONSE_SIZE = 8'192;
typedef enum HttpMethod : unsigned char {
    METHOD_UNKNOWN,
    METHOD_GET,
    METHOD_POST,
    METHOD_HEAD,
} HttpMethod;
[[nodiscard]] static bool parse_http_request(const char *raw, HttpRequest *req);
```

## 단계별 구현

`starter/main.c`의 `TODO(step-N)` 주석이 아래 단계와 1:1이다.
각 단계를 끝낼 때마다 빌드해서 경고가 없는지 확인하자.

### Step 1: HTTP 요청 라인 파서
`parse_request_line` 함수를 작성한다. 첫 번째 줄에서 메소드(GET, POST, HEAD 등),
경로(URI), 프로토콜 버전(`HTTP/1.1`)을 공백을 기준으로 분리하고 검증한다.
버전이 `HTTP/1.1` 또는 `HTTP/1.0`이 아니거나 형식이 어긋나면 `false`를 반환한다.

확인: 빌드가 정상 완료되고 잘못된 요청 라인에 대해 400 처리가 가능해진다.

### Step 2: HTTP 헤더 및 바디 파서
`parse_headers_and_body`를 작성한다. `\r\n`으로 구분된 각 헤더 줄을 파싱하여
`Header` 배열에 키와 값으로 저장한다. 대소문자를 구분하지 않고 `Content-Length`를 찾아
정수로 변환하고, 헤더 종료를 알리는 빈 줄(`\r\n\r\n` 또는 `\n\n`) 뒤의 바디를 추출한다.

확인: POST 요청의 Content-Length와 바디 문자열이 `req->body`에 정확히 담긴다.

### Step 3: HTTP 응답 포맷터
`format_http_response`를 작성한다. 상태 코드(200, 400, 404, 405 등), 사유 구절(OK, Not Found 등),
헤더(`Content-Type`, `Content-Length`, `Connection: close`), 그리고 바디를
표준 HTTP 응답 포맷 문자열로 `snprintf`를 통해 조립한다.

확인: 응답 문자열의 `Content-Length`가 바디 실제 길이와 정확히 일치한다.

### Step 4: 라우팅 및 핸들러
`handle_http_request`를 구현한다.
- `GET /` -> 200 OK, `text/html; charset=utf-8`, 환영 페이지
- `GET /health` -> 200 OK, `application/json`, `{"status":"ok","version":"1.0"}`
- `GET /echo?msg=...` -> 200 OK, `text/plain; charset=utf-8`, 쿼리 텍스트
- `POST /echo` -> 200 OK, `text/plain; charset=utf-8`, 수신한 바디
- 그 외의 경로 -> 404 Not Found
- 지원하지 않는 메소드 -> 405 Method Not Allowed

확인: 각 요청에 대해 올바른 상태 코드와 바디가 응답 객체에 설정된다.

### Step 5: Winsock2 소켓 서버 및 통합 입출력
`run_server`에 Winsock2 초기화(`WSAStartup`), 소켓 생성, 바인드, 리슨, 수락 루프를 완성하고,
`run_stdio_test`에 표준 입력에서 요청을 읽어 파싱 후 표준 출력으로 응답을 내보내는 테스트 파이프라인을 연결한다.
`main`에서 `serve` 인자가 들어오면 소켓 서버를 띄우고, 없으면 stdio 테스트를 실행한다.

확인: `[테스트]`를 실행하여 모든 HTTP 케이스가 통과하는지 확인한다.

## 막혔을 때

| 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| `undefined reference to WSAStartup` | 라이브러리 링크 누락 | `gcc` 명령에 `-lws2_32` 옵션이 들어가 있는지 확인 |
| `Content-Length` 불일치로 클라이언트 멈춤 | 바디 길이 계산 오류 | `strlen(resp->body)`를 정확히 계산하여 헤더에 기록 |
| `\r\n`과 `\n` 차이로 파싱 실패 | CRLF 정규화 누락 | 줄바꿈 검사 시 `\r\n`과 단독 `\n`을 모두 안전하게 처리 |
| 쿼리 스트링 파싱 후 잘못된 문자 포함 | 문자열 끝 `\0` 미처리 | `?msg=` 이후를 복사할 때 공백이나 줄바꿈 전까지만 복사 |
| `bind failed` 에러 (10048) | 포트가 이미 사용 중 | `SO_REUSEADDR` 소켓 옵션을 주거나 다른 포트 번호 지정 |

## 더 나아가기

- **정적 파일 서빙**: 실제 디렉터리(`public/`)의 HTML, CSS, 이미지 파일을 읽어 `Content-Type`을 판별(MIME 타입 매핑)하여 전송하는 파일 핸들러를 구현해 보자.
- **스레드풀 결합**: 9번 프로젝트에서 만든 스레드풀을 가져와, 연결 수락(`accept`)마다 워커 스레드에게 소켓 처리를 위임하는 멀티스레드 고성능 웹 서버를 만들어 보자.
- **Keep-Alive 연결 재사용**: `Connection: keep-alive` 헤더를 지원하여 단일 TCP 연결에서 여러 HTTP 요청을 연속 처리해 보자.

## 참고

- RFC 9112: HTTP/1.1 Specification (<https://datatracker.ietf.org/doc/html/rfc9112>)
- Microsoft Docs: Winsock Getting Started (<https://learn.microsoft.com/en-us/windows/win32/winsock/getting-started-with-winsock>)
- C23 표준 (ISO/IEC 9899:2024 N3220): 7.21.1 `nullptr`, 6.7.1 `constexpr`
