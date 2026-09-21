# 09-expr-interp (solution)
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
