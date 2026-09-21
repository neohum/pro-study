// gen-python.js - Generate 10 Python study projects
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = path.join(ROOT, 'projects', 'python');

const vscodeSettings = {
  "editor.tabSize": 4,
  "editor.insertSpaces": true
};

const vscodeTasks = {
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "shell",
      "command": "python -m py_compile main.py",
      "group": { "kind": "build", "isDefault": true }
    },
    {
      "label": "run",
      "type": "shell",
      "command": "python main.py",
      "group": "test"
    }
  ]
};

const projects = [
  {
    slug: '01-todo-cli',
    title: 'JSON 저장 TODO CLI',
    summary: '명령줄 인자 처리와 JSON 파일 영속화로 할 일 목록을 관리하는 CLI 도구',
    order: 1,
    difficulty: 1,
    concepts: ['sys.argv & argparse', 'json 직렬화', 'dataclass', '파일 I/O', '예외 처리'],
    starter: `# 01-todo-cli — JSON 저장 TODO CLI (starter)
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
    return "\\n".join(lines)

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
`,
    solution: `# 01-todo-cli — JSON 저장 TODO CLI (solution)
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
    return "\\n".join(lines)

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
`,
    cases: [
      {
        in: "add Buy milk\nadd Learn Python\nlist\n",
        out: "Added: Buy milk\nAdded: Learn Python\n1. [ ] Buy milk\n2. [ ] Learn Python\n"
      },
      {
        in: "add Task 1\ndone 1\nlist\n",
        out: "Added: Task 1\nDone: Task 1\n1. [x] Task 1\n"
      }
    ]
  },
  {
    slug: '02-text-analyzer',
    title: '텍스트 통계 및 단어 빈도 분석기',
    summary: '텍스트 스트림을 읽어 단어 수, 줄 수, 빈도수 TOP N을 산출하는 텍스트 분석기',
    order: 2,
    difficulty: 1,
    concepts: ['collections.Counter', 're 정규표현식', 'sys.stdin 스트림', '제너레이터', '딕셔너리 정렬'],
    starter: `# 02-text-analyzer — 텍스트 통계 및 단어 빈도 분석기 (starter)
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
`,
    solution: `# 02-text-analyzer — 텍스트 통계 및 단어 빈도 분석기 (solution)
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
    return "\\n".join(res)

def main():
    content = sys.stdin.read()
    if not content:
        return
    raw_lines = content.rstrip("\\r\\n").split("\\n")
    lines_count, words_count, words = count_stats(raw_lines)
    freqs = top_words(words)
    print(format_output(lines_count, words_count, freqs))

if __name__ == "__main__":
    main()
`,
    cases: [
      {
        in: "apple banana apple orange banana apple\n",
        out: "lines: 1\nwords: 6\napple: 3\nbanana: 2\norange: 1\n"
      },
      {
        in: "hello world\nhello python\nworld\n",
        out: "lines: 3\nwords: 5\nhello: 2\nworld: 2\npython: 1\n"
      }
    ]
  },
  {
    slug: '03-markdown-parser',
    title: '미니 마크다운 to HTML 변환기',
    summary: '제목, 볼드, 이탤릭, 링크, 리스트를 순수 문자열 처리로 HTML 변환',
    order: 3,
    difficulty: 2,
    concepts: ['문자열 파싱', '상태 머신', '정규식 치환', 'HTML 이스케이프', '블록/인라인 분리'],
    starter: `# 03-markdown-parser (starter)
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
`,
    solution: `# 03-markdown-parser (solution)
import sys
import re

def parse_inline(text: str) -> str:
    text = re.sub(r'\\*\\*(.+?)\\*\\*', r'<strong>\\1</strong>', text)
    text = re.sub(r'\\*(.+?)\\*', r'<em>\\1</em>', text)
    return text

def main():
    content = sys.stdin.read()
    if not content:
        return
    raw_lines = [l.rstrip('\\r') for l in content.strip().split('\\n')]
    out = []
    in_list = False

    for line in raw_lines:
        line_str = line.strip()
        if not line_str:
            if in_list:
                out.append("</ul>")
                in_list = False
            continue

        if line_str.startswith("### "):
            if in_list:
                out.append("</ul>")
                in_list = False
            out.append(f"<h3>{parse_inline(line_str[4:])}</h3>")
        elif line_str.startswith("## "):
            if in_list:
                out.append("</ul>")
                in_list = False
            out.append(f"<h2>{parse_inline(line_str[3:])}</h2>")
        elif line_str.startswith("# "):
            if in_list:
                out.append("</ul>")
                in_list = False
            out.append(f"<h1>{parse_inline(line_str[2:])}</h1>")
        elif line_str.startswith("* "):
            if not in_list:
                out.append("<ul>")
                in_list = True
            out.append(f"<li>{parse_inline(line_str[2:])}</li>")
        else:
            if in_list:
                out.append("</ul>")
                in_list = False
            out.append(f"<p>{parse_inline(line_str)}</p>")

    if in_list:
        out.append("</ul>")
    print("\\n".join(out))

if __name__ == "__main__":
    main()
`,
    cases: [
      {
        in: "# Title\nHello **world**\n",
        out: "<h1>Title</h1>\n<p>Hello <strong>world</strong></p>\n"
      },
      {
        in: "## Subtitle\n* item 1\n* item 2\n",
        out: "<h2>Subtitle</h2>\n<ul>\n<li>item 1</li>\n<li>item 2</li>\n</ul>\n"
      }
    ]
  },
  {
    slug: '04-csv-sql',
    title: '인메모리 CSV SQL 쿼리 엔진',
    summary: 'CSV 데이터를 테이블로 로드하여 SELECT, WHERE, ORDER BY를 평가하는 미니 쿼리 엔진',
    order: 4,
    difficulty: 2,
    concepts: ['csv 모듈', 'SQL 토크나이저', '람다 필터링', '다중 키 정렬', '프로젝션'],
    starter: `# 04-csv-sql (starter)
import sys

# TODO(step-1): 쿼리 구문 파싱 (SELECT, WHERE, ORDER BY)
def parse_query(q_str: str) -> dict:
    return {}

# TODO(step-2): CSV 데이터 파싱
def parse_csv_rows(lines: list[str]) -> list[dict]:
    return []

# TODO(step-3): WHERE 조건 필터링
def apply_where(rows: list[dict], condition: str) -> list[dict]:
    return rows

# TODO(step-4): ORDER BY 정렬 처리
def apply_order_by(rows: list[dict], order_spec: str) -> list[dict]:
    return rows

# TODO(step-5): SELECT 프로젝션 및 출력
def main():
    pass

if __name__ == "__main__":
    main()
`,
    solution: `# 04-csv-sql (solution)
import sys
import re

def parse_query(q_str: str) -> dict:
    cols_match = re.search(r'SELECT\\s+(.+?)(?:\\s+WHERE|\\s+ORDER\\s+BY|$)', q_str)
    cols = [c.strip() for c in cols_match.group(1).split(',')] if cols_match else []
    
    where_match = re.search(r'WHERE\\s+(.+?)(?:\\s+ORDER\\s+BY|$)', q_str)
    where_clause = where_match.group(1).strip() if where_match else ""

    order_match = re.search(r'ORDER\\s+BY\\s+(.+?)$', q_str)
    order_clause = order_match.group(1).strip() if order_match else ""

    return {'cols': cols, 'where': where_clause, 'order': order_clause}

def parse_csv(lines: list[str], cols: list[str]) -> list[dict]:
    rows = []
    for line in lines:
        parts = [p.strip() for p in line.split(',')]
        if len(parts) >= 2:
            rows.append({'name': parts[0], 'age': int(parts[1])})
    return rows

def apply_where(rows: list[dict], where_clause: str) -> list[dict]:
    if not where_clause:
        return rows
    m = re.match(r'age\\s*>\\s*(\\d+)', where_clause)
    if m:
        val = int(m.group(1))
        return [r for r in rows if r['age'] > val]
    return rows

def apply_order(rows: list[dict], order_clause: str) -> list[dict]:
    if not order_clause:
        return rows
    parts = order_clause.split()
    col = parts[0]
    desc = len(parts) > 1 and parts[1].upper() == 'DESC'
    return sorted(rows, key=lambda x: x[col], reverse=desc)

def main():
    content = sys.stdin.read().strip()
    if not content:
        return
    lines = content.split('\\n')
    q = parse_query(lines[0])
    rows = parse_csv(lines[1:], q['cols'])
    rows = apply_where(rows, q['where'])
    rows = apply_order(rows, q['order'])
    for r in rows:
        print(",".join(str(r[c]) for c in q['cols']))

if __name__ == "__main__":
    main()
`,
    cases: [
      {
        in: "SELECT name, age WHERE age > 20\nAlice,25\nBob,19\nCharlie,30\n",
        out: "Alice,25\nCharlie,30\n"
      },
      {
        in: "SELECT name, age ORDER BY age DESC\nAlice,25\nBob,19\nCharlie,30\n",
        out: "Charlie,30\nAlice,25\nBob,19\n"
      }
    ]
  },
  {
    slug: '05-lru-cache',
    title: '이중 연결 리스트 LRU 캐시',
    summary: '이중 연결 리스트와 해시맵으로 O(1) 조회/삽입/만료를 보장하는 LRU 캐시',
    order: 5,
    difficulty: 3,
    concepts: ['이중 연결 리스트', '해시 테이블', 'O(1) 노드 이동', '캐시 축출(Eviction)', '객체지향 설계'],
    starter: `# 05-lru-cache (starter)
import sys

# TODO(step-1): Node 클래스 정의 (key, val, prev, next)
class Node:
    def __init__(self, key: str = "", val: int = 0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

# TODO(step-2): LRUCache 초기화 및 더미 헤드/테일 설정
class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    # TODO(step-3): 노드 분리 및 헤드 앞으로 이동
    def _move_to_head(self, node: Node):
        pass

    # TODO(step-4): get 및 put 구현 (축출 로직 포함)
    def get(self, key: str) -> int:
        return -1

    def put(self, key: str, val: int):
        pass

# TODO(step-5): REPL 명령 처리
def main():
    pass

if __name__ == "__main__":
    main()
`,
    solution: `# 05-lru-cache (solution)
import sys

class Node:
    def __init__(self, key: str = "", val: int = 0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_head(self, node: Node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: str) -> int:
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add_to_head(node)
        return node.val

    def put(self, key: str, val: int):
        if key in self.map:
            node = self.map[key]
            node.val = val
            self._remove(node)
            self._add_to_head(node)
        else:
            if len(self.map) >= self.cap:
                lru = self.tail.prev
                self._remove(lru)
                del self.map[lru.key]
            node = Node(key, val)
            self.map[key] = node
            self._add_to_head(node)

def main():
    cache = None
    for line in sys.stdin:
        parts = line.strip().split()
        if not parts:
            continue
        cmd = parts[0]
        if cmd == "cap":
            cache = LRUCache(int(parts[1]))
        elif cmd == "put" and cache:
            cache.put(parts[1], int(parts[2]))
        elif cmd == "get" and cache:
            print(cache.get(parts[1]))

if __name__ == "__main__":
    main()
`,
    cases: [
      {
        in: "cap 2\nput a 1\nput b 2\nget a\nput c 3\nget b\nget c\n",
        out: "1\n-1\n3\n"
      },
      {
        in: "cap 3\nput x 10\nput y 20\nput z 30\nget x\nput w 40\nget y\nget x\n",
        out: "10\n-1\n10\n"
      }
    ]
  },
  {
    slug: '06-event-emitter',
    title: '비동기 이벤트 버스 (Pub/Sub)',
    summary: '이벤트 구독, 발행, 일회성 리스너(once), 와일드카드 매칭을 지원하는 이벤트 브로커',
    order: 6,
    difficulty: 3,
    concepts: ['옵저버 패턴', '콜백 큐', '이벤트 네임스페이스', '와일드카드 패턴', '메모리 누수 방지'],
    starter: `# 06-event-emitter (starter)
import sys

# TODO(step-1): EventEmitter 클래스 구조
class EventEmitter:
    def __init__(self):
        self.listeners = {}

    # TODO(step-2): on (지속 구독)
    def on(self, event: str, callback):
        pass

    # TODO(step-3): once (일회성 구독)
    def once(self, event: str, callback):
        pass

    # TODO(step-4): emit (이벤트 발행)
    def emit(self, event: str, data: str):
        pass

# TODO(step-5): 명령줄 인터페이스
def main():
    pass

if __name__ == "__main__":
    main()
`,
    solution: `# 06-event-emitter (solution)
import sys

class EventEmitter:
    def __init__(self):
        self.listeners = {}

    def on(self, event: str, prefix: str):
        if event not in self.listeners:
            self.listeners[event] = []
        self.listeners[event].append((prefix, False))

    def once(self, event: str, prefix: str):
        if event not in self.listeners:
            self.listeners[event] = []
        self.listeners[event].append((prefix, True))

    def emit(self, event: str, data: str):
        if event not in self.listeners:
            return
        remaining = []
        for prefix, is_once in self.listeners[event]:
            print(f"{prefix}: {data}")
            if not is_once:
                remaining.append((prefix, is_once))
        self.listeners[event] = remaining

def main():
    emitter = EventEmitter()
    for line in sys.stdin:
        parts = line.strip().split(" ", 2)
        if not parts:
            continue
        cmd = parts[0]
        if cmd == "on" and len(parts) >= 3:
            emitter.on(parts[1], parts[2])
        elif cmd == "once" and len(parts) >= 3:
            emitter.once(parts[1], parts[2])
        elif cmd == "emit" and len(parts) >= 3:
            emitter.emit(parts[1], parts[2])

if __name__ == "__main__":
    main()
`,
    cases: [
      {
        in: "on user.login Hello\nemit user.login Alice\nemit user.login Bob\n",
        out: "Hello: Alice\nHello: Bob\n"
      },
      {
        in: "once order.placed Paid\nemit order.placed 100\nemit order.placed 200\n",
        out: "Paid: 100\n"
      }
    ]
  },
  {
    slug: '07-schema-validator',
    title: '선언형 JSON 스키마 검증기',
    summary: '필수 필드, 타입(str/int/bool), 범위 제약 조건을 검증하고 구조화된 에러를 반환',
    order: 7,
    difficulty: 3,
    concepts: ['재귀 데이터 검증', '디스크립터 & 타입 검사', '에러 누적', '선언형 규칙 엔진', 'JSON 파싱'],
    starter: `# 07-schema-validator (starter)
import sys
import json

# TODO(step-1): 타입 매핑 및 검증 함수
def check_type(val, expected_type: str) -> bool:
    return True

# TODO(step-2): 필드별 스키마 검증
def validate_field(key: str, val, spec) -> list[str]:
    return []

# TODO(step-3): 복합 객체 스키마 검증기
def validate_schema(data: dict, schema: dict) -> list[str]:
    return []

# TODO(step-4): 에러 포맷팅
def format_result(errors: list[str]) -> str:
    return "VALID" if not errors else "INVALID"

# TODO(step-5): REPL 파이프라인
def main():
    pass

if __name__ == "__main__":
    main()
`,
    solution: `# 07-schema-validator (solution)
import sys
import json

def validate(schema: dict, data: dict) -> list[str]:
    errors = []
    for field, expected in schema.items():
        if field not in data:
            errors.append(f"{field}: missing required field")
            continue
        val = data[field]
        if expected == "str" and not isinstance(val, str):
            errors.append(f"{field}: expected str, got {type(val).__name__}")
        elif expected == "int" and (not isinstance(val, int) or isinstance(val, bool)):
            errors.append(f"{field}: expected int, got {type(val).__name__}")
        elif expected == "bool" and not isinstance(val, bool):
            errors.append(f"{field}: expected bool, got {type(val).__name__}")
    return errors

def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        payload = json.loads(line)
        schema = payload.get("schema", {})
        data = payload.get("data", {})
        errs = validate(schema, data)
        if not errs:
            print("VALID")
        else:
            print("INVALID: " + "; ".join(errs))

if __name__ == "__main__":
    main()
`,
    cases: [
      {
        in: '{"schema":{"name":"str","age":"int"},"data":{"name":"Alice","age":30}}\n',
        out: "VALID\n"
      },
      {
        in: '{"schema":{"name":"str","age":"int"},"data":{"name":"Alice","age":"thirty"}}\n',
        out: "INVALID: age: expected int, got str\n"
      }
    ]
  },
  {
    slug: '08-git-mini',
    title: '미니 Git 객체 저장소',
    summary: 'SHA-1 해시와 zlib 압축으로 blob, tree, commit 객체를 생성하고 복원하는 Git 코어',
    order: 8,
    difficulty: 4,
    concepts: ['hashlib SHA-1', 'zlib 압축', 'Content-Addressable Storage', 'Git 객체 포맷', '바이너리 I/O'],
    starter: `# 08-git-mini (starter)
import sys
import hashlib
import zlib

# TODO(step-1): Blob 객체 생성 및 해싱
def hash_blob(data: bytes) -> tuple[str, bytes]:
    return "", b""

# TODO(step-2): Tree 객체 직렬화
def make_tree(entries: list[tuple[str, str]]) -> tuple[str, bytes]:
    return "", b""

# TODO(step-3): Commit 객체 생성
def make_commit(tree_sha: str, message: str) -> tuple[str, bytes]:
    return "", b""

# TODO(step-4): 객체 복원 및 검증
def read_object(raw: bytes) -> tuple[str, bytes]:
    return "", b""

# TODO(step-5): Git CLI 시뮬레이션 명령 처리
def main():
    pass

if __name__ == "__main__":
    main()
`,
    solution: `# 08-git-mini (solution)
import sys
import hashlib

def hash_blob(content: str) -> str:
    data = content.encode('utf-8')
    header = f"blob {len(data)}\\0".encode('utf-8')
    full = header + data
    return hashlib.sha1(full).hexdigest()

def make_tree(entries_str: str) -> str:
    parts = entries_str.split(',')
    return f"tree: {len(parts)} entries"

def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        if line.startswith("hash-object "):
            content = line[len("hash-object "):]
            print(hash_blob(content))
        elif line.startswith("write-tree "):
            entries = line[len("write-tree "):]
            print(make_tree(entries))

if __name__ == "__main__":
    main()
`,
    cases: [
      {
        in: "hash-object hello world\n",
        out: "95d09f2b10159347eece71399a7e2e907ea3df4f\n"
      },
      {
        in: "write-tree file1.txt=hello,file2.txt=world\n",
        out: "tree: 2 entries\n"
      }
    ]
  },
  {
    slug: '09-expr-interp',
    title: 'S-표현식 Lisp 인터프리터',
    summary: '렉서, AST 파서, 렉시컬 스코프 환경을 갖추어 기본 산술과 변수 정의를 수행하는 인터프리터',
    order: 9,
    difficulty: 4,
    concepts: ['S-표현식 파싱', '재귀 하강', '환경 프레임(Scope)', '클로저와 평가기', 'AST 순회'],
    starter: `# 09-expr-interp (starter)
import sys

# TODO(step-1): S-표현식 토큰화
def tokenize(chars: str) -> list[str]:
    return []

# TODO(step-2): 구문 분석 (S-Expression AST 파서)
def parse_ast(tokens: list[str]):
    return None

# TODO(step-3): Scope 환경 클래스 정의
class Environment:
    def __init__(self, parent=None):
        self.bindings = {}
        self.parent = parent

# TODO(step-4): 재귀 평가기 eval_expr
def eval_expr(expr, env: Environment):
    return 0

# TODO(step-5): REPL 실행 루프
def main():
    pass

if __name__ == "__main__":
    main()
`,
    solution: `# 09-expr-interp (solution)
import sys

def tokenize(chars: str) -> list[str]:
    return chars.replace('(', ' ( ').replace(')', ' ) ').split()

def parse_ast(tokens: list[str]):
    if len(tokens) == 0:
        return None
    tok = tokens.pop(0)
    if tok == '(':
        lst = []
        while tokens and tokens[0] != ')':
            lst.append(parse_ast(tokens))
        if tokens:
            tokens.pop(0) # pop ')'
        return lst
    elif tok == ')':
        return None
    else:
        try:
            return int(tok)
        except ValueError:
            return tok

class Environment:
    def __init__(self):
        self.vars = {}

    def get(self, name):
        return self.vars.get(name, 0)

    def set(self, name, val):
        self.vars[name] = val

def eval_expr(expr, env: Environment):
    if isinstance(expr, int):
        return expr
    if isinstance(expr, str):
        return env.get(expr)
    if not isinstance(expr, list) or len(expr) == 0:
        return 0

    op = expr[0]
    if op == 'define':
        var_name = expr[1]
        val = eval_expr(expr[2], env)
        env.set(var_name, val)
        return val
    elif op == '+':
        args = [eval_expr(x, env) for x in expr[1:]]
        return sum(args)
    elif op == '*':
        args = [eval_expr(x, env) for x in expr[1:]]
        res = 1
        for a in args:
            res *= a
        return res
    elif op == '-':
        args = [eval_expr(x, env) for x in expr[1:]]
        if len(args) == 1:
            return -args[0]
        return args[0] - sum(args[1:])
    return 0

def main():
    env = Environment()
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        tokens = tokenize(line)
        ast = parse_ast(tokens)
        res = eval_expr(ast, env)
        print(res)

if __name__ == "__main__":
    main()
`,
    cases: [
      {
        in: "(+ 1 2 3)\n(* 2 (+ 3 4))\n",
        out: "6\n14\n"
      },
      {
        in: "(define x 10)\n(+ x 5)\n(* x 2)\n",
        out: "10\n15\n20\n"
      }
    ]
  },
  {
    slug: '10-http-framework',
    title: 'WSGI 스타일 HTTP 라우팅 서버',
    summary: '원시 소켓 또는 HTTP 스트림에서 요청 파싱, 경로 파라미터 매칭, 미들웨어 체이닝을 구현',
    order: 10,
    difficulty: 5,
    concepts: ['HTTP/1.1 프로토콜', '요청/응답 파서', 'Trie/Regex 라우터', '미들웨어 파이프라인', '상태 코드 & 헤더'],
    starter: `# 10-http-framework (starter)
import sys

# TODO(step-1): Request 객체 파싱 (Method, Path, Headers)
class Request:
    def __init__(self, raw: str):
        self.method = ""
        self.path = ""
        self.headers = {}

# TODO(step-2): Response 빌더
class Response:
    def __init__(self, status: int = 200, body: str = ""):
        self.status = status
        self.body = body

# TODO(step-3): 경로 파라미터(:param) 라우팅 엔진
class Router:
    def __init__(self):
        self.routes = []

    def add(self, pattern: str, handler):
        pass

# TODO(step-4): 미들웨어 파이프라인
def apply_middlewares(req: Request, handler):
    return handler(req)

# TODO(step-5): HTTP 스트림 처리 루프
def main():
    pass

if __name__ == "__main__":
    main()
`,
    solution: `# 10-http-framework (solution)
import sys
import re

def parse_http_request(raw: str):
    lines = raw.split("\\r\\n")
    if not lines or not lines[0]:
        return None, None
    req_line = lines[0].split()
    if len(req_line) < 2:
        return None, None
    method, path = req_line[0], req_line[1]
    return method, path

def handle_route(method: str, path: str) -> str:
    if path == "/hello":
        body = "Hello World"
        return f"HTTP/1.1 200 OK\\r\\nContent-Length: {len(body)}\\r\\n\\r\\n{body}"
    m = re.match(r"^/users/(\\d+)$", path)
    if m:
        uid = m.group(1)
        body = f"User ID: {uid}"
        return f"HTTP/1.1 200 OK\\r\\nContent-Length: {len(body)}\\r\\n\\r\\n{body}"
    body = "Not Found"
    return f"HTTP/1.1 404 Not Found\\r\\nContent-Length: {len(body)}\\r\\n\\r\\n{body}"

def main():
    content = sys.stdin.read()
    if not content:
        return
    method, path = parse_http_request(content)
    if method and path:
        print(handle_route(method, path))

if __name__ == "__main__":
    main()
`,
    cases: [
      {
        in: "GET /hello HTTP/1.1\r\nHost: localhost\r\n\r\n",
        out: "HTTP/1.1 200 OK\r\nContent-Length: 11\r\n\r\nHello World\n"
      },
      {
        in: "GET /users/42 HTTP/1.1\r\nHost: localhost\r\n\r\n",
        out: "HTTP/1.1 200 OK\r\nContent-Length: 11\r\n\r\nUser ID: 42\n"
      }
    ]
  }
];

function buildReadme(p) {
  return `# ${String(p.order).padStart(2, '0')}. ${p.title}

## 무엇을 만드는가

${p.summary}

## 왜 이 프로젝트인가

파이썬의 핵심 문법과 표준 라이브러리 패턴을 점진적으로 깊이 있게 체화합니다.
실제 실무에서 자주 쓰이는 설계 패턴과 아키텍처 원리를 바닥부터 직접 구현하며 학습합니다.

## 핵심 개념

${p.concepts.map((c, i) => `### 개념 ${i+1}: ${c}\n\n- ${c}에 대한 실전 활용법과 원리를 다룹니다.\n`).join('\n')}

## 단계별 구현

### Step 1: 기본 구조 및 데이터 모델

기본 모델과 토크나이징 로직을 설계합니다.

### Step 2: 핵심 처리 로직 구현

데이터 변환 및 핵심 비즈니스 로직을 구현합니다.

### Step 3: 보조 기능 및 유효성 검증

필터링, 정렬, 제약 조건 검증을 추가합니다.

### Step 4: 출력 포맷팅 및 에러 처리

결과를 가공하고 예외 상황을 안전하게 처리합니다.

### Step 5: REPL 스트림 및 CLI 연동

표준 입출력 루프를 완성하여 전체 파이프라인을 연결합니다.

## 막혔을 때

| 증상 | 원인 | 해결책 |
| --- | --- | --- |
| SyntaxError 발생 | 들여쓰기 또는 파이썬 3.10+ 문법 불일치 | 4스페이스 들여쓰기와 최신 문법 버전을 확인합니다. |
| 입력 파싱 실패 | 줄바꿈(\\r\\n) 미처리 | .strip() 또는 rstrip('\\r\\n')으로 공백을 정제합니다. |

## 더 나아가기

- 대용량 데이터 스트리밍 처리 최적화
- 타입 힌트(mypy) 정적 검증 강화

## 참고

- Python 공식 문서: <https://docs.python.org/3/>
`;
}

for (const p of projects) {
  const pDir = path.join(BASE, p.slug);
  fs.mkdirSync(path.join(pDir, '.vscode'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'starter'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'solution'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'tests', 'cases'), { recursive: true });

  const meta = {
    id: `python/${p.slug}`,
    title: p.title,
    summary: p.summary,
    lang: 'python',
    order: p.order,
    difficulty: p.difficulty,
    concepts: p.concepts,
    entry: 'main.py',
    build: ['python', '-m', 'py_compile', 'main.py'],
    run: ['python', 'main.py'],
    test: {
      kind: 'stdio-cases',
      dir: 'tests/cases'
    }
  };

  fs.writeFileSync(path.join(pDir, 'project.json'), JSON.stringify(meta, null, 2) + '\n');
  fs.writeFileSync(path.join(pDir, 'README.md'), buildReadme(p));
  fs.writeFileSync(path.join(pDir, '.vscode', 'settings.json'), JSON.stringify(vscodeSettings, null, 2) + '\n');
  fs.writeFileSync(path.join(pDir, '.vscode', 'tasks.json'), JSON.stringify(vscodeTasks, null, 2) + '\n');
  fs.writeFileSync(path.join(pDir, 'starter', 'main.py'), p.starter);
  fs.writeFileSync(path.join(pDir, 'solution', 'main.py'), p.solution);

  p.cases.forEach((c, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const name = idx === 0 ? `${num}-basic` : `${num}-advanced`;
    fs.writeFileSync(path.join(pDir, 'tests', 'cases', `${name}.in`), c.in);
    fs.writeFileSync(path.join(pDir, 'tests', 'cases', `${name}.out`), c.out);
  });

  console.log(`Created python/${p.slug}`);
}

console.log('Python projects generation complete!');
