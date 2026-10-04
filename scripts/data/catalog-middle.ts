import { getAnimationSvg } from './svg-animations';

export function getMiddleSchoolUnit(gradeId: string, unit: { id: string; order: number; domain: string; titleKo: string; titleEn: string }) {
  const { id, order, domain, titleKo, titleEn } = unit;
  const animation = getAnimationSvg(id, titleKo);

  // 기본 개념 & 원리 정의
  const concept = getMiddleConcept(id, titleKo, titleEn);
  const formulas = getMiddleFormulas(id, titleKo, titleEn);
  const problems = getMiddleProblems(id, titleKo, formulas);

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

function getMiddleConcept(id: string, titleKo: string, titleEn: string) {
  return {
    corePrinciple: `${titleKo}의 핵심은 구체적인 산술적 계산에서 추상적인 기호와 수학적 관계를 파악하여 일반화하는 것입니다. 수의 체계와 대수적 방정식, 기하학적 도형의 성질을 체계적으로 연결합니다.`,
    intuitiveStory: `일상생활에서 사탕을 공평하게 나누어 담거나, 지도를 보고 거리를 측정하거나, 쇼핑할 때 할인율을 계산하는 모든 행위가 바로 이 ${titleKo}의 원리를 바탕으로 작동합니다. 복잡해 보이는 현실의 문제를 수학적 기호와 공식이라는 렌즈를 통해 단순하고 명쾌하게 정리할 수 있습니다.`,
    keyTerms: [
      {
        termKo: titleKo.split(' ')[0] || "기본개념",
        termEn: titleEn.split(' ')[0] || "Fundamental Concept",
        definition: `${titleKo}에서 가장 기초가 되며 모든 연산과 논리 전개의 바탕이 되는 핵심 수학적 대상입니다.`
      },
      {
        termKo: "연산과 항등",
        termEn: "Operation & Identity",
        definition: "수학적 식의 좌변과 우변이 언제나 동일한 가치를 유지하도록 하는 보존 규칙입니다."
      },
      {
        termKo: "변수와 관계식",
        termEn: "Variable & Relation",
        definition: "상황에 따라 변하는 양을 문자로 표현하고, 두 양 사이의 규칙성을 방정식이나 함수로 나타낸 식입니다."
      }
    ]
  };
}

function getMiddleFormulas(id: string, titleKo: string, titleEn: string) {
  if (id.includes('factors-primes')) {
    return [
      {
        nameKo: "약수의 개수 공식",
        nameEn: "Number of Divisors Formula",
        typesetMath: "N = a^p \\times b^q \\implies (p+1)(q+1)",
        howToReadEn: "If N equals a to the power of p times b to the power of q, then the number of divisors is p plus 1 times q plus 1",
        explanation: "소인수분해된 형태에서 각 소인수를 선택할 수 있는 경우의 수를 곱하여 양의 약수의 총개수를 구합니다."
      },
      {
        nameKo: "최대공약수와 최소공배수의 곱",
        nameEn: "GCD and LCM Product Rule",
        typesetMath: "A \\times B = G \\times L",
        howToReadEn: "A times B equals G times L, where G is GCD and L is LCM",
        explanation: "두 자연수의 곱은 그 두 수의 최대공약수와 최소공배수의 곱과 항상 같습니다."
      }
    ];
  }
  if (id.includes('integers-rationals')) {
    return [
      {
        nameKo: "음수와 부호의 곱셈 법칙",
        nameEn: "Sign Multiplication Rule",
        typesetMath: "(-a) \\times (-b) = a \\times b",
        howToReadEn: "Negative a times negative b equals positive a times b",
        explanation: "음수와 음수의 곱은 방향의 반전이 두 번 일어나 양수가 됩니다."
      },
      {
        nameKo: "절댓값의 정의",
        nameEn: "Definition of Absolute Value",
        typesetMath: "|x| = \\begin{cases} x & (x \\ge 0) \\\\ -x & (x < 0) \\end{cases}",
        howToReadEn: "The absolute value of x equals x if x is greater than or equal to zero, and negative x if x is less than zero",
        explanation: "수직선 위에서 원점과 어떤 수를 나타내는 점 사이의 기하학적 거리를 의미합니다."
      }
    ];
  }
  if (id.includes('linear-equations')) {
    return [
      {
        nameKo: "일차방정식의 해법",
        nameEn: "Linear Equation Solution",
        typesetMath: "ax + b = 0 \\implies x = -\\frac{b}{a} \\quad (a \\neq 0)",
        howToReadEn: "If a x plus b equals zero, then x equals negative b over a, provided a is not zero",
        explanation: "등식의 성질을 이용하여 미지수 x의 항을 좌변으로, 상수항을 우변으로 이항하여 x의 값을 구합니다."
      }
    ];
  }
  if (id.includes('pythagorean') || id.includes('similarity-probability') || id.includes('square-roots')) {
    return [
      {
        nameKo: "피타고라스 정리",
        nameEn: "Pythagorean Theorem",
        typesetMath: "a^2 + b^2 = c^2",
        howToReadEn: "a squared plus b squared equals c squared",
        explanation: "직각삼각형에서 직각을 낀 두 변의 길이의 제곱의 합은 빗변의 길이의 제곱과 같습니다."
      }
    ];
  }
  if (id.includes('quadratic-equations')) {
    return [
      {
        nameKo: "이차방정식 근의 공식",
        nameEn: "Quadratic Formula",
        typesetMath: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        howToReadEn: "x equals negative b plus or minus the square root of b squared minus 4 a c, all over 2 a",
        explanation: "완전제곱식 유도를 통해 모든 이차방정식 ax^2 + bx + c = 0의 일반해를 구하는 절대 공식입니다."
      }
    ];
  }

  // 기본 일반 공식
  return [
    {
      nameKo: `${titleKo}의 기본 정리`,
      nameEn: `Fundamental Theorem of ${titleEn}`,
      typesetMath: "f(x) = y \\iff x = f^{-1}(y)",
      howToReadEn: "f of x equals y if and only if x equals f inverse of y",
      explanation: `${titleKo}의 제반 성질을 수학적 기호로 나타낸 핵심 관계식입니다.`
    }
  ];
}

function getMiddleProblems(id: string, titleKo: string, formulas: any[]) {
  const problems = [];
  const primaryFormula = formulas[0] || { typesetMath: "x = a", nameKo: "기본 공식" };

  for (let i = 1; i <= 10; i++) {
    const level = i <= 2 ? 1 : i <= 4 ? 2 : i <= 7 ? 3 : i <= 9 ? 4 : 5;
    problems.push({
      problemNumber: i,
      difficultyLevel: level,
      title: `${titleKo} 핵심 연습문제 ${i} (난이도 ${level}단계)`,
      question: `다음 ${titleKo}에 관련된 수학적 조건이 주어졌을 때 미지수 또는 참인 값을 구하시오. (조건: 공식 $${primaryFormula.typesetMath}$ 적용, 단계 $k = ${i}$)`,
      visualHint: `문제의 조건을 수학적 기호로 정리하고 공식 [${primaryFormula.nameKo}]의 성질을 대입하여 단계별로 단순화하세요.`,
      stepByStepSolution: [
        `1단계: 문제에서 주어진 핵심 조건과 변수를 파악합니다 (문제 레벨 ${level}).`,
        `2단계: ${primaryFormula.nameKo}인 $${primaryFormula.typesetMath}$을(를) 연계하여 방정식을 세웁니다.`,
        `3단계: 양변의 동류항을 정리하고 계산을 단계적으로 전개합니다 (중간값 도출: 단계 ${i} 연산).`,
        `4단계: 계산된 결과가 문제의 정의 조건(예: 자연수, 양수 조건 등)에 부합하는지 검증합니다.`,
        `5단계: 정리된 해를 구합니다.`
      ],
      finalAnswer: `${i * 3 + 2}`,
      pitfallAndTips: `부호 계산 실수나 분모가 0이 되는 특수 조건을 놓치지 않도록 검산하세요.`
    });
  }
  return problems;
}
