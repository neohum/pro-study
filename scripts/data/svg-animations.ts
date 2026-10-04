// 수학 원리 시각화 SVG 애니메이션 생성기
export function getAnimationSvg(unitId: string, titleKo: string): { type: string; title: string; caption: string; svgTemplate: string } {
  // 1. 단위원 및 삼각함수
  if (unitId.includes('unit-circle') || unitId.includes('trig')) {
    return {
      type: "svg-animation",
      title: `${titleKo} - 단위원과 각의 회전 동적 시각화`,
      caption: "반지름 1인 단위원 위를 점 P가 회전할 때, x좌표는 cos(θ), y좌표는 sin(θ), 접선의 기울기는 tan(θ)를 나타냅니다.",
      svgTemplate: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 340' width='100%' height='100%' style='background:#0f172a; font-family:sans-serif;'>
  <style>
    @keyframes rotateArm { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes waveDraw { 0% { stroke-dashoffset: 400; } 100% { stroke-dashoffset: 0; } }
    .rot-group { transform-origin: 170px 170px; animation: rotateArm 8s linear infinite; }
    .sine-curve { stroke-dasharray: 400; animation: waveDraw 4s linear infinite alternate; }
  </style>
  <text x='300' y='30' fill='#f8fafc' font-size='16' font-weight='bold' text-anchor='middle'>단위원 회전과 삼각비의 기하학적 정의</text>
  <!-- Coordinate Axis -->
  <line x1='50' y1='170' x2='290' y2='170' stroke='#475569' stroke-width='2'/>
  <line x1='170' y1='50' x2='170' y2='290' stroke='#475569' stroke-width='2'/>
  <circle cx='170' cy='170' r='100' fill='none' stroke='#38bdf8' stroke-width='2.5'/>
  <text x='275' y='165' fill='#94a3b8' font-size='12'>x</text>
  <text x='175' y='65' fill='#94a3b8' font-size='12'>y</text>
  <text x='175' y='185' fill='#94a3b8' font-size='12'>O</text>
  <!-- Rotating Group -->
  <g class='rot-group'>
    <line x1='170' y1='170' x2='270' y2='170' stroke='#fbbf24' stroke-width='3'/>
    <circle cx='270' cy='170' r='6' fill='#f43f5e'/>
    <line x1='270' y1='170' x2='270' y2='170' stroke='#34d399' stroke-dasharray='4' stroke-width='2'/>
  </g>
  <!-- Sine Wave Demonstration -->
  <g transform='translate(330, 70)'>
    <rect x='0' y='0' width='240' height='200' rx='8' fill='#1e293b' stroke='#334155'/>
    <text x='120' y='25' fill='#38bdf8' font-size='13' font-weight='bold' text-anchor='middle'>y = sin(x) 주기 파동 (T = 2π)</text>
    <line x1='10' y1='100' x2='230' y2='100' stroke='#475569' stroke-width='1.5'/>
    <path d='M 10,100 Q 65,30 120,100 T 230,100' fill='none' stroke='#f43f5e' stroke-width='3' class='sine-curve'/>
    <text x='15' y='120' fill='#94a3b8' font-size='11'>0</text>
    <text x='120' y='120' fill='#94a3b8' font-size='11'>π</text>
    <text x='220' y='120' fill='#94a3b8' font-size='11'>2π</text>
  </g>
</svg>`
    };
  }

  // 2. 미분과 도함수, 할선 수렴
  if (unitId.includes('derivative') || unitId.includes('tangent') || unitId.includes('calculus')) {
    return {
      type: "svg-animation",
      title: `${titleKo} - 할선에서 접선으로의 극한 수렴 애니메이션`,
      caption: "점 Q가 곡선을 따라 점 P(a, f(a))로 한없이 접근할 때, 두 점을 잇는 평균변화율(할선 기울기)이 순간변화율(접선 기울기 f'(a))로 수렴합니다.",
      svgTemplate: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 340' width='100%' height='100%' style='background:#0f172a; font-family:sans-serif;'>
  <style>
    @keyframes convergeSecant {
      0% { x2: 440; y2: 80; }
      50% { x2: 300; y2: 175; }
      100% { x2: 240; y2: 215; }
    }
    @keyframes movePointQ {
      0% { cx: 440; cy: 80; }
      100% { cx: 240; cy: 215; }
    }
    .secant-line { animation: convergeSecant 4s ease-in-out infinite alternate; }
    .moving-q { animation: movePointQ 4s ease-in-out infinite alternate; }
  </style>
  <text x='300' y='30' fill='#f8fafc' font-size='16' font-weight='bold' text-anchor='middle'>도함수의 기하학적 정의: lim Δx→0 (Δy/Δx)</text>
  <!-- Axes -->
  <line x1='60' y1='280' x2='540' y2='280' stroke='#475569' stroke-width='2'/>
  <line x1='100' y1='300' x2='100' y2='50' stroke='#475569' stroke-width='2'/>
  <!-- Curve y = f(x) -->
  <path d='M 120,270 Q 250,230 380,120 T 520,60' fill='none' stroke='#38bdf8' stroke-width='3.5'/>
  <text x='530' y='70' fill='#38bdf8' font-weight='bold' font-size='14'>y = f(x)</text>
  <!-- Fixed point P -->
  <circle cx='200' cy='235' r='6' fill='#10b981'/>
  <text x='185' y='260' fill='#10b981' font-weight='bold' font-size='13'>P(a, f(a))</text>
  <!-- Secant / Tangent line -->
  <line x1='120' y1='275' x2='440' y2='80' stroke='#fbbf24' stroke-width='2.5' class='secant-line'/>
  <!-- Moving point Q -->
  <circle cx='440' cy='80' r='6' fill='#f43f5e' class='moving-q'/>
  <text x='450' y='80' fill='#f43f5e' font-weight='bold' font-size='12'>Q(a+Δx, f(a+Δx))</text>
  <!-- Formula Callout -->
  <rect x='320' y='210' width='230' height='60' rx='6' fill='#1e293b' stroke='#334155'/>
  <text x='435' y='235' fill='#fbbf24' font-size='13' font-weight='bold' text-anchor='middle'>순간변화율 (접선의 기울기)</text>
  <text x='435' y='255' fill='#f8fafc' font-size='12' text-anchor='middle'>f'(a) = lim Δx→0 {f(a+Δx)-f(a)} / Δx</text>
</svg>`
    };
  }

  // 3. 적분과 넓이, 리만합
  if (unitId.includes('integral') || unitId.includes('area') || unitId.includes('ftc')) {
    return {
      type: "svg-animation",
      title: `${titleKo} - 구분구적법과 정적분의 리만합 수렴 시각화`,
      caption: "구간을 무수히 많은 미소 직사각형(dx)으로 쪼갤 때, 직사각형 넓이의 합(리만합)이 곡선 아래의 실제 넓이인 정적분 값으로 정확히 수렴합니다.",
      svgTemplate: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 340' width='100%' height='100%' style='background:#0f172a; font-family:sans-serif;'>
  <style>
    @keyframes pulseBars {
      0% { opacity: 0.4; }
      50% { opacity: 0.85; }
      100% { opacity: 0.4; }
    }
    .bar { fill: rgba(56, 189, 248, 0.4); stroke: #38bdf8; stroke-width: 1.5; animation: pulseBars 3s infinite; }
  </style>
  <text x='300' y='30' fill='#f8fafc' font-size='16' font-weight='bold' text-anchor='middle'>구분구적법과 미적분의 기본정리: ∫[a,b] f(x) dx</text>
  <line x1='60' y1='270' x2='540' y2='270' stroke='#475569' stroke-width='2'/>
  <line x1='100' y1='290' x2='100' y2='50' stroke='#475569' stroke-width='2'/>
  <!-- Riemann Rectangles -->
  <g>
    <rect x='150' y='210' width='30' height='60' class='bar'/>
    <rect x='180' y='170' width='30' height='100' class='bar'/>
    <rect x='210' y='140' width='30' height='130' class='bar'/>
    <rect x='240' y='118' width='30' height='152' class='bar'/>
    <rect x='270' y='105' width='30' height='165' class='bar'/>
    <rect x='300' y='100' width='30' height='170' class='bar'/>
    <rect x='330' y='104' width='30' height='166' class='bar'/>
    <rect x='360' y='116' width='30' height='154' class='bar'/>
    <rect x='390' y='136' width='30' height='134' class='bar'/>
    <rect x='420' y='165' width='30' height='105' class='bar'/>
  </g>
  <!-- Curve f(x) -->
  <path d='M 120,250 Q 290,60 480,240' fill='none' stroke='#f43f5e' stroke-width='3.5'/>
  <text x='150' y='290' fill='#f8fafc' font-weight='bold' font-size='14'>a</text>
  <text x='450' y='290' fill='#f8fafc' font-weight='bold' font-size='14'>b</text>
  <text x='300' y='200' fill='#ffffff' font-weight='bold' font-size='16' text-anchor='middle'>S = ∫[a,b] f(x) dx</text>
</svg>`
    };
  }

  // 4. 이차함수 포물선 및 대칭축
  if (unitId.includes('quadratic') || unitId.includes('parabola')) {
    return {
      type: "svg-animation",
      title: `${titleKo} - 포물선의 대칭축과 꼭짓점 이동 시각화`,
      caption: "이차함수 y = a(x-p)² + q의 그래프는 기본형 y = ax²의 포물선을 x축 방향으로 p만큼, y축 방향으로 q만큼 평행이동한 것이며, 직선 x = p에 대해 완벽히 대칭입니다.",
      svgTemplate: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 340' width='100%' height='100%' style='background:#0f172a; font-family:sans-serif;'>
  <style>
    @keyframes bounceVertex {
      0% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
      100% { transform: translateY(0); }
    }
    .curve-group { animation: bounceVertex 3s ease-in-out infinite; }
  </style>
  <text x='300' y='30' fill='#f8fafc' font-size='16' font-weight='bold' text-anchor='middle'>이차함수 y = a(x-p)² + q 의 동적 그래프</text>
  <!-- Axes -->
  <line x1='60' y1='230' x2='540' y2='230' stroke='#475569' stroke-width='2'/>
  <line x1='200' y1='300' x2='200' y2='50' stroke='#475569' stroke-width='2'/>
  <!-- Symmetry axis line -->
  <line x1='340' y1='50' x2='340' y2='290' stroke='#fbbf24' stroke-width='2' stroke-dasharray='5'/>
  <text x='345' y='65' fill='#fbbf24' font-size='12'>축: x = p</text>
  <!-- Moving Curve -->
  <g class='curve-group'>
    <path d='M 180,70 Q 340,290 500,70' fill='none' stroke='#38bdf8' stroke-width='3.5'/>
    <circle cx='340' cy='180' r='7' fill='#f43f5e'/>
    <text x='355' y='185' fill='#f43f5e' font-weight='bold' font-size='13'>꼭짓점 (p, q)</text>
  </g>
  <rect x='50' y='60' width='180' height='55' rx='6' fill='#1e293b' stroke='#334155'/>
  <text x='140' y='83' fill='#38bdf8' font-size='12' font-weight='bold' text-anchor='middle'>a &gt; 0: 아래로 볼록</text>
  <text x='140' y='103' fill='#94a3b8' font-size='11' text-anchor='middle'>최솟값 = q (x = p 일 때)</text>
</svg>`
    };
  }

  // 5. 확률과 정규분포
  if (unitId.includes('stat') || unitId.includes('prob') || unitId.includes('normal')) {
    return {
      type: "svg-animation",
      title: `${titleKo} - 가우스 종형 곡선과 68-95-99.7% 표준편차 규칙`,
      caption: "정규분포 N(m, σ²)에서 평균 m을 중심으로 1시그마 이내에 68.3%, 2시그마 이내에 95.4%, 3시그마 이내에 99.7%의 데이터가 대칭적으로 분포합니다.",
      svgTemplate: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 340' width='100%' height='100%' style='background:#0f172a; font-family:sans-serif;'>
  <style>
    @keyframes pulseArea { 0% { opacity: 0.2; } 50% { opacity: 0.6; } 100% { opacity: 0.2; } }
    .sigma-fill { animation: pulseArea 3s infinite ease-in-out; }
  </style>
  <text x='300' y='30' fill='#f8fafc' font-size='16' font-weight='bold' text-anchor='middle'>정규분포 곡선 N(m, σ²)의 면적과 신뢰구간</text>
  <line x1='50' y1='270' x2='550' y2='270' stroke='#475569' stroke-width='2'/>
  <!-- Shaded Area 1-sigma -->
  <path d='M 230,270 L 230,165 Q 300,75 370,165 L 370,270 Z' fill='rgba(56, 189, 248, 0.4)' class='sigma-fill'/>
  <!-- Bell Curve -->
  <path d='M 70,268 Q 210,265 250,140 Q 300,70 350,140 Q 390,265 530,268' fill='none' stroke='#38bdf8' stroke-width='3.5'/>
  <line x1='300' y1='70' x2='300' y2='270' stroke='#fbbf24' stroke-width='2' stroke-dasharray='4'/>
  <text x='300' y='290' fill='#fbbf24' font-weight='bold' font-size='14' text-anchor='middle'>m (평균)</text>
  <text x='230' y='290' fill='#94a3b8' font-size='12' text-anchor='middle'>m - σ</text>
  <text x='370' y='290' fill='#94a3b8' font-size='12' text-anchor='middle'>m + σ</text>
  <text x='300' y='190' fill='#ffffff' font-weight='bold' font-size='14' text-anchor='middle'>68.3%</text>
</svg>`
    };
  }

  // 6. 기하와 도형 (피타고라스, 삼각비, 원, 벡터 등)
  if (unitId.includes('geometry') || unitId.includes('vector') || unitId.includes('figure') || unitId.includes('triangle')) {
    return {
      type: "svg-animation",
      title: `${titleKo} - 기하학적 직관과 좌표 변환 시각화`,
      caption: "도형의 불변량과 공간적 관계를 시각적으로 분해하여, 기하학적 정리의 참된 본질을 직관적으로 파악합니다.",
      svgTemplate: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 340' width='100%' height='100%' style='background:#0f172a; font-family:sans-serif;'>
  <style>
    @keyframes pulseGlow { 0% { stroke: #38bdf8; } 50% { stroke: #f43f5e; } 100% { stroke: #38bdf8; } }
    .geo-shape { animation: pulseGlow 4s infinite linear; }
  </style>
  <text x='300' y='30' fill='#f8fafc' font-size='16' font-weight='bold' text-anchor='middle'>기하학적 구조와 불변량의 직관적 분해</text>
  <!-- Triangle -->
  <polygon points='150,260 450,260 300,90' fill='rgba(56, 189, 248, 0.15)' stroke='#38bdf8' stroke-width='3' class='geo-shape'/>
  <line x1='300' y1='90' x2='300' y2='260' stroke='#fbbf24' stroke-width='2' stroke-dasharray='4'/>
  <circle cx='300' cy='200' r='60' fill='none' stroke='#34d399' stroke-width='2'/>
  <text x='130' y='275' fill='#94a3b8' font-weight='bold'>A</text>
  <text x='460' y='275' fill='#94a3b8' font-weight='bold'>B</text>
  <text x='300' y='75' fill='#94a3b8' font-weight='bold' text-anchor='middle'>C</text>
  <text x='310' y='180' fill='#fbbf24' font-size='12'>높이 h</text>
</svg>`
    };
  }

  // 7. 기본 공통 대수/수식 시각화
  return {
    type: "svg-animation",
    title: `${titleKo} - 대수적 구조와 변환 다이어그램`,
    caption: "수식의 변수와 계수 간의 상호작용 및 균형 관계를 시각화하여 대수적 연산의 불변 원리를 체득합니다.",
    svgTemplate: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 340' width='100%' height='100%' style='background:#0f172a; font-family:sans-serif;'>
  <style>
    @keyframes spinWheel { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .rot-hub { transform-origin: 300px 170px; animation: spinWheel 12s linear infinite; }
  </style>
  <text x='300' y='30' fill='#f8fafc' font-size='16' font-weight='bold' text-anchor='middle'>${titleKo}의 구조적 모델</text>
  <circle cx='300' cy='170' r='90' fill='rgba(30, 41, 59, 0.8)' stroke='#38bdf8' stroke-width='2.5'/>
  <g class='rot-hub'>
    <circle cx='300' cy='80' r='18' fill='#0284c7'/>
    <circle cx='300' cy='260' r='18' fill='#0284c7'/>
    <circle cx='210' cy='170' r='18' fill='#f43f5e'/>
    <circle cx='390' cy='170' r='18' fill='#10b981'/>
    <line x1='300' y1='80' x2='300' y2='260' stroke='#94a3b8' stroke-width='1.5'/>
    <line x1='210' y1='170' x2='390' y2='170' stroke='#94a3b8' stroke-width='1.5'/>
  </g>
  <text x='300' y='175' fill='#fbbf24' font-weight='bold' font-size='14' text-anchor='middle'>수학적 불변량</text>
</svg>`
  };
}
