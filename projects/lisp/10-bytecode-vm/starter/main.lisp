;;;; starter/main.lisp - Bytecode VM
(defpackage :pro-study-vm
  (:use :cl))
(in-package :pro-study-vm)

;; TODO(step-1): Opcode 정의 및 Chunk 구조체 선언
;; TODO(step-2): compile-ast 구현 (S-표현식 -> 바이트코드 방출)
;; TODO(step-3): run-vm 구현 (오퍼랜드 스택 기반 실행 루프)

(defun run-main ()
  (format t "TODO: implement bytecode vm"))

(run-main)
