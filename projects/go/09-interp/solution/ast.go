package main

import (
	"fmt"
	"strings"
)

type Node interface {
	String() string
}

type Statement interface {
	Node
	statementNode()
}

type Expression interface {
	Node
	expressionNode()
}

// Program은 전체 AST의 루트 노드다.
type Program struct {
	Statements []Statement
}

func (p *Program) String() string {
	var sb strings.Builder
	for _, s := range p.Statements {
		sb.WriteString(s.String())
	}
	return sb.String()
}

// LetStatement: let <Name> = <Value>;
type LetStatement struct {
	Name  string
	Value Expression
}

func (ls *LetStatement) statementNode() {}
func (ls *LetStatement) String() string {
	if ls.Value != nil {
		return fmt.Sprintf("let %s = %s;", ls.Name, ls.Value.String())
	}
	return fmt.Sprintf("let %s;", ls.Name)
}

// AssignStatement: <Name> = <Value>;
type AssignStatement struct {
	Name  string
	Value Expression
}

func (as *AssignStatement) statementNode() {}
func (as *AssignStatement) String() string {
	return fmt.Sprintf("%s = %s;", as.Name, as.Value.String())
}

// ExpressionStatement: <Expression>;
type ExpressionStatement struct {
	Expression Expression
}

func (es *ExpressionStatement) statementNode() {}
func (es *ExpressionStatement) String() string {
	if es.Expression != nil {
		return es.Expression.String() + ";"
	}
	return ""
}

// BlockStatement: { <Statements> }
type BlockStatement struct {
	Statements []Statement
}

func (bs *BlockStatement) statementNode() {}
func (bs *BlockStatement) String() string {
	var sb strings.Builder
	sb.WriteString("{ ")
	for _, s := range bs.Statements {
		sb.WriteString(s.String() + " ")
	}
	sb.WriteString("}")
	return sb.String()
}

// IfStatement: if (Condition) Consequence else Alternative
type IfStatement struct {
	Condition   Expression
	Consequence *BlockStatement
	Alternative *BlockStatement
}

func (is *IfStatement) statementNode() {}
func (is *IfStatement) String() string {
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("if (%s) %s", is.Condition.String(), is.Consequence.String()))
	if is.Alternative != nil {
		sb.WriteString(fmt.Sprintf(" else %s", is.Alternative.String()))
	}
	return sb.String()
}

// WhileStatement: while (Condition) Body
type WhileStatement struct {
	Condition Expression
	Body      *BlockStatement
}

func (ws *WhileStatement) statementNode() {}
func (ws *WhileStatement) String() string {
	return fmt.Sprintf("while (%s) %s", ws.Condition.String(), ws.Body.String())
}

// PrintStatement: print <Expression>;
type PrintStatement struct {
	Expression Expression
}

func (ps *PrintStatement) statementNode() {}
func (ps *PrintStatement) String() string {
	return fmt.Sprintf("print %s;", ps.Expression.String())
}

// Identifier: 변수 이름
type Identifier struct {
	Value string
}

func (i *Identifier) expressionNode() {}
func (i *Identifier) String() string  { return i.Value }

// IntegerLiteral: 123
type IntegerLiteral struct {
	Value int64
}

func (il *IntegerLiteral) expressionNode() {}
func (il *IntegerLiteral) String() string  { return fmt.Sprintf("%d", il.Value) }

// StringLiteral: "abc"
type StringLiteral struct {
	Value string
}

func (sl *StringLiteral) expressionNode() {}
func (sl *StringLiteral) String() string  { return fmt.Sprintf("%q", sl.Value) }

// BooleanLiteral: true / false
type BooleanLiteral struct {
	Value bool
}

func (bl *BooleanLiteral) expressionNode() {}
func (bl *BooleanLiteral) String() string  { return fmt.Sprintf("%t", bl.Value) }

// NilLiteral: nil
type NilLiteral struct{}

func (nl *NilLiteral) expressionNode() {}
func (nl *NilLiteral) String() string  { return "nil" }

// PrefixExpression: -5, !true
type PrefixExpression struct {
	Operator string
	Right    Expression
}

func (pe *PrefixExpression) expressionNode() {}
func (pe *PrefixExpression) String() string {
	return fmt.Sprintf("(%s%s)", pe.Operator, pe.Right.String())
}

// InfixExpression: 5 + 5, x == y
type InfixExpression struct {
	Left     Expression
	Operator string
	Right    Expression
}

func (oe *InfixExpression) expressionNode() {}
func (oe *InfixExpression) String() string {
	return fmt.Sprintf("(%s %s %s)", oe.Left.String(), oe.Operator, oe.Right.String())
}
