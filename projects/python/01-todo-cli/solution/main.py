# 01-todo-cli — JSON 저장 TODO CLI (solution)
import sys

class TodoItem:
    def __init__(self, id_num: int, title: str, completed: bool = False):
        self.id = id_num
        self.title = title
        self.completed = completed

def add_item(items: list, title: str) -> TodoItem:
    item = TodoItem(len(items) + 1, title)
    items.append(item)
    return item

def complete_item(items: list, id_num: int):
    if 1 <= id_num <= len(items):
        items[id_num - 1].completed = True
        return items[id_num - 1]
    return None

def format_list(items: list) -> str:
    lines = []
    for item in items:
        mark = "x" if item.completed else " "
        lines.append(f"{item.id}. [{mark}] {item.title}")
    return "\n".join(lines)

def main():
    items = []
    for raw in sys.stdin:
        line = raw.strip()
        if not line:
            continue
        parts = line.split(" ", 1)
        cmd = parts[0]
        arg = parts[1] if len(parts) > 1 else ""
        if cmd == "add" and arg:
            item = add_item(items, arg)
            print(f"Added: {item.title}")
        elif cmd == "done" and arg:
            try:
                num = int(arg)
                item = complete_item(items, num)
                if item:
                    print(f"Done: {item.title}")
            except ValueError:
                pass
        elif cmd == "list":
            out = format_list(items)
            if out:
                print(out)

if __name__ == "__main__":
    main()
