# 02-text-analyzer — 텍스트 통계 및 단어 빈도 분석기 (starter)
import sys
import re
from collections import Counter

# TODO(step-1): 단어 토큰화
def tokenize(text: str) -> list[str]:
    return re.findall(r'[a-zA-Z0-9]+', text.lower())

# TODO(step-2): 줄 및 단어 개수 집계
def count_stats(lines: list[str]) -> tuple[int, int]:
    return len(lines), 0

# TODO(step-3): 빈도수 상위 단어 정렬
def top_words(words: list[str]) -> list[tuple[str, int]]:
    counter = Counter(words)
    return counter.most_common()

# TODO(step-4): 출력 형식 포맷팅
def format_output(lines_count: int, words_count: int, freqs: list[tuple[str, int]]) -> str:
    return ""

# TODO(step-5): 메인 스트림 루프
def main():
    lines = sys.stdin.readlines()
    # 통계 처리
    pass

if __name__ == "__main__":
    main()
