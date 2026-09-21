// 01-calculator-cli (solution)
const readline = require('readline');

function tokenize(input) {
  const tokens = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
    } else if (/[0-9]/.test(ch)) {
      let num = '';
      while (i < input.length && /[0-9]/.test(input[i])) {
        num += input[i++];
      }
      tokens.push({ type: 'NUM', val: parseInt(num, 10) });
    } else if ('+-*/()'.includes(ch)) {
      tokens.push({ type: ch });
      i++;
    } else {
      i++;
    }
  }
  return tokens;
}

function parseFactor(ctx) {
  const tok = ctx.tokens[ctx.pos];
  if (!tok) return 0;
  if (tok.type === 'NUM') {
    ctx.pos++;
    return tok.val;
  }
  if (tok.type === '(') {
    ctx.pos++;
    const val = parseExpr(ctx);
    if (ctx.tokens[ctx.pos] && ctx.tokens[ctx.pos].type === ')') {
      ctx.pos++;
    }
    return val;
  }
  return 0;
}

function parseTerm(ctx) {
  let left = parseFactor(ctx);
  while (ctx.pos < ctx.tokens.length) {
    const tok = ctx.tokens[ctx.pos];
    if (tok.type === '*') {
      ctx.pos++;
      left *= parseFactor(ctx);
    } else if (tok.type === '/') {
      ctx.pos++;
      const r = parseFactor(ctx);
      left = Math.floor(left / r);
    } else {
      break;
    }
  }
  return left;
}

function parseExpr(ctx) {
  let left = parseTerm(ctx);
  while (ctx.pos < ctx.tokens.length) {
    const tok = ctx.tokens[ctx.pos];
    if (tok.type === '+') {
      ctx.pos++;
      left += parseTerm(ctx);
    } else if (tok.type === '-') {
      ctx.pos++;
      left -= parseTerm(ctx);
    } else {
      break;
    }
  }
  return left;
}

function evaluate(str) {
  const tokens = tokenize(str);
  return parseExpr({ tokens, pos: 0 });
}

function main() {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line) => {
    line = line.trim();
    if (!line) return;
    console.log(evaluate(line));
  });
}

main();
