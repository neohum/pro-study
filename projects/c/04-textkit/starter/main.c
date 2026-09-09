// 04-textkit — wc·grep·sort 통합 CLI (starter)
//
// C23 #embed로 도움말 텍스트를 실행 파일 안에 내장하고,
// 서브커맨드(wc, grep, sort)와 스트림·파일 처리를 통합한 텍스트 도구함이다.
//
// 가이드의 "단계별 구현"과 아래 TODO(step-N) 주석이 1:1로 대응한다.
// 각 단계를 끝낼 때마다 빌드해서 경고가 없는지 확인하자.
#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

constexpr int MAX_LINE = 4'096;

// ---------------------------------------------------------------------------
// TODO(step-1): #embed 도움말 내장 및 argv 서브커맨드 디스패처
// C23 #embed를 사용하여 embed/help.txt를 HELP_TEXT 배열에 컴파일 시간 바이트로 내장한다.
// main 함수에서 argv[1]을 검사하여 help, wc, grep, sort를 분기한다.
// ---------------------------------------------------------------------------
static const char HELP_TEXT[] = {
#embed "embed/help.txt"
, '\0'
};

// ---------------------------------------------------------------------------
// TODO(step-2): wc (줄 수, 단어 수, 바이트 수 집계)
// 스트림(fp)에서 바이트를 하나씩 읽어 개행 문자('\n'), 공백으로 구분되는 단어 수,
// 총 바이트 수를 집계하여 출력한다. 인자가 없으면 stdin을 처리한다.
// ---------------------------------------------------------------------------
static void cmd_wc(int argc, char **argv) {
    (void)argc;
    (void)argv;
    printf("error: not implemented\n");
}

// ---------------------------------------------------------------------------
// TODO(step-3): grep (패턴 검색, -i 대소문자 무시, -n 줄 번호)
// 옵션(-i, -n)과 검색 패턴을 파싱하고, 각 줄에서 패턴이 부분 일치하는 줄을 출력한다.
// -n 옵션이 주어지면 "줄번호:내용" 형식으로 출력한다.
// ---------------------------------------------------------------------------
static void cmd_grep(int argc, char **argv) {
    (void)argc;
    (void)argv;
    printf("error: not implemented\n");
}

// ---------------------------------------------------------------------------
// TODO(step-4): sort (줄 단위 정렬, -r 역순 정렬)
// 입력을 줄 단위로 동적 배열에 수집하고, qsort를 사용하여 오름차순(기본)
// 또는 내림차순(-r 옵션)으로 정렬하여 출력한다.
// ---------------------------------------------------------------------------
static void cmd_sort(int argc, char **argv) {
    (void)argc;
    (void)argv;
    printf("error: not implemented\n");
}

// ---------------------------------------------------------------------------
// TODO(step-5): 에러 처리
// 알 수 없는 서브커맨드("error: unknown command '<cmd>'\n"),
// grep 패턴 누락("error: missing pattern\n"),
// 존재하지 않는 파일 열기 실패("error: cannot open '<file>'\n")를 정해진 메시지로 출력한다.
// ---------------------------------------------------------------------------
int main(int argc, char **argv) {
    (void)MAX_LINE;
    if (argc <= 1) {
        printf("%s", HELP_TEXT);
        return 0;
    }
    const char *sub = argv[1];
    if (strcmp(sub, "help") == 0 || strcmp(sub, "--help") == 0 || strcmp(sub, "-h") == 0) {
        printf("%s", HELP_TEXT);
    } else if (strcmp(sub, "wc") == 0) {
        cmd_wc(argc - 2, argv + 2);
    } else if (strcmp(sub, "grep") == 0) {
        cmd_grep(argc - 2, argv + 2);
    } else if (strcmp(sub, "sort") == 0) {
        cmd_sort(argc - 2, argv + 2);
    } else {
        printf("error: unknown command '%s'\n", sub);
    }
    return 0;
}
