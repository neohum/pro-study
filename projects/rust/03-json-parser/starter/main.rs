// 03-json-parser (starter)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::collections::HashMap;
use std::io::{self, BufRead};

// TODO(step-1): JsonValue 재귀 열거형 정의
#[derive(Debug, PartialEq)]
enum JsonValue {
    Null,
    Bool(bool),
    Number(f64),
    Str(String),
    Array(Vec<JsonValue>),
    Object(HashMap<String, JsonValue>),
}

// TODO(step-2): 문자열 및 숫자 파서
fn parse_number(s: &str) -> (JsonValue, &str) {
    (JsonValue::Null, s)
}

// TODO(step-3): 객체 및 배열 파서
fn parse_value(s: &str) -> Result<(JsonValue, &str), String> {
    Ok((JsonValue::Null, s))
}

// TODO(step-4): JSON 직렬화기 (minify)
fn stringify(val: &JsonValue) -> String {
    String::new()
}

// TODO(step-5): REPL 파이프라인
fn main() {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {}
}
