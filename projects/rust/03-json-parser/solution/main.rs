// 03-json-parser (solution)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, BufRead};

#[derive(Debug, PartialEq)]
enum JsonValue {
    Null,
    Bool(bool),
    Number(i64),
    Str(String),
    Array(Vec<JsonValue>),
    Object(Vec<(String, JsonValue)>),
}

fn skip_whitespace(s: &str) -> &str {
    s.trim_start()
}

fn parse_value(s: &str) -> Result<(JsonValue, &str), String> {
    let s = skip_whitespace(s);
    if s.starts_with('"') {
        let mut end = 1;
        let bytes = s.as_bytes();
        while end < bytes.len() && bytes[end] != b'"' {
            end += 1;
        }
        if end >= bytes.len() { return Err("Unterminated string".into()); }
        let content = &s[1..end];
        Ok((JsonValue::Str(content.to_string()), &s[end+1..]))
    } else if s.starts_with('{') {
        let mut rest = &s[1..];
        let mut fields = Vec::new();
        loop {
            rest = skip_whitespace(rest);
            if rest.starts_with('}') {
                return Ok((JsonValue::Object(fields), &rest[1..]));
            }
            let (k, next_r) = parse_value(rest)?;
            let key = match k {
                JsonValue::Str(st) => st,
                _ => return Err("Key must be string".into()),
            };
            rest = skip_whitespace(next_r);
            if !rest.starts_with(':') {
                return Err("Expected ':'".into());
            }
            rest = &rest[1..];
            let (v, next_r2) = parse_value(rest)?;
            fields.push((key, v));
            rest = skip_whitespace(next_r2);
            if rest.starts_with(',') {
                rest = &rest[1..];
            }
        }
    } else if s.starts_with('[') {
        let mut rest = &s[1..];
        let mut items = Vec::new();
        loop {
            rest = skip_whitespace(rest);
            if rest.starts_with(']') {
                return Ok((JsonValue::Array(items), &rest[1..]));
            }
            let (item, next_r) = parse_value(rest)?;
            items.push(item);
            rest = skip_whitespace(next_r);
            if rest.starts_with(',') {
                rest = &rest[1..];
            }
        }
    } else if s.starts_with("true") {
        Ok((JsonValue::Bool(true), &s[4..]))
    } else if s.starts_with("false") {
        Ok((JsonValue::Bool(false), &s[5..]))
    } else if s.starts_with("null") {
        Ok((JsonValue::Null, &s[4..]))
    } else {
        let mut end = 0;
        let bytes = s.as_bytes();
        while end < bytes.len() && (bytes[end].is_ascii_digit() || bytes[end] == b'-') {
            end += 1;
        }
        if end > 0 {
            let n: i64 = s[..end].parse().map_err(|e| format!("{}", e))?;
            Ok((JsonValue::Number(n), &s[end..]))
        } else {
            Err("Unexpected token".into())
        }
    }
}

fn count_nodes(val: &JsonValue) -> usize {
    match val {
        JsonValue::Array(arr) => 1 + arr.iter().map(count_nodes).sum::<usize>(),
        JsonValue::Object(obj) => 1 + obj.iter().map(|(_, v)| 1 + count_nodes(v)).sum::<usize>(),
        _ => 1,
    }
}

fn main() {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {
        if let Ok(l) = line {
            let trimmed = l.trim();
            if trimmed.is_empty() { continue; }
            match parse_value(trimmed) {
                Ok((val, _)) => {
                    let kind = match val {
                        JsonValue::Object(_) => "object",
                        JsonValue::Array(_) => "array",
                        _ => "primitive",
                    };
                    println!("Parsed: {}, Nodes: {}", kind, count_nodes(&val));
                }
                Err(e) => println!("error: {}", e),
            }
        }
    }
}
