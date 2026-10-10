;;;; starter/main.lisp - Text Analyzer
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
