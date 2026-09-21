// 08-kvstore (solution)
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
