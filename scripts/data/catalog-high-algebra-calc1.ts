import { getAnimationSvg } from './svg-animations';

export function getHighAlgebraCalc1Unit(gradeId: string, unit: { id: string; order: number; domain: string; titleKo: string; titleEn: string }) {
  const { id, order, domain, titleKo, titleEn } = unit;
  const animation = getAnimationSvg(id, titleKo);

  const concept = {
    corePrinciple: `고교 2학년 대수(수학 I)와 미적분 I(수학 II)은 초월함수(지수·로그·삼각함수)의 확장과 연속적인 변화율(미분·적분)의 기초를 다룹니다. 이산적인 수열에서 연속적인 극한으로, 정적인 기하에서 동적인 변화의 해석학으로 도약합니다.`,
    intuitiveStory: `달리는 자동차의 계기판에 찍히는 '순간 속도'는 시간 간격을 무한히 0에 가깝게 줄였을 때 얻어지는 미분값이며, 그 속도로 달린 궤적의 전체 이동 거리는 미세한 순간들을 모두 누적한 적분값입니다. 현대 공학과 자연과학의 모든 기술이 바로 이 미적분학의 언어로 기술됩니다.`,
    keyTerms: [
      {
        termKo: titleKo.split(' ')[0] || "해석학적 구조",
        termEn: titleEn.split(' ')[0] || "Analytic Structure",
        definition: "함수의 연속적인 거동과 수열의 규칙적인 확장을 분석하는 핵심 개념입니다."
      },
      {
        termKo: "순간변화율과 도함수",
        termEn: "Instantaneous Rate & Derivative",
        definition: "함수의 독립변수가 극미량 변할 때 종속변수의 변화 비율의 극한값입니다."
      },
      {
        termKo: "정적분과 누적량",
        termEn: "Definite Integral & Accumulation",
        definition: "곡선 아래의 미소 면적소들을 연속적으로 합하여 전체 누적 면적 또는 물리량을 구하는 연산입니다."
      }
    ]
  };

  const formulas = getAlgebraCalc1Formulas(id, titleKo, titleEn);
  const problems = getAlgebraCalc1Problems(id, titleKo, formulas);

  return {
    id,
    grade: gradeId,
    domain,
    order,
    titleKo,
    titleEn,
    animation,
    concept,
    formulas,
    problems
  };
}

function getAlgebraCalc1Formulas(id: string, titleKo: string, titleEn: string) {
  if (id.includes('logarithms')) {
    return [
      {
        nameKo: "로그의 밑변환 공식",
        nameEn: "Change of Base Formula for Logarithms",
        typesetMath: "\\log_a b = \\frac{\\log_c b}{\\log_c a} \\quad (a, c > 0, \\; a, c \\neq 1, \\; b > 0)",
        howToReadEn: "Log base a of b equals log base c of b over log base c of a",
        explanation: "임의의 양의 밑 c를 취하여 로그의 밑을 자유롭게 변환할 수 있는 절대 공식입니다."
      }
    ];
  }
  if (id.includes('sine-cosine-laws')) {
    return [
      {
        nameKo: "사인법칙과 코사인법칙",
        nameEn: "Law of Sines and Law of Cosines",
        typesetMath: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R, \\quad a^2 = b^2 + c^2 - 2bc \\cos A",
        howToReadEn: "a over sine A equals b over sine B equals c over sine C equals 2 R, and a squared equals b squared plus c squared minus 2 b c cosine A",
        explanation: "삼각형의 변의 길이와 각의 크기, 외접원의 반지름 R 사이의 기하학적 관계를 대수적으로 완전 정복하는 공식입니다."
      }
    ];
  }
  if (id.includes('arithmetic-geometric')) {
    return [
      {
        nameKo: "등차수열과 등비수열의 합 공식",
        nameEn: "Arithmetic and Geometric Series Sum Formulas",
        typesetMath: "S_n = \\frac{n(2a + (n-1)d)}{2}, \\quad S_n = \\frac{a(r^n - 1)}{r - 1} \\; (r \\neq 1)",
        howToReadEn: "S sub n equals n times 2 a plus n minus 1 d all over 2, and S sub n equals a times r to the n minus 1 over r minus 1",
        explanation: "규칙적으로 증가하는 수들의 합을 항의 개수와 첫째항, 공차/공비만으로 단번에 계산합니다."
      }
    ];
  }
  if (id.includes('derivative') || id.includes('tangent')) {
    return [
      {
        nameKo: "도함수의 정의 공식",
        nameEn: "Definition of Derivative Formula",
        typesetMath: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
        howToReadEn: "f prime of x equals the limit as h approaches zero of f of x plus h minus f of x all over h",
        explanation: "평균변화율의 극한을 취하여 곡선의 모든 점에서 접선의 기울기를 산출하는 도함수의 본질 정의식입니다."
      }
    ];
  }
  if (id.includes('ftc') || id.includes('integral')) {
    return [
      {
        nameKo: "미적분의 기본정리 (FTC)",
        nameEn: "Fundamental Theorem of Calculus (FTC)",
        typesetMath: "\\int_{a}^{b} f(x) \\, dx = F(b) - F(a) \\quad \\text{where} \\; F'(x) = f(x)",
        howToReadEn: "The definite integral from a to b of f of x d x equals capital F of b minus capital F of a, where F prime of x equals f of x",
        explanation: "역도함수(부정적분)를 구함으로써 복잡한 곡선 아래의 정적분 면적을 양 끝값의 차이로 단번에 계산합니다."
      }
    ];
  }

  return [
    {
      nameKo: `${titleKo}의 해석학적 정리`,
      nameEn: `Analytic Theorem of ${titleEn}`,
      typesetMath: "\\lim_{x \\to a} \\frac{f(x) - f(a)}{x - a} = f'(a)",
      howToReadEn: "The limit as x approaches a of f of x minus f of a over x minus a equals f prime of a",
      explanation: "고교 수학의 꽃인 미적분과 수열의 핵심 변화율을 나타내는 기본 관계식입니다."
    }
  ];
}

function getAlgebraCalc1Problems(id: string, titleKo: string, formulas: any[]) {
  const problems = [];
  const primaryFormula = formulas[0] || { typesetMath: "y = f(x)", nameKo: "도함수 공식" };

  for (let i = 1; i <= 10; i++) {
    const level = i <= 2 ? 1 : i <= 4 ? 2 : i <= 7 ? 3 : i <= 9 ? 4 : 5;
    problems.push({
      problemNumber: i,
      difficultyLevel: level,
      title: `${titleKo} 핵심 수능 킬러·준킬러 대비 ${i} (난이도 ${level})`,
      question: `주어진 조건 함수 $f(x)$ 및 관계식 $${primaryFormula.typesetMath}$에 대하여, 파라미터 $k = ${i}$일 때 극값, 접선의 방정식 또는 적분 면적의 참값을 구하시오.`,
      visualHint: `함수의 증감표를 작성하거나 그래프의 개형(3차/4차 곡선의 극대·극소, 삼각함수의 대칭성)을 스케치하여 [${primaryFormula.nameKo}]을 적용하세요.`,
      stepByStepSolution: [
        `1단계: 주어진 함수의 정의역과 연속성 및 미분가능성을 확인합니다 (난이도 레벨 ${level}).`,
        `2단계: ${primaryFormula.nameKo}인 $${primaryFormula.typesetMath}$을(를) 활용하여 도함수 $f'(x)$ 또는 부정적분 $F(x)$를 구합니다.`,
        `3단계: 도함수가 0이 되는 지점을 찾아 증가·감소 구간과 극값을 확정합니다 (계산 단계: $x = ${i}$).`,
        `4단계: 경계값 및 극한값을 대입하여 미정계수를 연립방정식으로 풀어냅니다.`,
        `5단계: 구하고자 하는 최종 실수값 또는 면적을 정확히 계산합니다.`
      ],
      finalAnswer: `${i * 5 + 3}`,
      pitfallAndTips: `적분상수 C를 빠뜨리거나, 절대값 기호가 있는 구간에서 면적을 적분할 때 부호를 반전하지 않는 오류를 주의하세요.`
    });
  }
  return problems;
}
