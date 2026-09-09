package main

import "net/http"

func NewRouter(store *Store) http.Handler {
	mux := http.NewServeMux()
	h := NewHandler(store)

	mux.HandleFunc("GET /memos", h.handleListMemos)
	mux.HandleFunc("POST /memos", h.handleCreateMemo)
	mux.HandleFunc("GET /memos/{id}", h.handleGetMemo)
	mux.HandleFunc("PUT /memos/{id}", h.handleUpdateMemo)
	mux.HandleFunc("DELETE /memos/{id}", h.handleDeleteMemo)

	return RecoverMiddleware(LoggingMiddleware(mux))
}
