;;;; starter/main.lisp - S-Expression Prefix Calculator
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
