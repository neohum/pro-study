;;;; starter/main.lisp - Resilient Crawler
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
