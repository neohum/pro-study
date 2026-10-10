;;;; starter/main.lisp - Meta-Circular Evaluator
(defpackage :pro-study-eval
  (:use :cl))
(in-package :pro-study-eval)

;; TODO(step-1): 렉시컬 환경 체인 구조체 및 탐색/바인딩 함수
;; TODO(step-2): my-eval 코어 디스패처 작성
;; TODO(step-3): 일급 클로저 및 함수 호출 처리

(defun run-eval ()
  (format t "TODO: implement evaluator"))

(run-eval)
