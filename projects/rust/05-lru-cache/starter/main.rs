// 05-lru-cache (starter)
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
