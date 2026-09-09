# 01. JSON 저장 TODO CLI

## 무엇을 만드는가

터미널에서 할 일 목록을 추가하고 완료 처리하며 파일(`todo.json`)에 영속적으로 저장하는 명령줄 도구(CLI)다.

```
$ build/app.exe add "우유 사기"
1  [ ] 우유 사기
$ build/app.exe add "Go 공부하기"
2  [ ] Go 공부하기
$ build/app.exe list
1  [ ] 우유 사기
2  [ ] Go 공부하기
$ build/app.exe done 1
1  [x] 우유 사기
$ build/app.exe rm 1
$ build/app.exe list
2  [ ] Go 공부하기
```

## 왜 이 프로젝트인가

Go 언어의 핵심 철학은 단순함과 실용성이다. 복잡한 프레임워크 없이도 표준 라이브러리(`encoding/json`, `flag`, `os`, `io`)만으로 강력하고 안정적인 CLI 프로그램을 만들 수 있다.

이 프로젝트는 Go의 기초 문법 요소인 `struct`, 메서드 리시버(`*Store`), 슬라이스 조작(`slices` 패키지), 에러 래핑(`fmt.Errorf("%w")`, `errors.Is`), 그리고 안전한 파일 쓰기(원자적 교체)를 고루 익히는 첫 번째 프로젝트다.

## 핵심 개념

### 포인터 리시버와 슬라이스 수정

Go에서 구조체 메서드는 값 리시버(`(s Store)`) 또는 포인터 리시버(`(s *Store)`)를 가질 수 있다. 내부 상태를 변경하거나 `append` 결과를 반영하려면 반드시 포인터 리시버를 써야 한다.

```go
func (s *Store) Add(text string) (Item, error) {
    item := Item{ID: s.NextID, Text: text, CreatedAt: time.Now()}
    s.Items = append(s.Items, item)
    s.NextID++
    return item, nil
}
```

### 구조체 태그와 JSON 직렬화

`encoding/json`은 구조체의 필드 태그를 읽어 JSON 키 이름으로 매핑한다. 필드명이 대문자로 시작해야(exported) 패키지 외부에서 접근할 수 있다.

```go
type Item struct {
    ID        int       `json:"id"`
    Text      string    `json:"text"`
    Done      bool      `json:"done"`
    CreatedAt time.Time `json:"created_at"`
}
```

### 센티널 에러와 에러 래핑

정의된 에러 변수(`ErrNotFound`)를 `%w` 동사로 감싸서 반환하면, 호출자는 원본 메시지를 유지하면서도 `errors.Is`로 에러 유형을 판별할 수 있다.

```go
var ErrNotFound = errors.New("not found")

func (s *Store) Find(id int) (*Item, error) {
    for i := range s.Items {
        if s.Items[i].ID == id {
            return &s.Items[i], nil
        }
    }
    return nil, fmt.Errorf("id %d %w", id, ErrNotFound)
}
```

### 원자적 파일 쓰기 (Atomic File Write)

파일을 직접 덮어쓰다 프로그램이 중단되면 파일이 손상된다. 임시 파일(`.tmp`)에 먼저 쓰고 `os.Rename`으로 덮어치면 항상 온전한 파일 상태가 유지된다.

```go
tmp := path + ".tmp"
os.WriteFile(tmp, data, 0o644)
os.Rename(tmp, path)
```

## 단계별 구현

`starter/store.go`와 `starter/main.go`의 `TODO(step-N)` 주석이 아래 단계와 1:1이다.

### Step 1: 모델 정의와 Add

`Item` 구조체와 `Store` 구조체를 정의하고, `NewStore()` 및 `Add` 메서드를 구현한다.
공백만 있는 텍스트는 `ErrEmptyText`를 반환해야 한다.

확인: 빈 문자열 입력 시 에러가 반환되는지 확인한다.

### Step 2: JSON 저장과 불러오기

`Load(path)`와 `Save(path)`를 구현한다.
파일이 없으면 빈 저장소를 반환하고, `MarshalIndent`로 깔끔한 JSON 포맷을 유지한다.

확인: 생성된 JSON 파일이 올바른 포맷으로 쓰이는지 확인한다.

### Step 3: 항목 검색, 상태 변경, 삭제

`Find`, `Done`, `Undone`, `Remove`, `Clear` 메서드를 구현한다.
`slices.IndexFunc`와 `slices.Delete`를 활용해 슬라이스를 안전하게 다룬다.

확인: 항목 번호로 완료 처리 및 삭제가 정상 작동하는지 확인한다.

### Step 4: 목록 포맷팅과 출력

`List(io.Writer)`와 `formatItem`을 구현한다.
`%-3d[%s] %s` 형식으로 번호와 체크박스를 정렬한다.

확인: `list` 명령 결과가 서식에 맞게 출력되는지 확인한다.

### Step 5: CLI 플래그와 서브커맨드 디스패치

`flag.NewFlagSet`으로 `-file` 옵션을 파싱하고, `dispatch` 함수로 각 서브커맨드(`add`, `list`, `done`, `undone`, `rm`, `clear`)를 연결한다.

확인: `app.exe add "테스트"` 및 `app.exe list`가 명령줄에서 잘 동작하는지 확인한다.

## 막혔을 때

| 증상 | 원인 |
| --- | --- |
| `Add`를 호출해도 목록이 늘어나지 않음 | 메서드 리시버가 `(s Store)` 값 리시버로 선언되어 복사본만 수정되었다 |
| JSON 파일에 필드가 저장되지 않음 | 구조체 필드명이 소문자로 시작하면 `encoding/json`에서 unexported로 무시된다 |
| 테스트 실행 시 `flag redefined` 패닉 | `flag.CommandLine`(전역) 대신 `flag.NewFlagSet`을 사용해야 한다 |
| `rm` 실행 시 잘못된 항목이 삭제됨 | 슬라이스 인덱스와 항목 `ID`는 다르다. 반드시 `it.ID == id`인 위치를 찾아야 한다 |

## 더 나아가기

- 마감일(`due_date`) 필드를 추가하고 마감 지난 항목에 경고 표시 붙이기
- 우선순위(상/중/하) 플래그 지원하기
- 완료 여부로 필터링하는 `list -done`, `list -pending` 옵션 구현

## 참고

- The Go Blog: JSON and Go (<https://go.dev/blog/json>)
- Go 표준 라이브러리: `slices` 패키지 (<https://pkg.go.dev/slices>)
- Go 표준 라이브러리: `flag` 패키지 (<https://pkg.go.dev/flag>)
