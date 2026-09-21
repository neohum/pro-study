// 04-vector-db (starter)
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
