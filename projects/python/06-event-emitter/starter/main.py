# 06-event-emitter (starter)
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
