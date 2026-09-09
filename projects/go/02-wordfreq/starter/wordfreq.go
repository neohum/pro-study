// 02-wordfreq — 단어 빈도 분석기 (starter)
//
// wordfreq.go: 단어 정규화, 빈도 집계, 정렬 및 포맷팅 로직.
package main

import (
	"io"
)

// Pair는 단어와 그 출현 횟수다.
type Pair struct {
	Word  string
	Count int
}

// TODO(step-1): CleanWord
// 단어 앞뒤에 붙은 구두점/기호(!unicode.IsLetter && !unicode.IsDigit)를 잘라낸다.
// ignoreCase가 참이면 소문자(strings.ToLower)로 변환한다.
// 결과 단어의 글자 수(utf8.RuneCountInString)가 minLen 미만이면 빈 문자열 ""을 반환한다.
func CleanWord(raw string, minLen int, ignoreCase bool) string {
	_ = raw
	_ = minLen
	_ = ignoreCase
	return ""
}

// TODO(step-2): CountWords
// bufio.Scanner와 bufio.ScanWords를 사용하여 io.Reader에서 단어를 분리한다.
// 각 토큰을 CleanWord로 정규화한 뒤, 유효한 단어의 빈도를 map[string]int에 집계한다.
// scanner.Err()가 발생하면 에러를 반환한다.
func CountWords(r io.Reader, minLen int, ignoreCase bool) (map[string]int, error) {
	_ = r
	_ = minLen
	_ = ignoreCase
	return map[string]int{}, nil
}

// TODO(step-3): TopN
// counts map을 []Pair 슬라이스로 변환하고 slices.SortFunc로 정렬한다.
// 정렬 기준: 1차 빈도 내림차순 (Count desc), 2차 단어 사전순 오름차순 (Word asc).
// n > 0이고 n < len(pairs)이면 상위 n개만 반환하고, 아니면 전체를 반환한다.
func TopN(counts map[string]int, n int) []Pair {
	_ = counts
	_ = n
	return nil
}

// TODO(step-4): FormatResults
// len(pairs) == 0이면 "(결과 없음)\n"을 출력한다.
// 그렇지 않으면 순위(1부터), 단어, 빈도를 순서대로 w에 포맷팅하여 출력한다.
// 포맷 예: "%3d: %-12s (%d)\n"
func FormatResults(w io.Writer, pairs []Pair) {
	_ = w
	_ = pairs
}
