package main

type Lexer struct {
	input        string
	position     int  // 현재 문자 위치
	readPosition int  // 다음 읽을 문자 위치
	ch           byte // 현재 검사 중인 문자
	line         int  // 현재 줄 번호
}

func NewLexer(input string) *Lexer {
	l := &Lexer{input: input, line: 1}
	l.readChar()
	return l
}

func (l *Lexer) readChar() {
	if l.readPosition >= len(l.input) {
		l.ch = 0
	} else {
		l.ch = l.input[l.readPosition]
	}
	l.position = l.readPosition
	l.readPosition++
}

func (l *Lexer) peekChar() byte {
	if l.readPosition >= len(l.input) {
		return 0
	}
	return l.input[l.readPosition]
}

func (l *Lexer) skipWhitespaceAndComments() {
	for {
		// 공백 문자 건너뛰기
		for l.ch == ' ' || l.ch == '\t' || l.ch == '\n' || l.ch == '\r' {
			if l.ch == '\n' {
				l.line++
			}
			l.readChar()
		}
		// 단일행 주석 // 건너뛰기
		if l.ch == '/' && l.peekChar() == '/' {
			for l.ch != '\n' && l.ch != 0 {
				l.readChar()
			}
		} else {
			break
		}
	}
}

func (l *Lexer) NextToken() Token {
	var tok Token

	l.skipWhitespaceAndComments()

	curLine := l.line
	switch l.ch {
	case '=':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			tok = Token{Type: EQ, Literal: string(ch) + string(l.ch), Line: curLine}
		} else {
			tok = Token{Type: ASSIGN, Literal: string(l.ch), Line: curLine}
		}
	case '+':
		tok = Token{Type: PLUS, Literal: string(l.ch), Line: curLine}
	case '-':
		tok = Token{Type: MINUS, Literal: string(l.ch), Line: curLine}
	case '!':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			tok = Token{Type: NOT_EQ, Literal: string(ch) + string(l.ch), Line: curLine}
		} else {
			tok = Token{Type: BANG, Literal: string(l.ch), Line: curLine}
		}
	case '/':
		tok = Token{Type: SLASH, Literal: string(l.ch), Line: curLine}
	case '*':
		tok = Token{Type: ASTERISK, Literal: string(l.ch), Line: curLine}
	case '%':
		tok = Token{Type: PERCENT, Literal: string(l.ch), Line: curLine}
	case '<':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			tok = Token{Type: LTE, Literal: string(ch) + string(l.ch), Line: curLine}
		} else {
			tok = Token{Type: LT, Literal: string(l.ch), Line: curLine}
		}
	case '>':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			tok = Token{Type: GTE, Literal: string(ch) + string(l.ch), Line: curLine}
		} else {
			tok = Token{Type: GT, Literal: string(l.ch), Line: curLine}
		}
	case '&':
		if l.peekChar() == '&' {
			ch := l.ch
			l.readChar()
			tok = Token{Type: AND, Literal: string(ch) + string(l.ch), Line: curLine}
		} else {
			tok = Token{Type: ILLEGAL, Literal: string(l.ch), Line: curLine}
		}
	case '|':
		if l.peekChar() == '|' {
			ch := l.ch
			l.readChar()
			tok = Token{Type: OR, Literal: string(ch) + string(l.ch), Line: curLine}
		} else {
			tok = Token{Type: ILLEGAL, Literal: string(l.ch), Line: curLine}
		}
	case ';':
		tok = Token{Type: SEMICOLON, Literal: string(l.ch), Line: curLine}
	case ',':
		tok = Token{Type: COMMA, Literal: string(l.ch), Line: curLine}
	case '(':
		tok = Token{Type: LPAREN, Literal: string(l.ch), Line: curLine}
	case ')':
		tok = Token{Type: RPAREN, Literal: string(l.ch), Line: curLine}
	case '{':
		tok = Token{Type: LBRACE, Literal: string(l.ch), Line: curLine}
	case '}':
		tok = Token{Type: RBRACE, Literal: string(l.ch), Line: curLine}
	case '"':
		tok.Type = STRING
		tok.Literal = l.readString()
		tok.Line = curLine
		return tok
	case 0:
		tok.Literal = ""
		tok.Type = EOF
		tok.Line = curLine
	default:
		if isLetter(l.ch) {
			tok.Literal = l.readIdentifier()
			tok.Type = LookupIdent(tok.Literal)
			tok.Line = curLine
			return tok
		} else if isDigit(l.ch) {
			tok.Type = INT
			tok.Literal = l.readNumber()
			tok.Line = curLine
			return tok
		} else {
			tok = Token{Type: ILLEGAL, Literal: string(l.ch), Line: curLine}
		}
	}

	l.readChar()
	return tok
}

func (l *Lexer) readIdentifier() string {
	position := l.position
	for isLetter(l.ch) || isDigit(l.ch) {
		l.readChar()
	}
	return l.input[position:l.position]
}

func (l *Lexer) readNumber() string {
	position := l.position
	for isDigit(l.ch) {
		l.readChar()
	}
	return l.input[position:l.position]
}

func (l *Lexer) readString() string {
	position := l.position + 1
	for {
		l.readChar()
		if l.ch == '"' || l.ch == 0 {
			break
		}
	}
	str := l.input[position:l.position]
	l.readChar() // 따옴표 소비
	return str
}

func isLetter(ch byte) bool {
	return ('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || ch == '_'
}

func isDigit(ch byte) bool {
	return '0' <= ch && ch <= '9'
}
