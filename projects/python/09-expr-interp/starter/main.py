# 09-expr-interp (starter)
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
