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
  grades: ManifestGrade[];
}

const COURSES_DIR = path.resolve(__dirname, '../courses/k12-math');
const manifestPath = path.join(COURSES_DIR, 'manifest.json');
const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// 유닛별 상세 지식 베이스 사전 정의
// 70개 유닛에 대한 전문 수학 교육 콘텐츠 (수식, 공식, 애니메이션 SVG, 10문제)
import { getUnitContent } from './k12-math-data-catalog';

async function main() {
  console.log('[K12-MATH] Generating comprehensive units for missing units...');
  let createdCount = 0;
  let skippedCount = 0;

  for (const grade of manifest.grades) {
    const gradeDir = path.join(COURSES_DIR, grade.gradeId);
    if (!fs.existsSync(gradeDir)) {
      fs.mkdirSync(gradeDir, { recursive: true });
    }

    for (const unit of grade.units) {
      const filePath = path.join(COURSES_DIR, unit.file);
      if (fs.existsSync(filePath)) {
        // 이미 생성된 파일이면 유효성 검사만 하고 보존
        const stat = fs.statSync(filePath);
        if (stat.size > 500) {
          skippedCount++;
          continue;
        }
      }

      // 콘텐츠 생성
      const unitData = getUnitContent(grade.gradeId, unit);
      fs.writeFileSync(filePath, JSON.stringify(unitData, null, 2), 'utf8');
      createdCount++;
      console.log(`[GENERATED] ${unit.file} (${unit.titleKo})`);
    }
  }

  console.log(`\nDone! Created: ${createdCount}, Preserved/Skipped: ${skippedCount}, Total: ${createdCount + skippedCount}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
