import { getMiddleSchoolUnit } from './data/catalog-middle';
import { getHighCommonUnit } from './data/catalog-high-common';
import { getHighAlgebraCalc1Unit } from './data/catalog-high-algebra-calc1';
import { getHighAdvancedUnit } from './data/catalog-high-advanced';

export function getUnitContent(gradeId: string, unit: { id: string; order: number; domain: string; titleKo: string; titleEn: string; file: string }) {
  if (gradeId.startsWith('middle-')) {
    return getMiddleSchoolUnit(gradeId, unit);
  }
  if (gradeId === 'high-common') {
    return getHighCommonUnit(gradeId, unit);
  }
  if (gradeId === 'high-algebra' || gradeId === 'high-calculus1') {
    return getHighAlgebraCalc1Unit(gradeId, unit);
  }
  return getHighAdvancedUnit(gradeId, unit);
}
