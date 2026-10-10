;;;; solution/main.lisp - S-Expression Prefix Calculator
(defpackage :pro-study-calc
  (:use :cl)
  (:export :eval-expr :run-calc))
(in-package :pro-study-calc)

(defun eval-expr (expr)
  (cond
    ((numberp expr) expr)
    ((symbolp expr) (error "Undefined variable: ~A" expr))
    ((consp expr)
     (let ((op (car expr))
           (args (mapcar #'eval-expr (cdr expr))))
       (case op
         (+ (reduce #'+ args :initial-value 0))
         (- (cond
              ((null args) 0)
              ((null (cdr args)) (- (car args)))
              (t (reduce #'- args))))
         (* (reduce #'* args :initial-value 1))
         (/ (cond
              ((null args) (error "Empty division"))
              ((null (cdr args))
               (if (zerop (car args))
                   (error "division by zero")
                   (/ 1 (car args))))
              (t
               (when (some #'zerop (cdr args))
                 (error "division by zero"))
               (reduce #'/ args))))
         (% (if (= (length args) 2)
                (if (zerop (second args))
                    (error "division by zero")
                    (mod (first args) (second args)))
                (error "Modulo requires 2 arguments")))
         (otherwise (error "Unknown operator: ~A" op)))))
    (t (error "Invalid expression"))))

(defun run-calc (&optional input-string)
  (let ((raw (or input-string
                 (let ((args (cdr sb-ext:*posix-argv*)))
                   (if args
                       (first args)
                       (read-line *standard-input* nil nil))))))
    (when (and raw (> (length raw) 0))
      (handler-case
          (let* ((parsed (read-from-string raw))
                 (result (eval-expr parsed)))
            (format t "~A~%" result))
        (error (e)
          (let ((msg (format nil "~A" e)))
            (if (search "division by zero" msg)
                (format t "error: division by zero~%")
                (format t "error: ~A~%" msg))))))))

(run-calc)
