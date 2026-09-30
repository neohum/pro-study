/**
 * scripts/curriculum-grammars/c_grammar.js
 * C 언어 (C23 표준) 핵심 문법 16개 종합 학습 콘텐츠
 */

module.exports = [
  {
    id: "c-vars-types",
    title: "1. 변수 선언과 기본 데이터 타입",
    category: "기초 문법",
    summary: "C 언어는 정적 타입 언어로, 변수를 사용하기 전에 메모리 크기와 형태를 결정하는 데이터 타입을 반드시 선언해야 합니다. C23에서는 nullptr, constexpr, 고정 너비 정수(stdint.h)를 공식 지원합니다.",
    syntax: "type variable_name = initial_value;\nconstexpr type CONSTANT_NAME = value;",
    example: `#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>

int main(void) {
    int age = 20;               // 기본 정수형 (최소 16비트, 보통 32비트)
    double pi = 3.1415926535;   // 64비트 배정밀도 부동소수점
    char grade = 'A';           // 1바이트 단일 문자
    bool is_ready = true;       // 참/거짓 불리언 (true/false)
    int32_t exact_int = 100000; // 플랫폼 무관 32비트 고정 정수
    constexpr int MAX_USERS = 100; // C23 컴파일 타임 상수

    printf("Age: %d, Grade: %c, PI: %.4f\\n", age, grade, pi);
    return 0;
}`,
    explanation: "int는 시스템 환경에 따라 2바이트 또는 4바이트일 수 있으므로, 임베디드나 네트워크 등 정확한 크기가 중요할 때는 stdint.h의 int32_t, uint64_t 등을 사용하는 것이 현대 C 프로그래밍의 표준입니다.",
    pitfalls: "초기화되지 않은 지역 변수는 메모리에 남아있던 무작위 쓰레기 값(Garbage value)을 가지므로 반드시 선언과 동시에 초기화해야 버그를 방지할 수 있습니다.",
    practice: "문제: 1바이트 부호 없는 정수(0~255)를 담기 위해 stdint.h에서 권장하는 타입 이름은 무엇일까요?\n정답: uint8_t"
  },
  {
    id: "c-operators",
    title: "2. 연산자와 비트 연산 (Bitwise Operators)",
    category: "연산자",
    summary: "산술(+, -, *, /, %), 관계(==, !=, <, >), 논리(&&, ||, !) 연산자 외에 하드웨어 레벨의 비트 조작(&, |, ^, ~, <<, >>)을 지원합니다.",
    syntax: "int result = a & b;   // 비트 AND\nint shifted = a << 2; // 비트 왼쪽 2비트 시프트 (* 4)",
    example: `#include <stdio.h>

int main(void) {
    int a = 12; // 0000 1100
    int b = 10; // 0000 1010

    printf("a & b: %d\\n", a & b);   // 0000 1000 -> 8
    printf("a | b: %d\\n", a | b);   // 0000 1110 -> 14
    printf("a ^ b: %d\\n", a ^ b);   // 0000 0110 -> 6 (XOR)
    printf("a << 1: %d\\n", a << 1); // 0001 1000 -> 24 (2배)

    // 삼항 조건 연산자
    int max = (a > b) ? a : b;
    printf("Max: %d\\n", max);
    return 0;
}`,
    explanation: "정수 나눗셈(/)에서 피연산자가 둘 다 정수이면 소수점 이하는 버려집니다. 예를 들어 5 / 2의 결과는 2이며, 정확한 2.5를 얻으려면 (double)5 / 2 처럼 형변환해야 합니다.",
    pitfalls: "비트 연산자(&, |)와 논리 연산자(&&, ||)를 혼동하지 마세요. 조건문에서 if (a & b)를 쓰면 비트 연산 결과가 0인지 검사하게 됩니다.",
    practice: "문제: 정수 x에 8을 곱하는 가장 빠른 비트 시프트 연산식은 무엇일까요?\n정답: x << 3 (2의 3제곱은 8)"
  },
  {
    id: "c-control-flow",
    title: "3. 조건문 (if-else, switch-case)",
    category: "제어 흐름",
    summary: "조건에 따라 실행 경로를 분기합니다. switch 문은 정수형/문자형 값에 따라 빠른 점프 테이블 분기를 수행합니다.",
    syntax: "if (condition) { ... } else if (other) { ... } else { ... }\nswitch (int_expr) { case 1: ... break; default: ... }",
    example: `#include <stdio.h>

int main(void) {
    int score = 85;

    if (score >= 90) {
        printf("A Grade\\n");
    } else if (score >= 80) {
        printf("B Grade\\n");
    } else {
        printf("C Grade\\n");
    }

    char command = 'q';
    switch (command) {
        case 's':
            printf("Start game\\n");
            break;
        case 'q':
            printf("Quit game\\n");
            break;
        default:
            printf("Unknown command\\n");
            break;
    }
    return 0;
}`,
    explanation: "switch 문에서 case 레이블 끝에 break를 생략하면 다음 case 블록까지 연달아 실행되는 'Fall-through'가 발생하므로 의도한 것이 아니라면 반드시 break를 작성해야 합니다.",
    pitfalls: "if (x = 5) 처럼 등호 1개(=)를 쓰면 대입 연산이 되어 항상 참(True)으로 평가되는 대표적인 버그가 발생합니다. 비교는 항상 (x == 5)입니다.",
    practice: "문제: switch 문의 case 비교 대상 값으로 올 수 없는 타입(예: 실수 double, 정수 int 중)은 무엇일까요?\n정답: 실수형(double, float). switch 문은 정수/열거형/문자형만 가능합니다."
  },
  {
    id: "c-loops",
    title: "4. 반복문 (for, while, do-while)",
    category: "제어 흐름",
    summary: "정해진 횟수만큼 반복할 때는 for 문, 조건이 참인 동안 반복할 때는 while 문, 최소 1회 실행을 보장할 때는 do-while 문을 사용합니다.",
    syntax: "for (int i = 0; i < n; i++) { ... }\nwhile (cond) { ... }\ndo { ... } while (cond);",
    example: `#include <stdio.h>

int main(void) {
    // 1. for 문: 정해진 횟수 누적
    int sum = 0;
    for (int i = 1; i <= 5; i++) {
        sum += i;
    }
    printf("1~5 Sum: %d\\n", sum);

    // 2. while 문: 특정 조건까지
    int count = 3;
    while (count > 0) {
        printf("Countdown: %d\\n", count);
        count--;
    }

    // 3. break & continue
    for (int i = 0; i < 10; i++) {
        if (i % 2 == 0) continue; // 짝수 스킵
        if (i > 5) break;         // 5 초과 시 즉시 탈출
        printf("Odd: %d\\n", i);
    }
    return 0;
}`,
    explanation: "continue는 루프의 다음 반복 단계로 즉시 점프하고, break는 가장 안쪽에 있는 루프 전체를 즉시 중단하고 탈출합니다.",
    pitfalls: "while 문 내부에서 반복 탈출 조건(예: 카운터 증감)을 누락하면 CPU 100% 점유의 무한 루프(Infinite Loop)에 빠집니다.",
    practice: "문제: do-while 문과 while 문의 가장 결정적인 차이점은 무엇일까요?\n정답: do-while 문은 조건 검사를 나중에 하므로 조건이 거짓이라도 최소 1회는 본문이 무조건 실행됩니다."
  },
  {
    id: "c-functions-scope",
    title: "5. 함수 정의와 매개변수 전달 (Call by Value)",
    category: "함수와 스코프",
    summary: "C 언어의 함수는 값을 복사하여 전달하는 'Call by Value'가 기본입니다. 함수 내부에서 매개변수를 바꿔도 호출자 원본은 변하지 않습니다.",
    syntax: "return_type function_name(parameter_list) {\n    // function body\n    return value;\n}",
    example: `#include <stdio.h>

// 함수 원형(Prototype) 선언
int add(int a, int b);
void try_change(int val);

int main(void) {
    int x = 10;
    try_change(x);
    printf("x after try_change: %d\\n", x); // 여전히 10!

    int result = add(3, 7);
    printf("3 + 7 = %d\\n", result);
    return 0;
}

int add(int a, int b) {
    return a + b;
}

void try_change(int val) {
    val = 999; // 복사본만 변경됨
}`,
    explanation: "main 함수보다 아래에 정의된 함수를 호출하려면 상단에 '함수 원형(Prototype)'을 먼저 선언해 컴파일러에게 함수의 입출력 형태를 알려주어야 합니다.",
    pitfalls: "지역 변수(Local variable)의 메모리 주소를 함수 바깥으로 return하면, 함수 종료 후 해제된 스택 영역을 가리키는 댕글링 포인터가 발생합니다.",
    practice: "문제: 함수 내부에서 선언되었지만 프로그램이 끝날 때까지 값이 유지되도록 보존하는 키워드는 무엇일까요?\n정답: static (정적 변수)"
  },
  {
    id: "c-arrays-multidim",
    title: "6. 1차원 및 다차원 배열 (Arrays)",
    category: "데이터 구조",
    summary: "동일한 데이터 타입의 원소들을 메모리에 빈틈없이 연속된 물리적 공간으로 할당하는 자료구조입니다. 0번 인덱스부터 시작합니다.",
    syntax: "type array_name[size];\ntype matrix[rows][cols];",
    example: `#include <stdio.h>

int main(void) {
    int scores[5] = {90, 85, 77, 95, 100};
    int n = sizeof(scores) / sizeof(scores[0]); // 배열 원소 개수 계산

    for (int i = 0; i < n; i++) {
        printf("scores[%d] = %d\\n", i, scores[i]);
    }

    // 2차원 배열 (2x3 행렬)
    int grid[2][3] = {
        {1, 2, 3},
        {4, 5, 6}
    };
    printf("grid[1][2] = %d\\n", grid[1][2]); // 6
    return 0;
}`,
    explanation: "C 언어의 배열은 스스로 자신의 길이 정보를 저장하지 않습니다. 따라서 sizeof(배열) / sizeof(원소) 공식을 쓰거나, 배열을 함수에 넘길 때 반드시 길이를 별도 인자로 전달해야 합니다.",
    pitfalls: "C 언어는 배열 인덱스 경계 검사(Bounds checking)를 수행하지 않습니다. 5칸짜리 배열에 index 10을 쓰면 세그멘테이션 오류나 메모리 오염이 일어납니다.",
    practice: "문제: int arr[10]; 에서 첫 번째 원소와 마지막 원소의 인덱스는 각각 얼마일까요?\n정답: 첫 번째는 0, 마지막은 9입니다."
  },
  {
    id: "c-strings-manip",
    title: "7. 문자열과 널 종단 문자 ('\\0')",
    category: "데이터 구조",
    summary: "C 언어에는 독립된 string 타입이 없으며, 끝에 널 문자('\\0', 아스키 코드 0)가 붙은 char 배열로 문자열을 표현합니다.",
    syntax: "char str[] = \"Hello\"; // 실제 크기는 'H','e','l','l','o','\\0' 총 6바이트",
    example: `#include <stdio.h>
#include <string.h>

int main(void) {
    char greeting[] = "Hello";
    char buffer[32];

    // 문자열 복사
    strcpy(buffer, greeting);
    // 문자열 연결
    strcat(buffer, " World!");

    printf("Message: %s\\n", buffer);
    printf("Length: %zu (Bytes: %zu)\\n", strlen(buffer), sizeof(buffer));

    // 문자열 비교 (0이면 일치)
    if (strcmp(greeting, "Hello") == 0) {
        printf("Greeting is Hello!\\n");
    }
    return 0;
}`,
    explanation: "strlen() 함수는 문자열 끝의 '\\0'을 만날 때까지의 순수 글자 수를 세어 반환합니다. 반면 sizeof()는 배열에 할당된 전체 바이트 크기를 반환합니다.",
    pitfalls: "문자열을 담을 배열 크기를 정할 때는 화면에 보이는 글자 수보다 반드시 1바이트 더 크게(' \\0 ' 공간) 할당해야 버퍼 오버플로우를 막을 수 있습니다.",
    practice: "문제: 문자열 \"Hi\"를 저장하기 위해 필요한 최소 char 배열 길이는 몇 바이트일까요?\n정답: 3바이트 ('H', 'i', '\\0')"
  },
  {
    id: "c-pointers-basics",
    title: "8. 포인터 기초 (주소 연산자 &, 역참조 *)",
    category: "메모리와 포인터",
    summary: "포인터는 다른 변수가 저장된 컴퓨터 메모리의 물리적 주소(Address)를 저장하는 특별한 변수입니다. C 언어 성능의 핵심입니다.",
    syntax: "type *ptr = &variable; // &는 변수의 메모리 주소를 구함\n*ptr = new_value;      // *는 주소가 가리키는 실제 값에 접근(역참조)",
    example: `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a; // a가 가리키는 주소의 값을 temp에 복사
    *a = *b;       // b가 가리키는 값을 a 위치에 덮어씀
    *b = temp;     // temp 값을 b 위치에 덮어씀
}

int main(void) {
    int num = 42;
    int *p = &num; // num의 주소를 포인터 p에 저장

    printf("num value: %d\\n", num);
    printf("num address: %p\\n", (void*)&num);
    printf("dereferenced *p: %d\\n", *p);

    *p = 100; // 포인터를 통해 num의 값을 원격 변경!
    printf("num changed: %d\\n", num);

    int x = 10, y = 20;
    swap(&x, &y); // 주소를 넘겨 원본 맞바꾸기
    printf("After swap: x=%d, y=%d\\n", x, y);
    return 0;
}`,
    explanation: "주소 전달 방식(Call by Reference)을 구현하기 위해 포인터에 변수의 주소(&)를 담아 전달하며, 함수 안에서 역참조(*)를 통해 호출자의 원본 데이터를 직접 수정할 수 있습니다.",
    pitfalls: "초기화되지 않은 포인터(야생 포인터)나 NULL 포인터를 역참조(*p)하면 즉시 'Segmentation fault' 크래시가 발생합니다.",
    practice: "문제: int x = 5; 일 때 x의 메모리 주소를 얻는 연산자는 무엇일까요?\n정답: & (주소 연산자, &x)"
  },
  {
    id: "c-pointers-arrays",
    title: "9. 포인터 연산과 포인터-배열의 등가성",
    category: "메모리와 포인터",
    summary: "C 언어에서 배열의 이름은 첫 번째 원소의 시작 주소를 가리키는 상수 포인터처럼 동작합니다. *(arr + i)는 arr[i]와 완전히 동일합니다.",
    syntax: "type *p = arr;\n*(p + i) == arr[i];",
    example: `#include <stdio.h>

int main(void) {
    int numbers[] = {10, 20, 30, 40, 50};
    int *ptr = numbers; // &numbers[0]과 같음

    for (int i = 0; i < 5; i++) {
        // 배열 인덱스 표기와 포인터 역참조 표기 대조
        printf("Index [%d]: %d, Pointer *(ptr + %d): %d\\n", 
               i, numbers[i], i, *(ptr + i));
    }

    // 포인터 증가 연산 (sizeof(int)인 4바이트씩 전진)
    ptr++;
    printf("After ptr++: %d\\n", *ptr); // 20
    return 0;
}`,
    explanation: "포인터에 +1을 더하면 주소 숫자가 1 증가하는 것이 아니라, 가리키는 타입의 크기(int면 4바이트, double이면 8바이트)만큼 자동으로 주소가 건너뜁니다.",
    pitfalls: "배열 이름 자체는 고정된 주소를 가리키는 상수이므로 numbers++ 같은 재대입 연산은 문법 에러가 발생합니다.",
    practice: "문제: 4바이트 int형 포인터 p의 주소가 0x1000일 때, p + 2 의 주소는 얼마일까요?\n정답: 0x1008 (4바이트 × 2 = 8바이트 증가)"
  },
  {
    id: "c-dynamic-memory",
    title: "10. 동적 메모리 할당 (malloc, calloc, realloc, free)",
    category: "메모리와 포인터",
    summary: "프로그램 실행 중에 힙(Heap) 영역으로부터 원하는 크기만큼의 메모리를 유연하게 할당받고, 다 쓴 뒤에는 반드시 free()로 반환합니다.",
    syntax: "type *ptr = (type*)malloc(count * sizeof(type));\nfree(ptr);\nptr = nullptr;",
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int size = 3;
    // 힙에 int 3개 크기의 연속 메모리 할당
    int *arr = (int *)malloc(size * sizeof(int));
    if (arr == NULL) {
        printf("Memory allocation failed!\\n");
        return 1;
    }

    for (int i = 0; i < size; i++) {
        arr[i] = (i + 1) * 10;
    }

    // 크기 확장 (realloc)
    int *temp = (int *)realloc(arr, 5 * sizeof(int));
    if (temp != NULL) {
        arr = temp;
        arr[3] = 40;
        arr[4] = 50;
    }

    for (int i = 0; i < 5; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");

    // 반드시 해제하여 누수 방지
    free(arr);
    arr = NULL;
    return 0;
}`,
    explanation: "calloc은 메모리를 0으로 초기화하여 할당하고, realloc은 기존 데이터를 보존하면서 블록 크기를 줄이거나 늘립니다. 할당 실패 시에는 NULL을 반환합니다.",
    pitfalls: "free()를 호출하지 않으면 메모리 누수(Memory Leak)가 발생하고, 이미 해제된 메모리를 다시 free()하면 Double Free 크래시가 일어납니다. 해제 직후 포인터에 NULL을 대입하세요.",
    practice: "문제: 힙에 할당받은 메모리를 운영체제에 반환하는 표준 라이브러리 함수는 무엇일까요?\n정답: free()"
  },
  {
    id: "c-struct-typedef",
    title: "11. 구조체(struct)와 typedef 사용자 정의형",
    category: "데이터 구조",
    summary: "서로 다른 데이터 타입의 변수들을 하나의 의미 있는 단위로 묶어 복합 자료구조를 만듭니다. typedef를 사용하면 타입명을 깔끔하게 정의할 수 있습니다.",
    syntax: "typedef struct {\n    type field1;\n    type field2;\n} TypeName;\ninstance.field; ptr->field;",
    example: `#include <stdio.h>

typedef struct {
    int id;
    char name[32];
    double gpa;
} Student;

void print_student(const Student *s) {
    // 화살표 연산자(->)는 포인터를 통해 구조체 멤버에 접근
    printf("ID: %d, Name: %s, GPA: %.2f\\n", s->id, s->name, s->gpa);
}

int main(void) {
    Student s1 = { .id = 101, .name = "Alice", .gpa = 3.95 };
    // 점(.) 연산자로 직접 접근
    s1.gpa = 4.0;

    print_student(&s1);
    return 0;
}`,
    explanation: "구조체 인스턴스에서 멤버를 참조할 때는 온점(.)을 쓰고, 구조체의 포인터를 통해 멤버를 참조할 때는 화살표 연산자(->)를 씁니다. s->id 는 (*s).id 와 동일합니다.",
    pitfalls: "구조체를 값으로 함수에 넘기면 구조체 전체 바이트가 복사되므로, 성능을 위해 구조체는 포인터(const Student *s)로 전달하는 것이 정석입니다.",
    practice: "문제: 포인터 p가 가리키는 구조체의 name 멤버에 접근하는 단축 연산자는 무엇일까요?\n정답: p->name"
  },
  {
    id: "c-enum-union",
    title: "12. 열거형(enum)과 공용체(union)",
    category: "데이터 구조",
    summary: "열거형(enum)은 정수형 상수에 가독성 높은 이름을 붙이고, 공용체(union)는 여러 멤버가 가장 큰 멤버 하나의 메모리 공간을 공유합니다.",
    syntax: "typedef enum { RED, GREEN, BLUE } Color;\ntypedef union { int i; float f; } Data;",
    example: `#include <stdio.h>

typedef enum {
    STATUS_OK = 200,
    STATUS_NOT_FOUND = 404,
    STATUS_ERROR = 500
} HttpStatus;

typedef union {
    int int_val;
    float float_val;
    char char_val;
} PacketData;

int main(void) {
    HttpStatus code = STATUS_OK;
    printf("Status code: %d\\n", code);

    PacketData data;
    data.int_val = 65;
    printf("As int: %d, As char: %c\\n", data.int_val, data.char_val);
    printf("Union size: %zu (모든 멤버가 메모리 공유)\\n", sizeof(data));
    return 0;
}`,
    explanation: "공용체(union)는 여러 필드 중 '동시에 단 하나'의 값만 저장할 때 메모리를 극적으로 절약하기 위해 임베디드나 네트워크 패킷 파싱에서 사용됩니다.",
    pitfalls: "공용체의 한 멤버에 값을 쓴 뒤 다른 멤버를 읽으면 비트 패턴이 재해석되므로, 현재 어떤 타입이 유효한지 추적하는 태그(Tag)가 필요합니다.",
    practice: "문제: enum에서 첫 번째 항목의 값을 지정하지 않으면 기본으로 할당되는 정수 값은 얼마일까요?\n정답: 0"
  },
  {
    id: "c-function-pointers",
    title: "13. 함수 포인터(Function Pointer)와 콜백",
    category: "고급 문법",
    summary: "함수의 시작 주소를 포인터 변수에 담아 실행 시간에 호출할 함수를 동적으로 바꾸거나, 다른 함수의 인자로 넘겨 콜백(Callback) 패턴을 구현합니다.",
    syntax: "return_type (*func_ptr_name)(param_types) = target_func;",
    example: `#include <stdio.h>
#include <stdlib.h>

int compare_desc(const void *a, const void *b) {
    return (*(int*)b - *(int*)a); // 내림차순 비교 함수
}

void apply_operation(int x, int y, int (*op)(int, int)) {
    printf("Result: %d\\n", op(x, y));
}

int multiply(int a, int b) { return a * b; }

int main(void) {
    // 1. 함수 포인터를 매개변수로 받는 고차 함수
    apply_operation(4, 5, multiply);

    // 2. 표준 라이브러리 qsort 정렬 콜백
    int arr[] = {3, 1, 4, 1, 5, 9, 2};
    qsort(arr, 7, sizeof(int), compare_desc);

    printf("Sorted: ");
    for (int i = 0; i < 7; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,
    explanation: "함수 이름 자체는 코드 세그먼트(Text) 영역의 실행 코드 시작 주소를 나타냅니다. qsort() 같은 일반화 알고리즘에 함수 포인터를 넘기면 정렬 기준을 자유자재로 바꿀 수 있습니다.",
    pitfalls: "함수 포인터 선언 시 괄호 우선순위에 주의해야 합니다. int *f(int)는 포인터를 반환하는 일반 함수 선언이고, int (*f)(int)가 진짜 함수 포인터 변수 선언입니다.",
    practice: "문제: int 두 개를 받아 int를 반환하는 함수 포인터 타입 CalcFunc를 typedef로 어떻게 선언할까요?\n정답: typedef int (*CalcFunc)(int, int);"
  },
  {
    id: "c-file-io",
    title: "14. 파일 입출력 (File I/O)",
    category: "입출력",
    summary: "stdio.h의 FILE 구조체 포인터를 사용하여 디스크의 파일을 텍스트 또는 바이너리 모드로 열고, 읽고, 쓴 후 닫습니다.",
    syntax: "FILE *fp = fopen(filename, mode); // mode: \"r\", \"w\", \"a\", \"rb\", \"wb\"\nfclose(fp);",
    example: `#include <stdio.h>

int main(void) {
    const char *path = "sample.txt";

    // 1. 파일 쓰기
    FILE *fp = fopen(path, "w");
    if (fp != NULL) {
        fprintf(fp, "Hello C23 File I/O!\\nScore: %d\\n", 100);
        fclose(fp);
    }

    // 2. 파일 읽기
    fp = fopen(path, "r");
    if (fp == NULL) {
        perror("File open error");
        return 1;
    }

    char line[128];
    while (fgets(line, sizeof(line), fp) != NULL) {
        printf("Read: %s", line);
    }
    fclose(fp);
    return 0;
}`,
    explanation: "fopen() 호출 후에는 파일이 존재하지 않거나 권한이 없을 수 있으므로 반드시 NULL 검사를 수행해야 합니다. 작업이 끝나면 fclose()로 OS의 파일 핸들을 반납해야 합니다.",
    pitfalls: "fclose()를 누락하면 파일 버퍼에 기록 대기 중이던 내용이 디스크에 플러시(Flush)되지 않고 유실될 위험이 있습니다.",
    practice: "문제: 기존 파일의 내용을 지우지 않고 맨 뒤에 새로운 내용을 덧붙여 쓰기 위한 fopen 모드 문자열은 무엇일까요?\n정답: \"a\" (Append 모드)"
  },
  {
    id: "c-preprocessor",
    title: "15. C 전처리기 매크로 (#define, 헤더 가드)",
    category: "전처리기",
    summary: "컴파일러가 기계어로 번역하기 전에 소스 코드를 텍스트 단위로 치환하거나 조건부로 포함시키는 지시어입니다.",
    syntax: "#define IDENTIFIER replacement\n#ifndef HEADER_H\n#define HEADER_H\n// declarations\n#endif",
    example: `#include <stdio.h>

// 함수형 매크로
#define SQUARE(x) ((x) * (x))
#define MAX(a, b) ((a) > (b) ? (a) : (b))

// 조건부 컴파일
#define DEBUG_MODE 1

int main(void) {
    int val = 5;
    printf("5 squared: %d\\n", SQUARE(val + 1)); // ((5 + 1) * (5 + 1)) = 36

#if DEBUG_MODE
    printf("[DEBUG] Max of 10, 20 is %d\\n", MAX(10, 20));
#endif

    return 0;
}`,
    explanation: "헤더 가드(#ifndef ~ #endif)는 복잡한 대규모 프로젝트에서 같은 헤더 파일이 여러 번 중복 include되어 타입이 재정의되는 오류를 원천 차단해 줍니다.",
    pitfalls: "함수형 매크로 정의 시 매개변수와 전체 수식에 괄호()를 치지 않으면, SQUARE(1 + 2)가 1 + 2 * 1 + 2 = 5 로 잘못 치환되는 치명적 연산자 우선순위 오류가 발생합니다.",
    practice: "문제: 헤더 파일이 단 한 번만 컴파일되도록 지시하는 현대 전처리기 한 줄 단축 지시어는 무엇일까요?\n정답: #pragma once"
  },
  {
    id: "c23-modern-features",
    title: "16. 최신 C23 표준 핵심 문법 (nullptr, auto, constexpr)",
    category: "최신 표준",
    summary: "2024년 공식 확정된 ISO C23 표준은 nullptr 키워드, 컴파일 타임 상수 constexpr, 타입 추론 auto를 도입하여 C++과의 호환성과 안정성을 대폭 강화했습니다.",
    syntax: "void *p = nullptr;\nauto x = 10; // int로 추론\nconstexpr double RATE = 0.05;",
    example: `#include <stdio.h>

int main(void) {
    // 1. C23 공식 nullptr 키워드 (NULL 매크로 대체)
    void *ptr = nullptr;
    if (ptr == nullptr) {
        printf("ptr is safe nullptr!\\n");
    }

    // 2. auto 타입 추론
    auto count = 42; // int로 자동 추론
    auto ratio = 3.14; // double로 자동 추론
    printf("Count: %d, Ratio: %.2f\\n", count, ratio);

    // 3. constexpr 변수 (컴파일 타임 완전 불변 상수)
    constexpr int BUFFER_SIZE = 1024;
    char buffer[BUFFER_SIZE];
    printf("Buffer allocated with constexpr: %zu bytes\\n", sizeof(buffer));
    return 0;
}`,
    explanation: "기존의 NULL은 정수 0으로 정의되어 포인터와 정수 간 혼동 문제가 있었으나, C23의 nullptr은 타입 안전한 순수 널 포인터 리터럴입니다.",
    pitfalls: "C23 기능을 사용하려면 GCC 14+ 또는 Clang 18+ 컴파일러에서 -std=c23 플래그를 명시해야 컴파일 오류가 발생하지 않습니다.",
    practice: "문제: C23에서 기존 ((void*)0) 매크로 대신 공식 도입된 널 포인터 전용 키워드는 무엇일까요?\n정답: nullptr"
  }
];
