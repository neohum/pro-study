# 04. wc·grep·sort 텍스트 도구함

## 무엇을 만드는가

유닉스의 대표적인 텍스트 유틸리티인 `wc`(단어/줄/바이트 수), `grep`(패턴 검색), `sort`(줄 정렬)를 단일 CLI 바이너리로 통합한 도구다.
C23의 `#embed` 지시문으로 도움말 텍스트를 실행 파일 안에 직접 내장하고, 표준 입력(stdin)과 명령행 파일 인자(argv)를 모두 유연하게 처리한다.

```
$ build/app.exe help
textkit — 텍스트 처리 통합 CLI 도구

사용법:
  textkit help                    도움말 출력
  textkit wc [file...]            줄 수, 단어 수, 바이트 수 집계
  textkit grep [-i] [-n] <pat> [file...]   패턴 검색
  textkit sort [-r] [file...]     줄 단위 정렬

$ build/app.exe grep -i -n hello < input.txt
1:Hello there
3:say HELLO to my friend
```

## 왜 이 프로젝트인가

실무 C 프로그래밍은 단순 알고리즘을 넘어 운영체제 인터페이스(파일 I/O, 표준 입출력 스트림, 명령행 인자 argv)를 다루는 능력이 필수적이다.
또한 C 언어에서 문자열과 텍스트를 다룰 때 버퍼 오버플로를 방지하고 동적 배열을 안전하게 관리하는 패턴을 익혀야 한다.

이 프로젝트에서는 C23에 공식 추가된 획기적인 기능인 `#embed`를 활용하여 외부 리소스(도움말 텍스트)를 빌드 타임에 바이너리로 병합하는 방법을 배운다.
파이프라인(`stdin`)과 파일(`fopen`/`fclose`)을 단일 추상화로 다루는 기법과 `qsort`를 통한 함수 포인터 활용을 완성한다.

## 핵심 개념

### C23: `#embed`를 활용한 리소스 바이너리 내장

이전 C에서는 텍스트나 바이너리 파일을 코드에 포함하려면 `xxd -i` 같은 외부 도구로 C 소스 배열을 생성하거나 문자열 리터럴로 이스케이프해야 했다.
C23의 `#embed`는 전처리기 지시문으로 파일의 바이트들을 배열 초기화자로 직접 삽입한다.

```c
static const char HELP_TEXT[] = {
#embed "embed/help.txt"
, '\0' // C 문자열 종료 널 문자 추가
};
```

### 스트림 추상화와 `stdin` 처리

`FILE*` 포인터를 사용하는 함수(`count_stream`, `run_grep_stream`)를 작성하면,
인자가 없을 때는 표준 입력 `stdin`을 넘기고, 파일 경로가 주어졌을 때는 `fopen`한 핸들을 넘겨 동일한 처리 로직을 공유할 수 있다.

```c
FILE *fp = (filename == nullptr) ? stdin : fopen(filename, "r");
```

### qsort와 함수 포인터 기반 정렬

C 표준 라이브러리의 `qsort`는 임의의 배열을 정렬할 수 있는 범용 퀵소트 함수다.
비교 기준을 함수 포인터로 전달받으며, 오름차순과 내림차순(`-r`)을 비교 함수의 인자 순서만 바꾸어 구현할 수 있다.

```c
static int compare_asc(const void *a, const void *b) {
    return strcmp(*(const char * const *)a, *(const char * const *)b);
}
```

## 단계별 구현

`starter/main.c`의 `TODO(step-N)` 주석과 아래 단계가 1:1로 대응한다.

### Step 1: #embed 도움말 내장 및 argv 서브커맨드 디스패처

`#embed "embed/help.txt"`를 사용해 `HELP_TEXT` 배열을 정의한다.
`main` 함수에서 `argc`와 `argv[1]`을 확인하여 `help`, `wc`, `grep`, `sort`로 분기하고 인자가 없거나 `help`면 도움말을 출력한다.

확인: `build/app.exe help` 실행 시 `embed/help.txt` 내용이 정확히 출력되는지 확인한다.

### Step 2: wc 명령 구현

`count_stream`과 `cmd_wc`를 작성한다.
스트림에서 바이트 단위로 문자를 읽으며 개행 문자(`\n`) 수, 공백(`isspace`) 기준 단어 수, 전체 바이트 수를 계산하여 `줄단어바이트 [파일명]` 형식으로 출력한다.

확인: `build/app.exe wc < tests/cases/02-wc-stdin.in`의 결과가 케이스와 일치하는지 확인한다.

### Step 3: grep 명령 구현

`match_pattern`과 `cmd_grep`을 작성한다.
옵션 플래그 `-i`(대소문자 무시)와 `-n`(1부터 시작하는 줄 번호 표시)을 파싱하고, 입력 스트림의 각 줄에서 패턴이 부분 일치하는 경우 출력한다.

확인: `build/app.exe grep -i -n hello` 명령으로 대소문자 구분 없이 줄 번호와 함께 매칭되는지 확인한다.

### Step 4: sort 명령 구현

`cmd_sort`와 동적 문자열 배열을 작성한다.
입력의 모든 줄을 읽어 동적 배열에 저장한 뒤, `-r` 옵션 유무에 따라 `qsort`로 정렬하여 한 줄씩 출력하고 메모리를 해제한다.

확인: `build/app.exe sort` 및 `build/app.exe sort -r` 결과가 올바른 사전식 순서인지 확인한다.

### Step 5: 에러 처리

알 수 없는 서브커맨드(`error: unknown command '<cmd>'`), grep 패턴 누락(`error: missing pattern`), 파일 열기 실패(`error: cannot open '<file>'`) 에러 메시지를 표준 출력에 출력하도록 처리한다.

확인: `tests/cases/07-errors.out` 케이스를 통과하는지 확인한다.

## 막혔을 때

| 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| `#embed` 컴파일 에러 | gcc 버전이 C23을 지원하지 않거나 파일 경로 오류 | `-std=c23` 플래그 및 소스 파일 기준 상대 경로 확인 |
| `HELP_TEXT` 출력 시 깨진 문자열 발생 | `#embed`는 마지막 널 문자(`\0`)를 포함하지 않음 | 배열 초기화자 뒤에 `, '\0'` 명시 |
| `wc` 바이트 수 불일치 | 개행 문자(`\r\n` vs `\n`) 처리 차이 | C 표준 입출력의 텍스트 모드 바이트 카운팅 규칙 확인 |
| `strcasestr` 컴파일 경고/에러 | POSIX 전용 확장 함수로 C23 비표준 | `tolower` 기반의 자체 부분 문자열 검색 루프 작성 |

## 더 나아가기

- `grep`에 정규식(Regex) 또는 와일드카드(`*`, `?`) 검색 지원 추가
- `sort`에 숫자 크기 기준 정렬(`-n`) 추가
- 대용량 파일 처리를 위한 외부 정렬(External Merge Sort) 알고리즘 구현

## 참고

- C23 `#embed` 표준 제안서 (WG14 N3017)
- 유닉스 유틸리티 명세: IEEE Std 1003.1 (POSIX wc, grep, sort)
