;;;; starter/main.lisp - Unit Test Framework
(defpackage :pro-study-testfw
  (:use :cl)
  (:export :deftest :assert-equal :run-all-tests))
(in-package :pro-study-testfw)

;; TODO(step-1): assert-equal 매크로 작성 (gensym 활용)
(defmacro assert-equal (expected actual)
  `(format t "TODO assert-equal"))

;; TODO(step-2): deftest 매크로 작성
(defmacro deftest (name &body body)
  `(format t "TODO deftest"))

(defun run-all-tests ()
  (format t "TODO run-all-tests"))

(run-all-tests)
