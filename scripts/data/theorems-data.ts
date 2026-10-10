import * as fs from 'fs';
import * as path from 'path';

const outDir = path.resolve(__dirname, '..', '..', 'courses', 'math-symbols', 'theorems');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

export const theorems = [
  {
    id: "pythagorean",
    order: 1,
    domain: "기하학 및 대수학",
    titleKo: "피타고라스 정리 (Pythagorean Theorem)",
    titleEn: "Pythagorean Theorem",
    statement: {
      typesetMath: "a^2 + b^2 = c^2",
      explanationKo: "직각삼각형에서 빗변의 길이의 제곱은 다른 두 변의 길이의 제곱의 합과 같다.",
      explanationEn: "In any right triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides."
    },
    historicalSignificance: "고대 바빌로니아와 인도에서도 경험적으로 알려졌으나, 기원전 6세기 피타고라스 학파와 기원전 3세기 유클리드 '원론' 제1권 명제 47에서 연역적으로 완전 증명됨으로써 연역 기하학의 초석이 됨.",
    prerequisites: ["유클리드 평면 기하 공리", "삼각형의 넓이", "곱셈 공식 $(a+b)^2$"],
    intuitiveIdea: "한 변의 길이가 (a+b)인 정사각형 안에 4개의 합동인 직각삼각형을 배치하면, 중앙에 남는 정사각형의 넓이는 빗변 c의 제곱이 되며 전체 면적 비교를 통해 $a^2 + b^2 = c^2$이 자연스럽게 유도됨.",
    rigorousProof: {
      proofType: "대수적 면적 분할 증명 (Algebraic Area Partition)",
      assumptions: ["직각을 낀 두 변의 길이가 a, b이고 빗변의 길이가 c인 직각삼각형 ABC"],
      steps: [
        {
          stepNumber: 1,
          title: "외접 정사각형 구성",
          explanation: "한 변의 길이가 $(a + b)$인 큰 정사각형을 구성하고, 네 모퉁이에 밑변 a, 높이 b인 합동 직각삼각형 4개를 시계 방향으로 배치한다.",
          typesetMath: "S_{\\text{total}} = (a + b)^2",
          justification: "정사각형의 넓이 정의: 한 변의 길이의 제곱"
        },
        {
          stepNumber: 2,
          title: "내부 사각형의 형태 규명",
          explanation: "네 모퉁이 직각삼각형의 두 예각의 합은 $90^\\circ$이므로, 내부 사각형의 각 꼭짓점 각도는 $180^\\circ - 90^\\circ = 90^\\circ$이다. 또한 네 변의 길이는 모두 직각삼각형의 빗변 c로 같으므로 내부는 한 변이 c인 정사각형이다.",
          typesetMath: "S_{\\text{inner}} = c^2",
          justification: "네 각이 모두 직각이고 네 변의 길이가 같은 사각형은 정사각형임"
        },
        {
          stepNumber: 3,
          title: "4개 직각삼각형의 넓이 총합",
          explanation: "밑변 a, 높이 b인 직각삼각형 하나의 넓이는 $\\frac{1}{2}ab$이며, 4개의 총넓이는 다음과 같다.",
          typesetMath: "4 \\times \\left(\\frac{1}{2}ab\\right) = 2ab",
          justification: "직각삼각형 면적 공식"
        },
        {
          stepNumber: 4,
          title: "전체 면적 등식 수립 및 전개",
          explanation: "큰 정사각형의 넓이는 내부 정사각형 넓이와 4개 직각삼각형 넓이의 합과 정확히 일치한다.",
          typesetMath: "(a + b)^2 = c^2 + 2ab \\implies a^2 + 2ab + b^2 = c^2 + 2ab",
          justification: "면적의 가법성 공리 및 다항식 전개"
        },
        {
          stepNumber: 5,
          title: "양변 소거 및 결론 도출",
          explanation: "양변에서 공통항 $2ab$를 감산하면 증명이 완성된다.",
          typesetMath: "a^2 + b^2 = c^2",
          justification: "등식의 덧셈 역원 소거법칙"
        }
      ],
      conclusion: "임의의 평면 직각삼각형에 대하여 두 직각변의 제곱의 합은 항상 빗변의 제곱과 일치한다 (Q.E.D.)."
    },
    corollariesAndApplications: [
      {
        title: "유클리드 거리 공식",
        typesetMath: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
        description: "데카르트 좌표계에서 두 점 사이의 거리를 계산하는 기저 공식"
      },
      {
        title: "삼각함수 기본 항등식",
        typesetMath: "\\sin^2\\theta + \\cos^2\\theta = 1",
        description: "단위원 상에서 빗변 c=1일 때의 피타고라스 정리의 삼각함수적 표현"
      }
    ]
  },
  {
    id: "primes-infinitude",
    order: 2,
    domain: "정수론",
    titleKo: "소수의 무한성 정리 (Euclid's Theorem on Primes)",
    titleEn: "Infinitude of Primes",
    statement: {
      typesetMath: "|\\mathbb{P}| = \\infty",
      explanationKo: "소수(Prime numbers)의 집합은 무한하다.",
      explanationEn: "There are infinitely many prime numbers."
    },
    historicalSignificance: "기원전 300년경 유클리드가 저서 '원론' 제9권 명제 20에서 제시한 가장 우아하고 고전적인 귀류법(Reductio ad absurdum) 증명.",
    prerequisites: ["소수의 정의", "산술의 기본정리 (1보다 큰 모든 자연수는 소인수를 가짐)"],
    intuitiveIdea: "만약 소수가 유한개뿐이라면 그 모든 소수를 곱한 뒤 1을 더한 거대한 수 N을 만들 수 있는데, N은 기존의 어떤 소수로 나누어도 나머지가 1이 되므로 기존 목록에 없는 새로운 소수를 소인수로 가져야 하므로 모순임.",
    rigorousProof: {
      proofType: "귀류법 (Proof by Contradiction)",
      assumptions: ["소수가 유한개만 존재한다고 가정하고, 그 전체 소수 집합을 S = {p_1, p_2, ..., p_k}라 하자."],
      steps: [
        {
          stepNumber: 1,
          title: "유한 목록의 모든 소수의 곱에 1을 더한 수 구성",
          explanation: "알려진 모든 소수 $p_1, p_2, \\dots, p_k$의 총곱에 1을 더한 정수 N을 정의한다.",
          typesetMath: "N = (p_1 p_2 \\cdots p_k) + 1",
          justification: "유한 집합의 곱 및 정수 덧셈의 유효성"
        },
        {
          stepNumber: 2,
          title: "N의 소인수 존재성",
          explanation: "$N > 1$이므로 산술의 기본정리에 의해 N은 적어도 하나의 소수 q를 약수로 가져야 한다.",
          typesetMath: "\\exists q \\in \\mathbb{P} \\text{ s.t. } q \\mid N",
          justification: "1보다 큰 모든 정수는 적어도 하나의 소인수를 갖는다는 정리"
        },
        {
          stepNumber: 3,
          title: "q가 기존 소수 목록에 속한다고 가정 시 모순 유도",
          explanation: "만약 $q \\in S$라면 $q$는 $p_1, \\dots, p_k$ 중 하나이다. 따라서 $q \\mid (p_1 p_2 \\cdots p_k)$이다.",
          typesetMath: "q \\mid N \\quad \\text{and} \\quad q \\mid (p_1 p_2 \\cdots p_k)",
          justification: "가정 $S$의 완전성에 기인한 소속성"
        },
        {
          stepNumber: 4,
          title: "나머지 1의 분할 불가능성 도출",
          explanation: "$q$가 $N$과 $(p_1 \\cdots p_k)$를 모두 나눈다면, 두 수의 차이인 1도 나누어야 한다.",
          typesetMath: "q \\mid [N - (p_1 p_2 \\cdots p_k)] \\implies q \\mid 1",
          justification: "나눗셈의 선형 결합 성질: $q|A \\land q|B \\implies q|(A - B)$"
        },
        {
          stepNumber: 5,
          title: "모순 도출 및 결론",
          explanation: "소수 $q \\ge 2$이므로 $q \\mid 1$은 불가능하다. 이는 $q$가 기존 목록 $S$에 포함될 수 없음을 의미한다.",
          typesetMath: "q \\notin \\{p_1, p_2, \\dots, p_k\\} \\implies \\text{Contradiction}",
          justification: "소수가 유한하다는 가정이 모순을 초래함"
        }
      ],
      conclusion: "따라서 소수의 개수는 유한할 수 없으며 무한히 존재한다 (Q.E.D.)."
    },
    corollariesAndApplications: [
      {
        title: "소수 정리 (Prime Number Theorem)",
        typesetMath: "\\pi(x) \\sim \\frac{x}{\\ln x}",
        description: "x 이하의 소수 개수 함수의 점근적 분포 법칙"
      }
    ]
  },
  {
    id: "sqrt2-irrational",
    order: 3,
    domain: "수 체계 및 정수론",
    titleKo: "√2의 무리수성 증명 (Irrationality of √2)",
    titleEn: "Irrationality of Square Root of 2",
    statement: {
      typesetMath: "\\sqrt{2} \\notin \\mathbb{Q}",
      explanationKo: "2의 제곱근은 유리수가 아니며, 기약분수 형태로 나타낼 수 없는 무리수이다.",
      explanationEn: "The square root of 2 is an irrational number and cannot be expressed as a ratio of two integers."
    },
    historicalSignificance: "고대 피타고라스 학파의 히파소스(Hippasus)가 발견한 수학사 최초의 무리수 존재 증명으로, 모든 양은 정수의 비로 표현된다는 피타고라스 우주관을 뒤흔든 제1차 수학 기초론 위기의 발단.",
    prerequisites: ["유리수의 정의 (두 정수의 기약분수)", "정수의 홀짝성 (偶奇性)"],
    intuitiveIdea: "루트 2를 서로소인 기약분수 p/q로 놓으면 2q^2 = p^2이 되어 p가 짝수여야 하고, p를 2k로 치환하면 q 역시 짝수가 되어 처음 가정한 기약분수(서로소) 조건에 모순이 발생함.",
    rigorousProof: {
      proofType: "기약분수 귀류법 (Proof by Contradiction via Coprime Fractions)",
      assumptions: ["√2가 유리수라고 가정하자: √2 = p/q (단, p, q는 서로소인 자연수, gcd(p, q) = 1)"],
      steps: [
        {
          stepNumber: 1,
          title: "유리수 가정 및 양변 제곱",
          explanation: "가정에 따라 양변을 제곱하여 분모 $q^2$를 곱한다.",
          typesetMath: "\\sqrt{2} = \\frac{p}{q} \\implies 2 = \\frac{p^2}{q^2} \\implies p^2 = 2q^2",
          justification: "등식의 양변 제곱 및 정수 정돈"
        },
        {
          stepNumber: 2,
          title: "p의 짝수성 규명",
          explanation: "$p^2 = 2q^2$이므로 $p^2$은 2의 배수(짝수)이다. 정수의 제곱이 짝수이면 원래 정수도 짝수이어야 하므로 $p$는 짝수이다.",
          typesetMath: "p^2 \\equiv 0 \\pmod 2 \\implies p = 2k \\quad (k \\in \\mathbb{Z})",
          justification: "홀수의 제곱은 홀수이므로 대우명제에 의해 짝수의 성질 성립"
        },
        {
          stepNumber: 3,
          title: "p 대입 및 q^2 표현",
          explanation: "$p = 2k$를 원래 식 $p^2 = 2q^2$에 대입한다.",
          typesetMath: "(2k)^2 = 2q^2 \\implies 4k^2 = 2q^2 \\implies q^2 = 2k^2",
          justification: "대수적 치환 및 양변을 2로 나눔"
        },
        {
          stepNumber: 4,
          title: "q의 짝수성 규명",
          explanation: "$q^2 = 2k^2$이므로 동일한 논리에 의해 $q^2$도 짝수이며, 따라서 $q$ 역시 짝수이다.",
          typesetMath: "q^2 \\equiv 0 \\pmod 2 \\implies q \\text{ is even} \\implies 2 \\mid q",
          justification: "짝수의 정의"
        },
        {
          stepNumber: 5,
          title: "기약분수 조건과의 모순 도출",
          explanation: "$p$와 $q$가 둘 다 짝수이므로 2를 공약수로 갖는다. 이는 최초의 가정 $\\gcd(p, q) = 1$ (서로소)과 모순이다.",
          typesetMath: "2 \\mid p \\land 2 \\mid q \\implies \\gcd(p, q) \\ge 2 \\quad (\\text{Contradiction with } \\gcd(p,q)=1)",
          justification: "기약분수 공리의 위배"
        }
      ],
      conclusion: "따라서 $\\sqrt{2}$를 분수로 나타낼 수 없으므로 무리수이다 (Q.E.D.)."
    },
    corollariesAndApplications: [
      {
        title: "실수 체계의 완비성",
        typesetMath: "\\mathbb{R} = \\mathbb{Q} \\cup \\mathbb{I}",
        description: "유리수 집합의 조밀성 구멍을 메우는 데데킨트 절단과 완비 순서체 이론의 발전 촉발"
      }
    ]
  },
  {
    id: "fundamental-calculus",
    order: 4,
    domain: "해석학 및 미적분학",
    titleKo: "미적분학의 기본정리 (Fundamental Theorem of Calculus)",
    titleEn: "Fundamental Theorem of Calculus (FTC)",
    statement: {
      typesetMath: "\\frac{d}{dx}\\int_a^x f(t) \\, dt = f(x), \\quad \\int_a^b f(x) \\, dx = F(b) - F(a)",
      explanationKo: "미분과 적분은 상호 역연산 관계이며, 연속함수의 정적분은 역도함수의 양 끝점 함숫값 차이로 계산할 수 있다.",
      explanationEn: "Differentiation and integration are inverse operations, and the definite integral can be evaluated using antiderivatives."
    },
    historicalSignificance: "17세기 뉴턴과 라이프니츠가 독립적으로 기하학적 접선 문제(미분)와 면적 문제(적분)가 본질적으로 하나의 연산의 역과정임을 규명한 인류 과학사 최고의 발견.",
    prerequisites: ["함수의 연속성", "적분의 평균값 정리 (MVT for Integrals)", "도함수의 극한 정의"],
    intuitiveIdea: "정적분 함수 A(x)는 면적의 누적 함수인데, x를 dx만큼 미세하게 늘릴 때 추가되는 얇은 직사각형의 면적 dA는 높이 f(x) 곱하기 밑변 dx가 되므로 dA/dx = f(x)가 됨.",
    rigorousProof: {
      proofType: "해석학적 극한 및 적분 평균값 정리 증명 (Analytical FTC 1 Proof)",
      assumptions: ["구간 [a, b]에서 연속인 실함수 f", "면적 누적 함수 g(x) = \\int_a^x f(t) dt"],
      steps: [
        {
          stepNumber: 1,
          title: "누적 함수의 미분계수 극한식 수립",
          explanation: "도함수의 극한 정의에 따라 $g'(x)$를 수립한다.",
          typesetMath: "g'(x) = \\lim_{h \\to 0} \\frac{g(x+h) - g(x)}{h} = \\lim_{h \\to 0} \\frac{1}{h} \\left( \\int_a^{x+h} f(t)\\,dt - \\int_a^x f(t)\\,dt \\right)",
          justification: "도함수 정의"
        },
        {
          stepNumber: 2,
          title: "정적분의 구간 분할 성질 적용",
          explanation: "적분의 구간 결합 성질 $\\int_a^{x+h} - \\int_a^x = \\int_x^{x+h}$을 적용한다.",
          typesetMath: "g'(x) = \\lim_{h \\to 0} \\frac{1}{h} \\int_x^{x+h} f(t) \\, dt",
          justification: "적분 구간의 가법성"
        },
        {
          stepNumber: 3,
          title: "적분의 평균값 정리(MVT) 적용",
          explanation: "$f$가 연속이므로 적분의 평균값 정리에 의해 $x$와 $x+h$ 사이에 $c_h$가 존재하여 적분값을 직사각형으로 바꿀 수 있다.",
          typesetMath: "\\frac{1}{h} \\int_x^{x+h} f(t) \\, dt = f(c_h) \\quad (c_h \\in [x, x+h])",
          justification: "적분의 평균값 정리"
        },
        {
          stepNumber: 4,
          title: "h가 0으로 갈 때의 극한 및 연속성 적용",
          explanation: "$h \\to 0$일 때 샌드위치 정리에 의해 $c_h \\to x$이며, $f$가 연속이므로 $f(c_h) \\to f(x)$이다.",
          typesetMath: "g'(x) = \\lim_{h \\to 0} f(c_h) = f\\left(\\lim_{h \\to 0} c_h\\right) = f(x)",
          justification: "연속함수의 성질: 극한과 함수 기호 교환 가능"
        }
      ],
      conclusion: "따라서 $\\frac{d}{dx}\\int_a^x f(t)dt = f(x)$가 엄밀히 성립한다 (Q.E.D.)."
    },
    corollariesAndApplications: [
      {
        title: "정적분 계산 기본 공식",
        typesetMath: "\\int_a^b f(x) \\, dx = [F(x)]_a^b = F(b) - F(a)",
        description: "구분구적법의 극한 계산 없이 부정적분만으로 정적분을 즉시 계산 가능"
      }
    ]
  },
  {
    id: "euler-identity",
    order: 5,
    domain: "복소해석학 및 대수학",
    titleKo: "오일러 공식 및 항등식 (Euler's Formula and Identity)",
    titleEn: "Euler's Formula and Identity",
    statement: {
      typesetMath: "e^{i\\theta} = \\cos\\theta + i\\sin\\theta, \\quad e^{i\\pi} + 1 = 0",
      explanationKo: "지수함수와 삼각함수는 복소평면 상에서 하나로 통합되며, 수학의 5대 상수(e, i, π, 1, 0)가 완벽한 조화를 이룬다.",
      explanationEn: "Complex exponential functions unify with trigonometric functions, relating the fundamental constants e, i, pi, 1, and 0."
    },
    historicalSignificance: "1748년 레온하르트 오일러가 '무한 해석 개론'에서 발표하였으며, 리처드 파인만이 '수학에서 가장 주목할 만한 공식이자 보석'이라 칭송함.",
    prerequisites: ["테일러 급수 (Maclaurin Series)", "허수 단위 i (i^2 = -1)의 거듭제곱 주기성"],
    intuitiveIdea: "실수 거듭제곱 급수 e^x에 순허수 iθ를 대입하면, i의 거듭제곱 순환(1, i, -1, -i)에 의해 실수부 항들은 정확히 cosθ의 테일러 급수가 되고 허수부 항들은 sinθ의 테일러 급수가 됨.",
    rigorousProof: {
      proofType: "테일러(매클로린) 급수 전개 대조 증명 (Taylor Series Expansion)",
      assumptions: ["지수함수, 코사인, 사인 함수의 무한 급수 수렴성"],
      steps: [
        {
          stepNumber: 1,
          title: "지수함수 e^z의 매클로린 급수 정의",
          explanation: "복소 지수함수의 절대수렴하는 테일러 급수를 전개한다.",
          typesetMath: "e^z = \\sum_{n=0}^\\infty \\frac{z^n}{n!} = 1 + z + \\frac{z^2}{2!} + \\frac{z^3}{3!} + \\frac{z^4}{4!} + \\frac{z^5}{5!} + \\cdots",
          justification: "지수함수의 해석적 확장 정의"
        },
        {
          stepNumber: 2,
          title: "z = iθ 대입 및 i의 거듭제곱 정리",
          explanation: "$z = i\\theta$를 대입하고 $i^2 = -1, i^3 = -i, i^4 = 1$의 주기를 적용한다.",
          typesetMath: "e^{i\\theta} = 1 + i\\theta + \\frac{(i\\theta)^2}{2!} + \\frac{(i\\theta)^3}{3!} + \\frac{(i\\theta)^4}{4!} + \\frac{(i\\theta)^5}{5!} + \\cdots",
          justification: "허수 단위의 대수적 거듭제곱"
        },
        {
          stepNumber: 3,
          title: "실수부와 허수부 항의 분리 재배열",
          explanation: "급수가 절대수렴하므로 실수부(짝수 항)와 허수부(홀수 항)로 순서를 재배열한다.",
          typesetMath: "e^{i\\theta} = \\left(1 - \\frac{\\theta^2}{2!} + \\frac{\\theta^4}{4!} - \\cdots\\right) + i \\left(\\theta - \\frac{\\theta^3}{3!} + \\frac{\\theta^5}{5!} - \\cdots\\right)",
          justification: "절대수렴 급수의 무조건 수렴 및 재배열 정리"
        },
        {
          stepNumber: 4,
          title: "삼각함수 테일러 급수와의 일치 판정",
          explanation: "앞 괄호는 $\\cos\\theta$의 정의 급수이고 뒤 괄호는 $\\sin\\theta$의 정의 급수이다.",
          typesetMath: "\\cos\\theta = \\sum_{k=0}^\\infty \\frac{(-1)^k \\theta^{2k}}{(2k)!}, \\quad \\sin\\theta = \\sum_{k=0}^\\infty \\frac{(-1)^k \\theta^{2k+1}}{(2k+1)!}",
          justification: "코사인 및 사인 함수의 매클로린 급수 정의"
        },
        {
          stepNumber: 5,
          title: "오일러 항등식 도출",
          explanation: "$\\theta = \\pi$를 대입하면 $\\cos\\pi = -1, \\sin\\pi = 0$이므로 가장 아름다운 등식이 도출된다.",
          typesetMath: "e^{i\\pi} = -1 + 0i \\implies e^{i\\pi} + 1 = 0",
          justification: "특수각 세타 = 파이 대입"
        }
      ],
      conclusion: "복소 지수함수와 삼각함수의 대수적 동등성이 증명되었다 (Q.E.D.)."
    },
    corollariesAndApplications: [
      {
        title: "드무아브르 정리",
        typesetMath: "(\\cos\\theta + i\\sin\\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)",
        description: "복소수의 n제곱 회전 계산 공식"
      },
      {
        title: "전기전자 페이저(Phasor) 이론",
        typesetMath: "v(t) = V_m \\cos(\\omega t + \\phi) = \\operatorname{Re}\\{V_m e^{j\\phi} e^{j\\omega t}\\}",
        description: "교류 회로 해석의 핵심 복소 페이저 표현의 이론적 기반"
      }
    ]
  },
  {
    id: "cauchy-schwarz",
    order: 6,
    domain: "선형대수학 및 해석학",
    titleKo: "코시-슈바르츠 부등식 (Cauchy-Schwarz Inequality)",
    titleEn: "Cauchy-Schwarz Inequality",
    statement: {
      typesetMath: "|\\langle \\mathbf{u}, \\mathbf{v} \\rangle|^2 \\le \\langle \\mathbf{u}, \\mathbf{u} \\rangle \\langle \\mathbf{v}, \\mathbf{v} \\rangle, \\quad \\left(\\sum_{i=1}^n a_i b_i\\right)^2 \\le \\left(\\sum_{i=1}^n a_i^2\\right) \\left(\\sum_{i=1}^n b_i^2\\right)",
      explanationKo: "두 벡터의 내적의 절댓값 제곱은 각 벡터의 노름 제곱의 곱 이하이며, 등호는 두 벡터가 일차종속(평행)할 때 성립한다.",
      explanationEn: "The absolute square of the inner product of two vectors is less than or equal to the product of their inner products with themselves."
    },
    historicalSignificance: "코시가 1821년 유한합 부등식을 발표하고, 분야콥스키(1859)와 헤르만 슈바르츠(1888)가 적분 및 힐베르트 공간으로 일반화함.",
    prerequisites: ["내적 공간(Inner Product Space) 공리", "실수 이차방정식 판별식"],
    intuitiveIdea: "실수 t에 대한 이차함수 ||u*t + v||^2는 항상 0 이상이어야 하므로, 이 이차방정식이 실근을 최대 1개만 갖는다는 조건(판별식 D <= 0)에서 부등식이 즉시 유도됨.",
    rigorousProof: {
      proofType: "2차 다항식 판별식 증명 (Discriminant of Quadratic Polynomial)",
      assumptions: ["실 내적 공간 V의 임의의 두 벡터 u, v"],
      steps: [
        {
          stepNumber: 1,
          title: "실수 매개변수 t에 대한 이차 다항함수 정의",
          explanation: "임의의 실수 $t \\in \\mathbb{R}$에 대해 내적의 양의 정부호성에 의해 노름 제곱은 항상 0 이상이다.",
          typesetMath: "f(t) = \\|t\\mathbf{u} + \\mathbf{v}\\|^2 = \\langle t\\mathbf{u} + \\mathbf{v}, t\\mathbf{u} + \\mathbf{v} \\rangle \\ge 0",
          justification: "내적 공간의 정의: 임의의 벡터 w에 대해 <w, w> >= 0"
        },
        {
          stepNumber: 2,
          title: "내적의 쌍선형성을 이용한 t에 대한 2차식 전개",
          explanation: "내적을 전개하여 $t$에 대한 2차 다항식 형태로 정돈한다.",
          typesetMath: "f(t) = \\langle \\mathbf{u}, \\mathbf{u} \\rangle t^2 + 2\\langle \\mathbf{u}, \\mathbf{v} \\rangle t + \\langle \\mathbf{v}, \\mathbf{v} \\rangle \\ge 0",
          justification: "내적의 대칭성 및 선형성"
        },
        {
          stepNumber: 3,
          title: "계수 치환",
          explanation: "$A = \\langle \\mathbf{u}, \\mathbf{u} \\rangle$, $B = 2\\langle \\mathbf{u}, \\mathbf{v} \\rangle$, $C = \\langle \\mathbf{v}, \\mathbf{v} \\rangle$라 놓으면 $At^2 + Bt + C \\ge 0$이다.",
          typesetMath: "A = \\|\\mathbf{u}\\|^2, \\quad B = 2\\langle \\mathbf{u}, \\mathbf{v} \\rangle, \\quad C = \\|\\mathbf{v}\\|^2",
          justification: "이차함수 표준형"
        },
        {
          stepNumber: 4,
          title: "판별식 조건 적용",
          explanation: "모든 실수 $t$에 대해 $f(t) \\ge 0$이려면 이 이차함수의 그래프는 t축 위에 있거나 접해야 하므로 판별식 $\\Delta = B^2 - 4AC \\le 0$이어야 한다.",
          typesetMath: "\\Delta = (2\\langle \\mathbf{u}, \\mathbf{v} \\rangle)^2 - 4 \\|\\mathbf{u}\\|^2 \\|\\mathbf{v}\\|^2 \\le 0",
          justification: "실계수 이차부등식이 항상 성립할 조건"
        },
        {
          stepNumber: 5,
          title: "양변 정리 및 최종 부등식 완성",
          explanation: "4로 나누고 이항하면 코시-슈바르츠 부등식이 도출된다.",
          typesetMath: "4\\langle \\mathbf{u}, \\mathbf{v} \\rangle^2 \\le 4 \\|\\mathbf{u}\\|^2 \\|\\mathbf{v}\\|^2 \\implies |\\langle \\mathbf{u}, \\mathbf{v} \\rangle| \\le \\|\\mathbf{u}\\| \\|\\mathbf{v}\\|",
          justification: "부등식의 양의 상수 나눗셈"
        }
      ],
      conclusion: "임의의 내적 공간에서 코시-슈바르츠 부등식이 성립하며, 등호는 u와 v가 평행할 때만 성립한다 (Q.E.D.)."
    },
    corollariesAndApplications: [
      {
        title: "삼각부등식 증명",
        typesetMath: "\\|\\mathbf{u} + \\mathbf{v}\\| \\le \\|\\mathbf{u}\\| + \\|\\mathbf{v}\\|",
        description: "노름 공간의 거리 공리 성립의 핵심 근거"
      },
      {
        title: "하이젠베르크 불확정성 원리",
        typesetMath: "\\sigma_x \\sigma_p \\ge \\frac{\\hbar}{2}",
        description: "양자역학에서 두 관측가능량의 연산자 교환자 부등식 유도"
      }
    ]
  },
  {
    id: "central-limit",
    order: 7,
    domain: "확률 및 통계학",
    titleKo: "중심극한정리 (Central Limit Theorem)",
    titleEn: "Central Limit Theorem (CLT)",
    statement: {
      typesetMath: "Z_n = \\frac{\\bar{X}_n - \\mu}{\\sigma / \\sqrt{n}} \\xrightarrow{d} \\mathcal{N}(0, 1)",
      explanationKo: "모집단의 분포가 무엇이든 평균과 분산이 유한하다면, 표본의 크기 n이 충분히 커질 때 표본평균의 표준화 분포는 표준정규분포로 수렴한다.",
      explanationEn: "The normalized sum of independent and identically distributed random variables converges in distribution to a standard normal distribution."
    },
    historicalSignificance: "자연계와 사회현상에서 가우스 정규분포가 보편적으로 나타나는 수학적 이유를 규명한 현대 추측통계학의 절대적 초석.",
    prerequisites: ["독립동일분포 (i.i.d.)", "적률생성함수 (MGF)", "테일러 급수와 분포수렴"],
    intuitiveIdea: "표본평균의 적률생성함수(MGF)를 테일러 전개하면 n이 무한대로 갈 때 고차 모멘트 항들이 모두 소멸하고 오직 2차 모멘트 항만 남아 e^(t^2/2), 즉 표준정규분포의 MGF와 완전히 일치하게 됨.",
    rigorousProof: {
      proofType: "적률생성함수(MGF) 급수 전개 증명 (Moment Generating Function Proof)",
      assumptions: ["i.i.d. 확률변수 X_1, ..., X_n (평균 mu, 분산 sigma^2 < inf)", "표준화 변수 Y_i = (X_i - mu)/sigma"],
      steps: [
        {
          stepNumber: 1,
          title: "표준화 합 변수의 정의",
          explanation: "$E[Y_i] = 0, \\operatorname{Var}(Y_i) = 1$인 $Y_i$에 대해 $Z_n = \\frac{1}{\\sqrt{n}} \\sum_{i=1}^n Y_i$로 둔다.",
          typesetMath: "Z_n = \\sum_{i=1}^n \\frac{Y_i}{\\sqrt{n}}",
          justification: "표본평균의 표준화 변환"
        },
        {
          stepNumber: 2,
          title: "개별 변수 Y_i의 MGF 테일러 전개",
          explanation: "$Y_i$의 MGF $M_Y(t) = E[e^{tY}]$를 0 근방에서 2차 테일러 전개한다.",
          typesetMath: "M_Y(t) = 1 + E[Y]t + \\frac{E[Y^2]}{2!}t^2 + o(t^2) = 1 + 0 + \\frac{t^2}{2} + o(t^2)",
          justification: "MGF와 모멘트의 관계 ($E[Y]=0, E[Y^2]=1$)"
        },
        {
          stepNumber: 3,
          title: "Z_n의 적률생성함수 수립",
          explanation: "독립 확률변수들의 합의 MGF는 각 MGF의 곱이므로 다음과 같이 표현된다.",
          typesetMath: "M_{Z_n}(t) = \\left[ M_Y\\left(\\frac{t}{\\sqrt{n}}\\right) \\right]^n = \\left[ 1 + \\frac{t^2}{2n} + o\\left(\\frac{t^2}{n}\\right) \\right]^n",
          justification: "독립확률변수 합의 승법적 성질"
        },
        {
          stepNumber: 4,
          title: "n이 무한대로 갈 때의 극한 계산",
          explanation: "$\\lim_{n \\to \\infty} (1 + \\frac{x}{n})^n = e^x$의 극한 공식을 적용한다.",
          typesetMath: "\\lim_{n \\to \\infty} M_{Z_n}(t) = \\lim_{n \\to \\infty} \\left[ 1 + \\frac{t^2/2}{n} \\right]^n = e^{t^2 / 2}",
          justification: "오일러 자연상수 e의 극한 정의"
        },
        {
          stepNumber: 5,
          title: "연속성 정리 및 분포 수렴 판정",
          explanation: "$e^{t^2/2}$는 표준정규분포 $\\mathcal{N}(0, 1)$의 MGF이다. 레비 연속성 정리에 의해 MGF의 수렴은 분포수렴을 보장한다.",
          typesetMath: "M_{Z_n}(t) \\to e^{t^2/2} = M_{\\mathcal{N}(0,1)}(t) \\implies Z_n \\xrightarrow{d} \\mathcal{N}(0, 1)",
          justification: "Lévy's Continuity Theorem"
        }
      ],
      conclusion: "표본의 크기가 무한히 커짐에 따라 표본평균의 표준화 분포는 모집단 분포와 상관없이 표준정규분포로 수렴한다 (Q.E.D.)."
    },
    corollariesAndApplications: [
      {
        title: "신뢰구간 추정",
        typesetMath: "\\bar{x} \\pm 1.96 \\frac{\\sigma}{\\sqrt{n}}",
        description: "모평균에 대한 95% 신뢰구간 공식의 수학적 토대"
      }
    ]
  },
  {
    id: "fermat-little",
    order: 8,
    domain: "정수론 및 현대 암호학",
    titleKo: "페르마의 소정리 (Fermat's Little Theorem)",
    titleEn: "Fermat's Little Theorem",
    statement: {
      typesetMath: "a^{p-1} \\equiv 1 \\pmod p \\quad (\\gcd(a, p) = 1)",
      explanationKo: "소수 p와 서로소인 임의의 정수 a에 대하여, a를 (p-1)번 거듭제곱한 수를 p로 나눈 나머지는 항상 1이다.",
      explanationEn: "If p is a prime number and a is an integer coprime to p, then a raised to the power (p - 1) is congruent to 1 modulo p."
    },
    historicalSignificance: "1640년 피에르 드 페르마가 발표하고 오일러가 증명하였으며, 오늘날 전자상거래와 블록체인을 지탱하는 RSA 공개키 암호 알고리즘의 심장.",
    prerequisites: ["소수와 잉여계", "모듈러 합동식 성질"],
    intuitiveIdea: "집합 {1, 2, ..., p-1}의 모든 원소에 a를 곱해도 법 p에 대한 나머지 집합은 단지 순서만 바뀔 뿐 동일하므로, 양변의 모든 원소를 곱한 뒤 공통항을 약분하면 a^(p-1) = 1이 남음.",
    rigorousProof: {
      proofType: "기약잉여계 곱셈 순열 증명 (Reduced Residue System Permutation)",
      assumptions: ["소수 p와 gcd(a, p) = 1인 정수 a"],
      steps: [
        {
          stepNumber: 1,
          title: "법 p에 대한 기약잉여계 구성",
          explanation: "법 $p$에 대해 $p$와 서로소인 $p-1$개의 잉여류 집합 $S$를 고려한다.",
          typesetMath: "S = \\{1, 2, 3, \\dots, p-1\\}",
          justification: "소수 p의 기약잉여계 정의"
        },
        {
          stepNumber: 2,
          title: "각 원소에 a를 곱한 새로운 집합 구성",
          explanation: "$S$의 각 원소에 $a$를 곱한 집합 $T$를 구성한다.",
          typesetMath: "T = \\{a, 2a, 3a, \\dots, (p-1)a\\}",
          justification: "정수 스칼라 곱"
        },
        {
          stepNumber: 3,
          title: "T의 모든 원소가 법 p에 대해 서로 다름을 증명",
          explanation: "$1 \\le j < k \\le p-1$에 대해 $ja \\equiv ka \\pmod p \\implies (k-j)a \\equiv 0 \\pmod p$. $\\gcd(a, p) = 1$이므로 $p \\mid (k-j)$이어야 하나 $0 < k-j < p$이므로 모순이다.",
          typesetMath: "ja \\not\\equiv ka \\pmod p \\quad (j \\ne k)",
          justification: "유클리드 보조정리"
        },
        {
          stepNumber: 4,
          title: "두 집합 원소들의 총곱 비교",
          explanation: "$T$의 원소들은 $S$의 원소들을 재배열한 것에 불과하므로 모든 원소의 곱은 합동이어야 한다.",
          typesetMath: "a \\cdot 2a \\cdot 3a \\cdots (p-1)a \\equiv 1 \\cdot 2 \\cdot 3 \\cdots (p-1) \\pmod p",
          justification: "잉여류 곱셈의 불변성"
        },
        {
          stepNumber: 5,
          title: "a^(p-1) 인수분해 및 약분",
          explanation: "좌변에서 $a$를 $(p-1)$번 묶어내면 다음과 같다.",
          typesetMath: "a^{p-1} (p-1)! \\equiv (p-1)! \\pmod p",
          justification: "팩토리얼 묶음"
        },
        {
          stepNumber: 6,
          title: "최종 합동식 도출",
          explanation: "$p$는 소수이므로 $(p-1)!$은 $p$와 서로소이다. 따라서 양변을 $(p-1)!$로 나눌 수 있다.",
          typesetMath: "a^{p-1} \\equiv 1 \\pmod p",
          justification: "모듈러 나눗셈 소거법칙"
        }
      ],
      conclusion: "소수 p와 서로소인 모든 정수 a에 대해 페르마의 소정리가 증명되었다 (Q.E.D.)."
    },
    corollariesAndApplications: [
      {
        title: "모듈러 역원 계산",
        typesetMath: "a^{-1} \\equiv a^{p-2} \\pmod p",
        description: "나눗셈을 거듭제곱으로 즉시 변환하는 고속 알고리즘"
      }
    ]
  },
  {
    id: "basel-problem",
    order: 9,
    domain: "해석학 및 급수론",
    titleKo: "바젤 문제 (The Basel Problem)",
    titleEn: "The Basel Problem",
    statement: {
      typesetMath: "\\sum_{n=1}^\\infty \\frac{1}{n^2} = 1 + \\frac{1}{4} + \\frac{1}{9} + \\frac{1}{16} + \\cdots = \\frac{\\pi^2}{6}",
      explanationKo: "모든 자연수의 제곱의 역수를 무한히 더한 급수는 정확히 6분의 파이 제곱으로 수렴한다.",
      explanationEn: "The infinite sum of the reciprocals of the squares of positive integers converges precisely to pi squared over 6."
    },
    historicalSignificance: "야코프 베르누이가 1689년 제시한 후 베르누이 가문 전체가 풀지 못했던 난제를 1734년 28세의 레온하르트 오일러가 해결하여 전 유럽 수학계를 경악시킨 역사적 업적.",
    prerequisites: ["테일러 급수", "다항식의 근과 계수의 관계", "비에타 정리의 무한차수 확장"],
    intuitiveIdea: "sin(x)/x 함수의 근들이 +-pi, +-2pi, +-3pi...라는 사실을 이용하여 무한 인수분해 식을 세우고, 이를 sin(x)/x의 테일러 급수 전개식의 x^2 항 계수와 비교하면 1/n^2의 합과 파이 제곱의 관계가 도출됨.",
    rigorousProof: {
      proofType: "오일러 사인 무한곱 근-계수 대조 증명 (Euler's Infinite Product for Sine)",
      assumptions: ["sin(x)/x의 매클로린 급수", "위이어슈트라스 분해 정리의 원형인 무한곱 전개"],
      steps: [
        {
          stepNumber: 1,
          title: "sin(x)/x의 테일러 급수 전개",
          explanation: "사인 함수의 매클로린 급수를 $x$로 나눈다.",
          typesetMath: "\\frac{\\sin x}{x} = 1 - \\frac{x^2}{3!} + \\frac{x^4}{5!} - \\frac{x^6}{7!} + \\cdots = 1 - \\frac{x^2}{6} + \\frac{x^4}{120} - \\cdots",
          justification: "사인 함수 테일러 급수"
        },
        {
          stepNumber: 2,
          title: "sin(x)/x의 영점(Roots) 분석",
          explanation: "$\\frac{\\sin x}{x} = 0$의 해는 $x = \\pm \\pi, \\pm 2\\pi, \\pm 3\\pi, \\dots$이다 ($x=0$은 특이점 아님).",
          typesetMath: "x = \\pm n\\pi \\quad (n = 1, 2, 3, \\dots)",
          justification: "삼각함수 영점"
        },
        {
          stepNumber: 3,
          title: "무한차수 다항식의 근을 통한 인수분해",
          explanation: "상수항이 1이고 근이 $\\pm n\\pi$인 다항식을 인수분해 형태로 무한곱으로 표현한다.",
          typesetMath: "\\frac{\\sin x}{x} = \\prod_{n=1}^\\infty \\left(1 - \\frac{x}{n\\pi}\\right)\\left(1 + \\frac{x}{n\\pi}\\right) = \\prod_{n=1}^\\infty \\left(1 - \\frac{x^2}{n^2\\pi^2}\\right)",
          justification: "합차공식을 통한 무한곱 결합"
        },
        {
          stepNumber: 4,
          title: "무한곱을 전개하여 x^2의 계수 추출",
          explanation: "무한곱에서 $x^2$ 항은 각 인수의 $-\\frac{x^2}{n^2\\pi^2}$들을 모두 더한 것과 같다.",
          typesetMath: "\\prod_{n=1}^\\infty \\left(1 - \\frac{x^2}{n^2\\pi^2}\\right) = 1 - \\left( \\sum_{n=1}^\\infty \\frac{1}{n^2\\pi^2} \\right) x^2 + \\mathcal{O}(x^4)",
          justification: "무한 다항식 전개 계수 비교"
        },
        {
          stepNumber: 5,
          title: "1단계와 4단계의 x^2 계수 일치 비교",
          explanation: "동일한 함수이므로 $x^2$의 계수는 일치해야 한다.",
          typesetMath: "-\\frac{1}{6} = -\\frac{1}{\\pi^2} \\sum_{n=1}^\\infty \\frac{1}{n^2}",
          justification: "항등식의 미정계수법"
        },
        {
          stepNumber: 6,
          title: "양변에 -π^2을 곱하여 최종값 도출",
          explanation: "양변에 $-\\pi^2$을 곱하면 바젤 문제의 해답이 완성된다.",
          typesetMath: "\\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
          justification: "산술 정리"
        }
      ],
      conclusion: "자연수 제곱 역수의 무한합은 정확히 pi^2 / 6이다 (Q.E.D.)."
    },
    corollariesAndApplications: [
      {
        title: "리만 제타 함수 특수값",
        typesetMath: "\\zeta(2) = \\frac{\\pi^2}{6}, \\quad \\zeta(2k) = (-1)^{k+1} \\frac{B_{2k} (2\\pi)^{2k}}{2(2k)!}",
        description: "리만 제타 함수의 짝수 정수점 닫힌 형태 값 일반화"
      }
    ]
  },
  {
    id: "cantor-diagonal",
    order: 10,
    domain: "집합론 및 무한론",
    titleKo: "칸토어의 대각선 논법 (Cantor's Diagonal Argument)",
    titleEn: "Cantor's Diagonal Argument",
    statement: {
      typesetMath: "|\\mathbb{R}| > |\\mathbb{N}|, \\quad 2^{\\aleph_0} > \\aleph_0",
      explanationKo: "실수 집합의 크기(기수)는 자연수 집합보다 엄격히 크며, 실수는 일대일 대응으로 셀 수 없는 비가산(Uncountable) 집합이다.",
      explanationEn: "The real numbers are uncountable, establishing that there are strictly larger infinities than the countable natural numbers."
    },
    historicalSignificance: "1891년 게오르크 칸토어가 발표하여 '무한에도 크기(크기가 다른 무한)가 존재한다'는 사실을 입증한 수학사상 가장 혁명적인 논증.",
    prerequisites: ["가산 집합(Countable Set)과 전단사 함수", "실수의 십진법 무한소수 전개"],
    intuitiveIdea: "구간 (0,1)의 모든 실수를 빠짐없이 번호를 매겨 목록으로 만들었다고 가정하자. 이제 n번째 수의 n번째 자릿수를 피해서 새로운 수의 자릿수를 하나씩 조립하면, 이 새로운 수는 목록의 그 어떤 수와도 n번째 자리에서 달라 목록에 누락된 수가 되어 모순이 발생함.",
    rigorousProof: {
      proofType: "대각선 원소 변형 귀류법 (Diagonalization Contradiction)",
      assumptions: ["구간 (0, 1)의 모든 실수가 가산적(Countable)이어서 자연수와 일대일 대응 목록화 가능하다고 가정"],
      steps: [
        {
          stepNumber: 1,
          title: "가산 가정에 따른 수열 나열 목록 작성",
          explanation: "구간 $(0, 1)$의 모든 실수를 $r_1, r_2, r_3, \\dots$로 나열하고 각각의 무한소수 전개를 표기한다.",
          typesetMath: "\\begin{aligned} r_1 &= 0.d_{11} d_{12} d_{13} d_{14} \\dots \\\\ r_2 &= 0.d_{21} d_{22} d_{23} d_{24} \\dots \\\\ r_3 &= 0.d_{31} d_{32} d_{33} d_{34} \\dots \\end{aligned}",
          justification: "가산 집합의 수열 나열 가능성"
        },
        {
          stepNumber: 4,
          title: "대각선 원소 d_nn을 회피하는 새로운 실수 x 구성",
          explanation: "새로운 실수 $x = 0.c_1 c_2 c_3 \\dots$를 다음과 같은 대각선 변환 규칙으로 정의한다: $c_n = \\begin{cases} 4 & (d_{nn} \\ne 4) \\\\ 5 & (d_{nn} = 4) \\end{cases}$.",
          typesetMath: "c_n \\ne d_{nn} \\quad (\\forall n \\in \\mathbb{N})",
          justification: "대각선 자릿수 변형 알고리즘"
        },
        {
          stepNumber: 5,
          title: "새로운 실수 x의 목록 대조 및 모순 판정",
          explanation: "명백히 $x \\in (0, 1)$이다. 만약 목록이 완전하다면 어떤 자연수 $k$에 대해 $x = r_k$이어야 한다.",
          typesetMath: "x = r_k \\implies c_k = d_{kk}",
          justification: "목록의 전사성 가정"
        },
        {
          stepNumber: 6,
          title: "자릿수 불일치 모순 확정",
          explanation: "그러나 $x$의 정의상 $c_k \\ne d_{kk}$이므로 $x = r_k$는 불가능하다. 즉 $x$는 목록 어디에도 존재하지 않는다.",
          typesetMath: "c_k \\ne d_{kk} \\implies x \\ne r_k \\quad (\\forall k \\in \\mathbb{N})",
          justification: "대각선 설계 자체에 의한 절대 모순"
        }
      ],
      conclusion: "구간 (0, 1)의 실수를 자연수 번호로 모두 나열할 수 없으므로 실수는 비가산 집합이다 (Q.E.D.)."
    },
    corollariesAndApplications: [
      {
        title: "튜링의 정지 문제 불가능성",
        typesetMath: "\\text{Halting Problem is Undecidable}",
        description: "대각선 논법을 계산이론으로 확장하여 튜링 기계의 계산 불가능 함수 존재 증명"
      }
    ]
  },
  {
    id: "rank-nullity",
    order: 11,
    domain: "선형대수학",
    titleKo: "차원 정리 (Rank-Nullity Theorem)",
    titleEn: "Rank-Nullity Theorem",
    statement: {
      typesetMath: "\\dim(V) = \\operatorname{rank}(T) + \\operatorname{nullity}(T)",
      explanationKo: "유한차원 벡터공간 사이의 선형변환에서 정의역의 차원은 치역(상)의 차원(계수)과 영공간(핵)의 차원의 합과 같다.",
      explanationEn: "For a linear map from a finite-dimensional vector space, the dimension of the domain equals the rank plus the nullity."
    },
    historicalSignificance: "제임스 조지프 실베스터가 1884년 정립한 선형대수학의 대기본정리로, 연립방정식의 해공간 차원과 행렬 계수 관계를 완전히 규명함.",
    prerequisites: ["벡터공간의 기저와 차원", "선형변환의 핵(Kernel)과 상(Image)"],
    intuitiveIdea: "선형사상에 의해 '0으로 압축되어 사라지는 차원(Nullity)'과 '살아서 목적지로 투영되는 차원(Rank)'을 합치면 원래 출발지의 총 차원이 된다는 차원 보존 법칙.",
    rigorousProof: {
      proofType: "기저 확장 및 선형독립성 증명 (Basis Extension Proof)",
      assumptions: ["유한차원 벡터공간 V (차원 n)와 선형사상 T: V -> W", "핵 ker(T)의 차원을 k (nullity)라 하자"],
      steps: [
        {
          stepNumber: 1,
          title: "핵 ker(T)의 기저 설정",
          explanation: "$\\ker(T)$의 기저를 $\\{\\mathbf{u}_1, \\mathbf{u}_2, \\dots, \\mathbf{u}_k\\}$라 하자 ($k = \\operatorname{nullity}(T)$).",
          typesetMath: "\\dim(\\ker T) = k, \\quad \\ker(T) = \\operatorname{span}(\\mathbf{u}_1, \\dots, \\mathbf{u}_k)",
          justification: "부분공간의 기저 존재 정리"
        },
        {
          stepNumber: 2,
          title: "전체 공간 V의 기저로 확장",
          explanation: "기저 확장 정리에 의해 $V$의 기저가 되도록 $n-k$개의 선형독립 벡터 $\\mathbf{v}_1, \\dots, \\mathbf{v}_{n-k}$를 추가한다.",
          typesetMath: "\\mathcal{B}_V = \\{\\mathbf{u}_1, \\dots, \\mathbf{u}_k, \\mathbf{v}_1, \\dots, \\mathbf{v}_{n-k}\\}",
          justification: "유한차원 기저 확장 정리"
        },
        {
          stepNumber: 3,
          title: "상공간 Im(T)의 생성원 구성",
          explanation: "임의의 $\\mathbf{x} \\in V$는 $\\mathcal{B}_V$의 일차결합으로 표현되므로, $T(\\mathbf{x})$를 취하면 $T(\\mathbf{u}_i) = \\mathbf{0}$에 의해 소멸한다.",
          typesetMath: "T(\\mathbf{x}) = \\sum_{i=1}^{n-k} c_i T(\\mathbf{v}_i) \\implies \\operatorname{Im}(T) = \\operatorname{span}(T(\\mathbf{v}_1), \\dots, T(\\mathbf{v}_{n-k}))",
          justification: "선형사상의 보존성 및 핵의 정의"
        },
        {
          stepNumber: 4,
          title: "{T(v_1), ..., T(v_{n-k})}의 선형독립성 증명",
          explanation: "$\\sum c_i T(\\mathbf{v}_i) = \\mathbf{0} \\implies T\\left(\\sum c_i \\mathbf{v}_i\\right) = \\mathbf{0}$. 따라서 $\\sum c_i \\mathbf{v}_i \\in \\ker(T)$이다.",
          typesetMath: "\\sum_{i=1}^{n-k} c_i \\mathbf{v}_i = \\sum_{j=1}^k d_j \\mathbf{u}_j \\implies \\sum c_i \\mathbf{v}_i - \\sum d_j \\mathbf{u}_j = \\mathbf{0}",
          justification: "핵의 원소 정의"
        },
        {
          stepNumber: 5,
          title: "모든 계수 c_i가 0임을 확정",
          explanation: "$\\mathcal{B}_V$는 $V$의 기저이므로 선형독립이다. 따라서 모든 $c_i = 0$이어야 한다. 즉 $\\{T(\\mathbf{v}_1), \\dots, T(\\mathbf{v}_{n-k})\\}$는 $\\operatorname{Im}(T)$의 기저이다.",
          typesetMath: "\\dim(\\operatorname{Im} T) = n - k = \\operatorname{rank}(T)",
          justification: "기저의 정의 (생성 + 선형독립)"
        },
        {
          stepNumber: 6,
          title: "차원 정리 등식 완성",
          explanation: "정의역의 차원 $n = \\dim(V)$는 $k + (n-k)$이므로 증명이 완결된다.",
          typesetMath: "\\dim(V) = k + (n-k) = \\operatorname{nullity}(T) + \\operatorname{rank}(T)",
          justification: "차원의 덧셈"
        }
      ],
      conclusion: "정의역의 차원은 rank와 nullity의 합과 정확히 일치한다 (Q.E.D.)."
    },
    corollariesAndApplications: [
      {
        title: "가역 선형변환의 동치 조건",
        typesetMath: "\\operatorname{rank}(T) = n \\iff \\operatorname{nullity}(T) = 0 \\iff T \\text{ is invertible}",
        description: "정방행렬의 전사성, 단사성, 가역성의 완전한 일치성"
      }
    ]
  },
  {
    id: "arithmetic-fundamental",
    order: 12,
    domain: "정수론 및 현대 대수학",
    titleKo: "산술의 기본정리 (Fundamental Theorem of Arithmetic)",
    titleEn: "Fundamental Theorem of Arithmetic (FTA)",
    statement: {
      typesetMath: "n = p_1^{a_1} p_2^{a_2} \\cdots p_k^{a_k} \\quad (p_1 < p_2 < \\dots < p_k)",
      explanationKo: "1보다 큰 모든 자연수는 소수들의 곱으로 표현(존재성)될 수 있으며, 소수들의 순서를 무시하면 그 분해는 유일(유일성)하다.",
      explanationEn: "Every integer greater than 1 can be represented uniquely as a product of prime numbers, up to the order of the factors."
    },
    historicalSignificance: "유클리드 원론 제7권 명제 30(유클리드 보조정리)에 기원을 두고 1801년 가우스가 '산술 연구'에서 최초로 완전한 유일성 증명을 완성함.",
    prerequisites: ["유클리드 보조정리: p | ab => p | a or p | b", "수학적 귀납법 및 정렬 원리(Well-Ordering Principle)"],
    intuitiveIdea: "소수는 정수를 구성하는 '화학적 원소(Atoms)'와 같아서, 어떤 정수도 고유한 소수들의 조합으로 단 한 가지 방식으로만 조립됨.",
    rigorousProof: {
      proofType: "유클리드 보조정리와 최소 반례 귀류법 (Well-ordering & Euclid's Lemma)",
      assumptions: ["1보다 큰 자연수 n"],
      steps: [
        {
          stepNumber: 1,
          title: "소인수분해 존재성 (강한 귀납법)",
          explanation: "$n=2$는 소수이므로 참이다. $2 \\le k < n$인 모든 정수가 소수의 곱으로 분해된다고 가정하자. $n$이 소수이면 끝이고, 합성수이면 $n = ab$ ($1 < a, b < n$)로 쓸 수 있으며 귀납 가정에 의해 $a, b$가 소수의 곱이므로 $n$도 소수의 곱이다.",
          typesetMath: "n = p_1 p_2 \\cdots p_r",
          justification: "강한 수학적 귀납법"
        },
        {
          stepNumber: 2,
          title: "유일성에 대한 반례 가정",
          explanation: "서로 다른 두 소인수분해를 갖는 1보다 큰 자연수가 존재한다고 가정하고, 정렬 원리에 의해 그러한 정수 중 가장 작은 최소 반례를 $m$이라 하자.",
          typesetMath: "m = p_1 p_2 \\cdots p_r = q_1 q_2 \\cdots q_s",
          justification: "자연수 정렬 원리(Well-Ordering Principle)"
        },
        {
          stepNumber: 3,
          title: "유클리드 보조정리 적용",
          explanation: "$p_1$은 $m$을 나누므로 우변 $q_1 q_2 \\dots q_s$를 나눈다. 유클리드 보조정리에 의해 $p_1$은 적어도 하나의 $q_j$를 나누어야 한다.",
          typesetMath: "p_1 \\mid (q_1 q_2 \\cdots q_s) \\implies \\exists j \\text{ s.t. } p_1 \\mid q_j",
          justification: "Euclid's Lemma: 소수가 곱을 나누면 적어도 하나의 인수를 나눔"
        },
        {
          stepNumber: 4,
          title: "소수의 소인수분해 특성에 의한 동일성 규명",
          explanation: "$q_j$ 역시 소수이므로 약수는 1과 자기 자신뿐이다. 따라서 $p_1 = q_j$이어야 한다. 순서를 재배열하여 $p_1 = q_1$이라 하자.",
          typesetMath: "p_1 = q_1",
          justification: "소수의 정의"
        },
        {
          stepNumber: 5,
          title: "양변 약분 및 최소 반례 모순 도출",
          explanation: "양변을 $p_1$으로 나누면 $m' = m / p_1 < m$인 더 작은 정수가 두 가지 다른 소인수분해를 갖게 된다.",
          typesetMath: "m' = p_2 \\cdots p_r = q_2 \\cdots q_s < m",
          justification: "양변 소거"
        },
        {
          stepNumber: 6,
          title: "모순 확정",
          explanation: "이는 $m$이 두 가지 소인수분해를 갖는 '최소'의 자연수라는 최초의 설정에 모순이다.",
          typesetMath: "\\text{Contradiction with minimality of } m",
          justification: "귀류법 종결"
        }
      ],
      conclusion: "모든 자연수의 소인수분해 표현은 순서를 제외하고 오직 유일하다 (Q.E.D.)."
    },
    corollariesAndApplications: [
      {
        title: "약수의 개수 공식",
        typesetMath: "d(n) = (a_1 + 1)(a_2 + 1)\\cdots(a_k + 1)",
        description: "소인수분해 거듭제곱 지수로부터 약수 개수와 합을 구하는 기초 공식"
      }
    ]
  }
];

for (const th of theorems) {
  const filePath = path.join(outDir, `${th.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(th, null, 2), 'utf8');
  console.log(`Generated theorem: ${th.id}.json`);
}

console.log(`\n🎉 Successfully generated all ${theorems.length} theorem proof documents.\n`);
