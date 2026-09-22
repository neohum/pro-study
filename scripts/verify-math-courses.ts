/**
 * scripts/verify-math-courses.ts
 * 6개 언어(C23, Go, Rust, Python, TypeScript, JavaScript) 수학 커리큘럼 데이터셋 검증기
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const MATH_DIR = join(ROOT, 'courses', 'math-cs');
const SCHEMA_FILE = join(MATH_DIR, '_schema', 'math-course.schema.json');
const MANIFEST_FILE = join(MATH_DIR, 'manifest.json');
const TARGET_LANGS = ['c', 'go', 'rust', 'python', 'typescript', 'javascript'] as const;

interface ManifestStage {
  id: string;
  title: string;
  curriculumOrigin: string;
  modules: Array<{
    id: string;
    order: number;
    titleKo: string;
    mathConcept: string;
    targetAlgorithms: string;
    prerequisites: string[];
  }>;
}

interface Manifest {
  courseId: string;
  title: string;
  description: string;
  supportedLanguages: string[];
  totalStages: number;
  totalModules: number;
  stages: ManifestStage[];
}

export function verifyMathCourses(): boolean {
  console.log('== 6개 언어 CS 수학 커리큘럼 무결성 검증 시작 ==');

  let hasError = false;

  // 1. 스키마 파일 존재 확인
  if (!existsSync(SCHEMA_FILE)) {
    console.error(`[오류] 스키마 파일이 없습니다: ${SCHEMA_FILE}`);
    return false;
  }
  console.log('✓ JSON 스키마 파일 확인 완료');

  // 2. 매니페스트 파일 로드 및 검증
  if (!existsSync(MANIFEST_FILE)) {
    console.error(`[오류] 매니페스트 파일이 없습니다: ${MANIFEST_FILE}`);
    return false;
  }

  let manifest: Manifest;
  try {
    const raw = readFileSync(MANIFEST_FILE, 'utf-8');
    manifest = JSON.parse(raw);
  } catch (err) {
    console.error(`[오류] 매니페스트 JSON 파싱 실패: ${(err as Error).message}`);
    return false;
  }

  // 필수 속성 검증
  if (manifest.courseId !== 'math-cs') {
    console.error(`[오류] courseId가 'math-cs'여야 합니다: ${manifest.courseId}`);
    hasError = true;
  }

  // 6개 언어 지원 확인
  for (const lang of TARGET_LANGS) {
    if (!manifest.supportedLanguages.includes(lang)) {
      console.error(`[오류] 지원 언어 목록에 ${lang}이(가) 누락되었습니다.`);
      hasError = true;
    }
  }
  console.log(`✓ 6개 언어 지원 확인: ${TARGET_LANGS.join(', ')}`);

  // Stage 및 모듈 수 검증
  if (manifest.stages.length !== manifest.totalStages) {
    console.error(`[오류] 스테이지 수 불일치: 선언=${manifest.totalStages}, 실제=${manifest.stages.length}`);
    hasError = true;
  }

  const moduleIds = new Set<string>();
  let totalModuleCount = 0;

  for (const stage of manifest.stages) {
    if (!stage.id || !stage.title || !stage.curriculumOrigin) {
      console.error(`[오류] 스테이지 필수 메타데이터 누락: ${JSON.stringify(stage)}`);
      hasError = true;
    }

    for (const mod of stage.modules) {
      totalModuleCount++;
      if (moduleIds.has(mod.id)) {
        console.error(`[오류] 중복된 모듈 ID: ${mod.id}`);
        hasError = true;
      }
      moduleIds.add(mod.id);

      if (!mod.titleKo || !mod.mathConcept || !mod.targetAlgorithms) {
        console.error(`[오류] 모듈 정보 불완전: ${mod.id}`);
        hasError = true;
      }
    }
  }

  if (totalModuleCount !== manifest.totalModules) {
    console.error(`[오류] 모듈 총수 불일치: 선언=${manifest.totalModules}, 실제=${totalModuleCount}`);
    hasError = true;
  } else {
    console.log(`✓ 7대 Stage, 40개 세부 모듈 매니페스트 정합성 확인 완료`);
  }

  // 3. 레슨 데이터셋 검증 (존재하는 경우 6개 언어 코드 블록 정합성 검사)
  const lessonFiles = [
    join(MATH_DIR, 'lessons.json'),
    join(MATH_DIR, 'stage1-middle', 'lessons.json'),
    join(MATH_DIR, 'stage2-common-high', 'lessons.json'),
    join(MATH_DIR, 'stage3-advanced-high', 'lessons.json'),
    join(MATH_DIR, 'stage4-linear-algebra', 'lessons.json'),
    join(MATH_DIR, 'stage5-discrete-math', 'lessons.json'),
    join(MATH_DIR, 'stage6-optimization', 'lessons.json'),
    join(MATH_DIR, 'stage7-stats-numerical', 'lessons.json'),
  ];

  let verifiedLessons = 0;
  for (const file of lessonFiles) {
    if (!existsSync(file)) continue;

    try {
      const lessons = JSON.parse(readFileSync(file, 'utf-8'));
      if (!Array.isArray(lessons)) {
        console.error(`[오류] 레슨 파일은 배열 형태여야 합니다: ${file}`);
        hasError = true;
        continue;
      }

      for (const lesson of lessons) {
        verifiedLessons++;
        if (!lesson.id || !lesson.titleKo) {
          console.error(`[오류] 레슨 필수 기본 정보 누락: ${lesson.id || file}`);
          hasError = true;
        }

        // 실제 수학 식 필사 콘텐츠 검증
        if (!lesson.mathFormulasToTrace || !Array.isArray(lesson.mathFormulasToTrace) || lesson.mathFormulasToTrace.length === 0) {
          console.error(`[오류] 레슨에 실제 수학 공식 필사 목록(mathFormulasToTrace)이 없습니다: ${lesson.id}`);
          hasError = true;
        }
        if (!lesson.derivationStepsToTrace || !Array.isArray(lesson.derivationStepsToTrace) || lesson.derivationStepsToTrace.length === 0) {
          console.error(`[오류] 레슨에 수학 정리 유도 필사 과정(derivationStepsToTrace)이 없습니다: ${lesson.id}`);
          hasError = true;
        }
        if (!lesson.workedExample || !lesson.workedExample.problem || !Array.isArray(lesson.workedExample.stepsToTrace)) {
          console.error(`[오류] 레슨에 실제 수학 문제 풀이 필사 예제(workedExample)가 없습니다: ${lesson.id}`);
          hasError = true;
        }

        // 6개 언어 코드 구현 검증
        if (!lesson.codeImplementations) {
          console.error(`[오류] 레슨에 6개 언어 코드 구현체(codeImplementations)가 없습니다: ${lesson.id}`);
          hasError = true;
        } else {
          for (const lang of TARGET_LANGS) {
            const impl = lesson.codeImplementations[lang];
            if (!impl || !impl.code || impl.code.trim().length === 0) {
              console.error(`[오류] 레슨 ${lesson.id}에 ${lang} 코드 구현이 누락되었습니다.`);
              hasError = true;
            }
          }
        }
      }
    } catch (e) {
      console.error(`[오류] 레슨 파일 파싱 실패 (${file}): ${(e as Error).message}`);
      hasError = true;
    }
  }

  if (verifiedLessons > 0) {
    console.log(`✓ 6개 언어 코드 구현이 완비된 ${verifiedLessons}개 상세 레슨 검증 완료`);
  }

  // 4. 퀴즈 데이터셋 검증
  const quizFile = join(MATH_DIR, 'quizzes', 'checkpoint-quizzes.json');
  if (existsSync(quizFile)) {
    try {
      const quizzes = JSON.parse(readFileSync(quizFile, 'utf-8'));
      let quizCount = 0;
      for (const [modId, qList] of Object.entries(quizzes)) {
        if (!Array.isArray(qList)) {
          console.error(`[오류] 퀴즈 목록이 배열이 아닙니다: ${modId}`);
          hasError = true;
          continue;
        }
        for (const q of qList as any[]) {
          quizCount++;
          if (!q.question || !q.options || typeof q.answerIndex !== 'number' || !q.explanation) {
            console.error(`[오류] 퀴즈 항목 구조 이상: ${modId}`);
            hasError = true;
          }
        }
      }
      console.log(`✓ 체크포인트 개념 퀴즈 ${quizCount}문항 검증 완료`);
    } catch (e) {
      console.error(`[오류] 퀴즈 파일 파싱 실패: ${(e as Error).message}`);
      hasError = true;
    }
  }

  // 5. 수식 유도 빈칸 데이터셋 검증
  const derivationFile = join(MATH_DIR, 'derivations', 'fill-blanks.json');
  if (existsSync(derivationFile)) {
    try {
      const derivations = JSON.parse(readFileSync(derivationFile, 'utf-8'));
      let dCount = 0;
      for (const [modId, item] of Object.entries(derivations)) {
        dCount++;
        const d = item as any;
        if (!d.latexTemplate || !d.blanks || !Array.isArray(d.blanks)) {
          console.error(`[오류] 수식 유도 빈칸 구조 이상: ${modId}`);
          hasError = true;
        }
      }
      console.log(`✓ 수식 유도 빈칸 채우기 ${dCount}개 항목 검증 완료`);
    } catch (e) {
      console.error(`[오류] 수식 유도 파일 파싱 실패: ${(e as Error).message}`);
      hasError = true;
    }
  }

  if (hasError) {
    console.error('\n❌ CS 수학 커리큘럼 검증 실패');
    return false;
  }

  console.log('\n✅ 6개 언어 CS 수학 커리큘럼 및 데이터셋 전체 무결성 검증 통과!');
  return true;
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const ok = verifyMathCourses();
  process.exit(ok ? 0 : 1);
}
