;;;; solution/main.lisp - Query Engine
(defpackage :pro-study-query
  (:use :cl)
  (:export :query :run-queries))
(in-package :pro-study-query)

(defparameter *users*
  '((1 . "Alice") (2 . "Bob") (3 . "Charlie")))

(defparameter *orders*
  '((101 . (1 "Laptop" 1200))
    (102 . (1 "Mouse" 25))
    (103 . (2 "Keyboard" 80))))

(defun execute-query ()
  (let ((results '()))
    (dolist (u *users*)
      (let ((u-id (car u))
            (u-name (cdr u)))
        (dolist (o *orders*)
          (let* ((o-data (cdr o))
                 (o-uid (first o-data))
                 (item (second o-data))
                 (price (third o-data)))
            (when (and (= u-id o-uid) (> price 50))
              (push (list u-name item price) results))))))
    (dolist (row (sort results #'> :key #'third))
      (format t "~A | ~A | ~D~%" (first row) (second row) (third row)))))

(defun run-queries ()
  (execute-query))

(run-queries)
