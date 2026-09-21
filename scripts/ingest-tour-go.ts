/**
 * scripts/ingest-tour-go.ts
 * A Tour of Go (go.dev/tour) 공식 레슨 수집 및 필사용 데이터셋 구축 스크립트
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

interface TourLesson {
  id: string;
  chapter: string;
  chapterTitle: string;
  order: number;
  title: string;
  titleKo: string;
  summaryKo: string;
  code: string;
  entry: string;
  concepts: string[];
}

interface TourManifest {
  courseId: string;
  title: string;
  description: string;
  totalChapters: number;
  totalLessons: number;
  chapters: {
    id: string;
    title: string;
    lessons: { id: string; title: string; titleKo: string }[];
  }[];
}

const ROOT = resolve(process.cwd());
const OUT_DIR = join(ROOT, 'courses', 'tour-go');
const LESSONS_DIR = join(OUT_DIR, 'lessons');

// Tour of Go 핵심 표준 챕터 및 레슨 데이터
const CORE_LESSONS: TourLesson[] = [
  // 1. Basics
  {
    id: 'basics-packages',
    chapter: 'basics',
    chapterTitle: '기본 문법 (Basics)',
    order: 1,
    title: 'Packages',
    titleKo: '패키지 선언과 진입점',
    summaryKo: 'Go 프로그램은 패키지로 구성되며, 실행은 main 패키지에서 시작합니다. math/rand와 fmt 패키지를 가져와 난수를 출력합니다.',
    entry: 'packages.go',
    concepts: ['package main', 'import', 'math/rand', 'fmt.Println'],
    code: `package main

import (
	"fmt"
	"math/rand"
)

func main() {
	fmt.Println("내가 좋아하는 숫자는", rand.Intn(10))
}
`
  },
  {
    id: 'basics-imports',
    chapter: 'basics',
    chapterTitle: '기본 문법 (Basics)',
    order: 2,
    title: 'Factored Imports',
    titleKo: '그룹화된 패키지 임포트',
    summaryKo: '괄호를 사용하여 여러 패키지를 한 번에 그룹(Factored) 형태로 임포트하는 것이 Go의 관용적(idiomatic) 스타일입니다.',
    entry: 'imports.go',
    concepts: ['factored import', 'math.Sqrt'],
    code: `package main

import (
	"fmt"
	"math"
)

func main() {
	fmt.Printf("7의 제곱근은 %g입니다.\\n", math.Sqrt(7))
}
`
  },
  {
    id: 'basics-functions',
    chapter: 'basics',
    chapterTitle: '기본 문법 (Basics)',
    order: 3,
    title: 'Functions',
    titleKo: '함수 선언과 매개변수 타입',
    summaryKo: 'Go에서 타입은 변수명 뒤에 옵니다. 연속된 매개변수가 같은 타입이면 마지막에만 타입을 명시할 수 있습니다.',
    entry: 'functions.go',
    concepts: ['func', '매개변수 타입', '반환 타입'],
    code: `package main

import "fmt"

func add(x int, y int) int {
	return x + y
}

func multiply(x, y int) int {
	return x * y
}

func main() {
	fmt.Println("합계:", add(42, 13))
	fmt.Println("곱셈:", multiply(6, 7))
}
`
  },
  {
    id: 'basics-multiple-results',
    chapter: 'basics',
    chapterTitle: '기본 문법 (Basics)',
    order: 4,
    title: 'Multiple Results',
    titleKo: '다중 반환값 함수',
    summaryKo: 'Go 함수는 여러 개의 값을 동시에 반환할 수 있어 에러 핸들링과 값 전달이 매우 직관적입니다.',
    entry: 'multiple_results.go',
    concepts: ['다중 반환값', '문자열 교환'],
    code: `package main

import "fmt"

func swap(x, y string) (string, string) {
	return y, x
}

func main() {
	a, b := swap("hello", "world")
	fmt.Println(a, b)
}
`
  },
  {
    id: 'basics-variables',
    chapter: 'basics',
    chapterTitle: '기본 문법 (Basics)',
    order: 5,
    title: 'Variables and Short Declaration',
    titleKo: '변수 선언과 := 단축 연산자',
    summaryKo: 'var 키워드로 변수를 선언하거나, 함수 내부에서는 := 연산자로 타입 추론과 초기화를 한 번에 수행합니다.',
    entry: 'variables.go',
    concepts: ['var', ':= 단축 선언', '타입 추론'],
    code: `package main

import "fmt"

var c, python, java bool

func main() {
	var i int = 1
	k := 3 // 함수 내부 단축 선언
	c, python, java = true, false, "no" == "yes"
	fmt.Println(i, k, c, python, java)
}
`
  },
  // 2. Flow Control
  {
    id: 'flow-for',
    chapter: 'flowcontrol',
    chapterTitle: '흐름 제어 (Flow Control)',
    order: 6,
    title: 'For Loop',
    titleKo: '기본 for 반복문',
    summaryKo: 'Go에는 while이나 do-while이 없으며, 오직 for 키워드 하나로 모든 반복을 표현합니다.',
    entry: 'for.go',
    concepts: ['for 루프', '조건식', '사후 처리식'],
    code: `package main

import "fmt"

func main() {
	sum := 0
	for i := 0; i < 10; i++ {
		sum += i
	}
	fmt.Println("0부터 9까지의 합:", sum)
}
`
  },
  {
    id: 'flow-if-short',
    chapter: 'flowcontrol',
    chapterTitle: '흐름 제어 (Flow Control)',
    order: 7,
    title: 'If with Short Statement',
    titleKo: 'if 단축 선언문',
    summaryKo: 'for처럼 if 조건문 앞에도 간단한 실행문을 배치할 수 있으며, 선언된 변수의 유효 범위는 if-else 블록 내부로 제한됩니다.',
    entry: 'if_short.go',
    concepts: ['if 초기화식', '변수 스코프', 'math.Pow'],
    code: `package main

import (
	"fmt"
	"math"
)

func pow(x, n, lim float64) float64 {
	if v := math.Pow(x, n); v < lim {
		return v
	} else {
		fmt.Printf("%g >= %g\\n", v, lim)
	}
	return lim
}

func main() {
	fmt.Println("결과 1:", pow(3, 2, 10))
	fmt.Println("결과 2:", pow(3, 3, 20))
}
`
  },
  {
    id: 'flow-switch',
    chapter: 'flowcontrol',
    chapterTitle: '흐름 제어 (Flow Control)',
    order: 8,
    title: 'Switch without Condition',
    titleKo: '조건 없는 switch 분기문',
    summaryKo: 'Go의 switch는 break가 필요 없으며, 조건식을 생략하면 if-then-else-if 사슬을 깔끔하게 대체할 수 있습니다.',
    entry: 'switch.go',
    concepts: ['switch', 'break 불필요', '시간 기반 분기'],
    code: `package main

import (
	"fmt"
	"time"
)

func main() {
	t := time.Now()
	switch {
	case t.Hour() < 12:
		fmt.Println("좋은 아침입니다!")
	case t.Hour() < 17:
		fmt.Println("좋은 오후입니다!")
	default:
		fmt.Println("좋은 저녁입니다!")
	}
}
`
  },
  {
    id: 'flow-defer',
    chapter: 'flowcontrol',
    chapterTitle: '흐름 제어 (Flow Control)',
    order: 9,
    title: 'Defer and Stacking',
    titleKo: 'defer 지연 실행과 스택 구조',
    summaryKo: 'defer 키워드는 함수가 반환될 때까지 실행을 지연시킵니다. 여러 개의 defer는 LIFO(후입선출) 스택 순서로 실행됩니다.',
    entry: 'defer.go',
    concepts: ['defer', 'LIFO 스택 실행', '리소스 정리'],
    code: `package main

import "fmt"

func main() {
	fmt.Println("카운팅 시작")

	for i := 0; i < 4; i++ {
		defer fmt.Println("지연 출력:", i)
	}

	fmt.Println("함수 본문 종료")
}
`
  },
  // 3. More Types
  {
    id: 'types-pointers',
    chapter: 'moretypes',
    chapterTitle: '자료구조 (More Types)',
    order: 10,
    title: 'Pointers',
    titleKo: '포인터와 메모리 주소',
    summaryKo: 'Go는 포인터를 지원하지만 C와 달리 포인터 연산(pointer arithmetic)은 불가능하여 안전합니다.',
    entry: 'pointers.go',
    concepts: ['포인터 *T', '주소 연산자 &', '역참조'],
    code: `package main

import "fmt"

func main() {
	i, j := 42, 2701

	p := &i         // i의 주소를 가리킴
	fmt.Println("p가 가리키는 값:", *p)
	*p = 21         // p를 통해 i의 값을 변경
	fmt.Println("변경된 i:", i)

	p = &j         // j의 주소를 가리킴
	*p = *p / 37   // p를 통해 j를 나눔
	fmt.Println("변경된 j:", j)
}
`
  },
  {
    id: 'types-structs',
    chapter: 'moretypes',
    chapterTitle: '자료구조 (More Types)',
    order: 11,
    title: 'Structs and Fields',
    titleKo: '구조체 정의와 필드 접근',
    summaryKo: 'struct는 필드들의 컬렉션입니다. 점(.) 문법으로 필드에 접근하며, 구조체 포인터를 통해서도 간접참조 없이 필드에 접근합니다.',
    entry: 'structs.go',
    concepts: ['type struct', '구조체 리터럴', '포인터 접근'],
    code: `package main

import "fmt"

type Vertex struct {
	X int
	Y int
}

func main() {
	v := Vertex{1, 2}
	v.X = 4
	p := &v
	p.Y = 1e2 // (*p).Y와 동일
	fmt.Println("Vertex:", v)
}
`
  },
  {
    id: 'types-slices',
    chapter: 'moretypes',
    chapterTitle: '자료구조 (More Types)',
    order: 12,
    title: 'Slices and Append',
    titleKo: '슬라이스 조작과 동적 추가',
    summaryKo: '슬라이스는 배열의 가변 크기 뷰입니다. len과 cap 속성을 가지며 append 함수로 요소를 동적으로 추가합니다.',
    entry: 'slices.go',
    concepts: ['슬라이스 []T', 'len과 cap', 'append'],
    code: `package main

import "fmt"

func main() {
	var s []int
	fmt.Printf("len=%d cap=%d %v\\n", len(s), cap(s), s)

	s = append(s, 10, 20, 30)
	fmt.Printf("append 후: len=%d cap=%d %v\\n", len(s), cap(s), s)

	sub := s[1:3]
	fmt.Println("부분 슬라이스 s[1:3]:", sub)
}
`
  },
  {
    id: 'types-range',
    chapter: 'moretypes',
    chapterTitle: '자료구조 (More Types)',
    order: 13,
    title: 'Range Loop',
    titleKo: 'range를 이용한 슬라이스 순회',
    summaryKo: 'for와 range를 조합하면 슬라이스나 맵을 순회할 때 인덱스와 복사된 요소 값을 깔끔하게 얻을 수 있습니다.',
    entry: 'range.go',
    concepts: ['range', '인덱스/값 언패킹', '언더스코어 _ 무시'],
    code: `package main

import "fmt"

var pow = []int{1, 2, 4, 8, 16, 32, 64, 128}

func main() {
	for i, v := range pow {
		fmt.Printf("2**%d = %d\\n", i, v)
	}
}
`
  },
  {
    id: 'types-maps',
    chapter: 'moretypes',
    chapterTitle: '자료구조 (More Types)',
    order: 14,
    title: 'Maps and Mutation',
    titleKo: '맵 생성과 키-값 조작',
    summaryKo: 'map은 키와 값을 매핑하는 해시 테이블입니다. make로 생성하며, 콤마 ok 문법으로 키 존재 여부를 확인합니다.',
    entry: 'maps.go',
    concepts: ['map[K]V', 'make(map)', 'comma ok 관용구'],
    code: `package main

import "fmt"

func main() {
	m := make(map[string]int)
	m["Answer"] = 42
	fmt.Println("Answer:", m["Answer"])

	delete(m, "Answer")
	v, ok := m["Answer"]
	fmt.Println("삭제 후 조회:", v, "존재 여부:", ok)
}
`
  },
  // 4. Methods and Interfaces
  {
    id: 'methods-receivers',
    chapter: 'methods',
    chapterTitle: '메서드와 인터페이스 (Methods & Interfaces)',
    order: 15,
    title: 'Methods on Types',
    titleKo: '구조체 리시버 메서드',
    summaryKo: 'Go에는 클래스가 없지만, 타입에 리시버(Receiver) 인자를 갖는 메서드를 정의하여 객체지향적 프로그래밍을 지원합니다.',
    entry: 'methods.go',
    concepts: ['리시버 함수', '메서드 선언', 'math.Hypot'],
    code: `package main

import (
	"fmt"
	"math"
)

type Vertex struct {
	X, Y float64
}

// Vertex 타입에 정의된 Abs 메서드
func (v Vertex) Abs() float64 {
	return math.Hypot(v.X, v.Y)
}

func main() {
	v := Vertex{3, 4}
	fmt.Println("Vertex의 절대 크기:", v.Abs())
}
`
  },
  {
    id: 'methods-interfaces',
    chapter: 'methods',
    chapterTitle: '메서드와 인터페이스 (Methods & Interfaces)',
    order: 16,
    title: 'Interfaces',
    titleKo: '암시적 인터페이스 구현',
    summaryKo: '인터페이스는 메서드 서명의 모음입니다. 명시적인 implements 키워드 없이 메서드만 구현하면 자동으로 인터페이스를 충족합니다.',
    entry: 'interfaces.go',
    concepts: ['interface', '암시적 구현', '다형성'],
    code: `package main

import "fmt"

type Greeter interface {
	Greet() string
}

type Person struct {
	Name string
}

func (p Person) Greet() string {
	return "안녕하세요, 저는 " + p.Name + "입니다."
}

func main() {
	var g Greeter = Person{Name: "Gopher"}
	fmt.Println(g.Greet())
}
`
  },
  // 5. Generics
  {
    id: 'generics-type-parameters',
    chapter: 'generics',
    chapterTitle: '제네릭 (Generics)',
    order: 17,
    title: 'Type Parameters',
    titleKo: '제네릭 타입 매개변수와 comparable',
    summaryKo: 'Go 1.18부터 함수와 타입에 타입 파라미터 [T comparable]를 선언하여 다양한 타입에 대해 안전한 제네릭 코드를 작성할 수 있습니다.',
    entry: 'generics.go',
    concepts: ['[T comparable]', '제네릭 함수', '타입 안전성'],
    code: `package main

import "fmt"

// Index는 comparable 인터페이스를 만족하는 모든 타입 슬라이스에서 x의 위치를 찾습니다.
func Index[T comparable](s []T, x T) int {
	for i, v := range s {
		if v == x {
			return i
		}
	}
	return -1
}

func main() {
	si := []int{10, 20, 15, -10}
	fmt.Println("20의 인덱스:", Index(si, 20))

	ss := []string{"apple", "banana", "cherry"}
	fmt.Println("banana의 인덱스:", Index(ss, "banana"))
}
`
  },
  // 6. Concurrency
  {
    id: 'concurrency-goroutines',
    chapter: 'concurrency',
    chapterTitle: '동시성 (Concurrency)',
    order: 18,
    title: 'Goroutines and Channels',
    titleKo: '고루틴과 채널 동기화',
    summaryKo: 'go 키워드로 경량 스레드인 고루틴을 실행하고, 채널(<-)을 통해 락 없이 데이터를 안전하게 통신하고 동기화합니다.',
    entry: 'goroutines.go',
    concepts: ['go 키워드', 'chan int', '채널 송수신 <-'],
    code: `package main

import "fmt"

func sum(s []int, c chan int) {
	total := 0
	for _, v := range s {
		total += v
	}
	c <- total // 결과를 채널에 전송
}

func main() {
	s := []int{7, 2, 8, -9, 4, 0}
	c := make(chan int)

	go sum(s[:len(s)/2], c)
	go sum(s[len(s)/2:], c)

	x, y := <-c, <-c // 채널로부터 두 결과를 수신

	fmt.Println("x:", x, "y:", y, "합계:", x+y)
}
`
  },
  {
    id: 'concurrency-select',
    chapter: 'concurrency',
    chapterTitle: '동시성 (Concurrency)',
    order: 19,
    title: 'Select Statement',
    titleKo: 'select 다중 채널 대기',
    summaryKo: 'select문은 고루틴이 여러 통신 연산을 대기할 수 있게 합니다. 케이스 중 하나가 준비될 때까지 블록됩니다.',
    entry: 'select.go',
    concepts: ['select', '채널 이벤트 멀티플렉싱', 'quit 채널'],
    code: `package main

import "fmt"

func fibonacci(c, quit chan int) {
	x, y := 0, 1
	for {
		select {
		case c <- x:
			x, y = y, x+y
		case <-quit:
			fmt.Println("종료 신호 수신")
			return
		}
	}
}

func main() {
	c := make(chan int)
	quit := make(chan int)

	go func() {
		for i := 0; i < 8; i++ {
			fmt.Println(<-c)
		}
		quit <- 0
	}()

	fibonacci(c, quit)
}
`
  }
];

function buildManifest(lessons: TourLesson[]): TourManifest {
  const chapterMap = new Map<string, { id: string; title: string; lessons: { id: string; title: string; titleKo: string }[] }>();

  for (const l of lessons) {
    if (!chapterMap.has(l.chapter)) {
      chapterMap.set(l.chapter, {
        id: l.chapter,
        title: l.chapterTitle,
        lessons: []
      });
    }
    chapterMap.get(l.chapter)!.lessons.push({
      id: l.id,
      title: l.title,
      titleKo: l.titleKo
    });
  }

  return {
    courseId: 'tour-go',
    title: 'A Tour of Go 실전 필사 코스',
    description: '공식 Go 튜토리얼(A Tour of Go)의 핵심 문법, 제어문, 자료구조, 메서드, 제네릭, 동시성을 한 줄씩 따라 쓰며 체화하는 필사 코스',
    totalChapters: chapterMap.size,
    totalLessons: lessons.length,
    chapters: Array.from(chapterMap.values())
  };
}

function main() {
  console.log('== A Tour of Go 필사 데이터셋 인제스트 시작 ==');
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(LESSONS_DIR, { recursive: true });

  const manifest = buildManifest(CORE_LESSONS);
  writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
  writeFileSync(join(OUT_DIR, 'lessons.json'), JSON.stringify(CORE_LESSONS, null, 2), 'utf-8');

  for (const lesson of CORE_LESSONS) {
    const lessonPath = join(LESSONS_DIR, `${lesson.id}.json`);
    writeFileSync(lessonPath, JSON.stringify(lesson, null, 2), 'utf-8');
  }

  console.log(`[성공] 총 ${manifest.totalChapters}개 챕터, ${manifest.totalLessons}개 레슨 데이터셋 구축 완료!`);
  console.log(`출력 디렉터리: ${OUT_DIR}`);
}

main();
