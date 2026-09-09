/**
 * package-android-assets.js
 * 
 * pro-study의 20개 프로젝트(c 10개, go 10개) 메타데이터, 가이드, 소스코드를
 * Android 앱 assets 디렉터리(android-app/app/src/main/assets/content/)로 패키징한다.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT, 'projects');
const ASSETS_DIR = path.join(ROOT, 'android-app', 'app', 'src', 'main', 'assets', 'content');

function readDirRecursive(dir, baseDir = dir) {
  const result = {};
  if (!fs.existsSync(dir)) return result;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'build' || entry.name === '.vscode') continue;
      Object.assign(result, readDirRecursive(fullPath, baseDir));
    } else if (entry.isFile()) {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      try {
        result[relPath] = fs.readFileSync(fullPath, 'utf8');
      } catch (err) {
        // 바이너리 파일 스킵
      }
    }
  }
  return result;
}

function run() {
  console.log('== Android 콘텐츠 에셋 패키징 시작 ==');
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  const manifest = { projects: [] };
  const langs = ['c', 'go'];
  let totalCount = 0;

  for (const lang of langs) {
    const langDir = path.join(PROJECTS_DIR, lang);
    if (!fs.existsSync(langDir)) continue;

    const slugs = fs.readdirSync(langDir).filter(s => !s.startsWith('_') && !s.startsWith('.'));
    slugs.sort();

    for (const slug of slugs) {
      const pDir = path.join(langDir, slug);
      const jsonPath = path.join(pDir, 'project.json');
      const readmePath = path.join(pDir, 'README.md');

      if (!fs.existsSync(jsonPath)) continue;

      const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : '';
      const starterCode = readDirRecursive(path.join(pDir, 'starter'));
      const solutionCode = readDirRecursive(path.join(pDir, 'solution'));

      const asset = {
        id: meta.id || `${lang}/${slug}`,
        lang,
        order: meta.order || 0,
        title: meta.title || slug,
        summary: meta.summary || '',
        difficulty: meta.difficulty || 1,
        concepts: meta.concepts || [],
        entry: meta.entry || (lang === 'c' ? 'main.c' : 'main.go'),
        readme,
        starterCode,
        solutionCode
      };

      const outFileName = `${lang}_${slug.replace(/-/g, '_')}.json`;
      fs.writeFileSync(path.join(ASSETS_DIR, outFileName), JSON.stringify(asset, null, 2), 'utf8');

      manifest.projects.push({
        id: asset.id,
        lang: asset.lang,
        order: asset.order,
        title: asset.title,
        summary: asset.summary,
        difficulty: asset.difficulty,
        concepts: asset.concepts,
        entry: asset.entry,
        assetFile: `content/${outFileName}`
      });

      totalCount++;
      console.log(`  [OK] ${asset.id} -> ${outFileName}`);
    }
  }

  manifest.projects.sort((a, b) => {
    if (a.lang !== b.lang) return a.lang.localeCompare(b.lang);
    return a.order - b.order;
  });

  fs.writeFileSync(path.join(ASSETS_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\n총 ${totalCount}개 프로젝트 에셋 패키징 완료: ${ASSETS_DIR}/manifest.json`);
}

run();
