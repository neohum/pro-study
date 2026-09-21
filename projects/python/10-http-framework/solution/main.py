# 10-http-framework (solution)
import sys
import re

def parse_http_request(raw: str):
    lines = raw.split("\r\n")
    if not lines or not lines[0]:
        return None, None
    req_line = lines[0].split()
    if len(req_line) < 2:
        return None, None
    method, path = req_line[0], req_line[1]
    return method, path

def handle_route(method: str, path: str) -> str:
    if path == "/hello":
        body = "Hello World"
        return f"HTTP/1.1 200 OK\r\nContent-Length: {len(body)}\r\n\r\n{body}"
    m = re.match(r"^/users/(\d+)$", path)
    if m:
        uid = m.group(1)
        body = f"User ID: {uid}"
        return f"HTTP/1.1 200 OK\r\nContent-Length: {len(body)}\r\n\r\n{body}"
    body = "Not Found"
    return f"HTTP/1.1 404 Not Found\r\nContent-Length: {len(body)}\r\n\r\n{body}"

def main():
    content = sys.stdin.read()
    if not content:
        return
    method, path = parse_http_request(content)
    if method and path:
        print(handle_route(method, path))

if __name__ == "__main__":
    main()
