# 07. 스택 기반 바이트코드 가상 머신

## 무엇을 만드는가

텍스트 어셈블리 명령어를 읽어 바이트코드 바이너리로 컴파일하고, 스택과 명령어 포인터(`ip`)를 조작하여 실행하는 스택 기반 가상 머신(VM)을 만든다. `push`, `add`, `sub`, `mul`, `div`, `mod`, `neg`, `dup`, `print`, `jmp`, `jz`, `halt` 명령을 지원하며 0으로 나누기 및 스택 언더플로/오버플로 예외를 안전하게 제어한다.

```
$ build/app.exe
push 10
push 20
add
print
halt
30
```

## 왜 이 프로젝트인가

Python, Java, Lua, WebAssembly의 심장은 모두 가상 머신이다. 1번 계산기에서 AST를 만들고 수식을 평가했다면, 이번에는 CPU가 기계어를 실행하듯 바이트코드를 한 바이트씩 읽어 디스패치 루프(`switch`)에서 실행하는 "실행 엔진"의 내부 원리를 배운다.

C23에서는 `enum : uint8_t`로 열거형의 기저 타입을 1바이트로 정확히 고정할 수 있어, 바이트 단위 명령어 스트림을 자연스럽고 안전하게 다룰 수 있다.

## 핵심 개념

### C23: `enum : uint8_t`로 명령어 바이트 정의

C23 이전에는 열거형의 크기가 컴파일러에 따라 `int`(4바이트)로 잡혀 바이트코드 배열에 넣으려면 캐스팅이 필요했다. C23은 밑바탕 타입을 명시할 수 있다.

```c
typedef enum OpCode : uint8_t {
    OP_NOP = 0,
    OP_PUSH,
    OP_POP,
    OP_ADD,
    OP_HALT,
} OpCode;
```

### 스택 기반 아키텍처

레지스터 기반 VM(Lua 5.0 등)과 달리, 스택 머신은 모든 연산 피연산자를 스택 상단에서 꺼내고(`pop`) 결과를 다시 올린다(`push`). 명령어에 피연산자 레지스터 번호를 담지 않아도 되므로 명령어 인코딩이 극도로 단순해진다.

```c
// a + b 계산:
int64_t b, a;
vm_pop(vm, &b);
vm_pop(vm, &a);
vm_push(vm, a + b);
```

### 2단계 어셈블러: 라벨과 점프 주소 해석

`loop:`나 `done:` 같은 라벨은 바이트코드에서 실제 바이트 오프셋(점프할 `ip`)으로 변환되어야 한다. 1단계(Pass 1)에서 명령어 크기를 계산하며 라벨의 오프셋을 등록하고, 2단계(Pass 2)에서 실제 바이트코드를 채울 때 라벨 이름을 바이트 오프셋으로 치환한다.

## 단계별 구현

`starter/main.c`의 `TODO(step-N)` 주석이 아래 단계와 1:1이다. 각 단계를 완료할 때마다 빌드하여 컴파일 경고가 없는지 확인하자.

### Step 1: OpCode 열거형과 VM 스택 기본 연산

`enum : uint8_t`로 `OpCode`를 정의하고 `VM` 구조체를 구성한다. `vm_push`와 `vm_pop`에서 스택 오버플로(`sp >= STACK_CAP`)와 언더플로(`sp <= 0`)를 검사한다.

확인: 스택이 비었을 때 `pop` 호출 시 `error: stack underflow`가 출력되는지 확인.

### Step 2: 산술 연산자와 예외 처리

`vm_binop`에서 `add`, `sub`, `mul`, `div`, `mod`를 처리한다. 두 개의 피연산자를 `pop`하되, 0으로 나누기 또는 0으로 모듈로 연산 시 적절한 에러 메시지(`error: division by zero`, `error: modulo by zero`)를 출력하고 중단한다.

확인: `push 1`, `push 0`, `div` 실행 시 에러 메시지 확인.

### Step 3: 스택 제어 및 분기 명령어

`dup`으로 상단 복사, `vm_dump`로 스택 내용 전체를 `[1 2 3]` 형태로 출력하는 기능을 작성한다. `OP_JMP`와 `OP_JZ`를 위해 `ip`를 갱신하는 로직을 마련한다.

확인: `push 42`, `dup`, `dump` 실행 시 `[42 42]`가 출력되는지 확인.

### Step 4: 텍스트 어셈블러와 라벨 해석

텍스트 명령어를 파싱하여 `code` 버퍼에 바이트 단위로 적재한다. 라벨 선언(`label:`)과 점프 대상(`jmp loop`, `jz done`)을 2-Pass로 처리하여 바이트 오프셋으로 변환한다.

확인: 루프 카운트다운 어셈블리 코드가 올바른 바이트코드로 컴파일되는지 확인.

### Step 5: 디스패치 루프 및 실행 드라이버

`vm_run`에서 `vm->ip`를 1씩 증가시키며 `switch ((OpCode)op)`로 각 명령어를 실행하는 중앙 디스패치 루프를 완성한다. 표준 입력에서 어셈블리 행들을 읽고 `run` 명령 또는 파일 끝(EOF)에서 실행한다.

확인: `01-arithmetic.in`부터 `06-multi-run.in`까지 모든 테스트 케이스 통과.

## 막혔을 때

| 증상 | 원인 |
| --- | --- |
| `add`나 `sub` 연산 결과의 부호가 반대로 나옴 | 스택에서 먼저 꺼낸 것이 `b`(오른쪽), 나중에 꺼낸 것이 `a`(왼쪽)임을 주의 (`a - b`) |
| 루프 점프 시 무한 루프 또는 잘못된 위치로 점프 | 명령어마다 바이트 길이가 다름 (`push`: 1+8바이트, `jmp`/`jz`: 1+4바이트, 기타: 1바이트) |
| `enum : uint8_t` 컴파일 에러 | gcc 컴파일 플래그에 `-std=c23`이 누락됨 |
| starter 빌드 경고 발생 | `(void)param;`을 통해 미사용 파라미터 경고를 억제했는지 점검 |

## 더 나아가기

- `switch` 디스패치를 GCC 확장인 `&&label` (Computed Goto) 방식으로 리팩터링하여 분기 예측 성능을 극대화해 보기.
- 함수 호출과 복귀를 위한 콜 프레임(`OP_CALL`, `OP_RET`) 구현.
- 로컬 변수 슬롯(`OP_LOAD <idx>`, `OP_STORE <idx>`) 추가.

## 참고

- C23 표준 초안 N3220: 6.7.2.2 열거형 지정자(열거형 기저 타입 지정)
- Bob Nystrom: *Crafting Interpreters* Part III (A Bytecode Virtual Machine)
- Eli Bendersky: *Computed goto for efficient dispatch tables*
