import * as fs from 'fs';
import * as path from 'path';

const rootDir = path.resolve(__dirname, '..');

// 1. Math symbols
const symbolsManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'courses', 'math-symbols', 'manifest.json'), 'utf8'));
const categoriesData = [];
for (const cat of symbolsManifest.categories) {
  const catPath = path.join(rootDir, 'courses', 'math-symbols', cat.file);
  categoriesData.push(JSON.parse(fs.readFileSync(catPath, 'utf8')));
}

// 2. Math theorems
const theoremsDir = path.join(rootDir, 'courses', 'math-symbols', 'theorems');
const theoremFiles = fs.readdirSync(theoremsDir).filter(f => f.endsWith('.json')).sort();
const theoremsData = theoremFiles.map(f => JSON.parse(fs.readFileSync(path.join(theoremsDir, f), 'utf8'))).sort((a, b) => a.order - b.order);

// 3. Electrical Engineering
const eeManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'courses', 'electrical-eng', 'manifest.json'), 'utf8'));
const eeModulesData = [];
for (const mod of eeManifest.modules) {
  const modPath = path.join(rootDir, 'courses', 'electrical-eng', mod.file);
  eeModulesData.push(JSON.parse(fs.readFileSync(modPath, 'utf8')));
}

// 4. Electronic Engineering
const elManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'courses', 'electronics-eng', 'manifest.json'), 'utf8'));
const elModulesData = [];
for (const mod of elManifest.modules) {
  const modPath = path.join(rootDir, 'courses', 'electronics-eng', mod.file);
  elModulesData.push(JSON.parse(fs.readFileSync(modPath, 'utf8')));
}

const consolidated = {
  title: "수학 기호·정리 증명 및 전기·전자공학 마스터 스위트",
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  mathSymbols: {
    title: symbolsManifest.title,
    description: symbolsManifest.description,
    categories: categoriesData
  },
  mathTheorems: {
    title: "수학 12대 핵심 이론 단계별 엄밀 증명",
    theorems: theoremsData
  },
  electrical: {
    title: eeManifest.title,
    description: eeManifest.description,
    modules: eeModulesData
  },
  electronics: {
    title: elManifest.title,
    description: elManifest.description,
    modules: elModulesData
  }
};

const outPath = path.join(rootDir, 'site', 'web', 'static', 'math-ee', 'manifest.json');
fs.writeFileSync(outPath, JSON.stringify(consolidated, null, 2), 'utf8');
console.log(`\n🎉 Consolidated manifest built successfully at ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB).\n`);
