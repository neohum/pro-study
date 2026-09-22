/**
 * scripts/curriculum/stage3_middle3.js
 * 중학교 3학년 수학:
 * 6. 이차방정식과 근의 공식, 판별식
 * 7. 이차함수와 포물선, 꼭짓점
 * 8. 삼각비의 정의와 특수각
 */

module.exports = [
  // 6. 이차방정식과 근의 공식, 판별식
  {
    id: "mod-1-6-quadratic-equation",
    stage: "stage1-middle",
    order: 6,
    titleKo: "이차방정식과 근의 공식, 판별식",
    titleEn: "Quadratic Equations, Quadratic Formula, and Discriminant",
    koreanCurriculumUnit: "중학교 3학년 수학 - Ⅱ. 이차방정식 (1. 이차방정식의 풀이)",
    graphType: "PARABOLA",
    graphCaption: "ax² + bx + c = 0의 해를 나타내는 포물선과 x축의 교점 (D > 0: 2개, D = 0: 1개, D < 0: 없음)",
    terms: [
      { term: "이차방정식 (Quadratic Equation)", definition: "ax² + bx + c = 0 (a ≠ 0)처럼 x의 최고차항이 2차인 방정식" },
      { term: "인수분해 (Factoring)", definition: "하나의 다항식을 두 개 이상의 일차식들의 곱으로 쪼개는 것 (예: x² - 5x + 6 = (x - 2)(x - 3))" },
      { term: "완전제곱식 (Perfect Square)", definition: "(x + p)²처럼 다항식의 전체가 제곱으로 묶이는 식" },
      { term: "근(해) (Root)", definition: "방정식의 미지수 x에 넣었을 때 식을 참(0 = 0)으로 만들어주는 정답" },
      { term: "근의 공식", definition: "인수분해가 안 되는 어떤 복잡한 이차방정식이라도 계수 a, b, c만으로 해를 바로 뽑아내는 만능 공식" },
      { term: "판별식 (Discriminant, D)", definition: "근의 공식 루트 안에 들어있는 식 D = b² - 4ac. 이 녀석의 부호만 보면 실근이 2개인지, 1개(중근)인지, 없는지 알 수 있어요!" }
    ],
    mathExplanation: "중1 때는 2x + 4 = 10 같은 일차방정식을 배웠습니다. 하지만 공을 하늘로 던졌을 때의 높이나 땅의 면적을 다룰 때는 x²(제곱)이 들어간 '이차방정식'이 나타납니다. 곱해서 0이 되려면 둘 중 하나가 0이어야 하므로 (x-2)(x-3)=0이면 x=2 또는 x=3이 됩니다. 인수분해가 안 될 때는 '완전제곱식 만들기'라는 강력한 기술로 유도된 '근의 공식'을 쓰면 됩니다.",
    mathFormulasToTrace: [
      {
        title: "이차방정식 근의 공식 (만능 해결사)",
        latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\quad (a \\ne 0)",
        explanation: "계수 a, b, c를 쏙 대입하면 플러스 루트와 마이너스 루트로 두 개의 해가 한 번에 튀어나옵니다."
      },
      {
        title: "판별식 D의 실근 개수 판정 법칙",
        latex: "D = b^2 - 4ac \\implies \\begin{cases} D > 0 & \\text{서로 다른 두 실근 (그래프가 x축과 2번 만남)} \\\\ D = 0 & \\text{중근 (그래프가 x축에 접함)} \\\\ D < 0 & \\text{실근 없음 (그래프가 x축 위에 붕 뜸)} \\end{cases}",
        explanation: "루트 안의 수가 양수면 2개, 0이면 1개(중근), 음수면 실수가 될 수 없으므로 0개입니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "a, b, c",
        name: "이차방정식의 계수(Coefficients)와 상수항(Constant)",
        meaning: "ax² + bx + c = 0에서 a는 이차항 x² 앞의 계수, b는 일차항 x 앞의 계수, c는 문자 없는 순수한 숫자 상수항입니다."
      },
      {
        symbol: "a ≠ 0",
        name: "이차방정식 성립 조건",
        meaning: "만약 a = 0이면 x²항이 사라져 일차방정식이 되어버리므로, 이차방정식이 되기 위한 필수 불변 조건입니다."
      },
      {
        symbol: "± (Plus-Minus)",
        name: "플러스마이너스 복호 기호",
        meaning: "+(양수)와 -(음수) 두 개의 해를 한 번에 묶어 쓰는 기호입니다. x = (-b + √D)/(2a)와 x = (-b - √D)/(2a)라는 2개의 정답을 뜻합니다."
      },
      {
        symbol: "D",
        name: "판별식 (Discriminant)",
        meaning: "영어 Discriminant(구별/판별하다)의 머리글자 D입니다. 근의 공식 루트 안의 식 D = b² - 4ac로, 해를 직접 구하지 않고도 근의 개수(2개, 1개, 0개)를 단번에 판별합니다."
      },
      {
        symbol: "b² - 4ac",
        name: "판별식 계산식",
        meaning: "완전제곱식을 전개하고 통분하는 과정에서 자연스럽게 도출된 핵심 수식입니다."
      },
      {
        symbol: "2a",
        name: "근의 공식 분모",
        meaning: "이차항 계수 a로 나누고 완전제곱식을 푸는 과정에서 4a²의 제곱근인 2a가 분모로 도출된 것입니다."
      },
      {
        symbol: "x",
        name: "방정식의 근(해) / Root",
        meaning: "방정식에 대입했을 때 좌변 ax² + bx + c를 0으로 만들어주는 미지수의 참값입니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "ax^2 + bx + c = 0 \\implies x^2 + \\frac{b}{a}x = -\\frac{c}{a}",
        justification: "양변을 a로 나누고 상수항을 오른쪽으로 넘깁니다."
      },
      {
        stepNumber: 2,
        mathExpression: "x^2 + \\frac{b}{a}x + \\left(\\frac{b}{2a}\\right)^2 = \\frac{b^2}{4a^2} - \\frac{c}{a}",
        justification: "좌변을 완전제곱식으로 만들기 위해 x 계수의 절반의 제곱을 양변에 똑같이 더해줍니다."
      },
      {
        stepNumber: 3,
        mathExpression: "\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}",
        justification: "좌변을 묶고 우변을 4a²으로 통분하면 드디어 판별식 b²-4ac가 나타납니다!"
      },
      {
        stepNumber: 4,
        mathExpression: "x + \\frac{b}{2a} = \\pm \\frac{\\sqrt{b^2 - 4ac}}{2a} \\implies x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        justification: "양변의 제곱근을 취하고 +b/(2a)를 이항하면 인류의 위대한 '근의 공식'이 완성됩니다."
      }
    ],
    derivationDetail: {
      title: "정사각형 퍼즐 맞추기에서 탄생한 근의 공식 유도",
      backgroundStory: "고대 바빌로니아와 아라비아의 수학자 알콰리즈미는 정사각형 타일 조각을 맞추다가 근의 공식을 유도했습니다. x²이라는 큰 정사각형 옆에 (b/a)x라는 직사각형을 반으로 쪼개어 가로와 세로에 붙이면 모퉁이에 딱 (b/2a)² 크기의 작은 정사각형 구멍이 생깁니다. 이 구멍을 양변에 채워 넣음으로써 완벽한 큰 정사각형(완전제곱식)을 완성하고 제곱근을 취하는 직관적인 기하학적 유도법입니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "x^2 + 2 \\left(\\frac{b}{2a}\\right) x + \\left(\\frac{b}{2a}\\right)^2 = \\left(x + \\frac{b}{2a}\\right)^2",
          justification: "가운데 1차항을 둘로 나누어 양쪽에 붙이고 모퉁이 조각을 더해 완전제곱식을 조립합니다."
        },
        {
          stepNumber: 2,
          mathExpression: "\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}",
          justification: "우변의 상수항들을 합쳐 통분합니다."
        },
        {
          stepNumber: 3,
          mathExpression: "x = -\\frac{b}{2a} \\pm \\frac{\\sqrt{b^2 - 4ac}}{2a}",
          justification: "제곱을 벗겨내고 중심 위치에서 좌우로 ±루트만큼 떨어진 두 해를 구합니다."
        }
      ],
      conclusion: "근의 공식은 무작정 외우는 주문이 아니라, '완전제곱식으로 묶어 제곱근을 씌운다'는 단순한 사각형 퍼즐 맞추기의 최종 결과물입니다."
    },
    workedExample: {
      problem: "이차방정식 2x² - 4x + 1 = 0의 해를 근의 공식을 사용하여 구하시오.",
      stepsToTrace: [
        "1단계: 계수를 확인한다 ➔ a = 2, b = -4, c = 1.",
        "2단계: 판별식을 확인한다 ➔ D = (-4)² - 4(2)(1) = 16 - 8 = 8 > 0 (서로 다른 두 실근).",
        "3단계: 근의 공식에 대입한다 ➔ x = [-(-4) ± √8] / (2 × 2) = (4 ± 2√2) / 4.",
        "4단계: 분모와 분자를 2로 약분한다 ➔ x = (2 ± √2) / 2."
      ],
      finalAnswer: "x = (2 + √2)/2 또는 x = (2 - √2)/2"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 인수분해를 이용한 이차방정식 풀이",
        question: "이차방정식 x² - 7x + 12 = 0의 두 근을 인수분해를 통해 구하시오.",
        interpretation: "곱해서 +12가 되고 더해서 -7이 되는 두 정수를 찾습니다. (-3) × (-4) = 12이고 (-3) + (-4) = -7이므로 (x - 3)(x - 4) = 0으로 인수분해됩니다.",
        solutionSteps: [
          "1단계: 두 수의 곱이 12, 합이 -7인 조합을 찾습니다 ➔ -3과 -4",
          "2단계: 좌변을 인수분해합니다 ➔ (x - 3)(x - 4) = 0",
          "3단계: 두 식의 곱이 0이므로 x - 3 = 0 또는 x - 4 = 0입니다.",
          "4단계: 따라서 x = 3 또는 x = 4입니다."
        ],
        answer: "x = 3 또는 x = 4",
        keyPoint: "합과 곱의 부호를 볼 때, 상수항이 양수(+)이면 두 수의 부호가 같고 일차항이 음수(-)이므로 둘 다 음수입니다."
      },
      {
        problemNumber: 2,
        title: "실전 문제: 판별식 D를 이용한 근의 개수 판정",
        question: "이차방정식 x² - 6x + k = 0이 '중근(오직 하나의 실근)'을 가질 때, 상수 k의 값을 구하시오.",
        interpretation: "중근을 가지려면 판별식 D = b² - 4ac의 값이 정확히 '0'이어야 합니다 (또는 상수항이 x 계수 절반의 제곱).",
        solutionSteps: [
          "1단계: 계수를 확인합니다 ➔ a = 1, b = -6, c = k",
          "2단계: 판별식 식을 세웁니다 ➔ D = (-6)² - 4(1)(k) = 36 - 4k",
          "3단계: 중근 조건 D = 0을 적용합니다 ➔ 36 - 4k = 0",
          "4단계: 일차방정식을 풉니다 ➔ 4k = 36 ➔ k = 9",
          "5단계: 검산해 봅니다 ➔ x² - 6x + 9 = (x - 3)² = 0 (중근 x = 3 성립)"
        ],
        answer: "k = 9",
        keyPoint: "x²의 계수가 1일 때 중근을 가지려면 상수항은 x 계수의 절반(-3)의 제곱인 9가 되어야 합니다."
      },
      {
        problemNumber: 3,
        title: "응용 문제: 로켓 발사 높이와 비행 시간 계산",
        question: "지면에서 쏘아 올린 물 로켓의 t초 후의 높이 h(m)가 h = -5t² + 20t라고 합니다. 이 로켓이 다시 지면(높이 h = 0)에 떨어지는 시간은 발사 후 몇 초 뒤인지 구하시오.",
        interpretation: "지면에 떨어진다는 것은 높이 h가 0이 된다는 뜻이므로, 이차방정식 -5t² + 20t = 0의 해를 구하는 실생활 문제입니다.",
        solutionSteps: [
          "1단계: h = 0을 대입하여 이차방정식을 만듭니다 ➔ -5t² + 20t = 0",
          "2단계: 양변을 -5로 나눕니다 ➔ t² - 4t = 0",
          "3단계: 공통인수 t로 묶어 인수분해합니다 ➔ t(t - 4) = 0",
          "4단계: 해를 구합니다 ➔ t = 0 또는 t = 4",
          "5단계: t = 0은 발사 순간이고, 다시 지면에 떨어지는 시간은 4초 뒤입니다."
        ],
        answer: "4초 뒤",
        keyPoint: "실생활 물리 문제에서는 시간 t ≥ 0이어야 하므로 음수 해가 나오면 버려야 합니다."
      }
    ],
    csIntuition: "3D 컴퓨터 그래픽스의 광선 추적(Ray Tracing) 알고리즘에서 카메라가 쏜 레이저(직선)가 3D 구(Sphere)와 충돌하는지 계산할 때 바로 이 판별식 D를 씁니다. $D > 0$이면 구를 뚫고 지나가 화면에 픽셀 색상을 칠합니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "quadratic.c",
        code: "#include <stdio.h>\n#include <math.h>\n\nint solve_quadratic(double a, double b, double c, double *r1, double *r2) {\n    double d = b * b - 4 * a * c;\n    if (d < 0) return 0;\n    double s = sqrt(d);\n    *r1 = (-b + s) / (2 * a);\n    *r2 = (-b - s) / (2 * a);\n    return (d == 0) ? 1 : 2;\n}\n\nint main(void) {\n    double r1, r2;\n    int count = solve_quadratic(2, -4, 1, &r1, &r2);\n    printf(\"Roots: %.3f, %.3f (count=%d)\\n\", r1, r2, count);\n    return 0;\n}\n",
        notes: "C23 판별식 기반 근의 공식 솔버"
      },
      go: {
        lang: "go",
        entryFile: "quadratic.go",
        code: "package main\n\nimport (\n\t\"fmt\"\n\t\"math\"\n)\n\nfunc Solve(a, b, c float64) (float64, float64, bool) {\n\td := b*b - 4*a*c\n\tif d < 0 { return 0, 0, false }\n\ts := math.Sqrt(d)\n\treturn (-b + s)/(2*a), (-b - s)/(2*a), true\n}\n\nfunc main() {\n\tr1, r2, ok := Solve(2, -4, 1)\n\tfmt.Printf(\"Roots: %.3f, %.3f (ok=%v)\\n\", r1, r2, ok)\n}\n",
        notes: "Go 근의 공식"
      },
      rust: {
        lang: "rust",
        entryFile: "quadratic.rs",
        code: "pub fn solve(a: f64, b: f64, c: f64) -> Option<(f64, f64)> {\n    let d = b * b - 4.0 * a * c;\n    if d < 0.0 { None }\n    else {\n        let s = d.sqrt();\n        Some(((-b + s)/(2.0*a), (-b - s)/(2.0*a)))\n    }\n}\n\nfn main() {\n    println!(\"Roots: {:?}\", solve(2.0, -4.0, 1.0));\n}\n",
        notes: "Rust Option 반환"
      },
      python: {
        lang: "python",
        entryFile: "quadratic.py",
        code: "import math\n\ndef solve(a: float, b: float, c: float):\n    d = b * b - 4 * a * c\n    if d < 0: return None\n    s = math.sqrt(d)\n    return ((-b + s)/(2*a), (-b - s)/(2*a))\n\nif __name__ == \"__main__\":\n    print(\"Roots:\", solve(2, -4, 1))\n",
        notes: "Python 튜플 반환"
      },
      typescript: {
        lang: "typescript",
        entryFile: "quadratic.ts",
        code: "export function solve(a: number, b: number, c: number): [number, number] | null {\n  const d = b * b - 4 * a * c;\n  if (d < 0) return null;\n  const s = Math.sqrt(d);\n  return [(-b + s) / (2 * a), (-b - s) / (2 * a)];\n}\n\nconsole.log(solve(2, -4, 1));\n",
        notes: "TS 튜플 솔버"
      },
      javascript: {
        lang: "javascript",
        entryFile: "quadratic.js",
        code: "function solve(a, b, c) {\n  const d = b * b - 4 * a * c;\n  if (d < 0) return null;\n  const s = Math.sqrt(d);\n  return [(-b + s) / (2 * a), (-b - s) / (2 * a)];\n}\nconsole.log(solve(2, -4, 1));\n",
        notes: "JS 배열 반환"
      }
    }
  },

  // 7. 이차함수와 포물선, 꼭짓점
  {
    id: "mod-1-7-quadratic-function",
    stage: "stage1-middle",
    order: 7,
    titleKo: "이차함수와 포물선, 꼭짓점",
    titleEn: "Quadratic Functions, Parabolas, and Vertices",
    koreanCurriculumUnit: "중학교 3학년 수학 - Ⅲ. 이차함수 (1. 이차함수와 그래프)",
    graphType: "PARABOLA",
    graphCaption: "y = a(x-p)² + q 포물선의 대칭축 x = p와 산꼭대기/골짜기 바닥점인 꼭짓점 (p, q)",
    terms: [
      { term: "이차함수 (Quadratic Function)", definition: "y = ax² + bx + c (a ≠ 0)처럼 x에 관한 2차식으로 표현되는 함수" },
      { term: "포물선 (Parabola)", definition: "공을 던졌을 때 허공에 그리는 완벽한 좌우 대칭 곡선" },
      { term: "꼭짓점 (Vertex, (p, q))", definition: "포물선이 방향을 꺾는 가장 중요한 기준점. U자 모양일 땐 최저점, ∩자 모양일 땐 최고점" },
      { term: "대칭축 (Axis of Symmetry, x = p)", definition: "포물선을 반으로 딱 접었을 때 양쪽이 완전히 포개어지는 거울선" },
      { term: "아래로 볼록 vs 위로 볼록", definition: "a > 0이면 U자 모양(그릇 모양, 최솟값 존재), a < 0이면 ∩자 모양(모자 모양, 최댓값 존재)" }
    ],
    mathExplanation: "농구공을 림으로 던질 때 공이 날아가는 궤적을 슬로모션으로 보면 아름다운 곡선이 그려집니다. 이것이 이차함수의 '포물선'입니다. 포물선에서 가장 특별한 점은 바로 '꼭짓점'입니다. 물건의 가격을 얼마로 정해야 '이익을 최대(최댓값)'로 낼 수 있는지, 또는 오차를 '최소(최솟값)'로 줄일 수 있는지를 알아내는 최적화 수학의 출발점입니다.",
    mathFormulasToTrace: [
      {
        title: "이차함수 표준형 (꼭짓점이 바로 보이는 형태)",
        latex: "y = a(x - p)^2 + q \\implies \\text{꼭짓점: } (p, q), \\quad \\text{대칭축: } x = p",
        explanation: "식을 완전제곱식으로 바꾸면 x = p일 때 제곱 괄호가 0이 되어 가장 작거나 큰 값 q를 갖게 됩니다."
      },
      {
        title: "일반형 ax² + bx + c에서 꼭짓점 좌표 공식",
        latex: "p = -\\frac{b}{2a}, \\quad q = c - \\frac{b^2}{4a}",
        explanation: "일반형을 완전제곱식으로 묶어 전개하면 꼭짓점의 x좌표 p는 항상 -b/(2a)가 됩니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "(p, q)",
        name: "포물선의 꼭짓점 좌표 (Vertex)",
        meaning: "포물선이 방향을 틀어 올라가거나 내려가는 가장 극적인 전환점입니다. U자 모양(a > 0)일 때는 바닥 최솟값 (p, q), ∩자 모양(a < 0)일 때는 꼭대기 최댓값 (p, q)가 됩니다."
      },
      {
        symbol: "x = p",
        name: "대칭축의 방정식 (Axis of Symmetry)",
        meaning: "포물선을 좌우로 반듯하게 접었을 때 양쪽이 완벽하게 겹쳐지는 수직 거울선입니다. 꼭짓점의 x좌표와 항상 같습니다."
      },
      {
        symbol: "p = -b / (2a)",
        name: "꼭짓점 x좌표 공식",
        meaning: "일반형 ax² + bx + c를 완전제곱식으로 묶을 때 일차항의 절반에서 자연스럽게 도출되는 핵심 위치 공식입니다."
      },
      {
        symbol: "q = c - b² / (4a)",
        name: "꼭짓점 y좌표 (최댓값 또는 최솟값)",
        meaning: "대칭축 x = p를 대입했을 때 나오는 포물선의 가장 높거나 가장 낮은 극값 높이입니다."
      },
      {
        symbol: "a > 0 vs a < 0",
        name: "포물선의 볼록성 (Curvature)",
        meaning: "a > 0이면 아래로 볼록(그릇 모양, 최솟값 존재), a < 0이면 위로 볼록(모자/산 모양, 최댓값 존재)을 결정합니다."
      },
      {
        symbol: "(x - p)²",
        name: "완전제곱식 구조",
        meaning: "어떤 실수를 제곱해도 0 이상이므로, (x - p)²의 최솟값은 괄호 안이 0이 되는 x = p일 때 정확히 0이 됩니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "y = a\\left(x^2 + \\frac{b}{a}x\\right) + c",
        justification: "최고차항 계수 a로 x가 들어있는 항들을 묶어냅니다."
      },
      {
        stepNumber: 2,
        mathExpression: "y = a\\left(x^2 + \\frac{b}{a}x + \\frac{b^2}{4a^2} - \\frac{b^2}{4a^2}\\right) + c",
        justification: "괄호 안을 완전제곱식으로 만들기 위해 b²/(4a²)을 더하고 뺍니다."
      },
      {
        stepNumber: 3,
        mathExpression: "y = a\\left(x + \\frac{b}{2a}\\right)^2 + \\left(c - \\frac{b^2}{4a}\\right)",
        justification: "완전제곱식으로 묶고 남은 상수를 밖으로 빼내어 p = -b/(2a), q = c - b²/(4a)를 유도합니다."
      }
    ],
    derivationDetail: {
      title: "왜 실수의 제곱은 항상 0 이상일까? (꼭짓점의 원리)",
      backgroundStory: "어떤 실수라도 제곱을 하면 항상 0 이상이 됩니다(x² ≥ 0). 음수도 제곱하면 양수가 되기 때문입니다! 따라서 (x - p)²은 x가 정확히 p일 때 '가장 작은 값 0'을 찍고, x가 p에서 멀어질수록 점점 커집니다. 이것이 바로 a > 0일 때 x = p에서 가장 낮은 꼭짓점 바닥(최솟값 q)을 갖게 되는 이유입니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "(x - p)^2 \\ge 0 \\quad (\\text{모든 실수 } x\\text{에 대하여})",
          justification: "실수의 제곱은 아무리 작아도 0보다 작아질 수 없습니다."
        },
        {
          stepNumber: 2,
          mathExpression: "a(x - p)^2 \\ge 0 \\quad (a > 0\\text{일 때})",
          justification: "양수 a를 곱해도 부등호 방향은 유지됩니다."
        },
        {
          stepNumber: 3,
          mathExpression: "y = a(x - p)^2 + q \\ge 0 + q = q",
          justification: "양변에 q를 더하면 y의 값은 무조건 q 이상이 되므로 최솟값이 q가 됩니다."
        }
      ],
      conclusion: "꼭짓점 (p, q)는 괄호 안을 0으로 만드는 x = p에서 높이 y = q가 결정되는 지점입니다."
    },
    workedExample: {
      problem: "이차함수 y = x² - 4x + 3을 표준형 y = a(x-p)² + q로 바꾸고, 꼭짓점과 대칭축을 구하시오.",
      stepsToTrace: [
        "1단계: x항들을 묶는다 ➔ y = (x² - 4x) + 3.",
        "2단계: 절반의 제곱(+4)을 더하고 뺀다 ➔ y = (x² - 4x + 4 - 4) + 3.",
        "3단계: 완전제곱식으로 묶는다 ➔ y = (x - 2)² - 4 + 3 = (x - 2)² - 1.",
        "4단계: 꼭짓점은 (2, -1), 대칭축은 x = 2이다."
      ],
      finalAnswer: "표준형: y = (x - 2)² - 1, 꼭짓점: (2, -1), 대칭축: x = 2, 최솟값: -1"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 표준형에서 꼭짓점과 대칭축 읽기",
        question: "이차함수 y = -2(x + 3)² + 5의 그래프에 대하여 꼭짓점의 좌표, 대칭축의 방정식, 그리고 최댓값(또는 최솟값)을 구하시오.",
        interpretation: "y = a(x - p)² + q 꼴에서 p = -3, q = 5입니다. a = -2 < 0이므로 위로 볼록(∩자 모자 모양)하여 꼭짓점에서 '최댓값'을 갖습니다.",
        solutionSteps: [
          "1단계: 괄호 안 (x + 3)을 0으로 만드는 x값을 찾습니다 ➔ x = -3 (p = -3)",
          "2단계: 그때의 y값을 읽습니다 ➔ y = 5 (q = 5)",
          "3단계: 꼭짓점의 좌표는 (-3, 5)이고, 대칭축의 방정식은 x = -3입니다.",
          "4단계: a = -2로 음수이므로 위로 볼록하며, x = -3일 때 최댓값 5를 갖습니다."
        ],
        answer: "꼭짓점: (-3, 5), 대칭축: x = -3, 최댓값: 5 (최솟값은 없음)",
        keyPoint: "(x + 3)이므로 꼭짓점의 x좌표는 +3이 아니라 부호가 반대인 '-3'이라는 점을 절대 잊지 마세요!"
      },
      {
        problemNumber: 2,
        title: "실전 문제: 일반형을 표준형으로 변형하여 꼭짓점 찾기",
        question: "이차함수 y = -x² + 6x - 5의 그래프의 꼭짓점의 좌표와 y절편을 구하시오.",
        interpretation: "-1로 앞의 두 항을 묶은 뒤 절반의 제곱을 더하고 빼서 완전제곱식을 만듭니다. y절편은 x = 0을 넣었을 때의 상수항입니다.",
        solutionSteps: [
          "1단계: x²의 계수인 -1로 묶습니다 ➔ y = -(x² - 6x) - 5",
          "2단계: -6의 절반은 -3이고 제곱은 9이므로 괄호 안에 +9 -9를 넣습니다.",
          "   y = -(x² - 6x + 9 - 9) - 5",
          "3단계: -9가 괄호 밖으로 나갈 때 앞의 마이너스를 만나 +9가 됩니다.",
          "   y = -(x - 3)² + 9 - 5 = -(x - 3)² + 4",
          "4단계: 따라서 꼭짓점의 좌표는 (3, 4)입니다.",
          "5단계: y절편은 x = 0일 때 y값이므로 원래 식의 상수항 -5입니다."
        ],
        answer: "꼭짓점: (3, 4), y절편: -5 (점 (0, -5))",
        keyPoint: "괄호 안에서 상수를 밖으로 뺄 때 앞의 계수(-1)를 반드시 곱해서 꺼내야 부호 실수를 방지할 수 있습니다!"
      },
      {
        problemNumber: 3,
        title: "응용 문제: 철망으로 만드는 닭장의 최대 넓이",
        question: "길이가 20m인 철망으로 직사각형 모양의 닭장을 만들려고 합니다. 닭장의 넓이가 최대가 되도록 할 때, 가로의 길이와 그때의 최대 넓이를 구하시오.",
        interpretation: "둘레가 20m이므로 (가로 + 세로) = 10m입니다. 가로를 x라 두면 세로는 10 - x가 되고, 넓이 y = x(10 - x) = -x² + 10x라는 이차함수가 만들어집니다.",
        solutionSteps: [
          "1단계: 가로 길이를 x라고 하면, 세로 길이는 10 - x입니다 (0 < x < 10).",
          "2단계: 직사각형 넓이 y에 대한 식을 세웁니다 ➔ y = x(10 - x) = -x² + 10x",
          "3단계: 완전제곱식 표준형으로 변형합니다.",
          "   y = -(x² - 10x + 25 - 25) = -(x - 5)² + 25",
          "4단계: a = -1 < 0이므로 x = 5일 때 최댓값 25를 갖습니다.",
          "5단계: 가로가 5m일 때 세로도 10 - 5 = 5m(정사각형)가 되며 최대 넓이는 25m²입니다."
        ],
        answer: "가로 길이: 5m, 최대 넓이: 25m²",
        keyPoint: "둘레가 일정한 직사각형 중 넓이가 최대가 되는 도형은 항상 네 변의 길이가 같은 '정사각형'입니다!"
      }
    ],
    csIntuition: "인공지능 딥러닝에서 정답과 예측값의 오차를 측정하는 손실 함수(MSE, Mean Squared Error)는 $J(w) = (y - \hat{y})^2$ 같은 이차함수 꼴입니다. 이차함수의 가장 낮은 바닥(꼭짓점)을 찾아 내려가는 알고리즘이 바로 인공지능의 심장인 경사하강법(Gradient Descent)입니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "vertex.c",
        code: "#include <stdio.h>\n\ntypedef struct { double p, q; } Vertex;\n\nVertex get_vertex(double a, double b, double c) {\n    double p = -b / (2.0 * a);\n    double q = c - (b * b) / (4.0 * a);\n    Vertex v = { p, q };\n    return v;\n}\n\nint main(void) {\n    Vertex v = get_vertex(1, -4, 3);\n    printf(\"Vertex: (%.2f, %.2f)\\n\", v.p, v.q);\n    return 0;\n}\n",
        notes: "C23 포물선 꼭짓점 공식 솔버"
      },
      go: {
        lang: "go",
        entryFile: "vertex.go",
        code: "package main\n\nimport \"fmt\"\n\nfunc Vertex(a, b, c float64) (p, q float64) {\n\tp = -b / (2 * a)\n\tq = c - (b*b)/(4*a)\n\treturn\n}\n\nfunc main() {\n\tp, q := Vertex(1, -4, 3)\n\tfmt.Printf(\"Vertex: (%.2f, %.2f)\\n\", p, q)\n}\n",
        notes: "Go 꼭짓점 다중 반환"
      },
      rust: {
        lang: "rust",
        entryFile: "vertex.rs",
        code: "pub fn vertex(a: f64, b: f64, c: f64) -> (f64, f64) {\n    (-b / (2.0 * a), c - (b * b) / (4.0 * a))\n}\n\nfn main() {\n    let (p, q) = vertex(1.0, -4.0, 3.0);\n    println!(\"Vertex: ({:.2}, {:.2})\", p, q);\n}\n",
        notes: "Rust 튜플 꼭짓점"
      },
      python: {
        lang: "python",
        entryFile: "vertex.py",
        code: "def vertex(a: float, b: float, c: float) -> tuple[float, float]:\n    p = -b / (2 * a)\n    q = c - (b * b) / (4 * a)\n    return (p, q)\n\nif __name__ == \"__main__\":\n    print(\"Vertex:\", vertex(1, -4, 3))\n",
        notes: "Python 꼭짓점 튜플"
      },
      typescript: {
        lang: "typescript",
        entryFile: "vertex.ts",
        code: "export function vertex(a: number, b: number, c: number): { p: number; q: number } {\n  return { p: -b / (2 * a), q: c - (b * b) / (4 * a) };\n}\n\nconsole.log(vertex(1, -4, 3));\n",
        notes: "TS 꼭짓점 객체"
      },
      javascript: {
        lang: "javascript",
        entryFile: "vertex.js",
        code: "function vertex(a, b, c) {\n  return { p: -b / (2 * a), q: c - (b * b) / (4 * a) };\n}\nconsole.log(vertex(1, -4, 3));\n",
        notes: "JS 포물선 꼭짓점"
      }
    }
  },

  // 8. 삼각비의 정의와 특수각
  {
    id: "mod-1-8-trig-ratios",
    stage: "stage1-middle",
    order: 8,
    titleKo: "삼각비의 정의와 특수각",
    titleEn: "Trigonometric Ratios and Special Angles",
    koreanCurriculumUnit: "중학교 3학년 수학 - Ⅳ. 삼각비 (1. 삼각비)",
    graphType: "UNIT_CIRCLE",
    graphCaption: "직각삼각형의 변의 비율과 특수각(30°, 45°, 60°)에서의 sin, cos, tan 값",
    terms: [
      { term: "삼각비 (Trigonometric Ratio)", definition: "직각삼각형에서 한 예각의 크기가 정해질 때, 삼각형의 크기와 무관하게 일정하게 결정되는 두 변의 길이의 비율" },
      { term: "사인 (sin, Sine)", definition: "빗변 대비 높이의 비율 (sin θ = 높이 / 빗변)" },
      { term: "코사인 (cos, Cosine)", definition: "빗변 대비 밑변의 비율 (cos θ = 밑변 / 빗변)" },
      { term: "탄젠트 (tan, Tangent)", definition: "밑변 대비 높이의 비율 (tan θ = 높이 / 밑변 = 기울기)" },
      { term: "특수각", definition: "정삼각형을 반으로 자르거나 정사각형을 대각선으로 잘랐을 때 나오는 예쁜 각도 (30°, 45°, 60°)" }
    ],
    mathExplanation: "직각삼각형의 크기가 손바닥만 하든 피라미드만 하든 상관없이 각도가 같으면 모든 직각삼각형은 서로 닮음입니다. 따라서 두 변의 길이의 '비율'은 항상 일정합니다. 고대 수학자 탈레스는 막대기 하나와 그림자의 삼각비 각도를 이용해 직접 올라가지 않고도 거대한 이집트 피라미드의 높이를 정확히 재어냈습니다.",
    mathFormulasToTrace: [
      {
        title: "직각삼각형 삼각비 3대 정의",
        latex: "\\sin\\theta = \\frac{\\text{높이}}{\\text{빗변}}, \\quad \\cos\\theta = \\frac{\\text{밑변}}{\\text{빗변}}, \\quad \\tan\\theta = \\frac{\\text{높이}}{\\text{밑변}}",
        explanation: "빗변을 분모로 두면 사인(높이)과 코사인(밑변)이 되고, 밑변 분의 높이가 탄젠트입니다."
      },
      {
        title: "특수각(30°, 45°, 60°)의 핵심 삼각비 표",
        latex: "\\begin{array}{c|ccc} \\theta & 30^\\circ & 45^\\circ & 60^\\circ \\\\ \\hline \\sin & 1/2 & \\sqrt{2}/2 & \\sqrt{3}/2 \\\\ \\cos & \\sqrt{3}/2 & \\sqrt{2}/2 & 1/2 \\\\ \\tan & \\sqrt{3}/3 & 1 & \\sqrt{3} \\end{array}",
        explanation: "사인은 0에서 1로 커지고, 코사인은 1에서 0으로 작아지며, 45도에서 둘이 똑같아집니다."
      },
      {
        title: "피타고라스 삼각 항등식",
        latex: "\\sin^2\\theta + \\cos^2\\theta = 1, \\quad \\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}",
        explanation: "피타고라스 정리 덕분에 사인 제곱과 코사인 제곱을 더하면 각도와 무관하게 항상 1이 됩니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "sin",
        name: "사인 (Sine)",
        meaning: "라틴어 sinus(옷의 주름, 만곡, 활시위의 호)에서 유래한 약어입니다. 직각삼각형에서 빗변 대비 마주보는 '높이'의 길이 비율(높이/빗변)입니다."
      },
      {
        symbol: "cos",
        name: "코사인 (Cosine)",
        meaning: "Complementary Sine(여각의 사인)의 줄임말입니다. 90도에서 각도를 뺀 나머지 각도의 사인이란 뜻으로, 빗변 대비 이웃한 '밑변'의 비율(밑변/빗변)입니다."
      },
      {
        symbol: "tan",
        name: "탄젠트 (Tangent)",
        meaning: "접한다는 뜻의 라틴어 tangens(접선)에서 유래했습니다. 밑변 대비 높이의 비율(높이/밑변)이며, 일차함수 직선의 '기울기'와 완벽히 같습니다."
      },
      {
        symbol: "θ (Theta)",
        name: "각도 기호 (그리스 문자 세타)",
        meaning: "수학에서 회전 각도를 나타낼 때 전 세계적으로 가장 보편적으로 사용하는 그리스 문자 소문자입니다."
      },
      {
        symbol: "° (Degree)",
        name: "60분법 각도 단위 (도)",
        meaning: "원 한 바퀴를 360등분한 단위입니다. (예: 직각 90°, 평각 180°)"
      },
      {
        symbol: "sin²θ + cos²θ = 1",
        name: "피타고라스 삼각 항등식",
        meaning: "피타고라스 정리 a² + b² = c²의 양변을 빗변의 제곱 c²으로 나누어 유도된 기하학의 기본 불변 등식입니다."
      },
      {
        symbol: "sin²θ",
        name: "삼각함수 거듭제곱 표기법",
        meaning: "(sin θ)²과 완전히 같은 뜻입니다. 괄호를 생략하고 보기 편하게 하기 위해 지수 2를 sin 문자 바로 뒤에 붙여 씁니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "\\sin\\theta = \\frac{b}{c}, \\quad \\cos\\theta = \\frac{a}{c} \\quad (c\\text{는 빗변})",
        justification: "빗변 c와 직각변 a, b로 사인과 코사인의 정의를 적습니다."
      },
      {
        stepNumber: 2,
        mathExpression: "\\sin^2\\theta + \\cos^2\\theta = \\frac{b^2}{c^2} + \\frac{a^2}{c^2} = \\frac{a^2 + b^2}{c^2}",
        justification: "두 식을 각각 제곱하여 통분해 더합니다."
      },
      {
        stepNumber: 3,
        mathExpression: "a^2 + b^2 = c^2 \\implies \\frac{c^2}{c^2} = 1",
        justification: "피타고라스 정리에 의해 분자가 c²과 같아지므로 약분되어 항상 1이 도출됩니다!"
      }
    ],
    derivationDetail: {
      title: "정삼각형을 반으로 쪼개어 도출한 30°와 60°의 특수각",
      backgroundStory: "한 변의 길이가 2인 정삼각형을 반으로 딱 쪼개면 어떻게 될까요? 밑변은 2의 절반인 1이 되고, 꼭지각 60°는 반으로 나뉘어 30°가 됩니다! 피타고라스 정리에 의해 높이는 √(2² - 1²) = √3이 됩니다. 이 아름다운 '1 : √3 : 2' 비율의 직각삼각형에서 30도와 60도의 모든 삼각비가 저절로 유도됩니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "\\text{정삼각형 반토막: 빗변 } c = 2, \\quad \\text{밑변 } a = 1",
          justification: "한 변이 2인 정삼각형의 꼭짓점에서 수선을 내리면 밑변이 1로 이등분됩니다."
        },
        {
          stepNumber: 2,
          mathExpression: "\\text{높이 } h = \\sqrt{2^2 - 1^2} = \\sqrt{4 - 1} = \\sqrt{3}",
          justification: "피타고라스 정리에 의해 세 변의 비율이 1 : √3 : 2로 완성됩니다."
        },
        {
          stepNumber: 3,
          mathExpression: "\\sin 30^\\circ = \\frac{1}{2}, \\quad \\cos 30^\\circ = \\frac{\\sqrt{3}}{2}, \\quad \\tan 30^\\circ = \\frac{1}{\\sqrt{3}} = \\frac{\\sqrt{3}}{3}",
          justification: "30도 각도를 기준으로 대변(높이)과 이웃변(밑변)을 읽어냅니다."
        }
      ],
      conclusion: "삼각비 표를 무작정 외울 필요 없이, 정삼각형을 반으로 가르면 30°와 60°의 삼각비가 즉시 머릿속에 그려집니다."
    },
    workedExample: {
      problem: "빗변의 길이가 10m이고 지면과의 각도가 30°인 미끄럼틀의 높이와 바닥 밑변의 길이를 구하시오.",
      stepsToTrace: [
        "1단계: 높이 = 빗변 × sin 30° = 10 × (1/2) = 5m이다.",
        "2단계: 밑변 = 빗변 × cos 30° = 10 × (√3/2) = 5√3m (약 8.66m)이다.",
        "3단계: 검산 ➔ 5² + (5√3)² = 25 + 75 = 100 = 10²으로 피타고라스 정리가 딱 맞는다."
      ],
      finalAnswer: "높이: 5m, 바닥 밑변: 5√3m"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 특수각 삼각비의 덧셈 뺄셈 계산",
        question: "다음 식의 값을 계산하시오: 2 × sin 30° + 4 × cos 60° - tan 45°",
        interpretation: "특수각 삼각비 값인 sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1을 대입하여 계산합니다.",
        solutionSteps: [
          "1단계: 각 삼각비의 값을 확인합니다 ➔ sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1",
          "2단계: 식에 대입합니다 ➔ 2 × (1/2) + 4 × (1/2) - 1",
          "3단계: 곱셈을 먼저 계산합니다 ➔ 1 + 2 - 1",
          "4단계: 덧셈 뺄셈을 완료합니다 ➔ 2"
        ],
        answer: "2",
        keyPoint: "sin 30°와 cos 60°의 값이 둘 다 1/2로 같다는 상호 여각 관계(30° + 60° = 90°)를 기억해두면 편리합니다."
      },
      {
        problemNumber: 2,
        title: "실전 문제: 나무의 높이 측정하기 (탄젠트 활용)",
        question: "어떤 사람이 나무 밑동에서 12m 떨어진 지점에서 나무의 꼭대기를 올려다본 각도가 45°였습니다. 이 사람의 눈높이가 1.5m일 때, 나무의 실제 높이를 구하시오.",
        interpretation: "밑변이 12m이고 각도가 45°인 직각삼각형에서 높이 = 밑변 × tan 45°입니다. 여기에 사람의 눈높이 1.5m를 더해주어야 땅바닥에서부터의 전체 나무 높이가 됩니다.",
        solutionSteps: [
          "1단계: tan 45° = 1이므로, 눈높이 위의 나무 부분 높이는 12 × tan 45° = 12 × 1 = 12m입니다.",
          "2단계: 실제 나무의 높이는 땅바닥에서부터의 높이이므로 사람의 눈높이(1.5m)를 더합니다.",
          "   나무 높이 = 12m + 1.5m = 13.5m"
        ],
        answer: "13.5m",
        keyPoint: "실생활 측정 문제에서는 사람의 눈높이나 삼각대 높이를 마지막에 더해주는 것을 깜빡 잊지 마세요!"
      },
      {
        problemNumber: 3,
        title: "응용 문제: 하나의 삼각비로 나머지 삼각비 구하기",
        question: "예각 A에 대하여 cos A = 3/5일 때, sin A와 tan A의 값을 각각 구하시오.",
        interpretation: "빗변이 5이고 밑변이 3인 직각삼각형을 머릿속에 그립니다. 피타고라스 삼조 3-4-5에 의해 높이는 4가 되므로 sin과 tan을 즉시 읽을 수 있습니다.",
        solutionSteps: [
          "1단계: cos A = 3/5이므로 빗변 c = 5, 밑변 a = 3으로 둘 수 있습니다.",
          "2단계: 피타고라스 정리로 높이 b를 구합니다 ➔ b² = 5² - 3² = 25 - 9 = 16 ➔ b = 4",
          "3단계: sin A의 정의에 대입합니다 ➔ sin A = 높이 / 빗변 = 4/5",
          "4단계: tan A의 정의에 대입합니다 ➔ tan A = 높이 / 밑변 = 4/3"
        ],
        answer: "sin A = 4/5, tan A = 4/3",
        keyPoint: "피타고라스 삼각 항등식 sin²A + cos²A = 1을 써서 sin A = √(1 - 9/25) = √(16/25) = 4/5로 구할 수도 있습니다."
      }
    ],
    csIntuition: "2D/3D 게임에서 비행기가 각도 $\theta$ 방향으로 날아갈 때 x축 이동량은 `dx = speed * cos(θ)`, y축 이동량은 `dy = speed * sin(θ)`로 계산됩니다. 모든 게임 엔진의 물리 이동 로직은 삼각비 분해로 돌아갑니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "trig.c",
        code: "#include <stdio.h>\n#include <math.h>\n\n#define PI 3.14159265358979323846\n\nvoid get_movement(double speed, double deg, double *dx, double *dy) {\n    double rad = deg * (PI / 180.0);\n    *dx = speed * cos(rad);\n    *dy = speed * sin(rad);\n}\n\nint main(void) {\n    double dx, dy;\n    get_movement(10.0, 30.0, &dx, &dy);\n    printf(\"Speed 10 at 30 deg: dx=%.2f, dy=%.2f\\n\", dx, dy);\n    return 0;\n}\n",
        notes: "C23 게임 속도 벡터 분해"
      },
      go: {
        lang: "go",
        entryFile: "trig.go",
        code: "package main\n\nimport (\n\t\"fmt\"\n\t\"math\"\n)\n\nfunc Movement(speed, deg float64) (float64, float64) {\n\trad := deg * (math.Pi / 180)\n\treturn speed * math.Cos(rad), speed * math.Sin(rad)\n}\n\nfunc main() {\n\tdx, dy := Movement(10, 30)\n\tfmt.Printf(\"dx=%.2f, dy=%.2f\\n\", dx, dy)\n}\n",
        notes: "Go 삼각함수 속도 분해"
      },
      rust: {
        lang: "rust",
        entryFile: "trig.rs",
        code: "pub fn movement(speed: f64, deg: f64) -> (f64, f64) {\n    let rad = deg.to_radians();\n    (speed * rad.cos(), speed * rad.sin())\n}\n\nfn main() {\n    let (dx, dy) = movement(10.0, 30.0);\n    println!(\"dx={:.2}, dy={:.2}\", dx, dy);\n}\n",
        notes: "Rust to_radians 벡터"
      },
      python: {
        lang: "python",
        entryFile: "trig.py",
        code: "import math\n\ndef movement(speed: float, deg: float) -> tuple[float, float]:\n    rad = math.radians(deg)\n    return (speed * math.cos(rad), speed * math.sin(rad))\n\nif __name__ == \"__main__\":\n    print(\"Move:\", movement(10, 30))\n",
        notes: "Python 삼각함수"
      },
      typescript: {
        lang: "typescript",
        entryFile: "trig.ts",
        code: "export function movement(speed: number, deg: number): { dx: number; dy: number } {\n  const rad = (deg * Math.PI) / 180;\n  return { dx: speed * Math.cos(rad), dy: speed * Math.sin(rad) };\n}\n\nconsole.log(movement(10, 30));\n",
        notes: "TS 속도 분해"
      },
      javascript: {
        lang: "javascript",
        entryFile: "trig.js",
        code: "function movement(speed, deg) {\n  const rad = (deg * Math.PI) / 180;\n  return { dx: speed * Math.cos(rad), dy: speed * Math.sin(rad) };\n}\nconsole.log(movement(10, 30));\n",
        notes: "JS 이동 벡터"
      }
    }
  }
];
