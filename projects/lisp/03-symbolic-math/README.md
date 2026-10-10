# 기호 미분기 및 대수식 단순화기 (Symbolic Differentiator & Simplifier)

## 📌 프로젝트 개요
컴퓨터 대수 시스템(CAS, Computer Algebra System)의 핵심인 **기호 미분(Symbolic Differentiation)**과 **대수적 식 단순화(Simplification)**를 구현합니다.

## 🎯 학습 목표
1. 심볼과 쿼트(`'`)를 활용한 대수식의 기호적 표현
2. 합(`+`), 차(`-`), 곱(`*`), 멱(`expt`)에 대한 미분 규칙 적용
3. 항등원(`x + 0 = x`, `x * 1 = x`, `x * 0 = 0`) 규칙 및 상수 접기(Constant Folding)
