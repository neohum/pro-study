package main

import "net/http"

// TODO(step-3): Go 1.22+ ServeMux 라우팅 등록
// http.NewServeMux() 생성 후 다음 라우트 등록:
// "GET /memos" -> h.handleListMemos
// "POST /memos" -> h.handleCreateMemo
// "GET /memos/{id}" -> h.handleGetMemo
// "PUT /memos/{id}" -> h.handleUpdateMemo
// "DELETE /memos/{id}" -> h.handleDeleteMemo
// 미들웨어 체이닝: RecoverMiddleware(LoggingMiddleware(mux)) 반환
func NewRouter(store *Store) http.Handler {
	_ = store
	mux := http.NewServeMux()
	return mux
}
