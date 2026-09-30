/**
 * scripts/curriculum-grammars/rust_grammar.js
 * Rust 언어 핵심 문법 16개 종합 학습 콘텐츠
 */

module.exports = [
  {
    id: "rust-vars-mutability",
    title: "1. 변수 가변성 (let vs let mut)과 섀도잉",
    category: "기초 문법",
    summary: "Rust의 변수는 기본적으로 '불변(Immutable)'입니다. 값을 변경하려면 let mut 키워드를 명시해야 합니다. 같은 이름으로 새 변수를 덮어쓰는 섀도잉(Shadowing)도 지원합니다.",
    syntax: "let x = 5;       // 불변 변수\nlet mut y = 10;  // 가변 변수\nlet x = x + 1;   // 섀도잉 (타입 변경 가능)",
    example: `fn main() {
    let x = 5;
    // x = 6; // 컴파일 에러! (불변 변수에 재할당 불가)

    let mut count = 0;
    count += 1;
    println!("Count: {}", count);

    // 섀도잉(Shadowing): 같은 이름으로 새로운 변수 선언
    let spaces = "   ";          // &str 타입
    let spaces = spaces.len();    // usize 타입으로 전환!
    println!("Spaces count: {}", spaces);
}`,
    explanation: "불변성이 기본값이므로 멀티스레드 환경에서도 데이터 레이스가 발생하지 않으며, 섀도잉을 쓰면 mut 변수를 쓰지 않고도 타입 변환을 깔끔하게 처리할 수 있습니다.",
    pitfalls: "mut 변수는 값을 바꿀 수 있지만 '타입'을 바꿀 수는 없습니다. 타입을 바꾸려면 섀도잉(let 키워드 재선언)을 사용해야 합니다.",
    practice: "문제: Rust에서 변수를 가변(수정 가능)으로 선언할 때 let 뒤에 붙이는 키워드는 무엇일까요?\n정답: mut (let mut)"
  },
  {
    id: "rust-data-types",
    title: "2. 기본 스칼라 타입과 복합 타입 (튜플, 배열)",
    category: "기초 문법",
    summary: "스칼라 타입(i32, u64, f64, bool, char)과 여러 값을 묶는 복합 타입인 튜플((T1, T2))과 고정 크기 스택 배열([T; N])을 지원합니다.",
    syntax: "let tup: (i32, f64, u8) = (500, 6.4, 1);\nlet arr: [i32; 5] = [1, 2, 3, 4, 5];",
    example: `fn main() {
    let ch = '🦀'; // 4바이트 유니코드 스칼라 값 char
    let is_active = true;

    // 튜플과 구조 분해 (Destructuring)
    let point = (10, 20.5, "Origin");
    let (x, y, label) = point;
    println!("Point: x={}, y={}, label={}, direct={}", x, y, label, point.0);

    // 고정 크기 배열
    let numbers = [10, 20, 30, 40, 50];
    let first = numbers[0];
    let len = numbers.len();
    println!("First: {}, Length: {}", first, len);
}`,
    explanation: "Rust의 char는 C/Go와 달리 1바이트가 아니라 4바이트 크기이므로 한글이나 이모지(🦀)도 단일 문자로 완벽히 표현할 수 있습니다.",
    pitfalls: "Rust의 고정 크기 배열 [T; N]은 스택에 할당되며 크기가 컴파일 타임에 확정되어야 합니다. 가변 길이 배열이 필요하면 Vec<T>를 써야 합니다.",
    practice: "문제: 튜플 (10, \"Rust\")에서 두 번째 원소에 접근하는 인덱스 접근 표현식은 무엇일까요?\n정답: tuple.1"
  },
  {
    id: "rust-functions-expressions",
    title: "3. 함수와 문(Statement) vs 식(Expression)",
    category: "함수와 스코프",
    summary: "Rust는 식(Expression) 지향 언어입니다. 세미콜론(;)을 붙이지 않은 블록의 마지막 표현식은 자동으로 함수의 반환값이 됩니다.",
    syntax: "fn function_name(param: Type) -> ReturnType {\n    expr // 끝에 세미콜론이 없으면 암시적 return!\n}",
    example: `fn add(a: i32, b: i32) -> i32 {
    a + b // 끝에 세미콜론(;)이 없으므로 a + b 결과가 자동 반환됨!
}

fn main() {
    let result = add(5, 7);
    println!("5 + 7 = {}", result);

    // 코드 블록 자체가 하나의 '식(Expression)'
    let y = {
        let x = 3;
        x * 2 // 이 블록은 6으로 평가됨
    };
    println!("y = {}", y); // 6
}`,
    explanation: "문(Statement)은 어떤 동작을 수행하고 값을 반환하지 않으며 세미콜론으로 끝납니다. 반면 식(Expression)은 값을 계산하여 남기며 세미콜론이 없습니다.",
    pitfalls: "a + b 뒤에 실수로 세미콜론(;)을 붙여 a + b; 로 쓰면 반환값이 튜플 빈 값 () 즉 유닛 타입이 되어 타입 불일치 컴파일 에러가 발생합니다.",
    practice: "문제: Rust에서 아무런 값도 반환하지 않는 함수의 기본 리턴 타입(유닛 타입) 표기는 무엇일까요?\n정답: () (빈 괄호)"
  },
  {
    id: "rust-control-flow",
    title: "4. 제어 흐름 (if 표현식, loop의 값 반환, for in)",
    category: "제어 흐름",
    summary: "if 문도 식(Expression)이므로 변수에 결과를 직접 대입할 수 있습니다. loop는 break와 함께 루프의 결과값을 외부로 반환할 수 있습니다.",
    syntax: "let x = if cond { 1 } else { 2 };\nlet res = loop { if done { break val; } };\nfor item in collection { ... }",
    example: `fn main() {
    let condition = true;
    // 1. if 삼항 표현식
    let number = if condition { 5 } else { 6 };
    println!("Number: {}", number);

    // 2. loop에서 break로 값 반환
    let mut counter = 0;
    let result = loop {
        counter += 1;
        if counter == 10 {
            break counter * 2; // 루프 밖으로 20을 반환!
        }
    };
    println!("Result from loop: {}", result);

    // 3. for in 범위 반복 (1부터 4까지)
    for i in 1..5 {
        print!("{} ", i);
    }
    println!();
}`,
    explanation: "Rust에서는 C 스타일의 for (int i=0; i<n; i++) 대신 항상 컬렉션이나 범위 객체(1..5, 1..=5)를 순회하는 안전한 for in 루프를 사용합니다.",
    pitfalls: "if let number = if cond { 5 } else { \"six\" }; 처럼 if와 else 블록의 반환 타입이 다르면 컴파일 에러가 발생합니다.",
    practice: "문제: 1부터 5까지 끝값 5를 '포함'하여 반복하는 Rust의 포함 범위 연산자는 무엇일까요?\n정답: 1..=5 (= 등호 포함)"
  },
  {
    id: "rust-ownership-basics",
    title: "5. 소유권(Ownership) 3대 법칙과 이동(Move)",
    category: "메모리와 소유권",
    summary: "가비지 컬렉터 없이 컴파일 타임에 메모리 안전성을 달성하는 Rust의 핵심 메커니즘입니다. 1) 각 값은 소유자(변수)가 있고, 2) 소유자는 단 하나이며, 3) 소유자가 스코프를 벗어나면 자동 drop(해제)됩니다.",
    syntax: "let s1 = String::from(\"hello\");\nlet s2 = s1; // s1의 소유권이 s2로 이동(Move)! s1은 무효화됨",
    example: `fn main() {
    let s1 = String::from("Rust");
    let s2 = s1; // 소유권 이동 (Move)! s1은 이제 유효하지 않음

    // println!("{}", s1); // 컴파일 에러! borrow of moved value: s1
    println!("s2 owns the string: {}", s2);

    // 완전 복제를 원할 때는 명시적 clone()
    let s3 = s2.clone();
    println!("s2: {}, s3: {}", s2, s3);

    take_ownership(s3);
    // println!("{}", s3); // take_ownership 함수로 소유권이 넘어가 drop됨!
}

fn take_ownership(s: String) {
    println!("Owned: {}", s);
} // s는 여기서 스코프를 벗어나 메모리가 자동 해제됨!`,
    explanation: "힙에 저장된 String 데이터의 소유권이 이동(Move)하면 얕은 복사 후 이전 변수가 무효화되므로 C++의 치명적인 Double Free 오류가 원천 차단됩니다.",
    pitfalls: "정수(i32)나 bool 같은 고정 크기 스택 타입은 Copy 트레이트가 구현되어 있어 이동하지 않고 자동 복사됩니다. String이나 Vec 같은 힙 데이터만 Move가 일어납니다.",
    practice: "문제: Rust에서 소유자가 스코프(})를 벗어날 때 힙 메모리를 해제하기 위해 호출되는 메서드는 무엇일까요?\n정답: drop()"
  },
  {
    id: "rust-borrowing-references",
    title: "6. 참조와 빌림(Borrowing: & vs &mut)",
    category: "메모리와 소유권",
    summary: "소유권을 넘기지 않고 값을 일시적으로 참조(&)하는 것을 '빌림'이라 합니다. 1) 불변 참조(&T)는 여러 개 가능, 2) 가변 참조(&mut T)는 단 1개만 가능(데이터 레이스 방지)이라는 대여 검사기 규칙이 적용됩니다.",
    syntax: "fn calculate_len(s: &String) -> usize { s.len() } // 불변 빌림\nfn append(s: &mut String) { s.push_str(\"!\"); }     // 가변 빌림",
    example: `fn main() {
    let mut s = String::from("hello");

    // 1. 불변 빌림 (&)
    let len = calculate_length(&s);
    println!("Length of '{}' is {}", s, len); // s는 여전히 유효!

    // 2. 가변 빌림 (&mut)
    change(&mut s);
    println!("Changed: {}", s); // hello, world!
}

fn calculate_length(s: &String) -> usize {
    s.len()
} // s의 참조만 빌렸으므로 원본은 drop되지 않음!

fn change(some_string: &mut String) {
    some_string.push_str(", world!");
}`,
    explanation: "불변 참조(&)가 살아있는 동안에는 가변 참조(&mut)를 동시에 만들 수 없습니다. 이를 통해 멀티스레드 환경에서 읽기와 쓰기가 충돌하는 동시성 버그를 컴파일 타임에 완벽히 차단합니다.",
    pitfalls: "같은 스코프에서 &mut 참조를 2개 이상 동시에 생성하려고 하면 컴파일러의 대여 검사기(Borrow Checker)가 즉시 거부합니다.",
    practice: "문제: 불변 참조(&)가 유효한 동안 가변 참조(&mut)를 생성하는 것은 허용될까요?\n정답: 허용되지 않습니다 (데이터 레이스 방지 규칙)"
  },
  {
    id: "rust-slices",
    title: "7. 슬라이스 타입 (&str, &[T])",
    category: "데이터 구조",
    summary: "슬라이스는 컬렉션 전체가 아닌 연속된 일부분의 메모리를 가리키는 참조 뷰(View)입니다. 포인터와 길이로 구성되어 소유권을 가지지 않습니다.",
    syntax: "let slice: &str = &s[0..5];\nlet arr_slice: &[i32] = &arr[1..3];",
    example: `fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i]; // 공백 전까지의 부분 슬라이스 반환
        }
    }
    &s[..] // 공백이 없으면 전체 문자열 슬라이스
}

fn main() {
    let message = String::from("hello world");
    let word = first_word(&message);
    println!("First word: '{}'", word);

    let numbers = [10, 20, 30, 40, 50];
    let num_slice: &[i32] = &numbers[1..4]; // [20, 30, 40]
    println!("Slice len: {}, first: {}", num_slice.len(), num_slice[0]);
}`,
    explanation: "문자열 리터럴 \"hello\"는 바이너리에 포함된 불변 문자열 슬라이스(&'static str)입니다. 함수의 매개변수로 &String 대신 &str을 받으면 String과 리터럴을 모두 유연하게 처리할 수 있습니다.",
    pitfalls: "슬라이스는 원본 데이터를 가리키고 있으므로, 슬라이스가 유효한 동안 원본 컬렉션을 수정(clear(), push() 등)하면 컴파일 에러가 발생합니다.",
    practice: "문제: String 타입의 소유권을 넘기지 않고 읽기 전용 문자열 뷰로 함수에 전달할 때 권장되는 타입은 무엇일까요?\n정답: &str"
  },
  {
    id: "rust-structs-impl",
    title: "8. 구조체(struct)와 impl 메서드 블록",
    category: "데이터 구조",
    summary: "관련된 데이터를 묶어 구조체를 정의하고, impl 블록을 통해 인스턴스 메서드(&self)와 정적 생성자(연관 함수 Self)를 구현합니다.",
    syntax: "struct Name { field: Type }\nimpl Name {\n    fn new(...) -> Self { ... }\n    fn method(&self) { ... }\n}",
    example: `struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // 연관 함수 (생성자 패턴)
    fn new(width: u32, height: u32) -> Self {
        Rectangle { width, height }
    }

    // 인스턴스 메서드 (&self로 인스턴스를 빌려옴)
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

fn main() {
    let rect1 = Rectangle::new(30, 50);
    let rect2 = Rectangle::new(10, 40);

    println!("Area: {} sq pixels", rect1.area());
    println!("Can hold rect2? {}", rect1.can_hold(&rect2));
}`,
    explanation: "메서드의 첫 번째 매개변수가 self이면 소유권을 가져가고, &self이면 불변 빌림, &mut self이면 인스턴스의 필드를 수정할 수 있는 가변 빌림입니다.",
    pitfalls: "필드 이름과 생성자 매개변수 이름이 같을 때는 Rectangle { width: width } 대신 Rectangle { width } 처럼 축약 문법을 쓸 수 있습니다.",
    practice: "문제: impl 블록 안에서 생성자처럼 self 매개변수 없이 타입 자체에 연결된 함수를 무엇이라 부를까요?\n정답: 연관 함수 (Associated Function)"
  },
  {
    id: "rust-enums-option",
    title: "9. 열거형(Enum)과 Null 없는 세상의 Option<T>",
    category: "데이터 구조",
    summary: "Rust의 열거형은 데이터를 직접 품을 수 있는 강력한 대수적 데이터 타입(Algebraic Data Type)입니다. 널(Null) 포인터 대신 Option<T> (Some(T) 또는 None)을 사용합니다.",
    syntax: "enum Option<T> {\n    Some(T),\n    None,\n}",
    example: `enum WebEvent {
    PageLoad,
    KeyPress(char),
    Click { x: i64, y: i64 },
}

fn divide(numerator: f64, denominator: f64) -> Option<f64> {
    if denominator == 0.0 {
        None // 0 나눗셈은 실패(None)
    } else {
        Some(numerator / denominator) // 성공 시 값 포장
    }
}

fn main() {
    let result = divide(10.0, 2.0);
    match result {
        Some(val) => println!("Success: {}", val),
        None => println!("Cannot divide by zero!"),
    }

    let empty = divide(5.0, 0.0);
    println!("Unwrap or default: {}", empty.unwrap_or(0.0));
}`,
    explanation: "Rust에는 Null이 없으므로 NullPointerException이 발생하지 않습니다. 값이 존재하지 않을 수 있는 모든 상황은 Option<T> 타입으로 강제되어 컴파일러가 확인을 요구합니다.",
    pitfalls: "None 상태인 Option에 무작정 .unwrap()을 호출하면 프로그램이 패닉(Panic)을 일으키며 종료되므로, unwrap_or()나 match를 쓰는 것이 안전합니다.",
    practice: "문제: Option<T> 열거형이 가질 수 있는 두 가지 variant는 무엇일까요?\n정답: Some(T)와 None"
  },
  {
    id: "rust-pattern-matching",
    title: "10. 강력한 패턴 매칭 (match와 if let)",
    category: "제어 흐름",
    summary: "match 문은 모든 가능한 경우의 수를 컴파일러가 빈틈없이 검사(Exhaustive check)하며, 단일 패턴만 간결하게 검사할 때는 if let 문법을 사용합니다.",
    syntax: "match val {\n    Pattern1 => expr1,\n    _ => default_expr,\n}\nif let Some(x) = opt { ... }",
    example: `enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(String), // 주(State) 이름을 담음
}

fn value_in_cents(coin: Coin) -> u32 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("Quarter from {}!", state);
            25
        }
    }
}

fn main() {
    let c = Coin::Quarter(String::from("Alaska"));
    println!("Cents: {}", value_in_cents(c));

    // if let 단축 문법: 특정 패턴 1개만 매칭할 때
    let config_max: Option<u8> = Some(100);
    if let Some(max) = config_max {
        println!("Max is configured to: {}", max);
    }
}`,
    explanation: "match 식은 가능한 모든 경우의 수를 처리하지 않으면 컴파일되지 않습니다. 밑줄(_) 와일드카드를 쓰면 나머지 모든 경우를 한 번에 처리할 수 있습니다.",
    pitfalls: "열거형에 새 항목을 추가했을 때 match 문에 해당 항목이 누락되면 컴파일러가 컴파일 에러를 띄워 런타임 누락 버그를 방지해 줍니다.",
    practice: "문제: match 문에서 나머지 처리되지 않은 모든 패턴을 대표하는 와일드카드 기호는 무엇일까요?\n정답: _ (밑줄)"
  },
  {
    id: "rust-error-handling",
    title: "11. Result<T, E>와 물음표(?) 전파 연산자",
    category: "에러 처리",
    summary: "복구 가능한 에러는 Result<T, E> (Ok(T) 또는 Err(E))로 반환합니다. 물음표(?) 연산자를 쓰면 에러 발생 시 호출자에게 즉시 에러를 반환(Early Return)합니다.",
    syntax: "enum Result<T, E> { Ok(T), Err(E) }\nlet val = risky_func()?; // 실패 시 즉시 Err 반환",
    example: `use std::fs::File;
use std::io::{self, Read};

// ? 연산자를 활용한 간결한 에러 전파 함수
fn read_username_from_file() -> Result<String, io::Error> {
    let mut file = File::open("username.txt")?; // 실패 시 즉시 Err 리턴
    let mut username = String::new();
    file.read_to_string(&mut username)?;       // 실패 시 즉시 Err 리턴
    Ok(username)
}

fn main() {
    match read_username_from_file() {
        Ok(name) => println!("Username: {}", name),
        Err(e) => println!("Failed to read username: {}", e),
    }
}`,
    explanation: "물음표(?) 연산자는 Ok(v)이면 감싸진 값을 꺼내어 주고, Err(e)이면 현재 함수를 즉시 중단하고 호출한 쪽으로 Err를 넘기는 우아한 문법 설탕(Syntactic sugar)입니다.",
    pitfalls: "? 연산자는 반환 타입이 Result 또는 Option인 함수 내부에서만 사용할 수 있습니다. main()에서 쓰려면 main() -> Result<(), E> 로 선언해야 합니다.",
    practice: "문제: Result 타입에서 성공과 실패를 나타내는 두 가지 variant는 무엇일까요?\n정답: Ok(T)와 Err(E)"
  },
  {
    id: "rust-collections",
    title: "12. 동적 컬렉션 (Vec<T>와 HashMap<K, V>)",
    category: "데이터 구조",
    summary: "힙에 저장되어 크기가 동적으로 늘어나는 연속 배열 Vec<T>와, 키-값 쌍을 해시 테이블로 매핑하는 HashMap<K, V>를 지원합니다.",
    syntax: "let mut v = Vec::new(); v.push(1);\nlet mut map = HashMap::new(); map.insert(\"k\", 1);",
    example: `use std::collections::HashMap;

fn main() {
    // 1. 벡터(Vec) 생성 및 조작
    let mut scores = vec![90, 85, 95];
    scores.push(100);
    for score in &scores {
        print!("{} ", score);
    }
    println!("\\nTotal count: {}", scores.len());

    // 2. 해시맵(HashMap)
    let mut map = HashMap::new();
    map.insert("Blue", 10);
    map.insert("Red", 50);

    // entry API로 키가 없을 때만 기본값 삽입
    map.entry("Yellow").or_insert(30);

    for (key, val) in &map {
        println!("{}: {}", key, val);
    }
}`,
    explanation: "vec![1, 2, 3] 매크로는 벡터를 간결하게 초기화해 주며, 해시맵의 entry().or_insert() API는 키가 없을 때만 원소를 넣는 안전한 패턴입니다.",
    pitfalls: "벡터의 원소를 반복문으로 순회(&scores)하는 도중에 scores.push()로 벡터를 수정하면 메모리 재할당으로 인한 포인터 무효화 방지 규칙에 의해 컴파일 에러가 발생합니다.",
    practice: "문제: Rust에서 벡터 리터럴을 편리하게 생성할 때 사용하는 표준 매크로는 무엇일까요?\n정답: vec![]"
  },
  {
    id: "rust-traits",
    title: "13. 트레이트 (Trait, 공통 동작 인터페이스)",
    category: "객체 지향",
    summary: "트레이트는 여러 타입이 공통으로 구현해야 하는 추상 인터페이스를 정의합니다. #[derive(...)] 매크로로 기본 트레이트를 자동 구현할 수도 있습니다.",
    syntax: "pub trait Summary {\n    fn summarize(&self) -> String;\n}\nimpl Summary for MyType { ... }",
    example: `pub trait Summary {
    fn summarize(&self) -> String {
        String::from("(Read more...)") // 기본 구현 제공 가능
    }
}

#[derive(Debug)] // Debug 트레이트 자동 구현!
struct Article {
    title: String,
    author: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("'{}' by {}", self.title, self.author)
    }
}

// 트레이트 바운드 함수
fn notify<T: Summary>(item: &T) {
    println!("Breaking news: {}", item.summarize());
}

fn main() {
    let article = Article {
        title: String::from("Rust 2026"),
        author: String::from("Ferris"),
    };
    notify(&article);
    println!("Debug print: {:?}", article);
}`,
    explanation: "Rust는 상속 대신 트레이트 기반 컴포지션을 사용합니다. 정적 디스패치(모노모피즘)를 통해 런타임 오버헤드 없이 제로 코스트 추상화를 실현합니다.",
    pitfalls: "println!(\"{:?}\", struct)로 구조체를 출력하려면 구조체 위에 반드시 #[derive(Debug)]를 추가해야 합니다.",
    practice: "문제: Rust에서 구조체에 디버그 출력({:?}) 기능을 자동으로 붙여주는 매크로 속성은 무엇일까요?\n정답: #[derive(Debug)]"
  },
  {
    id: "rust-lifetimes",
    title: "14. 라이프타임 (Lifetime 'a)",
    category: "메모리와 소유권",
    summary: "라이프타임은 모든 참조자가 유효성을 유지하는 스코프의 범위를 컴파일러에게 알려주어, 해제된 메모리를 가리키는 댕글링 포인터를 원천 차단합니다.",
    syntax: "fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {\n    if x.len() > y.len() { x } else { y }\n}",
    example: `// 두 참조자 중 더 긴 문자열 슬라이스를 반환하는 함수
// 반환되는 슬라이스의 유효 기간은 x와 y 중 더 짧은 쪽의 라이프타임 'a와 같음
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
        println!("Longest string: {}", result);
    }
    // string2가 스코프를 벗어난 뒤 result를 쓰면 컴파일 에러가 발생해 안전을 지킴!
}`,
    explanation: "라이프타임 문법('a)은 참조자의 수명을 늘리거나 변경하는 것이 아니라, 여러 참조자들 간의 수명 관계를 명시해 컴파일러가 안전성을 검증할 수 있도록 돕는 것입니다.",
    pitfalls: "함수 내부에서 생성된 로컬 String의 슬라이스를 바깥으로 반환하려고 하면 라이프타임 검사기가 'returns a value referencing data owned by the current function' 에러를 내며 차단합니다.",
    practice: "문제: 프로그램 전체 실행 기간 동안 영원히 유효한 정적 라이프타임을 나타내는 특별한 표기는 무엇일까요?\n정답: 'static"
  },
  {
    id: "rust-closures-iterators",
    title: "15. 클로저(|x| ...)와 이터레이터 체이닝",
    category: "함수형 프로그래밍",
    summary: "클로저는 주변 환경의 변수를 캡처할 수 있는 익명 함수입니다. 이터레이터의 map, filter, fold를 연결하여 고성능 함수형 처리를 수행합니다.",
    syntax: "let add_one = |x: i32| x + 1;\nlet v2: Vec<_> = v.iter().map(|x| x * 2).collect();",
    example: `fn main() {
    let factor = 3;
    // 바깥 환경의 factor 변수를 캡처하는 클로저
    let multiply = |x| x * factor;
    println!("Multiply 4 x 3 = {}", multiply(4));

    let numbers = vec![1, 2, 3, 4, 5, 6];

    // 이터레이터 체이닝: 짝수만 골라 10배한 뒤 새 벡터로 수집
    let doubled_evens: Vec<i32> = numbers
        .iter()
        .filter(|&&x| x % 2 == 0) // 짝수 필터
        .map(|&x| x * 10)         // 10배 매핑
        .collect();               // 수집

    println!("Doubled evens: {:?}", doubled_evens); // [20, 40, 60]
}`,
    explanation: "Rust의 이터레이터는 '지연 평가(Lazy Evaluation)'되므로 .collect() 같은 최종 소비 메서드를 호출하기 전까지는 실제 연산이 수행되지 않아 매우 빠릅니다.",
    pitfalls: "이터레이터를 map이나 filter로 변환한 뒤에는 반드시 .collect()를 호출해야 새 컬렉션으로 만들어집니다.",
    practice: "문제: 이터레이터의 요소들을 Vec 등의 컬렉션으로 모아 담는 최종 소비 메서드는 무엇일까요?\n정답: collect()"
  },
  {
    id: "rust-smart-pointers",
    title: "16. 스마트 포인터 (Box, Rc, RefCell)",
    category: "고급 문법",
    summary: "스마트 포인터는 단순한 메모리 주소를 넘어 추가적인 메타데이터와 자동 자원 관리 기능을 갖춘 데이터 구조입니다. Box(단일 소유), Rc(참조 카운팅), RefCell(내부 가변성) 등이 있습니다.",
    syntax: "let b = Box::new(5); // 힙에 단일 값 할당\nlet r = Rc::new(data); // 여러 소유자 공유",
    example: `use std::rc::Rc;
use std::cell::RefCell;

fn main() {
    // 1. Box<T>: 힙에 데이터 저장 (재귀적 데이터 구조에 필수)
    let boxed_val = Box::new(42);
    println!("Boxed value: {}", *boxed_val);

    // 2. Rc<RefCell<T>>: 다중 소유자 + 내부 가변성 패턴
    let shared_data = Rc::new(RefCell::new(10));

    let clone1 = Rc::clone(&shared_data);
    let clone2 = Rc::clone(&shared_data);

    // clone1을 통해 내부 값 변경
    *clone1.borrow_mut() += 5;
    *clone2.borrow_mut() += 20;

    println!("Final shared value: {}", shared_data.borrow()); // 35
    println!("Rc strong count: {}", Rc::strong_count(&shared_data)); // 3
}`,
    explanation: "Box<T>는 크기가 컴파일 타임에 정해지지 않는 재귀적 타입(예: 연결 리스트, 트리)을 구현할 때 필수적입니다. Rc는 단일 스레드용 다중 소유권을 지원합니다.",
    pitfalls: "멀티스레드 환경에서는 Rc<T> 대신 스레드 안전한 Arc<T>(Atomic Reference Counting)와 Mutex<T>를 사용해야 합니다.",
    practice: "문제: 힙 메모리에 단일 데이터를 할당하고 고유 소유권을 가지는 가장 기본적인 스마트 포인터 타입은 무엇일까요?\n정답: Box<T>"
  }
];
