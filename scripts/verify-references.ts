/**
 * scripts/verify-references.ts
 * 6개 언어 문법 및 표준 라이브러리 함수 레퍼런스 데이터셋의 스키마 및 무결성 검증 스크립트
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

interface GrammarItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  syntax: string;
  example: string;
}

interface FunctionItem {
  name: string;
  signature: string;
  module: string;
  description: string;
  example: string;
}

interface ReferenceDoc {
  lang: string;
  name: string;
  version: string;
  overview: string;
  grammar: GrammarItem[];
  functions: FunctionItem[];
}

const ROOT = resolve(process.cwd());
const REF_DIR = join(ROOT, 'content', 'reference');
const SCHEMA_FILE = join(ROOT, 'projects', '_schema', 'reference.schema.json');
const TARGET_LANGS = ['c', 'go', 'rust', 'python', 'typescript', 'javascript'];

function main() {
  console.log('== 다국어 문법/함수 레퍼런스 검증 시작 ==');

  if (!existsSync(SCHEMA_FILE)) {
    console.error(`[오류] 스키마 파일이 존재하지 않습니다: ${SCHEMA_FILE}`);
    process.exit(1);
  }

  let totalGrammar = 0;
  let totalFunctions = 0;
  let hasError = false;

  for (const lang of TARGET_LANGS) {
    const filePath = join(REF_DIR, `${lang}.json`);
    if (!existsSync(filePath)) {
      console.error(`[오류] 레퍼런스 파일이 없습니다: ${filePath}`);
      hasError = true;
      continue;
    }

    try {
      const raw = readFileSync(filePath, 'utf-8');
      const doc: ReferenceDoc = JSON.parse(raw);

      if (doc.lang !== lang) {
        console.error(`[오류] ${lang}.json: lang 속성이 일치하지 않습니다 (${doc.lang} != ${lang})`);
        hasError = true;
      }

      if (!doc.name || !doc.version || !doc.overview) {
        console.error(`[오류] ${lang}.json: 필수 메타데이터(name, version, overview) 누락`);
        hasError = true;
      }

      if (!Array.isArray(doc.grammar) || doc.grammar.length < 6) {
        console.error(`[오류] ${lang}.json: grammar 항목이 6개 미만입니다 (현재: ${doc.grammar?.length})`);
        hasError = true;
      }

      for (const [idx, g] of doc.grammar.entries()) {
        if (!g.id || !g.title || !g.category || !g.summary || !g.syntax || !g.example) {
          console.error(`[오류] ${lang}.json: grammar[${idx}] 필드 누락`);
          hasError = true;
        }
      }

      if (!Array.isArray(doc.functions) || doc.functions.length < 20) {
        console.error(`[오류] ${lang}.json: functions 항목이 20개 미만입니다 (현재: ${doc.functions?.length})`);
        hasError = true;
      }

      for (const [idx, fn] of doc.functions.entries()) {
        if (!fn.name || !fn.signature || !fn.module || !fn.description || !fn.example) {
          console.error(`[오류] ${lang}.json: functions[${idx}] 필드 누락`);
          hasError = true;
        }
      }

      totalGrammar += doc.grammar.length;
      totalFunctions += doc.functions.length;
      console.log(`✓ [${lang}] ${doc.name} (${doc.version}): 문법 ${doc.grammar.length}개, 함수 ${doc.functions.length}개 검증 완료`);
    } catch (err) {
      console.error(`[오류] ${filePath} 파싱 실패:`, err);
      hasError = true;
    }
  }

  if (hasError) {
    console.error('[실패] 레퍼런스 검증에 실패했습니다.');
    process.exit(1);
  }

  console.log(`\n[성공] 6개 언어 총 ${totalGrammar}개 문법 주제, 총 ${totalFunctions}개 표준 함수 레퍼런스 검증 100% 통과!`);
}

main();
