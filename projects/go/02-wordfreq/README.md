# 02. 단어 빈도 분석기

## 무엇을 만드는가

텍스트 파일이나 표준 입력(stdin) 스트림을 읽어 단어를 추출하고, 대소문자 정규화 및 구두점 제거를 거친 뒤 출현 빈도 순으로 정렬하여 상위 단어 목록을 출력하는 CLI 도구다.

```
$ build/app.exe -top 5 sample.txt
  1: the          (14)
  2: to           (8)
  3: and          (7)
  4: go           (5)
  5: programming  (3)

$ cat sample.txt | build/app.exe -top 3 -min-len 3
  1: the          (14)
  2: and          (7)
  3: programming  (3)
```

## 왜 이 프로젝트인가

대용량 텍스트나 로그를 다룰 때 메모리에 전체 파일을 올리지 않고 스트림 방식으로 처리하는 것은 백엔드 엔지니어의 필수 역량이다.

이 프로젝트에서는 Go 표준 라이브러리의 `bufio.Scanner`를 이용해 임의 크기의 텍스트 스트림을 효율적으로 순회하고, `unicode`와 `strings` 패키지로 다국어 문자열을 안전하게 정규화하며, `map`을 사용한 카운팅과 Go 1.21에 도입된 `slices.SortFunc`를 활용한 다중 기준 정렬(빈도 내림차순 + 알파벳 오름차순)을 배운다. 아울러 Go 실무에서 가장 널리 쓰이는 테이블 주도 테스트(Table-Driven Test) 기법을 체득한다.

## 핵심 개념

### bufio.Scanner와 토큰 분리

`bufio.Scanner`는 `io.Reader`로부터 입력을 버퍼링하여 줄 또는 단어 단위로 읽어내는 표준 도구다. `Split(bufio.ScanWords)`를 지정하면 공백 문자를 기준으로 편리하게 토큰을 나눌 수 있다.

```go
scanner := bufio.NewScanner(r)
scanner.Split(bufio.ScanWords)
for scanner.Scan() {
    token := scanner.Text()
    // 토큰 처리
}
if err := scanner.Err(); err != nil {
    return err
}
```

### unicode 패키지와 룬(Rune) 기반 정규화

영문뿐 아니라 한글, 특수문자가 섞인 텍스트에서 단어 앞뒤의 구두점(콤마, 마침표, 따옴표 등)을 안전하게 제거하려면 바이트 단위가 아닌 `rune` 단위 처리가 필요하다. `strings.TrimFunc`와 `unicode.IsLetter`, `unicode.IsDigit`를 조합하면 단어 외곽의 불필요한 기호를 깔끔하게 정리할 수 있다.

```go
cleaned := strings.TrimFunc(raw, func(r rune) bool {
    return !unicode.IsLetter(r) && !unicode.IsDigit(r)
})
```

### slices.SortFunc와 결정적(Deterministic) 정렬

`map[string]int`의 순회 순서는 무작위이므로, 순위 집계를 위해 구조체 슬라이스(`[]Pair`)로 변환한 후 정렬해야 한다. `slices.SortFunc`를 쓰면 1차 기준(빈도 내림차순)과 2차 기준(동점일 때 단어 사전순 오름차순)을 명확하게 정의하여 항상 동일한 정렬 결과를 보장할 수 있다.

```go
slices.SortFunc(pairs, func(a, b Pair) int {
    if a.Count != b.Count {
        return b.Count - a.Count // 빈도 내림차순
    }
    return strings.Compare(a.Word, b.Word) // 사전순 오름차순
})
```

### 테이블 주도 테스트 (Table-Driven Tests)

Go의 관용적 테스트 방식은 입력값과 기대값을 슬라이스로 정의하고 루프를 돌며 검증하는 것이다. `t.Run`을 사용하면 케이스별 하위 테스트(subtest)로 분리되어 실패한 케이스를 쉽게 식별할 수 있다.

```go
tests := []struct {
    name     string
    input    string
    expected string
}{
    {"punctuation", "hello, world!", "hello"},
    {"uppercase", "GOPHER", "gopher"},
}
for _, tc := range tests {
    t.Run(tc.name, func(t *testing.T) { ... })
}
```

## 단계별 구현

`starter/wordfreq.go`와 `starter/main.go`의 `TODO(step-N)` 주석이 아래 단계와 1:1이다.

### Step 1: 단어 정규화와 필터링

`CleanWord(raw string, minLen int, ignoreCase bool) string` 함수를 작성한다.
- 단어 앞뒤에 붙은 구두점 및 기호(`!unicode.IsLetter && !unicode.IsDigit`)를 잘라낸다.
- `ignoreCase`가 참이면 `strings.ToLower`로 소문자화한다.
- 결과 단어의 `utf8.RuneCountInString`이 `minLen` 미만이면 빈 문자열 `""`을 반환하여 제외한다.

확인: `go test -run TestCleanWord ./...`

### Step 2: 텍스트 스트림 스캔과 빈도 집계

`CountWords(r io.Reader, minLen int, ignoreCase bool) (map[string]int, error)` 함수를 작성한다.
- `bufio.NewScanner(r)`를 생성하고 `scanner.Split(bufio.ScanWords)`를 설정한다.
- 각 토큰마다 `CleanWord`를 호출하고, 유효한 단어(`!= ""`)는 `counts[word]++`로 빈도를 센다.
- 스캔이 끝난 후 `scanner.Err()`를 확인하여 반환한다.

확인: `go test -run TestCountWords ./...`

### Step 3: 슬라이스 정렬과 상위 N개 추출

`TopN(counts map[string]int, n int) []Pair` 함수를 작성한다.
- `map[string]int`의 모든 키-값을 `Pair{Word, Count}` 슬라이스로 변환한다.
- `slices.SortFunc`를 사용하여 빈도 내림차순으로 정렬하고, 빈도가 같으면 단어 알파벳 오름차순으로 정렬한다.
- `n > 0 && n < len(pairs)`인 경우 상위 `n`개만 슬라이싱하여 반환한다. `n <= 0`이면 전체를 반환한다.

확인: `go test -run TestTopN ./...`

### Step 4: 결과 포맷팅과 출력

`FormatResults(w io.Writer, pairs []Pair)` 함수를 작성한다.
- `len(pairs) == 0`이면 `"(결과 없음)\n"`을 출력한다.
- 그렇지 않으면 순위(1부터), 단어, 빈도를 `fmt.Fprintf(w, "%3d: %-12s (%d)\n", i+1, p.Word, p.Count)` 형식으로 출력한다.

확인: `go test -run TestFormatResults ./...`

### Step 5: CLI 플래그와 파이프라인 결합

`run(args []string, stdin io.Reader, stdout, stderr io.Writer) int` 함수를 완성한다.
- `flag.NewFlagSet`으로 `-top`(기본 10), `-min-len`(기본 1), `-ignore-case`(기본 true) 플래그를 파싱한다.
- 지정된 파일 인자가 없거나 `"-"`인 경우 `stdin`에서 스트림을 읽는다. 파일이 주어지면 각 파일을 열어 빈도를 누적 집계한다.
- 정렬 및 포맷팅 결과를 `stdout`에 출력하고, 정상 처리 시 0, 파일 읽기 오류 시 1, 플래그 오류 시 2를 반환한다.

확인: `go test -run TestRun ./...`

## 막혔을 때

| 증상 | 원인 |
| --- | --- |
| 한글 단어의 길이가 예상과 다르게 계산됨 | `len(s)`는 바이트 길이이므로 한글 한 글자가 3으로 계산된다. 글자 수는 `utf8.RuneCountInString(s)`를 사용해야 한다 |
| 테스트 실행 시마다 정렬 결과 순서가 바뀜 | Go의 map 순회 순서는 무작위다. 동점(tie) 단어에 대해 2차 정렬 기준(`strings.Compare`)을 적용하지 않으면 순서가 뒤바뀐다 |
| 긴 줄이 포함된 파일에서 스캐너 오류 발생 | `bufio.Scanner`의 기본 버퍼 크기(64KB)를 초과하는 줄이 있으면 `bufio.ErrTooLong`이 발생한다 |
| `flag redefined` 패닉 | 테스트에서 `flag.CommandLine`(전역)을 사용했다. `flag.NewFlagSet`을 매번 새로 생성해야 한다 |

## 더 나아가기

- 영문 불용어(Stopwords: the, is, at, which 등) 목록을 받아 집계에서 제외하는 `-stopwords` 플래그 추가
- 문자열뿐만 아니라 글자 단위(Rune/Char) 빈도 분석 모드 지원
- CSV 또는 JSON 형식으로 결과를 내보내는 `-format` 플래그 구현

## 참고

- Go 표준 라이브러리: `bufio.Scanner` (<https://pkg.go.dev/bufio#Scanner>)
- Go 표준 라이브러리: `slices` 패키지 (<https://pkg.go.dev/slices>)
- Go 표준 라이브러리: `unicode` 패키지 (<https://pkg.go.dev/unicode>)
- The Go Blog: Strings, bytes, runes and characters in Go (<https://go.dev/blog/strings>)
