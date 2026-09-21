# 01. 강타입 TODO CLI

## 무엇을 만드는가

인터페이스, 유니언 타입, 타입 가드로 견고하게 작성하는 할 일 목록 관리 CLI

## 왜 이 프로젝트인가

타입스크립트의 정적 타입 시스템과 고급 타입 기법(제네릭, 조건부 타입, 템플릿 리터럴)을 실전 구현을 통해 체화합니다.
런타임 에러를 컴파일 타임으로 앞당기는 타입 중심 설계(Type-Driven Design)를 학습합니다.

## 핵심 개념

### 개념 1: Interface & Type Alias

- Interface & Type Alias에 대한 심층 원리와 설계 패턴을 다룹니다.

### 개념 2: Discriminated Unions

- Discriminated Unions에 대한 심층 원리와 설계 패턴을 다룹니다.

### 개념 3: Strict Null Checks

- Strict Null Checks에 대한 심층 원리와 설계 패턴을 다룹니다.

### 개념 4: Type Guards

- Type Guards에 대한 심층 원리와 설계 패턴을 다룹니다.

### 개념 5: Generic Functions

- Generic Functions에 대한 심층 원리와 설계 패턴을 다룹니다.


## 단계별 구현

### Step 1: 핵심 타입 및 인터페이스 정의

자료구조와 도메인 모델의 타입을 정밀하게 선언합니다.

### Step 2: 기본 클래스 및 팩토리 구현

타입 제약 조건을 만족하는 기본 인스턴스 생성 로직을 작성합니다.

### Step 3: 고급 타입 연산 및 제네릭 메서드

타입 추론과 유연성을 극대화하는 제네릭 메서드를 추가합니다.

### Step 4: 예외 검증 및 타입 단언

런타임 불일치 및 엣지 케이스를 안전하게 가드하는 로직을 보강합니다.

### Step 5: REPL 파이프라인 및 CLI 연동

표준 입출력 스트림을 통해 입력을 받고 결과를 출력하는 루프를 완성합니다.

## 막혔을 때

| 증상 | 원인 | 해결책 |
| --- | --- | --- |
| TS2322: Type is not assignable | 유니언 타입 불일치 또는 널 가능성 | 타입 가드(Type Guard) 또는 옵셔널 체이닝으로 좁히기를 수행합니다. |
| TS2339: Property does not exist | 제네릭 제약(extends) 누락 | 제네릭 파라미터에 적절한 제약 조건(extends Record<...>)을 부여합니다. |

## 더 나아가기

- Conditional Types와 infer를 활용한 복합 반환형 추출
- 데코레이터(Decorators) 기반 메타데이터 주입

## 참고

- TypeScript 핸드북: <https://www.typescriptlang.org/docs/handbook/intro.html>
