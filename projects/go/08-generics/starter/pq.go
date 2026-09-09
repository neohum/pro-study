package main

import "cmp"

// TODO(step-3): PriorityQueue[T any]와 NewMinHeap/NewMaxHeap(cmp.Ordered 제약), Push, Pop, Peek, siftUp, siftDown 구현
type PriorityQueue[T any] struct {
	items []T
	less  func(a, b T) bool
}

func NewPriorityQueue[T any](less func(a, b T) bool) *PriorityQueue[T] {
	return &PriorityQueue[T]{less: less}
}

func NewMinHeap[T cmp.Ordered]() *PriorityQueue[T] {
	return NewPriorityQueue[T](func(a, b T) bool {
		return cmp.Compare(a, b) < 0
	})
}

func NewMaxHeap[T cmp.Ordered]() *PriorityQueue[T] {
	return NewPriorityQueue[T](func(a, b T) bool {
		return cmp.Compare(a, b) > 0
	})
}

func (pq *PriorityQueue[T]) Push(v T) {
	_ = v
}

func (pq *PriorityQueue[T]) Pop() (T, bool) {
	var zero T
	return zero, false
}

func (pq *PriorityQueue[T]) Peek() (T, bool) {
	var zero T
	return zero, false
}

func (pq *PriorityQueue[T]) Len() int {
	return 0
}

func (pq *PriorityQueue[T]) IsEmpty() bool {
	return true
}
