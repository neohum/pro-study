# 02. 제네릭 동적 배열·문자열 빌더

## 무엇을 만드는가

표준 입력에서 한 줄에 명령 하나를 읽어 int 동적 배열과 문자열 빌더를 조작하는 대화형 도구다.
C23의 `typeof`와 매크로를 결합해, 단 하나의 동적 배열 템플릿 `DA(T)`로 정수 배열(`IntArray`)과
문자열 빌더(`StrBuilder`)를 모두 처리한다.

```
$ build/app.exe
push 10
push 20
print
10 20
pop
20
say hello
say world
line
hello world
```

## 왜 이 프로젝트인가

C 언어의 가장 큰 문턱은 수동 메모리 관리(`malloc`, `realloc`, `free`)와 제네릭(타입 무관 자료구조)의 부재다.
전통적으로 C에서는 `void*` 배열을 만들어 캐스팅 비용과 타입 안전성 손실을 감수하거나,
자료형마다 코드를 복사·붙여넣기해야 했다.

C23에 도입된 `typeof` 연산자와 `_Generic`을 활용하면, 타입 안전성을 유지하면서도
단일 매크로 정의로 임의의 타입 `T`를 담는 고성능 동적 배열을 구현할 수 있다.
여기서 만든 동적 배열과 문자열 빌더는 3번 해시맵, 4번 텍스트 CLI, 5번 JSON 파서에서 계속 재사용된다.

## 핵심 개념

### 분할 상환 O(1) 성장과 `realloc`

새 원소를 넣을 자리가 부족할 때 용량(`cap`)을 1씩 늘리면 $N$번 삽입 시 $O(N^2)$ 복사가 발생한다.
용량을 2배씩 기하급수적으로 늘리면 전체 복사 비용은 $2N$을 넘지 않아 삽입당 평균(분할 상환) 시간 복잡도가 $O(1)$이 된다.

```c
#define da_reserve(da, need) \
    do { \
        if ((need) > (da)->cap) { \
            size_t new_cap = (da)->cap ? (da)->cap * 2 : DA_INIT_CAP; \
            while (new_cap < (need)) new_cap *= 2; \
            (da)->items = xrealloc((da)->items, new_cap * sizeof *(da)->items); \
            (da)->cap = new_cap; \
        } \
    } while (0)
```

### C23: `typeof`를 이용한 제네릭 매크로

C23 표준이 된 `typeof`는 임의의 식이나 변수의 타입을 알아낸다.
동적 배열 포인터 `da`가 있을 때 `*(da)->items`는 원소 1개이므로,
`typeof(*(da)->items)`는 "이 배열이 담고 있는 원소의 타입"이 된다.

```c
#define DA_ITEM(da) typeof(*(da)->items)

// 원소 타입의 변수를 매크로 안에서 선언할 수 있다!
#define da_push(da, item) \
    do { \
        DA_ITEM(da) temp_ = (item); \
        da_reserve((da), (da)->len + 1); \
        (da)->items[(da)->len++] = temp_; \
    } while (0)
```

임시 변수 `temp_`에 먼저 값을 담는 이유는 `da_push(&a, a.items[0])`처럼 배열 자기 자신을 참조할 때
`realloc`으로 메모리가 이동되면서 발생하는 대글링 포인터 버그를 막기 위함이다.

### C23: `_Generic`을 통한 다형성 디스패치

`_Generic`은 컴파일 시간에 인자의 타입을 검사해 서로 다른 함수로 디스패치한다.
C23에서는 `nullptr_t` 구분도 지원한다.

```c
#define print_value(x) _Generic((x), \
    int: print_int, \
    long long: print_llong, \
    double: print_double, \
    char*: print_str, \
    const char*: print_str)(x)
```

## 단계별 구현

`starter/main.c`의 `TODO(step-N)` 주석이 아래 단계와 1:1이다.

### Step 1: 메모리 도우미와 구조체

`xrealloc`은 `realloc` 호출 후 메모리 부족 시 에러를 찍고 즉시 종료한다.
`da_free`는 `items`를 해제하고 `nullptr` 및 길이를 0으로 리셋한다.
`print` 명령에서 배열 내용을 공백으로 구분해 출력한다.

확인: 빈 배열 상태에서 `len`, `cap` 명령이 `0`을 정상 출력하는지 확인한다.

### Step 2: push와 realloc 성장

`da_reserve`, `da_push`, `da_pop`을 구현한다.
용량이 부족하면 `DA_INIT_CAP`(4)부터 2배씩 늘리며 `xrealloc`을 부른다.
`_Generic` 기반의 `print_value`로 출력 함수를 연결한다.

확인: `push 10`, `push 20`, `pop` 명령이 올바른 값과 남은 길이를 보여주는지 확인한다.

### Step 3: insert/remove와 memmove

배열 중간에 원소를 끼워 넣거나 삭제할 때 구간 이동을 처리한다.
구간이 겹칠 수 있으므로 반드시 `memcpy` 대신 `memmove`를 사용한다.

확인: `insert 0 99`로 맨 앞에 삽입하고 `remove 0`으로 삭제가 되는지 테스트한다.

### Step 4: 제네릭 매크로와 typeof

`typeof`를 사용하여 `DA_ITEM(da)` 및 `da_foreach` 매크로를 작성한다.
`print`와 `sum` 내부의 인덱스 루프를 `da_foreach`로 교체한다.

확인: 원소 타입에 종속되지 않고 순회가 매끄럽게 동작하는지 확인한다.

### Step 5: 문자열 빌더와 _Generic

`StrBuilder`는 `DA(char)`의 `typedef`이다.
`sb_append`로 문자열을 char 단위로 push하고, `sb_cstr`로 널 종결자(`'\0'`)를 붙여 C 문자열을 반환한다.
`_Generic`에 `char*`와 `const char*` 분기를 추가해 `print_value`로 문자열을 출력할 수 있게 만든다.

확인: `say`와 `line` 명령을 실행해 문자열이 공백으로 합쳐져 정상 출력되는지 확인한다.

## 막혔을 때

| 증상 | 원인 |
| --- | --- |
| `da_push(&a, a.items[0])` 호출 후 이상한 값이 들어감 | `realloc`이 실행되면서 기존 메모리가 무효화되었다. `temp_ = (item)` 임시 복사를 먼저 해야 한다 |
| `insert`나 `remove` 후 데이터가 깨짐 | `memcpy`는 메모리 중첩 시 동작이 미정의된다. 반드시 `memmove`를 사용해야 한다 |
| `_Generic` 컴파일 에러: `char *` 매칭 실패 | C 언어에서 `char *`와 `const char *`는 서로 다른 타입이다. 둘 다 테이블에 추가해야 한다 |
| `typeof` 관련 문법 에러 | 컴파일러 플래그에 `-std=c23`이 설정되어 있는지 확인한다 |

## 더 나아가기

- `da_shrink_to_fit`: 사용하지 않는 초과 용량을 원소 개수 크기로 줄여주는 압축 매크로를 작성해 본다.
- 정렬 함수 `da_sort`: `<stdlib.h>`의 `qsort`를 래핑하는 타입 안전한 정렬 매크로를 구현해 본다.
- 2차원 제네릭 동적 배열: `DA(DA(int))`처럼 중첩된 동적 배열의 할당과 해제를 안전하게 다루어 본다.

## 참고

- C23 표준 초안 N3220: 6.7.2.5 `typeof` 연산자, 6.5.1.1 Generic selection (`_Generic`)
- ISO/IEC 9899:2024 (C23 Specification)
- cppreference: `realloc`, `memmove`
