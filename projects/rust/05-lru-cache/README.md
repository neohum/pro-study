# 05. 인덱스 기반 제네릭 LRU 캐시

## 무엇을 만드는가

안전한 Rust(Safe Rust)로 포인터 없이 Vec 슬롯과 인덱스로 연결 리스트를 구현한 LRU 캐시

## 왜 이 프로젝트인가

러스트의 핵심 불변식(메모리 안전성, 소유권과 빌림 체계, 무비용 추상화)을 실전 구현을 통해 체화합니다.
가비지 컬렉터 없이도 안전하고 고성능인 시스템 소프트웨어를 작성하는 감각을 익힙니다.

## 핵심 개념

### 개념 1: Safe Rust 연결 리스트(Index-based)

- Safe Rust 연결 리스트(Index-based)의 원리와 관용적(Idiomatic) 러스트 코드 작성법을 다룹니다.

### 개념 2: 제네릭 <K, V>

- 제네릭 <K, V>의 원리와 관용적(Idiomatic) 러스트 코드 작성법을 다룹니다.

### 개념 3: O(1) 캐시 축출

- O(1) 캐시 축출의 원리와 관용적(Idiomatic) 러스트 코드 작성법을 다룹니다.

### 개념 4: Borrow Checker 극복

- Borrow Checker 극복의 원리와 관용적(Idiomatic) 러스트 코드 작성법을 다룹니다.

### 개념 5: 수명(Lifetime)

- 수명(Lifetime)의 원리와 관용적(Idiomatic) 러스트 코드 작성법을 다룹니다.


## 단계별 구현

### Step 1: 핵심 열거형 및 자료구조 선언

데이터 모델과 에러 처리를 위한 열거형을 선언합니다.

### Step 2: 기본 파서 및 변환기 작성

입력 데이터를 구조화된 내부 표현으로 파싱합니다.

### Step 3: 핵심 비즈니스 로직 구현

도메인 로직과 상태 전이를 안전하게 구현합니다.

### Step 4: 에러 핸들링 및 안전한 축출/정리

Result와 Option을 매칭하고 예외 상황을 완벽히 방어합니다.

### Step 5: REPL 파이프라인 및 CLI 연동

표준 입출력 스트림을 통해 입력을 받고 결과를 출력하는 루프를 연결합니다.

## 막혔을 때

| 증상 | 원인 | 해결책 |
| --- | --- | --- |
| cannot borrow as mutable | 불변 참조와 가변 참조 동시 사용 | 스코프를 분리하거나 clone 또는 entry API를 활용합니다. |
| value used here after move | 소유권 이전(Move) 발생 | 참조(& 또는 &mut)를 넘기거나 필요한 경우 명시적으로 .clone()합니다. |

## 더 나아가기

- unsafe 블록을 통한 원시 포인터 최적화 비교
- SIMD 또는 rayon을 활용한 데이터 병렬 처리

## 참고

- The Rust Programming Language: <https://doc.rust-lang.org/book/>
