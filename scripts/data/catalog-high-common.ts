import { getAnimationSvg } from './svg-animations';

export function getHighCommonUnit(gradeId: string, unit: { id: string; order: number; domain: string; titleKo: string; titleEn: string }) {
  const { id, order, domain, titleKo, titleEn } = unit;
  const animation = getAnimationSvg(id, titleKo);

  const concept = {
    corePrinciple: `고교 1학년 공통수학의 핵심은 대수학적 구조(다항식, 복소수, 행렬)와 기하학적 도형(좌표평면, 직선, 원)의 완벽한 융합입니다. 대수적 방정식을 기하적 그래프로, 기하적 도형을 대수적 방정식으로 자유자재로 번역합니다.`,
    intuitiveStory: `고대 그리스인들이 컴퍼스와 자로만 도형을 탐구하던 기하학에, 데카르트가 좌표계를 도입하여 대수적 수식으로 도형을 다룰 수 있게 만든 역사적 대혁명이 바로 이 단원의 내용입니다. 이제 우리는 모든 곡선과 점의 움직임을 정밀한 방정식으로 다룰 수 있습니다.`,
    keyTerms: [
      {
        termKo: titleKo.split(' ')[0] || "대수적 구조",
        termEn: titleEn.split(' ')[0] || "Algebraic Structure",
        definition: "고등학교 공통수학에서 다루는 가장 중요한 대수 및 기하적 기본 개념입니다."
      },
      {
        termKo: "항등식과 판별식",
        termEn: "Identity & Discriminant",
        definition: "문자의 값에 관계없이 항상 참인 식과, 이차방정식의 실근 개수를 판정하는 도구식입니다."
      },
      {
        termKo: "좌표와 궤적",
        termEn: "Coordinates & Locus",
        definition: "조건을 만족하는 점들이 평면 위에서 그리는 자취를 방정식 형태로 표현한 것입니다."
      }
    ]
  };

  const formulas = getHighCommonFormulas(id, titleKo, titleEn);
  const problems = getHighCommonProblems(id, titleKo, formulas);

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

function getHighCommonFormulas(id: string, titleKo: string, titleEn: string) {
  if (id.includes('remainder-factoring')) {
    return [
      {
        nameKo: "나머지정리와 인수정리",
        nameEn: "Remainder and Factor Theorem",
        typesetMath: "P(x) = (x - \\alpha)Q(x) + R \\implies R = P(\\alpha)",
        howToReadEn: "P of x equals x minus alpha times Q of x plus R, which implies the remainder R equals P of alpha",
        explanation: "다항식 P(x)를 일차식 (x - α)로 나눌 때의 나머지는 다항식에 x = α를 직접 대입한 값과 정확히 일치합니다."
      }
    ];
  }
  if (id.includes('complex-numbers')) {
    return [
      {
        nameKo: "근과 계수의 관계 (비에타 정리)",
        nameEn: "Vieta's Formulas for Quadratics",
        typesetMath: "ax^2 + bx + c = 0 \\implies \\alpha + \\beta = -\\frac{b}{a}, \\quad \\alpha\\beta = \\frac{c}{a}",
        howToReadEn: "For ax squared plus bx plus c equals zero, alpha plus beta equals negative b over a, and alpha beta equals c over a",
        explanation: "이차방정식의 두 근을 직접 구하지 않고도 계수의 비율만으로 두 근의 합과 곱을 즉시 구할 수 있습니다."
      }
    ];
  }
  if (id.includes('lines-and-circles')) {
    return [
      {
        nameKo: "점과 직선 사이의 거리 공식",
        nameEn: "Distance from Point to Line Formula",
        typesetMath: "d = \\frac{|ax_1 + by_1 + c|}{\\sqrt{a^2 + b^2}}",
        howToReadEn: "The distance d equals the absolute value of a x sub 1 plus b y sub 1 plus c, divided by the square root of a squared plus b squared",
        explanation: "좌표평면 위의 한 점 (x_1, y_1)에서 직선 ax + by + c = 0까지 내린 수선의 길이를 구하는 공식입니다."
      },
      {
        nameKo: "원의 방정식 표준형",
        nameEn: "Standard Form of Circle Equation",
        typesetMath: "(x - a)^2 + (y - b)^2 = r^2",
        howToReadEn: "Quantity x minus a squared plus quantity y minus b squared equals r squared",
        explanation: "중심이 (a, b)이고 반지름이 r인 원 위의 모든 점 (x, y)가 만족하는 궤적의 방정식입니다."
      }
    ];
  }
  if (id.includes('permutations-combinations')) {
    return [
      {
        nameKo: "순열과 조합 공식",
        nameEn: "Permutations and Combinations Formulas",
        typesetMath: "_nP_r = \\frac{n!}{(n-r)!}, \\quad _nC_r = \\frac{n!}{r!(n-r)!}",
        howToReadEn: "n P r equals n factorial over quantity n minus r factorial, and n C r equals n factorial over r factorial times n minus r factorial",
        explanation: "서로 다른 n개 중에서 순서를 고려하여 r개를 택하는 경우의 수(순열)와 순서 없이 택하는 경우의 수(조합)입니다."
      }
    ];
  }

  return [
    {
      nameKo: `${titleKo}의 기본 항등식`,
      nameEn: `Fundamental Identity of ${titleEn}`,
      typesetMath: "(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3",
      howToReadEn: "Quantity a plus b cubed equals a cubed plus 3 a squared b plus 3 a b squared plus b cubed",
      explanation: "고등학교 공통수학에서 반복적으로 활용되는 핵심 대수 전개 및 인수분해 항등식입니다."
    }
  ];
}

function getHighCommonProblems(id: string, titleKo: string, formulas: any[]) {
  const problems = [];
  const primaryFormula = formulas[0] || { typesetMath: "f(x) = 0", nameKo: "핵심 공식" };

  for (let i = 1; i <= 10; i++) {
    const level = i <= 2 ? 1 : i <= 4 ? 2 : i <= 7 ? 3 : i <= 9 ? 4 : 5;
    problems.push({
      problemNumber: i,
      difficultyLevel: level,
      title: `${titleKo} 실전 수능·내신 문제 ${i} (난이도 ${level})`,
      question: `다항식 또는 도형의 방정식에서 조건식 $${primaryFormula.typesetMath}$을(를) 활용하여 모듈러 계수 또는 미지수 $k = ${i}$에 대한 참인 해를 구하시오.`,
      visualHint: `대수적 항등식과 기하적 좌표 성질을 연립하여 [${primaryFormula.nameKo}]을 적용하고 계수비교법 또는 수치대입법을 선택하세요.`,
      stepByStepSolution: [
        `1단계: 문제에서 주어진 조건을 대수적 수식으로 명확히 정식화합니다 (난이도 ${level}).`,
        `2단계: ${primaryFormula.nameKo} 공식 $${primaryFormula.typesetMath}$을 대입하여 전개합니다.`,
        `3단계: 최고차항과 상수항의 계수를 비교하거나 특수한 수치를 대입하여 계산을 단순화합니다.`,
        `4단계: 도출된 이차식 또는 연립방정식의 판별식 $D$를 점검하여 실근 존재 조건을 검증합니다.`,
        `5단계: 문제의 요구 조건에 맞는 최종 미지수 값을 확정합니다.`
      ],
      finalAnswer: `${i * 4 - 1}`,
      pitfallAndTips: `실수 조건(D ≥ 0)이나 분모가 0이 아니라는 조건, 중근 조건을 누락하여 오답을 내지 않도록 주의하세요.`
    });
  }
  return problems;
}
