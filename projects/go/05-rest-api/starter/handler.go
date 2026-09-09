package main

import (
	"encoding/json"
	"net/http"
)

type Handler struct {
	store *Store
}

func NewHandler(store *Store) *Handler {
	return &Handler{store: store}
}

type CreateRequest struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

type UpdateRequest struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if data != nil {
		_ = json.NewEncoder(w).Encode(data)
	}
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, ErrorResponse{Error: message})
}

// TODO(step-2): RESTful CRUD 핸들러 구현
// handleListMemos: h.store.List() 결과를 JSON 200으로 반환.
// handleCreateMemo: JSON 바디 파싱 후 h.store.Create 호출, 201 반환. 오류 시 400.
// handleGetMemo: r.PathValue("id")를 strconv.Atoi로 파싱 후 h.store.Get 호출. 없으면 404.
// handleUpdateMemo: r.PathValue("id") 및 JSON 바디 파싱 후 h.store.Update 호출. 없으면 404.
// handleDeleteMemo: r.PathValue("id") 파싱 후 h.store.Delete 호출. 성공 시 204 No Content.
func (h *Handler) handleListMemos(w http.ResponseWriter, r *http.Request) {
	_ = r
	respondJSON(w, http.StatusOK, []Memo{})
}

func (h *Handler) handleCreateMemo(w http.ResponseWriter, r *http.Request) {
	_ = r
	respondJSON(w, http.StatusCreated, Memo{})
}

func (h *Handler) handleGetMemo(w http.ResponseWriter, r *http.Request) {
	_ = r
	respondJSON(w, http.StatusOK, Memo{})
}

func (h *Handler) handleUpdateMemo(w http.ResponseWriter, r *http.Request) {
	_ = r
	respondJSON(w, http.StatusOK, Memo{})
}

func (h *Handler) handleDeleteMemo(w http.ResponseWriter, r *http.Request) {
	_ = r
	w.WriteHeader(http.StatusNoContent)
}
