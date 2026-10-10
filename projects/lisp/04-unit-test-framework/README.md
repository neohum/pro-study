# 매크로 기반 단위 테스트 프레임워크 (Macro-driven Unit Test Framework)

## 📌 프로젝트 개요
Common Lisp의 가장 강력한 기능인 **매크로(`defmacro`)**를 활용하여, 보일러플레이트 없는 테스트 정의(`deftest`)와 단언식(`assert-equal`)을 제공하는 테스트 러너를 작성합니다.

## 🎯 학습 목표
1. `defmacro`를 통한 컴파일 타임 코드 확장
2. `gensym`을 사용한 변수 충돌 방지 및 다중 평가 방지
3. 테스트 통과/실패 집계 및 컬러/서식화된 리포트 출력
