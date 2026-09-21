# 05-lru-cache (starter)
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
