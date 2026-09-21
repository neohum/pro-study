# 04-csv-sql (solution)
import sys
import re

def parse_query(q_str: str) -> dict:
    cols_match = re.search(r'SELECT\s+(.+?)(?:\s+WHERE|\s+ORDER\s+BY|$)', q_str)
    cols = [c.strip() for c in cols_match.group(1).split(',')] if cols_match else []
    
    where_match = re.search(r'WHERE\s+(.+?)(?:\s+ORDER\s+BY|$)', q_str)
    where_clause = where_match.group(1).strip() if where_match else ""

    order_match = re.search(r'ORDER\s+BY\s+(.+?)$', q_str)
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
    m = re.match(r'age\s*>\s*(\d+)', where_clause)
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
    lines = content.split('\n')
    q = parse_query(lines[0])
    rows = parse_csv(lines[1:], q['cols'])
    rows = apply_where(rows, q['where'])
    rows = apply_order(rows, q['order'])
    for r in rows:
        print(",".join(str(r[c]) for c in q['cols']))

if __name__ == "__main__":
    main()
