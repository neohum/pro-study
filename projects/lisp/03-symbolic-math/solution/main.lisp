;;;; solution/main.lisp - Symbolic Math
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
