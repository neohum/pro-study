;;;; starter/main.lisp - Symbolic Math
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
