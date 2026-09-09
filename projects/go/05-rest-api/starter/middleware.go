package main

import (
	"net/http"
)

type statusRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.statusCode = code
	r.ResponseWriter.WriteHeader(code)
}

// TODO(step-4): LoggingMiddleware 및 RecoverMiddleware 구현
// LoggingMiddleware: statusRecorder로 응답 코드를 가로채고 요청 시간과 함께 로깅
// RecoverMiddleware: defer func() { if rec := recover(); rec != nil { ... } }() 로
// 패닉을 포획하여 500 에러를 반환
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
	})
}

func RecoverMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
	})
}
