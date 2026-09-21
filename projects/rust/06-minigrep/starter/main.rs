// 06-minigrep (starter)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, BufRead};

// TODO(step-1): Config 구조체
struct Config {
    query: String,
    ignore_case: bool,
}

// TODO(step-2): 대소문자 구분 검색 search
fn search<'a>(query: &str, contents: &'a str) -> Vec<(usize, &'a str)> {
    Vec::new()
}

// TODO(step-3): 대소문자 무시 검색 search_case_insensitive
fn search_case_insensitive<'a>(query: &str, contents: &'a str) -> Vec<(usize, &'a str)> {
    Vec::new()
}

// TODO(step-4): 결과 포맷팅
fn format_match(line_no: usize, line: &str) -> String {
    format!("{}: {}", line_no, line)
}

// TODO(step-5): REPL CLI
fn main() {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {}
}
