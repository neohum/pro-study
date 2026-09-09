package main

import (
	"bytes"
	"strings"
	"testing"
)

func TestLexer(t *testing.T) {
	input := `let five = 5;
let ten = 10;
// 이것은 주석입니다
let add = 5 + 10;
if (five < ten && !false) {
    print "hello world";
}
`
	tests := []struct {
		expectedType    TokenType
		expectedLiteral string
	}{
		{LET, "let"},
		{IDENT, "five"},
		{ASSIGN, "="},
		{INT, "5"},
		{SEMICOLON, ";"},
		{LET, "let"},
		{IDENT, "ten"},
		{ASSIGN, "="},
		{INT, "10"},
		{SEMICOLON, ";"},
		{LET, "let"},
		{IDENT, "add"},
		{ASSIGN, "="},
		{INT, "5"},
		{PLUS, "+"},
		{INT, "10"},
		{SEMICOLON, ";"},
		{IF, "if"},
		{LPAREN, "("},
		{IDENT, "five"},
		{LT, "<"},
		{IDENT, "ten"},
		{AND, "&&"},
		{BANG, "!"},
		{FALSE, "false"},
		{RPAREN, ")"},
		{LBRACE, "{"},
		{PRINT, "print"},
		{STRING, "hello world"},
		{SEMICOLON, ";"},
		{RBRACE, "}"},
		{EOF, ""},
	}

	l := NewLexer(input)
	for i, tt := range tests {
		tok := l.NextToken()
		if tok.Type != tt.expectedType {
			t.Fatalf("tests[%d] 토큰 타입 불일치: 기대 %q, 실제 %q", i, tt.expectedType, tok.Type)
		}
		if tok.Literal != tt.expectedLiteral {
			t.Fatalf("tests[%d] 리터럴 불일치: 기대 %q, 실제 %q", i, tt.expectedLiteral, tok.Literal)
		}
	}
}

func TestParserExpressions(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"-a * b", "((-a) * b);"},
		{"!-a", "(!(-a));"},
		{"a + b + c", "((a + b) + c);"},
		{"a + b - c", "((a + b) - c);"},
		{"a * b * c", "((a * b) * c);"},
		{"a * b / c", "((a * b) / c);"},
		{"a + b / c", "(a + (b / c));"},
		{"a + b * c + d / e - f", "(((a + (b * c)) + (d / e)) - f);"},
		{"5 > 4 == 3 < 4", "((5 > 4) == (3 < 4));"},
		{"5 < 4 != 3 > 4", "((5 < 4) != (3 > 4));"},
		{"3 + 4 * 5 == 3 * 1 + 4 * 5", "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)));"},
		{"true == true", "(true == true);"},
		{"true != false", "(true != false);"},
		{"true && false || true", "((true && false) || true);"},
		{"(1 + 2) * 3", "((1 + 2) * 3);"},
	}

	for _, tt := range tests {
		l := NewLexer(tt.input)
		p := NewParser(l)
		program := p.ParseProgram()
		if len(p.Errors()) > 0 {
			t.Fatalf("파서 에러 (%s): %v", tt.input, p.Errors())
		}
		actual := program.String()
		if actual != tt.expected {
			t.Errorf("파싱 AST 불일치 (%s):\n기대: %q\n실제: %q", tt.input, tt.expected, actual)
		}
	}
}

func testEval(input string) Value {
	l := NewLexer(input)
	p := NewParser(l)
	prog := p.ParseProgram()
	env := NewEnvironment(nil, nil)
	return Eval(prog, env)
}

func TestEvalInteger(t *testing.T) {
	tests := []struct {
		input    string
		expected int64
	}{
		{"5", 5},
		{"10", 10},
		{"-5", -5},
		{"-10", -10},
		{"5 + 5 + 5 + 5 - 10", 10},
		{"2 * 2 * 2 * 2 * 2", 32},
		{"-50 + 100 + -50", 0},
		{"5 * 2 + 10", 20},
		{"5 + 2 * 10", 25},
		{"20 + 2 * -10", 0},
		{"50 / 2 * 2 + 10", 60},
		{"2 * (5 + 10)", 30},
		{"3 * 3 * 3 + 10", 37},
		{"3 * (3 * 3) + 10", 37},
		{"(5 + 10 * 2 + 15 / 3) * 2 + -10", 50},
		{"17 % 5", 2},
	}

	for _, tt := range tests {
		evaluated := testEval(tt.input)
		intVal, ok := evaluated.(*IntValue)
		if !ok {
			t.Fatalf("기대 IntValue, 실제 %T (%v)", evaluated, evaluated)
		}
		if intVal.Value != tt.expected {
			t.Errorf("결과 불일치 (%s): 기대 %d, 실제 %d", tt.input, tt.expected, intVal.Value)
		}
	}
}

func TestEvalBooleanAndConditionals(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
	}{
		{"true", true},
		{"false", false},
		{"1 < 2", true},
		{"1 > 2", false},
		{"1 < 1", false},
		{"1 == 1", true},
		{"1 != 1", false},
		{"1 == 2", false},
		{"1 != 2", true},
		{"true == true", true},
		{"false == false", true},
		{"true == false", false},
		{"true != false", true},
		{"(1 < 2) == true", true},
		{"(1 > 2) == false", true},
		{"true && true", true},
		{"true && false", false},
		{"false || true", true},
		{"!true", false},
		{"!false", true},
	}

	for _, tt := range tests {
		evaluated := testEval(tt.input)
		boolVal, ok := evaluated.(*BoolValue)
		if !ok {
			t.Fatalf("기대 BoolValue, 실제 %T (%v)", evaluated, evaluated)
		}
		if boolVal.Value != tt.expected {
			t.Errorf("결과 불일치 (%s): 기대 %t, 실제 %t", tt.input, tt.expected, boolVal.Value)
		}
	}
}

func TestEvalVariableScopeAndWhile(t *testing.T) {
	code := `
let x = 1;
let sum = 0;
while (x <= 5) {
    sum = sum + x;
    x = x + 1;
}
sum;
`
	evaluated := testEval(code)
	intVal, ok := evaluated.(*IntValue)
	if !ok {
		t.Fatalf("기대 IntValue, 실제 %T (%v)", evaluated, evaluated)
	}
	if intVal.Value != 15 {
		t.Fatalf("while 누적합 불일치: 기대 15, 실제 %d", intVal.Value)
	}
}

func TestRunScriptAndPrint(t *testing.T) {
	var buf bytes.Buffer
	code := `
let name = "Go";
print("Hello " + name);
let a = 10;
let b = 20;
if (a < b) {
    print("a is less than b");
}
`
	err := RunScript(code, &buf)
	if err != nil {
		t.Fatalf("RunScript 실행 실패: %v", err)
	}
	output := buf.String()
	if !strings.Contains(output, "Hello Go") {
		t.Fatalf("출력에 'Hello Go' 누락: %q", output)
	}
	if !strings.Contains(output, "a is less than b") {
		t.Fatalf("출력에 'a is less than b' 누락: %q", output)
	}
}

func TestMainExecution(t *testing.T) {
	var stdout, stderr bytes.Buffer
	code := run([]string{"-e", "let a = 10; let b = 20; print(a + b);"}, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("기대 종료 코드 0, 실제 %d (stderr: %s)", code, stderr.String())
	}
	if !strings.Contains(stdout.String(), "30") {
		t.Fatalf("출력에 '30' 누락: %s", stdout.String())
	}

	stdout.Reset()
	stderr.Reset()
	code = run(nil, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("기본 데모 실행 실패: code=%d", code)
	}
	if !strings.Contains(stdout.String(), "15") {
		t.Fatalf("기본 데모 출력에 '15' 누락: %s", stdout.String())
	}
}
