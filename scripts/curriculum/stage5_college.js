/**
 * scripts/curriculum/stage5_college.js
 * 대학 컴퓨터공학 & AI 수학:
 * 13. 벡터의 기본 연산과 내적 (Dot Product)
 * 14. 행렬과 가우스 소거법, 기약행사다리꼴(RREF)
 * 15. 편미분과 인공지능 경사하강법(Gradient Descent)
 */

module.exports = [
  // 13. 벡터의 기본 연산과 내적 (Dot Product)
  {
    id: "mod-4-1-vectors-dot-product",
    stage: "stage4-linear-algebra",
    order: 13,
    titleKo: "벡터의 기본 연산과 내적 (Dot Product)",
    titleEn: "Vector Operations, Dot Products, and Orthogonality",
    koreanCurriculumUnit: "대학 선형대수학 - Ⅰ. 벡터 공간과 내적 (Vectors and Inner Products)",
    graphType: "COORDINATE_PLANE",
    graphCaption: "좌표평면 위의 원점에서 뻗어나가는 두 화살표(벡터)의 사이 각도 θ와 내적 a · b = |a||b| cos θ",
    terms: [
      { term: "스칼라 (Scalar)", definition: "크기(양)만을 갖는 단일 숫자 (예: 몸무게 45kg, 기온 20℃, 시간 10초)" },
      { term: "벡터 (Vector)", definition: "크기뿐만 아니라 '방향'까지 함께 갖는 물리량 (화살표로 표현! 예: 북동쪽으로 시속 50km의 바람)" },
      { term: "벡터의 크기/노름 (Norm, ||v||)", definition: "화살표의 순수한 길이. 피타고라스 정리에 의해 ||v|| = √(x² + y²)" },
      { term: "내적 (Dot Product, a · b)", definition: "두 벡터의 성분끼리 곱해서 모두 더한 스칼라 값. 두 화살표가 '얼마나 같은 방향을 가리키는가?'를 측정" },
      { term: "직교 (Orthogonal)", definition: "두 벡터가 정확히 90° 직각을 이루어 내적이 0이 되는 상태 (서로 아무런 상관이 없음)" }
    ],
    mathExplanation: "중학교 때 배운 좌표평면의 점 (x, y)에 원점 (0,0)에서 출발하는 화살표를 그리면 그것이 바로 '벡터(Vector)'입니다. 게임 속 캐릭터의 시선 방향, 바람의 세기, 인공지능의 단어 의미 등 방향이 있는 모든 것은 벡터로 표현됩니다. 특히 '내적(Dot Product)'은 두 화살표가 나란하면 최대가 되고, 90도 직각이면 0이 되는 놀라운 성질을 가져 인공지능 유사도 검색의 절대적인 표준입니다.",
    mathFormulasToTrace: [
      {
        title: "벡터 내적의 대수적 계산법 (성분 곱의 합)",
        latex: "\\vec{a} \\cdot \\vec{b} = a_x b_x + a_y b_y = \\sum_{i=1}^n a_i b_i",
        explanation: "x끼리 곱하고 y끼리 곱해서 더해주기만 하면 스칼라 숫자 하나가 나옵니다."
      },
      {
        title: "벡터 내적의 기하학적 정의",
        latex: "\\vec{a} \\cdot \\vec{b} = \\|\\vec{a}\\| \\|\\vec{b}\\| \\cos\\theta",
        explanation: "두 벡터의 길이 곱하기 두 화살표 사이 각도의 코사인 값과 항상 일치합니다."
      },
      {
        title: "코사인 유사도 (Cosine Similarity, AI 검색 공식)",
        latex: "\\cos\\theta = \\frac{\\vec{a} \\cdot \\vec{b}}{\\|\\vec{a}\\| \\|\\vec{b}\\|}",
        explanation: "내적을 두 벡터의 길이로 나누면 -1부터 1 사이의 방향 일치도가 나옵니다 (1: 완전 일치, 0: 직교, -1: 정반대)."
      }
    ],
    symbolGuide: [
      {
        symbol: "CosSim",
        name: "코사인 유사도 (Cosine Similarity)",
        meaning: "Cosine(코사인) + Similarity(유사도/닮음)의 축약어입니다. 두 벡터(화살표)의 사이각 θ를 통해 방향이 얼마나 일치하는지를 -1(정반대)부터 0(직교 무관)을 거쳐 1(완벽 일치) 사이의 실수 점수로 평가하는 AI 검색 및 추천 알고리즘의 표준 공식입니다."
      },
      {
        symbol: "a⃗ (Vector)",
        name: "벡터 화살표 기호",
        meaning: "문자 머리 위에 작은 화살표(→)를 얹어 단순한 크기(스칼라)가 아니라 '방향'까지 함께 가진 물리량임을 표시하는 기호입니다."
      },
      {
        symbol: "· (Dot)",
        name: "점곱 / 스칼라 내적 기호 (Dot Product)",
        meaning: "두 벡터 사이에 점(·)을 찍어 내적 연산을 지시합니다. 결과는 방향이 없는 단 하나의 순수한 숫자(스칼라)가 나옵니다."
      },
      {
        symbol: "||v|| (Norm)",
        name: "벡터의 노름 / 길이 (Norm)",
        meaning: "두 줄 수직 막대(|| ||)는 화살표의 순수한 물리적 길이(크기)를 뜻합니다. 피타고라스 정리에 의해 ||v|| = √(vx² + vy²)로 계산됩니다."
      },
      {
        symbol: "ax bx + ay by",
        name: "성분별 내적 합산식",
        meaning: "두 벡터의 x성분끼리 곱하고 y성분끼리 곱해서 더하면 기하학적 길이와 각도를 몰라도 컴퓨터가 빛의 속도로 내적을 구할 수 있습니다."
      },
      {
        symbol: "cos θ",
        name: "방향 일치 계수",
        meaning: "두 화살표 사이 각도 θ의 코사인 값입니다. θ = 0°(나란함)이면 1, θ = 90°(직교)이면 0, θ = 180°(반대)이면 -1이 됩니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "\\|\\vec{a} - \\vec{b}\\|^2 = (a_x - b_x)^2 + (a_y - b_y)^2 = a_x^2 + a_y^2 + b_x^2 + b_y^2 - 2(a_x b_x + a_y b_y)",
        justification: "두 화살표 끝점을 잇는 차 벡터의 길이 제곱을 성분으로 전개합니다."
      },
      {
        stepNumber: 2,
        mathExpression: "\\|\\vec{a} - \\vec{b}\\|^2 = \\|\\vec{a}\\|^2 + \\|\\vec{b}\\|^2 - 2\\|\\vec{a}\\|\\|\\vec{b}\\|\\cos\\theta",
        justification: "삼각형의 제2 코사인 법칙을 적용하여 기하학적 길이와 각도 식을 세웁니다."
      },
      {
        stepNumber: 3,
        mathExpression: "a_x b_x + a_y b_y = \\|\\vec{a}\\| \\|\\vec{b}\\| \\cos\\theta",
        justification: "두 식을 대조하여 양변의 길이 제곱을 지우고 -2로 나누면 내적 공식이 완벽히 증명됩니다!"
      }
    ],
    derivationDetail: {
      title: "빛과 그림자 투영에서 유도된 내적의 물리적 의미",
      backgroundStory: "햇빛이 수직으로 비칠 때 바닥에 생기는 막대기의 '그림자 길이'를 상상해 보세요. 화살표 a를 화살표 b 위에 수직으로 그림자를 드리우면 그림자 길이는 ||a|| cos θ가 됩니다. 여기에 바닥 화살표의 길이 ||b||를 곱한 수치가 바로 '내적 a · b'입니다. 즉, 내적은 '한 벡터가 다른 벡터의 방향으로 얼마나 힘을 보태고 있는가?'를 측정한 값입니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "\\text{정사영 그림자 길이} = \\|\\vec{a}\\| \\cos\\theta",
          justification: "삼각비 직각삼각형에서 빗변 ||a||에 코사인을 곱하면 밑변(그림자) 길이가 됩니다."
        },
        {
          stepNumber: 2,
          mathExpression: "\\vec{a} \\cdot \\vec{b} = \\|\\vec{b}\\| \\times (\\|\\vec{a}\\| \\cos\\theta)",
          justification: "두 화살표의 같은 방향 성분끼리의 순수한 곱이 완성됩니다."
        }
      ],
      conclusion: "두 화살표가 90도 수직(직교)이면 그림자가 0이 되므로 내적은 무조건 0이 됩니다."
    },
    workedExample: {
      problem: "두 벡터 a = (3, 4)와 b = (4, 0)의 내적 a · b와 코사인 유사도를 구하시오.",
      stepsToTrace: [
        "1단계: 내적 대수 계산 ➔ a · b = (3 × 4) + (4 × 0) = 12 + 0 = 12.",
        "2단계: a의 길이 ➔ ||a|| = √(3² + 4²) = √25 = 5.",
        "3단계: b의 길이 ➔ ||b|| = √(4² + 0²) = 4.",
        "4단계: 코사인 유사도 ➔ cos θ = 12 / (5 × 4) = 12 / 20 = 0.6."
      ],
      finalAnswer: "내적 = 12, 코사인 유사도 = 0.6 (약 53도 각도)"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 두 벡터의 내적과 수직 판정",
        question: "두 벡터 u = (2, -3)과 v = (6, 4)의 내적 u · v를 구하고, 두 벡터가 직교(수직)하는지 판정하시오.",
        interpretation: "성분별 곱의 합 u_x v_x + u_y v_y를 계산합니다. 내적 결과가 정확히 0이면 두 화살표는 90도 직교합니다.",
        solutionSteps: [
          "1단계: x성분끼리 곱합니다 ➔ 2 × 6 = 12",
          "2단계: y성분끼리 곱합니다 ➔ (-3) × 4 = -12",
          "3단계: 두 곱을 더합니다 ➔ 12 + (-12) = 0",
          "4단계: 내적이 0이므로 두 벡터는 서로 직교(수직)합니다."
        ],
        answer: "내적 u · v = 0 (두 벡터는 직교함)",
        keyPoint: "내적이 0이면 두 화살표는 사이 각도가 90° 직각이라는 뜻입니다!"
      },
      {
        problemNumber: 2,
        title: "실전 문제: AI 검색에서의 코사인 유사도 비교",
        question: "질문 벡터 Q = (1, 1)이 주어졌을 때, 문서 A = (3, 3)과 문서 B = (0, 4) 중 어느 문서가 질문 Q와 더 의미가 유사한지 코사인 유사도로 판정하시오.",
        interpretation: "코사인 유사도는 벡터의 길이가 아무리 길어도 방향이 얼마나 일치하는지를 봅니다. cos θ 공식으로 두 문서의 유사도를 계산해 비교합니다.",
        solutionSteps: [
          "1단계 (문서 A 비교):",
          "   Q · A = (1 × 3) + (1 × 3) = 6",
          "   ||Q|| = √(1² + 1²) = √2, ||A|| = √(3² + 3²) = √18 = 3√2",
          "   cos θ_A = 6 / (√2 × 3√2) = 6 / 6 = 1.0 (방향이 완벽히 100% 일치!)",
          "2단계 (문서 B 비교):",
          "   Q · B = (1 × 0) + (1 × 4) = 4",
          "   ||B|| = √(0² + 4²) = 4",
          "   cos θ_B = 4 / (√2 × 4) = 1 / √2 ≈ 0.707 (45도 차이)",
          "3단계: cos θ_A(1.0) > cos θ_B(0.707)이므로 문서 A가 훨씬 유사합니다."
        ],
        answer: "문서 A (유사도 1.0으로 완벽 일치)",
        keyPoint: "ChatGPT나 네이버 검색엔진이 수억 개의 문서 중 정답을 찾을 때 이 코사인 유사도를 씁니다."
      }
    ],
    csIntuition: "3D 그래픽스에서 벽면에 빛이 얼마나 밝게 비치는지 계산하는 퐁 셰이딩(Phong Shading)은 빛 화살표(Light)와 벽면 수직 화살표(Normal)의 내적 `L · N`으로 조명을 실시간 렌더링합니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "dot.c",
        code: "#include <stdio.h>\n#include <math.h>\ntypedef struct { double x, y; } Vec;\ndouble dot(Vec a, Vec b) { return a.x * b.x + a.y * b.y; }\ndouble norm(Vec v) { return sqrt(v.x * v.x + v.y * v.y); }\ndouble cos_sim(Vec a, Vec b) { return dot(a, b) / (norm(a) * norm(b)); }\nint main(void) {\n    Vec a = {3, 4}, b = {4, 0};\n    printf(\"Dot=%.1f, CosSim=%.2f\\n\", dot(a, b), cos_sim(a, b));\n    return 0;\n}\n",
        notes: "C23 벡터 내적 및 코사인 유사도"
      },
      go: {
        lang: "go",
        entryFile: "dot.go",
        code: "package main\nimport (\"fmt\"; \"math\")\ntype Vec struct{ X, Y float64 }\nfunc (a Vec) Dot(b Vec) float64 { return a.X*b.X + a.Y*b.Y }\nfunc (v Vec) Norm() float64 { return math.Sqrt(v.X*v.X + v.Y*v.Y) }\nfunc main() {\n    a, b := Vec{3, 4}, Vec{4, 0}\n    fmt.Printf(\"CosSim=%.2f\\n\", a.Dot(b)/(a.Norm()*b.Norm()))\n}\n",
        notes: "Go 메서드 벡터"
      },
      rust: {
        lang: "rust",
        entryFile: "dot.rs",
        code: "fn main() {\n    let (ax, ay, bx, by) = (3.0, 4.0, 4.0, 0.0);\n    let dot = ax*bx + ay*by;\n    let norm_a = (ax*ax + ay*ay).sqrt();\n    let norm_b = (bx*bx + by*by).sqrt();\n    println!(\"CosSim: {:.2}\", dot / (norm_a * norm_b));\n}\n",
        notes: "Rust 코사인 유사도"
      },
      python: {
        lang: "python",
        entryFile: "dot.py",
        code: "import math\na, b = [3, 4], [4, 0]\ndot = sum(x*y for x, y in zip(a, b))\nsim = dot / (math.hypot(*a) * math.hypot(*b))\nprint(f\"CosSim: {sim:.2f}\")\n",
        notes: "Python 벡터 유사도"
      },
      typescript: {
        lang: "typescript",
        entryFile: "dot.ts",
        code: "const a = [3, 4], b = [4, 0];\nconst dot = a[0]*b[0] + a[1]*b[1];\nconst sim = dot / (Math.hypot(...a) * Math.hypot(...b));\nconsole.log(`CosSim: ${sim.toFixed(2)}`);\n",
        notes: "TS 코사인 유사도"
      },
      javascript: {
        lang: "javascript",
        entryFile: "dot.js",
        code: "const a = [3, 4], b = [4, 0];\nconst dot = a[0]*b[0] + a[1]*b[1];\nconsole.log(\"CosSim:\", (dot / (Math.hypot(...a) * Math.hypot(...b))).toFixed(2));\n",
        notes: "JS 코사인 유사도"
      }
    }
  },

  // 14. 행렬과 가우스 소거법, 기약행사다리꼴(RREF)
  {
    id: "mod-4-2-gaussian-elimination-rref",
    stage: "stage4-linear-algebra",
    order: 14,
    titleKo: "행렬과 가우스 소거법, 기약행사다리꼴(RREF)",
    titleEn: "Matrix Operations, Gaussian Elimination, and RREF",
    koreanCurriculumUnit: "대학 선형대수학 - Ⅱ. 연립일차방정식과 행렬 (Gaussian Elimination)",
    graphType: "NONE",
    graphCaption: "미지수가 수십 개인 연립방정식을 엑셀 격자표 같은 행렬로 변환하여 0을 채워 넣으며 컴퓨터가 단번에 해를 구하는 알고리즘",
    terms: [
      { term: "행렬 (Matrix)", definition: "숫자들을 직사각형 모양의 괄호 안에 행(가로줄)과 열(세로줄)로 깔끔하게 정리해 놓은 수의 표" },
      { term: "확대행렬 (Augmented Matrix)", definition: "연립방정식에서 미지수 x, y, z를 떼어내고 계수 숫자들과 우변 상수항만 모아놓은 행렬" },
      { term: "기본 행 연산", definition: "방정식의 해를 바꾸지 않는 3가지 조작: 두 줄 맞바꾸기, 한 줄에 숫자 곱하기, 한 줄의 배수를 다른 줄에 더하기" },
      { term: "피벗 (Pivot)", definition: "각 가로줄에서 0이 아닌 가장 앞선 대장 숫자" },
      { term: "기약행사다리꼴 (RREF)", definition: "대각선 피벗들을 모두 1로 만들고, 피벗의 위아래를 모두 0으로 싹 지워버려 정답이 한눈에 보이는 완성된 형태" }
    ],
    mathExplanation: "중2 때 미지수가 2개인 연립방정식(가감법)을 배웠습니다. 하지만 공장에서 제품 100개를 생산하거나 3D 그래픽스에서 물체를 회전시킬 때는 미지수가 100개, 1000개로 늘어납니다. 수학자 가우스는 문자를 다 떼어내고 숫자 표(행렬)만 남긴 뒤, 위에서부터 아래로 0을 계단 모양으로 채워 넣으며 컴퓨터 루프 문으로 순식간에 해를 푸는 '가우스 소거법'을 정립했습니다.",
    mathFormulasToTrace: [
      {
        title: "기본 행 연산 3대 법칙",
        latex: "\\begin{cases} R_i \\leftrightarrow R_j & (\\text{두 행을 교환}) \\\\ k R_i \\to R_i & (\\text{행에 0 아닌 상수 } k \\text{배}) \\\\ R_i + k R_j \\to R_i & (\\text{다른 행의 } k\\text{배를 더함}) \\end{cases}",
        explanation: "이 3가지 조작은 중학교 때 배운 '양변에 같은 수를 곱하거나 더해도 해는 같다'는 성질과 완전히 같습니다."
      },
      {
        title: "기약행사다리꼴(RREF) 해 판독 공식",
        latex: "\\begin{pmatrix} 1 & 0 & | & c_1 \\\\ 0 & 1 & | & c_2 \\end{pmatrix} \\implies x = c_1, \\ y = c_2",
        explanation: "왼쪽이 단위행렬(1과 0)로 정리되면 오른쪽 상수항 열이 곧바로 최종 정답이 됩니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "RREF",
        name: "기약행사다리꼴 (Reduced Row Echelon Form)",
        meaning: "Reduced(기약된/단순화된) + Row(행) + Echelon(사다리꼴 계단) + Form(형태)의 머리글자 약자입니다. 행렬의 대각선 대장 숫자(피벗)를 모두 1로 만들고, 그 위아래를 모두 0으로 싹 청소하여 미지수의 정답(x = c1, y = c2)이 한눈에 보이는 최종 완성 상태입니다."
      },
      {
        symbol: "Ri",
        name: "i번째 행 (Row)",
        meaning: "행렬의 가로줄(Row)을 뜻하는 R입니다. R1은 첫 번째 가로줄, R2는 두 번째 가로줄을 가리킵니다."
      },
      {
        symbol: "↔",
        name: "두 행의 맞바꿈 연산",
        meaning: "Ri ↔ Rj는 두 방정식의 순서를 위아래로 맞바꾸는 기본 행 연산입니다."
      },
      {
        symbol: "→",
        name: "행 갱신 / 대입 기호",
        meaning: "계산 결과를 해당 행(Row)에 덮어써서 업데이트한다는 뜻입니다."
      },
      {
        symbol: "|",
        name: "확대행렬 구분선 (Augmented Line)",
        meaning: "방정식 좌변의 미지수 계수 행렬과 우변의 상수항 열을 시각적으로 구분해 주는 세로 분리선입니다."
      },
      {
        symbol: "Pivot",
        name: "피벗 (축 / 중심 원소)",
        meaning: "각 행에서 0이 아닌 가장 앞선 첫 번째 대장 숫자입니다. 가우스 소거법은 이 피벗 아래의 숫자들을 0으로 소거해 나가는 과정입니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases} \\implies \\begin{pmatrix} 2 & 1 & | & 5 \\\\ 1 & -1 & | & 1 \\end{pmatrix}",
        justification: "문자 x, y를 떼어내고 확대행렬로 만듭니다."
      },
      {
        stepNumber: 2,
        mathExpression: "R_1 \\leftrightarrow R_2 \\implies \\begin{pmatrix} 1 & -1 & | & 1 \\\\ 2 & 1 & | & 5 \\end{pmatrix}",
        justification: "1행의 첫 번째 숫자를 1로 만들기 위해 두 줄을 바꿉니다."
      },
      {
        stepNumber: 3,
        mathExpression: "R_2 - 2R_1 \\to R_2 \\implies \\begin{pmatrix} 1 & -1 & | & 1 \\\\ 0 & 3 & | & 3 \\end{pmatrix}",
        justification: "2행에서 1행의 2배를 빼서 2행 1열을 0으로 소거합니다 (전방 소거)."
      },
      {
        stepNumber: 4,
        mathExpression: "\\frac{1}{3}R_2 \\to R_2, \\ R_1 + R_2 \\to R_1 \\implies \\begin{pmatrix} 1 & 0 & | & 2 \\\\ 0 & 1 & | & 1 \\end{pmatrix}",
        justification: "2행을 3으로 나누고 1행에 더해 RREF를 완성하면 x = 2, y = 1이 도출됩니다!"
      }
    ],
    derivationDetail: {
      title: "중학 가감법이 컴퓨터 알고리즘(행렬)으로 변신하는 원리",
      backgroundStory: "중학교 때는 '위 식에서 아래 식을 빼서 x를 없앤다'고 손으로 풀었습니다. 가우스 소거법은 이 중학 가감법을 컴퓨터가 이해할 수 있는 2중 루프(반복문)로 만든 것입니다. 첫 번째 열의 1번 줄 아래 숫자들을 전부 0으로 만들고, 두 번째 열의 2번 줄 아래를 0으로 만드는 계단식 소거를 진행하면 미지수가 10,000개라도 정확히 O(N³) 번의 연산으로 답이 나옵니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "\\text{전방 소거(Forward Elimination): 대각선 아래를 전부 0으로 만듦 (사다리꼴)}",
          justification: "맨 아래 줄에 미지수 하나만 남겨서 가장 쉬운 해를 먼저 구합니다."
        },
        {
          stepNumber: 2,
          mathExpression: "\\text{후진 대입(Back Substitution): 아래에서 구한 해를 윗줄로 거꾸로 채워 넣음}",
          justification: "아래에서 위로 거슬러 올라가며 모든 미지수의 값을 연쇄적으로 결정합니다."
        }
      ],
      conclusion: "가우스 소거법은 복잡한 연립방정식을 기계적으로 0을 채워 넣으며 해결하는 가장 강력한 선형대수 알고리즘입니다."
    },
    workedExample: {
      problem: "연립일차방정식 2x + y = 5, x - y = 1을 가우스 소거법 RREF로 풀어 x, y를 구하시오.",
      stepsToTrace: [
        "1단계: 확대행렬 [[2, 1, 5], [1, -1, 1]]을 구성한다.",
        "2단계: 두 행을 교환한다 ➔ [[1, -1, 1], [2, 1, 5]].",
        "3단계: 2행 - 2×(1행) ➔ 2행이 [0, 3, 3]이 된다.",
        "4단계: 2행을 3으로 나눈다 ➔ [0, 1, 1] (y = 1 도출!).",
        "5단계: 1행 + 2행을 더해 후진 소거한다 ➔ 1행이 [1, 0, 2]가 된다 (x = 2 도출!)."
      ],
      finalAnswer: "x = 2, y = 1"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 2원 1차 연립방정식의 행렬 표현과 풀이",
        question: "연립방정식 x + 2y = 8, 3x - y = 3을 가우스 소거법으로 풀어 x, y의 값을 구하시오.",
        interpretation: "확대행렬 [[1, 2, 8], [3, -1, 3]]을 세우고, 2행에서 1행의 3배를 빼서 x를 먼저 소거합니다.",
        solutionSteps: [
          "1단계: 확대행렬을 적습니다 ➔ [[1, 2, 8], [3, -1, 3]]",
          "2단계: 2행 - 3×(1행)을 계산합니다 ➔ [3 - 3, -1 - 6, 3 - 24] = [0, -7, -21]",
          "3단계: 2행을 -7로 나눕니다 ➔ [0, 1, 3] (따라서 y = 3 확정)",
          "4단계: 1행에 y = 3을 대입하여 후진 소거합니다 ➔ x + 2(3) = 8 ➔ x = 2"
        ],
        answer: "x = 2, y = 3",
        keyPoint: "컴퓨터는 사람이 눈으로 푸는 대신 이 행렬 뺄셈 연산만 반복하여 1초에 수천만 개의 연립방정식을 풉니다."
      }
    ],
    csIntuition: "3D 게임 엔진에서 3차원 물체를 회전, 이동, 축소할 때 쓰는 4x4 변환 행렬(Matrix)과 카메라의 역행렬(Inverse Matrix) 계산이 전부 이 가우스 소거법을 기반으로 작동합니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "gauss.c",
        code: "#include <stdio.h>\nvoid solve2x2(double A[2][3]) {\n    double f = A[1][0] / A[0][0];\n    A[1][0] -= f * A[0][0];\n    A[1][1] -= f * A[0][1];\n    A[1][2] -= f * A[0][2];\n    double y = A[1][2] / A[1][1];\n    double x = (A[0][2] - A[0][1] * y) / A[0][0];\n    printf(\"Solution: x = %.1f, y = %.1f\\n\", x, y);\n}\nint main(void) {\n    double A[2][3] = {{2, 1, 5}, {1, -1, 1}};\n    solve2x2(A);\n    return 0;\n}\n",
        notes: "C23 가우스 소거법"
      },
      go: {
        lang: "go",
        entryFile: "gauss.go",
        code: "package main\nimport \"fmt\"\nfunc main() {\n    // 2x + y = 5, x - y = 1\n    det := 2.0*(-1.0) - 1.0*1.0\n    x := (5.0*(-1.0) - 1.0*1.0) / det\n    y := (2.0*1.0 - 5.0*1.0) / det\n    fmt.Printf(\"x=%.1f, y=%.1f\\n\", x, y)\n}\n",
        notes: "Go 연립방정식 풀이"
      },
      rust: {
        lang: "rust",
        entryFile: "gauss.rs",
        code: "fn main() {\n    let det = 2.0 * (-1.0) - 1.0 * 1.0;\n    let x = (5.0 * (-1.0) - 1.0 * 1.0) / det;\n    let y = (2.0 * 1.0 - 5.0 * 1.0) / det;\n    println!(\"x = {}, y = {}\", x, y);\n}\n",
        notes: "Rust 행렬식 솔버"
      },
      python: {
        lang: "python",
        entryFile: "gauss.py",
        code: "import numpy as np\nA = np.array([[2, 1], [1, -1]])\nb = np.array([5, 1])\nx = np.linalg.solve(A, b)\nprint(f\"x = {x[0]:.1f}, y = {x[1]:.1f}\")\n",
        notes: "Python NumPy 연립방정식 솔버"
      },
      typescript: {
        lang: "typescript",
        entryFile: "gauss.ts",
        code: "const det = 2 * (-1) - 1 * 1;\nconst x = (5 * (-1) - 1 * 1) / det;\nconst y = (2 * 1 - 5 * 1) / det;\nconsole.log(`x=${x}, y=${y}`);\n",
        notes: "TS 연립방정식"
      },
      javascript: {
        lang: "javascript",
        entryFile: "gauss.js",
        code: "const det = 2 * (-1) - 1 * 1;\nconsole.log(\"x=\", (5 * (-1) - 1 * 1) / det, \"y=\", (2 * 1 - 5 * 1) / det);\n",
        notes: "JS 크라메르 해법"
      }
    }
  },

  // 15. 편미분과 인공지능 경사하강법(Gradient Descent)
  {
    id: "mod-5-1-gradient-descent-ai",
    stage: "stage6-optimization",
    order: 15,
    titleKo: "편미분과 인공지능 경사하강법(Gradient Descent)",
    titleEn: "Partial Derivatives and AI Gradient Descent Optimization",
    koreanCurriculumUnit: "대학 인공지능 수학 - 최적화와 경사하강법 (Gradient Descent Optimization)",
    graphType: "PARABOLA",
    graphCaption: "손실함수 곡선 J(w) 위에서 기울기(그래디언트)의 반대 방향으로 스텝을 밟아 오차가 0인 최솟값으로 수렴하는 경사하강법",
    terms: [
      { term: "인공지능의 학습 (AI Learning)", definition: "AI가 문제를 많이 풀어보면서 오답(오차)을 최소화하도록 수천억 개의 내부 나사(가중치 w)를 조금씩 조이는 과정" },
      { term: "손실/비용 함수 (Loss Function, J(w))", definition: "AI의 예측이 실제 정답과 얼마나 틀렸는지를 점수로 매긴 오차 함수 (이차함수 U자 그릇 모양)" },
      { term: "가중치 (Weight, w)", definition: "AI 두뇌의 신경망 시냅스 연결 강도를 나타내는 조절 파라미터 숫자" },
      { term: "편미분 (Partial Derivative)", definition: "여러 개의 변수 중 다른 변수는 멈춰두고 오직 한 변수 w에 대해서만 변화율을 재는 미분 (∂J/∂w)" },
      { term: "그래디언트 (Gradient, ∇J)", definition: "모든 변수의 기울기를 모은 나침반 화살표 (함수가 가장 가파르게 높아지는 오르막길 방향)" },
      { term: "학습률 (Learning Rate, α)", definition: "기울기 반대 방향(내리막길)으로 한 번에 내딛을 보폭의 크기 (보통 0.1, 0.01 같은 작은 소수)" }
    ],
    mathExplanation: "ChatGPT나 알파고 같은 거대한 인공지능은 어떻게 학습할까요? 짙은 안개가 낀 산에서 조난당했을 때 눈을 감고 가장 낮은 골짜기 바닥(오차가 0인 지점)으로 내려가려면 어떻게 해야 할까요? 발끝으로 바닥의 기울기(미분)를 느껴보고, '기울기의 정반대 내리막 방향'으로 한 걸음씩 조심조심 내려가면 됩니다. 이것이 전 세계 인공지능 기술의 가장 밑바닥을 지탱하는 '경사하강법(Gradient Descent)'입니다.",
    mathFormulasToTrace: [
      {
        title: "경사하강법 가중치 갱신 공식 (AI의 심장 수식)",
        latex: "w_{t+1} = w_t - \\alpha \\frac{\\partial J}{\\partial w}",
        explanation: "현재 가중치 wt에서 (학습률 α × 기울기)를 빼주면 오차가 줄어드는 방향으로 파라미터가 수정됩니다."
      },
      {
        title: "이차 오차함수의 미분과 수렴식",
        latex: "J(w) = w^2 \\implies \\frac{dJ}{dw} = 2w \\implies w_{t+1} = w_t - \\alpha(2w_t) = (1 - 2\\alpha)w_t",
        explanation: "오차가 w²일 때 기울기는 2w이며, 적절한 보폭 α를 주면 w는 최솟값 0으로 마법처럼 빨려 들어갑니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "SGD",
        name: "확률적 경사하강법 (Stochastic Gradient Descent)",
        meaning: "Stochastic(확률적/무작위의) + Gradient(기울기) + Descent(하강)의 머리글자 약자입니다. 빅데이터 전체를 한 번에 계산하지 않고 무작위로 뽑은 작은 묶음(배치)으로 빠르게 최적의 가중치를 찾아가는 딥러닝의 핵심 알고리즘입니다."
      },
      {
        symbol: "MSE",
        name: "평균제곱오차 (Mean Squared Error)",
        meaning: "Mean(평균) + Squared(제곱한) + Error(오차)의 머리글자 약자입니다. AI의 예측값과 실제 정답의 차이를 제곱하여 모두 더한 뒤 평균을 낸 대표적인 손실 함수입니다."
      },
      {
        symbol: "J(w)",
        name: "손실/비용 함수 (Loss / Cost Function)",
        meaning: "가중치 w를 넣었을 때 AI가 얼마나 엉터리로 예측했는지를 점수로 매긴 오차 함수입니다. 이 J(w) 값을 0에 가깝게 최소화하는 것이 AI 학습의 궁극적 목표입니다."
      },
      {
        symbol: "w",
        name: "가중치 (Weight)",
        meaning: "신경망 연결 강도(Weight)의 머리글자 w입니다. AI가 학습하면서 최적의 값을 찾아가는 내부 조절 나사 파라미터입니다."
      },
      {
        symbol: "wt, wt+1",
        name: "현재 스텝과 다음 스텝의 가중치",
        meaning: "시간 스텝(t)에서의 현재 가중치 wt와, 경사하강을 1보 내딛은 뒤 갱신된 다음 가중치 wt+1을 구별하는 첨자 표기입니다."
      },
      {
        symbol: "α (Alpha)",
        name: "학습률 (Learning Rate, 보폭)",
        meaning: "그리스 문자 소문자 알파(α)입니다. 내리막길로 한 걸음 내딛을 때의 보폭 크기(보통 0.01 등)로, 너무 크면 골짜기를 지나쳐 튕겨 나가고 너무 작으면 학습이 너무 느려집니다."
      },
      {
        symbol: "∂ (Partial)",
        name: "편미분 기호 (파셜 / 라운드 디)",
        meaning: "부분(Partial)을 뜻하는 프랑스 수학자 르장드르의 기호입니다. 변수가 수억 개일 때 다른 변수는 상수로 고정해 두고 오직 한 변수 w에 대해서만 변화율을 잴 때 사용합니다."
      },
      {
        symbol: "∇ (Nabla)",
        name: "그래디언트 / 기울기 벡터 (나블라)",
        meaning: "고대 페니키아의 삼각형 하프(Nabla)를 닮은 기호입니다. 모든 변수에 대한 편미분을 모아놓은 벡터로, 함수가 '가장 가파르게 상승하는 오르막 방향'을 가리킵니다."
      },
      {
        symbol: "- (마이너스 부호)",
        name: "내리막 방향 반전의 핵심 연산자",
        meaning: "기울기(∇)는 산꼭대기(오르막)를 가리키므로, 오차를 줄이는 골짜기 바닥(최솟값)으로 내려가기 위해 반드시 기울기 앞에 마이너스(-)를 붙여 반대 방향으로 이동합니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "w_0 = 4.0, \\quad \\alpha = 0.1",
        justification: "초기 가중치를 엉뚱한 값 4.0으로 잡고, 보폭(학습률)을 0.1로 둡니다."
      },
      {
        stepNumber: 2,
        mathExpression: "\\nabla J(w_0) = 2 \\times 4.0 = 8.0 > 0",
        justification: "기울기가 양수(+)이므로 오른쪽으로 갈수록 오차가 커지는 오르막길입니다."
      },
      {
        stepNumber: 3,
        mathExpression: "w_1 = 4.0 - (0.1 \\times 8.0) = 4.0 - 0.8 = 3.2",
        justification: "오르막길의 반대인 왼쪽(음의 방향)으로 걸어 내려와 오차가 줄어든 3.2에 도착합니다."
      },
      {
        stepNumber: 4,
        mathExpression: "w_2 = 3.2 - (0.1 \\times 6.4) = 3.2 - 0.64 = 2.56 \\to \\dots \\to 0.0",
        justification: "이 과정을 수천 번 반복하면 오차가 완벽한 0이 되는 최적의 지점에 도달합니다!"
      }
    ],
    derivationDetail: {
      title: "마이너스(-) 부호가 오차를 줄여주는 수학적 원리",
      backgroundStory: "공식에서 왜 미분값을 '더하지 않고 뺄(-)'까요? 기울기가 양수(+)라는 것은 오른쪽으로 갈수록 산이 높아진다는 뜻입니다. 우리는 골짜기 바닥(최솟값)으로 내려가야 하므로 오른쪽(+)이 아니라 '왼쪽(-)'으로 가야 합니다! 반대로 기울기가 음수(-)라면 왼쪽으로 갈수록 높아지므로 '오른쪽(+)'으로 가야 합니다. 즉, 언제나 기울기의 부호를 반대로 뒤집어주어야만 내리막길을 타게 되므로 마이너스(-) 부호가 붙는 것입니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "\\text{기울기 } > 0 \\implies w\\text{를 감소시켜야 함 } (w - \\alpha \\times (+))",
          justification: "오른쪽이 높으므로 왼쪽으로 후진합니다."
        },
        {
          stepNumber: 2,
          mathExpression: "\\text{기울기 } < 0 \\implies w\\text{를 증가시켜야 함 } (w - \\alpha \\times (-) = w + \\dots)",
          justification: "왼쪽이 높으므로 오른쪽으로 전진합니다."
        }
      ],
      conclusion: "이 마이너스 부호 하나 덕분에 AI는 스스로 판단하지 않고도 수식에 따라 항상 오차가 줄어드는 바닥으로 굴러 떨어집니다."
    },
    workedExample: {
      problem: "손실함수 J(w) = w²에 대하여 초기 가중치 w_0 = 4, 학습률 α = 0.1일 때, 경사하강법 1회 갱신 후의 w_1과 2회 갱신 후의 w_2를 구하시오.",
      stepsToTrace: [
        "1단계: J(w)의 도함수를 구한다 ➔ J'(w) = 2w.",
        "2단계: w_0 = 4에서의 기울기 ➔ J'(4) = 2 × 4 = 8.",
        "3단계: 1스텝 갱신 ➔ w_1 = 4 - (0.1 × 8) = 4 - 0.8 = 3.2.",
        "4단계: w_1 = 3.2에서의 기울기 ➔ J'(3.2) = 2 × 3.2 = 6.4.",
        "5단계: 2스텝 갱신 ➔ w_2 = 3.2 - (0.1 × 6.4) = 3.2 - 0.64 = 2.56."
      ],
      finalAnswer: "w_1 = 3.2, w_2 = 2.56 (오차가 급격히 감소함!)"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 경사하강법 1단계 손계산하기",
        question: "손실함수 J(w) = 3w²에 대하여 현재 가중치가 w = 2이고 학습률이 α = 0.05일 때, 경사하강법을 1회 적용한 새로운 가중치 w'의 값을 구하시오.",
        interpretation: "J(w) = 3w²을 미분하면 J'(w) = 6w입니다. 현재 w = 2에서의 기울기를 구한 뒤 갱신 공식 w' = w - α J'(w)에 대입합니다.",
        solutionSteps: [
          "1단계: 도함수를 구합니다 ➔ J'(w) = 6w",
          "2단계: 현재 위치 w = 2에서의 기울기를 계산합니다 ➔ J'(2) = 6 × 2 = 12",
          "3단계: 갱신 공식에 대입합니다 ➔ w' = 2 - (0.05 × 12)",
          "4단계: 곱셈을 계산합니다 ➔ 0.05 × 12 = 0.6",
          "5단계: 뺍니다 ➔ w' = 2 - 0.6 = 1.4"
        ],
        answer: "새로운 가중치 w' = 1.4",
        keyPoint: "가중치가 2에서 1.4로 줄어들면서 손실함수의 최솟값인 0을 향해 성공적으로 한 걸음 다가갔습니다!"
      },
      {
        problemNumber: 2,
        title: "실전 문제: 학습률 α가 너무 클 때의 오버슈팅(폭주) 현상",
        question: "손실함수 J(w) = w²에서 초기값 w_0 = 2일 때, 만약 학습률을 너무 크게 잡아서 α = 1.5로 설정하면 w_1의 값은 얼마가 되는지 계산하고 현상을 설명하시오.",
        interpretation: "갱신 공식 w_1 = w_0 - α(2w_0)에 α = 1.5를 대입해 봅니다. 보폭이 너무 크면 바닥을 지나쳐 반대편 언덕으로 튕겨 나갑니다.",
        solutionSteps: [
          "1단계: w_0 = 2에서의 기울기 ➔ J'(2) = 2 × 2 = 4",
          "2단계: 공식에 대입합니다 ➔ w_1 = 2 - (1.5 × 4) = 2 - 6 = -4",
          "3단계: 원래 위치는 +2였는데, 갱신 후 위치는 절댓값이 더 커진 -4가 되었습니다!",
          "4단계: 오차가 줄어들지 않고 오히려 반대편으로 더 높이 튕겨 나가는 '발산(Overshooting)' 현상이 발생합니다."
        ],
        answer: "w_1 = -4 (학습률이 너무 커서 최솟값으로 수렴하지 못하고 반대편으로 튕겨 나감)",
        keyPoint: "인공지능 학습에서 학습률(Learning Rate)을 0.001처럼 작게 설정하는 이유가 바로 이 튕겨 나감 현상을 막기 위해서입니다!"
      }
    ],
    csIntuition: "오늘날 챗GPT, 테슬라 자율주행, 구글 제미나이의 신경망 모델 훈련 알고리즘(Adam, SGD)은 수조 개의 연결 가중치에 대해 이 경사하강법 갱신 수식을 병렬 GPU로 초당 수조 번 반복하는 것입니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "gd.c",
        code: "#include <stdio.h>\ndouble gd_step(double w, double alpha) {\n    double grad = 2.0 * w; // J(w) = w^2\n    return w - alpha * grad;\n}\nint main(void) {\n    double w = 4.0, alpha = 0.1;\n    for (int i = 1; i <= 5; i++) {\n        w = gd_step(w, alpha);\n        printf(\"Step %d: w = %.4f\\n\", i, w);\n    }\n    return 0;\n}\n",
        notes: "C23 경사하강법 루프"
      },
      go: {
        lang: "go",
        entryFile: "gd.go",
        code: "package main\nimport \"fmt\"\nfunc main() {\n    w, alpha := 4.0, 0.1\n    for i := 1; i <= 5; i++ {\n        w -= alpha * (2 * w)\n        fmt.Printf(\"Step %d: w = %.4f\\n\", i, w)\n    }\n}\n",
        notes: "Go AI 경사하강법"
      },
      rust: {
        lang: "rust",
        entryFile: "gd.rs",
        code: "fn main() {\n    let (mut w, alpha) = (4.0, 0.1);\n    for i in 1..=5 {\n        w -= alpha * (2.0 * w);\n        println!(\"Step {}: w = {:.4}\", i, w);\n    }\n}\n",
        notes: "Rust 파라미터 갱신"
      },
      python: {
        lang: "python",
        entryFile: "gd.py",
        code: "w, alpha = 4.0, 0.1\nfor i in range(1, 6):\n    w -= alpha * (2 * w)\n    print(f\"Step {i}: w = {w:.4f}\")\n",
        notes: "Python 딥러닝 기초 경사하강법"
      },
      typescript: {
        lang: "typescript",
        entryFile: "gd.ts",
        code: "let w = 4.0, alpha = 0.1;\nfor (let i = 1; i <= 5; i++) {\n  w -= alpha * (2 * w);\n  console.log(`Step ${i}: w = ${w.toFixed(4)}`);\n}\n",
        notes: "TS 경사하강 루프"
      },
      javascript: {
        lang: "javascript",
        entryFile: "gd.js",
        code: "let w = 4.0, alpha = 0.1;\nfor (let i = 1; i <= 5; i++) {\n  w -= alpha * (2 * w);\n  console.log(`Step ${i}: w = ${w.toFixed(4)}`);\n}\n",
        notes: "JS 경사하강법"
      }
    }
  }
];
