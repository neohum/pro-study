# 텍스트 분석기 및 단어 빈도 카운터 (Text Analyzer & Word Frequency Counter)

## 📌 프로젝트 개요
문자열과 문자(Character) 조작, Common Lisp의 빌트인 해시 테이블(`make-hash-table :test 'equal`), 고차 함수를 활용한 정렬 및 출력 스트림 포맷팅을 학습합니다.

## 🎯 학습 목표
1. `alphanumericp` 및 `char-downcase`를 활용한 텍스트 토큰화
2. `gethash`와 `incf`를 통한 단어 카운트 빈도 집계
3. `maphash`로 해시 엔트리를 alist로 변환하고 `sort`로 내림차순 정렬
4. `format` 지시자(`~A`, `~D`, `~{~}`)를 사용한 정형화된 리포트 출력
