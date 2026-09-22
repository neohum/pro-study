/**
 * scripts/curriculum/stage4_high.js
 * 고등학교 수학 (대수 & 미적분):
 * 9. 호도법과 단위원의 삼각함수
 * 10. 사인·코사인 주기 함수와 파동 그래프
 * 11. 미분계수와 접선의 기울기, 도함수
 * 12. 정적분과 곡선 아래의 넓이, 구분구적법
 */

module.exports = [
  // 9. 호도법과 단위원의 삼각함수
  {
    id: "mod-2-1-unit-circle-rad",
    stage: "stage2-common-high",
    order: 9,
    titleKo: "호도법과 단위원의 삼각함수",
    titleEn: "Radians, Unit Circle, and Circular Trigonometric Functions",
    koreanCurriculumUnit: "고등학교 대수 - Ⅱ. 삼각함수 (1. 삼각함수의 뜻과 호도법)",
    graphType: "UNIT_CIRCLE",
    graphCaption: "반지름 r = 1인 단위원과 각도 θ 회전 바늘, 단위원 위의 점 (x, y) = (cos θ, sin θ)",
    terms: [
      { term: "호도법 (Circular Measure)", definition: "반지름과 호의 길이가 같아질 때의 중심각을 '1 라디안(rad)'으로 정의하는 각도 측정법" },
      { term: "라디안 (Radian)", definition: "호도법의 각도 단위. 180° = π rad (약 3.14 rad = 180°)" },
      { term: "단위원 (Unit Circle)", definition: "좌표평면 위에서 원점 (0,0)을 중심으로 하고 반지름이 딱 1인 원 (x² + y² = 1)" },
      { term: "동경 (Radius Vector)", definition: "시계 바늘처럼 원점을 중심으로 뱅글뱅글 회전하는 각도 바늘 선" },
      { term: "삼각함수의 확장", definition: "직각삼각형(0°~90°)을 벗어나, 360°를 넘는 각이나 음수 각도까지 단위원 위의 좌표로 정의한 함수" }
    ],
    mathExplanation: "초등학교와 중학교 때 쓴 360분법(도, °)은 인류가 인위적으로 정한 단위였습니다. 하지만 '호도법(라디안)'은 원의 반지름과 호의 실제 '길이' 비율로 각도를 잽니다. 실로 원 둘레를 재는 것처럼 각도를 순수한 '실수(숫자)'로 만들 수 있어서, 미적분을 하거나 컴퓨터 프로그래밍 계산을 할 때 절대적인 표준 단위가 됩니다.",
    mathFormulasToTrace: [
      {
        title: "60분법과 호도법의 변환 공식 (파이 등식)",
        latex: "180^\\circ = \\pi \\text{ rad} \\iff 1^\\circ = \\frac{\\pi}{180} \\text{ rad}, \\quad 1 \\text{ rad} = \\frac{180^\\circ}{\\pi} \\approx 57.3^\\circ",
        explanation: "각도(도)에 π/180을 곱하면 라디안이 되고, 180/π를 곱하면 다시 도가 됩니다."
      },
      {
        title: "단위원 위의 좌표 정의",
        latex: "P(x, y) = (\\cos\\theta, \\sin\\theta) \\quad (x^2 + y^2 = 1)",
        explanation: "단위원 위를 회전하는 점의 가로 x좌표가 코사인, 세로 y좌표가 사인입니다."
      },
      {
        title: "부채꼴의 호의 길이와 넓이 공식",
        latex: "l = r\\theta, \\quad S = \\frac{1}{2}r^2\\theta = \\frac{1}{2}rl \\quad (\\theta\\text{는 라디안})",
        explanation: "호도법을 쓰면 복잡한 360분의 몇 공식이 사라지고 곱셈 하나로 끝납니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "rad",
        name: "라디안 (Radian)",
        meaning: "반지름(Radius)에서 유래한 호도법의 각도 단위입니다. 호의 길이가 반지름 r과 똑같아질 때의 중심각을 '1 rad(약 57.3°)'로 정의합니다. 각도를 실(string)의 길이처럼 순수한 실수로 다룰 수 있게 해줍니다."
      },
      {
        symbol: "π (Pi)",
        name: "원주율 (그리스 문자 파이)",
        meaning: "원둘레를 뜻하는 그리스어 페리메트로스(perimetros)의 첫 글자 π입니다. 원의 지름에 대한 둘레의 비율로 약 3.14159265...입니다. 180°는 정확히 π rad입니다."
      },
      {
        symbol: "180° = π rad",
        name: "각도 변환 기본 등식",
        meaning: "원 한 바퀴(360°) 둘레가 2πr이므로 360° = 2π rad이며, 반 바퀴인 180°는 π rad이 됩니다. 1° = π/180 rad입니다."
      },
      {
        symbol: "P(cos θ, sin θ)",
        name: "단위원 위의 점 좌표",
        meaning: "반지름이 1인 원(단위원) 위를 회전하는 점의 x좌표는 항상 cos θ, y좌표는 항상 sin θ가 됩니다."
      },
      {
        symbol: "l = rθ",
        name: "호의 길이 공식",
        meaning: "호의 길이(Length)를 뜻하는 l입니다. 호도법에서는 반지름 r에 각도 θ(라디안)를 곱하기만 하면 호의 길이가 나옵니다."
      },
      {
        symbol: "S = 1/2 r²θ",
        name: "부채꼴의 넓이 공식",
        meaning: "넓이(Surface Area)를 뜻하는 S입니다. 삼각형 넓이 공식(1/2 × 밑변 × 높이)에서 밑변이 호 l, 높이가 반지름 r인 것과 원리가 같습니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "\\text{원 둘레} = 2\\pi r \\iff 360^\\circ = 2\\pi \\text{ rad}",
        justification: "반지름 r인 원 한 바퀴의 둘레가 2πr이므로 360도는 2π 라디안이 됩니다."
      },
      {
        stepNumber: 2,
        mathExpression: "180^\\circ = \\pi \\text{ rad} \\implies 90^\\circ = \\frac{\\pi}{2}, \\ 60^\\circ = \\frac{\\pi}{3}, \\ 45^\\circ = \\frac{\\pi}{4}, \\ 30^\\circ = \\frac{\\pi}{6}",
        justification: "양변을 나누어 교과서 특수각들을 라디안으로 즉시 변환합니다."
      }
    ],
    derivationDetail: {
      title: "각도를 실(string)로 재는 호도법의 탄생 원리",
      backgroundStory: "피자를 자를 때 부채꼴의 둥근 테두리(호)의 길이는 중심각이 커질수록 정비례해서 길어집니다. 반지름이 10cm인 원에서 호의 길이가 똑같이 10cm가 되는 순간의 각도를 '1 라디안'이라고 부르기로 약속했습니다. 원 둘레 전체(2πr)는 반지름의 2π(약 6.28)배이므로, 360도는 2π 라디안이 되고, 180도는 파이(π = 3.14159...) 라디안이 됩니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "\\theta = \\frac{\\text{호의 길이 } l}{\\text{반지름 } r}",
          justification: "각도 θ를 두 길이의 비율로 정의하면 단위가 약분되어 순수한 실수가 됩니다."
        },
        {
          stepNumber: 2,
          mathExpression: "l = r \\times \\theta",
          justification: "양변에 r을 곱하면 부채꼴 호의 길이 공식이 저절로 튀어나옵니다."
        }
      ],
      conclusion: "호도법 덕분에 각도가 단순한 도형 기호가 아니라 사칙연산과 미적분이 가능한 '진짜 숫자'가 되었습니다."
    },
    workedExample: {
      problem: "각도 120°를 라디안으로 나타내고, 단위원 위의 점 (cos 120°, sin 120°)의 좌표를 구하시오.",
      stepsToTrace: [
        "1단계: 120°에 π/180을 곱한다 ➔ 120 × (π/180) = 2π/3 rad.",
        "2단계: 120°는 제2사분면 각도이므로 x는 음수, y는 양수이다.",
        "3단계: 180° - 120° = 60°이므로 cos 120° = -cos 60° = -1/2이다.",
        "4단계: sin 120° = +sin 60° = √3/2이다.",
        "결론: 단위원 위의 좌표는 (-1/2, √3/2)이다."
      ],
      finalAnswer: "120° = 2π/3 rad, 좌표: (-1/2, √3/2)"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 각도와 라디안 상호 변환",
        question: "다음 60분법의 각은 라디안으로, 라디안은 60분법의 각도로 변환하시오: (1) 225°, (2) 5π/6 rad",
        interpretation: "도 ➔ 라디안은 π/180을 곱하고, 라디안 ➔ 도는 π 자리에 180°를 쏙 대입하여 약분합니다.",
        solutionSteps: [
          "1단계 (225° 변환): 225 × (π / 180) = (45 × 5)π / (45 × 4) = 5π/4 rad",
          "2단계 (5π/6 변환): π 대신 180°를 넣습니다 ➔ 5 × 180° / 6 = 5 × 30° = 150°"
        ],
        answer: "(1) 5π/4 rad, (2) 150°",
        keyPoint: "라디안을 도(°)로 바꿀 때는 π를 180°로 바꾸면 암산으로도 1초 만에 풀립니다!"
      },
      {
        problemNumber: 2,
        title: "실전 문제: 부채꼴의 호의 길이와 넓이 구하기",
        question: "반지름의 길이가 6cm이고 중심각의 크기가 2π/3 rad인 부채꼴의 호의 길이와 넓이를 구하시오.",
        interpretation: "호도법 공식 l = rθ와 S = (1/2)rl에 r = 6, θ = 2π/3을 그대로 대입합니다.",
        solutionSteps: [
          "1단계: 호의 길이 l을 구합니다 ➔ l = rθ = 6 × (2π/3) = 4π cm",
          "2단계: 부채꼴의 넓이 S를 구합니다 ➔ S = (1/2) r l = (1/2) × 6 × 4π = 12π cm²"
        ],
        answer: "호의 길이: 4π cm, 넓이: 12π cm²",
        keyPoint: "중심각이 라디안일 때는 360분의 몇을 곱하지 않고 rθ만 곱하면 끝납니다."
      }
    ],
    csIntuition: "C언어, Python, JS 등 모든 프로그래밍 언어의 `Math.sin()`, `Math.cos()`는 인자로 '라디안'을 받습니다. 사용자가 입력한 45도를 그대로 넣으면 엉뚱한 값이 나오므로 반드시 `deg * (Math.PI / 180)`으로 라디안 변환을 거쳐야 합니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "rad.c",
        code: "#include <stdio.h>\n#include <math.h>\n\n#define PI 3.14159265358979323846\n\ndouble deg_to_rad(double deg) { return deg * (PI / 180.0); }\n\nint main(void) {\n    double rad = deg_to_rad(120.0);\n    printf(\"120 deg = %.4f rad, cos=%.2f, sin=%.2f\\n\", rad, cos(rad), sin(rad));\n    return 0;\n}\n",
        notes: "C23 각도-라디안 변환"
      },
      go: {
        lang: "go",
        entryFile: "rad.go",
        code: "package main\n\nimport (\n\t\"fmt\"\n\t\"math\"\n)\n\nfunc main() {\n\trad := 120.0 * (math.Pi / 180)\n\tfmt.Printf(\"cos=%.2f, sin=%.2f\\n\", math.Cos(rad), math.Sin(rad))\n}\n",
        notes: "Go math.Pi 상수"
      },
      rust: {
        lang: "rust",
        entryFile: "rad.rs",
        code: "fn main() {\n    let rad = 120.0_f64.to_radians();\n    println!(\"cos={:.2}, sin={:.2}\", rad.cos(), rad.sin());\n}\n",
        notes: "Rust to_radians() 메서드"
      },
      python: {
        lang: "python",
        entryFile: "rad.py",
        code: "import math\nrad = math.radians(120)\nprint(f\"cos={math.cos(rad):.2f}, sin={math.sin(rad):.2f}\")\n",
        notes: "Python math.radians"
      },
      typescript: {
        lang: "typescript",
        entryFile: "rad.ts",
        code: "const rad = (120 * Math.PI) / 180;\nconsole.log(`cos=${Math.cos(rad).toFixed(2)}, sin=${Math.sin(rad).toFixed(2)}`);\n",
        notes: "TS 단위원 좌표"
      },
      javascript: {
        lang: "javascript",
        entryFile: "rad.js",
        code: "const rad = (120 * Math.PI) / 180;\nconsole.log(\"cos=\", Math.cos(rad).toFixed(2), \"sin=\", Math.sin(rad).toFixed(2));\n",
        notes: "JS 라디안 삼각함수"
      }
    }
  },

  // 10. 사인·코사인 주기 함수와 파동 그래프
  {
    id: "mod-2-2-sine-cosine-wave",
    stage: "stage2-common-high",
    order: 10,
    titleKo: "사인·코사인 함수와 파동 주기 그래프",
    titleEn: "Sine and Cosine Periodic Functions and Wave Graphs",
    koreanCurriculumUnit: "고등학교 대수 - Ⅱ. 삼각함수 (2. 삼각함수의 그래프)",
    graphType: "SINE_COSINE",
    graphCaption: "주기 2π, 진폭 1을 가지는 사인 파동(실선)과 코사인 파동(점선)의 위상차 π/2",
    terms: [
      { term: "주기함수 (Periodic Function)", definition: "일정한 간격(주기)마다 똑같은 모양의 그래프가 끊임없이 반복되는 함수 (f(x + p) = f(x))" },
      { term: "주기 (Period, T)", definition: "그래프 모양이 한 번 완성되어 반복되기까지 걸리는 가로 간격 (사인의 기본 주기는 2π)" },
      { term: "진폭 (Amplitude, A)", definition: "파동의 중심선에서 산꼭대기(마루)까지의 높이" },
      { term: "위상차 (Phase Difference)", definition: "사인 곡선과 코사인 곡선처럼 모양은 같지만 옆으로 얼마큼 어긋나(밀려) 있는지를 나타내는 차이" },
      { term: "진동과 파동", definition: "소리, 빛, 전파, 바다의 물결처럼 주기적으로 오르락내리락하는 자연계의 모든 율동 현상" }
    ],
    mathExplanation: "단위원 위를 일정한 속도로 도는 회전목마의 높이를 시간에 따라 가로축으로 쭈욱 펼치면 부드러운 파도 모양의 사인(Sine) 곡선이 그려집니다. 코사인(Cosine) 곡선은 사인 곡선을 옆으로 90°(π/2) 살짝 민 것과 완전히 똑같습니다. 음악 신디사이저의 맑은 소리부터 스마트폰 와이파이 전파까지 자연계의 모든 파동은 이 두 함수로 완벽히 설명됩니다.",
    mathFormulasToTrace: [
      {
        title: "삼각함수 파동의 일반형 공식",
        latex: "y = A \\sin(Bx - C) + D \\implies \\text{진폭: } |A|, \\quad \\text{주기 } T = \\frac{2\\pi}{|B|}",
        explanation: "A는 높낮이(위아래 확대), B는 가로 압축(주기), C는 좌우 평행이동, D는 상하 이동입니다."
      },
      {
        title: "사인과 코사인의 위상 관계",
        latex: "\\cos x = \\sin\\left(x + \\frac{\\pi}{2}\\right)",
        explanation: "사인을 왼쪽으로 90도 밀면 코사인과 완벽하게 겹쳐집니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "A",
        name: "진폭 (Amplitude)",
        meaning: "진폭(Amplitude)의 머리글자 A입니다. 파동의 중심선에서 마루(가장 높은 꼭대기)까지의 순수한 높이를 결정하며, 위아래로 당기거나 누르는 배율입니다."
      },
      {
        symbol: "B",
        name: "주기 조절 계수 (각진동수 계수)",
        meaning: "x에 곱해지는 속도 배율입니다. B가 클수록 파동이 촘촘하게 진동하며, 주기 T는 2π를 |B|로 나눈 값으로 줄어듭니다."
      },
      {
        symbol: "T",
        name: "주기 (Period / Time)",
        meaning: "시간(Time) 또는 주기(Period)의 머리글자 T입니다. 파동의 산에서 다음 산까지, 모양이 1회 완성되는 가로 길이(사인의 기본 주기는 2π)입니다."
      },
      {
        symbol: "C",
        name: "위상 이동 (Phase Shift)",
        meaning: "파동을 좌우(가로) 방향으로 평행이동시키는 값입니다."
      },
      {
        symbol: "D",
        name: "수직 중심축 이동 (Vertical Shift)",
        meaning: "파동 전체를 위아래로 들어 올리거나 내리는 기준 중심선의 높이입니다."
      },
      {
        symbol: "π/2",
        name: "위상차 (Phase Difference, 90도)",
        meaning: "사인과 코사인의 형태 차이입니다. 사인 함수를 왼쪽으로 π/2(90°) 밀면 코사인 함수와 완전히 포개어집니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "\\sin(x + 2\\pi) = \\sin x",
        justification: "단위원을 360도(2π 라디안) 돌면 원래 자리로 돌아오므로 주기는 2π입니다."
      },
      {
        stepNumber: 2,
        mathExpression: "y = \\sin(Bx) \\implies B \\times T = 2\\pi \\implies T = \\frac{2\\pi}{B}",
        justification: "x에 B가 곱해지면 B배 빠르게 회전하므로 주기는 B로 나눈 값으로 줄어듭니다."
      }
    ],
    derivationDetail: {
      title: "회전 운동에서 물결 파동이 탄생하는 기하학적 유도",
      backgroundStory: "원판에 연필을 꽂고 빙글빙글 돌리면서 그 아래로 종이를 일정한 속도로 쭉 잡아당기면 종이 위에 물결 모양의 파동이 저절로 그려집니다! 원운동의 세로 위치 y는 y = sin θ이므로, 각도 θ가 시간에 따라 비례해서 커질 때 그려지는 자취가 바로 사인 파동 곡선입니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "P(\\theta) = (\\cos\\theta, \\sin\\theta)",
          justification: "원 위를 도는 점의 y좌표 sin θ의 변화를 관찰합니다."
        },
        {
          stepNumber: 2,
          mathExpression: "\\theta: 0 \\to \\frac{\\pi}{2} \\to \\pi \\to \\frac{3\\pi}{2} \\to 2\\pi \\implies y: 0 \\to 1 \\to 0 \\to -1 \\to 0",
          justification: "각도가 변함에 따라 높이가 0에서 1로 올라갔다가 0, -1을 찍고 다시 0으로 돌아옵니다."
        }
      ],
      conclusion: "원운동과 파동은 완전히 같은 현상을 다른 각도에서 바라본 것입니다."
    },
    workedExample: {
      problem: "함수 y = 4 sin(2x) - 1의 주기, 진폭, 최댓값, 최솟값을 구하시오.",
      stepsToTrace: [
        "1단계: 진폭 A = |4| = 4이다.",
        "2단계: 주기 T = 2π / |B| = 2π / 2 = π이다.",
        "3단계: 최댓값 = |A| + D = 4 + (-1) = 3이다.",
        "4단계: 최솟값 = -|A| + D = -4 + (-1) = -5이다."
      ],
      finalAnswer: "주기: π, 진폭: 4, 최댓값: 3, 최솟값: -5"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 삼각함수의 주기와 최댓값·최솟값 판별",
        question: "함수 y = -3 cos(4x) + 2의 주기와 최댓값, 최솟값을 구하시오.",
        interpretation: "주기는 x 앞의 계수 4로 2π를 나눕니다. 코사인의 치역 [-1, 1]에 -3배를 하고 2를 더해 최댓값과 최솟값을 구합니다.",
        solutionSteps: [
          "1단계: 주기 T = 2π / 4 = π/2",
          "2단계: 진폭 = |-3| = 3",
          "3단계: 최댓값 = 3 + 2 = 5",
          "4단계: 최솟값 = -3 + 2 = -1"
        ],
        answer: "주기: π/2, 최댓값: 5, 최솟값: -1",
        keyPoint: "앞의 계수가 -3처럼 음수라도 진폭과 주기는 항상 '양수'로 계산합니다."
      }
    ],
    csIntuition: "디지털 오디오(음악) 합성기에서는 `sin(2 * PI * freq * t)` 공식을 써서 '라(440Hz)' 음을 생성합니다. 또한 게임에서 카메라가 지진으로 부드럽게 흔들리는 진동 효과를 만들 때도 사인파를 사용합니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "sine.c",
        code: "#include <stdio.h>\n#include <math.h>\n#define PI 3.14159265358979323846\n\ndouble sine_wave(double amp, double freq, double t) {\n    return amp * sin(2.0 * PI * freq * t);\n}\nint main(void) {\n    printf(\"t=0.25: %.2f\\n\", sine_wave(4.0, 1.0, 0.25));\n    return 0;\n}\n",
        notes: "C23 오디오 사인파"
      },
      go: {
        lang: "go",
        entryFile: "sine.go",
        code: "package main\nimport (\"fmt\"; \"math\")\nfunc main() {\n    fmt.Println(4.0 * math.Sin(2*math.Pi*1.0*0.25))\n}\n",
        notes: "Go 사인파"
      },
      rust: {
        lang: "rust",
        entryFile: "sine.rs",
        code: "use std::f64::consts::PI;\nfn main() {\n    println!(\"{:.2}\", 4.0 * (2.0 * PI * 1.0 * 0.25).sin());\n}\n",
        notes: "Rust 파동 샘플러"
      },
      python: {
        lang: "python",
        entryFile: "sine.py",
        code: "import math\nprint(round(4.0 * math.sin(2 * math.pi * 1.0 * 0.25), 2))\n",
        notes: "Python 신호 처리"
      },
      typescript: {
        lang: "typescript",
        entryFile: "sine.ts",
        code: "console.log(4 * Math.sin(2 * Math.PI * 1 * 0.25));\n",
        notes: "TS WebAudio 파형"
      },
      javascript: {
        lang: "javascript",
        entryFile: "sine.js",
        code: "console.log(4 * Math.sin(2 * Math.PI * 1 * 0.25));\n",
        notes: "JS 사인파"
      }
    }
  },

  // 11. 미분계수와 접선의 기울기, 도함수
  {
    id: "mod-3-1-derivative-gradient",
    stage: "stage3-advanced-high",
    order: 11,
    titleKo: "미분계수와 접선의 기울기, 도함수",
    titleEn: "Derivatives, Instantaneous Rate of Change, and Tangent Slopes",
    koreanCurriculumUnit: "고등학교 미적분 - Ⅱ. 미분법 (1. 미분계수와 도함수)",
    graphType: "LINEAR_FUNCTION",
    graphCaption: "두 점 사이의 평균변화율에서 간격 h가 0으로 무한히 줄어들 때의 순간 접선 기울기 f'(x)",
    terms: [
      { term: "평균변화율 (Average Rate)", definition: "서울에서 부산까지 400km를 4시간에 달렸을 때의 평균 속도 100km/h (Δy / Δx)" },
      { term: "순간변화율 / 미분계수 (Derivative, f'(a))", definition: "속도위반 단속 카메라를 통과하는 바로 그 '찰나의 순간'에 속도계 바늘이 가리키는 정확한 순간 속도 (접선의 기울기)" },
      { term: "도함수 (Derivative Function, f'(x))", definition: "모든 x에 대해 그 점에서의 순간 기울기를 단번에 알려주는 마법의 공식 함수" },
      { term: "접선 (Tangent Line)", definition: "곡선 위를 달리는 자동차의 헤드라이트 빛이 앞으로 곧게 뻗어나가는 방향의 직선" }
    ],
    mathExplanation: "자동차가 커브길을 돌 때 특정 찰나의 순간에 핸들이 가리키는 방향(접선)과 속도를 어떻게 잴 수 있을까요? 뉴턴과 라이프니츠는 두 점 사이의 시간 간격 h를 '0에 무한히 가깝게' 줄여서 순간 기울기를 계산하는 '미분(Differentiation)'을 발명했습니다.",
    mathFormulasToTrace: [
      {
        title: "미분계수의 극한 정의식 (뉴턴의 식)",
        latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}",
        explanation: "간격 h를 0으로 보내면 두 점을 잇는 직선이 한 점을 스치는 접선으로 변합니다."
      },
      {
        title: "거듭제곱 미분 공식 (가장 쉬운 미분 비법)",
        latex: "\\frac{d}{dx}[x^n] = n x^{n-1} \\quad (\\text{예: } (x^3)' = 3x^2, \\ (x^2)' = 2x)",
        explanation: "지수가 앞으로 뛰어내리고 머리 위의 숫자는 1이 줄어듭니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "f'(x)",
        name: "도함수 / 프라임 기호 (Prime)",
        meaning: "뉴턴이 도입한 미분 표기법으로, f prime x라고 읽습니다. 원래 함수 f(x)의 각 점에서의 '순간 접선 기울기'를 나타내는 도함수입니다."
      },
      {
        symbol: "lim (Limit)",
        name: "극한 기호 (리미트)",
        meaning: "한계(Limit)를 뜻하는 라틴어 limes에서 유래한 약어입니다. 어떤 변수가 목표 값에 '한없이 가까워지는 상태'를 의미합니다."
      },
      {
        symbol: "h → 0",
        name: "간격의 극한 수렴 조건",
        meaning: "두 점 사이의 가로 간격 h를 0이 되지는 않으면서 0의 문턱까지 무한히 좁힌다는 뜻입니다. 이를 통해 0으로 나누는 오류를 피하면서 순간 속도를 구합니다."
      },
      {
        symbol: "h",
        name: "증분 / 간격 (Increment / Height)",
        meaning: "x의 변화량 Δx를 대신하는 간격 문자입니다. (x + h)는 x에서 아주 살짝 옆으로 이동한 위치입니다."
      },
      {
        symbol: "d/dx",
        name: "라이프니츠 미분 연산자",
        meaning: "미세한 차이(Differential)를 뜻하는 d입니다. d/dx는 'x에 관하여 미분하라'는 연산 지시 명령입니다."
      },
      {
        symbol: "n x^(n-1)",
        name: "거듭제곱 미분 다항식",
        meaning: "x^n을 미분하면 원래 지수 n이 계수로 앞으로 곱해지고, 지수는 1 줄어들어 n-1이 되는 다항함수 미분의 만능 기본 규칙입니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "f(x) = x^2 \\implies \\frac{(x+h)^2 - x^2}{h} = \\frac{x^2 + 2xh + h^2 - x^2}{h}",
        justification: "f(x) = x² 식에 미분계수 정의를 대입하여 분자를 전개합니다."
      },
      {
        stepNumber: 2,
        mathExpression: "\\frac{2xh + h^2}{h} = 2x + h \\quad (h \\ne 0)",
        justification: "분모와 분자의 h를 약분하여 깔끔한 일차식으로 만듭니다."
      },
      {
        stepNumber: 3,
        mathExpression: "\\lim_{h \\to 0} (2x + h) = 2x \\implies (x^2)' = 2x",
        justification: "h를 0으로 보내면 남은 항은 정확히 2x가 도출됩니다!"
      }
    ],
    derivationDetail: {
      title: "0으로 나누지 않고 0의 문턱까지 다가가는 극한의 마법",
      backgroundStory: "수학에서 분모가 0이 되는 나눗셈은 금지되어 있습니다. 하지만 h가 0이 아니라 0에 '한없이 가까워지는 상태'라면 약분이 가능합니다! (2xh + h²)/h에서 h를 약분하면 2x + h가 되고, 이제 마음 놓고 h에 0을 대입하면 2x라는 깨끗한 순간 기울기가 남게 됩니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "\\frac{\\Delta y}{\\Delta x} = 2x + \\Delta x",
          justification: "평균변화율을 구하면 x에 따른 값과 간격 Δx가 남습니다."
        },
        {
          stepNumber: 2,
          mathExpression: "\\Delta x \\to 0 \\implies 2x",
          justification: "간격을 무한히 줄이면 순간변화율 도함수가 완성됩니다."
        }
      ],
      conclusion: "미분은 0으로 나누지 않으면서도 찰나의 순간 속도를 정확히 재는 극한의 위대한 발명입니다."
    },
    workedExample: {
      problem: "함수 f(x) = x³ - 4x + 7의 도함수 f'(x)를 구하고, x = 2에서의 접선의 기울기를 구하시오.",
      stepsToTrace: [
        "1단계: 거듭제곱 공식을 적용한다 ➔ (x³)' = 3x².",
        "2단계: 1차항과 상수항을 미분한다 ➔ (-4x)' = -4, (7)' = 0.",
        "3단계: 도함수 완성 ➔ f'(x) = 3x² - 4.",
        "4단계: x = 2를 대입한다 ➔ f'(2) = 3(2)² - 4 = 12 - 4 = 8."
      ],
      finalAnswer: "f'(x) = 3x² - 4, 접선 기울기: 8"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 다항함수의 도함수 구하기",
        question: "함수 f(x) = 5x⁴ - 2x³ + 7x - 9의 도함수 f'(x)를 구하시오.",
        interpretation: "거듭제곱 미분 공식 (x^n)' = n x^(n-1)과 상수의 미분은 0이라는 규칙을 각 항에 차례로 적용합니다.",
        solutionSteps: [
          "1단계: 5x⁴ 미분 ➔ 5 × 4x³ = 20x³",
          "2단계: -2x³ 미분 ➔ -2 × 3x² = -6x²",
          "3단계: 7x 미분 ➔ 7",
          "4단계: 상수항 -9 미분 ➔ 0",
          "5단계: 모두 합칩니다 ➔ f'(x) = 20x³ - 6x² + 7"
        ],
        answer: "f'(x) = 20x³ - 6x² + 7",
        keyPoint: "상수항(숫자만 있는 항)은 변화율이 0이므로 미분하면 완전히 사라집니다!"
      }
    ],
    csIntuition: "컴퓨터 프로그램에서 기호 미분을 할 수 없을 때, 아주 작은 $h = 10^{-5}$를 잡고 `(f(x + h) - f(x - h)) / (2 * h)`(중앙 차분 수치 미분)를 계산하면 오차 0.0001% 미만의 정밀한 순간 기울기를 얻을 수 있습니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "diff.c",
        code: "#include <stdio.h>\n\ntypedef double (*Func1D)(double);\ndouble diff(Func1D f, double x) {\n    double h = 1e-5;\n    return (f(x + h) - f(x - h)) / (2.0 * h);\n}\ndouble poly(double x) { return x*x*x - 4*x + 7; }\nint main(void) {\n    printf(\"f'(2) approx = %.4f (Exact: 8.0)\\n\", diff(poly, 2.0));\n    return 0;\n}\n",
        notes: "C23 수치 미분기"
      },
      go: {
        lang: "go",
        entryFile: "diff.go",
        code: "package main\nimport \"fmt\"\nfunc Diff(f func(float64) float64, x float64) float64 {\n    h := 1e-5\n    return (f(x+h) - f(x-h)) / (2*h)\n}\nfunc main() {\n    fmt.Printf(\"f'(2)=%.4f\\n\", Diff(func(x float64) float64 { return x*x*x - 4*x + 7 }, 2))\n}\n",
        notes: "Go 일급 함수 수치 미분"
      },
      rust: {
        lang: "rust",
        entryFile: "diff.rs",
        code: "fn diff<F: Fn(f64) -> f64>(f: F, x: f64) -> f64 {\n    let h = 1e-5;\n    (f(x + h) - f(x - h)) / (2.0 * h)\n}\nfn main() {\n    println!(\"{:.4}\", diff(|x| x*x*x - 4.0*x + 7.0, 2.0));\n}\n",
        notes: "Rust 클로저 미분"
      },
      python: {
        lang: "python",
        entryFile: "diff.py",
        code: "def diff(f, x, h=1e-5):\n    return (f(x+h) - f(x-h)) / (2*h)\nprint(f\"{diff(lambda x: x**3 - 4*x + 7, 2):.4f}\")\n",
        notes: "Python 람다 미분"
      },
      typescript: {
        lang: "typescript",
        entryFile: "diff.ts",
        code: "export function diff(f: (x: number) => number, x: number): number {\n  const h = 1e-5;\n  return (f(x + h) - f(x - h)) / (2 * h);\n}\nconsole.log(diff((x) => x ** 3 - 4 * x + 7, 2));\n",
        notes: "TS 수치 미분"
      },
      javascript: {
        lang: "javascript",
        entryFile: "diff.js",
        code: "function diff(f, x) { const h = 1e-5; return (f(x+h)-f(x-h))/(2*h); }\nconsole.log(diff(x => x**3 - 4*x + 7, 2));\n",
        notes: "JS 수치 미분"
      }
    }
  },

  // 12. 정적분과 곡선 아래의 넓이, 구분구적법
  {
    id: "mod-3-2-definite-integral",
    stage: "stage3-advanced-high",
    order: 12,
    titleKo: "정적분과 곡선 아래의 넓이, 구분구적법",
    titleEn: "Definite Integrals, Riemann Sums, and Area Under Curves",
    koreanCurriculumUnit: "고등학교 미적분 - Ⅲ. 적분법 (2. 정적분)",
    graphType: "COORDINATE_PLANE",
    graphCaption: "구간 [a, b]를 수천 개로 얇게 쪼갠 직사각형들의 넓이의 합(리만 합)이 곡선 아래의 면적으로 수렴하는 과정",
    terms: [
      { term: "부정적분 (Indefinite Integral)", definition: "미분의 정반대 거꾸로 계산! 도함수가 f(x)가 되는 원래의 함수 F(x)를 찾는 것" },
      { term: "구분구적법 (Method of Exhaustion)", definition: "곡선으로 둘러싸인 면적을 구하기 위해 얇은 직사각형 수만 개로 쪼개어 더하는 고대 아르키메데스의 아이디어" },
      { term: "리만 합 (Riemann Sum)", definition: "직사각형들의 밑변 × 높이를 차례로 모두 합산한 수식" },
      { term: "정적분 (Definite Integral, ∫_a^b)", definition: "구간 a부터 b까지 곡선 아래에 갇힌 순수한 땅의 넓이" },
      { term: "미적분학의 기본정리 (FTC)", definition: "무한히 직사각형을 더할 필요 없이, 부정적분의 끝값에서 시작값을 빼기(F(b) - F(a))만 하면 넓이가 1초 만에 나온다는 기적의 정리" }
    ],
    mathExplanation: "식빵을 얇게 썰어놓은 조각들을 다시 모으면 온전한 식빵 한 덩어리가 됩니다. 정적분(Integration)은 바로 이 '잘게 쪼개어 다시 합친다'는 아이디어입니다. 울퉁불퉁한 곡선 아래의 넓이를 구할 때, 미분의 역연산(부정적분)을 이용하면 복잡한 무한 덧셈을 단 한 줄의 뺄셈으로 끝낼 수 있습니다.",
    mathFormulasToTrace: [
      {
        title: "미적분학의 기본정리 (FTC 2)",
        latex: "\\int_a^b f(x) \\, dx = F(b) - F(a) \\quad (\\text{단, } F'(x) = f(x))",
        explanation: "원래 함수 F에 끝점 b를 대입한 값에서 시작점 a를 대입한 값을 빼면 곡선의 넓이가 나옵니다."
      },
      {
        title: "거듭제곱 적분 공식",
        latex: "\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (\\text{예: } \\int x^2 dx = \\frac{1}{3}x^3 + C)",
        explanation: "미분과 반대로 지수에 1을 더하고, 그 새로운 지수로 분모를 나누어줍니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "FTC",
        name: "미적분학의 기본정리 (Fundamental Theorem of Calculus)",
        meaning: "Fundamental(기본적인) + Theorem(정리) + of Calculus(미적분학의)의 머리글자 약자입니다. 미분과 적분이 서로 정반대 연산(역연산)임을 밝혀 무한 덧셈을 간단한 양 끝값 뺄셈 F(b) - F(a)로 끝내게 해준 인류 역사상 가장 위대한 수학 정리 중 하나입니다."
      },
      {
        symbol: "∫ (Integral)",
        name: "인테그랄 / 적분 기호",
        meaning: "합계(Sum)의 라틴어 Summa의 머리글자 S를 라이프니츠가 위아래로 길게 늘여서 만든 기호입니다. 무한히 많은 얇은 조각들을 빈틈없이 누적해서 합친다는 뜻입니다."
      },
      {
        symbol: "∫_a^b",
        name: "적분 구간 (아래끝 a와 위끝 b)",
        meaning: "x = a부터 x = b까지의 범위 안에서만 넓이를 구하라는 적분 구간의 시작점(a)과 끝점(b)입니다."
      },
      {
        symbol: "dx",
        name: "미소 가로 폭 (Differential x)",
        meaning: "무한히 얇은 직사각형의 가로 밑변 길이(Δx가 0으로 갈 때의 미세한 두께)입니다."
      },
      {
        symbol: "f(x) dx",
        name: "직사각형 하나의 미소 면적",
        meaning: "직사각형의 높이 f(x)와 밑변 dx를 곱한 미세한 조각의 면적입니다."
      },
      {
        symbol: "F(x)",
        name: "부정적분 / 원시함수 (Antiderivative)",
        meaning: "미분했을 때 도함수가 f(x)가 되는 원래의 본체 함수(F'(x) = f(x))를 뜻합니다."
      },
      {
        symbol: "C",
        name: "적분상수 (Constant of Integration)",
        meaning: "상수(Constant)의 머리글자 C입니다. 어떤 상수라도 미분하면 0이 되어 사라지므로, 부정적분으로 되돌릴 때 알 수 없는 원래 상수를 보충해 놓는 기호입니다."
      },
      {
        symbol: "∑ (Sigma)",
        name: "시그마 합 기호",
        meaning: "Sum(합)에 해당하는 그리스 문자 대문자 Σ입니다. n개의 직사각형 조각들의 넓이를 1번부터 n번까지 차례대로 더한다는 뜻입니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "\\Delta x = \\frac{b - a}{n}, \\quad S_n = \\sum_{k=1}^n f(a + k\\Delta x) \\Delta x",
        justification: "구간 [a, b]를 n개로 잘게 쪼갠 직사각형들의 넓이를 합산합니다."
      },
      {
        stepNumber: 2,
        mathExpression: "\\lim_{n \\to \\infty} S_n = \\int_a^b f(x) \\, dx = F(b) - F(a)",
        justification: "조각의 개수 n을 무한대로 보내면 오차가 0이 되며 정확한 정적분 넓이로 수렴합니다."
      }
    ],
    derivationDetail: {
      title: "종이 쌓기에서 유도된 미적분학 기본정리",
      backgroundStory: "종이 한 장의 두께는 거의 0에 가깝지만 수백 장을 차곡차곡 쌓으면 두꺼운 책(부피)이 됩니다. 곡선의 넓이를 구할 때 폭이 거의 0에 가까운 무한히 얇은 직사각형들을 적분 기호(∫: 합계를 뜻하는 Sum의 S를 길게 늘인 것) 아래에서 연속적으로 쌓아 올리는 것입니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "A'(x) = f(x)",
          justification: "넓이 함수 A(x)의 순간 증가율은 바로 그 위치에서의 곡선의 높이 f(x)와 완벽히 같습니다."
        },
        {
          stepNumber: 2,
          mathExpression: "A(x) = \\int f(x) dx = F(x) + C \\implies A(b) - A(a) = F(b) - F(a)",
          justification: "넓이의 변화율이 높이이므로, 넓이 자체는 높이를 적분한 원함수의 차이가 됩니다."
        }
      ],
      conclusion: "적분과 미분은 서로를 되돌리는 완벽한 짝꿍(역연산) 관계입니다."
    },
    workedExample: {
      problem: "구간 [0, 2]에서 곡선 f(x) = x²과 x축 사이의 넓이 ∫_0^2 x² dx를 구하시오.",
      stepsToTrace: [
        "1단계: x²의 부정적분을 구한다 ➔ F(x) = (1/3) x³.",
        "2단계: 위끝 x = 2를 대입한다 ➔ F(2) = (1/3) × 2³ = 8/3.",
        "3단계: 아래끝 x = 0을 대입한다 ➔ F(0) = 0.",
        "4단계: 뺀다 ➔ 8/3 - 0 = 8/3 (약 2.67)."
      ],
      finalAnswer: "넓이 = 8/3 (약 2.667)"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 정적분의 기본 계산",
        question: "다음 정적분의 값을 계산하시오: ∫_1^3 (2x + 3) dx",
        interpretation: "2x + 3의 부정적분(x² + 3x)을 구한 뒤 위끝 3을 넣은 값에서 아래끝 1을 넣은 값을 뺍니다.",
        solutionSteps: [
          "1단계: 부정적분을 구합니다 ➔ F(x) = x² + 3x",
          "2단계: 위끝 3을 대입합니다 ➔ F(3) = 3² + 3(3) = 9 + 9 = 18",
          "3단계: 아래끝 1을 대입합니다 ➔ F(1) = 1² + 3(1) = 1 + 3 = 4",
          "4단계: 뺍니다 ➔ 18 - 4 = 14"
        ],
        answer: "14",
        keyPoint: "정적분을 계산할 때는 적분상수 C는 어차피 뺄셈에서 상쇄되어 사라지므로 적지 않아도 됩니다."
      }
    ],
    csIntuition: "컴퓨터 알고리즘에서 적분을 풀 때는 직사각형 대신 윗변을 빗변으로 잇는 사다리꼴 공식(Trapezoidal Rule)을 씁니다. 게임 엔진에서 자동차의 가속도로부터 속도를 구하고, 속도로부터 위치를 누적 갱신할 때 이 사다리꼴 수치적분을 매 프레임 실행합니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "integral.c",
        code: "#include <stdio.h>\ntypedef double (*Func1D)(double);\ndouble trap_int(Func1D f, double a, double b, int n) {\n    double h = (b - a) / n;\n    double sum = 0.5 * (f(a) + f(b));\n    for (int i = 1; i < n; i++) sum += f(a + i * h);\n    return sum * h;\n}\ndouble sq(double x) { return x * x; }\nint main(void) {\n    printf(\"Int of x^2 [0, 2] = %.4f\\n\", trap_int(sq, 0.0, 2.0, 1000));\n    return 0;\n}\n",
        notes: "C23 사다리꼴 적분기"
      },
      go: {
        lang: "go",
        entryFile: "integral.go",
        code: "package main\nimport \"fmt\"\nfunc Trap(f func(float64) float64, a, b float64, n int) float64 {\n    h := (b-a)/float64(n)\n    s := 0.5*(f(a)+f(b))\n    for i := 1; i < n; i++ { s += f(a+float64(i)*h) }\n    return s * h\n}\nfunc main() {\n    fmt.Printf(\"%.4f\\n\", Trap(func(x float64) float64 { return x*x }, 0, 2, 1000))\n}\n",
        notes: "Go 수치 적분"
      },
      rust: {
        lang: "rust",
        entryFile: "integral.rs",
        code: "fn trap<F: Fn(f64) -> f64>(f: F, a: f64, b: f64, n: usize) -> f64 {\n    let h = (b - a) / n as f64;\n    let mut s = 0.5 * (f(a) + f(b));\n    for i in 1..n { s += f(a + i as f64 * h); }\n    s * h\n}\nfn main() { println!(\"{:.4}\", trap(|x| x*x, 0.0, 2.0, 1000)); }\n",
        notes: "Rust 적분기"
      },
      python: {
        lang: "python",
        entryFile: "integral.py",
        code: "def trap(f, a, b, n=1000):\n    h = (b-a)/n\n    s = 0.5*(f(a)+f(b)) + sum(f(a+i*h) for i in range(1, n))\n    return s * h\nprint(f\"{trap(lambda x: x**2, 0, 2):.4f}\")\n",
        notes: "Python 수치적분"
      },
      typescript: {
        lang: "typescript",
        entryFile: "integral.ts",
        code: "export function trap(f: (x: number) => number, a: number, b: number, n: number = 1000): number {\n  const h = (b - a) / n;\n  let s = 0.5 * (f(a) + f(b));\n  for (let i = 1; i < n; i++) s += f(a + i * h);\n  return s * h;\n}\nconsole.log(trap((x) => x * x, 0, 2));\n",
        notes: "TS 사다리꼴 적분"
      },
      javascript: {
        lang: "javascript",
        entryFile: "integral.js",
        code: "function trap(f, a, b, n = 1000) {\n  const h = (b - a) / n;\n  let s = 0.5 * (f(a) + f(b));\n  for (let i = 1; i < n; i++) s += f(a + i * h);\n  return s * h;\n}\nconsole.log(trap(x => x*x, 0, 2));\n",
        notes: "JS 정적분 함수"
      }
    }
  }
];
