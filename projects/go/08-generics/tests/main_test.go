package main

import (
	"slices"
	"testing"
)

func TestStack(t *testing.T) {
	s := NewStack[int]()
	if !s.IsEmpty() || s.Len() != 0 {
		t.Fatalf("새 스택은 비어있어야 합니다: len=%d", s.Len())
	}
	if _, ok := s.Pop(); ok {
		t.Fatal("빈 스택 Pop 성공 반환 에러")
	}
	if _, ok := s.Peek(); ok {
		t.Fatal("빈 스택 Peek 성공 반환 에러")
	}

	s.Push(10)
	s.Push(20)
	s.Push(30)
	if s.Len() != 3 {
		t.Fatalf("기대 len=3, 실제 len=%d", s.Len())
	}
	if top, ok := s.Peek(); !ok || top != 30 {
		t.Fatalf("기대 top=30, 실제 top=%d", top)
	}

	// All() iter.Seq 테스트 (Top -> Bottom)
	var items []int
	for v := range s.All() {
		items = append(items, v)
	}
	expected := []int{30, 20, 10}
	if !slices.Equal(items, expected) {
		t.Fatalf("Stack.All() 순회 결과 불일치: 기대 %v, 실제 %v", expected, items)
	}

	// All() 조기 탈출 테스트 (break)
	count := 0
	for range s.All() {
		count++
		if count == 2 {
			break
		}
	}
	if count != 2 {
		t.Fatalf("이터레이터 break 실패: count=%d", count)
	}

	// Pop 확인
	val, ok := s.Pop()
	if !ok || val != 30 {
		t.Fatalf("기대 Pop=30, 실제=%d", val)
	}
	val, ok = s.Pop()
	if !ok || val != 20 {
		t.Fatalf("기대 Pop=20, 실제=%d", val)
	}
	val, ok = s.Pop()
	if !ok || val != 10 {
		t.Fatalf("기대 Pop=10, 실제=%d", val)
	}
	if !s.IsEmpty() {
		t.Fatal("모두 Pop한 후 스택이 비어있지 않음")
	}
}

func TestQueue(t *testing.T) {
	q := NewQueue[string]()
	if !q.IsEmpty() || q.Len() != 0 {
		t.Fatalf("새 큐는 비어있어야 합니다: len=%d", q.Len())
	}
	if _, ok := q.Dequeue(); ok {
		t.Fatal("빈 큐 Dequeue 성공 반환 에러")
	}
	if _, ok := q.Peek(); ok {
		t.Fatal("빈 큐 Peek 성공 반환 에러")
	}

	q.Enqueue("a")
	q.Enqueue("b")
	q.Enqueue("c")
	if q.Len() != 3 {
		t.Fatalf("기대 len=3, 실제 len=%d", q.Len())
	}
	if front, ok := q.Peek(); !ok || front != "a" {
		t.Fatalf("기대 front='a', 실제 front=%q", front)
	}

	// All() iter.Seq 테스트 (Front -> Back)
	var items []string
	for v := range q.All() {
		items = append(items, v)
	}
	expected := []string{"a", "b", "c"}
	if !slices.Equal(items, expected) {
		t.Fatalf("Queue.All() 순회 결과 불일치: 기대 %v, 실제 %v", expected, items)
	}

	// Dequeue 순서 확인 (FIFO)
	val, ok := q.Dequeue()
	if !ok || val != "a" {
		t.Fatalf("기대 Dequeue='a', 실제=%q", val)
	}
	val, ok = q.Dequeue()
	if !ok || val != "b" {
		t.Fatalf("기대 Dequeue='b', 실제=%q", val)
	}
	val, ok = q.Dequeue()
	if !ok || val != "c" {
		t.Fatalf("기대 Dequeue='c', 실제=%q", val)
	}
	if !q.IsEmpty() {
		t.Fatal("모두 Dequeue한 후 큐가 비어있지 않음")
	}

	// 대량 Enqueue/Dequeue로 compaction 검증
	for i := 0; i < 200; i++ {
		q.Enqueue("item")
		q.Dequeue()
	}
	if q.Len() != 0 {
		t.Fatalf("연속 작업 후 큐 크기 불일치: len=%d", q.Len())
	}
}

func TestMinMaxHeap(t *testing.T) {
	// MinHeap 테스트
	minHeap := NewMinHeap[int]()
	input := []int{5, 3, 8, 1, 9, 2}
	for _, n := range input {
		minHeap.Push(n)
	}
	if minHeap.Len() != len(input) {
		t.Fatalf("MinHeap 크기 불일치: 기대 %d, 실제 %d", len(input), minHeap.Len())
	}
	if top, ok := minHeap.Peek(); !ok || top != 1 {
		t.Fatalf("MinHeap Peek 불일치: 기대 1, 실제 %d", top)
	}

	var minPopped []int
	for !minHeap.IsEmpty() {
		val, ok := minHeap.Pop()
		if !ok {
			t.Fatal("MinHeap Pop 실패")
		}
		minPopped = append(minPopped, val)
	}
	expectedMin := []int{1, 2, 3, 5, 8, 9}
	if !slices.Equal(minPopped, expectedMin) {
		t.Fatalf("MinHeap 정렬 순서 불일치: 기대 %v, 실제 %v", expectedMin, minPopped)
	}

	// MaxHeap 테스트
	maxHeap := NewMaxHeap[int]()
	for _, n := range input {
		maxHeap.Push(n)
	}
	var maxPopped []int
	for !maxHeap.IsEmpty() {
		val, _ := maxHeap.Pop()
		maxPopped = append(maxPopped, val)
	}
	expectedMax := []int{9, 8, 5, 3, 2, 1}
	if !slices.Equal(maxPopped, expectedMax) {
		t.Fatalf("MaxHeap 정렬 순서 불일치: 기대 %v, 실제 %v", expectedMax, maxPopped)
	}

	// 커스텀 구조체 우선순위 큐
	type Task struct {
		Name     string
		Priority int
	}
	pq := NewPriorityQueue[Task](func(a, b Task) bool {
		return a.Priority > b.Priority // 높은 우선순위 먼저
	})
	pq.Push(Task{Name: "low", Priority: 1})
	pq.Push(Task{Name: "critical", Priority: 10})
	pq.Push(Task{Name: "medium", Priority: 5})

	topTask, ok := pq.Pop()
	if !ok || topTask.Name != "critical" {
		t.Fatalf("커스텀 PQ 최우선 항목 불일치: 기대 'critical', 실제 %q", topTask.Name)
	}
}

func TestLRUCache(t *testing.T) {
	cache := NewLRUCache[string, int](2)
	if cache.Capacity() != 2 {
		t.Fatalf("캐시 용량 불일치: 기대 2, 실제 %d", cache.Capacity())
	}

	// 미존재 키 조회
	if _, ok := cache.Get("not_found"); ok {
		t.Fatal("존재하지 않는 키 조회 성공 반환 에러")
	}

	// 1. 키 추가
	evicted := cache.Put("a", 100)
	if evicted || cache.Len() != 1 {
		t.Fatalf("첫 추가 시 방출 발생 또는 크기 불일치: evicted=%t, len=%d", evicted, cache.Len())
	}
	evicted = cache.Put("b", 200)
	if evicted || cache.Len() != 2 {
		t.Fatalf("두 번째 추가 시 방출 발생: evicted=%t", evicted)
	}

	// 2. 캐시 히트 (Get으로 'a'를 MRU로 이동)
	val, ok := cache.Get("a")
	if !ok || val != 100 {
		t.Fatalf("키 'a' 조회 실패: val=%d", val)
	}

	// 3. 용량 초과 시 'b' 방출 (가장 오래된 항목)
	evicted = cache.Put("c", 300)
	if !evicted {
		t.Fatal("용량 초과 시 방출이 발생해야 함")
	}
	if _, ok := cache.Get("b"); ok {
		t.Fatal("방출된 키 'b'가 여전히 캐시에 존재함")
	}
	if _, ok := cache.Get("a"); !ok {
		t.Fatal("최근 사용된 키 'a'가 보존되지 않음")
	}
	if _, ok := cache.Get("c"); !ok {
		t.Fatal("새로 추가된 키 'c'가 캐시에 없음")
	}

	// 4. Keys() 순회 순서 검증 (MRU -> LRU)
	var keys []string
	for k := range cache.Keys() {
		keys = append(keys, k)
	}
	// 'c' 조회로 'c'가 MRU, 'a'가 LRU
	cache.Get("c")
	keys = nil
	for k := range cache.Keys() {
		keys = append(keys, k)
	}
	expectedKeys := []string{"c", "a"}
	if !slices.Equal(keys, expectedKeys) {
		t.Fatalf("LRUCache.Keys() 순회 순서 불일치: 기대 %v, 실제 %v", expectedKeys, keys)
	}

	// 5. Remove 테스트
	if !cache.Remove("a") {
		t.Fatal("키 'a' 삭제 실패")
	}
	if cache.Remove("a") {
		t.Fatal("이미 삭제된 키 'a' 삭제 성공 반환")
	}
	if cache.Len() != 1 {
		t.Fatalf("삭제 후 캐시 크기 불일치: 기대 1, 실제 %d", cache.Len())
	}
}

func TestMainExecution(t *testing.T) {
	// main 함수 실행 시 패닉이나 에러 없이 정상 완료되는지 확인
	main()
}
