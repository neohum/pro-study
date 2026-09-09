# 05. 재귀 하강 JSON 파서·직렬화기

## 무엇을 만드는가

표준 입력에서 JSON 문자열을 읽어 문법 트리를 구축하고, 컴팩트(minified) 또는 보기 좋은 포맷(--pretty)으로 직렬화하는 파서 도구다.
JSON 표준(RFC 8259)의 6대 기본 타입(`null`, `bool`, `number`, `string`, `array`, `object`)을 지원하고 재귀 하강 파서로 중첩 구조를 해석한다.

```
$ build/app.exe < input.json
{"title":"c23","tags":["fast","simple"]}

$ build/app.exe --pretty < input.json
{
  "title": "c23",
  "tags": [
    "fast",
    "simple"
  ]
}
```

## 왜 이 프로젝트인가

JSON은 현대 웹과 시스템 프로그래밍에서 가장 널리 쓰이는 데이터 교환 포맷이다.
정적 타입 언어인 C에서 동적이고 임의의 깊이로 중첩될 수 있는 JSON 데이터를 표현하려면 **태그드 유니언(Tagged Union, 합 타입)**과 **재귀 자료구조**가 필수적이다.

1번 프로젝트(계산기)에서 배운 재귀 하강 파서 기법을 확장하여, 단일 수식 대신 임의의 복합 데이터 구조(배열, 키-값 객체)를 파싱하는 능력을 갖춘다.
여기서 만든 파서와 직렬화기는 10번 HTTP 서버의 REST API 응답(`/api/status`) 처리에서 재사용된다.

## 핵심 개념

### 태그드 유니언(Tagged Union)과 익명 공용체

C23의 익명 공용체(anonymous union)를 활용하면 태그(`type`)와 값(`union`)을 감싸는 단일 구조체를 깔끔하게 정의할 수 있다.
태그를 먼저 확인한 뒤 해당 멤버에만 접근하므로 메모리를 절약하면서도 타입 안전성을 지킨다.

```c
typedef enum JsonType : unsigned char {
    JSON_NULL, JSON_BOOL, JSON_NUMBER, JSON_STRING, JSON_ARRAY, JSON_OBJECT
} JsonType;

struct JsonValue {
    JsonType type;
    union {
        bool boolean;
        double number;
        char *string;
        struct { JsonValue **items; size_t len, cap; } array;
        struct { JsonMember *items; size_t len, cap; } object;
    };
};
```

### 상호 재귀(Mutual Recursion)를 통한 중첩 처리

JSON의 배열(`[ ... ]`)과 객체(`{ ... }`)는 임의의 하위 JSON 값을 포함할 수 있다.
`parse_value`가 `parse_array`와 `parse_object`를 호출하고, 이들이 다시 각 원소를 읽기 위해 `parse_value`를 호출하는 **상호 재귀** 구조를 이룬다.

```c
static JsonValue *parse_value(Parser *p);
static JsonValue *parse_array(Parser *p) {
    /* ... */
    JsonValue *elem = parse_value(p); // 상호 재귀
    /* ... */
}
```

### 문자열 이스케이프 처리

JSON 문자열은 큰따옴표(`"`)와 역슬래시(`\`), 제어 문자(`\n`, `\t`), 유니코드 시퀀스(`\uXXXX`)를 이스케이프할 수 있다.
파서는 역슬래시 뒤 문자를 원래 문자로 디코딩하고, 직렬화기는 안전하게 이스케이프 문자로 인코딩하여 출력한다.

## 단계별 구현

`starter/main.c`의 `TODO(step-N)` 주석과 아래 단계가 1:1로 대응한다.

### Step 1: 태그드 유니언 자료구조와 메모리 관리

`JsonValue` 구조체와 메모리 할당(`json_new`), 재귀 해제(`json_free`) 함수를 작성한다.
`json_free`는 트리 형태의 복합 노드(배열 원소, 객체 키/값)를 깊이 우선으로 순회하며 동적 할당된 모든 메모리를 누수 없이 해제해야 한다.

확인: `gcc -std=c23 -Wall -Wextra -g -o build/app.exe main.c`로 경고 없이 컴파일되는지 확인한다.

### Step 2: 원시 타입 파싱

`parse_null`, `parse_bool`, `parse_number`, `parse_raw_string`을 구현한다.
- `null`: "null" 리터럴 일치 확인
- `bool`: "true", "false" 리터럴 확인
- `number`: 부호, 정수, 소수, 지수 표기를 `strtod`로 파싱
- `string`: `\"`, `\\`, `\n`, `\t` 및 `\uXXXX` 이스케이프 문자를 언이스케이프 처리

확인: 원시 값 단독 입력(`42`, `"hello"`, `true`)이 파싱되는지 점검한다.

### Step 3: 복합 타입 파싱 (array, object) 및 에러 전파

`parse_array`, `parse_object`, `parse_value`를 작성한다.
- `parse_array`: `[`로 시작해 쉼표로 구분된 값 목록을 수집하고 `]`로 닫는다. 후행 쉼표(trailing comma)는 금지한다.
- `parse_object`: `{`로 시작해 `"key": value` 쌍 목록을 수집하고 `}`로 닫는다.
- 파싱 실패 시 `p->error`에 에러 원인을 기록하고 즉시 상위로 NULL을 반환한다.

확인: `[1, [2, 3]]` 및 `{"a": {"b": 1}}` 중첩 구조가 올바르게 파싱되는지 확인한다.

### Step 4: JSON 직렬화기 (Stringify)

동적 문자열 버퍼(`StrBuf`)를 이용해 AST를 JSON 텍스트로 변환하는 `json_stringify`를 작성한다.
`pretty`가 true일 때는 깊이에 따라 2칸 들여쓰기와 개행을 적용하고, false일 때는 공백 없이 압축(minified) 형태로 출력한다.

확인: `--pretty` 플래그 적용 시 들여쓰기된 JSON이 출력되는지 확인한다.

### Step 5: CLI 인터페이스 및 입출력 통합

표준 입력에서 전체 데이터를 버퍼로 읽어 들이는 `read_all_stdin`과 `main`을 연결한다.
파싱 후 꼬리 쓰레기 문자(trailing characters)가 남아 있는지 검사하고, 에러가 있다면 `error: <메시지>`를 출력한다.

확인: `tests/cases/`의 모든 테스트 케이스를 통과하는지 검증한다.

## 막혔을 때

| 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| 중첩 객체/배열 해제 시 세그멘테이션 오류 | 자식 노드 해제 전 부모 포인터를 먼저 free함 | 후위 순회(post-order)로 자식 노드를 먼저 해제 후 부모 해제 |
| `strtod`가 빈 문자열에서 0을 반환함 | `end == start` 포인터 이동 검사 누락 | 포인터가 진행하지 않았으면 `fail(p, "invalid number")` |
| `[1, 2, ]`가 성공으로 처리됨 | 후행 쉼표 검사 누락 | 쉼표 직후 바로 닫는 괄호(`]`, `}`)가 오면 문법 에러 처리 |
| 긴 JSON 입력 시 잘림 현상 발생 | 고정 크기 라인 버퍼(`fgets`) 사용 | `read_all_stdin`으로 동적 확장 버퍼를 사용해 EOF까지 전체 읽기 |

## 더 나아가기

- JSON 포인터(RFC 6901) 또는 JSONPath 쿼리 명령 구현 (`app.exe get "/users/0/name"`)
- 직렬화 시 부동소수점 정밀도 및 지수 표기 커스터마이징
- SAX 스타일 스트리밍 파서로 확장하여 대용량 JSON 메모리 절약

## 참고

- The JavaScript Object Notation (JSON) Data Interchange Format: <https://datatracker.ietf.org/doc/html/rfc8259>
- C23 익명 공용체 (ISO/IEC 9899:2024 Section 6.7.2.1)
