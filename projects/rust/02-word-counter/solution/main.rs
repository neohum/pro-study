// 02-word-counter (solution)
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
