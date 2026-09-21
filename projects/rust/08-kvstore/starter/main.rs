// 08-kvstore (starter)
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
