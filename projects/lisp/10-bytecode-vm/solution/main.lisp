;;;; solution/main.lisp - Bytecode VM
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
