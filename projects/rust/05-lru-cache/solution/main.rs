// 05-lru-cache (solution)
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
