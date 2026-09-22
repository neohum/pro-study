/**
 * scripts/build-curriculum.js
 * 15개 전체 단원 (중1, 중2, 중3, 고등, 대학) 커리큘럼 데이터셋 병합 및 빌드 스크립트
 */

const fs = require('fs');
const path = require('path');

const s1 = require('./curriculum/stage1_middle.js');
const s2 = require('./curriculum/stage2_middle2.js');
const s3 = require('./curriculum/stage3_middle3.js');
const s4 = require('./curriculum/stage4_high.js');
const s5 = require('./curriculum/stage5_college.js');

const allLessons = [...s1, ...s2, ...s3, ...s4, ...s5];

const dest = path.join(__dirname, '..', 'courses', 'math-cs', 'lessons.json');
fs.writeFileSync(dest, JSON.stringify(allLessons, null, 2), 'utf-8');

console.log(`[완료] 총 ${allLessons.length}개 전체 대한민국 수학 교과과정 상세 레슨 빌드 성공! -> ${dest}`);
