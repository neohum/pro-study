# 08-git-mini (solution)
import sys
import hashlib

def hash_blob(content: str) -> str:
    data = content.encode('utf-8')
    header = f"blob {len(data)}\0".encode('utf-8')
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
