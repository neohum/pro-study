# 08. 제네릭 컬렉션 라이브러리

## 무엇을 만드는가

Go 언어의 제네릭(`[T any]`, `[T cmp.Ordered]`)과 Go 1.23+ 이터레이터(`iter.Seq`)를 활용하여 타입 안정성이 보장되는 4가지 핵심 자료구조(`Stack`, `Queue`, `PriorityQueue`, `LRUCache`)를 직접 구현하는 라이브러리다.

```
$ build/app.exe
=== 08-generics 데모 실행 ===
[1] Stack[int] 데모:
Stack 요소 개수: 3
Stack Top -> Bottom: 30 20 10 
Pop: 30 (남은 개수: 2)

[2] Queue[string] 데모:
Queue 요소 개수: 3
Queue Front -> Back: "첫 번째" "두 번째" "세 번째" 
Dequeue: "첫 번째" (남은 개수: 2)

[3] PriorityQueue MinHeap[int] 데모:
MinHeap 우선순위 순서대로 Pop: 1 2 3 5 8 9 

[4] LRUCache[string, int] (용량 2) 데모:
'c' 추가 시 방출 발생 여부: true
현재 캐시 Keys (MRU -> LRU): c a 
```

## 왜 이 프로젝트인가

Go 1.18에 도입된 제네릭(Type Parameters)과 Go 1.23에 도입된 표준 이터레이터(`iter.Seq`, `iter.Seq2`)는 Go 언어의 관용구(idiomatic Go)를 근본적으로 확장시켰다.

과거 `interface{}`(any) 기반의 자료구조는 런타임 타입 단언(type assertion) 비용과 박싱/언박싱 오버헤드가 수반되었으나, 제네릭을 사용하면 컴파일 시점의 강력한 타입 검사와 최적화된 성능을 동시에 얻을 수 있다.

또한 Go 1.23+ `iter.Seq`를 탑재하면 외부 라이브러리 없이도 표준 `for ... range` 문법으로 커스텀 컨테이너의 내부 요소를 지연 평가(lazy evaluation)하며 안전하게 순회할 수 있다.

## 핵심 개념

### 타입 매개변수와 any 제약조건

Go의 구조체와 함수에 타입 매개변수 `[T any]`를 선언하면 임의의 타입에 동작하는 컨테이너를 정의할 수 있다.

```go
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(v T) {
    s.items = append(s.items, v)
}
```

### cmp.Ordered 제약과 대소 비교

산술 연산이나 대소 비교(`<`, `>`)가 필요한 경우 `cmp.Ordered` 인터페이스를 제약조건으로 지정한다. 표준 `cmp.Compare` 함수를 조합하여 최소 힙과 최대 힙을 간결하게 구성할 수 있다.

```go
import "cmp"

func NewMinHeap[T cmp.Ordered]() *PriorityQueue[T] {
    return NewPriorityQueue[T](func(a, b T) bool {
        return cmp.Compare(a, b) < 0
    })
}
```

### Go 1.23+ 표준 이터레이터 (iter.Seq)

`iter.Seq[V any]`는 `func(yield func(V) bool)` 시그니처를 가진 함수 타입이다. `yield`가 `false`를 반환하면 순회를 즉시 중단하여 `break` 탈출을 자연스럽게 지원한다.

```go
import "iter"

func (s *Stack[T]) All() iter.Seq[T] {
    return func(yield func(T) bool) {
        for i := len(s.items) - 1; i >= 0; i-- {
            if !yield(s.items[i]) {
                return
            }
        }
    }
}
```

### O(1) LRU 캐시: 해시맵과 이중 연결 리스트

LRU(Least Recently Used) 캐시는 키 조회를 위한 해시맵(`map[K]*Node`)과 사용 빈도 순서를 추적하는 이중 연결 리스트(`prev`, `next`)를 결합하여 조회와 갱신, 삭제를 모두 O(1) 시간에 수행한다.

```go
type LRUCache[K comparable, V any] struct {
    capacity int
    items    map[K]*lruNode[K, V]
    head     *lruNode[K, V] // MRU
    tail     *lruNode[K, V] // LRU
}
```

## 단계별 구현

각 단계는 `starter/` 폴더 내 소스코드의 `TODO(step-N)` 주석과 1:1로 일치한다.

### Step 1: Stack과 iter.Seq 이터레이터

`Stack[T any]` 구조체와 `Push`, `Pop`, `Peek`, `Len`, `IsEmpty`, `All` 메서드를 구현한다.
`Pop` 수행 시 슬라이스에서 요소를 제거할 때 메모리 누수를 방지하기 위해 해당 인덱스에 제로값(`var zero T`)을 대입하는 테크닉을 적용한다.

확인: 스택에 요소를 넣고 `for v := range stack.All()` 루프로 역순(LIFO) 출력을 확인한다.

### Step 2: Queue와 슬라이스 최적화

`Queue[T any]` 구조체와 `Enqueue`, `Dequeue`, `Peek`, `Len`, `IsEmpty`, `All` 메서드를 구현한다.
`head` 인덱스를 이동시키는 방식으로 Dequeue를 O(1)에 처리하고, 헤드가 일정 수준 이상 커지면 슬라이스를 앞쪽으로 재배치(compaction)하여 메모리를 회수한다.

확인: 큐에 문자열을 넣고 Dequeue로 꺼낼 때 FIFO 순서가 유지되는지 확인한다.

### Step 3: PriorityQueue와 cmp.Ordered 이진 힙

`PriorityQueue[T any]` 구조체와 `Push`, `Pop`, `Peek` 연산, 그리고 힙 불변식을 유지하는 `siftUp`, `siftDown` 헬퍼 함수를 작성한다.
`cmp.Ordered` 제약조건을 기반으로 간편하게 생성할 수 있는 `NewMinHeap[T]`과 `NewMaxHeap[T]` 생성자를 함께 제공한다.

확인: 무작위 정수를 넣고 Pop할 때 정렬된 순서로 꺼내지는지 확인한다.

### Step 4: LRUCache와 이중 연결 리스트

더미 헤드와 테일 센티널 노드를 가진 이중 연결 리스트와 Go 내장 맵을 결합하여 `LRUCache[K comparable, V any]`를 구현한다.
`Get`, `Put`, `Remove`, `Keys` 메서드를 완성하고, 정해진 용량을 초과할 때 가장 오래 참조되지 않은 노드가 정상 방출(evict)되는지 검증한다.

확인: 용량 2 캐시에 a, b를 넣고 a를 조회한 뒤 c를 넣었을 때 b가 방출되는지 확인한다.

### Step 5: 통합 데모와 main

`main.go`에서 구현한 4가지 자료구조를 실제로 인스턴스화하고 다양한 타입(`int`, `string`, 사용자 정의 구조체)으로 연산을 수행하는 콘솔 데모를 작성한다.

확인: `go run .` 실행 시 4가지 자료구조의 동작 결과가 깔끔하게 출력되는지 확인한다.

## 막혔을 때

| 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| 제네릭 타입 변수에 제로값 반환 불가 | Go 제네릭은 `nil`을 모든 타입의 기본값으로 쓸 수 없음 | `var zero T` 선언 후 `zero`를 반환한다 |
| `map[K]...`에서 키 타입 에러 | 제네릭 타입 K에 비교 가능 제약이 없음 | `[K comparable]` 제약을 명시한다 |
| `iter.Seq` 함수가 컴파일되지 않음 | Go 버전이 1.23 미만이거나 `import "iter"` 누락 | `go.mod`의 버전을 1.23 이상으로 지정하고 iter 패키지를 임포트한다 |
| LRUCache 방출 시 패닉 발생 | 센티널 노드(`head`, `tail`)의 포인터 연결 누락 | `NewLRUCache`에서 `head.next = tail`, `tail.prev = head` 초기화를 확인한다 |

## 더 나아가기

- `sync.RWMutex`를 추가하여 동시성 안전한(Concurrent-safe) 제네릭 자료구조 컬렉션 만들기
- Go 1.23+ `iter.Seq2[K, V]`를 활용하여 LRUCache의 키와 값을 동시에 순회하는 이터레이터 지원하기
- 우선순위 큐에 `UpdatePriority(item T, newPriority P)` 메서드 추가하여 다익스트라 알고리즘에 활용하기

## 참고

- The Go Programming Language: Tutorial: Getting started with generics (<https://go.dev/doc/tutorial/generics>)
- Go Wiki: Rangefunc Experiment (iter package) (<https://go.dev/wiki/Rangefunc>)
- Go 표준 라이브러리: `cmp` 패키지 (<https://pkg.go.dev/cmp>)
