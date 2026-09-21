// 01-cli-calc (solution)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, BufRead};

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
    let mut tokens = Vec::new();
    let mut chars = input.chars().peekable();
    while let Some(&ch) = chars.peek() {
        if ch.is_whitespace() {
            chars.next();
        } else if ch.is_ascii_digit() {
            let mut num: i64 = 0;
            while let Some(&d) = chars.peek() {
                if d.is_ascii_digit() {
                    num = num * 10 + (d as i64 - '0' as i64);
                    chars.next();
                } else {
                    break;
                }
            }
            tokens.push(Token::Num(num));
        } else {
            match ch {
                '+' => tokens.push(Token::Plus),
                '-' => tokens.push(Token::Minus),
                '*' => tokens.push(Token::Mul),
                '/' => tokens.push(Token::Div),
                '(' => tokens.push(Token::LParen),
                ')' => tokens.push(Token::RParen),
                _ => return Err(format!("Unknown char: {}", ch)),
            }
            chars.next();
        }
    }
    Ok(tokens)
}

struct Parser {
    tokens: Vec<Token>,
    pos: usize,
}

impl Parser {
    fn new(tokens: Vec<Token>) -> Self {
        Parser { tokens, pos: 0 }
    }

    fn peek(&self) -> Option<&Token> {
        self.tokens.get(self.pos)
    }

    fn next_tok(&mut self) -> Option<Token> {
        if self.pos < self.tokens.len() {
            let tok = self.tokens[self.pos].clone();
            self.pos += 1;
            Some(tok)
        } else {
            None
        }
    }

    fn parse_factor(&mut self) -> Result<i64, String> {
        match self.next_tok() {
            Some(Token::Num(n)) => Ok(n),
            Some(Token::LParen) => {
                let val = self.parse_expr()?;
                if let Some(Token::RParen) = self.next_tok() {
                    Ok(val)
                } else {
                    Err("Expected ')'".into())
                }
            }
            _ => Err("Expected number or '('".into()),
        }
    }

    fn parse_term(&mut self) -> Result<i64, String> {
        let mut left = self.parse_factor()?;
        while let Some(tok) = self.peek() {
            match tok {
                Token::Mul => {
                    self.next_tok();
                    let right = self.parse_factor()?;
                    left *= right;
                }
                Token::Div => {
                    self.next_tok();
                    let right = self.parse_factor()?;
                    if right == 0 {
                        return Err("Division by zero".into());
                    }
                    left /= right;
                }
                _ => break,
            }
        }
        Ok(left)
    }

    fn parse_expr(&mut self) -> Result<i64, String> {
        let mut left = self.parse_term()?;
        while let Some(tok) = self.peek() {
            match tok {
                Token::Plus => {
                    self.next_tok();
                    let right = self.parse_term()?;
                    left += right;
                }
                Token::Minus => {
                    self.next_tok();
                    let right = self.parse_term()?;
                    left -= right;
                }
                _ => break,
            }
        }
        Ok(left)
    }
}

fn evaluate(input: &str) -> Result<i64, String> {
    let tokens = tokenize(input)?;
    let mut parser = Parser::new(tokens);
    parser.parse_expr()
}

fn main() {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {
        if let Ok(l) = line {
            let trimmed = l.trim();
            if trimmed.is_empty() { continue; }
            match evaluate(trimmed) {
                Ok(val) => println!("{}", val),
                Err(e) => println!("error: {}", e),
            }
        }
    }
}
