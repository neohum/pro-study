// 01-cli-calc (starter)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, BufRead};

// TODO(step-1): Token 및 Tokenizer 정의
#[derive(Debug, PartialEq, Clone)]
enum Token {
    Num(i64),
    Plus,
    Minus,
    Mul,
    Div,
    LParen,
    RParen,
}

fn tokenize(input: &str) -> Result<Vec<Token>, String> {
    Ok(Vec::new())
}

// TODO(step-2): Parser 구조체와 Factor 파싱 (숫자, 괄호)
struct Parser {
    tokens: Vec<Token>,
    pos: usize,
}

impl Parser {
    fn new(tokens: Vec<Token>) -> Self {
        Parser { tokens, pos: 0 }
    }

    fn parse_factor(&mut self) -> Result<i64, String> {
        Ok(0)
    }

    // TODO(step-3): Term 파싱 (*, /)
    fn parse_term(&mut self) -> Result<i64, String> {
        Ok(0)
    }

    // TODO(step-4): Expr 파싱 (+, -)
    fn parse_expr(&mut self) -> Result<i64, String> {
        Ok(0)
    }
}

// TODO(step-5): REPL 입출력 루프
fn main() {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {
        if let Ok(l) = line {
            let trimmed = l.trim();
            if trimmed.is_empty() { continue; }
            // 계산 수행
        }
    }
}
