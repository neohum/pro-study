# 03-markdown-parser (starter)
import sys
import re

# TODO(step-1): 인라인 태그 변환 (볼드, 이탤릭)
def parse_inline(text: str) -> str:
    return text

# TODO(step-2): 제목(#, ##, ###) 변환
def parse_header(line: str) -> str:
    return line

# TODO(step-3): 순서 없는 리스트(* ) 처리
def parse_list_item(line: str) -> str:
    return line

# TODO(step-4): 단락(<p>) 묶기
def parse_blocks(lines: list[str]) -> list[str]:
    return []

# TODO(step-5): 전체 문서 파싱 파이프라인
def main():
    pass

if __name__ == "__main__":
    main()
