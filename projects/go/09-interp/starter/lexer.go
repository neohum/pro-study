package main

// TODO(step-1): Lexer 구조체와 readChar, NextToken, skipWhitespace, readIdentifier, readNumber 구현
type Lexer struct {
	input        string
	position     int
	readPosition int
	ch           byte
	line         int
}

func NewLexer(input string) *Lexer {
	return &Lexer{input: input, line: 1}
}

func (l *Lexer) NextToken() Token {
	return Token{Type: EOF}
}
