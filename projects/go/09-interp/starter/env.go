package main

import "io"

type Value interface {
	Type() string
	Inspect() string
}

type Environment struct {
	store map[string]Value
	outer *Environment
	out   io.Writer
}

func NewEnvironment(outer *Environment, out io.Writer) *Environment {
	return &Environment{outer: outer, out: out}
}
