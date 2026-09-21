# 06-event-emitter (solution)
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
