// 04-textkit — wc·grep·sort 통합 CLI (solution)
//
// C23 #embed로 도움말 텍스트를 실행 파일 안에 내장하고,
// 서브커맨드(wc, grep, sort)와 스트림·파일 처리를 통합한 텍스트 도구함이다.
#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

constexpr int MAX_LINE = 4'096;

// C23: #embed — 컴파일 시간에 텍스트/바이너리 파일을 바이트 배열 리터럴로 직접 내장
static const char HELP_TEXT[] = {
#embed "embed/help.txt"
, '\0'
};

static char *dup_str(const char *s) {
    size_t n = strlen(s) + 1;
    char *p = malloc(n);
    if (p != nullptr) {
        memcpy(p, s, n);
    }
    return p;
}

// ---- Step 2: wc (줄 수, 단어 수, 바이트 수) ----
static void count_stream(FILE *fp, size_t *out_lines, size_t *out_words, size_t *out_bytes) {
    size_t lines = 0, words = 0, bytes = 0;
    bool in_word = false;
    int c;
    while ((c = fgetc(fp)) != EOF) {
        bytes++;
        if (c == '\n') {
            lines++;
        }
        if (isspace((unsigned char)c)) {
            in_word = false;
        } else if (!in_word) {
            in_word = true;
            words++;
        }
    }
    *out_lines = lines;
    *out_words = words;
    *out_bytes = bytes;
}

static void cmd_wc(int argc, char **argv) {
    if (argc == 0) {
        size_t lines = 0, words = 0, bytes = 0;
        count_stream(stdin, &lines, &words, &bytes);
        printf("%zu %zu %zu\n", lines, words, bytes);
        return;
    }
    for (int i = 0; i < argc; i++) {
        FILE *fp = fopen(argv[i], "r");
        if (fp == nullptr) {
            printf("error: cannot open '%s'\n", argv[i]);
            return;
        }
        size_t lines = 0, words = 0, bytes = 0;
        count_stream(fp, &lines, &words, &bytes);
        fclose(fp);
        printf("%zu %zu %zu %s\n", lines, words, bytes, argv[i]);
    }
}

// ---- Step 3: grep (패턴 검색, -i 대소문자 무시, -n 줄 번호) ----
static bool match_pattern(const char *line, const char *pat, bool ignore_case) {
    if (*pat == '\0') {
        return true;
    }
    size_t plen = strlen(pat);
    for (const char *h = line; *h != '\0'; h++) {
        bool ok = true;
        for (size_t i = 0; i < plen; i++) {
            if (h[i] == '\0') {
                ok = false;
                break;
            }
            char c1 = h[i];
            char c2 = pat[i];
            if (ignore_case) {
                c1 = (char)tolower((unsigned char)c1);
                c2 = (char)tolower((unsigned char)c2);
            }
            if (c1 != c2) {
                ok = false;
                break;
            }
        }
        if (ok) {
            return true;
        }
    }
    return false;
}

static void run_grep_stream(FILE *fp, const char *pattern, bool ignore_case, bool show_line_num) {
    char line[MAX_LINE];
    size_t line_no = 0;
    while (fgets(line, sizeof line, fp) != nullptr) {
        line_no++;
        size_t len = strlen(line);
        while (len > 0 && (line[len - 1] == '\n' || line[len - 1] == '\r')) {
            line[--len] = '\0';
        }
        if (match_pattern(line, pattern, ignore_case)) {
            if (show_line_num) {
                printf("%zu:%s\n", line_no, line);
            } else {
                printf("%s\n", line);
            }
        }
    }
}

static void cmd_grep(int argc, char **argv) {
    bool ignore_case = false;
    bool show_line_num = false;
    const char *pattern = nullptr;
    int file_idx = -1;

    for (int i = 0; i < argc; i++) {
        if (argv[i][0] == '-' && argv[i][1] != '\0') {
            for (size_t j = 1; argv[i][j] != '\0'; j++) {
                if (argv[i][j] == 'i') {
                    ignore_case = true;
                } else if (argv[i][j] == 'n') {
                    show_line_num = true;
                }
            }
        } else if (pattern == nullptr) {
            pattern = argv[i];
        } else {
            file_idx = i;
            break;
        }
    }

    if (pattern == nullptr) {
        printf("error: missing pattern\n");
        return;
    }

    if (file_idx == -1) {
        run_grep_stream(stdin, pattern, ignore_case, show_line_num);
    } else {
        for (int i = file_idx; i < argc; i++) {
            FILE *fp = fopen(argv[i], "r");
            if (fp == nullptr) {
                printf("error: cannot open '%s'\n", argv[i]);
                return;
            }
            run_grep_stream(fp, pattern, ignore_case, show_line_num);
            fclose(fp);
        }
    }
}

// ---- Step 4: sort (줄 정렬, -r 역순 정렬) ----
typedef struct LineArray {
    char **items;
    size_t len;
    size_t cap;
} LineArray;

static void line_push(LineArray *arr, char *line) {
    if (arr->len + 1 > arr->cap) {
        size_t new_cap = arr->cap ? arr->cap * 2 : 16;
        arr->items = realloc(arr->items, new_cap * sizeof *arr->items);
        arr->cap = new_cap;
    }
    arr->items[arr->len++] = line;
}

static int compare_asc(const void *a, const void *b) {
    const char *s1 = *(const char * const *)a;
    const char *s2 = *(const char * const *)b;
    return strcmp(s1, s2);
}

static int compare_desc(const void *a, const void *b) {
    const char *s1 = *(const char * const *)a;
    const char *s2 = *(const char * const *)b;
    return strcmp(s2, s1);
}

static void read_lines(FILE *fp, LineArray *arr) {
    char line[MAX_LINE];
    while (fgets(line, sizeof line, fp) != nullptr) {
        size_t len = strlen(line);
        while (len > 0 && (line[len - 1] == '\n' || line[len - 1] == '\r')) {
            line[--len] = '\0';
        }
        line_push(arr, dup_str(line));
    }
}

static void cmd_sort(int argc, char **argv) {
    bool reverse = false;
    const char *filename = nullptr;

    for (int i = 0; i < argc; i++) {
        if (strcmp(argv[i], "-r") == 0) {
            reverse = true;
        } else if (filename == nullptr) {
            filename = argv[i];
        }
    }

    LineArray arr = {};
    if (filename == nullptr) {
        read_lines(stdin, &arr);
    } else {
        FILE *fp = fopen(filename, "r");
        if (fp == nullptr) {
            printf("error: cannot open '%s'\n", filename);
            return;
        }
        read_lines(fp, &arr);
        fclose(fp);
    }

    if (reverse) {
        qsort(arr.items, arr.len, sizeof(char *), compare_desc);
    } else {
        qsort(arr.items, arr.len, sizeof(char *), compare_asc);
    }

    for (size_t i = 0; i < arr.len; i++) {
        printf("%s\n", arr.items[i]);
        free(arr.items[i]);
    }
    free(arr.items);
}

// ---- Step 1 & 5: 메인 디스패처 및 에러 처리 ----
int main(int argc, char **argv) {
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
