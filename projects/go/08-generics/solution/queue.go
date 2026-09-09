package main

import "iter"

// Queue는 FIFO(First-In-First-Out) 제네릭 큐다.
type Queue[T any] struct {
	items []T
	head  int
}

// NewQueue는 빈 큐를 생성한다.
func NewQueue[T any]() *Queue[T] {
	return &Queue[T]{items: make([]T, 0)}
}

// Enqueue는 큐의 뒤(tail)에 값을 추가한다.
func (q *Queue[T]) Enqueue(v T) {
	q.items = append(q.items, v)
}

// Dequeue는 큐의 앞(head)에서 값을 꺼내 반환한다. 비어있으면 제로값과 false를 반환한다.
func (q *Queue[T]) Dequeue() (T, bool) {
	if q.Len() == 0 {
		var zero T
		return zero, false
	}
	val := q.items[q.head]
	var zero T
	q.items[q.head] = zero // GC 지원
	q.head++
	// 메모리 compaction: 앞부분의 사용되지 않는 공간이 너무 커지면 재정렬
	if q.head > 64 && q.head*2 >= len(q.items) {
		q.items = append([]T(nil), q.items[q.head:]...)
		q.head = 0
	}
	return val, true
}

// Peek는 큐의 맨 앞 값을 제거하지 않고 반환한다. 비어있으면 제로값과 false를 반환한다.
func (q *Queue[T]) Peek() (T, bool) {
	if q.Len() == 0 {
		var zero T
		return zero, false
	}
	return q.items[q.head], true
}

// Len은 큐에 저장된 요소의 개수를 반환한다.
func (q *Queue[T]) Len() int {
	return len(q.items) - q.head
}

// IsEmpty는 큐가 비어있는지 확인한다.
func (q *Queue[T]) IsEmpty() bool {
	return q.Len() == 0
}

// All은 Go 1.23+ 표준 iter.Seq 이터레이터로, 큐의 앞(Front)부터 뒤까지 순회한다.
func (q *Queue[T]) All() iter.Seq[T] {
	return func(yield func(T) bool) {
		for i := q.head; i < len(q.items); i++ {
			if !yield(q.items[i]) {
				return
			}
		}
	}
}
