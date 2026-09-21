// 02-word-counter (starter)
#![allow(unused_variables, dead_code, unused_mut, unused_imports)]
use std::collections::HashMap;
use std::io::{self, Read};

// TODO(step-1): 단어 정제 함수 sanitize_word
fn sanitize(word: &str) -> String {
    word.to_lowercase()
}

// TODO(step-2): 빈도 카운팅 update_counts
fn update_counts(text: &str, map: &mut HashMap<String, usize>) {}

// TODO(step-3): 상위 N개 단어 추출 및 정렬
fn top_words(map: &HashMap<String, usize>) -> Vec<(String, usize)> {
    Vec::new()
}

// TODO(step-4): 전체 통계 출력
fn print_stats(total_lines: usize, total_words: usize, top: &[(String, usize)]) {}

// TODO(step-5): 메인 스트림 처리
fn main() {
    let mut content = String::new();
    io::stdin().read_to_string(&mut content).unwrap();
}
