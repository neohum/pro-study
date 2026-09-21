// 10-http-server (solution)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, Read};

struct HttpRequest {
    method: String,
    path: String,
}

fn parse_request(raw: &str) -> Option<HttpRequest> {
    let mut lines = raw.split("\r\n");
    let first = lines.next()?;
    let parts: Vec<&str> = first.split_whitespace().collect();
    if parts.len() < 2 { return None; }
    Some(HttpRequest {
        method: parts[0].to_string(),
        path: parts[1].to_string(),
    })
}

fn handle_request(req: &HttpRequest) -> String {
    if req.path == "/hello" {
        let body = "Hello World";
        format!("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: {}\r\n\r\n{}", body.len(), body)
    } else if req.path == "/api/status" {
        let body = "{\"status\":\"ok\"}";
        format!("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}", body.len(), body)
    } else {
        let body = "Not Found";
        format!("HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: {}\r\n\r\n{}", body.len(), body)
    }
}

fn main() {
    let mut raw = String::new();
    if io::stdin().read_to_string(&mut raw).is_err() {
        return;
    }
    if let Some(req) = parse_request(&raw) {
        println!("{}", handle_request(&req));
    }
}
