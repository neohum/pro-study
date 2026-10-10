;;;; solution/main.lisp - Meta-Circular Evaluator
(defpackage :pro-study-eval
  (:use :cl)
  (:export :my-eval :make-env))
(in-package :pro-study-eval)

(defstruct closure params body env)

(defun make-env (&optional parent)
  (cons (make-hash-table :test 'eq) parent))

(defun env-lookup (var env)
  (if (null env)
      (error "Unbound variable: ~A" var)
      (multiple-value-bind (val found) (gethash var (car env))
        (if found val (env-lookup var (cdr env))))))

(defun env-define (var val env)
  (setf (gethash var (car env)) val))

(defun my-eval (exp env)
  (cond
    ((numberp exp) exp)
    ((stringp exp) exp)
    ((symbolp exp) (env-lookup exp env))
    ((consp exp)
     (let ((op (car exp)))
       (case op
         (quote (second exp))
         (define (env-define (second exp) (my-eval (third exp) env) env))
         (if (if (my-eval (second exp) env)
                 (my-eval (third exp) env)
                 (my-eval (fourth exp) env)))
         (lambda (make-closure :params (second exp) :body (cddr exp) :env env))
         (begin (let ((res nil))
                  (dolist (e (cdr exp) res)
                    (setf res (my-eval e env)))))
         (otherwise
          (let ((fn (my-eval op env))
                (args (mapcar (lambda (e) (my-eval e env)) (cdr exp))))
            (if (closure-p fn)
                (let ((new-env (make-env (closure-env fn))))
                  (loop for p in (closure-params fn)
                        for a in args do
                    (env-define p a new-env))
                  (let ((res nil))
                    (dolist (e (closure-body fn) res)
                      (setf res (my-eval e new-env)))))
                (apply fn args)))))))
    (t (error "Unknown expression: ~S" exp))))

(defun setup-global-env ()
  (let ((env (make-env)))
    (env-define '+ #'+ env)
    (env-define '- #'- env)
    (env-define '* #'* env)
    (env-define '= #'= env)
    env))

(defun run-eval ()
  (let ((env (setup-global-env))
        (script '((define make-adder (lambda (x) (lambda (y) (+ x y))))
                  (define add5 (make-adder 5))
                  (add5 10))))
    (dolist (expr script)
      (let ((res (my-eval expr env)))
        (when (eq expr (car (last script)))
          (format t "~A~%" res))))))

(run-eval)
