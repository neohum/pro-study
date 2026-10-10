;;;; solution/main.lisp - Resilient Crawler
(defpackage :pro-study-crawler
  (:use :cl)
  (:export :fetch-url :crawl-all))
(in-package :pro-study-crawler)

(define-condition network-error (error)
  ((url :initarg :url :reader err-url)
   (code :initarg :code :reader err-code)))

(defvar *mock-network* (make-hash-table :test 'equal))
(setf (gethash "http://example.com/ok" *mock-network*) "Content 200")
(setf (gethash "http://example.com/timeout" *mock-network*) :timeout)
(setf (gethash "http://example.com/404" *mock-network*) :404)

(defun simulate-http-get (url)
  (let ((val (gethash url *mock-network*)))
    (cond
      ((eq val :timeout) (error 'network-error :url url :code :timeout))
      ((eq val :404) (error 'network-error :url url :code :404))
      (val val)
      (t (error 'network-error :url url :code :unknown)))))

(defun fetch-with-retry (url)
  (let ((attempts 0))
    (loop
      (restart-case
          (return (simulate-http-get url))
        (retry ()
          :report "Retry download"
          (incf attempts)
          (if (> attempts 2)
              (return (format nil "[FALLBACK-CACHE-~A]" url))
              (setf (gethash url *mock-network*) "Content Recovered (Retry)")))
        (use-cache ()
          :report "Use local cached snapshot"
          (return (format nil "[CACHED-DATA-~A]" url)))))))

(defun run-crawler ()
  (handler-bind ((network-error
                   (lambda (c)
                     (case (err-code c)
                       (:timeout (invoke-restart 'retry))
                       (:404 (invoke-restart 'use-cache))
                       (otherwise (invoke-restart 'use-cache))))))
    (format t "OK: ~A~%" (fetch-with-retry "http://example.com/ok"))
    (format t "TIMEOUT: ~A~%" (fetch-with-retry "http://example.com/timeout"))
    (format t "404: ~A~%" (fetch-with-retry "http://example.com/404"))))

(run-crawler)
