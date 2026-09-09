package main

import "iter"

type lruNode[K comparable, V any] struct {
	key   K
	value V
	prev  *lruNode[K, V]
	next  *lruNode[K, V]
}

// LRUCache는 최근에 사용되지 않은 항목을 제거하는 O(1) 제네릭 LRU 캐시다.
type LRUCache[K comparable, V any] struct {
	capacity int
	items    map[K]*lruNode[K, V]
	head     *lruNode[K, V] // 최근 사용(MRU)
	tail     *lruNode[K, V] // 가장 오래전 사용(LRU)
}

// NewLRUCache는 지정된 용량(capacity)의 LRUCache를 생성한다.
func NewLRUCache[K comparable, V any](capacity int) *LRUCache[K, V] {
	if capacity <= 0 {
		capacity = 1
	}
	c := &LRUCache[K, V]{
		capacity: capacity,
		items:    make(map[K]*lruNode[K, V]),
		head:     &lruNode[K, V]{},
		tail:     &lruNode[K, V]{},
	}
	c.head.next = c.tail
	c.tail.prev = c.head
	return c
}

// Get은 키에 해당하는 값을 조회하고 해당 항목을 가장 최근 사용(MRU) 위치로 이동시킨다.
func (c *LRUCache[K, V]) Get(key K) (V, bool) {
	node, ok := c.items[key]
	if !ok {
		var zero V
		return zero, false
	}
	c.moveToFront(node)
	return node.value, true
}

// Put은 키와 값을 저장한다. 용량을 초과하면 가장 오래된 항목(LRU)을 제거하고 true를 반환한다.
func (c *LRUCache[K, V]) Put(key K, value V) bool {
	if node, ok := c.items[key]; ok {
		node.value = value
		c.moveToFront(node)
		return false
	}

	evicted := false
	if len(c.items) >= c.capacity {
		c.removeOldest()
		evicted = true
	}

	node := &lruNode[K, V]{key: key, value: value}
	c.items[key] = node
	c.addToFront(node)
	return evicted
}

// Remove는 키에 해당하는 항목을 캐시에서 삭제한다.
func (c *LRUCache[K, V]) Remove(key K) bool {
	node, ok := c.items[key]
	if !ok {
		return false
	}
	c.removeNode(node)
	delete(c.items, key)
	return true
}

// Len은 현재 캐시에 저장된 항목 수를 반환한다.
func (c *LRUCache[K, V]) Len() int {
	return len(c.items)
}

// Capacity는 캐시의 최대 용량을 반환한다.
func (c *LRUCache[K, V]) Capacity() int {
	return c.capacity
}

// Keys는 Go 1.23+ iter.Seq를 통해 최근 사용된 순서(MRU -> LRU)대로 키를 순회한다.
func (c *LRUCache[K, V]) Keys() iter.Seq[K] {
	return func(yield func(K) bool) {
		curr := c.head.next
		for curr != c.tail {
			if !yield(curr.key) {
				return
			}
			curr = curr.next
		}
	}
}

func (c *LRUCache[K, V]) addToFront(node *lruNode[K, V]) {
	node.prev = c.head
	node.next = c.head.next
	c.head.next.prev = node
	c.head.next = node
}

func (c *LRUCache[K, V]) removeNode(node *lruNode[K, V]) {
	node.prev.next = node.next
	node.next.prev = node.prev
}

func (c *LRUCache[K, V]) moveToFront(node *lruNode[K, V]) {
	c.removeNode(node)
	c.addToFront(node)
}

func (c *LRUCache[K, V]) removeOldest() {
	last := c.tail.prev
	if last != c.head {
		c.removeNode(last)
		delete(c.items, last.key)
	}
}
