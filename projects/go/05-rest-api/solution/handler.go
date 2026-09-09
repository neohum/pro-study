package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
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

func (h *Handler) handleListMemos(w http.ResponseWriter, r *http.Request) {
	memos := h.store.List()
	respondJSON(w, http.StatusOK, memos)
}

func (h *Handler) handleCreateMemo(w http.ResponseWriter, r *http.Request) {
	var req CreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	memo, err := h.store.Create(req.Title, req.Content)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, memo)
}

func (h *Handler) handleGetMemo(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid memo id")
		return
	}
	memo, ok := h.store.Get(id)
	if !ok {
		respondError(w, http.StatusNotFound, "memo not found")
		return
	}
	respondJSON(w, http.StatusOK, memo)
}

func (h *Handler) handleUpdateMemo(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid memo id")
		return
	}
	var req UpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	memo, err := h.store.Update(id, req.Title, req.Content)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			respondError(w, http.StatusNotFound, "memo not found")
			return
		}
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, memo)
}

func (h *Handler) handleDeleteMemo(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid memo id")
		return
	}
	if !h.store.Delete(id) {
		respondError(w, http.StatusNotFound, "memo not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
