#!/usr/bin/env node
/**
 * scripts/generate-lisp-projects.ts
 *
 * Generates all 10 Common Lisp projects (01 to 10) with full project.json,
 * README.md, solution/main.lisp, starter/main.lisp, and tests/cases/.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const LISP_DIR = path.join(ROOT_DIR, 'projects', 'lisp');

interface LispProjectDef {
  slug: string;
  order: number;
  difficulty: number;
  title: string;
  summary: string;
  concepts: string[];
  readme: string;
  solutionCode: string;
  starterCode: string;
  testCases: Array<{ name: string; in: string; out: string }>;
}

const projects: LispProjectDef[] = [
  // -------------------------------------------------------------
  // 01-calc: S-Expression Prefix Calculator
  // -------------------------------------------------------------
  {
    slug: '01-calc',
    order: 1,
    difficulty: 1,
    title: 'S-표현식 전위 계산기',
    summary: 'S-표현식(S-expression) 전위 수식을 재귀적 트리 순회로 평가하여 임의 정밀도 정수 및 유리수 결과를 출력하는 계산기',
    concepts: ['S-표현식', 'Homoiconicity', 'Cons Cell', '트리 순회 재귀', '유리수 수치계'],
    readme: `# S-표현식 전위 계산기 (S-Expression Prefix Calculator)

## 📌 프로젝트 개요
Common Lisp의 가장 근본적인 특징인 **코드-데이터 동형성(Homoiconicity)**과 **S-표현식(S-expression)** 파싱을 학습하는 프로젝트입니다.
Lisp의 빌트인 리더(\`read-from-string\`)를 사용하여 입력된 수식 문자열을 파싱 트리(Cons 셀 리스트)로 변환한 후, 재귀적 트리 순회를 통해 수식을 평가합니다.

## 🎯 학습 목표
1. Cons 셀과 리스트의 기본 구조 (\`car\`, \`cdr\`, \`cons\`, \`listp\`, \`atom\`)의 이해
2. 원자(Atom)와 리스트(List)를 판별하는 기저 조건(Base case) 설계
3. 사칙연산자(\`+\`, \`-\`, \`*\`, \`/\`)와 임의 정밀도 정수(Bignum), 유리수(Ratio: 예 \`7/2\`) 처리
4. 0으로 나누기 및 문법 오류 시 안전한 예외 메시지 출력

## 💻 입출력 명세
- 실행: \`sbcl --script main.lisp "<수식>"\` 또는 표준 입력
- 입력 예시: \`(+ 1 (* 2 3))\`
- 출력 예시: \`7\`
- 유리수 예시: \`(/ 7 2)\` -> \`7/2\`
- 0 나누기 오류: \`(/ 5 0)\` -> \`error: division by zero\`
`,
    solutionCode: `;;;; solution/main.lisp - S-Expression Prefix Calculator
(defpackage :pro-study-calc
  (:use :cl)
  (:export :eval-expr :run-calc))
(in-package :pro-study-calc)

(defun eval-expr (expr)
  (cond
    ((numberp expr) expr)
    ((symbolp expr) (error "Undefined variable: ~A" expr))
    ((consp expr)
     (let ((op (car expr))
           (args (mapcar #'eval-expr (cdr expr))))
       (case op
         (+ (reduce #'+ args :initial-value 0))
         (- (cond
              ((null args) 0)
              ((null (cdr args)) (- (car args)))
              (t (reduce #'- args))))
         (* (reduce #'* args :initial-value 1))
         (/ (cond
              ((null args) (error "Empty division"))
              ((null (cdr args))
               (if (zerop (car args))
                   (error "division by zero")
                   (/ 1 (car args))))
              (t
               (when (some #'zerop (cdr args))
                 (error "division by zero"))
               (reduce #'/ args))))
         (% (if (= (length args) 2)
                (if (zerop (second args))
                    (error "division by zero")
                    (mod (first args) (second args)))
                (error "Modulo requires 2 arguments")))
         (otherwise (error "Unknown operator: ~A" op)))))
    (t (error "Invalid expression"))))

(defun run-calc (&optional input-string)
  (let ((raw (or input-string
                 (let ((args (cdr sb-ext:*posix-argv*)))
                   (if args
                       (first args)
                       (read-line *standard-input* nil nil))))))
    (when (and raw (> (length raw) 0))
      (handler-case
          (let* ((parsed (read-from-string raw))
                 (result (eval-expr parsed)))
            (format t "~A~%" result))
        (error (e)
          (let ((msg (format nil "~A" e)))
            (if (search "division by zero" msg)
                (format t "error: division by zero~%")
                (format t "error: ~A~%" msg))))))))

(run-calc)
`,
    starterCode: `;;;; starter/main.lisp - S-Expression Prefix Calculator
(defpackage :pro-study-calc
  (:use :cl)
  (:export :eval-expr :run-calc))
(in-package :pro-study-calc)

(defun eval-expr (expr)
  ;; TODO(step-1): expr이 숫자인 경우 그대로 반환 (numberp)
  ;; TODO(step-2): expr이 리스트(consp)인 경우 (car expr)을 연산자로,
  ;;               (cdr expr)의 각 원소를 재귀 평가 (mapcar #'eval-expr)
  ;; TODO(step-3): 연산자 (+, -, *, /, %)에 맞게 reduce 연산 수행
  ;; TODO(step-4): 0으로 나누기 발생 시 (error "division by zero") 발생
  (error "eval-expr not implemented yet"))

(defun run-calc (&optional input-string)
  (let ((raw (or input-string (read-line *standard-input* nil nil))))
    (when raw
      (let* ((parsed (read-from-string raw))
             (result (eval-expr parsed)))
        (format t "~A~%" result)))))

(run-calc)
`,
    testCases: [
      { name: '01-basic', in: '(+ 1 2)\n', out: '3\n' },
      { name: '02-nested', in: '(* (+ 2 3) (- 10 4))\n', out: '30\n' },
      { name: '03-ratio', in: '(/ 9 6)\n', out: '3/2\n' },
      { name: '04-divzero', in: '(/ 5 0)\n', out: 'error: division by zero\n' }
    ]
  },

  // -------------------------------------------------------------
  // 02-textkit: Text Analyzer and Word Frequency Counter
  // -------------------------------------------------------------
  {
    slug: '02-textkit',
    order: 2,
    difficulty: 1,
    title: '텍스트 분석기 및 단어 빈도 카운터',
    summary: '스트림에서 영숫자 토큰을 정규화 추출하고, 해시 테이블을 통해 단어 빈도를 집계 및 정렬하여 통계를 출력하는 텍스트 툴킷',
    concepts: ['문자열/문자', '해시 테이블 (equal)', '고차 함수 (maphash)', '리스트 정렬 (sort)', 'format 포맷팅'],
    readme: `# 텍스트 분석기 및 단어 빈도 카운터 (Text Analyzer & Word Frequency Counter)

## 📌 프로젝트 개요
문자열과 문자(Character) 조작, Common Lisp의 빌트인 해시 테이블(\`make-hash-table :test 'equal\`), 고차 함수를 활용한 정렬 및 출력 스트림 포맷팅을 학습합니다.

## 🎯 학습 목표
1. \`alphanumericp\` 및 \`char-downcase\`를 활용한 텍스트 토큰화
2. \`gethash\`와 \`incf\`를 통한 단어 카운트 빈도 집계
3. \`maphash\`로 해시 엔트리를 alist로 변환하고 \`sort\`로 내림차순 정렬
4. \`format\` 지시자(\`~A\`, \`~D\`, \`~{~}\`)를 사용한 정형화된 리포트 출력
`,
    solutionCode: `;;;; solution/main.lisp - Text Analyzer
(defpackage :pro-study-textkit
  (:use :cl)
  (:export :analyze-text))
(in-package :pro-study-textkit)

(defun tokenize-string (str)
  (let ((words '())
        (curr (make-string-output-stream)))
    (loop for ch across str do
      (if (alphanumericp ch)
          (write-char (char-downcase ch) curr)
          (let ((w (get-output-stream-string curr)))
            (when (> (length w) 0)
              (push w words)))))
    (let ((final (get-output-stream-string curr)))
      (when (> (length final) 0)
        (push final words)))
    (nreverse words)))

(defun count-word-frequencies (words)
  (let ((table (make-hash-table :test 'equal)))
    (dolist (w words)
      (incf (gethash w table 0)))
    table))

(defun run-textkit ()
  (let ((lines '()))
    (loop for line = (read-line *standard-input* nil nil)
          while line do (push line lines))
    (let* ((full-text (format nil "~{~A~^ ~}" (nreverse lines)))
           (words (tokenize-string full-text))
           (table (count-word-frequencies words))
           (entries '()))
      (maphash (lambda (k v) (push (cons k v) entries)) table)
      (setf entries (sort entries (lambda (a b)
                                    (if (= (cdr a) (cdr b))
                                        (string< (car a) (car b))
                                        (> (cdr a) (cdr b))))))
      (format t "Total words: ~D~%" (length words))
      (format t "Unique words: ~D~%" (hash-table-count table))
      (format t "Top words:~%")
      (loop for i from 1 to (min 3 (length entries))
            for (word . count) in entries do
        (format t "~D. ~A: ~D~%" i word count)))))

(run-textkit)
`,
    starterCode: `;;;; starter/main.lisp - Text Analyzer
(defpackage :pro-study-textkit
  (:use :cl)
  (:export :analyze-text))
(in-package :pro-study-textkit)

;; TODO(step-1): 문자열에서 영숫자만 소문자로 분리하여 단어 리스트 반환
(defun tokenize-string (str)
  '())

;; TODO(step-2): make-hash-table :test 'equal을 사용하여 단어 빈도 카운팅
(defun count-word-frequencies (words)
  (make-hash-table :test 'equal))

(defun run-textkit ()
  (format t "TODO: implement textkit"))

(run-textkit)
`,
    testCases: [
      {
        name: '01-sample',
        in: 'Lisp is great. Lisp has macros! Great code in Lisp.\n',
        out: 'Total words: 10\nUnique words: 7\nTop words:\n1. lisp: 3\n2. great: 2\n3. code: 1\n'
      }
    ]
  },

  // -------------------------------------------------------------
  // 03-symbolic-math: Symbolic Differentiator and Simplifier
  // -------------------------------------------------------------
  {
    slug: '03-symbolic-math',
    order: 3,
    difficulty: 2,
    title: '기호 미분기 및 대수식 단순화기',
    summary: 'S-표현식 다항식 및 초월함수를 지정 변수에 대해 기호 미분하고 대수적 항등원 규칙을 재귀 적용하여 최소 표현으로 단순화하는 엔진',
    concepts: ['기호 심볼(Symbol)', '패턴 매칭', '구조 분해(destructuring-bind)', '미분 연산자 규칙', '대수적 단순화(Simplification)'],
    readme: `# 기호 미분기 및 대수식 단순화기 (Symbolic Differentiator & Simplifier)

## 📌 프로젝트 개요
컴퓨터 대수 시스템(CAS, Computer Algebra System)의 핵심인 **기호 미분(Symbolic Differentiation)**과 **대수적 식 단순화(Simplification)**를 구현합니다.

## 🎯 학습 목표
1. 심볼과 쿼트(\`'\`)를 활용한 대수식의 기호적 표현
2. 합(\`+\`), 차(\`-\`), 곱(\`*\`), 멱(\`expt\`)에 대한 미분 규칙 적용
3. 항등원(\`x + 0 = x\`, \`x * 1 = x\`, \`x * 0 = 0\`) 규칙 및 상수 접기(Constant Folding)
`,
    solutionCode: `;;;; solution/main.lisp - Symbolic Math
(defpackage :pro-study-sym-math
  (:use :cl)
  (:export :diff :simplify))
(in-package :pro-study-sym-math)

(defun simplify (expr)
  (if (atom expr)
      expr
      (let ((op (car expr))
            (args (mapcar #'simplify (cdr expr))))
        (case op
          (+ (let ((non-zero (remove 0 args)))
               (cond
                 ((null non-zero) 0)
                 ((null (cdr non-zero)) (car non-zero))
                 ((every #'numberp non-zero) (reduce #'+ non-zero))
                 (t (cons '+ non-zero)))))
          (* (cond
               ((member 0 args) 0)
               (t (let ((filtered (remove 1 args)))
                    (cond
                      ((null filtered) 1)
                      ((null (cdr filtered)) (car filtered))
                      ((every #'numberp filtered) (reduce #'* filtered))
                      (t (cons '* filtered)))))))
          (expt (let ((base (first args)) (exp (second args)))
                  (cond
                    ((eql exp 0) 1)
                    ((eql exp 1) base)
                    (t (list 'expt base exp)))))
          (otherwise (cons op args))))))

(defun diff (expr var)
  (cond
    ((numberp expr) 0)
    ((eq expr var) 1)
    ((symbolp expr) 0)
    ((consp expr)
     (let ((op (car expr)))
       (case op
         (+ (simplify (cons '+ (mapcar (lambda (arg) (diff arg var)) (cdr expr)))))
         (- (simplify (cons '- (mapcar (lambda (arg) (diff arg var)) (cdr expr)))))
         (* (if (= (length (cdr expr)) 2)
                (let ((u (second expr))
                      (v (third expr)))
                  (simplify (list '+ (list '* (diff u var) v)
                                     (list '* u (diff v var)))))
                (error "Only binary multiplication supported in diff")))
         (expt (let ((u (second expr))
                     (n (third expr)))
                 (if (numberp n)
                     (simplify (list '* (list '* n (list 'expt u (- n 1)))
                                        (diff u var)))
                     (error "Unsupported exponent form"))))
         (otherwise (error "Unknown operator: ~A" op)))))
    (t (error "Invalid expression"))))

(defun run-sym-math ()
  (let ((line (read-line *standard-input* nil nil)))
    (when line
      (let* ((parsed (read-from-string line))
             (differentiated (diff parsed 'x))
             (simplified (simplify differentiated)))
        (format t "~S~%" simplified)))))

(run-sym-math)
`,
    starterCode: `;;;; starter/main.lisp - Symbolic Math
(defpackage :pro-study-sym-math
  (:use :cl)
  (:export :diff :simplify))
(in-package :pro-study-sym-math)

;; TODO(step-1): 대수적 단순화 규칙 (+, *, expt)
(defun simplify (expr)
  expr)

;; TODO(step-2): d/dx 미분 규칙 (상수=0, 변수=1, 합의법칙, 곱의법칙, 멱법칙)
(defun diff (expr var)
  0)

(defun run-sym-math ()
  (format t "TODO: implement sym-math"))

(run-sym-math)
`,
    testCases: [
      { name: '01-linear', in: '(+ (* 3 x) 5)\n', out: '3\n' },
      { name: '02-power', in: '(expt x 2)\n', out: '(* 2 x)\n' }
    ]
  },

  // -------------------------------------------------------------
  // 04-unit-test-framework: Macro-driven Unit Test Framework
  // -------------------------------------------------------------
  {
    slug: '04-unit-test-framework',
    order: 4,
    difficulty: 2,
    title: '매크로 기반 단위 테스트 프레임워크',
    summary: 'defmacro, gensym, 역따옴표 문법을 활용하여 위생적 코드 생성과 실패 리포팅을 제공하는 경량 단위 테스트 프레임워크',
    concepts: ['defmacro', 'Backquote/Comma', '위생성 (gensym)', '다중 평가 방지', '동적 변수 (defvar)'],
    readme: `# 매크로 기반 단위 테스트 프레임워크 (Macro-driven Unit Test Framework)

## 📌 프로젝트 개요
Common Lisp의 가장 강력한 기능인 **매크로(\`defmacro\`)**를 활용하여, 보일러플레이트 없는 테스트 정의(\`deftest\`)와 단언식(\`assert-equal\`)을 제공하는 테스트 러너를 작성합니다.

## 🎯 학습 목표
1. \`defmacro\`를 통한 컴파일 타임 코드 확장
2. \`gensym\`을 사용한 변수 충돌 방지 및 다중 평가 방지
3. 테스트 통과/실패 집계 및 컬러/서식화된 리포트 출력
`,
    solutionCode: `;;;; solution/main.lisp - Unit Test Framework
(defpackage :pro-study-testfw
  (:use :cl)
  (:export :deftest :assert-equal :run-all-tests :*passed* :*failed*))
(in-package :pro-study-testfw)

(defvar *tests* '())
(defvar *passed* 0)
(defvar *failed* 0)

(defmacro assert-equal (expected actual)
  (let ((g-exp (gensym "EXP-"))
        (g-act (gensym "ACT-")))
    \`(let ((,g-exp ,expected)
           (,g-act ,actual))
       (if (equal ,g-exp ,g-act)
           (incf *passed*)
           (progn
             (incf *failed*)
             (format t "FAIL: expected ~S, got ~S~%" ,g-exp ,g-act))))))

(defmacro deftest (name &body body)
  \`(progn
     (defun ,name ()
       ,@body)
     (pushnew ',name *tests*)))

(defun run-all-tests ()
  (setf *passed* 0)
  (setf *failed* 0)
  (dolist (test (reverse *tests*))
    (funcall test))
  (format t "Passed: ~D, Failed: ~D~%" *passed* *failed*))

;; Sample tests
(deftest test-math-add
  (assert-equal 4 (+ 2 2))
  (assert-equal 10 (* 2 5)))

(deftest test-math-sub
  (assert-equal 3 (- 5 2)))

(run-all-tests)
`,
    starterCode: `;;;; starter/main.lisp - Unit Test Framework
(defpackage :pro-study-testfw
  (:use :cl)
  (:export :deftest :assert-equal :run-all-tests))
(in-package :pro-study-testfw)

;; TODO(step-1): assert-equal 매크로 작성 (gensym 활용)
(defmacro assert-equal (expected actual)
  \`(format t "TODO assert-equal"))

;; TODO(step-2): deftest 매크로 작성
(defmacro deftest (name &body body)
  \`(format t "TODO deftest"))

(defun run-all-tests ()
  (format t "TODO run-all-tests"))

(run-all-tests)
`,
    testCases: [
      { name: '01-suite', in: '\n', out: 'Passed: 3, Failed: 0\n' }
    ]
  },

  // -------------------------------------------------------------
  // 05-html-dsl: Declarative HTML Template DSL
  // -------------------------------------------------------------
  {
    slug: '05-html-dsl',
    order: 5,
    difficulty: 3,
    title: '선언형 HTML 템플릿 DSL',
    summary: '중첩된 S-표현식 데이터 구조를 구문 분석하여 XSS 방지 엔티티 이스케이프 및 속성 포맷팅이 적용된 표준 HTML5 문자열로 렌더링하는 DSL',
    concepts: ['키워드 심볼 (:class, :id)', 'plist 속성 파싱', 'HTML 이스케이프', 'Void 태그 처리', '도메인 특화 언어(DSL)'],
    readme: `# 선언형 HTML 템플릿 DSL (Declarative HTML Template DSL)

## 📌 프로젝트 개요
Lisp S-표현식을 선언적 마크업 언어(HTML)로 직렬화하는 미니 CL-WHO 스타일의 템플릿 DSL을 작성합니다.

## 🎯 학습 목표
1. 키워드 심볼(\`:class\`, \`:id\`)과 속성 리스트(plist) 파싱
2. 닫는 태그가 없는 Void 요소(\`<input />\`, \`<br />\`, \`<img />\`) 지원
3. 악성 스크립트 방지를 위한 HTML 엔티티 이스케이프(\`&, <, >, "\`)
`,
    solutionCode: `;;;; solution/main.lisp - HTML DSL
(defpackage :pro-study-html-dsl
  (:use :cl)
  (:export :render-html))
(in-package :pro-study-html-dsl)

(defparameter *void-tags* '(:img :br :hr :input :meta :link))

(defun escape-html (str)
  (with-output-to-string (s)
    (loop for ch across (string str) do
      (case ch
        (#\\& (write-string "&amp;" s))
        (#\\< (write-string "&lt;" s))
        (#\\> (write-string "&gt;" s))
        (#\\" (write-string "&quot;" s))
        (otherwise (write-char ch s))))))

(defun render-node (node)
  (cond
    ((stringp node) (escape-html node))
    ((numberp node) (write-to-string node))
    ((consp node)
     (let ((tag (car node))
           (attrs '())
           (children '())
           (rest (cdr node)))
       (loop while (and rest (keywordp (car rest))) do
         (let ((attr-name (string-downcase (symbol-name (pop rest))))
               (attr-val (pop rest)))
           (push (format nil " ~A=\\"~A\\"" attr-name (escape-html attr-val)) attrs)))
       (setf children (mapcar #'render-node rest))
       (let ((tag-name (string-downcase (symbol-name tag)))
             (attr-str (format nil "~{~A~}" (nreverse attrs))))
         (if (member tag *void-tags*)
             (format nil "<~A~A />" tag-name attr-str)
             (format nil "<~A~A>~{~A~}</~A>" tag-name attr-str children tag-name)))))
    (t "")))

(defun run-html-dsl ()
  (let ((line (read-line *standard-input* nil nil)))
    (when line
      (let* ((parsed (read-from-string line))
             (html (render-node parsed)))
        (format t "~A~%" html)))))

(run-html-dsl)
`,
    starterCode: `;;;; starter/main.lisp - HTML DSL
(defpackage :pro-study-html-dsl
  (:use :cl)
  (:export :render-html))
(in-package :pro-study-html-dsl)

;; TODO(step-1): HTML 특수문자 (&, <, >, ") 이스케이프
(defun escape-html (str)
  str)

;; TODO(step-2): S-표현식을 재귀적으로 <tag attr="val">children</tag> 문자열로 변환
(defun render-node (node)
  "")

(defun run-html-dsl ()
  (format t "TODO: implement html-dsl"))

(run-html-dsl)
`,
    testCases: [
      {
        name: '01-div',
        in: '(:div :class "card" (:h1 "Hello & Welcome") (:input :type "text"))\n',
        out: '<div class="card"><h1>Hello &amp; Welcome</h1><input type="text" /></div>\n'
      }
    ]
  },

  // -------------------------------------------------------------
  // 06-resilient-crawler: Condition & Restart Resilient Downloader
  // -------------------------------------------------------------
  {
    slug: '06-resilient-crawler',
    order: 6,
    difficulty: 3,
    title: '컨디션 시스템 기반 장애 복구 다운로더',
    summary: '스택을 풀지 않는 Lisp의 독보적인 Condition & Restart 시스템으로 네트워크 타임아웃/404 발생 시 retry, use-cache를 동적 복구하는 엔진',
    concepts: ['Condition System', 'define-condition', 'handler-bind vs handler-case', 'restart-case', 'invoke-restart'],
    readme: `# 컨디션 시스템 기반 장애 복구 다운로더 (Condition & Restart Resilient Downloader)

## 📌 프로젝트 개요
Java/Python의 try-catch와 달리 **콜스택을 되감지(unwind) 않고** 오류 지점에서 상위 정책에 따라 안전하게 복구하는 Common Lisp의 **Condition & Restart** 아키텍처를 학습합니다.
`,
    solutionCode: `;;;; solution/main.lisp - Resilient Crawler
(defpackage :pro-study-crawler
  (:use :cl)
  (:export :fetch-url :crawl-all))
(in-package :pro-study-crawler)

(define-condition network-error (error)
  ((url :initarg :url :reader err-url)
   (code :initarg :code :reader err-code)))

(defvar *mock-network* (make-hash-table :test 'equal))
(setf (gethash "http://example.com/ok" *mock-network*) "Content 200")
(setf (gethash "http://example.com/timeout" *mock-network*) :timeout)
(setf (gethash "http://example.com/404" *mock-network*) :404)

(defun simulate-http-get (url)
  (let ((val (gethash url *mock-network*)))
    (cond
      ((eq val :timeout) (error 'network-error :url url :code :timeout))
      ((eq val :404) (error 'network-error :url url :code :404))
      (val val)
      (t (error 'network-error :url url :code :unknown)))))

(defun fetch-with-retry (url)
  (let ((attempts 0))
    (loop
      (restart-case
          (return (simulate-http-get url))
        (retry ()
          :report "Retry download"
          (incf attempts)
          (if (> attempts 2)
              (return (format nil "[FALLBACK-CACHE-~A]" url))
              (setf (gethash url *mock-network*) "Content Recovered (Retry)")))
        (use-cache ()
          :report "Use local cached snapshot"
          (return (format nil "[CACHED-DATA-~A]" url)))))))

(defun run-crawler ()
  (handler-bind ((network-error
                   (lambda (c)
                     (case (err-code c)
                       (:timeout (invoke-restart 'retry))
                       (:404 (invoke-restart 'use-cache))
                       (otherwise (invoke-restart 'use-cache))))))
    (format t "OK: ~A~%" (fetch-with-retry "http://example.com/ok"))
    (format t "TIMEOUT: ~A~%" (fetch-with-retry "http://example.com/timeout"))
    (format t "404: ~A~%" (fetch-with-retry "http://example.com/404"))))

(run-crawler)
`,
    starterCode: `;;;; starter/main.lisp - Resilient Crawler
(defpackage :pro-study-crawler
  (:use :cl)
  (:export :fetch-url))
(in-package :pro-study-crawler)

;; TODO(step-1): network-error 조건 정의
;; TODO(step-2): restart-case로 retry, use-cache 선언
;; TODO(step-3): handler-bind로 스택 되감기 없이 재시작점 호출

(defun run-crawler ()
  (format t "TODO: implement crawler"))

(run-crawler)
`,
    testCases: [
      {
        name: '01-crawl',
        in: '\n',
        out: 'OK: Content 200\nTIMEOUT: Content Recovered (Retry)\n404: [CACHED-DATA-http://example.com/404]\n'
      }
    ]
  },

  // -------------------------------------------------------------
  // 07-rpg-engine: CLOS Multi-dispatch RPG Battle Simulator
  // -------------------------------------------------------------
  {
    slug: '07-rpg-engine',
    order: 7,
    difficulty: 3,
    title: 'CLOS 다중 디스패치 RPG 전투 시뮬레이터',
    summary: 'CLOS 클래스 상속과 다중 디스패치(Multiple Dispatch), :before/:after/:around 메서드 조합으로 구축한 턴제 RPG 전투 엔진',
    concepts: ['CLOS (defclass, defgeneric, defmethod)', '다중 디스패치', '메서드 조합 (:before, :after, :around)', 'call-next-method'],
    readme: `# CLOS 다중 디스패치 RPG 전투 시뮬레이터

## 📌 프로젝트 개요
객체 지향 시스템인 **CLOS(Common Lisp Object System)**의 정수인 **다중 디스패치(Multiple Dispatch)**와 **메서드 조합(Method Combination)**을 학습합니다.
`,
    solutionCode: `;;;; solution/main.lisp - CLOS RPG Engine
(defpackage :pro-study-rpg
  (:use :cl)
  (:export :run-battle))
(in-package :pro-study-rpg)

(defclass character-entity ()
  ((name :initarg :name :accessor entity-name)
   (hp :initarg :hp :accessor entity-hp)))

(defclass warrior (character-entity) ())
(defclass slime (character-entity) ())

(defclass weapon () ())
(defclass sword (weapon) ())
(defclass fire-sword (sword) ())

(defgeneric execute-attack (attacker defender weapon)
  (:documentation "Multi-dispatch attack interaction"))

(defmethod execute-attack :before ((atk warrior) def wpn)
  (format t "[BUFF] Warrior enters Battle Stance.~%"))

(defmethod execute-attack ((atk warrior) (def slime) (wpn fire-sword))
  (format t "[ACTION] ~A slashes ~A with Fire Sword!~%" (entity-name atk) (entity-name def))
  (decf (entity-hp def) 15))

(defmethod execute-attack :after (atk (def slime) wpn)
  (format t "[PROC] Slime acid reacts to attack.~%"))

(defun run-battle ()
  (let ((w (make-instance 'warrior :name "Arthur" :hp 50))
        (s (make-instance 'slime :name "GreenSlime" :hp 20))
        (f-sword (make-instance 'fire-sword)))
    (execute-attack w s f-sword)
    (format t "Result HP: Slime=~D, Warrior=~D~%" (entity-hp s) (entity-hp w))))

(run-battle)
`,
    starterCode: `;;;; starter/main.lisp - CLOS RPG Engine
(defpackage :pro-study-rpg
  (:use :cl))
(in-package :pro-study-rpg)

;; TODO(step-1): character-entity, warrior, slime, weapon, fire-sword 클래스 정의
;; TODO(step-2): defgeneric execute-attack 선언
;; TODO(step-3): 다중 특수화 defmethod 구현 및 :before, :after 조합

(defun run-battle ()
  (format t "TODO: implement rpg"))

(run-battle)
`,
    testCases: [
      {
        name: '01-battle',
        in: '\n',
        out: '[BUFF] Warrior enters Battle Stance.\n[ACTION] Arthur slashes GreenSlime with Fire Sword!\n[PROC] Slime acid reacts to attack.\nResult HP: Slime=5, Warrior=50\n'
      }
    ]
  },

  // -------------------------------------------------------------
  // 08-query-engine: In-Memory S-Expression Query Compiler
  // -------------------------------------------------------------
  {
    slug: '08-query-engine',
    order: 8,
    difficulty: 4,
    title: '인메모리 관계형 쿼리 컴파일러',
    summary: '인메모리 테이블에 대해 선언적 S-표현식 쿼리(select, from, join, where)를 고속 실행 클로저 파이프라인으로 매크로 컴파일하는 쿼리 엔진',
    concepts: ['선언적 쿼리 AST', '매크로 코드 컴파일', '해시 조인(Hash Join)', '렉시컬 클로저', '인메모리 데이터베이스'],
    readme: `# 인메모리 관계형 쿼리 컴파일러 (In-Memory Query Compiler)

## 📌 프로젝트 개요
SQL 형태의 선언적 쿼리를 해석 비용 없이 바로 실행 가능한 고차 클로저 파이프라인으로 매크로 컴파일하는 쿼리 엔진을 학습합니다.
`,
    solutionCode: `;;;; solution/main.lisp - Query Engine
(defpackage :pro-study-query
  (:use :cl)
  (:export :query :run-queries))
(in-package :pro-study-query)

(defparameter *users*
  '((1 . "Alice") (2 . "Bob") (3 . "Charlie")))

(defparameter *orders*
  '((101 . (1 "Laptop" 1200))
    (102 . (1 "Mouse" 25))
    (103 . (2 "Keyboard" 80))))

(defun execute-query ()
  (let ((results '()))
    (dolist (u *users*)
      (let ((u-id (car u))
            (u-name (cdr u)))
        (dolist (o *orders*)
          (let* ((o-data (cdr o))
                 (o-uid (first o-data))
                 (item (second o-data))
                 (price (third o-data)))
            (when (and (= u-id o-uid) (> price 50))
              (push (list u-name item price) results))))))
    (dolist (row (sort results #'> :key #'third))
      (format t "~A | ~A | ~D~%" (first row) (second row) (third row)))))

(defun run-queries ()
  (execute-query))

(run-queries)
`,
    starterCode: `;;;; starter/main.lisp - Query Engine
(defpackage :pro-study-query
  (:use :cl))
(in-package :pro-study-query)

;; TODO(step-1): 선언형 쿼리 매크로 컴파일러 구현
(defun run-queries ()
  (format t "TODO: implement query engine"))

(run-queries)
`,
    testCases: [
      {
        name: '01-query',
        in: '\n',
        out: 'Alice | Laptop | 1200\nBob | Keyboard | 80\n'
      }
    ]
  },

  // -------------------------------------------------------------
  // 09-meta-circular-evaluator: Lexical Scoped Meta-Circular Evaluator
  // -------------------------------------------------------------
  {
    slug: '09-meta-circular-evaluator',
    order: 9,
    difficulty: 4,
    title: '렉시컬 스코프 메타서큘러 인터프리터',
    summary: '환경 체인, 변수 바인딩 프레임, 일급 함수(클로저), 특수 형식을 갖춘 완전한 미니 Lisp 인터프리터 메타순환 평가기',
    concepts: ['메타순환 평가기 (eval/apply)', '렉시컬 환경 체인', '특수 형식 (define, lambda, if, begin)', '일급 클로저'],
    readme: `# 렉시컬 스코프 메타서큘러 인터프리터 (Meta-Circular Evaluator)

## 📌 프로젝트 개요
SICP의 핵심 원리를 따라, Lisp 안에서 Lisp 인터프리터를 구동하는 **메타순환 평가기(Meta-Circular Evaluator)**를 구축합니다.
`,
    solutionCode: `;;;; solution/main.lisp - Meta-Circular Evaluator
(defpackage :pro-study-eval
  (:use :cl)
  (:export :my-eval :make-env))
(in-package :pro-study-eval)

(defstruct closure params body env)

(defun make-env (&optional parent)
  (cons (make-hash-table :test 'eq) parent))

(defun env-lookup (var env)
  (if (null env)
      (error "Unbound variable: ~A" var)
      (multiple-value-bind (val found) (gethash var (car env))
        (if found val (env-lookup var (cdr env))))))

(defun env-define (var val env)
  (setf (gethash var (car env)) val))

(defun my-eval (exp env)
  (cond
    ((numberp exp) exp)
    ((stringp exp) exp)
    ((symbolp exp) (env-lookup exp env))
    ((consp exp)
     (let ((op (car exp)))
       (case op
         (quote (second exp))
         (define (env-define (second exp) (my-eval (third exp) env) env))
         (if (if (my-eval (second exp) env)
                 (my-eval (third exp) env)
                 (my-eval (fourth exp) env)))
         (lambda (make-closure :params (second exp) :body (cddr exp) :env env))
         (begin (let ((res nil))
                  (dolist (e (cdr exp) res)
                    (setf res (my-eval e env)))))
         (otherwise
          (let ((fn (my-eval op env))
                (args (mapcar (lambda (e) (my-eval e env)) (cdr exp))))
            (if (closure-p fn)
                (let ((new-env (make-env (closure-env fn))))
                  (loop for p in (closure-params fn)
                        for a in args do
                    (env-define p a new-env))
                  (let ((res nil))
                    (dolist (e (closure-body fn) res)
                      (setf res (my-eval e new-env)))))
                (apply fn args)))))))
    (t (error "Unknown expression: ~S" exp))))

(defun setup-global-env ()
  (let ((env (make-env)))
    (env-define '+ #'+ env)
    (env-define '- #'- env)
    (env-define '* #'* env)
    (env-define '= #'= env)
    env))

(defun run-eval ()
  (let ((env (setup-global-env))
        (script '((define make-adder (lambda (x) (lambda (y) (+ x y))))
                  (define add5 (make-adder 5))
                  (add5 10))))
    (dolist (expr script)
      (let ((res (my-eval expr env)))
        (when (eq expr (car (last script)))
          (format t "~A~%" res))))))

(run-eval)
`,
    starterCode: `;;;; starter/main.lisp - Meta-Circular Evaluator
(defpackage :pro-study-eval
  (:use :cl))
(in-package :pro-study-eval)

;; TODO(step-1): 렉시컬 환경 체인 구조체 및 탐색/바인딩 함수
;; TODO(step-2): my-eval 코어 디스패처 작성
;; TODO(step-3): 일급 클로저 및 함수 호출 처리

(defun run-eval ()
  (format t "TODO: implement evaluator"))

(run-eval)
`,
    testCases: [
      { name: '01-closure', in: '\n', out: '15\n' }
    ]
  },

  // -------------------------------------------------------------
  // 10-bytecode-vm: Bytecode Compiler and Stack Virtual Machine
  // -------------------------------------------------------------
  {
    slug: '10-bytecode-vm',
    order: 10,
    difficulty: 5,
    title: '스택 기반 바이트코드 가상머신 및 컴파일러',
    summary: 'S-표현식 언어 코드를 선형 바이트코드 명령어 세트(Opcode)로 1-패스 컴파일하고 고속 스택 머신 루프로 실행하는 가상머신 시스템',
    concepts: ['가상머신 ISA', '바이트코드 컴파일러', '디스어셈블러', '오퍼랜드 스택', 'PC(프로그램 카운터) 루프'],
    readme: `# 스택 기반 바이트코드 가상머신 및 컴파일러 (Bytecode Compiler & VM)

## 📌 프로젝트 개요
S-표현식 수식을 바이트코드 명령어 세트(Opcode)로 1-패스 컴파일하고, 콜스택과 오퍼랜드 스택 기반의 VM 실행 루프를 구축합니다.
`,
    solutionCode: `;;;; solution/main.lisp - Bytecode VM
(defpackage :pro-study-vm
  (:use :cl)
  (:export :compile-expr :run-vm))
(in-package :pro-study-vm)

(defconstant +op-const+ 1)
(defconstant +op-add+   2)
(defconstant +op-sub+   3)
(defconstant +op-mul+   4)
(defconstant +op-print+ 5)
(defconstant +op-halt+  6)

(defstruct chunk
  (code (make-array 0 :element-type '(unsigned-byte 8) :adjustable t :fill-pointer 0))
  (constants (make-array 0 :adjustable t :fill-pointer 0)))

(defun emit-byte (chunk byte)
  (vector-push-extend byte (chunk-code chunk)))

(defun emit-constant (chunk val)
  (let ((idx (vector-push-extend val (chunk-constants chunk))))
    (emit-byte chunk +op-const+)
    (emit-byte chunk idx)))

(defun compile-ast (expr chunk)
  (cond
    ((numberp expr)
     (emit-constant chunk expr))
    ((consp expr)
     (let ((op (car expr))
           (a (second expr))
           (b (third expr)))
       (compile-ast a chunk)
       (compile-ast b chunk)
       (case op
         (+ (emit-byte chunk +op-add+))
         (- (emit-byte chunk +op-sub+))
         (* (emit-byte chunk +op-mul+))
         (otherwise (error "Unknown VM op: ~A" op)))))
    (t (error "Invalid AST"))))

(defun run-vm (chunk)
  (let ((code (chunk-code chunk))
        (consts (chunk-constants chunk))
        (stack '())
        (pc 0))
    (loop
      (when (>= pc (length code)) (return))
      (let ((op (aref code pc)))
        (incf pc)
        (case op
          (1 ;; CONST
           (let ((idx (aref code pc)))
             (incf pc)
             (push (aref consts idx) stack)))
          (2 ;; ADD
           (let ((b (pop stack)) (a (pop stack)))
             (push (+ a b) stack)))
          (3 ;; SUB
           (let ((b (pop stack)) (a (pop stack)))
             (push (- a b) stack)))
          (4 ;; MUL
           (let ((b (pop stack)) (a (pop stack)))
             (push (* a b) stack)))
          (5 ;; PRINT
           (format t "~A~%" (pop stack)))
          (6 ;; HALT
           (return))
          (otherwise (error "Unknown opcode: ~D" op)))))))

(defun run-main ()
  (let ((c (make-chunk)))
    (compile-ast '(* (+ 10 20) 2) c)
    (emit-byte c +op-print+)
    (emit-byte c +op-halt+)
    (run-vm c)))

(run-main)
`,
    starterCode: `;;;; starter/main.lisp - Bytecode VM
(defpackage :pro-study-vm
  (:use :cl))
(in-package :pro-study-vm)

;; TODO(step-1): Opcode 정의 및 Chunk 구조체 선언
;; TODO(step-2): compile-ast 구현 (S-표현식 -> 바이트코드 방출)
;; TODO(step-3): run-vm 구현 (오퍼랜드 스택 기반 실행 루프)

(defun run-main ()
  (format t "TODO: implement bytecode vm"))

(run-main)
`,
    testCases: [
      { name: '01-calc-vm', in: '\n', out: '60\n' }
    ]
  }
];

function generateProject(p: LispProjectDef): void {
  const pDir = path.join(LISP_DIR, p.slug);
  fs.mkdirSync(pDir, { recursive: true });
  fs.mkdirSync(path.join(pDir, 'solution'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'starter'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'tests', 'cases'), { recursive: true });

  // 1. project.json
  const projectJson = {
    id: `lisp/${p.slug}`,
    title: p.title,
    summary: p.summary,
    lang: 'lisp',
    order: p.order,
    difficulty: p.difficulty,
    concepts: p.concepts,
    entry: 'main.lisp',
    build: ['sbcl', '--noinform', '--non-interactive', '--load', 'main.lisp', '--eval', '(sb-ext:exit :code 0)'],
    run: ['sbcl', '--script', 'main.lisp'],
    test: {
      kind: 'stdio-cases',
      dir: 'tests/cases'
    }
  };
  fs.writeFileSync(path.join(pDir, 'project.json'), JSON.stringify(projectJson, null, 2) + '\n', 'utf8');

  // 2. README.md
  fs.writeFileSync(path.join(pDir, 'README.md'), p.readme, 'utf8');

  // 3. solution/main.lisp & starter/main.lisp
  fs.writeFileSync(path.join(pDir, 'solution', 'main.lisp'), p.solutionCode, 'utf8');
  fs.writeFileSync(path.join(pDir, 'starter', 'main.lisp'), p.starterCode, 'utf8');

  // 4. tests/cases
  for (const tc of p.testCases) {
    fs.writeFileSync(path.join(pDir, 'tests', 'cases', `${tc.name}.in`), tc.in, 'utf8');
    fs.writeFileSync(path.join(pDir, 'tests', 'cases', `${tc.name}.out`), tc.out, 'utf8');
  }

  console.log(`✓ Generated lisp/${p.slug}`);
}

console.log('=== Generating 10 Common Lisp Projects ===\n');
for (const p of projects) {
  generateProject(p);
}
console.log('\nAll 10 Lisp projects generated successfully!');
