import * as fs from 'fs';
import * as path from 'path';

const rootDir = path.resolve(__dirname, '..');

const schemaPaths = {
  symbol: path.join(rootDir, 'courses', 'math-symbols', '_schema', 'symbol.schema.json'),
  theorem: path.join(rootDir, 'courses', 'math-symbols', '_schema', 'theorem.schema.json'),
  eeModule: path.join(rootDir, 'courses', 'electrical-eng', '_schema', 'module.schema.json'),
  elModule: path.join(rootDir, 'courses', 'electronics-eng', '_schema', 'module.schema.json'),
};

const args = process.argv.slice(2);
const schemaOnly = args.includes('--schema-only');
const checkSymbols = args.includes('--symbols') || args.includes('--all') || (!args.length);
const checkTheorems = args.includes('--theorems') || args.includes('--all') || (!args.length);
const checkElectrical = args.includes('--electrical') || args.includes('--all') || (!args.length);
const checkElectronics = args.includes('--electronics') || args.includes('--all') || (!args.length);

function validateSchemas() {
  console.log('[1/5] Checking JSON schemas for Math, EE, and Electronics...');
  for (const [key, p] of Object.entries(schemaPaths)) {
    if (!fs.existsSync(p)) {
      throw new Error(`Schema file not found: ${p}`);
    }
    const raw = fs.readFileSync(p, 'utf8');
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.$schema || !parsed.title) {
        throw new Error(`Schema ${key} missing standard $schema or title`);
      }
    } catch (e: any) {
      throw new Error(`Invalid JSON in schema ${key} (${p}): ${e.message}`);
    }
  }
  console.log('  ✓ All 4 JSON schemas are valid.');
}

function validateSymbols() {
  console.log('[2/5] Checking Math Symbols Encyclopedia...');
  const symbolsDir = path.join(rootDir, 'courses', 'math-symbols');
  const manifestPath = path.join(symbolsDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.log('  ⚠️ Math symbols manifest not yet present (pending Step 2)');
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  let totalSymbols = 0;
  for (const cat of manifest.categories) {
    const catFile = path.join(symbolsDir, cat.file);
    if (!fs.existsSync(catFile)) {
      throw new Error(`Symbol category file missing: ${catFile}`);
    }
    const catData = JSON.parse(fs.readFileSync(catFile, 'utf8'));
    totalSymbols += catData.symbols.length;
    for (const sym of catData.symbols) {
      if (!sym.typesetMath || !sym.howToReadEn || !sym.rigorousDefinition) {
        throw new Error(`Symbol ${sym.id} is missing required typeset fields`);
      }
    }
  }
  console.log(`  ✓ Verified ${manifest.categories.length} categories, ${totalSymbols} symbols.`);
}

function validateTheorems() {
  console.log('[3/5] Checking Math 12 Theorems Rigorous Proofs...');
  const theoremsDir = path.join(rootDir, 'courses', 'math-symbols', 'theorems');
  if (!fs.existsSync(theoremsDir)) {
    console.log('  ⚠️ Math theorems directory not yet present (pending Step 3)');
    return;
  }
  const files = fs.readdirSync(theoremsDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.log('  ⚠️ No theorem files yet (pending Step 3)');
    return;
  }
  for (const f of files) {
    const filePath = path.join(theoremsDir, f);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.statement?.typesetMath || !data.rigorousProof?.steps?.length) {
      throw new Error(`Theorem ${f} missing statement or proof steps`);
    }
  }
  console.log(`  ✓ Verified ${files.length} theorem proof documents.`);
}

function validateElectrical() {
  console.log('[4/5] Checking Electrical Engineering Course Modules...');
  const eeDir = path.join(rootDir, 'courses', 'electrical-eng');
  const manifestPath = path.join(eeDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.log('  ⚠️ Electrical engineering manifest not yet present (pending Step 4)');
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const mod of manifest.modules) {
    const modFile = path.join(eeDir, mod.file);
    if (!fs.existsSync(modFile)) {
      throw new Error(`EE module file missing: ${modFile}`);
    }
    const modData = JSON.parse(fs.readFileSync(modFile, 'utf8'));
    if (!modData.coreConcepts?.length || !modData.simulationRef?.id) {
      throw new Error(`EE Module ${mod.id} missing core concepts or simulation ref`);
    }
  }
  console.log(`  ✓ Verified ${manifest.modules.length} electrical engineering modules.`);
}

function validateElectronics() {
  console.log('[5/5] Checking Electronic Engineering Course Modules...');
  const elDir = path.join(rootDir, 'courses', 'electronics-eng');
  const manifestPath = path.join(elDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.log('  ⚠️ Electronics engineering manifest not yet present (pending Step 5)');
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const mod of manifest.modules) {
    const modFile = path.join(elDir, mod.file);
    if (!fs.existsSync(modFile)) {
      throw new Error(`Electronics module file missing: ${modFile}`);
    }
    const modData = JSON.parse(fs.readFileSync(modFile, 'utf8'));
    if (!modData.coreConcepts?.length || !modData.simulationRef?.id) {
      throw new Error(`Electronics Module ${mod.id} missing core concepts or simulation ref`);
    }
  }
  console.log(`  ✓ Verified ${manifest.modules.length} electronic engineering modules.`);
}

try {
  validateSchemas();
  if (!schemaOnly) {
    if (checkSymbols) validateSymbols();
    if (checkTheorems) validateTheorems();
    if (checkElectrical) validateElectrical();
    if (checkElectronics) validateElectronics();
  }
  console.log('\n🎉 [PASS] Math & EE Suite Verification completed successfully.\n');
  process.exit(0);
} catch (err: any) {
  console.error('\n❌ [FAIL] Verification Error:', err.message);
  process.exit(1);
}
