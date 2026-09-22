/**
 * scripts/curriculum/stage2_middle2.js
 * 중학교 2학년 수학:
 * 4. 일차함수와 직선의 방정식, 기울기
 * 5. 피타고라스 정리와 유클리드 거리
 */

module.exports = [
  // 4. 일차함수와 직선의 방정식, 기울기
  {
    id: "mod-1-4-linear-function",
    stage: "stage1-middle",
    order: 4,
    titleKo: "일차함수와 직선의 방정식, 기울기",
    titleEn: "Linear Functions, Slope, and Equations of Lines",
    koreanCurriculumUnit: "중학교 2학년 수학 - Ⅱ. 일차함수 (1. 일차함수와 그래프)",
    graphType: "LINEAR_FUNCTION",
    graphCaption: "y = ax + b 직선의 그래프와 x절편, y절편, x 증가량 대비 y 증가량(기울기 a)",
    terms: [
      { term: "변수와 함수 (Variable & Function)", definition: "변하는 값을 변수(x, y)라 하고, x의 값이 정해지면 그에 따라 y의 값이 오직 하나씩 정해지는 관계를 함수(y = f(x))라고 불러요." },
      { term: "일차함수 (Linear Function)", definition: "y = ax + b (a ≠ 0, a, b는 상수)처럼 x에 관한 일차식으로 나타내어지는 함수. 그래프는 반듯한 '직선' 모양!" },
      { term: "기울기 (Slope, a)", definition: "직선이 얼마나 가파르게 기울어져 있는지를 나타내는 비율. x가 1칸 갈 때 y가 몇 칸 올라가는지(가로 증가량 분의 세로 증가량 Δy/Δx)" },
      { term: "y절편 (y-intercept, b)", definition: "직선이 y축과 만나는 점의 y좌표. 즉, 출발점인 x = 0일 때의 y값" },
      { term: "x절편 (x-intercept)", definition: "직선이 x축과 만나는 점의 x좌표. 즉, 땅에 닿는 y = 0일 때의 x값 (-b/a)" },
      { term: "평행 (Parallel)", definition: "두 직선의 기울기 a가 같아서 아무리 길게 뻗어나가도 영원히 만나지 않는 관계" }
    ],
    mathExplanation: "택시를 타면 기본요금(b)이 있고 달린 거리(x)에 비례해서 요금(ax)이 올라갑니다. 이것이 바로 일차함수 y = ax + b입니다. x가 1, 2, 3으로 변할 때 y도 똑같은 간격으로 늘어납니다. 기울기 a가 양수(+)면 오른쪽 위로 올라가는 오르막길, 음수(-)면 오른쪽 아래로 내려가는 내리막길이 됩니다.",
    mathFormulasToTrace: [
      {
        title: "기울기 공식 (계단 오르기 비율)",
        latex: "a = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1} \\quad (x_1 \\ne x_2)",
        explanation: "두 점 (x1, y1)과 (x2, y2)를 잇는 직선의 기울기는 가로 변화량 분의 세로 변화량입니다."
      },
      {
        title: "일차함수의 표준형",
        latex: "y = ax + b \\quad (a: \\text{기울기}, \\ b: y\\text{절편})",
        explanation: "기울기 a와 y절편 b만 알면 평면 위의 모든 직선을 완벽하게 그릴 수 있습니다."
      },
      {
        title: "선형 보간(Lerp) 공식",
        latex: "\\operatorname{Lerp}(y_1, y_2, t) = y_1 + t(y_2 - y_1) \\quad (0 \\le t \\le 1)",
        explanation: "비율 t(0: 시작점, 1: 끝점)에 따라 두 점 사이를 부드럽게 직선으로 이어주는 공식입니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "Lerp",
        name: "선형 보간 (Linear Interpolation)",
        meaning: "Linear(선형/직선의) + Interpolation(사이값을 채우는 보간)의 축약 합성어입니다. 두 지점 사이를 일정한 직선 비율(t)로 부드럽게 이어주는 컴퓨터 그래픽스 및 게임 애니메이션의 필수 공식입니다."
      },
      {
        symbol: "y = ax + b",
        name: "일차함수 표준형 방정식",
        meaning: "x의 최고차수가 1차인 직선의 방정식입니다. 입력 x에 일정한 상수 a가 곱해지고 기본값 b가 더해져 꺾이지 않는 반듯한 직선이 됩니다."
      },
      {
        symbol: "a",
        name: "기울기 (Slope)",
        meaning: "직선이 기울어진 경사도입니다. x가 1칸 증가할 때 y가 몇 칸 변하는지의 비율이며, a > 0이면 우상향(오르막), a < 0이면 우하향(내리막)입니다."
      },
      {
        symbol: "b",
        name: "y절편 (y-intercept)",
        meaning: "직선이 y축과 만나는 절편(마디)입니다. x = 0일 때의 출발점 높이(기본요금)를 뜻합니다."
      },
      {
        symbol: "Δ (Delta)",
        name: "변화량 기호 (그리스 대문자 델타)",
        meaning: "차이(Difference)를 뜻하는 그리스 문자 대문자 Δ입니다. Δx = x2 - x1은 가로 밑변 이동량, Δy = y2 - y1은 세로 높이 변화량을 의미합니다."
      },
      {
        symbol: "Δy / Δx",
        name: "평균 변화율 / 기울기 분수",
        meaning: "가로 밑변 이동량 대비 세로 높이 변화량의 비율입니다. 등산로나 계단을 오를 때 발판 폭 대비 계단 높이의 비율과 같습니다."
      },
      {
        symbol: "t (0 ≤ t ≤ 1)",
        name: "보간 매개변수 (Time / Parameter)",
        meaning: "시간(Time) 또는 비율(Ratio)을 뜻하는 문자입니다. t = 0이면 시작점 y1이고, t = 1이면 끝점 y2이며, t = 0.5면 정확히 정중앙 50% 지점을 가리킵니다."
      },
      {
        symbol: "x1 ≠ x2",
        name: "분모 0 불가 조건",
        meaning: "두 점의 x좌표가 같으면 분모 Δx가 0이 되어 수학적으로 나눗셈이 성립하지 않습니다. 이때는 함수가 아닌 수직선(x = k)이 됩니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "y_1 = a x_1 + b, \\quad y_2 = a x_2 + b",
        justification: "직선 위의 서로 다른 두 점을 기본 일차함수 식에 대입합니다."
      },
      {
        stepNumber: 2,
        mathExpression: "y_2 - y_1 = (a x_2 + b) - (a x_1 + b) = a(x_2 - x_1)",
        justification: "두 식을 아래위로 빼면 y절편 b가 사라지고 순수한 증가량만 남습니다."
      },
      {
        stepNumber: 3,
        mathExpression: "a = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{\\Delta y}{\\Delta x}",
        justification: "양변을 x의 증가량으로 나누면 기울기 a가 수학적으로 유도됩니다."
      }
    ],
    derivationDetail: {
      title: "등산로 경사도에서 도출된 기울기(a) 공식의 비밀",
      backgroundStory: "스키장 슬로프나 등산로 표지판을 보면 '경사도 20%'라는 표현이 있습니다. 이는 앞으로 100m 걸어갈 때 위로 20m 올라간다는 뜻입니다. 수학자들은 직선의 가파른 정도를 숫자로 딱 떨어지게 정의하기 위해 '가로로 간 거리(밑변)' 대비 '세로로 올라간 높이'의 비율을 재기로 약속했습니다. 어떤 점 두 개를 골라 삼각형을 만들어도 비율이 항상 같다는 닮음의 원리가 이 수식의 뿌리입니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "\\Delta x = x_2 - x_1 \\quad (\\text{가로 밑변의 길이})",
          justification: "오른쪽 점의 x좌표에서 왼쪽 점의 x좌표를 빼서 가로로 이동한 거리를 구합니다."
        },
        {
          stepNumber: 2,
          mathExpression: "\\Delta y = y_2 - y_1 \\quad (\\text{세로 높이의 변화})",
          justification: "나중 높이 y2에서 처음 높이 y1을 빼서 수직으로 변한 높이를 구합니다."
        },
        {
          stepNumber: 3,
          mathExpression: "\\text{가파른 정도(기울기)} = \\frac{\\text{세로 높이 변화}}{\\text{가로 밑변 이동}} = \\frac{y_2 - y_1}{x_2 - x_1}",
          justification: "가로가 1칸 늘어날 때 세로가 변하는 순수한 단위 비율을 얻습니다."
        }
      ],
      conclusion: "기울기 a는 'x가 1 증가할 때 y는 얼만큼 변하는가?'를 나타내는 마법의 배율입니다."
    },
    workedExample: {
      problem: "두 점 A(1, 3)과 B(4, 9)를 지나는 일차함수의 기울기 a와 식 y = ax + b를 구하시오.",
      stepsToTrace: [
        "1단계: 가로 증가량 Δx = 4 - 1 = 3, 세로 증가량 Δy = 9 - 3 = 6이다.",
        "2단계: 기울기 a = 6 / 3 = 2이다. (x가 1칸 갈 때 y는 2칸씩 올라감)",
        "3단계: y = 2x + b 식에 점 A(1, 3)의 좌표를 대입한다 ➔ 3 = 2(1) + b ➔ b = 1.",
        "4단계: 따라서 구하는 식은 y = 2x + 1이다."
      ],
      finalAnswer: "기울기 a = 2, 식: y = 2x + 1 (y절편: 1, x절편: -0.5)"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 기울기와 y절편으로 직선 식 구하기",
        question: "기울기가 -3이고 점 (0, 5)를 지나는 일차함수의 식을 구하고, 이 그래프의 x절편을 구하시오.",
        interpretation: "점 (0, 5)는 x좌표가 0이므로 바로 'y절편 b = 5'를 친절하게 알려준 것입니다. y = ax + b에 a = -3, b = 5를 넣고, x절편은 y = 0을 대입하여 x를 풉니다.",
        solutionSteps: [
          "1단계: 기울기 a = -3이고 y절편 b = 5이므로 일차함수 식은 y = -3x + 5입니다.",
          "2단계: x절편을 구하기 위해 y에 0을 대입합니다 ➔ 0 = -3x + 5",
          "3단계: 일차방정식을 풉니다 ➔ 3x = 5 ➔ x = 5/3",
          "4단계: 따라서 그래프는 (5/3, 0)에서 x축과 만납니다."
        ],
        answer: "일차함수 식: y = -3x + 5, x절편: 5/3",
        keyPoint: "x절편은 y = 0일 때의 x값이고, y절편은 x = 0일 때의 y값입니다. 둘을 반대로 대입하지 않도록 주의하세요!"
      },
      {
        problemNumber: 2,
        title: "실전 문제: 두 점을 지나는 일차함수와 미지수 구하기",
        question: "두 점 (2, -1)과 (5, 8)을 지나는 직선 위에 점 (k, 14)가 있을 때, k의 값을 구하시오.",
        interpretation: "먼저 두 점을 이용해 기울기를 구하고 직선의 방정식을 완성합니다. 그 후 점 (k, 14)를 대입하여 k를 찾아냅니다.",
        solutionSteps: [
          "1단계: 기울기 a를 구합니다 ➔ a = [8 - (-1)] / (5 - 2) = (8 + 1) / 3 = 9 / 3 = 3",
          "2단계: y = 3x + b 식에 점 (2, -1)을 대입합니다 ➔ -1 = 3(2) + b ➔ -1 = 6 + b ➔ b = -7",
          "3단계: 완성된 일차함수 식은 y = 3x - 7입니다.",
          "4단계: 점 (k, 14)가 이 직선 위에 있으므로 대입합니다 ➔ 14 = 3k - 7",
          "5단계: 3k = 21 ➔ k = 7"
        ],
        answer: "k = 7",
        keyPoint: "어떤 점이 직선 위에 있다는 말은, 그 점의 좌표를 함수 식에 넣었을 때 등호가 참이 된다는 뜻입니다."
      },
      {
        problemNumber: 3,
        title: "응용 문제: 평행한 두 일차함수의 성질",
        question: "일차함수 y = ax - 4의 그래프가 y = 2x + 7의 그래프와 평행하고, 점 (3, m)을 지날 때 a + m의 값을 구하시오.",
        interpretation: "두 직선이 '평행'하다는 것은 기울기가 같다는 뜻입니다(a = 2). 기울기를 알아냈으니 함수 식을 완성하고 점 (3, m)을 대입해 m을 구합니다.",
        solutionSteps: [
          "1단계: 두 직선이 평행하므로 기울기가 같습니다 ➔ a = 2",
          "2단계: 따라서 첫 번째 일차함수 식은 y = 2x - 4가 됩니다.",
          "3단계: 이 직선이 점 (3, m)을 지나므로 대입합니다 ➔ m = 2(3) - 4 = 6 - 4 = 2",
          "4단계: 구하는 a + m의 값을 계산합니다 ➔ a + m = 2 + 2 = 4"
        ],
        answer: "a + m = 4",
        keyPoint: "기울기가 같고 y절편이 다르면 '평행(만나지 않음)'이고, y절편까지 같으면 '일치(완전히 겹침)'입니다."
      }
    ],
    csIntuition: "게임 프로그래밍에서 주인공이 A(10)에서 B(100)로 1초 동안 부드럽게 걸어갈 때 `position = Lerp(10, 100, t)`를 사용합니다. 이 Lerp(선형 보간)가 바로 두 점을 잇는 일차함수 직선 위의 현재 위치를 계산하는 공식입니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "linear_func.c",
        code: "#include <stdio.h>\n\ndouble calc_slope(double x1, double y1, double x2, double y2) {\n    return (y2 - y1) / (x2 - x1);\n}\n\ndouble lerp(double start, double end, double t) {\n    return start + t * (end - start);\n}\n\nint main(void) {\n    printf(\"Slope: %.2f\\n\", calc_slope(1, 3, 4, 9));\n    printf(\"Lerp 50%%: %.2f\\n\", lerp(10, 100, 0.5));\n    return 0;\n}\n",
        notes: "C23 기울기 및 Lerp 구현"
      },
      go: {
        lang: "go",
        entryFile: "linear_func.go",
        code: "package main\n\nimport \"fmt\"\n\nfunc Slope(x1, y1, x2, y2 float64) float64 {\n\treturn (y2 - y1) / (x2 - x1)\n}\n\nfunc Lerp(start, end, t float64) float64 {\n\treturn start + t*(end-start)\n}\n\nfunc main() {\n\tfmt.Println(\"Slope:\", Slope(1, 3, 4, 9))\n\tfmt.Println(\"Lerp:\", Lerp(10, 100, 0.5))\n}\n",
        notes: "Go 64비트 실수 선형 보간"
      },
      rust: {
        lang: "rust",
        entryFile: "linear_func.rs",
        code: "pub fn slope(x1: f64, y1: f64, x2: f64, y2: f64) -> f64 {\n    (y2 - y1) / (x2 - x1)\n}\n\npub fn lerp(start: f64, end: f64, t: f64) -> f64 {\n    start + t * (end - start)\n}\n\nfn main() {\n    println!(\"Slope: {}\", slope(1.0, 3.0, 4.0, 9.0));\n    println!(\"Lerp: {}\", lerp(10.0, 100.0, 0.5));\n}\n",
        notes: "Rust 고속 보간 계산기"
      },
      python: {
        lang: "python",
        entryFile: "linear_func.py",
        code: "def slope(x1: float, y1: float, x2: float, y2: float) -> float:\n    return (y2 - y1) / (x2 - x1)\n\ndef lerp(start: float, end: float, t: float) -> float:\n    return start + t * (end - start)\n\nif __name__ == \"__main__\":\n    print(\"Slope:\", slope(1, 3, 4, 9))\n    print(\"Lerp:\", lerp(10, 100, 0.5))\n",
        notes: "Python Lerp"
      },
      typescript: {
        lang: "typescript",
        entryFile: "linear_func.ts",
        code: "export function slope(x1: number, y1: number, x2: number, y2: number): number {\n  return (y2 - y1) / (x2 - x1);\n}\n\nexport function lerp(start: number, end: number, t: number): number {\n  return start + t * (end - start);\n}\n\nconsole.log(`Slope: ${slope(1, 3, 4, 9)}`);\n",
        notes: "TS 선형 보간 모듈"
      },
      javascript: {
        lang: "javascript",
        entryFile: "linear_func.js",
        code: "function slope(x1, y1, x2, y2) {\n  return (y2 - y1) / (x2 - x1);\n}\nfunction lerp(start, end, t) {\n  return start + t * (end - start);\n}\nconsole.log(\"Slope:\", slope(1, 3, 4, 9));\n",
        notes: "JS Lerp 함수"
      }
    }
  },

  // 5. 피타고라스 정리와 유클리드 거리
  {
    id: "mod-1-5-pythagoras-distance",
    stage: "stage1-middle",
    order: 5,
    titleKo: "피타고라스 정리와 유클리드 거리",
    titleEn: "Pythagorean Theorem and Euclidean Distance",
    koreanCurriculumUnit: "중학교 2학년 수학 - Ⅵ. 도형의 성질 (피타고라스 정리)",
    graphType: "PYTHAGORAS",
    graphCaption: "직각삼각형의 직각을 낀 두 변의 정사각형 넓이의 합은 빗변의 정사각형 넓이와 같습니다 (3² + 4² = 5²)",
    terms: [
      { term: "직각삼각형 (Right Triangle)", definition: "세 내각 중 한 각이 90°(직각)인 삼각형" },
      { term: "빗변 (Hypotenuse)", definition: "직각삼각형에서 직각(90°)의 맞은편에 있는 가장 긴 변 (기호: c)" },
      { term: "피타고라스 정리", definition: "직각삼각형에서 직각을 낀 두 변 a, b와 빗변 c 사이에 a² + b² = c²이 항상 성립한다는 기하학의 대법칙" },
      { term: "피타고라스 삼조 (Pythagorean Triples)", definition: "a² + b² = c²을 만족하는 예쁜 세 자연수 쌍 (가장 유명한 세트: 3-4-5, 5-12-13, 8-15-17)" },
      { term: "유클리드 거리 (L2 Norm)", definition: "평면이나 입체 공간에서 두 점 사이를 가장 곧게 이은 최단 직선 거리" }
    ],
    mathExplanation: "인류 역사상 가장 아름답고 유명한 정리입니다. 가로로 3m, 세로로 4m 꺾인 길을 갈 때, 대각선으로 가로지르면 몇 미터일까요? 피타고라스 정리에 따르면 3²(9) + 4²(16) = 25 = 5²이므로 대각선 길이는 정확히 5m가 됩니다! 이 원리를 좌표평면에 가져오면 두 점 사이의 최단 거리를 구하는 만능 열쇠가 됩니다.",
    mathFormulasToTrace: [
      {
        title: "피타고라스 정리 기본 공식",
        latex: "a^2 + b^2 = c^2 \\implies c = \\sqrt{a^2 + b^2}",
        explanation: "빗변의 길이는 두 직각변의 제곱의 합에 루트(제곱근)를 씌운 값입니다."
      },
      {
        title: "2차원 평면 두 점 사이의 거리 공식",
        latex: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
        explanation: "가로 거리 Δx와 세로 거리 Δy로 직각삼각형을 만들면 빗변 d가 곧 두 점 사이의 거리가 됩니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "a, b",
        name: "직각을 낀 두 변 (Legs / 직각변)",
        meaning: "직각삼각형에서 90° 직각을 마주보고 끼고 있는 밑변과 높이입니다."
      },
      {
        symbol: "c",
        name: "빗변 (Hypotenuse)",
        meaning: "직각(90°)의 바로 맞은편에 위치한 가장 긴 대각선 변입니다. 영어 Hypotenuse는 '아래로 팽팽하게 뻗은 줄'이라는 그리스어에서 유래했습니다."
      },
      {
        symbol: "a², b², c²",
        name: "거듭제곱 (정사각형의 넓이)",
        meaning: "각 변의 길이를 한 변으로 하는 정사각형의 실제 면적을 뜻합니다. (예: a = 3이면 3 × 3 = 9면적)"
      },
      {
        symbol: "√ (Radical / Root)",
        name: "제곱근 기호 (루트)",
        meaning: "뿌리를 뜻하는 라틴어 radix의 첫 글자 r을 길게 늘어뜨린 기호입니다. 제곱해서 그 안의 수가 되는 원래의 양수 길이를 되돌려줍니다."
      },
      {
        symbol: "d",
        name: "유클리드 거리 (Distance / L2 Norm)",
        meaning: "거리(Distance)의 머리글자 d입니다. 두 점 사이를 가장 똑바로 이은 최단 직선 거리입니다."
      },
      {
        symbol: "(x2 - x1)²",
        name: "가로 차이의 제곱",
        meaning: "두 점의 가로 간격(밑변)의 제곱입니다. x2 - x1이 음수가 나오더라도 제곱하면 항상 양수가 되어 거리가 정확히 보장됩니다."
      },
      {
        symbol: "(y2 - y1)²",
        name: "세로 차이의 제곱",
        meaning: "두 점의 세로 높이 차이(높이)의 제곱입니다. 가로 제곱과 더해 빗변 제곱을 만듭니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "\\text{큰 정사각형 넓이} = (a + b)^2 = a^2 + 2ab + b^2",
        justification: "한 변의 길이가 (a + b)인 큰 정사각형의 넓이를 구합니다."
      },
      {
        stepNumber: 2,
        mathExpression: "\\text{조각들의 합} = c^2 + 4 \\times \\left(\\frac{1}{2}ab\\right) = c^2 + 2ab",
        justification: "가운데 기울어진 정사각형(c²)과 네 귀퉁이 직각삼각형 4개의 넓이를 합칩니다."
      },
      {
        stepNumber: 3,
        mathExpression: "a^2 + 2ab + b^2 = c^2 + 2ab \\implies a^2 + b^2 = c^2",
        justification: "양변에서 똑같은 2ab를 빼내면 a² + b² = c²이 완벽하게 도출됩니다!"
      }
    ],
    derivationDetail: {
      title: "정사각형 종이접기에서 탄생한 피타고라스 정리의 증명",
      backgroundStory: "고대 그리스의 수학자 피타고라스는 바닥 타일을 바라보다가 놀라운 사실을 발견했습니다. 직각삼각형의 세 변을 한 변으로 하는 정사각형 3개를 그렸을 때, 작은 두 정사각형의 넓이를 오려 붙이면 빗변의 커다란 정사각형 넓이와 완벽하게 포개어진다는 것입니다. 이것을 한 변이 (a+b)인 큰 사각형 안에서 증명할 수 있습니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "\\text{한 변이 } (a+b) \\text{인 정사각형 안에 직각삼각형 4개를 배치}",
          justification: "네 귀퉁이에 밑변 a, 높이 b인 직각삼각형 4개를 두면 가운데에 한 변이 c인 정사각형이 생깁니다."
        },
        {
          stepNumber: 2,
          mathExpression: "(a + b)^2 = c^2 + 4 \\times \\left(\\frac{1}{2}ab\\right)",
          justification: "전체 큰 사각형의 넓이는 가운데 사각형 넓이 c²과 직각삼각형 4개의 넓이의 합과 같습니다."
        },
        {
          stepNumber: 3,
          mathExpression: "a^2 + 2ab + b^2 = c^2 + 2ab \\iff a^2 + b^2 = c^2",
          justification: "양쪽에서 삼각형 4개 분량인 2ab를 떼어내면 a² + b² = c²만 남습니다."
        }
      ],
      conclusion: "직각삼각형의 두 변의 제곱을 더하면 항상 빗변의 제곱이 된다는 불변의 기하학적 진리가 증명되었습니다."
    },
    workedExample: {
      problem: "직각삼각형의 두 직각변의 길이가 a = 6, b = 8일 때 빗변 c의 길이를 구하시오.",
      stepsToTrace: [
        "1단계: 두 변을 제곱한다 ➔ a² = 6² = 36, b² = 8² = 64.",
        "2단계: 두 제곱의 합을 구한다 ➔ 36 + 64 = 100.",
        "3단계: 피타고라스 정리 c² = 100이므로 양의 제곱근을 취한다 ➔ c = √100 = 10.",
        "결론: 빗변의 길이는 10이다 (3:4:5의 2배 확대형!)."
      ],
      finalAnswer: "빗변 c = 10"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 피타고라스 정리를 이용한 직각변 구하기",
        question: "직각삼각형의 빗변의 길이가 13이고 한 직각변의 길이가 5일 때, 나머지 한 변의 길이를 구하시오.",
        interpretation: "빗변이 13(c = 13)이고 한 변이 5(a = 5)이므로 a² + b² = c² 식에 대입하여 b² = c² - a²으로 풉니다.",
        solutionSteps: [
          "1단계: 피타고라스 정리 식을 세웁니다 ➔ 5² + b² = 13²",
          "2단계: 제곱수를 계산합니다 ➔ 25 + b² = 169",
          "3단계: b²만 남기고 이항합니다 ➔ b² = 169 - 25 = 144",
          "4단계: 144는 12의 제곱이므로 양의 제곱근을 취합니다 ➔ b = √144 = 12"
        ],
        answer: "나머지 한 변의 길이 = 12",
        keyPoint: "빗변을 구할 때는 더하지만(a²+b²), 직각변을 구할 때는 빗변의 제곱에서 빼야(c²-a²) 한다는 점을 절대 혼동하지 마세요!"
      },
      {
        problemNumber: 2,
        title: "실전 문제: 좌표평면 위 두 점 사이의 거리 계산",
        question: "좌표평면 위의 두 점 A(-1, 2)와 B(3, 5) 사이의 직선 거리를 구하시오.",
        interpretation: "가로 차이 Δx와 세로 차이 Δy를 각각 구하여 피타고라스 거리 공식 d = √(Δx² + Δy²)에 대입합니다.",
        solutionSteps: [
          "1단계: 가로 밑변 Δx를 구합니다 ➔ 3 - (-1) = 3 + 1 = 4",
          "2단계: 세로 높이 Δy를 구합니다 ➔ 5 - 2 = 3",
          "3단계: 각각 제곱하여 더합니다 ➔ 4² + 3² = 16 + 9 = 25",
          "4단계: 양의 제곱근을 취합니다 ➔ d = √25 = 5"
        ],
        answer: "두 점 사이의 거리 d = 5",
        keyPoint: "좌표에 음수가 있을 때 (-1)을 뺄셈하면 부호가 +로 바뀌는 것에 주의하세요."
      },
      {
        problemNumber: 3,
        title: "응용 문제: 게임 충돌 판정과 제곱 비교 최적화",
        question: "원점 (0,0)에 반지름이 3인 몬스터가 있고, 좌표 (5, 6)에 반지름이 4인 플레이어가 있을 때, 두 캐릭터가 충돌했는지 판정하시오. (루트 계산 없이 판별식 사용)",
        interpretation: "두 원이 충돌하려면 두 중심 사이의 거리 d가 두 반지름의 합(r1 + r2) 이하이어야 합니다. 즉, d² ≤ (r1 + r2)²인지 거리의 제곱끼리 비교합니다.",
        solutionSteps: [
          "1단계: 중심 사이의 거리의 제곱 d²을 구합니다.",
          "   d² = (5 - 0)² + (6 - 0)² = 5² + 6² = 25 + 36 = 61",
          "2단계: 두 반지름의 합의 제곱 (r1 + r2)²을 구합니다.",
          "   r1 + r2 = 3 + 4 = 7이므로 7² = 49",
          "3단계: 두 값을 비교합니다 ➔ 61 > 49 (d² > (r1 + r2)²)",
          "4단계: 두 중심 사이의 거리가 반지름 합보다 크므로 충돌하지 않았습니다."
        ],
        answer: "충돌하지 않음 (거리의 제곱 61 > 반지름합의 제곱 49)",
        keyPoint: "컴퓨터 게임에서는 sqrt()를 쓰지 않고 거리의 제곱끼리 비교하는 이 방법이 초당 60프레임을 유지하는 핵심 기술입니다!"
      }
    ],
    csIntuition: "수천 개의 총알과 비행기가 날아다니는 탄막 슈팅 게임에서 매 프레임마다 `Math.sqrt()`를 부르면 CPU에 불이 납니다. 피타고라스 정리의 제곱 비교 공식 `dx*dx + dy*dy <= r_sum*r_sum`을 쓰면 초고속 충돌 검사가 가능합니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "distance.c",
        code: "#include <stdio.h>\n#include <math.h>\n\ndouble distance_2d(double x1, double y1, double x2, double y2) {\n    double dx = x2 - x1;\n    double dy = y2 - y1;\n    return sqrt(dx * dx + dy * dy);\n}\n\nint is_circle_colliding(double x1, double y1, double r1, double x2, double y2, double r2) {\n    double dx = x2 - x1;\n    double dy = y2 - y1;\n    double r_sum = r1 + r2;\n    return (dx * dx + dy * dy) <= (r_sum * r_sum); // sqrt 생략\n}\n\nint main(void) {\n    printf(\"Dist: %.2f\\n\", distance_2d(-1, 2, 3, 5));\n    printf(\"Colliding: %d\\n\", is_circle_colliding(0, 0, 3, 5, 6, 4));\n    return 0;\n}\n",
        notes: "C23 제곱 비교 충돌 최적화"
      },
      go: {
        lang: "go",
        entryFile: "distance.go",
        code: "package main\n\nimport (\n\t\"fmt\"\n\t\"math\"\n)\n\nfunc Distance(x1, y1, x2, y2 float64) float64 {\n\tdx, dy := x2-x1, y2-y1\n\treturn math.Sqrt(dx*dx + dy*dy)\n}\n\nfunc main() {\n\tfmt.Println(\"Dist:\", Distance(-1, 2, 3, 5))\n}\n",
        notes: "Go 2D 거리"
      },
      rust: {
        lang: "rust",
        entryFile: "distance.rs",
        code: "pub fn distance(x1: f64, y1: f64, x2: f64, y2: f64) -> f64 {\n    let dx = x2 - x1;\n    let dy = y2 - y1;\n    (dx * dx + dy * dy).sqrt()\n}\n\nfn main() {\n    println!(\"Dist: {}\", distance(-1.0, 2.0, 3.0, 5.0));\n}\n",
        notes: "Rust f64 sqrt"
      },
      python: {
        lang: "python",
        entryFile: "distance.py",
        code: "import math\n\ndef distance(x1: float, y1: float, x2: float, y2: float) -> float:\n    return math.hypot(x2 - x1, y2 - y1)\n\nif __name__ == \"__main__\":\n    print(\"Dist:\", distance(-1, 2, 3, 5))\n",
        notes: "Python math.hypot"
      },
      typescript: {
        lang: "typescript",
        entryFile: "distance.ts",
        code: "export function distance(x1: number, y1: number, x2: number, y2: number): number {\n  return Math.hypot(x2 - x1, y2 - y1);\n}\n\nconsole.log(`Dist: ${distance(-1, 2, 3, 5)}`);\n",
        notes: "TS Math.hypot"
      },
      javascript: {
        lang: "javascript",
        entryFile: "distance.js",
        code: "function distance(x1, y1, x2, y2) {\n  return Math.hypot(x2 - x1, y2 - y1);\n}\nconsole.log(\"Dist:\", distance(-1, 2, 3, 5));\n",
        notes: "JS 거리 계산"
      }
    }
  }
];
