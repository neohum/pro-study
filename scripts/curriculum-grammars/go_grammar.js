/**
 * scripts/curriculum-grammars/go_grammar.js
 * Go 언어 핵심 문법 16개 종합 학습 콘텐츠
 */

module.exports = [
  {
    id: "go-vars-types",
    title: "1. 변수 선언과 기본 타입 (Zero Value)",
    category: "기초 문법",
    summary: "Go 언어는 정적 타입 언어로 var 키워드 또는 := 단축 선언 문법을 사용합니다. 초기화되지 않은 변수는 0, false, \"\" 같은 안전한 기본값(Zero Value)으로 자동 설정됩니다.",
    syntax: "var name string = \"Go\"\nage := 25 // 함수 내부 단축 선언 (타입 자동 추론)",
    example: `package main

import "fmt"

func main() {
    var a int         // Zero value: 0
    var b bool        // Zero value: false
    var s string      // Zero value: ""
    name := "Gopher"  // := 단축 변수 선언 (함수 내부에서만 가능)
    pi := 3.14159     // float64로 자동 추론

    fmt.Printf("Zero values: a=%d, b=%t, s='%s'\\n", a, b, s)
    fmt.Printf("Name: %s, PI: %.2f\\n", name, pi)
}`,
    explanation: "Go는 타입 안전성을 최우선으로 하여, 다른 언어와 달리 int와 int64 사이에도 암시적 형변환을 허용하지 않으며 반드시 int64(x) 처럼 명시적으로 변환해야 합니다.",
    pitfalls: "단축 선언자(:=)는 함수 내부에서만 사용할 수 있으며, 패키지 전역 레벨에서는 반드시 var 키워드를 써야 컴파일 에러를 피할 수 있습니다.",
    practice: "문제: Go에서 초기화하지 않고 선언한 bool 변수와 포인터 변수의 Zero Value는 각각 무엇일까요?\n정답: bool은 false, 포인터는 nil입니다."
  },
  {
    id: "go-constants-iota",
    title: "2. 상수(const)와 열거형 iota 패턴",
    category: "기초 문법",
    summary: "const 키워드로 컴파일 타임 불변 상수를 선언하며, iota 식별자를 활용해 0부터 1씩 자동 증가하는 깔끔한 열거형 상수 묶음을 만듭니다.",
    syntax: "const (\n    A = iota // 0\n    B        // 1\n    C        // 2\n)",
    example: `package main

import "fmt"

type Weekday int

const (
    Sunday Weekday = iota // 0
    Monday                // 1
    Tuesday               // 2
    Wednesday             // 3
)

const (
    _  = 1 << (10 * iota) // 첫 번째 1 << 0 (1)은 무시(_)
    KB                    // 1 << 10 (1024)
    MB                    // 1 << 20 (1048576)
    GB                    // 1 << 30 (1073741824)
)

func main() {
    fmt.Println("Monday code:", Monday)
    fmt.Printf("1 MB = %d bytes\\n", MB)
}`,
    explanation: "iota는 const 괄호 블록 안에서 줄이 바뀔 때마다 0, 1, 2... 순서로 1씩 증가합니다. 비트 시프트(1 << (10 * iota))와 결합하면 용량 단위 열거형을 우아하게 정의할 수 있습니다.",
    pitfalls: "const 상수는 컴파일 타임에 값이 확정되어야 하므로, 런타임에 결정되는 함수 호출 결과(예: math.Sqrt(4))는 const에 대입할 수 없습니다.",
    practice: "문제: const ( A = iota + 5; B; C ) 로 선언했을 때 상수 B의 값은 얼마일까요?\n정답: 6 (iota가 1이므로 1 + 5 = 6)"
  },
  {
    id: "go-control-flow",
    title: "3. 조건문 (if 초기화문과 switch)",
    category: "제어 흐름",
    summary: "Go의 if 문은 조건식 앞에 짧은 문장을 실행하는 초기화 구문을 지원합니다. switch 문은 case 끝마다 break가 자동으로 적용됩니다.",
    syntax: "if init_statement; condition { ... }\nswitch val { case 1: ... default: ... }",
    example: `package main

import (
    "fmt"
    "strconv"
)

func main() {
    // 1. if 초기화문: 변수 범위를 if-else 블록으로 한정
    if num, err := strconv.Atoi("123"); err == nil {
        fmt.Println("Parsed number:", num)
    } else {
        fmt.Println("Parse error:", err)
    }

    // 2. switch 문 (자동 break)
    os := "linux"
    switch os {
    case "darwin":
        fmt.Println("macOS")
    case "linux":
        fmt.Println("Linux OS")
    default:
        fmt.Println("Other OS")
    }

    // 3. 조건 없는 switch (if-else 대용)
    hour := 14
    switch {
    case hour < 12:
        fmt.Println("Good morning")
    default:
        fmt.Println("Good afternoon")
    }
}`,
    explanation: "if err := f(); err != nil 구문은 Go에서 에러를 확인하는 가장 핵심적인 관용구(Idiom)입니다. if 블록 안에서 선언된 변수는 블록 밖으로 누출되지 않아 깔끔합니다.",
    pitfalls: "다른 언어와 달리 case 블록 아래로 의도적으로 흘려보내고 싶을 때만 명시적으로 fallthrough 키워드를 작성해야 합니다.",
    practice: "문제: if 문에서 조건식 주위에 괄호 (cond)를 넣는 것은 Go 포맷팅(gofmt) 규칙상 어떻게 처리될까요?\n정답: 컴파일은 되지만 gofmt에 의해 괄호가 자동으로 제거됩니다."
  },
  {
    id: "go-loops-range",
    title: "4. Go의 유일한 반복문 for (range 순회)",
    category: "제어 흐름",
    summary: "Go에는 while 문이 없으며 오직 for 문 하나로 모든 반복(전통 for, while 스타일, 무한 루프, 컬렉션 range 순회)을 표현합니다.",
    syntax: "for i := 0; i < n; i++ { ... }\nfor condition { ... } // while 스타일\nfor idx, val := range slice { ... }",
    example: `package main

import "fmt"

func main() {
    // 1. while 스타일 for
    count := 3
    for count > 0 {
        fmt.Printf("%d ", count)
        count--
    }
    fmt.Println()

    // 2. slice range 순회
    fruits := []string{"Apple", "Banana", "Cherry"}
    for idx, fruit := range fruits {
        fmt.Printf("fruits[%d] = %s\\n", idx, fruit)
    }

    // 3. 인덱스 무시(_) 순회
    for _, fruit := range fruits {
        fmt.Println("Fruit:", fruit)
    }
}`,
    explanation: "range는 배열/슬라이스에서는 (인덱스, 값), 맵에서는 (키, 값), 채널에서는 (원소)를 차례로 반환합니다. 쓰지 않는 반환값은 빈 식별자 밑줄(_)로 무시합니다.",
    pitfalls: "Go 1.22 이전 버전에서는 for _, v := range ... 루프 내부에서 클로저나 고루틴을 띄울 때 v의 주소를 캡처하면 모든 고루틴이 마지막 값만 공유하는 버그가 유명했습니다.",
    practice: "문제: Go에서 무한 루프(Infinite loop)를 생성하는 가장 간단한 문법은 무엇일까요?\n정답: for { ... } (조건식 없이 for만 작성)"
  },
  {
    id: "go-functions-multi-return",
    title: "5. 함수와 다중 반환값 (Multiple Returns)",
    category: "함수와 스코프",
    summary: "Go의 함수는 2개 이상의 값을 튜플 없이 단번에 반환할 수 있어, 결과값과 에러 객체를 동시에 리턴하는 안전한 프로그래밍이 가능합니다.",
    syntax: "func name(param1 type, param2 type) (return1, return2) {\n    return val1, val2\n}",
    example: `package main

import (
    "errors"
    "fmt"
)

// (결과, 에러) 다중 반환 함수
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("cannot divide by zero")
    }
    return a / b, nil
}

// 가변 인자(Variadic) 함수
func sumAll(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

func main() {
    result, err := divide(10, 2)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    fmt.Println("10 / 2 =", result)

    fmt.Println("Sum 1~4:", sumAll(1, 2, 3, 4))
}`,
    explanation: "다중 반환 덕분에 예외(Exception) 던지기 없이 일반 반환값 검사처럼 예측 가능하고 명시적인 에러 핸들링 코드를 작성할 수 있습니다.",
    pitfalls: "반환값 중 사용하지 않는 값이 있을 때 변수 이름을 지정해 두고 쓰지 않으면 'declared and not used' 컴파일 에러가 발생하므로 밑줄(_)을 써야 합니다.",
    practice: "문제: 가변 인자 매개변수를 선언할 때 타입 앞에 붙이는 기호는 무엇일까요?\n정답: ... (점 세 개, 예: ...int)"
  },
  {
    id: "go-first-class-closures",
    title: "6. 일급 함수와 클로저 (Closures)",
    category: "함수와 스코프",
    summary: "Go에서 함수는 일급 시민(First-class citizen)으로 변수에 할당하거나 다른 함수의 인자로 전달하고 반환할 수 있으며, 바깥 스코프 변수를 기억하는 클로저를 만듭니다.",
    syntax: "fn := func(x int) int { return x * 2 }\nfunc makeAdder(x int) func(int) int { ... }",
    example: `package main

import "fmt"

func sequenceGenerator() func() int {
    count := 0
    return func() int {
        count++ // 바깥 함수의 count 변수를 기억하고 갱신
        return count
    }
}

func main() {
    nextNum := sequenceGenerator()
    fmt.Println("Call 1:", nextNum()) // 1
    fmt.Println("Call 2:", nextNum()) // 2
    fmt.Println("Call 3:", nextNum()) // 3

    // 즉시 실행 익명 함수
    func(msg string) {
        fmt.Println("Immediate:", msg)
    }("Hello Closure")
}`,
    explanation: "클로저가 외부 지역 변수를 참조할 때, 컴파일러는 이 변수를 스택이 아닌 힙(Heap)으로 이동(Escape Analysis)시켜 함수 종료 후에도 상태를 유지하도록 관리합니다.",
    pitfalls: "루프 안에서 고루틴과 클로저를 결합할 때 루프 변수를 매개변수로 명시적 전달하지 않으면 의도치 않은 레이스 컨디션이 생길 수 있습니다.",
    practice: "문제: 함수가 자신이 선언된 환경의 변수를 캡처하여 보존하는 함수 객체를 무엇이라 부를까요?\n정답: 클로저 (Closure)"
  },
  {
    id: "go-arrays-slices",
    title: "7. 배열(고정)과 슬라이스(가변 동적 뷰)",
    category: "데이터 구조",
    summary: "배열은 고정 크기 값 타입인 반면, 슬라이스는 내부 배열을 가리키는 포인터, 길이(len), 용량(cap)으로 구성된 동적이고 유연한 컬렉션입니다.",
    syntax: "var arr [5]int           // 고정 크기 배열\ns := make([]int, len, cap) // 동적 슬라이스\ns = append(s, item)        // 원소 추가",
    example: `package main

import "fmt"

func main() {
    // 1. 슬라이스 생성 및 append
    nums := make([]int, 0, 4)
    nums = append(nums, 10, 20, 30)
    fmt.Printf("Slice: %v, len=%d, cap=%d\\n", nums, len(nums), cap(nums))

    // 2. 부분 슬라이싱 [low:high]
    sub := nums[1:3] // index 1부터 2까지
    fmt.Println("Sub slice:", sub) // [20, 30]

    // 3. 슬라이스 공유 주의
    sub[0] = 999
    fmt.Println("Original nums after sub change:", nums) // [10, 999, 30]!
}`,
    explanation: "슬라이스를 잘라내면 새 메모리를 복사하지 않고 원본 배열의 같은 메모리 주소를 공유합니다. append() 시 용량(cap)이 넘치면 Go가 자동으로 2배 큰 새 배열을 힙에 할당합니다.",
    pitfalls: "하위 슬라이스를 수정하면 원본 슬라이스의 값도 함께 바뀝니다. 완전한 독립 복사본이 필요하다면 copy() 내장 함수를 사용해야 합니다.",
    practice: "문제: s := []int{1, 2, 3, 4, 5} 일 때 s[1:4]의 길이는 얼마일까요?\n정답: 3 (4 - 1 = 3, 원소는 2, 3, 4)"
  },
  {
    id: "go-maps",
    title: "8. 맵(Map) 해시테이블과 콤마 ok 관용구",
    category: "데이터 구조",
    summary: "키-값 쌍을 저장하는 해시테이블 자료구조입니다. make(map[KeyType]ValueType)으로 생성하며, '콤마 ok' 문법으로 키의 존재 여부를 안전하게 확인합니다.",
    syntax: "m := make(map[string]int)\nval, exists := m[\"key\"]\ndelete(m, \"key\")",
    example: `package main

import "fmt"

func main() {
    // 맵 생성 및 초기화
    users := map[string]int{
        "alice": 95,
        "bob":   80,
    }
    users["charlie"] = 88 // 삽입

    // 콤마 ok 관용구로 키 존재 여부 확인
    score, ok := users["david"]
    if ok {
        fmt.Println("David's score:", score)
    } else {
        fmt.Println("David not found!")
    }

    // 맵 원소 삭제
    delete(users, "bob")
    fmt.Println("Users count:", len(users))
}`,
    explanation: "존재하지 않는 키를 조회하면 에러가 나는 대신 값 타입의 Zero Value(0, \"\" 등)가 반환됩니다. 따라서 실제 값이 0인지 아니면 키가 없어서 0인지 구별하기 위해 반드시 'val, ok :=' 패턴을 씁니다.",
    pitfalls: "선언만 하고 make로 초기화하지 않은 nil 맵에 값을 쓰려고 하면(nil_map[\"k\"] = 1) 런타임 패닉이 발생합니다.",
    practice: "문제: 맵에서 특정 키를 안전하게 제거하는 내장 함수는 무엇일까요?\n정답: delete(map, key)"
  },
  {
    id: "go-pointers",
    title: "9. 포인터(Pointer)와 참조 전달",
    category: "메모리와 포인터",
    summary: "Go의 포인터는 C와 유사하게 메모리 주소(&)와 역참조(*)를 제공하지만, 포인터 연산(p++)을 금지하여 메모리 안전성을 완벽히 보장합니다.",
    syntax: "p := &variable // 주소 추출\n*p = new_value // 역참조 대입",
    example: `package main

import "fmt"

type Config struct {
    Port int
    Host string
}

// 포인터 수신 함수: 원본 직접 수정
func updatePort(cfg *Config, newPort int) {
    cfg.Port = newPort // (*cfg).Port 의 단축 표기
}

func main() {
    val := 42
    p := &val
    *p = 100
    fmt.Println("Updated val:", val) // 100

    cfg := Config{Port: 8080, Host: "localhost"}
    updatePort(&cfg, 9090)
    fmt.Println("Updated Port:", cfg.Port) // 9090
}`,
    explanation: "Go 구조체의 포인터는 (*p).Field 대신 p.Field 처럼 직접 접근할 수 있도록 컴파일러가 자동 역참조 편의를 제공합니다.",
    pitfalls: "Go에는 가비지 컬렉터가 있으므로 함수 내 지역 변수의 주소를 반환해도 C처럼 깨지지 않고 안전하게 힙으로 이스케이프(Escape)됩니다.",
    practice: "문제: Go에서 포인터 변수에 대한 산술 연산(예: ptr++)은 기본적으로 허용될까요?\n정답: 허용되지 않습니다 (메모리 안전성을 위해 금지)"
  },
  {
    id: "go-structs-methods",
    title: "10. 구조체와 메서드 (값 수신자 vs 포인터 수신자)",
    category: "객체 지향",
    summary: "필드들을 묶어 구조체를 정의하고, 함수 이름 앞에 수신자(Receiver)를 달아 메서드를 구현합니다. 상태 변경이 필요할 때는 포인터 수신자를 씁니다.",
    syntax: "type StructName struct { ... }\nfunc (r *StructName) MethodName() { ... }",
    example: `package main

import "fmt"

type Counter struct {
    count int
}

// 1. 값 수신자: 복사본을 받으므로 원본 변경 불가
func (c Counter) ReadOnly() int {
    return c.count
}

// 2. 포인터 수신자: 원본 메모리 직접 변경
func (c *Counter) Increment() {
    c.count++
}

func main() {
    c := Counter{count: 0}
    c.Increment()
    c.Increment()
    fmt.Println("Count:", c.ReadOnly()) // 2
}`,
    explanation: "구조체의 크기가 크거나 메서드 안에서 필드 값을 변경해야 하는 경우 포인터 수신자 (*T)를 사용하는 것이 성능과 정합성 측면에서 모범 규칙입니다.",
    pitfalls: "같은 타입의 메서드들에 값 수신자와 포인터 수신자를 무분별하게 혼용하면 인터페이스 만족 여부에서 예상치 못한 오류가 생기므로 통일하는 것이 좋습니다.",
    practice: "문제: 구조체 필드의 첫 글자를 대문자로 쓰면 다른 패키지에서 접근 가능한(Public) 상태가 되는 규칙을 무엇이라 할까요?\n정답: Exported (외부 노출 식별자 규칙)"
  },
  {
    id: "go-interfaces-duck",
    title: "11. 인터페이스와 덕 타이핑(Duck Typing)",
    category: "객체 지향",
    summary: "Go는 implements 키워드 없이, 어떤 구조체가 인터페이스에 선언된 메서드를 모두 구현하기만 하면 자동으로 해당 인터페이스를 만족하는 암시적 덕 타이핑을 사용합니다.",
    syntax: "type Greeter interface {\n    Greet() string\n}\n// implements 선언 불필요!",
    example: `package main

import "fmt"

type Greeter interface {
    Greet() string
}

type Robot struct{ ID int }
func (r Robot) Greet() string {
    return fmt.Sprintf("Beep! I am Robot #%d", r.ID)
}

type Person struct{ Name string }
func (p Person) Greet() string {
    return "Hello! I am " + p.Name
}

func welcome(g Greeter) {
    fmt.Println(g.Greet())
}

func main() {
    welcome(Robot{ID: 7})
    welcome(Person{Name: "Gopher"})
}`,
    explanation: "\"오리처럼 걷고 오리처럼 꽥꽥거리면 그것은 오리다.\"라는 원칙입니다. Go 1.18부터는 빈 인터페이스 interface{}의 공식 별칭으로 any가 도입되었습니다.",
    pitfalls: "메서드가 포인터 수신자 (*T)로 구현되어 있다면 값 타입 T는 해당 인터페이스를 만족하지 못하며, 반드시 주소 &T를 전달해야 합니다.",
    practice: "문제: Go 1.18부터 도입된 모든 타입을 담을 수 있는 빈 인터페이스 interface{}의 공식 축약 별칭 키워드는 무엇일까요?\n정답: any"
  },
  {
    id: "go-type-assertions",
    title: "12. 타입 단언(Type Assertion)과 타입 스위치",
    category: "객체 지향",
    summary: "인터페이스 변수(any 등)에 담긴 실제 구체적 타입(Concrete Type)을 꺼낼 때 타입 단언(v.(T))이나 타입 스위치를 사용합니다.",
    syntax: "str, ok := val.(string) // 타입 단언\nswitch v := x.(type) { case int: ... } // 타입 스위치",
    example: `package main

import "fmt"

func describe(i any) {
    // 타입 스위치로 실제 타입별 분기
    switch v := i.(type) {
    case int:
        fmt.Printf("Integer: %d (x2 = %d)\\n", v, v*2)
    case string:
        fmt.Printf("String: '%s' (len = %d)\\n", v, len(v))
    default:
        fmt.Printf("Unknown type: %T\\n", v)
    }
}

func main() {
    var data any = "Hello Go"

    // 안전한 타입 단언 (콤마 ok)
    if s, ok := data.(string); ok {
        fmt.Println("Asserted string:", s)
    }

    describe(42)
    describe("Gopher")
    describe(3.14)
}`,
    explanation: "ok 없이 단독으로 data.(string)을 실행했는데 실제 타입이 다르면 런타임 패닉이 발생하므로, 반드시 'v, ok :=' 형태로 안전하게 단언해야 합니다.",
    pitfalls: "타입 스위치(.(type)) 문법은 switch 문 조건식에서만 사용할 수 있는 특별한 예약 문법입니다.",
    practice: "문제: val.(int) 단언 시 타입이 맞지 않을 때 패닉 크래시를 방지하기 위해 사용하는 패턴은 무엇일까요?\n정답: 콤마 ok 패턴 (v, ok := val.(int))"
  },
  {
    id: "go-error-handling",
    title: "13. Go의 표준 에러 처리 패턴 (errors.Is/As)",
    category: "에러 처리",
    summary: "Go는 예외(try-catch) 대신 error 인터페이스를 값으로 리턴합니다. Go 1.13부터는 에러 래핑과 errors.Is, errors.As를 표준으로 사용합니다.",
    syntax: "if err != nil { return fmt.Errorf(\"failed: %w\", err) }\nif errors.Is(err, ErrNotFound) { ... }",
    example: `package main

import (
    "errors"
    "fmt"
)

var ErrNotFound = errors.New("item not found")

func findUser(id int) (string, error) {
    if id != 1 {
        // %w를 사용하여 원본 에러를 감싸서(Wrapping) 전달
        return "", fmt.Errorf("lookup user %d: %w", id, ErrNotFound)
    }
    return "Alice", nil
}

func main() {
    _, err := findUser(99)
    if err != nil {
        fmt.Println("Error occurred:", err)
        // 에러 체인 안에 ErrNotFound가 들어있는지 검사
        if errors.Is(err, ErrNotFound) {
            fmt.Println("-> Specific handle: Please register first!")
        }
    }
}`,
    explanation: "fmt.Errorf(\"... %w\", err)에서 %w 서식 지정자를 쓰면 에러 체인이 형성되어, 상위 계층에서 errors.Is()로 원인 에러를 추적할 수 있습니다.",
    pitfalls: "에러를 무시(val, _ = doSomething())하면 시스템이 조용히 망가지므로, 리턴된 err는 반드시 즉시 검사하는 것이 Go의 절대 철학입니다.",
    practice: "문제: 에러 래핑 시 원본 에러를 감싸기 위해 fmt.Errorf에 사용하는 서식 지정자는 무엇일까요?\n정답: %w"
  },
  {
    id: "go-defer-panic-recover",
    title: "14. defer 지연 실행과 panic, recover",
    category: "에러 처리",
    summary: "defer는 함수가 종료될 때까지 특정 작업의 실행을 미룹니다(LIFO). 치명적 상황의 panic과 이를 가로채 복구하는 recover를 지원합니다.",
    syntax: "defer file.Close() // 자원 즉시 해제 보장\npanic(\"critical error\")\nr := recover()",
    example: `package main

import "fmt"

func safeExecute() {
    // defer + recover로 패닉 가로채기
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered from panic:", r)
        }
    }()

    fmt.Println("Executing risky operation...")
    panic("DB Connection Dead!") // 의도적 패닉 발생
    fmt.Println("This line will not run")
}

func main() {
    safeExecute()
    fmt.Println("Program recovered and continues normally!")
}`,
    explanation: "defer는 여러 개 작성되면 스택처럼 나중에 등록된 defer가 먼저 실행되는 후입선출(LIFO) 순서로 동작합니다. 파일이나 락 해제에 필수적입니다.",
    pitfalls: "recover()는 오직 defer 함수 내부에서만 의미가 있으며, 일반 코드 라인에서 호출하면 항상 nil을 반환합니다.",
    practice: "문제: defer 구문이 한 함수 안에서 3개 실행되었을 때, 이들의 실행 순서는 등록 순서와 비교해 어떻게 될까요?\n정답: 역순 (LIFO, 마지막에 등록된 defer가 가장 먼저 실행)"
  },
  {
    id: "go-goroutines-channels",
    title: "15. 고루틴(Goroutine)과 채널(Channel)",
    category: "동시성",
    summary: "go 키워드 하나로 수십만 개의 경량 스레드(고루틴)를 실행하고, 채널(<-)을 통해 메모리를 공유하는 대신 데이터를 안전하게 주고받습니다.",
    syntax: "go worker()       // 고루틴 실행\nch := make(chan int, 2) // 버퍼 채널\nch <- 42; val := <-ch",
    example: `package main

import (
    "fmt"
    "time"
)

func worker(id int, ch chan<- string) {
    time.Sleep(50 * time.Millisecond)
    ch <- fmt.Sprintf("Worker %d done", id) // 송신
}

func main() {
    ch := make(chan string, 2) // 버퍼 크기 2 채널

    go worker(1, ch)
    go worker(2, ch)

    // select 문으로 다중 채널 이벤트 처리
    for i := 0; i < 2; i++ {
        select {
        case msg := <-ch:
            fmt.Println("Received:", msg)
        case <-time.After(200 * time.Millisecond):
            fmt.Println("Timeout!")
        }
    }
}`,
    explanation: "\"메모리를 공유해서 통신하지 말고, 통신을 통해 메모리를 공유하라(Do not communicate by sharing memory; instead, share memory by communicating)\"는 Go 동시성의 불변 원칙입니다.",
    pitfalls: "버퍼가 없는 채널에 수신자가 없는데 데이터를 보내려고 하면 프로그램 전체가 영원히 멈추는 데드락(Deadlock)에 빠집니다.",
    practice: "문제: 일반 OS 스레드(수 MB)와 달리 Go의 고루틴은 초기 생성 시 대략 몇 KB의 작은 스택 메모리만 차지할까요?\n정답: 약 2KB"
  },
  {
    id: "go-generics",
    title: "16. Go 제네릭 (Generics, 타입 매개변수)",
    category: "고급 문법",
    summary: "Go 1.18에서 도입된 제네릭은 타입 매개변수 [T any]를 사용해 중복 코드 없이 다양한 타입을 안전하게 처리하는 컴포넌트를 작성할 수 있습니다.",
    syntax: "func Map[T, U any](ts []T, f func(T) U) []U { ... }\ntype Stack[T any] struct { items []T }",
    example: `package main

import "fmt"

// 제네릭 인터페이스 제약 (숫자 타입들)
type Number interface {
    int | int64 | float64
}

// 제네릭 함수: 어떤 숫자 타입이든 합산 가능
func Sum[T Number](items []T) T {
    var total T
    for _, v := range items {
        total += v
    }
    return total
}

func main() {
    ints := []int{1, 2, 3, 4}
    floats := []float64{1.5, 2.5, 3.0}

    fmt.Println("Int Sum:", Sum(ints))       // 10
    fmt.Println("Float Sum:", Sum(floats))   // 7.0
}`,
    explanation: "any 제약은 모든 타입을 허용하고, comparable 제약은 == 연산이 가능한 타입을 뜻하며, int | float64 처럼 파이프(|)로 유니온 타입 셋 제약을 만들 수 있습니다.",
    pitfalls: "메서드 자체에는 별도의 독립 타입 매개변수를 추가할 수 없으며, 구조체 정의 수준의 타입 매개변수를 메서드가 받아 사용해야 합니다.",
    practice: "문제: Go 제네릭에서 == 및 != 비교 연산이 가능한 타입들만을 허용하는 내장 제약 조건 키워드는 무엇일까요?\n정답: comparable"
  }
];
