// 10-http-server — HTTP/1.1 웹 서버 (starter)
//
// Winsock2 소켓 API와 표준 C23을 활용한 경량 HTTP/1.1 서버.
// Request-Line, Headers, Body를 파싱하고 REST 엔드포인트 응답을 생성한다.
// 소켓 서버 모드(serve)와 테스트를 위한 표준 입출력 모드(test)를 지원한다.
//
// 가이드의 "단계별 구현"과 아래 TODO(step-N) 주석이 1:1로 대응한다.
// 각 단계를 끝낼 때마다 빌드해서 경고가 없는지 확인하자.

#include <winsock2.h>
#include <ws2tcpip.h>
#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// C23: constexpr 컴파일 시간 상수
constexpr size_t MAX_REQUEST_SIZE = 8'192;
constexpr size_t MAX_RESPONSE_SIZE = 8'192;
constexpr size_t MAX_HEADERS = 32;
constexpr size_t MAX_PATH_LEN = 256;

// C23: enum 밑바탕 타입
typedef enum HttpMethod : unsigned char {
    METHOD_UNKNOWN,
    METHOD_GET,
    METHOD_POST,
    METHOD_HEAD,
} HttpMethod;

typedef struct Header {
    char name[64];
    char value[256];
} Header;

typedef struct HttpRequest {
    HttpMethod method;
    char method_raw[16];
    char path[MAX_PATH_LEN];
    char query[MAX_PATH_LEN];
    char version[16];
    Header headers[MAX_HEADERS];
    size_t header_count;
    size_t content_length;
    char body[MAX_REQUEST_SIZE];
} HttpRequest;

typedef struct HttpResponse {
    int status_code;
    char reason[64];
    char content_type[64];
    char body[MAX_RESPONSE_SIZE];
    size_t body_len;
} HttpResponse;

// ---------------------------------------------------------------------------
// TODO(step-1): HTTP 요청 라인 파서 (Request Line Parser)
// 첫 번째 줄(line)에서 "METHOD URI VERSION"을 공백으로 분리하고 검증한다.
// - method: GET, POST, HEAD 등을 파싱해 HttpMethod로 변환
// - uri: '?'가 있으면 path와 query로 분리
// - version: HTTP/1.1 또는 HTTP/1.0 형식인지 확인 (다르면 false)
// ---------------------------------------------------------------------------
[[nodiscard]] static bool parse_request_line(const char *line, HttpRequest *req) {
    (void)line;
    (void)req;
    return false;
}

// ---------------------------------------------------------------------------
// TODO(step-2): HTTP 헤더 및 바디 파서
// - line_end까지가 첫 번째 줄 -> parse_request_line 호출
// - 이후 줄마다 \r\n 또는 \n 기준으로 'Key: Value' 헤더를 파싱
// - "Content-Length" 헤더를 대소문자 무시하고 찾아 req->content_length에 저장
// - 빈 줄(\r\n\r\n 또는 \n\n)을 만나면 헤더가 끝난 것이므로 이후 내용을 req->body에 복사
// ---------------------------------------------------------------------------
static void str_trim(char *s) {
    char *start = s;
    while (*start && (*start == ' ' || *start == '\t')) start++;
    char *end = start + strlen(start) - 1;
    while (end >= start && (*end == ' ' || *end == '\t' || *end == '\r' || *end == '\n')) {
        *end-- = '\0';
    }
    if (start > s) {
        memmove(s, start, strlen(start) + 1);
    }
}

static bool str_case_equal(const char *a, const char *b) {
    while (*a && *b) {
        if (tolower((unsigned char)*a) != tolower((unsigned char)*b)) return false;
        a++;
        b++;
    }
    return *a == *b;
}

[[nodiscard]] static bool parse_http_request(const char *raw, HttpRequest *req) {
    (void)raw;
    (void)req;
    (void)parse_request_line;
    (void)str_trim;
    (void)str_case_equal;
    return false;
}

// ---------------------------------------------------------------------------
// TODO(step-3): HTTP 응답 포맷터
// - build_response: status, reason, content_type, body를 HttpResponse 구조체에 채운다.
// - format_http_response:
//   "HTTP/1.1 %d %s\r\nContent-Type: %s\r\nContent-Length: %zu\r\nConnection: close\r\n\r\n%s"
//   형태로 out 버퍼에 문자열을 쓰고 길이를 반환한다.
// ---------------------------------------------------------------------------
static void build_response(HttpResponse *resp, int status, const char *reason, const char *content_type, const char *body) {
    (void)resp;
    (void)status;
    (void)reason;
    (void)content_type;
    (void)body;
}

static size_t format_http_response(const HttpResponse *resp, char *out, size_t out_cap) {
    (void)resp;
    (void)out;
    (void)out_cap;
    return 0;
}

// ---------------------------------------------------------------------------
// TODO(step-4): 라우팅 및 핸들러
// - GET / 또는 GET /index.html: 200 OK, text/html, 환영 HTML 페이지
// - GET /health: 200 OK, application/json, {"status":"ok","version":"1.0"}
// - GET /echo?msg=<text>: 200 OK, text/plain, 쿼리 텍스트
// - POST /echo: 200 OK, text/plain, 요청 바디
// - 미지원 메소드: 405 Method Not Allowed
// - 그 외 경로: 404 Not Found
// ---------------------------------------------------------------------------
static void handle_http_request(const HttpRequest *req, HttpResponse *resp) {
    (void)req;
    (void)resp;
    (void)build_response;
}

// ---------------------------------------------------------------------------
// TODO(step-5): Winsock2 소켓 서버 및 통합 입출력
// - run_server: WSAStartup -> socket -> bind -> listen -> accept 루프
// - run_stdio_test: stdin에서 요청 전문을 끝까지 읽어 parse_http_request -> handle_http_request -> stdout 출력
// - main: "serve" 인자가 들어오면 run_server, 아니면 run_stdio_test 실행
// ---------------------------------------------------------------------------
static bool init_winsock(void) {
    WSADATA wsa;
    return WSAStartup(MAKEWORD(2, 2), &wsa) == 0;
}

static void cleanup_winsock(void) {
    WSACleanup();
}

static void run_server(int port) {
    (void)port;
    (void)init_winsock;
    (void)cleanup_winsock;
    (void)handle_http_request;
    (void)format_http_response;
}

static void run_stdio_test(void) {
    (void)parse_http_request;
    (void)handle_http_request;
    (void)format_http_response;
    (void)build_response;
}

int main(int argc, char *argv[]) {
    if (argc > 1 && strcmp(argv[1], "serve") == 0) {
        int port = 8080;
        if (argc > 2) {
            port = atoi(argv[2]);
            if (port <= 0 || port > 65535) port = 8080;
        }
        run_server(port);
    } else {
        run_stdio_test();
    }
    return 0;
}
