# 01-todo-cli — JSON 저장 TODO CLI (starter)
#
# 표준 입력에서 한 줄씩 명령을 읽어 할 일 목록을 관리한다.
#   add <할일>  -> Added: <할일>
#   done <번호> -> Done: <할일>
#   list        -> 목록 출력 (1-based index)
import sys
import json

# TODO(step-1): 데이터 모델 정의
# id(int), title(str), completed(bool) 필드를 갖는 자료구조를 정의한다.
class TodoItem:
    def __init__(self, id_num: int, title: str, completed: bool = False):
        self.id = id_num
        self.title = title
        self.completed = completed

# TODO(step-2): 할 일 추가 (add)
def add_item(items: list, title: str) -> TodoItem:
    item = TodoItem(len(items) + 1, title)
    items.append(item)
    return item

# TODO(step-3): 할 일 완료 (done)
def complete_item(items: list, id_num: int) -> TodoItem:
    if 1 <= id_num <= len(items):
        items[id_num - 1].completed = True
        return items[id_num - 1]
    return None

# TODO(step-4): 목록 포맷팅 (list)
def format_list(items: list) -> str:
    lines = []
    for item in items:
        mark = "x" if item.completed else " "
        lines.append(f"{item.id}. [{mark}] {item.title}")
    return "\n".join(lines)

# TODO(step-5): REPL 명령 처리 루프
def main():
    items = []
    for raw in sys.stdin:
        line = raw.strip()
        if not line:
            continue
        # 명령 파싱 및 수행
        pass

if __name__ == "__main__":
    main()
