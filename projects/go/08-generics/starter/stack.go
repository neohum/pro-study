package main

import "iter"

// TODO(step-1): Stack[T any] 자료구조와 Push, Pop, Peek, Len, IsEmpty, All(iter.Seq) 구현
type Stack[T any] struct {
	items []T
}

func NewStack[T any]() *Stack[T] {
	return &Stack[T]{}
}

func (s *Stack[T]) Push(v T) {
	_ = v
}

func (s *Stack[T]) Pop() (T, bool) {
	var zero T
	return zero, false
}

func (s *Stack[T]) Peek() (T, bool) {
	var zero T
	return zero, false
}

func (s *Stack[T]) Len() int {
	return 0
}

func (s *Stack[T]) IsEmpty() bool {
	return true
}

func (s *Stack[T]) All() iter.Seq[T] {
	return func(yield func(T) bool) {
		_ = yield
	}
}
