# 선언형 HTML 템플릿 DSL (Declarative HTML Template DSL)

## 📌 프로젝트 개요
Lisp S-표현식을 선언적 마크업 언어(HTML)로 직렬화하는 미니 CL-WHO 스타일의 템플릿 DSL을 작성합니다.

## 🎯 학습 목표
1. 키워드 심볼(`:class`, `:id`)과 속성 리스트(plist) 파싱
2. 닫는 태그가 없는 Void 요소(`<input />`, `<br />`, `<img />`) 지원
3. 악성 스크립트 방지를 위한 HTML 엔티티 이스케이프(`&, <, >, "`)
