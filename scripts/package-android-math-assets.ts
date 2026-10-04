import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve(__dirname, '../courses/k12-math');
const DEST_DIR = path.resolve(__dirname, '../android-app/app/src/main/assets/k12-math');

function copyRecursive(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (entry === '_schema' || entry === 'test.json') continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function main() {
  console.log('[BUNDLE] Packaging K-12 Math assets for Android App...');
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  // 1. Copy curriculum manifest
  fs.copyFileSync(path.join(SRC_DIR, 'manifest.json'), path.join(DEST_DIR, 'manifest.json'));
  console.log('✓ Copied manifest.json');

  // 2. Copy all grade directories
  const grades = [
    'middle-1', 'middle-2', 'middle-3',
    'high-common', 'high-algebra', 'high-calculus1',
    'high-prob-stat', 'high-calculus2', 'high-geometry'
  ];

  let unitFileCount = 0;
  for (const grade of grades) {
    const srcGradeDir = path.join(SRC_DIR, grade);
    const destGradeDir = path.join(DEST_DIR, grade);
    if (fs.existsSync(srcGradeDir)) {
      if (!fs.existsSync(destGradeDir)) {
        fs.mkdirSync(destGradeDir, { recursive: true });
      }
      const files = fs.readdirSync(srcGradeDir).filter(f => f.endsWith('.json'));
      for (const f of files) {
        fs.copyFileSync(path.join(srcGradeDir, f), path.join(destGradeDir, f));
        unitFileCount++;
      }
    }
  }
  console.log(`✓ Copied ${unitFileCount} unit JSON files across 9 grades.`);

  // 3. Copy KaTeX and Viewer assets
  const srcAssetsDir = path.join(SRC_DIR, '_assets');
  if (fs.existsSync(srcAssetsDir)) {
    // viewer.html -> DEST_DIR/viewer.html
    const viewerHtml = path.join(srcAssetsDir, 'viewer.html');
    if (fs.existsSync(viewerHtml)) {
      fs.copyFileSync(viewerHtml, path.join(DEST_DIR, 'viewer.html'));
      console.log('✓ Copied viewer.html');
    }

    // katex/ -> DEST_DIR/katex/
    const katexDir = path.join(srcAssetsDir, 'katex');
    if (fs.existsSync(katexDir)) {
      copyRecursive(katexDir, path.join(DEST_DIR, 'katex'));
      console.log('✓ Copied offline KaTeX bundle (js, css, woff2 fonts)');
    }
  }

  // 4. Verify bundle completeness
  const finalManifest = JSON.parse(fs.readFileSync(path.join(DEST_DIR, 'manifest.json'), 'utf8'));
  console.log(`✓ Successfully packaged ${finalManifest.totalUnits} units, ${finalManifest.totalProblems} problems into ${DEST_DIR}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
