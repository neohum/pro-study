# 05-lru-cache (solution)
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
