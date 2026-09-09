package main

// TODO(step-2): Node, Statement, Expression 인터페이스 및 AST 노드 구조체(Program, Let, If, While, Infix 등) 정의
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

type Program struct {
	Statements []Statement
}

func (p *Program) String() string {
	return ""
}
