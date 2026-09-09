package main

import (
	"fmt"
)

func main() {
	fmt.Println("=== 08-generics 데모 실행 ===")

	// 1. Stack 데모
	fmt.Println("[1] Stack[int] 데모:")
	stack := NewStack[int]()
	stack.Push(10)
	stack.Push(20)
	stack.Push(30)
	fmt.Printf("Stack 요소 개수: %d\n", stack.Len())
	fmt.Print("Stack Top -> Bottom: ")
	for v := range stack.All() {
		fmt.Printf("%d ", v)
	}
	fmt.Println()
	if val, ok := stack.Pop(); ok {
		fmt.Printf("Pop: %d (남은 개수: %d)\n", val, stack.Len())
	}

	// 2. Queue 데모
	fmt.Println("\n[2] Queue[string] 데모:")
	queue := NewQueue[string]()
	queue.Enqueue("첫 번째")
	queue.Enqueue("두 번째")
	queue.Enqueue("세 번째")
	fmt.Printf("Queue 요소 개수: %d\n", queue.Len())
	fmt.Print("Queue Front -> Back: ")
	for v := range queue.All() {
		fmt.Printf("%q ", v)
	}
	fmt.Println()
	if val, ok := queue.Dequeue(); ok {
		fmt.Printf("Dequeue: %q (남은 개수: %d)\n", val, queue.Len())
	}

	// 3. PriorityQueue 데모
	fmt.Println("\n[3] PriorityQueue MinHeap[int] 데모:")
	pq := NewMinHeap[int]()
	for _, n := range []int{42, 12, 88, 3, 27} {
		pq.Push(n)
	}
	fmt.Print("MinHeap 우선순위 순서대로 Pop: ")
	for !pq.IsEmpty() {
		val, _ := pq.Pop()
		fmt.Printf("%d ", val)
	}
	fmt.Println()

	// 4. LRUCache 데모
	fmt.Println("\n[4] LRUCache[string, int] (용량 2) 데모:")
	cache := NewLRUCache[string, int](2)
	cache.Put("a", 1)
	cache.Put("b", 2)
	cache.Get("a")               // "a"를 최근 사용으로 갱신
	evicted := cache.Put("c", 3) // "b" 방출
	fmt.Printf("'c' 추가 시 방출 발생 여부: %t\n", evicted)
	fmt.Print("현재 캐시 Keys (MRU -> LRU): ")
	for k := range cache.Keys() {
		fmt.Printf("%s ", k)
	}
	fmt.Println()
}
