// 06-template-engine (solution)
const readline = require('readline');

function render(template, data) {
  // 1. Loops: {{#each list}}...{{/each}}
  let out = template.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, inner) => {
    const list = data[key] || [];
    return list.map((item) => {
      let itemStr = inner;
      if (typeof item === 'object') {
        for (const k of Object.keys(item)) {
          itemStr = itemStr.replace(new RegExp(`\\{\\{item\\.${k}\\}\\}`, 'g'), item[k]);
        }
      } else {
        itemStr = itemStr.replace(/\{\{this\}\}/g, item);
      }
      return itemStr.trim();
    }).join('\n');
  });

  // 2. Conditionals: {{#if cond}}...{{/if}}
  out = out.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, inner) => {
    return data[key] ? inner.trim() : '';
  });

  // 3. Simple variables: {{var}}
  out = out.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data[key] !== undefined ? data[key] : '';
  });

  return out.trim();
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let tpl = '';
  let dataStr = '';
  let isData = false;

  for await (const line of rl) {
    if (line.trim() === '---DATA---') {
      isData = true;
      continue;
    }
    if (!isData) {
      tpl += (tpl ? '\n' : '') + line;
    } else {
      dataStr += (dataStr ? '\n' : '') + line;
    }
  }

  const data = JSON.parse(dataStr);
  console.log(render(tpl, data));
}

main();
