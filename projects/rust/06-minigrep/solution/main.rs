// 06-minigrep (solution)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, BufRead};

fn search(query: &str, line: &str, ignore_case: bool) -> bool {
    if ignore_case {
        line.to_lowercase().contains(&query.to_lowercase())
    } else {
        line.contains(query)
    }
}

fn main() {
    let stdin = io::stdin();
    let mut query = String::new();
    let mut ignore_case = false;
    let mut lines = Vec::new();
    let mut reading_data = false;

    for line in stdin.lock().lines() {
        if let Ok(l) = line {
            let trimmed = l.trim().to_string();
            if trimmed == "---DATA---" {
                reading_data = true;
                continue;
            }
            if !reading_data {
                if trimmed.starts_with("query ") {
                    query = trimmed[6..].to_string();
                } else if trimmed == "ignore_case" {
                    ignore_case = true;
                }
            } else {
                lines.push(trimmed);
            }
        }
    }

    for (idx, line) in lines.iter().enumerate() {
        if search(&query, line, ignore_case) {
            println!("{}: {}", idx + 1, line);
        }
    }
}
