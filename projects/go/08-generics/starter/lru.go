package main

import "iter"

type lruNode[K comparable, V any] struct {
	key   K
	value V
	prev  *lruNode[K, V]
	next  *lruNode[K, V]
}

// TODO(step-4): LRUCache[K comparable, V any]와 Get, Put, Remove, Len, Capacity, Keys(iter.Seq) 구현
type LRUCache[K comparable, V any] struct {
	capacity int
	items    map[K]*lruNode[K, V]
	head     *lruNode[K, V]
	tail     *lruNode[K, V]
}

func NewLRUCache[K comparable, V any](capacity int) *LRUCache[K, V] {
	return &LRUCache[K, V]{capacity: capacity}
}

func (c *LRUCache[K, V]) Get(key K) (V, bool) {
	_ = key
	var zero V
	return zero, false
}

func (c *LRUCache[K, V]) Put(key K, value V) bool {
	_ = key
	_ = value
	return false
}

func (c *LRUCache[K, V]) Remove(key K) bool {
	_ = key
	return false
}

func (c *LRUCache[K, V]) Len() int {
	return 0
}

func (c *LRUCache[K, V]) Capacity() int {
	return c.capacity
}

func (c *LRUCache[K, V]) Keys() iter.Seq[K] {
	return func(yield func(K) bool) {
		_ = yield
	}
}
