// 09-byte-vm (solution)
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
