// 09-markdown-parser (solution)
const readline = require('readline');

function parseInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  const out = [];
  let inList = false;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      continue;
    }

    if (trimmed.startsWith('# ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h1>${parseInline(trimmed.slice(2))}</h1>`);
    } else if (trimmed.startsWith('## ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h2>${parseInline(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith('- ')) {
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${parseInline(trimmed.slice(2))}</li>`);
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<p>${parseInline(trimmed)}</p>`);
    }
  }
  if (inList) out.push('</ul>');
  console.log(out.join('\n'));
}

main();
