package main

import (
	"io"
	"strconv"
)

type Value interface {
	Type() string
	Inspect() string
}

type IntValue struct {
	Value int64
}

func (i *IntValue) Type() string    { return "INT" }
func (i *IntValue) Inspect() string { return strconv.FormatInt(i.Value, 10) }

type StringValue struct {
	Value string
}

func (s *StringValue) Type() string    { return "STRING" }
func (s *StringValue) Inspect() string { return s.Value }

type BoolValue struct {
	Value bool
}

func (b *BoolValue) Type() string    { return "BOOL" }
func (b *BoolValue) Inspect() string { return strconv.FormatBool(b.Value) }

type NilValue struct{}

func (n *NilValue) Type() string    { return "NIL" }
func (n *NilValue) Inspect() string { return "nil" }

type ErrorValue struct {
	Message string
}

func (e *ErrorValue) Type() string    { return "ERROR" }
func (e *ErrorValue) Inspect() string { return "ERROR: " + e.Message }

type Environment struct {
	store map[string]Value
	outer *Environment
	out   io.Writer
}

func NewEnvironment(outer *Environment, out io.Writer) *Environment {
	if out == nil && outer != nil {
		out = outer.out
	}
	return &Environment{
		store: make(map[string]Value),
		outer: outer,
		out:   out,
	}
}

func (e *Environment) Get(name string) (Value, bool) {
	obj, ok := e.store[name]
	if !ok && e.outer != nil {
		return e.outer.Get(name)
	}
	return obj, ok
}

func (e *Environment) Set(name string, val Value) bool {
	if _, ok := e.store[name]; ok {
		e.store[name] = val
		return true
	}
	if e.outer != nil {
		return e.outer.Set(name, val)
	}
	return false
}

func (e *Environment) Define(name string, val Value) {
	e.store[name] = val
}
