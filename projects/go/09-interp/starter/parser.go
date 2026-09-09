package main

// TODO(step-3): Pratt 파서 기법을 적용한 Parser 구조체와 ParseProgram, parseExpression, parseStatement 구현
type Parser struct {
	l      *Lexer
	errors []string
}

func NewParser(l *Lexer) *Parser {
	return &Parser{l: l}
}

func (p *Parser) Errors() []string {
	return p.errors
}

func (p *Parser) ParseProgram() *Program {
	return &Program{}
}
