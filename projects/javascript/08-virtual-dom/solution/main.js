// 08-virtual-dom (solution)
const readline = require('readline');

function h(tag, props = {}, children = []) {
  return { tag, props: props || {}, children: children || [] };
}

function renderToString(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  const propsStr = Object.entries(node.props)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('');
  const childrenStr = node.children.map(renderToString).join('');
  return `<${node.tag}${propsStr}>${childrenStr}</${node.tag}>`;
}

function diff(n1, n2) {
  if (!n1) return 'CREATE';
  if (!n2) return 'REMOVE';
  if (typeof n1 !== typeof n2 || (typeof n1 === 'string' && n1 !== n2)) return 'REPLACE';
  if (n1.tag !== n2.tag) return 'REPLACE';
  return 'UPDATE';
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  line = line.trim();
  if (!line) return;
  const vnode = h('div', { id: 'app' }, [h('h1', {}, ['Title']), h('p', {}, [line])]);
  console.log(renderToString(vnode));
});
