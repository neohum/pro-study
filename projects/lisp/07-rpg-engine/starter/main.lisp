;;;; starter/main.lisp - CLOS RPG Engine
(defpackage :pro-study-rpg
  (:use :cl))
(in-package :pro-study-rpg)

;; TODO(step-1): character-entity, warrior, slime, weapon, fire-sword 클래스 정의
;; TODO(step-2): defgeneric execute-attack 선언
;; TODO(step-3): 다중 특수화 defmethod 구현 및 :before, :after 조합

(defun run-battle ()
  (format t "TODO: implement rpg"))

(run-battle)
