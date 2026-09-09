package main

import "cmp"

// PriorityQueue는 이진 힙 기반의 제네릭 우선순위 큐다.
type PriorityQueue[T any] struct {
	items []T
	less  func(a, b T) bool
}

// NewPriorityQueue는 사용자 정의 우선순위 비교 함수(less)를 사용하는 우선순위 큐를 생성한다.
func NewPriorityQueue[T any](less func(a, b T) bool) *PriorityQueue[T] {
	return &PriorityQueue[T]{
		items: make([]T, 0),
		less:  less,
	}
}

// NewMinHeap은 cmp.Ordered를 만족하는 타입에 대해 최소 힙(작은 값이 높은 우선순위)을 생성한다.
func NewMinHeap[T cmp.Ordered]() *PriorityQueue[T] {
	return NewPriorityQueue[T](func(a, b T) bool {
		return cmp.Compare(a, b) < 0
	})
}

// NewMaxHeap은 cmp.Ordered를 만족하는 타입에 대해 최대 힙(큰 값이 높은 우선순위)을 생성한다.
func NewMaxHeap[T cmp.Ordered]() *PriorityQueue[T] {
	return NewPriorityQueue[T](func(a, b T) bool {
		return cmp.Compare(a, b) > 0
	})
}

// Push는 새로운 요소를 우선순위 큐에 삽입하고 힙 속성을 복원한다.
func (pq *PriorityQueue[T]) Push(v T) {
	pq.items = append(pq.items, v)
	pq.siftUp(len(pq.items) - 1)
}

// Pop은 가장 높은 우선순위를 가진 요소를 꺼내 반환한다. 비어있으면 제로값과 false를 반환한다.
func (pq *PriorityQueue[T]) Pop() (T, bool) {
	if len(pq.items) == 0 {
		var zero T
		return zero, false
	}
	top := pq.items[0]
	lastIdx := len(pq.items) - 1
	pq.items[0] = pq.items[lastIdx]
	var zero T
	pq.items[lastIdx] = zero
	pq.items = pq.items[:lastIdx]
	if len(pq.items) > 0 {
		pq.siftDown(0)
	}
	return top, true
}

// Peek는 가장 높은 우선순위의 요소를 제거하지 않고 확인한다. 비어있으면 제로값과 false를 반환한다.
func (pq *PriorityQueue[T]) Peek() (T, bool) {
	if len(pq.items) == 0 {
		var zero T
		return zero, false
	}
	return pq.items[0], true
}

// Len은 큐에 저장된 요소 개수를 반환한다.
func (pq *PriorityQueue[T]) Len() int {
	return len(pq.items)
}

// IsEmpty는 큐가 비어있는지 확인한다.
func (pq *PriorityQueue[T]) IsEmpty() bool {
	return len(pq.items) == 0
}

func (pq *PriorityQueue[T]) siftUp(i int) {
	for i > 0 {
		parent := (i - 1) / 2
		if pq.less(pq.items[i], pq.items[parent]) {
			pq.items[i], pq.items[parent] = pq.items[parent], pq.items[i]
			i = parent
		} else {
			break
		}
	}
}

func (pq *PriorityQueue[T]) siftDown(i int) {
	n := len(pq.items)
	for {
		left := 2*i + 1
		if left >= n {
			break
		}
		best := left
		right := left + 1
		if right < n && pq.less(pq.items[right], pq.items[left]) {
			best = right
		}
		if pq.less(pq.items[best], pq.items[i]) {
			pq.items[i], pq.items[best] = pq.items[best], pq.items[i]
			i = best
		} else {
			break
		}
	}
}
