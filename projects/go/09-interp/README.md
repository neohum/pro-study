# 09. 소형 스크립트 언어 인터프리터

## 무엇을 만드는가

텍스트 소스코드를 읽어 토큰으로 분해하고, 추상 구문 트리(AST)를 구성한 뒤, 스코프 환경을 관리하며 직접 코드를 실행하는 트리 워크(Tree-walking) 스크립트 언어 인터프리터다.

```
$ build/app.exe
=== 09-interp 스크립트 실행 데모 ===
x=1, 누적합=1
x=2, 누적합=3
x=3, 누적합=6
x=4, 누적합=10
x=5, 누적합=15
성공: 1부터 5까지의 합 = 15

$ build/app.exe -e 'let a = 10; let b = 20; print(a + b);'
30
```

## 왜 이 프로젝트인가

프로그래밍 언어의 내부 동작 원리를 이해하는 가장 확실한 방법은 인터프리터를 직접 밑바닥부터 작성해보는 것이다.

이 프로젝트를 통해 정규식 라이브러리나 외부 파서 생성기(yacc, ANTLR)에 의존하지 않고 순수 Go 표준 라이브러리만으로 렉서(Lexer), 재귀 하강 파서(Pratt Parser), AST 노드 계층, 환경(Environment) 기반 변수 바인딩 및 제어 흐름(조건문, 반복문) 실행기를 구축한다.

복잡한 데이터 구조 간의 상호작용과 Go 인터페이스를 활용한 다형성(Polymorphism)을 체득하는 고급 프로젝트다.

## 핵심 개념

### 어휘 분석(Lexing)과 상태 머신

렉서는 원시 문자열을 한 글자씩 전진하며 토큰(키워드, 식별자, 숫자, 연산자, 구분자) 단위로 분해한다.

```go
type Token struct {
    Type    TokenType
    Literal string
    Line    int
}
```

### 프랫 파싱(Pratt Parsing)과 연산자 우선순위

전위(Prefix) 연산자와 중위(Infix) 연산자의 우선순위(Precedence) 테이블을 기반으로 괄호와 사칙연산의 결합 법칙을 깔끔하게 해석한다.

```go
func (p *Parser) parseExpression(precedence int) Expression {
    prefix := p.prefixParseFns[p.curToken.Type]
    leftExp := prefix()

    for p.peekToken.Type != SEMICOLON && precedence < p.peekPrecedence() {
        infix := p.infixParseFns[p.peekToken.Type]
        p.nextToken()
        leftExp = infix(leftExp)
    }
    return leftExp
}
```

### 환경(Environment)과 중첩 스코프

변수와 값의 매핑을 저장하는 `Environment`는 바깥쪽 스코프(`outer`)를 포인터로 참조하여 중첩 블록(`{ ... }`)과 함수 스코프 체인을 형성한다.

```go
type Environment struct {
    store map[string]Value
    outer *Environment
    out   io.Writer
}

func (e *Environment) Get(name string) (Value, bool) {
    val, ok := e.store[name]
    if !ok && e.outer != nil {
        return e.outer.Get(name)
    }
    return val, ok
}
```

### 트리 워크 평가(Tree-walking Evaluation)

완성된 AST 노드를 순회하며 각각의 의미(Semantics)를 실행한다. `if` 조건문의 참/거짓 분기와 `while` 반복문의 루프 실행을 재귀 호출로 간단하고 직관적으로 구현한다.

```go
func Eval(node Node, env *Environment) Value {
    switch n := node.(type) {
    case *InfixExpression:
        left := Eval(n.Left, env)
        right := Eval(n.Right, env)
        return evalInfixExpression(n.Operator, left, right)
    // ...
    }
}
```

## 단계별 구현

각 단계는 `starter/` 폴더 내 소스코드의 `TODO(step-N)` 주석과 1:1로 일치한다.

### Step 1: Lexer와 Token

`token.go`에 토큰 타입 상수를 정의하고, `lexer.go`에서 소스코드를 스캔하여 공백과 주석을 건너뛰며 토큰 스트림을 생성하는 `NextToken`을 구현한다.

확인: 간단한 산술식 문자열이 올바른 토큰 슬라이스로 변환되는지 확인한다.

### Step 2: AST 구조체 정의

`ast.go`에서 `Node`, `Statement`, `Expression` 인터페이스를 선언하고, `LetStatement`, `AssignStatement`, `IfStatement`, `WhileStatement`, `InfixExpression` 등 AST 노드 타입을 정의한다.

확인: 노드 인스턴스를 만들고 `String()` 메서드로 출력되는 코드를 확인한다.

### Step 3: 재귀 하강 파서

`parser.go`에서 Pratt 파싱 기법을 적용하여 표현식 우선순위를 처리하고 문장(Statement)들을 AST로 묶는 `ParseProgram`을 구현한다.

확인: `1 + 2 * 3`이 `(1 + (2 * 3))` 형태로 우선순위에 맞게 파싱되는지 확인한다.

### Step 4: Environment와 Evaluator

`env.go`에서 스코프 체인을 관리하는 `Environment`를 작성하고, `eval.go`에서 정수 산술 연산, 불리언 논리 연산, 문자열 덧셈, 조건문 및 반복문을 처리하는 `Eval` 함수를 구현한다.

확인: 변수 선언 후 while 루프로 1부터 5까지 누적합이 15로 계산되는지 확인한다.

### Step 5: CLI 연동과 실행기

`main.go`에서 `-e` 플래그와 파일 경로 인자를 받아 스크립트를 실행하고, 인자가 없을 때는 기본 데모 코드를 실행하여 결과를 터미널에 출력하는 CLI를 완성한다.

확인: `app.exe -e "print(2 * 3 + 4);"` 실행 시 `10`이 출력되는지 확인한다.

## 막혔을 때

| 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| 연산자 우선순위가 무시되고 왼쪽부터 결합됨 | 파서 루프 조건에서 `precedence < p.peekPrecedence()` 부등호가 잘못 설정됨 | 현재 우선순위보다 다음 연산자의 우선순위가 높을 때만 결합하도록 확인한다 |
| 블록 내부 변수 변경이 블록 바깥에 반영되지 않음 | 변수 대입(`Set`) 시 상위 환경(`outer`)을 탐색하지 않고 현재 블록에만 썼음 | `Set` 구현에서 현재 스코프에 없으면 `outer.Set`을 재귀 호출한다 |
| 문자열과 숫자를 더할 때 타입 에러 발생 | 이항 연산자 평가기에서 혼합 타입을 거부함 | `+` 연산 시 한쪽이 문자열이면 반대쪽도 문자열로 변환하여 연결하도록 처리한다 |
| `while` 루프가 끝나지 않고 무한 반복됨 | 루프 조건식을 매 반복마다 다시 평가(`Eval`)하지 않고 고정된 값만 검사했음 | 루프 반복마다 `Eval(we.Condition, env)`를 호출해야 한다 |

## 더 나아가기

- 사용자 정의 함수(`fn(a, b) { return a + b; }`)와 클로저(Closure) 지원 추가하기
- 동적 배열(List)과 해시맵(Dict) 자료형 및 인덱싱(`arr[0]`) 문법 추가하기
- 대화형 인터랙티브 셸(REPL) 기능 추가하기

## 참고

- Thorsten Ball: Writing An Interpreter In Go (<https://interpreterbook.com/>)
- Bob Nystrom: Crafting Interpreters (<https://craftinginterpreters.com/>)
- Pratt Parsers: Expression Parsing Made Easy (<https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html>)
