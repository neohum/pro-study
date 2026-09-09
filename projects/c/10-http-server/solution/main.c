// 10-http-server — HTTP/1.1 웹 서버 (solution)
//
// Winsock2 소켓 API와 표준 C23을 활용한 경량 HTTP/1.1 서버.
// Request-Line, Headers, Body를 파싱하고 REST 엔드포인트 응답을 생성한다.
// 소켓 서버 모드(serve)와 테스트를 위한 표준 입출력 모드(test)를 지원한다.

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
// Step 1: HTTP 요청 라인 파서 (Request Line Parser)
// ---------------------------------------------------------------------------
[[nodiscard]] static bool parse_request_line(const char *line, HttpRequest *req) {
    char method[16] = {0};
    char uri[MAX_PATH_LEN] = {0};
    char version[16] = {0};

    if (sscanf(line, "%15s %255s %15s", method, uri, version) != 3) {
        return false;
    }

    strncpy(req->method_raw, method, sizeof(req->method_raw) - 1);
    if (strcmp(method, "GET") == 0) {
        req->method = METHOD_GET;
    } else if (strcmp(method, "POST") == 0) {
        req->method = METHOD_POST;
    } else if (strcmp(method, "HEAD") == 0) {
        req->method = METHOD_HEAD;
    } else {
        req->method = METHOD_UNKNOWN;
    }

    char *qmark = strchr(uri, '?');
    if (qmark != nullptr) {
        *qmark = '\0';
        strncpy(req->path, uri, sizeof(req->path) - 1);
        strncpy(req->query, qmark + 1, sizeof(req->query) - 1);
    } else {
        strncpy(req->path, uri, sizeof(req->path) - 1);
        req->query[0] = '\0';
    }

    strncpy(req->version, version, sizeof(req->version) - 1);
    if (strncmp(version, "HTTP/1.", 7) != 0) {
        return false;
    }
    return true;
}

// ---------------------------------------------------------------------------
// Step 2: HTTP 헤더 및 바디 파서
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
    memset(req, 0, sizeof(*req));
    const char *line_end = strstr(raw, "\r\n");
    bool is_crlf = true;
    if (line_end == nullptr) {
        line_end = strchr(raw, '\n');
        is_crlf = false;
    }
    if (line_end == nullptr) {
        return false;
    }

    char first_line[MAX_PATH_LEN + 64] = {0};
    size_t first_len = (size_t)(line_end - raw);
    if (first_len >= sizeof(first_line)) return false;
    memcpy(first_line, raw, first_len);
    first_line[first_len] = '\0';

    if (!parse_request_line(first_line, req)) {
        return false;
    }

    const char *cur = is_crlf ? line_end + 2 : line_end + 1;
    while (*cur != '\0') {
        const char *next = is_crlf ? strstr(cur, "\r\n") : strchr(cur, '\n');
        if (next == nullptr) {
            break;
        }
        if (next == cur) {
            cur = is_crlf ? next + 2 : next + 1;
            break;
        }

        char hline[512] = {0};
        size_t hlen = (size_t)(next - cur);
        if (hlen < sizeof(hline)) {
            memcpy(hline, cur, hlen);
            hline[hlen] = '\0';

            char *colon = strchr(hline, ':');
            if (colon != nullptr && req->header_count < MAX_HEADERS) {
                *colon = '\0';
                char *hname = hline;
                char *hval = colon + 1;
                str_trim(hname);
                str_trim(hval);
                strncpy(req->headers[req->header_count].name, hname, sizeof(req->headers[req->header_count].name) - 1);
                strncpy(req->headers[req->header_count].value, hval, sizeof(req->headers[req->header_count].value) - 1);
                if (str_case_equal(hname, "Content-Length")) {
                    req->content_length = (size_t)atoll(hval);
                }
                req->header_count++;
            }
        }
        cur = is_crlf ? next + 2 : next + 1;
    }

    if (req->content_length > 0) {
        size_t avail = strlen(cur);
        size_t to_copy = req->content_length < avail ? req->content_length : avail;
        if (to_copy >= sizeof(req->body)) to_copy = sizeof(req->body) - 1;
        memcpy(req->body, cur, to_copy);
        req->body[to_copy] = '\0';
    } else if (*cur != '\0') {
        strncpy(req->body, cur, sizeof(req->body) - 1);
        req->content_length = strlen(req->body);
    }

    return true;
}

// ---------------------------------------------------------------------------
// Step 3: HTTP 응답 포맷터
// ---------------------------------------------------------------------------
static void build_response(HttpResponse *resp, int status, const char *reason, const char *content_type, const char *body) {
    resp->status_code = status;
    strncpy(resp->reason, reason, sizeof(resp->reason) - 1);
    strncpy(resp->content_type, content_type, sizeof(resp->content_type) - 1);
    if (body != nullptr) {
        strncpy(resp->body, body, sizeof(resp->body) - 1);
        resp->body_len = strlen(resp->body);
    } else {
        resp->body[0] = '\0';
        resp->body_len = 0;
    }
}

static size_t format_http_response(const HttpResponse *resp, char *out, size_t out_cap) {
    int n = snprintf(out, out_cap,
                     "HTTP/1.1 %d %s\r\n"
                     "Content-Type: %s\r\n"
                     "Content-Length: %zu\r\n"
                     "Connection: close\r\n"
                     "\r\n"
                     "%s",
                     resp->status_code,
                     resp->reason,
                     resp->content_type,
                     resp->body_len,
                     resp->body);
    if (n < 0 || (size_t)n >= out_cap) {
        return out_cap - 1;
    }
    return (size_t)n;
}

// ---------------------------------------------------------------------------
// Step 4: 라우팅 및 핸들러
// ---------------------------------------------------------------------------
static void handle_http_request(const HttpRequest *req, HttpResponse *resp) {
    if (req->method == METHOD_UNKNOWN) {
        build_response(resp, 405, "Method Not Allowed", "text/plain; charset=utf-8", "405 Method Not Allowed");
        return;
    }

    if (strcmp(req->path, "/") == 0 || strcmp(req->path, "/index.html") == 0) {
        if (req->method != METHOD_GET && req->method != METHOD_HEAD) {
            build_response(resp, 405, "Method Not Allowed", "text/plain; charset=utf-8", "405 Method Not Allowed");
            return;
        }
        const char *html = "<!DOCTYPE html><html><head><title>C23 Server</title></head><body><h1>Hello from C23 HTTP Server</h1></body></html>";
        build_response(resp, 200, "OK", "text/html; charset=utf-8", html);
    } else if (strcmp(req->path, "/health") == 0) {
        if (req->method != METHOD_GET && req->method != METHOD_HEAD) {
            build_response(resp, 405, "Method Not Allowed", "text/plain; charset=utf-8", "405 Method Not Allowed");
            return;
        }
        build_response(resp, 200, "OK", "application/json", "{\"status\":\"ok\",\"version\":\"1.0\"}");
    } else if (strcmp(req->path, "/echo") == 0) {
        if (req->method == METHOD_GET) {
            const char *msg = "";
            const char *prefix = "msg=";
            char *found = strstr((char *)req->query, prefix);
            if (found != nullptr) {
                msg = found + strlen(prefix);
            } else if (req->query[0] != '\0') {
                msg = req->query;
            }
            build_response(resp, 200, "OK", "text/plain; charset=utf-8", msg);
        } else if (req->method == METHOD_POST) {
            build_response(resp, 200, "OK", "text/plain; charset=utf-8", req->body);
        } else {
            build_response(resp, 405, "Method Not Allowed", "text/plain; charset=utf-8", "405 Method Not Allowed");
        }
    } else {
        build_response(resp, 404, "Not Found", "text/plain; charset=utf-8", "404 Not Found");
    }
}

// ---------------------------------------------------------------------------
// Step 5: Winsock2 소켓 서버 및 통합 입출력
// ---------------------------------------------------------------------------
static bool init_winsock(void) {
    WSADATA wsa;
    return WSAStartup(MAKEWORD(2, 2), &wsa) == 0;
}

static void cleanup_winsock(void) {
    WSACleanup();
}

static void run_server(int port) {
    if (!init_winsock()) {
        fprintf(stderr, "WSAStartup failed\n");
        return;
    }

    SOCKET server_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (server_fd == INVALID_SOCKET) {
        fprintf(stderr, "socket creation failed\n");
        cleanup_winsock();
        return;
    }

    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, (const char *)&opt, sizeof(opt));

    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons((unsigned short)port);

    if (bind(server_fd, (struct sockaddr *)&addr, sizeof(addr)) == SOCKET_ERROR) {
        fprintf(stderr, "bind failed\n");
        closesocket(server_fd);
        cleanup_winsock();
        return;
    }

    if (listen(server_fd, 10) == SOCKET_ERROR) {
        fprintf(stderr, "listen failed\n");
        closesocket(server_fd);
        cleanup_winsock();
        return;
    }

    printf("Server listening on port %d...\n", port);
    fflush(stdout);

    while (true) {
        struct sockaddr_in client_addr;
        int client_len = sizeof(client_addr);
        SOCKET client_fd = accept(server_fd, (struct sockaddr *)&client_addr, &client_len);
        if (client_fd == INVALID_SOCKET) {
            break;
        }

        char buffer[MAX_REQUEST_SIZE];
        int received = recv(client_fd, buffer, sizeof(buffer) - 1, 0);
        if (received > 0) {
            buffer[received] = '\0';
            HttpRequest req = {0};
            HttpResponse resp = {0};
            if (parse_http_request(buffer, &req)) {
                handle_http_request(&req, &resp);
            } else {
                build_response(&resp, 400, "Bad Request", "text/plain; charset=utf-8", "400 Bad Request");
            }
            char resp_buf[MAX_RESPONSE_SIZE];
            size_t resp_len = format_http_response(&resp, resp_buf, sizeof(resp_buf));
            send(client_fd, resp_buf, (int)resp_len, 0);
        }
        closesocket(client_fd);
    }

    closesocket(server_fd);
    cleanup_winsock();
}

static void run_stdio_test(void) {
    char buffer[MAX_REQUEST_SIZE];
    size_t total = 0;
    size_t n = 0;
    while ((n = fread(buffer + total, 1, sizeof(buffer) - 1 - total, stdin)) > 0) {
        total += n;
    }
    buffer[total] = '\0';

    if (total == 0) return;

    HttpRequest req = {0};
    HttpResponse resp = {0};
    if (parse_http_request(buffer, &req)) {
        handle_http_request(&req, &resp);
    } else {
        build_response(&resp, 400, "Bad Request", "text/plain; charset=utf-8", "400 Bad Request");
    }

    char resp_buf[MAX_RESPONSE_SIZE];
    format_http_response(&resp, resp_buf, sizeof(resp_buf));
    printf("%s", resp_buf);
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
