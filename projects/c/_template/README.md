# NN. 프로젝트 제목

## 무엇을 만드는가

완성했을 때 실행 모습을 텍스트로 보여 준다.

```
$ build/app.exe add "우유 사기"
1  [ ] 우유 사기
```

## 왜 이 프로젝트인가

어떤 프로그래밍 개념이 깊어지는지, 앞·뒤 프로젝트와 어떻게 이어지는지 3~5문장.

## 핵심 개념

### 개념 1

5~10줄 설명과 최소 코드.

```go
type Item struct {
    ID   int    `json:"id"`
    Text string `json:"text"`
}
```

### 개념 2

## 단계별 구현

`starter/`의 `TODO(step-N)` 주석과 1:1이다. 단계마다 `go build`가 되는지, 어떤 테스트가 새로 통과하는지 적는다.

### Step 1: …

확인: `gcc -std=c23 ... && build/app.exe < tests/cases/01-hello.in`

### Step 2: …

## 막혔을 때

| 증상 | 원인 |
| --- | --- |
| … | … |

## 더 나아가기

- 선택 과제 1
- 선택 과제 2

## 참고

- Go 언어 명세: <https://go.dev/ref/spec>
