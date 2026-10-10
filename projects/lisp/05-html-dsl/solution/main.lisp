;;;; solution/main.lisp - HTML DSL
(defpackage :pro-study-html-dsl
  (:use :cl)
  (:export :render-html))
(in-package :pro-study-html-dsl)

(defparameter *void-tags* '(:img :br :hr :input :meta :link))

(defun escape-html (str)
  (with-output-to-string (s)
    (loop for ch across (string str) do
      (case ch
        (#\& (write-string "&amp;" s))
        (#\< (write-string "&lt;" s))
        (#\> (write-string "&gt;" s))
        (#\" (write-string "&quot;" s))
        (otherwise (write-char ch s))))))

(defun render-node (node)
  (cond
    ((stringp node) (escape-html node))
    ((numberp node) (write-to-string node))
    ((consp node)
     (let ((tag (car node))
           (attrs '())
           (children '())
           (rest (cdr node)))
       (loop while (and rest (keywordp (car rest))) do
         (let ((attr-name (string-downcase (symbol-name (pop rest))))
               (attr-val (pop rest)))
           (push (format nil " ~A=\"~A\"" attr-name (escape-html attr-val)) attrs)))
       (setf children (mapcar #'render-node rest))
       (let ((tag-name (string-downcase (symbol-name tag)))
             (attr-str (format nil "~{~A~}" (nreverse attrs))))
         (if (member tag *void-tags*)
             (format nil "<~A~A />" tag-name attr-str)
             (format nil "<~A~A>~{~A~}</~A>" tag-name attr-str children tag-name)))))
    (t "")))

(defun run-html-dsl ()
  (let ((line (read-line *standard-input* nil nil)))
    (when line
      (let* ((parsed (read-from-string line))
             (html (render-node parsed)))
        (format t "~A~%" html)))))

(run-html-dsl)
