/**
 * scripts/curriculum-grammars/typescript_grammar.js
 * TypeScript (5.x 최신 표준) 핵심 문법 16개 종합 학습 콘텐츠
 */

module.exports = [
  {
    id: "ts-basic-types",
    title: "1. 정적 기본 타입과 any vs unknown vs never",
    category: "기초 문법",
    summary: "JavaScript의 기본 타입에 정적 타입 어노테이션(: type)을 부여합니다. any(타입 검사 비활성화), unknown(안전한 최상위 타입), never(절대 발생하지 않는 값)의 차이를 이해해야 합니다.",
    syntax: "let age: number = 25;\nlet name: string = \"TypeScript\";\nlet u: unknown = 42;\nlet n: never;",
    example: `// 기본 원시 타입
let count: number = 42;
let username: string = "Alice";
let isDone: boolean = false;
let scores: number[] = [90, 85, 100]; // 배열
let tuple: [string, number] = ["Rank", 1]; // 튜플

// any vs unknown
let dangerousAny: any = "hello";
dangerousAny.nonExistingMethod(); // 컴파일 통과 (런타임 크래시 위험!)

let safeUnknown: unknown = "hello";
// safeUnknown.toUpperCase(); // 컴파일 에러! (타입 검사 강제)
if (typeof safeUnknown === "string") {
    console.log(safeUnknown.toUpperCase()); // 안전하게 검사 후 사용!
}

// never: 절대 반환되지 않는 함수
function throwError(msg: string): never {
    throw new Error(msg);
}`,
    explanation: "unknown은 any와 마찬가지로 모든 값을 받을 수 있지만, 타입 좁히기(Type Narrowing)를 거치기 전에는 어떤 연산이나 메서드 호출도 컴파일러가 차단하므로 훨씬 안전합니다.",
    pitfalls: "any를 남용하면 TypeScript를 쓰는 의미가 완전히 사라집니다. 타입을 알 수 없는 외부 데이터에는 항상 unknown을 사용하는 것이 모범 관례입니다.",
    practice: "문제: 모든 타입의 상위 타입이지만, 타입을 확인하기 전에는 사용을 금지하는 안전한 타입 키워드는 무엇일까요?\n정답: unknown"
  },
  {
    id: "ts-inference-assertions",
    title: "2. 타입 추론과 타입 단언 (as Type)",
    category: "기초 문법",
    summary: "TypeScript는 초기화 값을 바탕으로 변수 타입을 스스로 똑똑하게 추론(Type Inference)합니다. 개발자가 컴파일러보다 타입에 대해 더 확실히 알고 있을 때 as 단언을 씁니다.",
    syntax: "let x = 3; // number로 자동 추론\nconst el = document.getElementById(\"app\") as HTMLDivElement;",
    example: `// 1. 타입 추론 (명시적 타입 어노테이션 생략 가능)
let message = "Hello TS"; // string으로 자동 추론됨
// message = 123; // 컴파일 에러! Type 'number' is not assignable to type 'string'

// 2. 타입 단언 (Type Assertion)
interface User {
    id: number;
    name: string;
}

// JSON 파싱 결과는 any이므로 단언 활용
const rawJson = '{"id": 1, "name": "Bob"}';
const user = JSON.parse(rawJson) as User;
console.log(\`User: \${user.name} (#\${user.id})\`);

// 3. Non-null 단언 연산자 (!)
const heading = document.getElementById("title")!; // null이 아님을 확신할 때`,
    explanation: "타입 단언(as)은 런타임에 실제 객체 형태를 변환하는 것이 아니며, 오직 컴파일러의 타입 체커에게 \"내가 이 타입을 보증한다\"고 전달하는 역할만 수행합니다.",
    pitfalls: "as 단언을 잘못 쓰면 실제 런타임 객체와 컴파일 타임 타입이 불일치하여 undefined 접근 크래시가 발생할 수 있습니다.",
    practice: "문제: 어떤 값이 null이나 undefined가 아님을 단언하기 위해 변수 뒤에 붙이는 느낌표 연산자의 이름은 무엇일까요?\n정답: Non-null 단언 연산자 (!)"
  },
  {
    id: "ts-interfaces",
    title: "3. 인터페이스(interface)와 선택적/읽기 전용 속성",
    category: "객체 타입",
    summary: "객체의 구조적 형태(Shape)를 정의하는 표준 방법입니다. 선택적 속성(?), 읽기 전용 속성(readonly), 인터페이스 상속(extends)을 지원합니다.",
    syntax: "interface User {\n    readonly id: number;\n    name: string;\n    email?: string; // 선택적 속성\n}\ninterface Admin extends User { role: string; }",
    example: `interface Product {
    readonly id: string; // 한 번 대입 후 수정 불가
    title: string;
    price: number;
    description?: string; // 있어도 되고 없어도 됨 (선택적)
}

interface DiscountedProduct extends Product {
    discountRate: number; // 속성 확장 상속
}

const book: DiscountedProduct = {
    id: "prod-101",
    title: "Learning TypeScript",
    price: 35000,
    discountRate: 0.1,
};

// book.id = "new-id"; // 컴파일 에러! Cannot assign to 'id' because it is a read-only property.
console.log(\`\${book.title}: \${book.price * (1 - book.discountRate)} KRW\`);`,
    explanation: "TypeScript는 명목적 타입이 아닌 '구조적 타이핑(Structural Typing)'을 사용하므로, 인터페이스에 명시된 요구 속성을 모두 갖춘 객체라면 어떤 객체든 호환됩니다.",
    pitfalls: "객체 리터럴을 인터페이스 변수에 직접 할당할 때는 정의되지 않은 초과 속성을 엄격히 검사(Excess Property Checks)하므로 선언되지 않은 필드를 넣으면 에러가 납니다.",
    practice: "문제: 인터페이스에서 있어도 되고 없어도 되는 선택적 속성을 지정할 때 필드명 뒤에 붙이는 기호는 무엇일까요?\n정답: ? (물음표)"
  },
  {
    id: "ts-type-aliases",
    title: "4. 타입 별칭(Type Alias)과 인터페이스 비교",
    category: "객체 타입",
    summary: "type 키워드는 원시값, 유니온, 튜플 등 모든 타입에 별칭을 부여할 수 있습니다. 객체 지향 상속과 선언 병합이 필요할 때는 interface, 유니온/튜플에는 type을 권장합니다.",
    syntax: "type ID = string | number;\ntype Point = { x: number; y: number };\ntype Callback = (data: string) => void;",
    example: `// 1. 유니온 타입 별칭
type Status = "pending" | "fulfilled" | "rejected";
type NumericID = number | string;

// 2. 튜플 및 함수 타입 별칭
type Coordinates = [number, number];
type EventListener = (event: string, code: number) => void;

// 3. 인터페이스의 고유 기능: 선언 병합(Declaration Merging)
interface WindowConfig {
    width: number;
}
interface WindowConfig {
    height: number; // 자동으로 합쳐짐!
}

const config: WindowConfig = { width: 1920, height: 1080 };
console.log(\`Resolution: \${config.width}x\${config.height}\`);`,
    explanation: "interface는 같은 이름으로 여러 번 선언하면 필드가 자동으로 병합되므로 라이브러리 API 확장에 적합합니다. type 별칭은 중복 선언 시 중복 식별자 에러가 발생합니다.",
    pitfalls: "유니온 타입(A | B)이나 매핑된 타입은 interface 키워드로 직접 선언할 수 없으며 반드시 type 별칭을 사용해야 합니다.",
    practice: "문제: 같은 이름으로 여러 번 정의했을 때 속성들이 하나로 자동으로 합쳐지는 선언 병합(Declaration Merging)을 지원하는 키워드는 무엇일까요?\n정답: interface"
  },
  {
    id: "ts-unions-intersections",
    title: "5. 유니온 타입(A | B)과 인터섹션 타입(A & B)",
    category: "고급 타입",
    summary: "유니온(|)은 'A 또는 B'의 타입을 허용하고, 인터섹션(&)은 'A의 모든 속성과 B의 모든 속성을 결합'한 타입을 만듭니다.",
    syntax: "type Response = SuccessResponse | ErrorResponse;\ntype Combined = Person & Loggable;",
    example: `interface Printable {
    print: () => void;
}
interface Loggable {
    log: () => void;
}

// 1. 인터섹션(&): 두 인터페이스의 속성을 모두 충족해야 함
type LoggerDevice = Printable & Loggable;

const device: LoggerDevice = {
    print: () => console.log("Printing doc..."),
    log: () => console.log("System log OK"),
};
device.print();

// 2. 판별된 유니온 (Discriminated Union): 공통 태그 프로퍼티로 구분
type NetworkState =
    | { state: "loading" }
    | { state: "failed"; code: number }
    | { state: "success"; response: { title: string } };

function render(s: NetworkState) {
    switch (s.state) {
        case "loading":
            return "Loading...";
        case "failed":
            return \`Error code: \${s.code}\`;
        case "success":
            return \`Data: \${s.response.title}\`;
    }
}`,
    explanation: "판별된 유니온(Discriminated Union) 패턴은 state 같은 공통 리터럴 속성을 두어, switch 문에서 각 경우의 데이터 필드를 100% 안전하게 타입 좁히기할 수 있는 가장 우아한 패턴입니다.",
    pitfalls: "유니온 타입 변수에 아무런 타입 가드 없이 접근하면, A와 B가 공통으로 가지고 있는 속성만 접근할 수 있습니다.",
    practice: "문제: 두 개 이상의 타입을 결합하여 모든 속성을 동시에 만족해야 하는 타입을 만들 때 사용하는 연산자는 무엇일까요?\n정답: & (인터섹션 연산자)"
  },
  {
    id: "ts-literal-types-const",
    title: "6. 리터럴 타입과 as const 불변 단언",
    category: "고급 타입",
    summary: "단순 string이나 number 대신 특정 문자열이나 숫자 값 자체를 타입으로 지정합니다. as const를 붙이면 모든 속성이 깊은 읽기 전용(Deep Readonly) 리터럴로 고정됩니다.",
    syntax: "type Direction = \"North\" | \"South\" | \"East\" | \"West\";\nconst config = { mode: \"dark\", port: 8080 } as const;",
    example: `// 1. 문자열 리터럴 타입
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function request(url: string, method: HttpMethod) {
    console.log(\`Request to \${url} with \${method}\`);
}

request("/api/users", "GET");
// request("/api/users", "PATCH"); // 컴파일 에러! "PATCH"는 허용되지 않음

// 2. as const (const 어서션)
const APP_CONFIG = {
    apiEndpoint: "https://api.prostudy.io",
    maxRetries: 3,
    features: ["offline", "sync"],
} as const;

// APP_CONFIG.maxRetries = 5; // 컴파일 에러! readonly property
console.log("Config loaded:", APP_CONFIG.apiEndpoint);`,
    explanation: "as const를 붙이지 않은 일반 객체 { mode: 'dark' }는 string 타입으로 넓혀지기(Widening) 때문에 리터럴 타입 매개변수에 넘기려 할 때 타입 불일치가 일어날 수 있습니다.",
    pitfalls: "객체를 함수의 리터럴 매개변수에 넘길 때 객체 프로퍼티가 string으로 추론되어 에러가 나면, 객체 선언 뒤에 as const를 붙여 리터럴로 고정하세요.",
    practice: "문제: 객체의 모든 프로퍼티를 가장 좁은 리터럴 타입이자 readonly로 단언하는 접미사 키워드는 무엇일까요?\n정답: as const"
  },
  {
    id: "ts-type-guards",
    title: "7. 타입 좁히기(Type Narrowing)와 사용자 정의 타입 가드 (is)",
    category: "고급 타입",
    summary: "넓은 유니온 타입을 typeof, instanceof, in 연산자 또는 사용자 정의 타입 서술어(param is Type)를 통해 특정 하위 타입으로 안전하게 좁혀나갑니다.",
    syntax: "function isFish(pet: Pet): pet is Fish {\n    return (pet as Fish).swim !== undefined;\n}",
    example: `// 1. typeof 및 in 연산자 타입 가드
function processInput(input: string | number | { name: string }) {
    if (typeof input === "string") {
        console.log("Uppercase:", input.toUpperCase());
    } else if (typeof input === "number") {
        console.log("Doubled:", input * 2);
    } else if ("name" in input) {
        console.log("Object name:", input.name);
    }
}

// 2. 사용자 정의 타입 가드 (pet is Fish)
interface Fish { swim: () => void }
interface Bird { fly: () => void }

function isFish(pet: Fish | Bird): pet is Fish {
    return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
    if (isFish(pet)) {
        pet.swim(); // Fish로 안전하게 좁혀짐!
    } else {
        pet.fly();  // Bird로 좁혀짐!
    }
}`,
    explanation: "사용자 정의 타입 가드 함수의 반환 타입인 'pet is Fish'는 이 함수가 true를 리턴할 경우 해당 조건문 블록 내부에서 pet 변수를 Fish 타입으로 취급하라고 컴파일러에게 지시합니다.",
    pitfalls: "사용자 정의 타입 가드 함수 내부의 불리언 판별 로직을 잘못 작성하면 컴파일러는 타입이 맞다고 속게 되어 런타임 에러가 발생할 수 있습니다.",
    practice: "문제: 사용자 정의 타입 가드 함수에서 반환형 자리에 작성하는 특수 문법 키워드는 무엇일까요?\n정답: is (예: val is TargetType)"
  },
  {
    id: "ts-functions-overloads",
    title: "8. 함수 타입 선언과 함수 오버로딩 (Overloads)",
    category: "함수와 스코프",
    summary: "매개변수의 개수나 타입에 따라 서로 다른 반환 타입을 가지는 함수를 만들 때 함수 오버로드 시그니처들을 선언하고 단 하나의 구현체로 처리합니다.",
    syntax: "function makeDate(timestamp: number): Date;\nfunction makeDate(m: number, d: number, y: number): Date;\nfunction makeDate(mOrTimestamp: number, d?: number, y?: number): Date { ... }",
    example: `// 오버로드 시그니처 1: 숫자 2개 합
function combine(a: number, b: number): number;
// 오버로드 시그니처 2: 문자열 2개 연결
function combine(a: string, b: string): string;

// 실제 구현체 시그니처 (외부에서는 호출 불가)
function combine(a: any, b: any): any {
    return a + b;
}

const numResult = combine(10, 20);     // 반환 타입: number (30)
const strResult = combine("Hello ", "TS"); // 반환 타입: string ("Hello TS")
// const err = combine(10, "TS"); // 컴파일 에러! 일치하는 오버로드 없음

console.log(numResult, strResult);`,
    explanation: "오버로드 시그니처들은 외부 호출자에게 공개되는 실제 계약 목록이며, 구현체 함수는 모든 오버로드의 매개변수와 반환 타입을 포괄할 수 있는 범용 시그니처를 가집니다.",
    pitfalls: "구현체 함수의 매개변수 타입은 외부에서 직접 호출할 수 없습니다. 오버로드 목록에 없는 조합(예: number와 string 조합)은 컴파일 에러가 발생합니다.",
    practice: "문제: TypeScript에서 함수 오버로딩 구현 시 실제 함수 본문(Body)을 가진 구현체는 몇 개 작성해야 할까요?\n정답: 1개 (구현체는 반드시 하나만 작성)"
  },
  {
    id: "ts-generics-basics",
    title: "9. 제네릭 기초 (Generic Functions & Interfaces)",
    category: "제네릭",
    summary: "타입을 마치 함수의 매개변수처럼 전달받아, 다양한 타입에 대해 재사용 가능하면서도 타입 안전성을 100% 보존하는 소프트웨어 컴포넌트를 만듭니다.",
    syntax: "function identity<T>(arg: T): T { return arg; }\ninterface Box<T> { content: T; }",
    example: `// 1. 제네릭 함수
function getFirstElement<T>(arr: T[]): T | undefined {
    return arr[0];
}

const num = getFirstElement([1, 2, 3]);       // T는 number로 자동 추론!
const str = getFirstElement(["a", "b", "c"]); // T는 string으로 자동 추론!
console.log(num, str);

// 2. 제네릭 인터페이스
interface ApiResponse<TData> {
    status: number;
    success: boolean;
    data: TData;
}

interface UserProfile {
    id: number;
    name: string;
}

const response: ApiResponse<UserProfile> = {
    status: 200,
    success: true,
    data: { id: 101, name: "Alice" },
};
console.log("Response User:", response.data.name);`,
    explanation: "any를 쓰면 반환값의 타입 정보가 모두 유실되지만, 제네릭 <T>를 쓰면 입력 타입과 출력 타입 사이의 엄격한 연결 관계를 컴파일러가 그대로 추적합니다.",
    pitfalls: "제네릭 매개변수 <T>에 제약 조건이 없으면 T가 모든 타입일 수 있으므로 arg.length 처럼 특정 속성을 함부로 호출할 수 없습니다.",
    practice: "문제: 관례상 제네릭 타입 매개변수를 나타낼 때 가장 흔히 사용하는 단일 대문자 알파벳은 무엇일까요?\n정답: T (Type의 머리글자)"
  },
  {
    id: "ts-generic-constraints",
    title: "10. 제네릭 제약 조건 (extends)과 keyof 연산자",
    category: "제네릭",
    summary: "T extends Constraint 문법으로 제네릭에 들어올 수 있는 타입을 특정 인터페이스나 속성을 가진 것으로 제한하며, keyof로 객체의 키 집합을 추출합니다.",
    syntax: "function loggingIdentity<T extends Lengthwise>(arg: T): T { ... }\nfunction getProp<T, K extends keyof T>(obj: T, key: K): T[K] { ... }",
    example: `interface HasLength {
    length: number;
}

// T는 반드시 length 속성을 가져야만 함
function printLength<T extends HasLength>(item: T): number {
    console.log(\`Length is \${item.length}\`);
    return item.length;
}

printLength("Hello");       // string은 length가 있으므로 OK
printLength([1, 2, 3, 4]);  // array도 length가 있으므로 OK
// printLength(123);        // 컴파일 에러! number는 length가 없음

// keyof와 제네릭 제약 결합
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key]; // 완전히 타입 안전한 동적 프로퍼티 조회!
}

const person = { name: "Bob", age: 30 };
const age = getProperty(person, "age"); // 반환 타입: number
// getProperty(person, "email"); // 컴파일 에러! "email"은 person의 키가 아님`,
    explanation: "keyof T는 객체 타입 T의 모든 키들을 문자열 리터럴 유니온으로 반환합니다. K extends keyof T는 'K는 반드시 T의 키 중 하나여야 한다'는 강력한 제약입니다.",
    pitfalls: "keyof { a: 1, b: 2 } 의 결과는 'a' | 'b' 유니온 타입입니다. 존재하지 않는 키를 전달하면 런타임이 아니라 컴파일 타임에 즉시 차단됩니다.",
    practice: "문제: 객체 타입의 모든 프로퍼티 키를 유니온 리터럴 타입으로 추출해 내는 연산자 키워드는 무엇일까요?\n정답: keyof"
  },
  {
    id: "ts-mapped-types",
    title: "11. 매핑된 타입 (Mapped Types)과 인덱스 시그니처",
    category: "고급 타입",
    summary: "기존 타입의 프로퍼티 목록을 순회([K in Keys])하여 새로운 변형된 타입을 생성합니다. 임의의 키를 허용할 때는 인덱스 시그니처를 사용합니다.",
    syntax: "type OptionsFlags<T> = { [Property in keyof T]: boolean };\ntype Dictionary = { [key: string]: number };",
    example: `// 1. 인덱스 시그니처 (동적 키 딕셔너리)
interface ScoreBoard {
    [playerName: string]: number; // 어떤 문자열 키든 숫자를 매핑
}
const scores: ScoreBoard = { Alice: 95, Bob: 80 };
scores.Charlie = 88;

// 2. 매핑된 타입: 모든 필드를 읽기 전용 또는 불리언 플래그로 변환
interface Features {
    darkMode: () => void;
    autoSave: () => void;
}

type FeatureFlags<T> = {
    [K in keyof T]?: boolean; // 모든 프로퍼티를 선택적 boolean으로 변환!
};

const userSettings: FeatureFlags<Features> = {
    darkMode: true,
    // autoSave는 생략 가능
};
console.log("Settings:", userSettings);`,
    explanation: "매핑된 타입 문법 [K in keyof T]는 JavaScript의 for...in 루프처럼 동작하여, 타입 레벨에서 기존 인터페이스의 모든 키를 순회하며 새 타입을 빌드합니다.",
    pitfalls: "인덱스 시그니처 [key: string]: number 가 선언된 인터페이스에 name: string 처럼 다른 타입의 고정 필드를 추가하려고 하면 타입 충돌 에러가 납니다.",
    practice: "문제: 매핑된 타입에서 키를 순회할 때 사용하는 문법 키워드 쌍은 무엇일까요?\n정답: [K in Keys]"
  },
  {
    id: "ts-utility-types-1",
    title: "12. 핵심 내장 유틸리티 타입 1 (Partial, Required, Record)",
    category: "유틸리티 타입",
    summary: "TypeScript 표준 라이브러리가 제공하는 기본 유틸리티 타입입니다. Partial(모든 속성 선택화), Required(모든 속성 필수화), Readonly, Record(맵 매핑)를 지원합니다.",
    syntax: "type PartialUser = Partial<User>;\ntype PageRoles = Record<\"home\" | \"about\", string>;",
    example: `interface User {
    id: number;
    name: string;
    email: string;
}

// 1. Partial<T>: 모든 속성을 선택적(?)으로 변경 (업데이트 DTO에 최적)
function updateUser(id: number, fieldsToUpdate: Partial<User>) {
    console.log(\`Updating user #\${id} with:\`, fieldsToUpdate);
}
updateUser(1, { name: "Alice New" }); // email, id 생략 가능!

// 2. Readonly<T>: 모든 속성을 읽기 전용으로 동결
const immutableUser: Readonly<User> = {
    id: 1,
    name: "Original",
    email: "test@example.com",
};
// immutableUser.name = "Modified"; // 컴파일 에러!

// 3. Record<K, T>: 키 집합 K와 값 타입 T의 맵 구성
type Role = "admin" | "editor" | "viewer";
const permissions: Record<Role, string[]> = {
    admin: ["read", "write", "delete"],
    editor: ["read", "write"],
    viewer: ["read"],
};`,
    explanation: "Partial<T>는 { [P in keyof T]?: T[P] }로 구현되어 있습니다. 객체의 일부 속성만 전달받는 PATCH API 함수를 구현할 때 필수적으로 사용됩니다.",
    pitfalls: "Record<K, T>에서 K에 유니온을 지정했을 경우 모든 키에 대한 값이 빠짐없이 정의되지 않으면 컴파일 에러가 발생합니다.",
    practice: "문제: 기존 인터페이스의 모든 프로퍼티를 선택적(?)으로 바꾸어 주는 내장 유틸리티 타입은 무엇일까요?\n정답: Partial<T>"
  },
  {
    id: "ts-utility-types-2",
    title: "13. 핵심 내장 유틸리티 타입 2 (Pick, Omit, ReturnType)",
    category: "유틸리티 타입",
    summary: "Pick(특정 속성만 선택), Omit(특정 속성만 제외), Exclude(유니온에서 제거), ReturnType(함수의 반환 타입 추출)으로 기존 타입을 재가공합니다.",
    syntax: "type Preview = Pick<Article, \"title\" | \"author\">;\ntype CleanUser = Omit<User, \"passwordHash\">;\ntype FuncReturn = ReturnType<typeof fetchUsers>;",
    example: `interface Todo {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    createdAt: number;
}

// 1. Pick<T, K>: 원하는 속성만 쏙 뽑아내기
type TodoPreview = Pick<Todo, "id" | "title" | "completed">;
const preview: TodoPreview = { id: 1, title: "Study TS", completed: false };

// 2. Omit<T, K>: 특정 속성만 쏙 빼고 나머지 전부 유지
type TodoCreateDto = Omit<Todo, "id" | "createdAt">;
const newTodo: TodoCreateDto = {
    title: "New Task",
    description: "Important task",
    completed: false,
};

// 3. ReturnType<T>: 함수의 반환 타입 자동 추출
function createApiResponse() {
    return { status: 200, payload: ["data1", "data2"] };
}
type ApiResult = ReturnType<typeof createApiResponse>; // { status: number, payload: string[] }`,
    explanation: "ReturnType<typeof fn>은 복잡한 서드파티 라이브러리 함수가 반환하는 내부 타입을 직접 임포트할 수 없을 때 타입을 역추출하는 마법 같은 기법입니다.",
    pitfalls: "ReturnType<T>를 쓸 때 T 자리에는 함수 값 자체가 아니라 반드시 'typeof 함수이름' 형태의 함수 타입을 전달해야 합니다.",
    practice: "문제: 인터페이스에서 특정 프로퍼티들만 골라서 제외(제거)시키는 내장 유틸리티 타입은 무엇일까요?\n정답: Omit<T, Keys>"
  },
  {
    id: "ts-classes-modifiers",
    title: "14. 클래스와 접근 제한자 (public, private, protected)",
    category: "객체 지향",
    summary: "클래스 필드에 public(기본값, 전체 공개), private(클래스 내부만), protected(상속 자식만) 접근 제한자를 지정하고, 생성자 매개변수 프로퍼티로 한 번에 선언합니다.",
    syntax: "class Animal {\n    constructor(public name: string, private secret: string) {}\n}",
    example: `class Employee {
    // 생성자 매개변수 프로퍼티(Parameter Properties): 선언과 할당 동시 완료!
    constructor(
        public readonly id: number,   // 외부 읽기 가능, 수정 불가
        public name: string,          // 외부 자유 접근
        protected department: string, // 상속 자식만 접근 가능
        private salary: number        // Employee 내부에서만 접근 가능
    ) {}

    public getSalaryInfo(): string {
        return \`\${this.name}'s salary is confidential (\${this.salary})\`;
    }
}

class Manager extends Employee {
    public getDept(): string {
        return \`Manager of \${this.department}\`; // protected는 자식에서 OK!
    }
}

const emp = new Employee(1, "Alice", "R&D", 8000);
console.log(emp.name);
// console.log(emp.salary); // 컴파일 에러! Property 'salary' is private.
console.log(emp.getSalaryInfo());`,
    explanation: "constructor(public name: string) 처럼 생성자 인자에 접근 제한자를 붙이면, 별도의 this.name = name 할당 코드 없이 필드 선언과 초기화가 한 줄로 끝납니다.",
    pitfalls: "TypeScript의 private 키워드는 컴파일 타임 검사용이므로 JavaScript로 번역되면 일반 프로퍼티가 됩니다. 런타임 완전 은닉을 원하면 ES 표준 #private 문법을 써야 합니다.",
    practice: "문제: 생성자 매개변수 앞에 public이나 private을 붙여 클래스 필드 선언과 대입을 단번에 끝내는 문법을 무엇이라 부를까요?\n정답: 파라미터 프로퍼티 (Parameter Properties)"
  },
  {
    id: "ts-enums-const-enums",
    title: "15. 열거형(enum)과 컴파일 인라인 const enum",
    category: "데이터 구조",
    summary: "명명된 상수들의 집합을 정의하는 enum과, 컴파일 시 자바스크립트 객체를 생성하지 않고 실제 값으로 인라인 치환되어 번들 크기를 줄이는 const enum을 지원합니다.",
    syntax: "enum Direction { Up = \"UP\", Down = \"DOWN\" }\nconst enum LogLevel { Info, Warn, Error }",
    example: `// 1. 문자열 열거형
enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
}

// 2. const enum: 런타임 JS 객체 없이 코드가 숫자로 인라인 치환됨!
const enum Status {
    Active = 1,
    Inactive = 2,
}

function move(dir: Direction) {
    console.log(\`Moving \${dir}\`);
}

move(Direction.Up);
const currentStatus = Status.Active; // 컴파일 결과: const currentStatus = 1;
console.log("Current status:", currentStatus);`,
    explanation: "일반 enum은 컴파일 후 양방향 매핑(Reverse Mapping)을 가진 즉시 실행 함수(IIFE) 객체로 번역되지만, const enum은 번들링 시 완전히 인라인 숫자로 대체되어 오버헤드가 제로입니다.",
    pitfalls: "문자열 enum은 역방향 매핑(Direction['UP'])을 지원하지 않으며, Babel 같은 단일 파일 트랜스파일러 환경에서는 const enum 사용 시 옵션 설정에 주의해야 합니다.",
    practice: "문제: 런타임에 JavaScript 객체를 남기지 않고 순수 값으로 인라인 치환되는 가벼운 enum 키워드는 무엇일까요?\n정답: const enum"
  },
  {
    id: "ts-conditional-infer",
    title: "16. 조건부 타입(Conditional Types)과 infer 키워드",
    category: "고급 타입",
    summary: "타입 관계에 따라 분기(T extends U ? X : Y)하는 조건부 타입과, 조건이 참일 때 내부 타입을 추론하여 꺼내는 infer 키워드로 초고급 타입 프로그래밍을 수행합니다.",
    syntax: "type IsString<T> = T extends string ? \"yes\" : \"no\";\ntype ElementType<T> = T extends (infer U)[] ? U : T;",
    example: `// 1. 조건부 타입 기초
type TypeName<T> =
    T extends string ? "string" :
    T extends number ? "number" :
    T extends boolean ? "boolean" :
    "object";

type T0 = TypeName<string>;  // "string"
type T1 = TypeName<number[]>; // "object"

// 2. infer 키워드로 배열의 원소 타입 꺼내기
type Flatten<T> = T extends Array<infer ItemType> ? ItemType : T;

type StrArray = string[];
type UnpackedStr = Flatten<StrArray>; // string 으로 추출!
type PureNumber = Flatten<number>;   // number 그대로 유지

// 3. Promise의 resolve 타입 꺼내기 (Awaited의 원리)
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type Resolved = UnwrapPromise<Promise<{ id: number }>>; // { id: number }`,
    explanation: "infer U는 조건부 타입의 extends 검사 조건식 내부에서만 쓸 수 있으며, \"만약 T가 이 형태에 부합한다면, 그 자리에 있는 타입을 U라고 이름 붙이고 참 블록에서 쓰겠다\"는 의미입니다.",
    pitfalls: "조건부 타입에 유니온 타입을 전달하면 각 멤버별로 분배(Distributive Conditional Types)되어 평가된다는 점을 이해해야 합니다.",
    practice: "문제: 조건부 타입의 extends 절 안에서 타입을 추론하여 변수처럼 선언할 때 사용하는 키워드는 무엇일까요?\n정답: infer"
  }
];
