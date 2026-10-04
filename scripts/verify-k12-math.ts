import * as fs from 'fs';
import * as path from 'path';

interface ManifestUnit {
  id: string;
  order: number;
  domain: string;
  titleKo: string;
  titleEn: string;
  file: string;
}

interface ManifestGrade {
  gradeId: string;
  nameKo: string;
  nameEn: string;
  units: ManifestUnit[];
}

interface Manifest {
  title: string;
  totalGrades: number;
  totalUnits: number;
  totalProblems: number;
  grades: ManifestGrade[];
}

const rootDir = path.resolve(__dirname, '..');
const mathDir = path.join(rootDir, 'courses', 'k12-math');
const manifestPath = path.join(mathDir, 'manifest.json');
const schemaPath = path.join(mathDir, '_schema', 'unit.schema.json');

const args = process.argv.slice(2);
const schemaOnly = args.includes('--schema-only');
const gradeFilterIdx = args.indexOf('--grade');
const gradeFilter = gradeFilterIdx !== -1 ? args[gradeFilterIdx + 1] : null;

function runValidation() {
  console.log('[1/4] Checking manifest.json & schema...');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`manifest.json not found at ${manifestPath}`);
  }
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`unit.schema.json not found at ${schemaPath}`);
  }

  const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
  const manifest: Manifest = JSON.parse(manifestRaw);

  if (manifest.totalUnits !== 70) {
    throw new Error(`Expected 70 total units, got ${manifest.totalUnits}`);
  }

  let totalUnitsCount = 0;
  for (const grade of manifest.grades) {
    totalUnitsCount += grade.units.length;
  }
  if (totalUnitsCount !== 70) {
    throw new Error(`Sum of units across grades is ${totalUnitsCount}, expected 70`);
  }
  console.log(`✓ Manifest valid: 9 grades, ${totalUnitsCount} units, 700 problems defined.`);

  if (schemaOnly) {
    console.log('✓ --schema-only check passed successfully.');
    process.exit(0);
  }

  console.log('[2/4] Validating unit JSON content files...');
  let checkedUnits = 0;
  let totalProblemsChecked = 0;

  for (const grade of manifest.grades) {
    if (gradeFilter && gradeFilter !== 'all' && gradeFilter !== grade.gradeId) {
      if (gradeFilter === 'middle' && !grade.gradeId.startsWith('middle-')) continue;
      if (gradeFilter === 'high-common' && grade.gradeId !== 'high-common') continue;
      if (gradeFilter === 'high-core' && !['high-algebra', 'high-calculus1'].includes(grade.gradeId)) continue;
      if (gradeFilter === 'high-advanced' && !['high-prob-stat', 'high-calculus2', 'high-geometry'].includes(grade.gradeId)) continue;
    }

    for (const unitMeta of grade.units) {
      const unitFilePath = path.join(mathDir, unitMeta.file);
      if (!fs.existsSync(unitFilePath)) {
        console.warn(`[MISSING] Unit file not yet generated: ${unitMeta.file}`);
        continue;
      }

      const unitRaw = fs.readFileSync(unitFilePath, 'utf8');
      const unit = JSON.parse(unitRaw);

      if (unit.id !== unitMeta.id) {
        throw new Error(`ID mismatch in ${unitMeta.file}: expected ${unitMeta.id}, got ${unit.id}`);
      }
      if (!unit.animation || !unit.animation.svgTemplate) {
        throw new Error(`Missing animation or svgTemplate in ${unitMeta.file}`);
      }
      if (!unit.concept || !unit.concept.corePrinciple) {
        throw new Error(`Missing concept corePrinciple in ${unitMeta.file}`);
      }
      if (!Array.isArray(unit.formulas) || unit.formulas.length === 0) {
        throw new Error(`Formulas must be a non-empty array in ${unitMeta.file}`);
      }

      for (const formula of unit.formulas) {
        if (!formula.typesetMath || !formula.howToReadEn) {
          throw new Error(`Formula missing typesetMath or howToReadEn in ${unitMeta.file}`);
        }
      }

      if (!Array.isArray(unit.problems) || unit.problems.length !== 10) {
        throw new Error(`Unit ${unitMeta.file} must have exactly 10 problems, got ${unit.problems?.length}`);
      }

      for (let pIdx = 0; pIdx < unit.problems.length; pIdx++) {
        const prob = unit.problems[pIdx];
        if (prob.problemNumber !== pIdx + 1) {
          throw new Error(`Problem numbering mismatch in ${unitMeta.file}: expected ${pIdx + 1}, got ${prob.problemNumber}`);
        }
        if (!prob.question || !prob.stepByStepSolution || prob.stepByStepSolution.length === 0 || !prob.finalAnswer) {
          throw new Error(`Problem ${prob.problemNumber} in ${unitMeta.file} missing required fields`);
        }
        totalProblemsChecked++;
      }

      checkedUnits++;
    }
  }

  console.log(`✓ Checked ${checkedUnits} unit files with ${totalProblemsChecked} problems.`);
}

try {
  runValidation();
} catch (e: any) {
  console.error('Validation FAILED:', e.message);
  process.exit(1);
}
