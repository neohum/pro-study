package main

import "iter"

// TODO(step-2): Queue[T any] 자료구조와 Enqueue, Dequeue, Peek, Len, IsEmpty, All(iter.Seq) 구현
type Queue[T any] struct {
	items []T
	head  int
}

func NewQueue[T any]() *Queue[T] {
	return &Queue[T]{}
}

func (q *Queue[T]) Enqueue(v T) {
	_ = v
}

func (q *Queue[T]) Dequeue() (T, bool) {
	var zero T
	return zero, false
}

func (q *Queue[T]) Peek() (T, bool) {
	var zero T
	return zero, false
}

func (q *Queue[T]) Len() int {
	return 0
}

func (q *Queue[T]) IsEmpty() bool {
	return true
}

func (q *Queue[T]) All() iter.Seq[T] {
	return func(yield func(T) bool) {
		_ = yield
	}
}
