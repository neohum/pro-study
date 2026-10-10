;;;; solution/main.lisp - CLOS RPG Engine
(defpackage :pro-study-rpg
  (:use :cl)
  (:export :run-battle))
(in-package :pro-study-rpg)

(defclass character-entity ()
  ((name :initarg :name :accessor entity-name)
   (hp :initarg :hp :accessor entity-hp)))

(defclass warrior (character-entity) ())
(defclass slime (character-entity) ())

(defclass weapon () ())
(defclass sword (weapon) ())
(defclass fire-sword (sword) ())

(defgeneric execute-attack (attacker defender weapon)
  (:documentation "Multi-dispatch attack interaction"))

(defmethod execute-attack :before ((atk warrior) def wpn)
  (format t "[BUFF] Warrior enters Battle Stance.~%"))

(defmethod execute-attack ((atk warrior) (def slime) (wpn fire-sword))
  (format t "[ACTION] ~A slashes ~A with Fire Sword!~%" (entity-name atk) (entity-name def))
  (decf (entity-hp def) 15))

(defmethod execute-attack :after (atk (def slime) wpn)
  (format t "[PROC] Slime acid reacts to attack.~%"))

(defun run-battle ()
  (let ((w (make-instance 'warrior :name "Arthur" :hp 50))
        (s (make-instance 'slime :name "GreenSlime" :hp 20))
        (f-sword (make-instance 'fire-sword)))
    (execute-attack w s f-sword)
    (format t "Result HP: Slime=~D, Warrior=~D~%" (entity-hp s) (entity-hp w))))

(run-battle)
