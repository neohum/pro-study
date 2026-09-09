// 02-wordfreq — 단어 빈도 분석기 (solution)
//
// wordfreq.go: 단어 정규화, 빈도 집계, 정렬 및 포맷팅 로직.
package main

import (
	"bufio"
	"fmt"
	"io"
	"slices"
	"strings"
	"unicode"
	"unicode/utf8"
)

// Pair는 단어와 그 출현 횟수다.
type Pair struct {
	Word  string
	Count int
}

// CleanWord는 단어 앞뒤에 붙은 구두점/기호를 잘라내고 소문자로 정규화한다.
// 최소 길이(minLen) 미만인 경우 빈 문자열을 반환한다.
func CleanWord(raw string, minLen int, ignoreCase bool) string {
	cleaned := strings.TrimFunc(raw, func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsDigit(r)
	})
	if ignoreCase {
		cleaned = strings.ToLower(cleaned)
	}
	if utf8.RuneCountInString(cleaned) < minLen {
		return ""
	}
	return cleaned
}

// CountWords는 bufio.Scanner로 스트림을 순회하며 정규화된 단어 빈도를 집계한다.
func CountWords(r io.Reader, minLen int, ignoreCase bool) (map[string]int, error) {
	counts := make(map[string]int)
	scanner := bufio.NewScanner(r)
	scanner.Split(bufio.ScanWords)
	for scanner.Scan() {
		word := CleanWord(scanner.Text(), minLen, ignoreCase)
		if word != "" {
			counts[word]++
		}
	}
	if err := scanner.Err(); err != nil {
		return counts, err
	}
	return counts, nil
}

// TopN은 map을 []Pair 슬라이스로 변환하고 빈도 내림차순(동점 시 사전순 오름차순)으로 정렬한다.
func TopN(counts map[string]int, n int) []Pair {
	pairs := make([]Pair, 0, len(counts))
	for w, c := range counts {
		pairs = append(pairs, Pair{Word: w, Count: c})
	}
	slices.SortFunc(pairs, func(a, b Pair) int {
		if a.Count != b.Count {
			return b.Count - a.Count // 빈도 내림차순
		}
		return strings.Compare(a.Word, b.Word) // 사전순 오름차순
	})
	if n > 0 && n < len(pairs) {
		return pairs[:n]
	}
	return pairs
}

// FormatResults는 정렬된 단어 빈도 목록을 w에 사람이 읽기 쉬운 형식으로 출력한다.
func FormatResults(w io.Writer, pairs []Pair) {
	if len(pairs) == 0 {
		fmt.Fprintln(w, "(결과 없음)")
		return
	}
	for i, p := range pairs {
		fmt.Fprintf(w, "%3d: %-12s (%d)\n", i+1, p.Word, p.Count)
	}
}
