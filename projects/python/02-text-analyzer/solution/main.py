# 02-text-analyzer — 텍스트 통계 및 단어 빈도 분석기 (solution)
import sys
import re
from collections import Counter

def tokenize(text: str) -> list[str]:
    return re.findall(r'[a-zA-Z0-9]+', text.lower())

def count_stats(lines: list[str]) -> tuple[int, int, list[str]]:
    all_words = []
    for line in lines:
        all_words.extend(tokenize(line))
    return len(lines), len(all_words), all_words

def top_words(words: list[str]) -> list[tuple[str, int]]:
    counter = Counter(words)
    # 정렬: 빈도 내림차순, 단어 오름차순
    items = sorted(counter.items(), key=lambda x: (-x[1], x[0]))
    return items

def format_output(lines_count: int, words_count: int, freqs: list[tuple[str, int]]) -> str:
    res = [f"lines: {lines_count}", f"words: {words_count}"]
    for word, cnt in freqs:
        res.append(f"{word}: {cnt}")
    return "\n".join(res)

def main():
    content = sys.stdin.read()
    if not content:
        return
    raw_lines = content.rstrip("\r\n").split("\n")
    lines_count, words_count, words = count_stats(raw_lines)
    freqs = top_words(words)
    print(format_output(lines_count, words_count, freqs))

if __name__ == "__main__":
    main()
