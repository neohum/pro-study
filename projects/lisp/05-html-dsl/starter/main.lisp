;;;; starter/main.lisp - HTML DSL
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
