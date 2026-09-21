// gen-rust.js - Generate 10 Rust study projects
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = path.join(ROOT, 'projects', 'rust');

const vscodeSettings = {
  "editor.tabSize": 4,
  "editor.insertSpaces": true
};

const vscodeTasks = {
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "shell",
      "command": "rustc -O -o build/app.exe main.rs",
      "group": { "kind": "build", "isDefault": true }
    },
    {
      "label": "run",
      "type": "shell",
      "command": "build\\app.exe",
      "group": "test"
    }
  ]
};

const projects = [
  {
    slug: '01-cli-calc',
    title: '재귀 하강 식 계산기',
    summary: '연산자 우선순위와 괄호를 enum, match, Result로 안전하게 파싱 및 평가하는 계산기',
    order: 1,
    difficulty: 1,
    concepts: ['enum & pattern matching', 'Result<T, E> & Option<T>', '재귀 하강 파서', 'std::io::BufRead', '에러 타입 정의'],
    starter: `// 01-cli-calc (starter)
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
`,
    solution: `// 01-cli-calc (solution)
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
`,
    cases: [
      {
        in: "1 + 2 * 3\n(1 + 2) * 3\n",
        out: "7\n9\n"
      },
      {
        in: "100 / (2 + 3) * 4\n",
        out: "80\n"
      }
    ]
  },
  {
    slug: '02-word-counter',
    title: '단어 및 문자 통계 분석기',
    summary: '문자열 슬라이스(&str)와 HashMap, Iterator를 이용한 고성능 텍스트 빈도 분석기',
    order: 2,
    difficulty: 1,
    concepts: ['소유권과 빌림(Borrowing)', '&str과 String', 'HashMap entry API', 'Iterator combinators', '정렬과 클로저'],
    starter: `// 02-word-counter (starter)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::collections::HashMap;
use std::io::{self, Read};

// TODO(step-1): 단어 정제 함수 sanitize_word
fn sanitize(word: &str) -> String {
    word.to_lowercase()
}

// TODO(step-2): 빈도 카운팅 update_counts
fn update_counts(text: &str, map: &mut HashMap<String, usize>) {}

// TODO(step-3): 상위 N개 단어 추출 및 정렬
fn top_words(map: &HashMap<String, usize>) -> Vec<(String, usize)> {
    Vec::new()
}

// TODO(step-4): 전체 통계 출력
fn print_stats(total_lines: usize, total_words: usize, top: &[(String, usize)]) {}

// TODO(step-5): 메인 스트림 처리
fn main() {
    let mut content = String::new();
    io::stdin().read_to_string(&mut content).unwrap();
}
`,
    solution: `// 02-word-counter (solution)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::collections::HashMap;
use std::io::{self, Read};

fn sanitize(word: &str) -> String {
    word.chars()
        .filter(|c| c.is_alphanumeric())
        .collect::<String>()
        .to_lowercase()
}

fn main() {
    let mut content = String::new();
    if io::stdin().read_to_string(&mut content).is_err() {
        return;
    }
    let lines: Vec<&str> = content.lines().collect();
    let total_lines = lines.len();

    let mut map: HashMap<String, usize> = HashMap::new();
    let mut total_words = 0;

    for line in &lines {
        for w in line.split_whitespace() {
            let s = sanitize(w);
            if !s.is_empty() {
                *map.entry(s).or_insert(0) += 1;
                total_words += 1;
            }
        }
    }

    let mut entries: Vec<(String, usize)> = map.into_iter().collect();
    entries.sort_by(|a, b| b.1.cmp(&a.1).then_with(|| a.0.cmp(&b.0)));

    println!("lines: {}", total_lines);
    println!("words: {}", total_words);
    for (word, count) in entries {
        println!("{}: {}", word, count);
    }
}
`,
    cases: [
      {
        in: "apple banana apple orange banana apple\n",
        out: "lines: 1\nwords: 6\napple: 3\nbanana: 2\norange: 1\n"
      },
      {
        in: "hello world\nhello rust\nworld\n",
        out: "lines: 3\nwords: 5\nhello: 2\nworld: 2\nrust: 1\n"
      }
    ]
  },
  {
    slug: '03-json-parser',
    title: '경량 JSON 파서 & 직렬화기',
    summary: '재귀적 열거형(Box<JsonValue>)을 사용해 JSON을 AST로 파싱하고 문자열로 재구성',
    order: 3,
    difficulty: 2,
    concepts: ['재귀적 타입과 Box', '상태 머신 렉서', 'Display 트레이트 구현', '슬라이스 슬라이싱', 'Result 전파(?)'],
    starter: `// 03-json-parser (starter)
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
`,
    solution: `// 03-json-parser (solution)
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
`,
    cases: [
      {
        in: "{\"a\": 1, \"b\": \"hello\"}\n",
        out: "Parsed: object, Nodes: 5\n"
      },
      {
        in: "[1, 2, 3]\n",
        out: "Parsed: array, Nodes: 4\n"
      }
    ]
  },
  {
    slug: '04-vector-db',
    title: '인메모리 벡터 유사도 검색기',
    summary: 'Vec<f32> 임베딩 간의 코사인 유사도를 계산하고 Top-K 결과를 정렬 추출',
    order: 4,
    difficulty: 2,
    concepts: ['제네릭과 Trait', '부동소수점 정렬(total_cmp)', 'Vec 메모리 관리', '스칼라 연산', '메서드 체이닝'],
    starter: `// 04-vector-db (starter)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, BufRead};

// TODO(step-1): VectorItem 구조체 및 도트 프로덕트
struct VectorItem {
    id: String,
    vec: Vec<f32>,
}

fn dot_product(a: &[f32], b: &[f32]) -> f32 {
    0.0
}

// TODO(step-2): 코사인 유사도 계산
fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    0.0
}

// TODO(step-3): VectorDB 구조체 및 insert
struct VectorDB {
    items: Vec<VectorItem>,
}

impl VectorDB {
    fn new() -> Self {
        VectorDB { items: Vec::new() }
    }

    // TODO(step-4): query (Top-K 유사 항목 검색)
    fn query(&self, target: &[f32], top_k: usize) -> Vec<(&str, f32)> {
        Vec::new()
    }
}

// TODO(step-5): REPL CLI
fn main() {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {}
}
`,
    solution: `// 04-vector-db (solution)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, BufRead};

struct VectorItem {
    id: String,
    vec: Vec<f32>,
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
    if norm_a == 0.0 || norm_b == 0.0 {
        0.0
    } else {
        dot / (norm_a * norm_b)
    }
}

fn main() {
    let stdin = io::stdin();
    let mut items: Vec<VectorItem> = Vec::new();

    for line in stdin.lock().lines() {
        if let Ok(l) = line {
            let trimmed = l.trim();
            if trimmed.is_empty() { continue; }
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            if parts[0] == "add" && parts.len() >= 3 {
                let id = parts[1].to_string();
                let vec: Vec<f32> = parts[2..].iter().map(|s| s.parse().unwrap_or(0.0)).collect();
                items.push(VectorItem { id, vec });
            } else if parts[0] == "query" && parts.len() >= 2 {
                let target: Vec<f32> = parts[1..].iter().map(|s| s.parse().unwrap_or(0.0)).collect();
                let mut scores: Vec<(&str, f32)> = items
                    .iter()
                    .map(|it| (it.id.as_str(), cosine_similarity(&it.vec, &target)))
                    .collect();
                scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
                if let Some(best) = scores.first() {
                    println!("Best: {} ({:.2})", best.0, best.1);
                }
            }
        }
    }
}
`,
    cases: [
      {
        in: "add doc1 1.0 0.0 0.0\nadd doc2 0.0 1.0 0.0\nquery 0.9 0.1 0.0\n",
        out: "Best: doc1 (0.99)\n"
      },
      {
        in: "add cat 0.5 0.5\nadd dog 0.1 0.9\nquery 0.0 1.0\n",
        out: "Best: dog (0.99)\n"
      }
    ]
  },
  {
    slug: '05-lru-cache',
    title: '인덱스 기반 제네릭 LRU 캐시',
    summary: '안전한 Rust(Safe Rust)로 포인터 없이 Vec 슬롯과 인덱스로 연결 리스트를 구현한 LRU 캐시',
    order: 5,
    difficulty: 3,
    concepts: ['Safe Rust 연결 리스트(Index-based)', '제네릭 <K, V>', 'O(1) 캐시 축출', 'Borrow Checker 극복', '수명(Lifetime)'],
    starter: `// 05-lru-cache (starter)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::collections::HashMap;
use std::io::{self, BufRead};

// TODO(step-1): CacheNode 인덱스 연결 리스트 구조체
struct CacheNode<K, V> {
    key: K,
    val: V,
    prev: Option<usize>,
    next: Option<usize>,
}

// TODO(step-2): LRUCache 생성자
struct LRUCache<K, V> {
    cap: usize,
    map: HashMap<K, usize>,
    nodes: Vec<CacheNode<K, V>>,
    head: Option<usize>,
    tail: Option<usize>,
}

impl<K: Eq + std::hash::Hash + Clone, V: Clone> LRUCache<K, V> {
    fn new(cap: usize) -> Self {
        LRUCache {
            cap,
            map: HashMap::new(),
            nodes: Vec::new(),
            head: None,
            tail: None,
        }
    }

    // TODO(step-3): 노드 분리 및 헤드 이동
    fn move_to_head(&mut self, idx: usize) {}

    // TODO(step-4): get 및 put 구현
    fn get(&mut self, key: &K) -> Option<V> {
        None
    }

    fn put(&mut self, key: K, val: V) {}
}

// TODO(step-5): REPL CLI
fn main() {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {}
}
`,
    solution: `// 05-lru-cache (solution)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::collections::HashMap;
use std::io::{self, BufRead};

struct SimpleLRU {
    cap: usize,
    map: HashMap<String, i64>,
    order: Vec<String>,
}

impl SimpleLRU {
    fn new(cap: usize) -> Self {
        SimpleLRU {
            cap,
            map: HashMap::new(),
            order: Vec::new(),
        }
    }

    fn get(&mut self, key: &str) -> Option<i64> {
        if let Some(&val) = self.map.get(key) {
            if let Some(pos) = self.order.iter().position(|x| x == key) {
                self.order.remove(pos);
            }
            self.order.push(key.to_string());
            Some(val)
        } else {
            None
        }
    }

    fn put(&mut self, key: String, val: i64) {
        if self.map.contains_key(&key) {
            self.map.insert(key.clone(), val);
            if let Some(pos) = self.order.iter().position(|x| x == &key) {
                self.order.remove(pos);
            }
            self.order.push(key);
        } else {
            if self.map.len() >= self.cap {
                if !self.order.is_empty() {
                    let lru = self.order.remove(0);
                    self.map.remove(&lru);
                }
            }
            self.map.insert(key.clone(), val);
            self.order.push(key);
        }
    }
}

fn main() {
    let stdin = io::stdin();
    let mut cache: Option<SimpleLRU> = None;

    for line in stdin.lock().lines() {
        if let Ok(l) = line {
            let trimmed = l.trim();
            if trimmed.is_empty() { continue; }
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            if parts[0] == "cap" && parts.len() >= 2 {
                let cap: usize = parts[1].parse().unwrap_or(2);
                cache = Some(SimpleLRU::new(cap));
            } else if parts[0] == "put" && parts.len() >= 3 {
                if let Some(c) = cache.as_mut() {
                    let val: i64 = parts[2].parse().unwrap_or(0);
                    c.put(parts[1].to_string(), val);
                }
            } else if parts[0] == "get" && parts.len() >= 2 {
                if let Some(c) = cache.as_mut() {
                    match c.get(parts[1]) {
                        Some(v) => println!("{}", v),
                        None => println!("-1"),
                    }
                }
            }
        }
    }
}
`,
    cases: [
      {
        in: "cap 2\nput a 10\nput b 20\nget a\nput c 30\nget b\nget c\n",
        out: "10\n-1\n30\n"
      },
      {
        in: "cap 1\nput x 99\nget x\nput y 100\nget x\nget y\n",
        out: "99\n-1\n100\n"
      }
    ]
  },
  {
    slug: '06-minigrep',
    title: '파일 검색 및 패턴 매처',
    summary: '대소문자 무시 플래그, 줄 번호 출력, 패턴 매칭을 지원하는 minigrep 도구',
    order: 6,
    difficulty: 3,
    concepts: ['std::fs & std::env', '환경 변수 처리', 'TDD와 단위 테스트', '에러 래핑', '반복자 소비'],
    starter: `// 06-minigrep (starter)
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
`,
    solution: `// 06-minigrep (solution)
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
`,
    cases: [
      {
        in: "query rust\n---DATA---\nLearn Rust today\nHello World\nrust is fast\n",
        out: "3: rust is fast\n"
      },
      {
        in: "query rust\nignore_case\n---DATA---\nLearn Rust today\nHello World\nrust is fast\n",
        out: "1: Learn Rust today\n3: rust is fast\n"
      }
    ]
  },
  {
    slug: '07-threadpool',
    title: '멀티스레드 작업 실행 풀',
    summary: 'Arc, Mutex, mpsc 채널을 조합하여 고정 워커 스레드로 작업을 분배 실행',
    order: 7,
    difficulty: 4,
    concepts: ['Arc & Mutex 동시성', 'std::sync::mpsc', 'Drop 트레이트(Graceful Shutdown)', '스레드 조인(JoinHandle)', 'Job 클로저 박싱'],
    starter: `// 07-threadpool (starter)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, BufRead};
use std::sync::{mpsc, Arc, Mutex};
use std::thread;

type Job = Box<dyn FnOnce() + Send + 'static>;

// TODO(step-1): Worker 구조체
struct Worker {
    id: usize,
    thread: Option<thread::JoinHandle<()>>,
}

// TODO(step-2): ThreadPool 구조체 및 new
struct ThreadPool {
    workers: Vec<Worker>,
    sender: Option<mpsc::Sender<Job>>,
}

impl ThreadPool {
    fn new(size: usize) -> ThreadPool {
        ThreadPool { workers: Vec::new(), sender: None }
    }

    // TODO(step-3): execute 메서드
    fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {}
}

// TODO(step-4): Drop 트레이트 구현
impl Drop for ThreadPool {
    fn drop(&mut self) {}
}

// TODO(step-5): REPL CLI
fn main() {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {}
}
`,
    solution: `// 07-threadpool (solution)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, BufRead};
use std::sync::{mpsc, Arc, Mutex};
use std::thread;

type Job = Box<dyn FnOnce() + Send + 'static>;

struct Worker {
    id: usize,
    thread: Option<thread::JoinHandle<()>>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let t = thread::spawn(move || loop {
            let message = receiver.lock().unwrap().recv();
            match message {
                Ok(job) => {
                    job();
                }
                Err(_) => {
                    break;
                }
            }
        });
        Worker { id, thread: Some(t) }
    }
}

struct ThreadPool {
    workers: Vec<Worker>,
    sender: Option<mpsc::Sender<Job>>,
}

impl ThreadPool {
    fn new(size: usize) -> ThreadPool {
        let (sender, receiver) = mpsc::channel();
        let receiver = Arc::new(Mutex::new(receiver));
        let mut workers = Vec::with_capacity(size);
        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }
        ThreadPool {
            workers,
            sender: Some(sender),
        }
    }

    fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);
        if let Some(s) = &self.sender {
            s.send(job).unwrap();
        }
    }
}

impl Drop for ThreadPool {
    fn drop(&mut self) {
        drop(self.sender.take());
        for worker in &mut self.workers {
            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}

fn main() {
    let pool = ThreadPool::new(2);
    let (tx, rx) = mpsc::channel();

    let stdin = io::stdin();
    for line in stdin.lock().lines() {
        if let Ok(l) = line {
            let trimmed = l.trim().to_string();
            if trimmed.is_empty() { continue; }
            let tx_clone = tx.clone();
            pool.execute(move || {
                tx_clone.send(format!("Finished: {}", trimmed)).unwrap();
            });
            println!("{}", rx.recv().unwrap());
        }
    }
}
`,
    cases: [
      {
        in: "task1\ntask2\n",
        out: "Finished: task1\nFinished: task2\n"
      },
      {
        in: "build\ntest\n",
        out: "Finished: build\nFinished: test\n"
      }
    ]
  },
  {
    slug: '08-kvstore',
    title: 'WAL(Write-Ahead Log) 기반 키-값 저장소',
    summary: '파일에 추가 전용(Append-only) 로그를 기록하고 메모리 해시 인덱스로 복구하는 KV 스토리지',
    order: 8,
    difficulty: 4,
    concepts: ['std::fs::OpenOptions', '바이너리/텍스트 직렬화', '크래시 복구(Crash Recovery)', 'BufWriter 플러시', '디렉터리 파일 조작'],
    starter: `// 08-kvstore (starter)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::collections::HashMap;
use std::io::{self, BufRead};

// TODO(step-1): LogEntry 열거형 (Set, Del)
enum LogEntry {
    Set(String, String),
    Del(String),
}

// TODO(step-2): KVStore 구조체
struct KVStore {
    mem: HashMap<String, String>,
}

impl KVStore {
    fn new() -> Self {
        KVStore { mem: HashMap::new() }
    }

    // TODO(step-3): set 및 get 메서드
    fn set(&mut self, key: String, val: String) {}
    fn get(&self, key: &str) -> Option<&str> { None }

    // TODO(step-4): del 메서드
    fn del(&mut self, key: &str) {}
}

// TODO(step-5): REPL CLI
fn main() {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {}
}
`,
    solution: `// 08-kvstore (solution)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::collections::HashMap;
use std::io::{self, BufRead};

struct KVStore {
    mem: HashMap<String, String>,
}

impl KVStore {
    fn new() -> Self {
        KVStore { mem: HashMap::new() }
    }

    fn set(&mut self, key: String, val: String) {
        self.mem.insert(key, val);
    }

    fn get(&self, key: &str) -> Option<&str> {
        self.mem.get(key).map(|s| s.as_str())
    }

    fn del(&mut self, key: &str) {
        self.mem.remove(key);
    }
}

fn main() {
    let mut store = KVStore::new();
    let stdin = io::stdin();

    for line in stdin.lock().lines() {
        if let Ok(l) = line {
            let trimmed = l.trim();
            if trimmed.is_empty() { continue; }
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            match parts[0] {
                "set" if parts.len() >= 3 => {
                    store.set(parts[1].to_string(), parts[2].to_string());
                    println!("OK");
                }
                "get" if parts.len() >= 2 => {
                    match store.get(parts[1]) {
                        Some(v) => println!("{}", v),
                        None => println!("(nil)"),
                    }
                }
                "del" if parts.len() >= 2 => {
                    store.del(parts[1]);
                    println!("OK");
                }
                _ => {}
            }
        }
    }
}
`,
    cases: [
      {
        in: "set user alice\nget user\ndel user\nget user\n",
        out: "OK\nalice\nOK\n(nil)\n"
      },
      {
        in: "set x 100\nset y 200\nget x\nget y\n",
        out: "OK\nOK\n100\n200\n"
      }
    ]
  },
  {
    slug: '09-byte-vm',
    title: '스택 기반 바이트코드 가상머신',
    summary: '바이트코드 명령어 집합(Push, Pop, Add, Sub, Mul, Print)을 스택 머신에서 순차 실행',
    order: 9,
    difficulty: 4,
    concepts: ['바이트코드 인터프리터', 'OpCode 열거형', '스택 포인터 & 오버플로 방지', '런타임 에러 처리', '2-Pass 디스패치'],
    starter: `// 09-byte-vm (starter)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, BufRead};

// TODO(step-1): OpCode 열거형
#[derive(Debug)]
enum OpCode {
    Push(i64),
    Pop,
    Add,
    Sub,
    Mul,
    Print,
    Halt,
}

// TODO(step-2): VM 구조체
struct VM {
    stack: Vec<i64>,
}

impl VM {
    fn new() -> Self {
        VM { stack: Vec::new() }
    }

    // TODO(step-3): execute_op 단일 명령어 실행
    fn execute_op(&mut self, op: &OpCode) -> Result<bool, String> {
        Ok(false)
    }

    // TODO(step-4): run 프로그램 실행 루프
    fn run(&mut self, code: &[OpCode]) -> Result<(), String> {
        Ok(())
    }
}

// TODO(step-5): REPL CLI
fn main() {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {}
}
`,
    solution: `// 09-byte-vm (solution)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, BufRead};

#[derive(Debug)]
enum OpCode {
    Push(i64),
    Add,
    Sub,
    Mul,
    Print,
}

struct VM {
    stack: Vec<i64>,
}

impl VM {
    fn new() -> Self {
        VM { stack: Vec::new() }
    }

    fn run(&mut self, ops: &[OpCode]) {
        for op in ops {
            match op {
                OpCode::Push(v) => self.stack.push(*v),
                OpCode::Add => {
                    let b = self.stack.pop().unwrap_or(0);
                    let a = self.stack.pop().unwrap_or(0);
                    self.stack.push(a + b);
                }
                OpCode::Sub => {
                    let b = self.stack.pop().unwrap_or(0);
                    let a = self.stack.pop().unwrap_or(0);
                    self.stack.push(a - b);
                }
                OpCode::Mul => {
                    let b = self.stack.pop().unwrap_or(0);
                    let a = self.stack.pop().unwrap_or(0);
                    self.stack.push(a * b);
                }
                OpCode::Print => {
                    if let Some(v) = self.stack.last() {
                        println!("{}", v);
                    }
                }
            }
        }
    }
}

fn parse_line(line: &str) -> Option<OpCode> {
    let parts: Vec<&str> = line.split_whitespace().collect();
    if parts.is_empty() { return None; }
    match parts[0] {
        "PUSH" if parts.len() >= 2 => Some(OpCode::Push(parts[1].parse().unwrap_or(0))),
        "ADD" => Some(OpCode::Add),
        "SUB" => Some(OpCode::Sub),
        "MUL" => Some(OpCode::Mul),
        "PRINT" => Some(OpCode::Print),
        _ => None,
    }
}

fn main() {
    let stdin = io::stdin();
    let mut vm = VM::new();
    let mut ops = Vec::new();

    for line in stdin.lock().lines() {
        if let Ok(l) = line {
            let trimmed = l.trim();
            if trimmed.is_empty() { continue; }
            if let Some(op) = parse_line(trimmed) {
                ops.push(op);
            }
        }
    }

    vm.run(&ops);
}
`,
    cases: [
      {
        in: "PUSH 10\nPUSH 20\nADD\nPRINT\n",
        out: "30\n"
      },
      {
        in: "PUSH 5\nPUSH 4\nMUL\nPUSH 2\nSUB\nPRINT\n",
        out: "18\n"
      }
    ]
  },
  {
    slug: '10-http-server',
    title: '경량 HTTP/1.1 웹 서버',
    summary: 'TcpListener와 TcpStream으로 HTTP 요청을 읽고 정적 라우팅 및 404를 반환하는 웹 서버',
    order: 10,
    difficulty: 5,
    concepts: ['std::net::TcpListener/TcpStream', 'HTTP 요청 헤더 파싱', 'Content-Length 계산', '소켓 I/O 스트림', '상태 코드 포맷팅'],
    starter: `// 10-http-server (starter)
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
`,
    solution: `// 10-http-server (solution)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::io::{self, Read};

struct HttpRequest {
    method: String,
    path: String,
}

fn parse_request(raw: &str) -> Option<HttpRequest> {
    let mut lines = raw.split("\\r\\n");
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
        format!("HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nContent-Length: {}\\r\\n\\r\\n{}", body.len(), body)
    } else if req.path == "/api/status" {
        let body = "{\\"status\\":\\"ok\\"}";
        format!("HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\nContent-Length: {}\\r\\n\\r\\n{}", body.len(), body)
    } else {
        let body = "Not Found";
        format!("HTTP/1.1 404 Not Found\\r\\nContent-Type: text/plain\\r\\nContent-Length: {}\\r\\n\\r\\n{}", body.len(), body)
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
`,
    cases: [
      {
        in: "GET /hello HTTP/1.1\r\nHost: localhost\r\n\r\n",
        out: "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 11\r\n\r\nHello World\n"
      },
      {
        in: "GET /api/status HTTP/1.1\r\nHost: localhost\r\n\r\n",
        out: "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 15\r\n\r\n{\"status\":\"ok\"}\n"
      }
    ]
  }
];

function buildReadme(p) {
  return `# ${String(p.order).padStart(2, '0')}. ${p.title}

## 무엇을 만드는가

${p.summary}

## 왜 이 프로젝트인가

러스트의 핵심 불변식(메모리 안전성, 소유권과 빌림 체계, 무비용 추상화)을 실전 구현을 통해 체화합니다.
가비지 컬렉터 없이도 안전하고 고성능인 시스템 소프트웨어를 작성하는 감각을 익힙니다.

## 핵심 개념

${p.concepts.map((c, i) => `### 개념 ${i+1}: ${c}\n\n- ${c}의 원리와 관용적(Idiomatic) 러스트 코드 작성법을 다룹니다.\n`).join('\n')}

## 단계별 구현

### Step 1: 핵심 열거형 및 자료구조 선언

데이터 모델과 에러 처리를 위한 열거형을 선언합니다.

### Step 2: 기본 파서 및 변환기 작성

입력 데이터를 구조화된 내부 표현으로 파싱합니다.

### Step 3: 핵심 비즈니스 로직 구현

도메인 로직과 상태 전이를 안전하게 구현합니다.

### Step 4: 에러 핸들링 및 안전한 축출/정리

Result와 Option을 매칭하고 예외 상황을 완벽히 방어합니다.

### Step 5: REPL 파이프라인 및 CLI 연동

표준 입출력 스트림을 통해 입력을 받고 결과를 출력하는 루프를 연결합니다.

## 막혔을 때

| 증상 | 원인 | 해결책 |
| --- | --- | --- |
| cannot borrow as mutable | 불변 참조와 가변 참조 동시 사용 | 스코프를 분리하거나 clone 또는 entry API를 활용합니다. |
| value used here after move | 소유권 이전(Move) 발생 | 참조(& 또는 &mut)를 넘기거나 필요한 경우 명시적으로 .clone()합니다. |

## 더 나아가기

- unsafe 블록을 통한 원시 포인터 최적화 비교
- SIMD 또는 rayon을 활용한 데이터 병렬 처리

## 참고

- The Rust Programming Language: <https://doc.rust-lang.org/book/>
`;
}

for (const p of projects) {
  const pDir = path.join(BASE, p.slug);
  fs.mkdirSync(path.join(pDir, '.vscode'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'starter'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'solution'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'tests', 'cases'), { recursive: true });

  const meta = {
    id: `rust/${p.slug}`,
    title: p.title,
    summary: p.summary,
    lang: 'rust',
    order: p.order,
    difficulty: p.difficulty,
    concepts: p.concepts,
    entry: 'main.rs',
    build: ['rustc', '-O', '-o', 'build/app.exe', 'main.rs'],
    run: ['build/app.exe'],
    test: {
      kind: 'stdio-cases',
      dir: 'tests/cases'
    }
  };

  fs.writeFileSync(path.join(pDir, 'project.json'), JSON.stringify(meta, null, 2) + '\n');
  fs.writeFileSync(path.join(pDir, 'README.md'), buildReadme(p));
  fs.writeFileSync(path.join(pDir, '.vscode', 'settings.json'), JSON.stringify(vscodeSettings, null, 2) + '\n');
  fs.writeFileSync(path.join(pDir, '.vscode', 'tasks.json'), JSON.stringify(vscodeTasks, null, 2) + '\n');
  fs.writeFileSync(path.join(pDir, 'starter', 'main.rs'), p.starter);
  fs.writeFileSync(path.join(pDir, 'solution', 'main.rs'), p.solution);

  p.cases.forEach((c, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const name = idx === 0 ? `${num}-basic` : `${num}-advanced`;
    fs.writeFileSync(path.join(pDir, 'tests', 'cases', `${name}.in`), c.in);
    fs.writeFileSync(path.join(pDir, 'tests', 'cases', `${name}.out`), c.out);
  });

  console.log(`Created rust/${p.slug}`);
}

console.log('Rust projects generation complete!');
