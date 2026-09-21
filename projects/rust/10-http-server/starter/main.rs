// 10-http-server (starter)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, BufRead};

// TODO(step-1): HttpRequest 구조체
struct HttpRequest {
    method: String,
    path: String,
}

// TODO(step-2): parse_request 요청 파서
fn parse_request(raw: &str) -> Option<HttpRequest> {
    None
}

// TODO(step-3): route 핸들러
fn route(req: &HttpRequest) -> String {
    String::new()
}

// TODO(step-4): HttpResponse 포맷팅
fn format_response(status: u16, body: &str) -> String {
    String::new()
}

// TODO(step-5): REPL CLI
fn main() {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {}
}
