package main

import "iter"

// Stack은 LIFO(Last-In-First-Out) 제네릭 스택이다.
type Stack[T any] struct {
	items []T
}

// NewStack은 빈 스택을 생성한다.
func NewStack[T any]() *Stack[T] {
	return &Stack[T]{items: make([]T, 0)}
}

// Push는 스택의 맨 위에 값을 추가한다.
func (s *Stack[T]) Push(v T) {
	s.items = append(s.items, v)
}

// Pop은 스택의 맨 위 값을 꺼내 반환한다. 비어있으면 제로값과 false를 반환한다.
func (s *Stack[T]) Pop() (T, bool) {
	if len(s.items) == 0 {
		var zero T
		return zero, false
	}
	idx := len(s.items) - 1
	val := s.items[idx]
	var zero T
	s.items[idx] = zero // 메모리 누수 방지
	s.items = s.items[:idx]
	return val, true
}

// Peek는 스택의 맨 위 값을 제거하지 않고 반환한다. 비어있으면 제로값과 false를 반환한다.
func (s *Stack[T]) Peek() (T, bool) {
	if len(s.items) == 0 {
		var zero T
		return zero, false
	}
	return s.items[len(s.items)-1], true
}

// Len은 스택에 저장된 요소의 개수를 반환한다.
func (s *Stack[T]) Len() int {
	return len(s.items)
}

// IsEmpty는 스택이 비어있는지 확인한다.
func (s *Stack[T]) IsEmpty() bool {
	return len(s.items) == 0
}

// All은 Go 1.23+ 표준 iter.Seq 이터레이터로, 스택의 맨 위(Top)부터 바닥까지 순회한다.
func (s *Stack[T]) All() iter.Seq[T] {
	return func(yield func(T) bool) {
		for i := len(s.items) - 1; i >= 0; i-- {
			if !yield(s.items[i]) {
				return
			}
		}
	}
}
