// 10-http-server (solution)
const readline = require('readline');

function parseRequest(raw) {
  const lines = raw.split('\r\n');
  if (!lines || lines.length === 0) return null;
  const first = lines[0].split(' ');
  return { method: first[0], path: first[1] };
}

function handleRoute(req) {
  if (req.path === '/api/health') {
    const body = JSON.stringify({ status: 'ok' });
    return `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: ${body.length}\r\n\r\n${body}`;
  }
  if (req.path === '/hello') {
    const body = 'Hello World';
    return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${body.length}\r\n\r\n${body}`;
  }
  const body = 'Not Found';
  return `HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: ${body.length}\r\n\r\n${body}`;
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let reqText = '';
  for await (const line of rl) {
    reqText += line + '\r\n';
  }
  const req = parseRequest(reqText);
  if (req) {
    console.log(handleRoute(req));
  }
}

main();
