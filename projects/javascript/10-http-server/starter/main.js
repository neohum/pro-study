// 10-http-server (starter)
const readline = require('readline');

// TODO(step-1): HTTP 요청 문자열 파서
function parseRequest(raw) {
  return { method: 'GET', path: '/' };
}

// TODO(step-2): 라우터 클래스
class Router {
  #routes = [];
  add(method, path, handler) {}
  match(method, path) { return null; }
}

// TODO(step-3): 응답 포맷팅 유틸리티
function buildResponse(status, body, contentType = 'text/plain') {
  return "";
}

// TODO(step-4): 미들웨어 실행기
function runMiddlewares(req, middlewares, handler) {
  return handler(req);
}

// TODO(step-5): HTTP 스트림 처리
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
