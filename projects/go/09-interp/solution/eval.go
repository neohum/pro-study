package main

import (
	"fmt"
)

var (
	ValNil   = &NilValue{}
	ValTrue  = &BoolValue{Value: true}
	ValFalse = &BoolValue{Value: false}
)

func Eval(node Node, env *Environment) Value {
	switch n := node.(type) {
	case *Program:
		return evalProgram(n, env)
	case *BlockStatement:
		return evalBlockStatement(n, env)
	case *ExpressionStatement:
		return Eval(n.Expression, env)
	case *LetStatement:
		val := Eval(n.Value, env)
		if isError(val) {
			return val
		}
		env.Define(n.Name, val)
		return val
	case *AssignStatement:
		val := Eval(n.Value, env)
		if isError(val) {
			return val
		}
		if !env.Set(n.Name, val) {
			return newError("정의되지 않은 변수에 대입: %s", n.Name)
		}
		return val
	case *PrintStatement:
		val := Eval(n.Expression, env)
		if isError(val) {
			return val
		}
		if env.out != nil {
			fmt.Fprintln(env.out, val.Inspect())
		}
		return ValNil
	case *IfStatement:
		return evalIfStatement(n, env)
	case *WhileStatement:
		return evalWhileStatement(n, env)
	case *PrefixExpression:
		right := Eval(n.Right, env)
		if isError(right) {
			return right
		}
		return evalPrefixExpression(n.Operator, right)
	case *InfixExpression:
		left := Eval(n.Left, env)
		if isError(left) {
			return left
		}
		right := Eval(n.Right, env)
		if isError(right) {
			return right
		}
		return evalInfixExpression(n.Operator, left, right)
	case *IntegerLiteral:
		return &IntValue{Value: n.Value}
	case *StringLiteral:
		return &StringValue{Value: n.Value}
	case *BooleanLiteral:
		if n.Value {
			return ValTrue
		}
		return ValFalse
	case *NilLiteral:
		return ValNil
	case *Identifier:
		return evalIdentifier(n, env)
	}

	return newError("알 수 없는 노드 타입: %T", node)
}

func evalProgram(program *Program, env *Environment) Value {
	var result Value = ValNil
	for _, statement := range program.Statements {
		result = Eval(statement, env)
		if isError(result) {
			return result
		}
	}
	return result
}

func evalBlockStatement(block *BlockStatement, env *Environment) Value {
	var result Value = ValNil
	for _, statement := range block.Statements {
		result = Eval(statement, env)
		if isError(result) {
			return result
		}
	}
	return result
}

func evalIfStatement(ie *IfStatement, env *Environment) Value {
	condition := Eval(ie.Condition, env)
	if isError(condition) {
		return condition
	}

	if isTruthy(condition) {
		// 블록 스코프
		blockEnv := NewEnvironment(env, env.out)
		return Eval(ie.Consequence, blockEnv)
	} else if ie.Alternative != nil {
		blockEnv := NewEnvironment(env, env.out)
		return Eval(ie.Alternative, blockEnv)
	}

	return ValNil
}

func evalWhileStatement(we *WhileStatement, env *Environment) Value {
	var result Value = ValNil
	for {
		cond := Eval(we.Condition, env)
		if isError(cond) {
			return cond
		}
		if !isTruthy(cond) {
			break
		}
		// 반복문 내부 블록 스코프
		blockEnv := NewEnvironment(env, env.out)
		result = Eval(we.Body, blockEnv)
		if isError(result) {
			return result
		}
	}
	return result
}

func evalIdentifier(node *Identifier, env *Environment) Value {
	if val, ok := env.Get(node.Value); ok {
		return val
	}
	return newError("식별자를 찾을 수 없음: %s", node.Value)
}

func evalPrefixExpression(operator string, right Value) Value {
	switch operator {
	case "!":
		return evalBangOperatorExpression(right)
	case "-":
		return evalMinusPrefixOperatorExpression(right)
	default:
		return newError("알 수 없는 전위 연산자: %s%s", operator, right.Type())
	}
}

func evalBangOperatorExpression(right Value) Value {
	if isTruthy(right) {
		return ValFalse
	}
	return ValTrue
}

func evalMinusPrefixOperatorExpression(right Value) Value {
	if right.Type() != "INT" {
		return newError("정수가 아닌 타입에 음수 부호 불가: -%s", right.Type())
	}
	value := right.(*IntValue).Value
	return &IntValue{Value: -value}
}

func evalInfixExpression(operator string, left, right Value) Value {
	if left.Type() == "INT" && right.Type() == "INT" {
		return evalIntegerInfixExpression(operator, left, right)
	}
	// 문자열 결합 지원 (STRING + STRING 또는 STRING + INT)
	if operator == "+" && (left.Type() == "STRING" || right.Type() == "STRING") {
		return &StringValue{Value: left.Inspect() + right.Inspect()}
	}
	if left.Type() == "STRING" && right.Type() == "STRING" {
		switch operator {
		case "==":
			return nativeBoolToBooleanObject(left.(*StringValue).Value == right.(*StringValue).Value)
		case "!=":
			return nativeBoolToBooleanObject(left.(*StringValue).Value != right.(*StringValue).Value)
		}
	}
	if left.Type() == "BOOL" && right.Type() == "BOOL" {
		lVal := left.(*BoolValue).Value
		rVal := right.(*BoolValue).Value
		switch operator {
		case "==":
			return nativeBoolToBooleanObject(lVal == rVal)
		case "!=":
			return nativeBoolToBooleanObject(lVal != rVal)
		case "&&":
			return nativeBoolToBooleanObject(lVal && rVal)
		case "||":
			return nativeBoolToBooleanObject(lVal || rVal)
		}
	}
	switch operator {
	case "==":
		return nativeBoolToBooleanObject(left == right)
	case "!=":
		return nativeBoolToBooleanObject(left != right)
	}

	return newError("지원되지 않는 연산자 또는 타입 불일치: %s %s %s", left.Type(), operator, right.Type())
}

func evalIntegerInfixExpression(operator string, left, right Value) Value {
	leftVal := left.(*IntValue).Value
	rightVal := right.(*IntValue).Value

	switch operator {
	case "+":
		return &IntValue{Value: leftVal + rightVal}
	case "-":
		return &IntValue{Value: leftVal - rightVal}
	case "*":
		return &IntValue{Value: leftVal * rightVal}
	case "/":
		if rightVal == 0 {
			return newError("0으로 나눌 수 없습니다")
		}
		return &IntValue{Value: leftVal / rightVal}
	case "%":
		if rightVal == 0 {
			return newError("0으로 나눈 나머지를 구할 수 없습니다")
		}
		return &IntValue{Value: leftVal % rightVal}
	case "<":
		return nativeBoolToBooleanObject(leftVal < rightVal)
	case "<=":
		return nativeBoolToBooleanObject(leftVal <= rightVal)
	case ">":
		return nativeBoolToBooleanObject(leftVal > rightVal)
	case ">=":
		return nativeBoolToBooleanObject(leftVal >= rightVal)
	case "==":
		return nativeBoolToBooleanObject(leftVal == rightVal)
	case "!=":
		return nativeBoolToBooleanObject(leftVal != rightVal)
	default:
		return newError("알 수 없는 정수 연산자: %s %s %s", left.Type(), operator, right.Type())
	}
}

func isTruthy(val Value) bool {
	if val == ValNil {
		return false
	}
	if val == ValFalse {
		return false
	}
	if val == ValTrue {
		return true
	}
	if intVal, ok := val.(*IntValue); ok {
		return intVal.Value != 0
	}
	return true
}

func nativeBoolToBooleanObject(input bool) *BoolValue {
	if input {
		return ValTrue
	}
	return ValFalse
}

func newError(format string, a ...any) *ErrorValue {
	return &ErrorValue{Message: fmt.Sprintf(format, a...)}
}

func isError(val Value) bool {
	if val != nil {
		return val.Type() == "ERROR"
	}
	return false
}
