# 03-markdown-parser (solution)
import sys
import re

def parse_inline(text: str) -> str:
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
    return text

def main():
    content = sys.stdin.read()
    if not content:
        return
    raw_lines = [l.rstrip('\r') for l in content.strip().split('\n')]
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
    print("\n".join(out))

if __name__ == "__main__":
    main()
