package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
)

func newTestServer(t *testing.T) *server {
	root, err := filepath.Abs("..")
	if err != nil {
		t.Fatal(err)
	}
	s, err := newServer(root, "8787", false)
	if err != nil {
		t.Fatalf("newServer 실패: %v", err)
	}
	return s
}

func TestWebRoutes(t *testing.T) {
	s := newTestServer(t)
	handler := s.routes()

	tests := []struct {
		name       string
		method     string
		url        string
		wantStatus int
	}{
		{"Home", "GET", "/", 200},
		{"ReferenceDefault", "GET", "/ref", 200},
		{"ReferenceGo", "GET", "/ref/go", 200},
		{"ReferenceC", "GET", "/ref/c", 200},
		{"ReferenceRust", "GET", "/ref/rust", 200},
		{"ReferencePython", "GET", "/ref/python", 200},
		{"ReferenceTypeScript", "GET", "/ref/typescript", 200},
		{"ReferenceJavaScript", "GET", "/ref/javascript", 200},
		{"TourTraceDefault", "GET", "/trace/go", 200},
		{"TourTraceLesson", "GET", "/trace/go/basics-packages", 200},
		{"IdeasPage", "GET", "/ideas", 200},
		{"APIIdeasList", "GET", "/api/ideas", 200},
		{"APITourLesson", "GET", "/api/trace/go/basics-packages", 200},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.url, nil)
			req.Host = "localhost:8787"
			w := httptest.NewRecorder()
			handler.ServeHTTP(w, req)
			if w.Code != tc.wantStatus {
				t.Fatalf("%s %s = status %d, want %d (body: %s)", tc.method, tc.url, w.Code, tc.wantStatus, w.Body.String())
			}
		})
	}
}

func TestAPIIdeasSubmitAndVote(t *testing.T) {
	s := newTestServer(t)
	handler := s.routes()

	// 1. Submit Idea
	payload := map[string]string{
		"title":       "신규 프로젝트 제안 테스트",
		"category":    "신규 프로젝트",
		"description": "자동화 테스트 검증용 아이디어입니다.",
		"author":      "테스터",
	}
	body, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/api/ideas", bytes.NewReader(body))
	req.Host = "localhost:8787"
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("POST /api/ideas status = %d, want 201 (body: %s)", w.Code, w.Body.String())
	}

	var res struct {
		ID    string `json:"id"`
		Title string `json:"title"`
		Votes int    `json:"votes"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil {
		t.Fatalf("응답 역직렬화 실패: %v", err)
	}
	if res.ID == "" || res.Title != payload["title"] {
		t.Fatalf("생성된 아이디어 필드 불일치: %+v", res)
	}

	// 2. Vote for Idea
	voteReq := httptest.NewRequest("POST", "/api/ideas/"+res.ID+"/vote", nil)
	voteReq.Host = "localhost:8787"
	voteW := httptest.NewRecorder()
	handler.ServeHTTP(voteW, voteReq)

	if voteW.Code != http.StatusOK {
		t.Fatalf("POST /api/ideas/%s/vote status = %d, want 200 (body: %s)", res.ID, voteW.Code, voteW.Body.String())
	}

	var voteRes struct {
		OK    bool `json:"ok"`
		Votes int  `json:"votes"`
	}
	if err := json.Unmarshal(voteW.Body.Bytes(), &voteRes); err != nil {
		t.Fatalf("투표 응답 역직렬화 실패: %v", err)
	}
	if !voteRes.OK || voteRes.Votes <= res.Votes {
		t.Fatalf("투표 반영 실패: %+v", voteRes)
	}
}
