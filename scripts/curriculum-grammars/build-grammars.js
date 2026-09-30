/**
 * scripts/curriculum-grammars/build-grammars.js
 * 6개 언어(C, Go, Rust, Python, TypeScript, JavaScript)의 문법 학습 데이터를
 * content/reference/*.json 파일에 통합 빌드합니다.
 */

const fs = require('fs');
const path = require('path');

const grammars = {
  c: require('./c_grammar.js'),
  go: require('./go_grammar.js'),
  rust: require('./rust_grammar.js'),
  python: require('./python_grammar.js'),
  typescript: require('./typescript_grammar.js'),
  javascript: require('./javascript_grammar.js')
};

const referenceDir = path.resolve(__dirname, '../../content/reference');

console.log('=== 프로그래밍 언어 문법 학습 콘텐츠 빌드 시작 ===');

let totalGrammars = 0;

for (const [lang, grammarList] of Object.entries(grammars)) {
  const filePath = path.join(referenceDir, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`[오류] 파일을 찾을 수 없습니다: ${filePath}`);
    continue;
  }

  const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const oldCount = fileContent.grammar ? fileContent.grammar.length : 0;
  
  // grammar 배열 치환
  fileContent.grammar = grammarList;

  fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2), 'utf-8');
  console.log(`[완료] ${lang.toUpperCase()}: 기존 ${oldCount}개 -> ${grammarList.length}개 핵심 문법 학습 항목 탑재 (${filePath})`);
  totalGrammars += grammarList.length;
}

console.log(`=== 빌드 완료: 총 6개 언어, ${totalGrammars}개 심층 문법 항목 반영 성공 ===`);
