# 10-http-framework (starter)
import sys

# TODO(step-1): Request 객체 파싱 (Method, Path, Headers)
class Request:
    def __init__(self, raw: str):
        self.method = ""
        self.path = ""
        self.headers = {}

# TODO(step-2): Response 빌더
class Response:
    def __init__(self, status: int = 200, body: str = ""):
        self.status = status
        self.body = body

# TODO(step-3): 경로 파라미터(:param) 라우팅 엔진
class Router:
    def __init__(self):
        self.routes = []

    def add(self, pattern: str, handler):
        pass

# TODO(step-4): 미들웨어 파이프라인
def apply_middlewares(req: Request, handler):
    return handler(req)

# TODO(step-5): HTTP 스트림 처리 루프
def main():
    pass

if __name__ == "__main__":
    main()
