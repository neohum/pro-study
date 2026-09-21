// 04-vector-db (solution)
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
