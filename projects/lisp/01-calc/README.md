# S-표현식 전위 계산기 (S-Expression Prefix Calculator)

## 📌 프로젝트 개요
Common Lisp의 가장 근본적인 특징인 **코드-데이터 동형성(Homoiconicity)**과 **S-표현식(S-expression)** 파싱을 학습하는 프로젝트입니다.
Lisp의 빌트인 리더(`read-from-string`)를 사용하여 입력된 수식 문자열을 파싱 트리(Cons 셀 리스트)로 변환한 후, 재귀적 트리 순회를 통해 수식을 평가합니다.

## 🎯 학습 목표
1. Cons 셀과 리스트의 기본 구조 (`car`, `cdr`, `cons`, `listp`, `atom`)의 이해
2. 원자(Atom)와 리스트(List)를 판별하는 기저 조건(Base case) 설계
3. 사칙연산자(`+`, `-`, `*`, `/`)와 임의 정밀도 정수(Bignum), 유리수(Ratio: 예 `7/2`) 처리
4. 0으로 나누기 및 문법 오류 시 안전한 예외 메시지 출력

## 💻 입출력 명세
- 실행: `sbcl --script main.lisp "<수식>"` 또는 표준 입력
- 입력 예시: `(+ 1 (* 2 3))`
- 출력 예시: `7`
- 유리수 예시: `(/ 7 2)` -> `7/2`
- 0 나누기 오류: `(/ 5 0)` -> `error: division by zero`
