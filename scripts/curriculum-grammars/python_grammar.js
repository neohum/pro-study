/**
 * scripts/curriculum-grammars/python_grammar.js
 * Python 언어 (3.12+ 최신 표준) 핵심 문법 16개 종합 학습 콘텐츠
 */

module.exports = [
  {
    id: "py-vars-types",
    title: "1. 동적 타이핑과 기본 데이터 타입",
    category: "기초 문법",
    summary: "Python은 동적 타입 언어로 변수 선언 시 타입을 명시하지 않아도 대입되는 값에 따라 타입이 자동 결정됩니다. int, float, str, bool, NoneType이 기본입니다.",
    syntax: "x = 42\nname = \"Python\"\nis_valid = True\ndata = None",
    example: `# Python 기본 데이터 타입
age = 25              # int (무제한 정밀도)
pi = 3.14159          # float (64비트 배정밀도)
language = "Python 3" # str (유니코드 문자열)
is_easy = True        # bool (True 또는 False)
nothing = None        # NoneType (값이 없음을 명시)

print(f"Type of age: {type(age).__name__}")
print(f"Type of pi: {type(pi).__name__}")
print(f"Type of language: {type(language).__name__}")
print(f"Is nothing None? {nothing is None}")`,
    explanation: "Python의 int는 오버플로우가 없습니다. 아무리 큰 숫자(예: 2**1000)라도 컴퓨터 메모리가 허용하는 한 자동으로 자릿수를 늘려 계산합니다.",
    pitfalls: "동적 타이핑이므로 변수에 나중에 다른 타입의 값을 재대입할 수 있지만, 실수로 숫자에 문자열을 덮어쓰는 런타임 타입 버그를 유발할 수 있으므로 주의해야 합니다.",
    practice: "문제: Python에서 어떤 변수의 자료형을 확인하기 위해 사용하는 내장 함수는 무엇일까요?\n정답: type()"
  },
  {
    id: "py-operators-logic",
    title: "2. 연산자와 불리언 논리 (and, or, is, in)",
    category: "연산자",
    summary: "산술(//: 몫, **: 거듭제곱), 영단어로 된 논리 연산자(and, or, not), 객체 동일성 검사(is), 멤버십 검사(in)를 지원합니다.",
    syntax: "q = 7 // 2   # 3 (정수 몫)\np = 2 ** 10  # 1024 (거듭제곱)\nis_present = 'a' in 'apple'",
    example: `x = 7
y = 2

print(f"나눗셈(/): {x / y}")   # 3.5 (항상 float 반환)
print(f"몫(//): {x // y}")      # 3 (소수점 버림)
print(f"나머지(%): {x % y}")    # 1
print(f"거듭제곱(**): {x ** y}") # 49 (7^2)

# 논리 및 멤버십 연산자
is_adult = True
has_id = False
can_enter = is_adult and has_id # False
print("Can enter?", can_enter)

fruits = ["apple", "banana"]
print("'apple' in fruits?", "apple" in fruits) # True`,
    explanation: "== 연산자는 두 객체의 '값(Value)'이 같은지 비교하고, is 연산자는 두 변수가 메모리 상의 '동일한 객체(Identity)'를 가리키는지 비교합니다. None 검사에는 항상 is None을 씁니다.",
    pitfalls: "나눗셈(/) 결과는 6 / 2 처럼 딱 나누어떨어져도 정수가 아니라 항상 float(3.0)으로 반환됩니다.",
    practice: "문제: 2의 8제곱(256)을 계산하는 가장 직관적인 Python 산술 연산식은 무엇일까요?\n정답: 2 ** 8"
  },
  {
    id: "py-control-flow",
    title: "3. 조건문 (if-elif-else)과 조건부 표현식",
    category: "제어 흐름",
    summary: "들여쓰기(Indentation, 공백 4칸)로 코드 블록을 구성하며, if-elif-else 구문과 한 줄로 쓰는 삼항 조건부 표현식을 지원합니다.",
    syntax: "if condition:\n    ...\nelif other:\n    ...\nelse:\n    ...\nval = a if condition else b",
    example: `score = 85

# 1. 표준 조건문
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"

print(f"Score: {score}, Grade: {grade}")

# 2. 조건부 표현식 (삼항 연산자)
status = "Pass" if score >= 60 else "Fail"
print(f"Status: {status}")

# 3. Truthy와 Falsy: 빈 문자열, 0, 빈 리스트[]는 False 취급
items = []
if not items:
    print("Items list is empty!")`,
    explanation: "Python은 switch 문 대신 오랫동안 if-elif를 사용해 왔으며, Python 3.10부터는 구조적 패턴 매칭(match-case)이 공식 추가되었습니다.",
    pitfalls: "들여쓰기(Indentation)가 어긋나면 IndentationError 문법 에러가 발생하므로 탭과 스페이스를 섞어 쓰지 말고 공백 4칸으로 통일해야 합니다.",
    practice: "문제: Python에서 0, None, \"\", [], {}는 조건문에서 참(True)으로 평가될까요 거짓(False)으로 평가될까요?\n정답: 거짓 (Falsy 값)"
  },
  {
    id: "py-loops-range",
    title: "4. 반복문 (for-in과 range(), while, for-else)",
    category: "제어 흐름",
    summary: "for-in 루프로 컬렉션이나 range() 수열을 순회합니다. break로 탈출하지 않고 정상 종료되었을 때 실행되는 독특한 for-else 구문을 제공합니다.",
    syntax: "for i in range(start, stop, step): ...\nwhile cond: ...\nfor x in items: ... else: ...",
    example: `# 1. range() 수열 순회
for i in range(1, 6): # 1부터 5까지
    print(i, end=" ")
print()

# 2. enumerate()로 인덱스와 원소 동시 추출
languages = ["Python", "Rust", "Go"]
for idx, lang in enumerate(languages):
    print(f"[{idx}] {lang}")

# 3. for-else 구문: break 없이 끝까지 돌았을 때 실행
target = 7
for num in [2, 4, 6, 8]:
    if num == target:
        print("Found target!")
        break
else:
    print(f"Target {target} not found in the list.")`,
    explanation: "range(1, 6)은 6을 포함하지 않는 반열린 구간 [1, 6)입니다. for-else에서 else 블록은 루프가 break로 중단되지 않고 온전히 다 돌았을 때만 실행됩니다.",
    pitfalls: "while 문에서 탈출 조건을 갱신하지 않으면 프로그램이 멈추지 않는 무한 루프에 빠집니다.",
    practice: "문제: range(0, 10, 2)가 생성하는 숫자들을 나열하면 어떻게 될까요?\n정답: 0, 2, 4, 6, 8"
  },
  {
    id: "py-functions-args",
    title: "5. 함수 정의, *args와 **kwargs 가변 인자",
    category: "함수와 스코프",
    summary: "def 키워드로 함수를 정의합니다. 기본값 매개변수와 개수가 정해지지 않은 위치 인자(*args 튜플) 및 키워드 인자(**kwargs 딕셔너리)를 지원합니다.",
    syntax: "def func(a, b=10, *args, **kwargs):\n    return result",
    example: `def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# *args(위치 가변 인자)와 **kwargs(키워드 가변 인자)
def print_summary(*args, **kwargs):
    print("Position args (Tuple):", args)
    print("Keyword args (Dict):", kwargs)

print(greet("Alice"))
print(greet("Bob", greeting="Good morning"))

print_summary(1, 2, 3, mode="fast", debug=True)`,
    explanation: "*args는 전달된 여분의 위치 인자들을 하나의 튜플로 묶어주고, **kwargs는 전달된 여분의 key=value 인자들을 딕셔너리로 묶어줍니다.",
    pitfalls: "기본값 매개변수로 가변 객체(예: def f(x=[]))를 넣으면 모든 함수 호출 간에 같은 리스트가 공유되는 유명한 버그가 발생합니다. 반드시 def f(x=None)을 쓰세요.",
    practice: "문제: 키워드 인자들을 딕셔너리 형태로 가변 수신하기 위해 매개변수 이름 앞에 붙이는 기호는 무엇일까요?\n정답: ** (별표 두 개, **kwargs)"
  },
  {
    id: "py-lambda-builtin",
    title: "6. 람다(lambda) 함수와 고차 함수 (map, filter)",
    category: "함수형 프로그래밍",
    summary: "이름 없는 간단한 한 줄짜리 익명 함수를 lambda 키워드로 생성하며, map(), filter(), sorted()의 정렬 키 등으로 활용합니다.",
    syntax: "square = lambda x: x ** 2\nsorted_list = sorted(items, key=lambda x: x['age'])",
    example: `# 1. 람다 함수 정의
add = lambda a, b: a + b
print(f"3 + 5 = {add(3, 5)}")

# 2. sorted()에 정렬 기준 key 함수 전달
students = [
    {"name": "Alice", "score": 92},
    {"name": "Bob", "score": 85},
    {"name": "Charlie", "score": 98},
]
# 점수(score) 기준 내림차순 정렬
sorted_students = sorted(students, key=lambda s: s["score"], reverse=True)
for s in sorted_students:
    print(f"{s['name']}: {s['score']}")

# 3. map()과 filter()
nums = [1, 2, 3, 4, 5]
evens = list(filter(lambda x: x % 2 == 0, nums)) # [2, 4]
print("Evens:", evens)`,
    explanation: "lambda 본문에는 여러 줄의 문장이나 할당문을 쓸 수 없으며, 오직 단 하나의 표현식만 올 수 있고 그 평가 결과가 자동으로 반환됩니다.",
    pitfalls: "복잡한 로직을 억지로 한 줄의 람다로 작성하면 가독성이 극도로 나빠집니다. 2줄 이상이거나 이름이 필요한 함수는 일반 def로 정의하세요.",
    practice: "문제: lambda x, y: x * y 에서 x=4, y=5를 넣었을 때의 결과값은 얼마일까요?\n정답: 20"
  },
  {
    id: "py-lists-comprehension",
    title: "7. 리스트(List)와 리스트 컴프리헨션",
    category: "데이터 구조",
    summary: "순서가 있고 수정 가능한 가변(Mutable) 시퀀스입니다. 간결하고 수학적인 리스트 컴프리헨션([x for x in ... if ...])으로 데이터를 변환합니다.",
    syntax: "squares = [x**2 for x in range(10) if x % 2 == 0]",
    example: `# 1. 기본 리스트 조작
fruits = ["apple", "banana"]
fruits.append("cherry")     # 뒤에 추가
fruits.insert(1, "orange")  # 특정 위치 삽입
popped = fruits.pop()       # 마지막 원소 꺼내기
print("Fruits:", fruits)

# 2. 리스트 슬라이싱 [start:stop:step]
numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print("Even slices:", numbers[::2])       # [0, 2, 4, 6, 8]
print("Reverse list:", numbers[::-1])     # 거꾸로 뒤집기!

# 3. 강력한 리스트 컴프리헨션
even_squares = [x**2 for x in range(1, 11) if x % 2 == 0]
print("Even squares 1~10:", even_squares) # [4, 16, 36, 64, 100]`,
    explanation: "리스트 슬라이싱 numbers[::-1]은 원본을 손상시키지 않고 거꾸로 뒤집힌 새 리스트를 생성하는 가장 파이써닉(Pythonic)한 관용구입니다.",
    pitfalls: "a = [1, 2]; b = a 처럼 단순 대입하면 같은 메모리 주소를 가리키므로 b.append(3) 시 a도 바뀝니다. 복제하려면 b = a.copy() 또는 a[:]를 씁니다.",
    practice: "문제: [x * 2 for x in [1, 2, 3]] 리스트 컴프리헨션의 최종 결과는 무엇일까요?\n정답: [2, 4, 6]"
  },
  {
    id: "py-dicts-sets",
    title: "8. 딕셔너리(Dict)와 세트(Set)",
    category: "데이터 구조",
    summary: "딕셔너리는 고유한 키(Key)와 값(Value)을 매핑하는 해시테이블이며, 세트(Set)는 중복 없는 고유한 원소들의 수학적 집합을 관리합니다.",
    syntax: "d = {\"key\": \"value\"}\ns = {1, 2, 3} # 세트 (중복 자동 제거)",
    example: `# 1. 딕셔너리 조작
user = {"name": "Alice", "age": 28, "role": "Engineer"}
user["email"] = "alice@example.com" # 추가/수정

# get() 메서드로 안전한 조회 (키가 없어도 에러 대신 기본값 반환)
salary = user.get("salary", "Undisclosed")
print(f"Name: {user['name']}, Salary: {salary}")

# 딕셔너리 순회
for key, val in user.items():
    print(f"  {key}: {val}")

# 2. 세트(Set)와 집합 연산
set_a = {1, 2, 3, 4}
set_b = {3, 4, 5, 6}
print("교집합(&):", set_a & set_b) # {3, 4}
print("합집합(|):", set_a | set_b) # {1, 2, 3, 4, 5, 6}
print("차집합(-):", set_a - set_b) # {1, 2}`,
    explanation: "딕셔너리에서 존재하지 않는 키를 d['unknown']으로 조회하면 KeyError가 발생하므로, 안전하게 기본값을 반환하는 d.get('key', default)을 쓰는 것이 좋습니다.",
    pitfalls: "세트나 딕셔너리의 키로는 수정 가능한 리스트(List)를 넣을 수 없습니다. 해시 가능한 불변(Immutable) 타입(문자열, 숫자, 튜플)만 가능합니다.",
    practice: "문제: 리스트 nums = [1, 2, 2, 3, 3, 3]에서 중복을 단 한 줄로 제거하는 방법은 무엇일까요?\n정답: list(set(nums))"
  },
  {
    id: "py-tuples-unpacking",
    title: "9. 튜플(Tuple), 언패킹과 match-case 패턴 매칭",
    category: "데이터 구조",
    summary: "튜플은 한 번 생성하면 값을 바꿀 수 없는 불변(Immutable) 시퀀스입니다. 다중 대입 언패킹과 Python 3.10+의 구조적 패턴 매칭(match-case)을 지원합니다.",
    syntax: "point = (10, 20)\nx, y = point // 언패킹\nmatch command: case 'quit': ...",
    example: `# 1. 튜플과 스왑 언패킹
a = 10
b = 20
a, b = b, a # 임시 변수 없이 한 줄로 변수 맞바꾸기!
print(f"After swap: a={a}, b={b}")

# 2. 확장 언패킹 (*rest)
first, *middle, last = [1, 2, 3, 4, 5]
print(f"First: {first}, Middle: {middle}, Last: {last}")

# 3. Python 3.10+ match-case 구조적 패턴 매칭
def handle_command(cmd):
    match cmd:
        case ("go", direction):
            print(f"Moving to {direction}")
        case ("get", item):
            print(f"Picking up {item}")
        case "quit":
            print("Quitting game")
        case _:
            print("Unknown command")

handle_command(("go", "north"))
handle_command("quit")`,
    explanation: "튜플은 불변이므로 딕셔너리의 키나 세트의 원소로 사용할 수 있으며, 함수에서 여러 값을 쉼표(return a, b)로 묶어 반환할 때 자동으로 튜플로 패킹됩니다.",
    pitfalls: "원소가 1개인 튜플을 만들 때는 (5)가 아니라 반드시 쉼표를 찍어 (5,) 로 작성해야 합니다. 쉼표가 없으면 단순 괄호로 취급됩니다.",
    practice: "문제: Python에서 a = 1, b = 2 두 변수의 값을 맞바꾸는 가장 파이써닉한 한 줄 코드는 무엇일까요?\n정답: a, b = b, a"
  },
  {
    id: "py-strings-formatting",
    title: "10. 문자열 조작과 모던 f-string 포맷팅",
    category: "데이터 구조",
    summary: "문자열은 불변 시퀀스입니다. split, join, strip 등의 메서드와 Python 3.6+의 초고속 표현식 삽입 기능인 f-string을 사용합니다.",
    syntax: "f\"Hello, {name}! Value: {val:.2f}, Expr: {1 + 2}\"",
    example: `name = "Alice"
score = 98.7654
rank = 1

# f-string: 변수, 수식, 서식 지정자 동시 지원
print(f"User: {name.upper()}, Rank: #{rank:02d}, Score: {score:.2f}")

# Python 3.8+ 디버깅 f-string (변수명과 값을 동시 출력)
width = 10
height = 5
print(f"{width=}, {height=}, {width * height=}")

# 문자열 분리와 연결
csv_data = "apple,banana,orange,grape"
fruit_list = csv_data.split(",") # 분리
joined = " - ".join(fruit_list)   # 연결
print("Joined:", joined)`,
    explanation: "f-string은 기존의 % 포맷팅이나 .format()에 비해 가독성이 월등히 뛰어나며, 컴파일 타임에 최적화되어 실행 속도도 가장 빠릅니다.",
    pitfalls: "문자열은 불변(Immutable)이므로 s[0] = 'H' 처럼 특정 글자를 직접 인덱스로 수정하려고 하면 TypeError가 발생합니다.",
    practice: "문제: 실수 pi = 3.14159를 소수점 둘째 자리까지만(3.14) f-string으로 출력하는 서식 표현식은 무엇일까요?\n정답: f\"{pi:.2f}\""
  },
  {
    id: "py-classes-oop",
    title: "11. 클래스(Class)와 객체 지향 프로그래밍",
    category: "객체 지향",
    summary: "class 키워드로 사용자 정의 타입을 만듭니다. 인스턴스 초기화 생성자 __init__과 인스턴스 자신을 가리키는 첫 번째 매개변수 self를 사용합니다.",
    syntax: "class Dog:\n    def __init__(self, name):\n        self.name = name\n    def bark(self):\n        return f\"{self.name} barks!\"",
    example: `class BankAccount:
    # 클래스 변수 (모든 인스턴스가 공유)
    interest_rate = 0.03

    def __init__(self, owner, balance=0):
        # 인스턴스 변수 (각 객체 고유의 상태)
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
            print(f"Deposited {amount}. New balance: {self.balance}")

    def withdraw(self, amount):
        if 0 < amount <= self.balance:
            self.balance -= amount
            return amount
        print("Insufficient funds!")
        return 0

account = BankAccount("Alice", 1000)
account.deposit(500)
account.withdraw(200)
print(f"Owner: {account.owner}, Balance: {account.balance}")`,
    explanation: "클래스 메서드의 첫 번째 인자로 반드시 self를 선언해야 인스턴스의 변수와 메서드에 접근할 수 있습니다. 호출 시에는 self를 전달하지 않아도 Python이 자동으로 넘겨줍니다.",
    pitfalls: "인스턴스 변수로 초기화해야 할 가변 객체(리스트 등)를 클래스 변수로 선언하면 모든 인스턴스가 같은 리스트를 공유하는 치명적 버그가 발생합니다.",
    practice: "문제: Python 클래스에서 인스턴스가 생성될 때 자동으로 호출되는 생성자 메서드 이름은 무엇일까요?\n정답: __init__"
  },
  {
    id: "py-inheritance-dunder",
    title: "12. 상속(super())과 매직 메서드 (Dunder Methods)",
    category: "객체 지향",
    summary: "부모 클래스의 기능을 물려받는 상속과 부모 생성자를 부르는 super(), 그리고 연산자 오버로딩을 가능케 하는 더블 언더스코어(__) 매직 메서드를 지원합니다.",
    syntax: "class Child(Parent):\n    def __init__(self): super().__init__()\n    def __str__(self): return \"text\"",
    example: `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    # + 덧셈 연산자 오버로딩 (v1 + v2)
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    # len(v) 함수 지원
    def __len__(self):
        return int((self.x**2 + self.y**2)**0.5)

    # 문자열 출력 형태 정의 (print(v))
    def __str__(self):
        return f"Vector({self.x}, {self.y})"

    # 동등 비교 (v1 == v2)
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

v1 = Vector(3, 4)
v2 = Vector(1, 2)
v3 = v1 + v2 # __add__ 자동 호출!

print("v1 + v2 =", v3)
print("Length of v1:", len(v1)) # 5
print("v1 == Vector(3, 4)?", v1 == Vector(3, 4))`,
    explanation: "__str__은 사용자 친화적인 문자열을, __repr__은 개발자를 위한 객체 재현 가능한 문자열을 반환합니다. __add__, __len__ 등으로 내장 연산자를 객체에 맞춤 구현합니다.",
    pitfalls: "자식 클래스에서 __init__을 재정의하면서 super().__init__()을 호출하지 않으면 부모 클래스의 초기화 로직이 누락되어 속성이 사라집니다.",
    practice: "문제: 객체를 print() 함수나 str()로 출력할 때 표시될 문자열을 정의하는 매직 메서드는 무엇일까요?\n정답: __str__"
  },
  {
    id: "py-exceptions",
    title: "13. 예외 처리 (try-except-else-finally)와 raise",
    category: "에러 처리",
    summary: "런타임 에러를 try-except 구문으로 안전하게 가로채며, 예외가 없을 때 실행되는 else 블록과 무조건 실행되는 finally 정리 블록을 제공합니다.",
    syntax: "try:\n    ...\nexcept SpecificError as e:\n    ...\nelse: # 예외 없을 때\n    ...\nfinally: # 항상 실행\n    ...",
    example: `def calculate_ratio(a, b):
    try:
        val_a = float(a)
        val_b = float(b)
        result = val_a / val_b
    except ValueError as e:
        print(f"Input is not a valid number: {e}")
        return None
    except ZeroDivisionError:
        print("Cannot divide by zero!")
        return None
    else:
        print("Calculation succeeded!")
        return result
    finally:
        print("--- Operation completed ---")

print("Result 1:", calculate_ratio("10", "2"))
print("Result 2:", calculate_ratio("10", "0"))`,
    explanation: "except Exception as e를 쓰면 모든 범용 예외를 잡을 수 있지만, 가능한 한 발생 예상되는 구체적인 예외(ValueError, KeyError 등)를 명시하는 것이 버그 추적에 유리합니다.",
    pitfalls: "아무것도 하지 않는 빈 except: pass 문을 작성하면 오타로 인한 NameError나 시스템 인터럽트까지 삼켜버려 디버깅이 불가능해집니다.",
    practice: "문제: 개발자가 의도적으로 새로운 예외를 발생시킬 때 사용하는 키워드는 무엇일까요?\n정답: raise"
  },
  {
    id: "py-file-context-manager",
    title: "14. 파일 입출력과 with 컨텍스트 매니저",
    category: "입출력",
    summary: "open() 함수로 파일을 다루며, with 문을 사용하면 작업 도중 에러가 발생하더라도 파일 닫기(close())가 자동으로 100% 보장됩니다.",
    syntax: "with open(\"file.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"content\")",
    example: `filename = "example.txt"

# 1. 파일 쓰기 (with 문으로 자동 close 보장)
with open(filename, "w", encoding="utf-8") as f:
    f.write("Line 1: Python File I/O\\n")
    f.write("Line 2: Safe with Context Manager\\n")

# 2. 파일 읽기 (한 줄씩 순회)
with open(filename, "r", encoding="utf-8") as f:
    for line_num, line in enumerate(f, 1):
        print(f"[{line_num}] {line.strip()}")`,
    explanation: "with 문은 파이썬의 컨텍스트 매니저 프로토콜(__enter__, __exit__)을 따릅니다. 파일뿐만 아니라 데이터베이스 연결이나 스레드 락 등에도 자원 누수를 막기 위해 필수 사용됩니다.",
    pitfalls: "Windows 환경에서는 기본 인코딩이 cp949일 수 있으므로, 한글 깨짐을 방지하려면 항상 encoding=\"utf-8\"을 명시하는 습관이 필수적입니다.",
    practice: "문제: 파일을 다룬 후 close()를 수동으로 부르지 않아도 자동으로 자원을 반납해 주는 문법 키워드는 무엇일까요?\n정답: with (컨텍스트 매니저)"
  },
  {
    id: "py-generators-iterators",
    title: "15. 제너레이터(Generator)와 yield 지연 평가",
    category: "고급 문법",
    summary: "제너레이터는 대용량 데이터를 한 번에 메모리에 올리지 않고, 필요할 때마다 yield 키워드로 값을 하나씩 지연 생성(Lazy Evaluation)하는 특별한 이터레이터입니다.",
    syntax: "def count_up():\n    yield 1\n    yield 2\ngen_expr = (x**2 for x in range(1000000))",
    example: `# 1. 제너레이터 함수 정의
def fibonacci(limit):
    a, b = 0, 1
    count = 0
    while count < limit:
        yield a  # 값을 반환하고 실행 위치를 일시 정지
        a, b = b, a + b
        count += 1

# 피보나치 수열 8개 생성
for num in fibonacci(8):
    print(num, end=" ")
print()

# 2. 제너레이터 표현식 (메모리 절약)
# 100만 개의 제곱수를 메모리에 미리 만들지 않고 순회 시점에 계산
squares_gen = (x * x for x in range(1000000))
print("First value:", next(squares_gen)) # 0
print("Second value:", next(squares_gen)) # 1`,
    explanation: "리스트는 1000만 개를 만들면 수백 MB의 RAM을 즉시 소비하지만, 제너레이터는 현재 값 하나만 기억하므로 메모리 사용량이 거의 0(수십 바이트)에 불과합니다.",
    pitfalls: "제너레이터는 일회용(Single-pass)입니다. 한 번 끝까지 순회하고 나면 다시 처음부터 순회할 수 없으므로 필요하면 새로 생성해야 합니다.",
    practice: "문제: 제너레이터 함수 내부에서 값을 외부로 내보내고 함수 상태를 일시 중지시키는 키워드는 무엇일까요?\n정답: yield"
  },
  {
    id: "py-decorators-typehints",
    title: "16. 데코레이터(@)와 타입 힌트 (Type Hints)",
    category: "고급 문법",
    summary: "데코레이터는 기존 함수의 코드를 건드리지 않고 기능을 덧붙이는 함수 래핑 문법(@)입니다. Python 3.5+부터는 타입 힌트와 어노테이션을 지원합니다.",
    syntax: "@decorator\ndef func(): ...\ndef greet(name: str) -> str: ...",
    example: `import time
from typing import List, Optional

# 1. 실행 시간 측정 데코레이터
def timer_decorator(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f"[{func.__name__}] Elapsed time: {elapsed:.6f}s")
        return result
    return wrapper

# 2. 타입 힌트가 적용된 함수에 데코레이터 부착
@timer_decorator
def process_data(items: List[int], threshold: Optional[int] = None) -> int:
    time.sleep(0.05) # 시뮬레이션 지연
    limit = threshold if threshold is not None else 0
    return sum(x for x in items if x > limit)

total = process_data([10, 25, 5, 40, 2], threshold=10)
print("Filtered Sum:", total)`,
    explanation: "@timer_decorator 는 process_data = timer_decorator(process_data) 의 우아한 축약 표기입니다. 타입 힌트는 mypy 같은 정적 분석기나 IDE의 자동완성을 극대화합니다.",
    pitfalls: "데코레이터를 적용하면 원본 함수의 __name__이나 독스트링이 wrapper로 바뀔 수 있으므로, functools.wraps 데코레이터로 원본 메타데이터를 보존하는 것이 정석입니다.",
    practice: "문제: 함수 위에 @ 기호를 붙여 기존 함수를 감싸고 기능을 확장하는 파이썬 패턴의 명칭은 무엇일까요?\n정답: 데코레이터 (Decorator)"
  }
];
