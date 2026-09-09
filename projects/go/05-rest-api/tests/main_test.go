package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
)

func TestStoreCRUD(t *testing.T) {
	s := NewStore()

	// 1. List on empty store
	memos := s.List()
	if len(memos) != 0 {
		t.Fatalf("expected empty list, got %d items", len(memos))
	}

	// 2. Create normal
	m1, err := s.Create("첫 번째 메모", "내용 1")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if m1.ID != 1 || m1.Title != "첫 번째 메모" || m1.Content != "내용 1" {
		t.Fatalf("unexpected memo data: %+v", m1)
	}
	if m1.CreatedAt.IsZero() || m1.UpdatedAt.IsZero() {
		t.Fatal("CreatedAt and UpdatedAt must not be zero")
	}

	// 3. Create with empty title
	if _, err := s.Create("   ", "내용"); !errors.Is(err, ErrEmptyTitle) {
		t.Fatalf("expected ErrEmptyTitle, got %v", err)
	}

	// 4. Get
	got, ok := s.Get(1)
	if !ok || got.ID != 1 {
		t.Fatalf("Get(1) failed, got: %+v", got)
	}
	if _, ok := s.Get(999); ok {
		t.Fatal("Get(999) should return false")
	}

	// 5. Update
	updated, err := s.Update(1, "수정된 메모", "수정 내용")
	if err != nil {
		t.Fatalf("Update: %v", err)
	}
	if updated.Title != "수정된 메모" || updated.Content != "수정 내용" {
		t.Fatalf("unexpected updated memo: %+v", updated)
	}
	if _, err := s.Update(999, "제목", "내용"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
	if _, err := s.Update(1, " ", "내용"); !errors.Is(err, ErrEmptyTitle) {
		t.Fatalf("expected ErrEmptyTitle, got %v", err)
	}

	// 6. Delete
	if !s.Delete(1) {
		t.Fatal("Delete(1) should return true")
	}
	if s.Delete(1) {
		t.Fatal("second Delete(1) should return false")
	}
	if _, ok := s.Get(1); ok {
		t.Fatal("Get(1) should return false after delete")
	}
}

func TestStoreConcurrency(t *testing.T) {
	s := NewStore()
	var wg sync.WaitGroup
	numRoutines := 20

	for i := 0; i < numRoutines; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			_, _ = s.Create("제목", "내용")
			_ = s.List()
		}(i)
	}
	wg.Wait()

	if len(s.List()) != numRoutines {
		t.Fatalf("expected %d memos, got %d", numRoutines, len(s.List()))
	}
}

func TestCreateAndListMemos(t *testing.T) {
	store := NewStore()
	router := NewRouter(store)

	// 1. GET /memos (비어있음)
	req := httptest.NewRequest("GET", "/memos", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if body := rec.Body.String(); body != "[]\n" && body != "[]" {
		t.Fatalf("expected empty array JSON, got %q", body)
	}

	// 2. POST /memos 정상 생성
	body := []byte(`{"title":"쇼핑 목록","content":"사과, 바나나"}`)
	req = httptest.NewRequest("POST", "/memos", bytes.NewReader(body))
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rec.Code, rec.Body.String())
	}
	var created Memo
	if err := json.NewDecoder(rec.Body).Decode(&created); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if created.ID != 1 || created.Title != "쇼핑 목록" {
		t.Fatalf("unexpected memo: %+v", created)
	}

	// 3. POST /memos 빈 제목 검증
	body = []byte(`{"title":"","content":"내용"}`)
	req = httptest.NewRequest("POST", "/memos", bytes.NewReader(body))
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}

	// 4. POST /memos 잘못된 JSON
	body = []byte(`invalid json`)
	req = httptest.NewRequest("POST", "/memos", bytes.NewReader(body))
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}

	// 5. GET /memos 목록 1개 확인
	req = httptest.NewRequest("GET", "/memos", nil)
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	var list []Memo
	if err := json.NewDecoder(rec.Body).Decode(&list); err != nil {
		t.Fatalf("failed to decode list: %v", err)
	}
	if len(list) != 1 || list[0].ID != 1 {
		t.Fatalf("unexpected list: %+v", list)
	}
}

func TestGetMemo(t *testing.T) {
	store := NewStore()
	_, _ = store.Create("메모 1", "내용 1")
	router := NewRouter(store)

	// 1. 존재하는 메모 조회
	req := httptest.NewRequest("GET", "/memos/1", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	var m Memo
	if err := json.NewDecoder(rec.Body).Decode(&m); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if m.ID != 1 || m.Title != "메모 1" {
		t.Fatalf("unexpected memo: %+v", m)
	}

	// 2. 존재하지 않는 메모 조회
	req = httptest.NewRequest("GET", "/memos/999", nil)
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rec.Code)
	}

	// 3. 잘못된 ID 형식
	req = httptest.NewRequest("GET", "/memos/abc", nil)
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

func TestUpdateMemo(t *testing.T) {
	store := NewStore()
	_, _ = store.Create("원래 제목", "원래 내용")
	router := NewRouter(store)

	// 1. 정상 수정
	body := []byte(`{"title":"새 제목","content":"새 내용"}`)
	req := httptest.NewRequest("PUT", "/memos/1", bytes.NewReader(body))
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	var m Memo
	if err := json.NewDecoder(rec.Body).Decode(&m); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if m.Title != "새 제목" || m.Content != "새 내용" {
		t.Fatalf("unexpected memo after update: %+v", m)
	}

	// 2. 존재하지 않는 ID 수정
	req = httptest.NewRequest("PUT", "/memos/999", bytes.NewReader(body))
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rec.Code)
	}

	// 3. 잘못된 ID 형식
	req = httptest.NewRequest("PUT", "/memos/xyz", bytes.NewReader(body))
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}

	// 4. 빈 제목 수정 시도
	body = []byte(`{"title":"   ","content":"내용"}`)
	req = httptest.NewRequest("PUT", "/memos/1", bytes.NewReader(body))
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

func TestDeleteMemo(t *testing.T) {
	store := NewStore()
	_, _ = store.Create("삭제할 메모", "내용")
	router := NewRouter(store)

	// 1. 정상 삭제
	req := httptest.NewRequest("DELETE", "/memos/1", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", rec.Code)
	}

	// 2. 재삭제 시도 (404)
	req = httptest.NewRequest("DELETE", "/memos/1", nil)
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rec.Code)
	}

	// 3. 잘못된 ID 형식
	req = httptest.NewRequest("DELETE", "/memos/invalid", nil)
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

func TestRecoverMiddleware(t *testing.T) {
	panicHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("boom!")
	})
	wrapped := RecoverMiddleware(panicHandler)

	req := httptest.NewRequest("GET", "/panic", nil)
	rec := httptest.NewRecorder()
	wrapped.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", rec.Code)
	}
	var errResp ErrorResponse
	if err := json.NewDecoder(rec.Body).Decode(&errResp); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if errResp.Error != "internal server error" {
		t.Fatalf("unexpected error message: %q", errResp.Error)
	}
}
