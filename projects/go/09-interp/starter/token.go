package main

type TokenType string

const (
	ILLEGAL = "ILLEGAL"
	EOF     = "EOF"

	IDENT  = "IDENT"
	INT    = "INT"
	STRING = "STRING"

	ASSIGN   = "="
	PLUS     = "+"
	MINUS    = "-"
	ASTERISK = "*"
	SLASH    = "/"
	PERCENT  = "%"
	BANG     = "!"

	EQ     = "=="
	NOT_EQ = "!="
	LT     = "<"
	LTE    = "<="
	GT     = ">"
	GTE    = ">="
	AND    = "&&"
	OR     = "||"

	COMMA     = ","
	SEMICOLON = ";"
	LPAREN    = "("
	RPAREN    = ")"
	LBRACE    = "{"
	RBRACE    = "}"

	LET   = "LET"
	IF    = "IF"
	ELSE  = "ELSE"
	WHILE = "WHILE"
	PRINT = "PRINT"
	TRUE  = "TRUE"
	FALSE = "FALSE"
	NIL   = "NIL"
)

type Token struct {
	Type    TokenType
	Literal string
	Line    int
}

var keywords = map[string]TokenType{
	"let":   LET,
	"if":    IF,
	"else":  ELSE,
	"while": WHILE,
	"print": PRINT,
	"true":  TRUE,
	"false": FALSE,
	"nil":   NIL,
}

func LookupIdent(ident string) TokenType {
	if tok, ok := keywords[ident]; ok {
		return tok
	}
	return IDENT
}
