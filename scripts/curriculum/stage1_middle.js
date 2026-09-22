/**
 * scripts/curriculum/stage1_middle.js
 * 중학교 1학년 수학:
 * 1. 소인수분해와 거듭제곱, 최대공약수
 * 2. 정수와 유리수, 수직선과 절댓값
 * 3. 순서쌍과 좌표평면, 사분면
 */

module.exports = [
  // 1. 소인수분해와 거듭제곱, 최대공약수
  {
    id: "mod-1-1-gcd-euclid",
    stage: "stage1-middle",
    order: 1,
    titleKo: "소인수분해와 거듭제곱, 최대공약수",
    titleEn: "Prime Factorization, Powers, and Euclidean GCD",
    koreanCurriculumUnit: "중학교 1학년 수학 - Ⅰ. 수와 연산 (1. 소인수분해)",
    graphType: "NUMBER_LINE",
    graphCaption: "수직선 위의 기준점(0)과 자연수의 약수 및 배수의 위치 관계",
    terms: [
      { term: "소수 (Prime Number)", definition: "1보다 큰 자연수 중에서 1과 자기 자신만을 약수로 갖는 수 (예: 2, 3, 5, 7, 11...). 2는 소수 중 유일한 짝수예요!" },
      { term: "합성수 (Composite Number)", definition: "1보다 큰 자연수 중에서 소수가 아닌 수, 즉 약수가 3개 이상인 수 (예: 4, 6, 8, 9...). ※ 1은 소수도 합성수도 아니에요." },
      { term: "거듭제곱 (Power)", definition: "같은 수를 여러 번 곱한 것을 간단히 쓰는 방법 (밑: 곱하는 수, 지수: 곱해진 횟수. 예: 2 × 2 × 2 = 2³)" },
      { term: "소인수분해 (Prime Factorization)", definition: "어떤 자연수를 오직 '소수들의 곱'으로만 분해하여 나타내는 것 (수의 레고 블록 분해)" },
      { term: "최대공약수 (GCD)", definition: "두 개 이상의 자연수가 공통으로 나누어떨어지는 약수(공약수) 중에서 가장 큰 수" },
      { term: "서로소 (Coprime)", definition: "최대공약수가 1뿐인 두 자연수의 관계 (예: 4와 9는 약수가 1만 겹치므로 서로소)" }
    ],
    mathExplanation: "초등학교 때는 12를 3 × 4로 나타냈지만, 4는 다시 2 × 2로 쪼갤 수 있습니다. 더 이상 쪼갤 수 없는 가장 순수한 수인 '소수'들만의 곱(12 = 2² × 3)으로 표현하는 것을 '소인수분해'라고 합니다. 모든 합성수는 소수들의 곱으로 단 하나의 유일한 모양으로 분해됩니다(산술의 기본정리). 큰 두 수의 최대공약수를 구할 때는 하나씩 나누지 않고 유클리드 호제법을 쓰면 엄청나게 빠르게 구할 수 있습니다.",
    mathFormulasToTrace: [
      {
        title: "나눗셈 정리 (Division Theorem)",
        latex: "a = bq + r \\quad (0 \\le r < b)",
        explanation: "자연수 a를 b로 나누면 몫 q와 나머지 r이 유일하게 결정되며, 나머지는 나누는 수 b보다 항상 작습니다."
      },
      {
        title: "유클리드 호제법 기본 공식",
        latex: "\\gcd(a, b) = \\gcd(b, a \\bmod b)",
        explanation: "큰 수 a와 b의 최대공약수는, 작은 수 b와 나머지 r의 최대공약수와 완벽하게 같습니다."
      },
      {
        title: "두 수의 곱과 최대공약수·최소공배수의 관계",
        latex: "a \\times b = \\gcd(a, b) \\times \\operatorname{lcm}(a, b)",
        explanation: "두 자연수를 곱한 값은 항상 두 수의 최대공약수와 최소공배수를 곱한 값과 일치합니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "GCD",
        name: "최대공약수 (Greatest Common Divisor)",
        meaning: "Greatest(가장 큰) + Common(공통의) + Divisor(나누는 수/약수)의 머리글자 약자입니다. 두 개 이상의 수가 공통으로 나누어떨어지는 공약수 중 가장 큰 수입니다."
      },
      {
        symbol: "LCM",
        name: "최소공배수 (Least Common Multiple)",
        meaning: "Least(가장 작은) + Common(공통의) + Multiple(배수)의 머리글자 약자입니다. 두 개 이상의 수가 공통으로 가지는 공배수 중 0을 제외하고 가장 작은 수입니다."
      },
      {
        symbol: "mod",
        name: "나머지 연산 (Modulo)",
        meaning: "Modulo(모듈로/나머지)의 약자입니다. a mod b는 'a를 b로 나누었을 때의 나머지'를 뜻하며, 프로그래밍 언어의 % 연산자와 동일합니다."
      },
      {
        symbol: "a",
        name: "나뉨수 (Dividend)",
        meaning: "나누어지는 원래 전체 수량입니다. (예: 나누어줄 빵 전체 17개)"
      },
      {
        symbol: "b",
        name: "나누는 수 (Divisor)",
        meaning: "몇 개씩 묶을지 나누는 기준이 되는 수량입니다. (예: 나누어줄 사람 수 5명)"
      },
      {
        symbol: "q",
        name: "몫 (Quotient)",
        meaning: "몫을 뜻하는 영어 Quotient의 머리글자 q입니다. 한 묶음당 똑같이 돌아가는 수량입니다. (예: 1인당 3개씩 분배)"
      },
      {
        symbol: "r",
        name: "나머지 (Remainder)",
        meaning: "남은 찌꺼기를 뜻하는 영어 Remainder의 머리글자 r입니다. 다 똑같이 나누어주고 끝에 남은 분량입니다. (예: 남은 빵 2개)"
      },
      {
        symbol: "bq",
        name: "곱셈 기호(×) 생략",
        meaning: "수학에서는 문자와 문자, 숫자와 문자의 곱셈에서 곱하기(×) 기호를 생략합니다. bq는 b × q를 뜻합니다."
      },
      {
        symbol: "0 ≤ r < b",
        name: "나머지의 수학적 성립 조건",
        meaning: "나머지 r은 음수가 될 수 없어 0 이상이어야 하고(0 ≤ r), 나누는 수 b보다 반드시 작아야 합니다(r < b). 만약 r이 b 이상이면 한 묶음을 더 묶어 나눌 수 있으므로 나눗셈이 아직 덜 끝난 것입니다."
      },
      {
        symbol: "\\quad",
        name: "수식 띄어쓰기 공백 (LaTeX Quad)",
        meaning: "수학 수식 조판 언어(LaTeX)에서 식과 조건식 사이를 보기 좋게 한 칸 띄워주는 간격(Quad Space) 명령입니다."
      },
      {
        symbol: "d | a",
        name: "나눈다 / 약수·배수 기호",
        meaning: "세로 막대(|)는 'd가 a를 나누어떨어뜨린다(d divides a)'는 뜻입니다. 즉, a는 d의 배수이고 d는 a의 약수라는 뜻입니다."
      },
      {
        symbol: "∴",
        name: "그러므로 (Therefore)",
        meaning: "점 3개 삼각형 기호로, 앞선 논리적 유도 과정을 바탕으로 최종 결론을 맺을 때 쓰는 수학 기호입니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "d = \\gcd(a, b) \\implies d \\mid a \\quad \\text{and} \\quad d \\mid b",
        justification: "d가 a와 b의 공약수이므로 a와 b는 둘 다 d의 배수입니다."
      },
      {
        stepNumber: 2,
        mathExpression: "a = bq + r \\implies r = a - bq",
        justification: "나눗셈 검산식에서 나머지만 남기기 위해 bq를 좌변으로 이항합니다."
      },
      {
        stepNumber: 3,
        mathExpression: "d \\mid a, \\ d \\mid b \\implies d \\mid (a - bq) \\implies d \\mid r",
        justification: "a도 d의 배수이고 b도 d의 배수이므로, 그 뺄셈인 나머지 r 역시 무조건 d의 배수가 됩니다."
      },
      {
        stepNumber: 4,
        mathExpression: "\\therefore \\gcd(a, b) = \\gcd(b, r)",
        justification: "공약수들이 완전히 일치하므로 그 중 제일 큰 최대공약수도 완벽히 같습니다."
      }
    ],
    derivationDetail: {
      title: "빵 나누기에서 탄생한 유클리드 호제법의 원리",
      backgroundStory: "초등학교 때 빵 17개를 5명에게 나눠주면 '1인당 3개씩 갖고 2개가 남는다(17 = 5×3 + 2)'고 배웠습니다. 고대 그리스의 수학자 유클리드는 이 나눗셈에서 엄청난 발견을 했습니다. 만약 어떤 도막(공약수)으로 17과 5를 똑같이 자를 수 있다면, 17에서 5를 세 번 덜어내고 남은 '나머지 2' 역시 그 도막으로 정확히 잘라져야 한다는 것입니다! 따라서 복잡하게 큰 수를 따질 필요 없이, 나누는 수(5)와 나머지(2)만 비교해도 최대공약수는 변하지 않습니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "a = b \\times q + r \\iff r = a - b \\times q",
          justification: "수학에서 나머지는 원래 수(a)에서 나누는 수(b)를 몫(q)만큼 덜어낸 나머지 분량입니다."
        },
        {
          stepNumber: 2,
          mathExpression: "a = k_1 \\times d, \\quad b = k_2 \\times d",
          justification: "a와 b의 공약수를 d라고 두면, a와 b는 각각 d라는 공통 블록으로 딱 맞게 조립됩니다."
        },
        {
          stepNumber: 3,
          mathExpression: "r = (k_1 \\times d) - (k_2 \\times d) \\times q = (k_1 - k_2 q) \\times d",
          justification: "나머지 r 식에 대입하면 d로 묶어낼 수 있으므로, 나머지 r도 무조건 d의 배수가 됩니다."
        },
        {
          stepNumber: 4,
          mathExpression: "\\gcd(a, b) = \\gcd(b, r) = \\gcd(r, r_2) = \\dots = \\text{마지막 0 직전의 나누는 수}",
          justification: "나머지가 0이 될 때까지 이 과정을 반복하면 가장 작은 단계에서 최대공약수가 바로 튀어나옵니다."
        }
      ],
      conclusion: "아무리 1억 자리의 큰 수라도 나머지를 구하는 나눗셈을 몇 번 반복하기만 하면 최대공약수를 빛의 속도로 구할 수 있습니다."
    },
    workedExample: {
      problem: "두 자연수 1071과 462의 최대공약수를 유클리드 호제법으로 구하시오.",
      stepsToTrace: [
        "1단계: 1071을 462로 나눈다 ➔ 1071 = 462 × 2 + 147 (나머지 147)",
        "2단계: 앞의 나누는 수 462를 나머지 147로 나눈다 ➔ 462 = 147 × 3 + 21 (나머지 21)",
        "3단계: 앞의 나누는 수 147을 나머지 21로 나눈다 ➔ 147 = 21 × 7 + 0 (나머지 0)",
        "결론: 나머지가 0이 되었을 때 나누는 수였던 21이 최종 최대공약수이다."
      ],
      finalAnswer: "gcd(1071, 462) = 21"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 개념: 소인수분해와 거듭제곱 표현",
        question: "자연수 360을 소인수분해하고, 거듭제곱 꼴로 나타낸 후 360의 소인수를 모두 구하시오.",
        interpretation: "소인수분해를 할 때는 가장 작은 소수인 2부터 시작하여 더 이상 나눌 수 없을 때까지(몫이 소수가 될 때까지) 차례로 나누어갑니다. 마지막에 나온 소수들의 개수를 지수로 세어줍니다.",
        solutionSteps: [
          "1단계: 360은 짝수이므로 2로 나눕니다 ➔ 360 ÷ 2 = 180",
          "2단계: 180 ÷ 2 = 90, 90 ÷ 2 = 45 (2로 3번 나누어짐 ➔ 2³)",
          "3단계: 45는 3으로 나뉩니다 ➔ 45 ÷ 3 = 15, 15 ÷ 3 = 5 (3으로 2번 나누어짐 ➔ 3²)",
          "4단계: 마지막 몫은 5(소수)이므로 분해 완료 ➔ 360 = 2 × 2 × 2 × 3 × 3 × 5 = 2³ × 3² × 5",
          "5단계: 소인수는 거듭제곱의 '밑'에 있는 소수들이므로 2, 3, 5입니다."
        ],
        answer: "360 = 2³ × 3² × 5, 소인수: 2, 3, 5",
        keyPoint: "지수(작은 숫자)는 곱해진 횟수입니다. 2가 3개 곱해졌으므로 2×3=6이 아니라 2³=8임을 헷갈리지 마세요!"
      },
      {
        problemNumber: 2,
        title: "실전 문제: 유클리드 호제법과 분수 약분",
        question: "분수 105 / 252를 기약분수(더 이상 약분할 수 없는 분수)로 나타내기 위해 분자와 분모의 최대공약수를 구하고 약분하시오.",
        interpretation: "분수 약분의 핵심은 분자와 분모를 '최대공약수'로 동시에 나누는 것입니다. 252와 105에 유클리드 호제법을 적용하면 공약수를 한 번에 찾을 수 있습니다.",
        solutionSteps: [
          "1단계: 큰 수 252를 105로 나눕니다 ➔ 252 = 105 × 2 + 42 (나머지 42)",
          "2단계: 105를 42로 나눕니다 ➔ 105 = 42 × 2 + 21 (나머지 21)",
          "3단계: 42를 21로 나눕니다 ➔ 42 = 21 × 2 + 0 (나머지 0, 나눗셈 종료)",
          "4단계: 마지막 나누는 수 21이 최대공약수 gcd(252, 105) = 21입니다.",
          "5단계: 분자와 분모를 각각 21로 약분합니다 ➔ 105 ÷ 21 = 5, 252 ÷ 21 = 12."
        ],
        answer: "최대공약수 = 21, 기약분수 = 5 / 12",
        keyPoint: "나머지가 0이 되었을 때의 몫(2)이 아니라 '나누었던 수(21)'가 최대공약수라는 점을 주의하세요."
      },
      {
        problemNumber: 3,
        title: "응용 문제: 최대공약수와 최소공배수 관계식 활용",
        question: "두 자연수 A와 24의 최대공약수가 6이고 최소공배수가 72일 때, 자연수 A의 값을 구하시오.",
        interpretation: "중1 교과서 공식인 '두 수의 곱 = 최대공약수 × 최소공배수 (A × B = G × L)'를 떠올립니다. 식에 알고 있는 값들을 대입하여 일차방정식을 풀면 됩니다.",
        solutionSteps: [
          "1단계: 두 수의 곱과 GCD, LCM의 관계식 A × B = gcd × lcm을 적습니다.",
          "2단계: 문제에서 주어진 B = 24, gcd = 6, lcm = 72를 대입합니다 ➔ A × 24 = 6 × 72",
          "3단계: 우변을 계산합니다 ➔ 6 × 72 = 432",
          "4단계: 양변을 24로 나누어 A를 구합니다 ➔ A = 432 ÷ 24 = 18",
          "5단계: 검산해 봅니다. 18 = 2 × 3², 24 = 2³ × 3 ➔ gcd = 2 × 3 = 6, lcm = 2³ × 3² = 72로 정확히 일치합니다."
        ],
        answer: "A = 18",
        keyPoint: "A × B = G × L 공식은 두 수일 때만 성립합니다(세 수일 때는 다른 방식을 씁니다)."
      }
    ],
    csIntuition: "컴퓨터에서 1부터 차례로 나누면 O(N) 시간이 걸려 암호학에서 쓰는 100자리 숫자는 우주 수명 동안 계산해야 하지만, 유클리드 호제법은 나눗셈 1번마다 숫자가 최소 절반 이하로 급감하여 O(log N)에 끝납니다. 이는 인터넷 보안 암호(RSA)의 핵심 토대입니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "gcd.c",
        code: "#include <stdint.h>\n#include <stdio.h>\n\nuint64_t gcd(uint64_t a, uint64_t b) {\n    while (b != 0) {\n        uint64_t temp = b;\n        b = a % b;\n        a = temp;\n    }\n    return a;\n}\n\nint main(void) {\n    printf(\"GCD(1071, 462) = %llu\\n\", (unsigned long long)gcd(1071, 462));\n    return 0;\n}\n",
        notes: "C23 64비트 정수 오버플로우 방어"
      },
      go: {
        lang: "go",
        entryFile: "gcd.go",
        code: "package main\n\nimport \"fmt\"\n\nfunc GCD(a, b int64) int64 {\n\tfor b != 0 {\n\t\ta, b = b, a%b\n\t}\n\treturn a\n}\n\nfunc main() {\n\tfmt.Println(\"GCD(1071, 462) =\", GCD(1071, 462))\n}\n",
        notes: "Go 다중 대입 구문 활용"
      },
      rust: {
        lang: "rust",
        entryFile: "gcd.rs",
        code: "pub fn gcd(mut a: u64, mut b: u64) -> u64 {\n    while b != 0 {\n        let temp = b;\n        b = a % b;\n        a = temp;\n    }\n    a\n}\n\nfn main() {\n    println!(\"GCD(1071, 462) = {}\", gcd(1071, 462));\n}\n",
        notes: "Rust 제로 코스트 추상화 루프"
      },
      python: {
        lang: "python",
        entryFile: "gcd.py",
        code: "def gcd(a: int, b: int) -> int:\n    while b != 0:\n        a, b = b, a % b\n    return a\n\nif __name__ == \"__main__\":\n    print(\"GCD(1071, 462) =\", gcd(1071, 462))\n",
        notes: "Python 튜플 스왑 방식"
      },
      typescript: {
        lang: "typescript",
        entryFile: "gcd.ts",
        code: "export function gcd(a: number, b: number): number {\n  let x = Math.abs(a);\n  let y = Math.abs(b);\n  while (y !== 0) {\n    const temp = y;\n    y = x % y;\n    x = temp;\n  }\n  return x;\n}\n\nconsole.log(`GCD(1071, 462) = ${gcd(1071, 462)}`);\n",
        notes: "TS 절댓값 방어 함수"
      },
      javascript: {
        lang: "javascript",
        entryFile: "gcd.js",
        code: "function gcd(a, b) {\n  let x = Math.abs(a);\n  let y = Math.abs(b);\n  while (y !== 0) {\n    const temp = y;\n    y = x % y;\n    x = temp;\n  }\n  return x;\n}\nconsole.log(\"GCD(1071, 462) =\", gcd(1071, 462));\n",
        notes: "JS 표준 구현"
      }
    }
  },

  // 2. 정수와 유리수, 수직선과 절댓값
  {
    id: "mod-1-2-integers-number-line",
    stage: "stage1-middle",
    order: 2,
    titleKo: "정수와 유리수, 수직선과 절댓값",
    titleEn: "Integers, Rational Numbers, Number Line, and Absolute Value",
    koreanCurriculumUnit: "중학교 1학년 수학 - Ⅰ. 수와 연산 (2. 정수와 유리수)",
    graphType: "NUMBER_LINE",
    graphCaption: "기준 0을 중심으로 오른쪽은 양수(+), 왼쪽은 음수(-)이며, 원점과의 거리가 절댓값입니다.",
    terms: [
      { term: "양수와 음수 (Positive & Negative)", definition: "기준 0보다 큰 수에는 양의 부호(+), 작은 수에는 음의 부호(-)를 붙인 수 (예: 해발 +100m, 해저 -50m)" },
      { term: "정수 (Integer)", definition: "양의 정수(자연수, +1, +2...), 0, 음의 정수(-1, -2...)를 모두 통틀어 부르는 말" },
      { term: "유리수 (Rational Number)", definition: "분모가 0이 아닌 분수 b/a (a, b는 정수) 꼴로 나타낼 수 있는 모든 수" },
      { term: "수직선 (Number Line)", definition: "직선 위에 기준점 0(원점)을 잡고 일정한 눈금으로 수를 늘어놓은 직선 (오른쪽일수록 크고 왼쪽일수록 작음)" },
      { term: "절댓값 (Absolute Value, |x|)", definition: "수직선 위에서 어떤 수를 나타내는 점과 원점(0) 사이의 순수한 '거리'. 거리는 음수가 없으므로 항상 0 이상!" }
    ],
    mathExplanation: "초등학교 때는 0보다 작은 수를 생각할 수 없었지만, 겨울철 영하의 기온이나 빚, 엘리베이터 지하층처럼 현실에는 0보다 작은 수량이 얼마든지 존재합니다. 수직선 위에서 오른쪽으로 가면 더하기(+), 왼쪽으로 가면 빼기(-)가 됩니다. 절댓값은 방향과 상관없이 '원점에서 몇 걸음 떨어져 있는가?'라는 거리만을 잰 것입니다.",
    mathFormulasToTrace: [
      {
        title: "절댓값의 수학적 정의",
        latex: "|x| = \\begin{cases} x & (x \\ge 0) \\\\ -x & (x < 0) \\end{cases}",
        explanation: "x가 0 이상이면 그대로 나오고, 음수이면 앞에 마이너스를 한 번 더 붙여서 양수로 만들어 탈출합니다."
      },
      {
        title: "수직선 위 두 점 사이의 거리 공식",
        latex: "d(A, B) = |a - b| = |b - a|",
        explanation: "두 점 사이 거리는 큰 수에서 작은 수를 빼거나, 두 좌표의 차이에 절댓값을 씌우면 됩니다."
      },
      {
        title: "음수와 음수의 곱셈 법칙",
        latex: "(-a) \\times (-b) = +(a \\times b)",
        explanation: "음수와 음수를 곱하면 부호가 반전되어 반드시 양수가 됩니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "|x|",
        name: "절댓값 기호 (Vertical Bars)",
        meaning: "두 개의 수직 막대(| |) 사이에 숫자를 넣은 기호로, 부호를 뗀 순수한 '거리'를 뜻합니다. 원점(0)에서 x까지의 거리이므로 결과는 항상 0 이상입니다."
      },
      {
        symbol: "x",
        name: "미지수 / 변수 (Variable)",
        meaning: "어떤 정수나 유리수도 대신 들어갈 수 있는 빈 상자 역할을 하는 대표 문자입니다."
      },
      {
        symbol: "\\begin{cases} ... \\end{cases}",
        name: "경우별 조건 묶음 괄호",
        meaning: "수학에서 입력값의 조건에 따라 결과 공식이 달라질 때, 왼쪽을 큰 중괄호({)로 묶어 경우를 나누어 설명하는 기호입니다."
      },
      {
        symbol: "x ≥ 0",
        name: "0 이상 (양수 또는 0)",
        meaning: "x가 0보다 크거나 같을 때를 뜻합니다. 이때는 부호를 바꿀 필요 없이 |x| = x 그대로 껍질을 벗고 나옵니다."
      },
      {
        symbol: "x < 0",
        name: "0 미만 (음수)",
        meaning: "x가 0보다 작은 음수일 때를 뜻합니다."
      },
      {
        symbol: "-x",
        name: "부호 반전 (양수로 변환)",
        meaning: "x가 이미 음수(예: -5)일 때, 앞에 마이너스를 한 번 더 붙여 -(-5) = +5로 만들어 거리(양수)로 탈출시키는 조작입니다."
      },
      {
        symbol: "d(A, B)",
        name: "두 점 사이의 거리 함수",
        meaning: "거리를 뜻하는 영어 Distance의 머리글자 d입니다. 점 A와 점 B 사이의 실제 물리적 간격을 나타냅니다."
      },
      {
        symbol: "|a - b| = |b - a|",
        name: "거리의 대칭성",
        meaning: "A에서 B까지의 거리나 B에서 A까지의 거리는 같습니다. 뺄셈 순서가 바뀌어도 절댓값을 씌우면 결과가 동일한 양수 거리가 됩니다."
      },
      {
        symbol: "+, -",
        name: "양의 부호(Plus)와 음의 부호(Minus)",
        meaning: "기준점 0보다 오른쪽(이익, 지상)에 있으면 양의 부호(+), 0보다 왼쪽(손실, 지하)에 있으면 음의 부호(-)를 붙입니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "(-1) \\times (1 + (-1)) = (-1) \\times 0 = 0",
        justification: "1과 -1을 더하면 0이므로 어떤 수에 0을 곱하면 0이 됩니다."
      },
      {
        stepNumber: 2,
        mathExpression: "(-1) \\times 1 + (-1) \\times (-1) = 0",
        justification: "분배법칙을 써서 좌변의 괄호를 하나씩 풀어 전개합니다."
      },
      {
        stepNumber: 3,
        mathExpression: "-1 + (-1) \\times (-1) = 0 \\implies (-1) \\times (-1) = 1",
        justification: "-1에 무엇을 더해야 0이 될까요? 바로 +1입니다. 따라서 음수끼리 곱하면 양수가 됩니다!"
      }
    ],
    derivationDetail: {
      title: "왜 음수 곱하기 음수는 양수가 될까? (수식 도출의 비밀)",
      backgroundStory: "많은 중1 학생들이 가장 혼란스러워하는 질문입니다. '빚과 빚을 곱하는데 왜 갑자기 돈이 생겨요?' 이는 일상 언어의 비유 때문입니다. 수학에서 곱셈은 '방향의 반전'을 의미합니다. 동영상을 뒤로 감기(음수) 상태에서, 뒤로 걷는 사람(음수)을 재생하면 화면 속 사람은 앞으로 걸어가는 것(+양수)처럼 보입니다! 수학자들은 분배법칙이라는 거대한 규칙이 깨지지 않도록 논리적으로 이를 유도했습니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "3 \\times (-2) = -6, \\quad 2 \\times (-2) = -4, \\quad 1 \\times (-2) = -2, \\quad 0 \\times (-2) = 0",
          justification: "앞의 숫자가 1씩 줄어들 때마다 계산 결과는 2씩 커지고 있는 규칙적인 패턴을 관찰합니다."
        },
        {
          stepNumber: 2,
          mathExpression: "(-1) \\times (-2) = 0 + 2 = +2",
          justification: "앞의 숫자를 0에서 -1로 1 더 줄이면, 규칙에 따라 결과는 2가 더 커져서 +2가 되어야만 규칙이 유지됩니다."
        },
        {
          stepNumber: 3,
          mathExpression: "(-a) \\times (-b) = -1 \\times a \\times -1 \\times b = (-1 \\times -1) \\times (a \\times b) = + (ab)",
          justification: "모든 음수의 곱은 (-1)×(-1)=+1이라는 논리적 불변식 덕분에 양수로 도출됩니다."
        }
      ],
      conclusion: "음수와 음수의 곱이 양수가 되는 것은 단순한 암기 규칙이 아니라, 수학 전체의 일관성과 분배법칙을 지탱하는 완벽한 논리적 필연입니다."
    },
    workedExample: {
      problem: "수직선 위의 두 점 A(-7)과 B(5)에 대하여 점 A의 절댓값과 두 점 A, B 사이의 거리를 구하시오.",
      stepsToTrace: [
        "1단계: 점 A의 절댓값은 원점(0)에서 -7까지의 거리이므로 |-7| = 7이다.",
        "2단계: 두 점 사이의 거리는 d = |5 - (-7)|을 계산한다.",
        "3단계: 마이너스 마이너스는 플러스가 되므로 5 - (-7) = 5 + 7 = 12이다.",
        "4단계: 따라서 거리 d = |12| = 12이다."
      ],
      finalAnswer: "|-7| = 7, 거리 d = 12"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 수직선 위의 수의 대소 관계와 절댓값",
        question: "다음 수 중에서 절댓값이 가장 큰 수와 가장 작은 수를 각각 고르시오: [-5, +3, -1.5, +4.8, 0]",
        interpretation: "절댓값은 부호(+, -)를 떼어내고 순수한 숫자의 크기(원점에서의 거리)만 비교하는 문제입니다. 0의 절댓값은 0입니다.",
        solutionSteps: [
          "1단계: 각 수의 절댓값을 구합니다.",
          "   |-5| = 5, |+3| = 3, |-1.5| = 1.5, |+4.8| = 4.8, |0| = 0",
          "2단계: 절댓값 크기 순서로 나열합니다: 0 < 1.5 < 3 < 4.8 < 5",
          "3단계: 절댓값이 가장 큰 수는 5를 만든 '-5'입니다.",
          "4단계: 절댓값이 가장 작은 수는 원점 그 자체인 '0'입니다."
        ],
        answer: "절댓값이 가장 큰 수: -5, 가장 작은 수: 0",
        keyPoint: "그냥 수의 대소 비교라면 -5가 가장 작겠지만, '절댓값'을 물었으므로 원점에서 가장 멀리 떨어진 -5가 가장 큰 절댓값(5)을 갖습니다!"
      },
      {
        problemNumber: 2,
        title: "실전 문제: 부호가 섞인 혼합 사칙연산",
        question: "다음 식의 값을 계산하시오: (-3)² - (-12) ÷ (+4) × (-2)",
        interpretation: "중1 혼합 계산의 절대 원칙: 1) 거듭제곱 먼저 ➔ 2) 괄호 안 ➔ 3) 곱셈·나눗셈 ➔ 4) 덧셈·뺄셈 순서로 해결합니다. 부호 처리에 유의합니다.",
        solutionSteps: [
          "1단계: 거듭제곱 (-3)²을 먼저 계산합니다 ➔ (-3) × (-3) = +9",
          "2단계: 나눗셈 (-12) ÷ (+4)를 계산합니다 ➔ 부호가 다르므로 -3",
          "3단계: 곱셈 (-3) × (-2)를 계산합니다 ➔ 음수 × 음수는 양수이므로 +6",
          "4단계: 뺄셈 식에 대입하여 최종 연산합니다 ➔ 9 - (+6) = 9 - 6 = 3"
        ],
        answer: "3",
        keyPoint: "(-3)² = +9이지만, 만약 -3²으로 괄호가 없다면 -(3×3) = -9가 됩니다. 괄호가 있는지 없는지 꼭 눈을 크게 뜨고 확인하세요!"
      },
      {
        problemNumber: 3,
        title: "응용 문제: 수직선 상의 중점(가운데 점) 좌표 구하기",
        question: "수직선 위의 두 점 P(-8)과 Q(+4)의 한가운데에 있는 점 M(중점)의 좌표를 구하시오.",
        interpretation: "두 점의 가운데 점(중점)은 두 점의 좌표를 더한 뒤 2로 나누는 평균(산술평균)으로 구할 수도 있고, 전체 거리를 반으로 나누어 한쪽에서 더해갈 수도 있습니다.",
        solutionSteps: [
          "방법 1 (평균 공식):",
          "1단계: 두 좌표를 더합니다 ➔ (-8) + (+4) = -4",
          "2단계: 2로 나눕니다 ➔ (-4) ÷ 2 = -2",
          "방법 2 (거리 이용):",
          "1단계: P와 Q 사이 거리는 |4 - (-8)| = |4 + 8| = 12입니다.",
          "2단계: 가운데까지의 거리는 12 ÷ 2 = 6입니다.",
          "3단계: P(-8)에서 오른쪽(+)으로 6만큼 이동합니다 ➔ -8 + 6 = -2"
        ],
        answer: "중점 M의 좌표 = -2",
        keyPoint: "음수와 양수의 덧셈에서 절댓값이 큰 쪽의 부호(-8의 마이너스)를 따라간다는 점을 명심하세요."
      }
    ],
    csIntuition: "컴퓨터 하드웨어(CPU)는 음수를 표현하기 위해 2의 보수(Two's Complement)를 씁니다. 비트를 반전시킨 후 1을 더하면 뺄셈 회로를 따로 만들지 않고 덧셈기 하나만으로 모든 사칙연산을 초고속 처리할 수 있습니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "abs.c",
        code: "#include <stdio.h>\n#include <stdint.h>\n\nint64_t my_abs(int64_t x) {\n    return (x < 0) ? -x : x;\n}\n\nint64_t dist_1d(int64_t a, int64_t b) {\n    return my_abs(a - b);\n}\n\nint main(void) {\n    printf(\"Dist(-7, 5) = %lld\\n\", (long long)dist_1d(-7, 5));\n    return 0;\n}\n",
        notes: "삼항 연산자 기반 절댓값 및 1차원 거리"
      },
      go: {
        lang: "go",
        entryFile: "abs.go",
        code: "package main\n\nimport \"fmt\"\n\nfunc Abs(x int64) int64 {\n\tif x < 0 { return -x }\n\treturn x\n}\n\nfunc Dist1D(a, b int64) int64 {\n\treturn Abs(a - b)\n}\n\nfunc main() {\n\tfmt.Println(\"Dist(-7, 5) =\", Dist1D(-7, 5))\n}\n",
        notes: "Go 정수 절댓값 함수"
      },
      rust: {
        lang: "rust",
        entryFile: "abs.rs",
        code: "pub fn my_abs(x: i64) -> i64 {\n    if x < 0 { -x } else { x }\n}\n\npub fn dist_1d(a: i64, b: i64) -> i64 {\n    my_abs(a - b)\n}\n\nfn main() {\n    println!(\"Dist: {}\", dist_1d(-7, 5));\n}\n",
        notes: "Rust 식(expression) if-else"
      },
      python: {
        lang: "python",
        entryFile: "abs.py",
        code: "def my_abs(x: int) -> int:\n    return -x if x < 0 else x\n\ndef dist_1d(a: int, b: int) -> int:\n    return my_abs(a - b)\n\nif __name__ == \"__main__\":\n    print(\"Dist(-7, 5) =\", dist_1d(-7, 5))\n",
        notes: "Python 삼항 표현식"
      },
      typescript: {
        lang: "typescript",
        entryFile: "abs.ts",
        code: "export function myAbs(x: number): number {\n  return x < 0 ? -x : x;\n}\n\nexport function dist1D(a: number, b: number): number {\n  return myAbs(a - b);\n}\n\nconsole.log(`Dist: ${dist1D(-7, 5)}`);\n",
        notes: "TS 1D 거리 계산기"
      },
      javascript: {
        lang: "javascript",
        entryFile: "abs.js",
        code: "function myAbs(x) { return x < 0 ? -x : x; }\nfunction dist1D(a, b) { return myAbs(a - b); }\nconsole.log(\"Dist:\", dist1D(-7, 5));\n",
        notes: "JS 기본 함수"
      }
    }
  },

  // 3. 순서쌍과 좌표평면, 사분면
  {
    id: "mod-1-3-coordinate-plane",
    stage: "stage1-middle",
    order: 3,
    titleKo: "순서쌍과 좌표평면, 사분면",
    titleEn: "Ordered Pairs, Coordinate Plane, and Quadrants",
    koreanCurriculumUnit: "중학교 1학년 수학 - Ⅱ. 좌표평면과 그래프 (1. 순서쌍과 좌표)",
    graphType: "COORDINATE_PLANE",
    graphCaption: "가로축(x축)과 세로축(y축)이 만나는 원점 (0,0)과 반시계 방향으로 도는 제1, 제2, 제3, 제4사분면",
    terms: [
      { term: "순서쌍 (Ordered Pair)", definition: "순서를 생각하여 두 수를 (a, b)처럼 짝지어 나타낸 것 (앞이 가로 x, 뒤가 세로 y)" },
      { term: "x축과 y축 (Coordinate Axes)", definition: "평면 위에 가로로 놓인 수직선을 x축, 세로로 놓인 수직선을 y축이라고 부름" },
      { term: "원점 (Origin, O)", definition: "x축과 y축이 직각으로 교차하는 기준점 (0, 0)" },
      { term: "좌표평면 (Cartesian Plane)", definition: "두 좌표축에 의해 평면 위의 모든 위치를 (x, y)라는 주소로 나타낼 수 있는 2차원 세계" },
      { term: "사분면 (Quadrant)", definition: "좌표축에 의해 평면이 4개로 쪼개진 방. 오른쪽 위부터 반시계 방향으로 제1, 2, 3, 4사분면" }
    ],
    mathExplanation: "천장에 붙은 파리의 위치를 숫자로 정확히 설명하고 싶었던 프랑스 수학자 데카르트의 기발한 아이디어에서 좌표평면이 탄생했습니다. 수직선 하나는 1차원(선)이었지만, 가로선과 세로선 2개를 교차시키면 2차원(면)의 모든 위치를 (x, y) 순서쌍으로 정확히 찍을 수 있습니다. 이것이 바로 컴퓨터 모니터의 픽셀 좌표계이자 모든 스마트폰 게임 맵의 뼈대입니다.",
    mathFormulasToTrace: [
      {
        title: "사분면 부호 판별 법칙 (반시계 방향 회전)",
        latex: "\\begin{cases} \\text{제1사분면 (우상):} & x > 0, \\ y > 0 \\quad (+, +) \\\\ \\text{제2사분면 (좌상):} & x < 0, \\ y > 0 \\quad (-, +) \\\\ \\text{제3사분면 (좌하):} & x < 0, \\ y < 0 \\quad (-, -) \\\\ \\text{제4사분면 (우하):} & x > 0, \\ y < 0 \\quad (+, -) \\end{cases}",
        explanation: "x와 y의 부호만 보면 점이 어느 방에 들어가 있는지 즉시 판별됩니다. (축 위의 점은 사분면에 포함되지 않아요!)"
      },
      {
        title: "좌표 대칭이동 공식 (종이접기 원리)",
        latex: "\\begin{cases} x\\text{축 대칭 (상하 반전):} & (x, y) \\to (x, -y) \\\\ y\\text{축 대칭 (좌우 반전):} & (x, y) \\to (-x, y) \\\\ \\text{원점 대칭 (180도 회전):} & (x, y) \\to (-x, -y) \\end{cases}",
        explanation: "접는 축의 반대쪽 좌표 부호가 반대로 바뀝니다."
      }
    ],
    symbolGuide: [
      {
        symbol: "(x, y)",
        name: "순서쌍 (Ordered Pair)",
        meaning: "두 수를 괄호와 쉼표로 묶어 '순서'를 고정한 표기법입니다. 앞자리 x는 가로(좌우), 뒷자리 y는 세로(상하)를 뜻하므로 (2, 3)과 (3, 2)는 전혀 다른 위치입니다."
      },
      {
        symbol: "x",
        name: "x좌표 (가로 위치 / Abscissa)",
        meaning: "원점(0, 0)을 기준으로 오른쪽(+)으로 몇 칸, 또는 왼쪽(-)으로 몇 칸 떨어져 있는지를 나타냅니다."
      },
      {
        symbol: "y",
        name: "y좌표 (세로 위치 / Ordinate)",
        meaning: "원점(0, 0)을 기준으로 위쪽(+)으로 몇 칸, 또는 아래쪽(-)으로 몇 칸 떨어져 있는지를 나타냅니다."
      },
      {
        symbol: "O (0, 0)",
        name: "원점 (Origin)",
        meaning: "영어 Origin(기원/출발점)의 머리글자 대문자 O입니다. 가로 x축과 세로 y축이 직각으로 교차하는 모든 위치의 기준점 (0, 0)입니다."
      },
      {
        symbol: "(+, +), (-, +), (-, -), (+, -)",
        name: "사분면 부호 (Quadrants Signs)",
        meaning: "평면이 4개로 나뉜 방의 부호입니다. 제1사분면(오른쪽 위: +, +), 제2사분면(왼쪽 위: -, +), 제3사분면(왼쪽 아래: -, -), 제4사분면(오른쪽 아래: +, -) 순서로 반시계 방향으로 돕니다."
      },
      {
        symbol: "→ (화살표)",
        name: "대칭이동 사상 (Transformation Mapping)",
        meaning: "어떤 점 P(x, y)가 대칭 이동이나 회전 변환 규칙에 의해 새로운 좌표로 변환되어 이동함을 나타냅니다."
      },
      {
        symbol: "P, P'",
        name: "점의 이름과 프라임 기호",
        meaning: "점(Point)의 머리글자 P를 쓰고, 작은따옴표(' 프라임)는 대칭 이동 후 새롭게 옮겨간 점의 위치를 구별하기 위해 붙이는 기호입니다."
      }
    ],
    derivationStepsToTrace: [
      {
        stepNumber: 1,
        mathExpression: "P(x, y) \\xrightarrow{x\\text{축 대칭}} P'(x, -y)",
        justification: "x축을 접는 선으로 접으면 가로 위치 x는 그대로이고 높이 y만 반대로 뒤집힙니다."
      },
      {
        stepNumber: 2,
        mathExpression: "P(x, y) \\xrightarrow{y\\text{축 대칭}} P''(-x, y)",
        justification: "y축을 접는 선으로 접으면 높이 y는 그대로이고 가로 위치 x만 반대로 뒤집힙니다."
      },
      {
        stepNumber: 3,
        mathExpression: "P(x, y) \\xrightarrow{\\text{원점 대칭}} P'''(-x, -y)",
        justification: "x축 대칭을 하고 연달아 y축 대칭을 하면 두 좌표 부호가 모두 반전되어 180도 점대칭이 됩니다."
      }
    ],
    derivationDetail: {
      title: "사분면의 번호가 왜 시계 반대 방향으로 붙었을까?",
      backgroundStory: "시계는 오른쪽(시계 방향)으로 도는데 왜 사분면은 제1 ➔ 제2 ➔ 제3 ➔ 제4사분면으로 '시계 반대 방향'으로 돌까요? 수학에서는 양수(+)의 방향을 항상 기본으로 삼습니다. x도 양수, y도 양수인 가장 평화로운 오른쪽 위가 '제1사분면'입니다. 여기서 양의 각도(회전)를 정의할 때, x축에서 y축으로 올라가는 회전 방향이 바로 시계 반대 방향이기 때문에 모든 사분면과 각도의 기준이 반시계 방향으로 정해졌습니다.",
      steps: [
        {
          stepNumber: 1,
          mathExpression: "\\text{시작(동쪽): } (x>0, y=0) \\xrightarrow{+90^\\circ \\text{ 회전}} \\text{북쪽: } (x=0, y>0)",
          justification: "x축 양의 방향에서 y축 양의 방향으로 가려면 시계 반대 방향으로 90도 돌아야 합니다."
        },
        {
          stepNumber: 2,
          mathExpression: "\\text{제1사분면}(+,+) \\to \\text{제2사분면}(-,+) \\to \\text{제3사분면}(-,-) \\to \\text{제4사분면}(+,-)",
          justification: "각도가 0° ➔ 90° ➔ 180° ➔ 270°로 증가함에 따라 지나가는 사분면의 순서가 됩니다."
        }
      ],
      conclusion: "이 반시계 방향 회전 규약은 고등학교 삼각함수와 대학 그래픽스, 로봇 공학의 각도 회전 공식으로 고스란히 이어집니다."
    },
    workedExample: {
      problem: "좌표평면 위의 점 P(-4, 3)에 대하여 속한 사분면을 구하고, 점 P를 x축, y축, 원점에 대해 대칭이동한 좌표를 각각 구하시오.",
      stepsToTrace: [
        "1단계: x = -4(음수), y = +3(양수)이므로 제2사분면(좌상단)에 속한다.",
        "2단계: x축 대칭이동 ➔ y부호 반전 ➔ (-4, -3).",
        "3단계: y축 대칭이동 ➔ x부호 반전 ➔ (4, 3).",
        "4단계: 원점 대칭이동 ➔ x, y 둘 다 부호 반전 ➔ (4, -3)."
      ],
      finalAnswer: "제2사분면, x축 대칭: (-4,-3), y축 대칭: (4,3), 원점 대칭: (4,-3)"
    },
    practiceProblems: [
      {
        problemNumber: 1,
        title: "기초 문제: 점의 사분면 판정하기",
        question: "다음 점들이 속하는 사분면을 각각 구하시오 (단, 축 위의 점은 '축 위'라고 쓰시오): A(3, -5), B(-2, -7), C(0, 4), D(-6, 1)",
        interpretation: "순서쌍 (x, y)의 부호 조합 (+, +), (-, +), (-, -), (+, -)를 확인합니다. 좌표 중 하나라도 0이면 어느 사분면에도 속하지 않고 축 위에 있습니다.",
        solutionSteps: [
          "1단계: 점 A(3, -5)는 x>0, y<0 ➔ 제4사분면",
          "2단계: 점 B(-2, -7)은 x<0, y<0 ➔ 제3사분면",
          "3단계: 점 C(0, 4)는 x=0이므로 y축 위에 있는 점입니다 ➔ y축 위의 점 (사분면 없음)",
          "4단계: 점 D(-6, 1)은 x<0, y>0 ➔ 제2사분면"
        ],
        answer: "A: 제4사분면, B: 제3사분면, C: y축 위의 점, D: 제2사분면",
        keyPoint: "좌표축 위의 점(예: (0,4)나 (5,0))은 사분면에 포함되지 않는다는 점이 시험에 아주 자주 출제됩니다!"
      },
      {
        problemNumber: 2,
        title: "실전 문제: 사분면 조건을 이용한 미지수 부호 판별",
        question: "점 P(a, b)가 제3사분면 위의 점일 때, 점 Q(-a, ab)는 어느 사분면에 속하는지 구하시오.",
        interpretation: "제3사분면의 정의(x<0, y<0)로부터 a와 b의 부호를 먼저 알아낸 뒤, 새로운 점 Q의 x좌표(-a)와 y좌표(ab)의 부호를 곱셈 규칙으로 판정합니다.",
        solutionSteps: [
          "1단계: 점 P(a, b)가 제3사분면이므로 a < 0 (음수), b < 0 (음수)입니다.",
          "2단계: 점 Q의 x좌표는 -a입니다. a가 음수이므로 -a는 -(-) = 양수(+)가 됩니다 ➔ x좌표 > 0",
          "3단계: 점 Q의 y좌표는 ab입니다. 음수 × 음수는 양수이므로 ab는 양수(+)가 됩니다 ➔ y좌표 > 0",
          "4단계: 점 Q는 x > 0, y > 0이므로 제1사분면에 속합니다."
        ],
        answer: "제1사분면",
        keyPoint: "-a라고 해서 무조건 음수가 아닙니다! a 자체가 음수이면 -a는 양수가 된다는 점을 꼭 기억하세요."
      },
      {
        problemNumber: 3,
        title: "응용 문제: 좌표평면 위 세 점으로 만드는 삼각형의 넓이",
        question: "좌표평면 위의 세 점 A(-2, 1), B(4, 1), C(1, 5)를 꼭짓점으로 하는 삼각형 ABC의 넓이를 구하시오.",
        interpretation: "점 A와 B의 y좌표가 1로 같으므로 선분 AB가 가로(밑변)가 됩니다. 밑변 길이는 x좌표의 차이이고, 높이는 점 C의 y좌표와 밑변 y좌표의 차이입니다.",
        solutionSteps: [
          "1단계: 밑변 AB의 길이를 구합니다. y좌표가 같으므로 가로 길이는 |4 - (-2)| = 4 + 2 = 6입니다.",
          "2단계: 높이를 구합니다. 꼭짓점 C의 y좌표는 5이고 밑변의 y좌표는 1이므로 세로 높이 h = 5 - 1 = 4입니다.",
          "3단계: 삼각형 넓이 공식 (밑변 × 높이 ÷ 2)에 대입합니다.",
          "   넓이 S = (6 × 4) ÷ 2 = 24 ÷ 2 = 12"
        ],
        answer: "삼각형의 넓이 = 12",
        keyPoint: "좌표평면 도형 문제는 먼저 점을 눈으로 대략 찍어보고 밑변이 가로선인지 세로선인지 파악하면 쉽게 풀립니다."
      }
    ],
    csIntuition: "수학 좌표계는 원점이 정중앙에 있고 y가 위로 커지지만, 스마트폰 앱/웹 스크린 좌표계는 화면 왼쪽 위(Top-Left)가 (0,0)이고 y가 '아래로' 커집니다. 게임을 만들 때는 `screenY = screenHeight - mathY` 공식을 써서 수학 좌표를 화면 좌표로 뒤집어줍니다.",
    codeImplementations: {
      c: {
        lang: "c",
        entryFile: "quadrant.c",
        code: "#include <stdio.h>\n\ntypedef struct { double x, y; } Point2D;\n\nint get_quadrant(Point2D p) {\n    if (p.x > 0 && p.y > 0) return 1;\n    if (p.x < 0 && p.y > 0) return 2;\n    if (p.x < 0 && p.y < 0) return 3;\n    if (p.x > 0 && p.y < 0) return 4;\n    return 0; // 축 위\n}\n\nint main(void) {\n    Point2D p = { -4.0, 3.0 };\n    printf(\"Quadrant: %d\\n\", get_quadrant(p));\n    return 0;\n}\n",
        notes: "C23 구조체 좌표 사분면 함수"
      },
      go: {
        lang: "go",
        entryFile: "quadrant.go",
        code: "package main\n\nimport \"fmt\"\n\ntype Point struct{ X, Y float64 }\n\nfunc Quadrant(p Point) int {\n\tswitch {\n\tcase p.X > 0 && p.Y > 0: return 1\n\tcase p.X < 0 && p.Y > 0: return 2\n\tcase p.X < 0 && p.Y < 0: return 3\n\tcase p.X > 0 && p.Y < 0: return 4\n\tdefault: return 0\n\t}\n}\n\nfunc main() {\n\tfmt.Println(\"Quadrant:\", Quadrant(Point{-4, 3}))\n}\n",
        notes: "Go switch 패턴 사분면"
      },
      rust: {
        lang: "rust",
        entryFile: "quadrant.rs",
        code: "pub fn quadrant(x: f64, y: f64) -> i32 {\n    match (x > 0.0, y > 0.0, x < 0.0, y < 0.0) {\n        (true, true, _, _) => 1,\n        (_, true, true, _) => 2,\n        (_, _, true, true) => 3,\n        (true, _, _, true) => 4,\n        _ => 0,\n    }\n}\n\nfn main() {\n    println!(\"Quadrant: {}\", quadrant(-4.0, 3.0));\n}\n",
        notes: "Rust 4방향 튜플 매칭"
      },
      python: {
        lang: "python",
        entryFile: "quadrant.py",
        code: "def get_quadrant(x: float, y: float) -> int:\n    if x > 0 and y > 0: return 1\n    if x < 0 and y > 0: return 2\n    if x < 0 and y < 0: return 3\n    if x > 0 and y < 0: return 4\n    return 0\n\nif __name__ == \"__main__\":\n    print(\"Quadrant:\", get_quadrant(-4, 3))\n",
        notes: "Python 조건문 분기"
      },
      typescript: {
        lang: "typescript",
        entryFile: "quadrant.ts",
        code: "export function getQuadrant(x: number, y: number): number {\n  if (x > 0 && y > 0) return 1;\n  if (x < 0 && y > 0) return 2;\n  if (x < 0 && y < 0) return 3;\n  if (x > 0 && y < 0) return 4;\n  return 0;\n}\n\nconsole.log(getQuadrant(-4, 3));\n",
        notes: "TS 사분면 함수"
      },
      javascript: {
        lang: "javascript",
        entryFile: "quadrant.js",
        code: "function getQuadrant(x, y) {\n  if (x > 0 && y > 0) return 1;\n  if (x < 0 && y > 0) return 2;\n  if (x < 0 && y < 0) return 3;\n  if (x > 0 && y < 0) return 4;\n  return 0;\n}\nconsole.log(getQuadrant(-4, 3));\n",
        notes: "JS 사분면 판정"
      }
    }
  }
];
