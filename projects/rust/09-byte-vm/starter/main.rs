// 09-byte-vm (starter)
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
