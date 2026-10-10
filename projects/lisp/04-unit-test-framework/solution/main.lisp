;;;; solution/main.lisp - Unit Test Framework
(defpackage :pro-study-testfw
  (:use :cl)
  (:export :deftest :assert-equal :run-all-tests :*passed* :*failed*))
(in-package :pro-study-testfw)

(defvar *tests* '())
(defvar *passed* 0)
(defvar *failed* 0)

(defmacro assert-equal (expected actual)
  (let ((g-exp (gensym "EXP-"))
        (g-act (gensym "ACT-")))
    `(let ((,g-exp ,expected)
           (,g-act ,actual))
       (if (equal ,g-exp ,g-act)
           (incf *passed*)
           (progn
             (incf *failed*)
             (format t "FAIL: expected ~S, got ~S~%" ,g-exp ,g-act))))))

(defmacro deftest (name &body body)
  `(progn
     (defun ,name ()
       ,@body)
     (pushnew ',name *tests*)))

(defun run-all-tests ()
  (setf *passed* 0)
  (setf *failed* 0)
  (dolist (test (reverse *tests*))
    (funcall test))
  (format t "Passed: ~D, Failed: ~D~%" *passed* *failed*))

;; Sample tests
(deftest test-math-add
  (assert-equal 4 (+ 2 2))
  (assert-equal 10 (* 2 5)))

(deftest test-math-sub
  (assert-equal 3 (- 5 2)))

(run-all-tests)
