// 07-threadpool (starter)
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
