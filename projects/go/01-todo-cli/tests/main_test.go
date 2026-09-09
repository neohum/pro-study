package main

import (
	"bytes"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// ---- Step 1 ----

func TestAddAndFind(t *testing.T) {
	s := NewStore()
	a, err := s.Add("우유 사기")
	if err != nil {
		t.Fatalf("Add: %v", err)
	}
	b, err := s.Add("  Go 공부  ")
	if err != nil {
		t.Fatalf("Add: %v", err)
	}
	if a.ID != 1 || b.ID != 2 {
		t.Errorf("IDs = %d, %d; want 1, 2", a.ID, b.ID)
	}
	if b.Text != "Go 공부" {
		t.Errorf("Text = %q; want trimmed %q", b.Text, "Go 공부")
	}
	if a.Done {
		t.Error("new item must not be done")
	}
	if a.CreatedAt.IsZero() {
		t.Error("CreatedAt must be set")
	}
	if s.NextID != 3 {
		t.Errorf("NextID = %d; want 3", s.NextID)
	}
	got, err := s.Find(2)
	if err != nil {
		t.Fatalf("Find(2): %v", err)
	}
	if got.Text != "Go 공부" {
		t.Errorf("Find(2).Text = %q", got.Text)
	}
}

func TestAddEmptyText(t *testing.T) {
	s := NewStore()
	for _, text := range []string{"", "   ", "\t\n"} {
		if _, err := s.Add(text); !errors.Is(err, ErrEmptyText) {
			t.Errorf("Add(%q) err = %v; want ErrEmptyText", text, err)
		}
	}
	if len(s.Items) != 0 || s.NextID != 1 {
		t.Errorf("empty Add must not change store: %+v", s)
	}
}

// ---- Step 3 ----

func TestDoneUndoneRemove(t *testing.T) {
	s := NewStore()
	s.Add("a")
	s.Add("b")
	s.Add("c")

	if err := s.Done(2); err != nil {
		t.Fatalf("Done(2): %v", err)
	}
	if it, _ := s.Find(2); !it.Done {
		t.Error("Done(2) did not mark item 2 (Find must return a pointer into the slice)")
	}
	if err := s.Undone(2); err != nil {
		t.Fatalf("Undone(2): %v", err)
	}
	if it, _ := s.Find(2); it.Done {
		t.Error("Undone(2) did not clear item 2")
	}

	if err := s.Remove(2); err != nil {
		t.Fatalf("Remove(2): %v", err)
	}
	if len(s.Items) != 2 || s.Items[0].ID != 1 || s.Items[1].ID != 3 {
		t.Errorf("after Remove(2): %+v", s.Items)
	}
	// ID는 재사용하지 않는다.
	d, _ := s.Add("d")
	if d.ID != 4 {
		t.Errorf("new ID after remove = %d; want 4", d.ID)
	}
	s.Clear()
	if len(s.Items) != 0 {
		t.Errorf("Clear left %d items", len(s.Items))
	}
	if s.NextID != 5 {
		t.Errorf("Clear must keep NextID; got %d", s.NextID)
	}
}

func TestNotFound(t *testing.T) {
	s := NewStore()
	s.Add("only")
	checks := map[string]error{
		"Find":   func() error { _, err := s.Find(7); return err }(),
		"Done":   s.Done(7),
		"Undone": s.Undone(7),
		"Remove": s.Remove(7),
	}
	for name, err := range checks {
		if !errors.Is(err, ErrNotFound) {
			t.Errorf("%s(7): errors.Is(err, ErrNotFound) = false; err = %v", name, err)
			continue
		}
		if err.Error() != "id 7 not found" {
			t.Errorf("%s(7) message = %q; want %q", name, err.Error(), "id 7 not found")
		}
	}
}

// ---- Step 2 ----

func TestSaveLoadRoundtrip(t *testing.T) {
	path := filepath.Join(t.TempDir(), "todo.json")
	s := NewStore()
	s.Add("우유 사기")
	s.Add("Go 공부")
	s.Done(1)
	s.Remove(2)
	if err := s.Save(path); err != nil {
		t.Fatalf("Save: %v", err)
	}
	if _, err := os.Stat(path + ".tmp"); err == nil {
		t.Error("temp file must be renamed away after Save")
	}
	raw, _ := os.ReadFile(path)
	if !bytes.Contains(raw, []byte(`"next_id": 3`)) {
		t.Errorf("JSON must be indented and contain next_id; got:\n%s", raw)
	}

	got, err := Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if len(got.Items) != 1 || got.Items[0].ID != 1 || got.Items[0].Text != "우유 사기" || !got.Items[0].Done {
		t.Errorf("loaded items = %+v", got.Items)
	}
	if got.NextID != 3 {
		t.Errorf("loaded NextID = %d; want 3", got.NextID)
	}
	if !got.Items[0].CreatedAt.Equal(s.Items[0].CreatedAt) {
		t.Errorf("CreatedAt changed across save/load: %v vs %v", got.Items[0].CreatedAt, s.Items[0].CreatedAt)
	}

	// 두 번째 Save는 기존 파일을 덮어써야 한다 (Windows에서도 os.Rename이 동작한다).
	got.Add("third")
	if err := got.Save(path); err != nil {
		t.Fatalf("second Save: %v", err)
	}
	again, err := Load(path)
	if err != nil || len(again.Items) != 2 {
		t.Fatalf("after overwrite: items=%d err=%v", len(again.Items), err)
	}
}

func TestLoadMissingAndBroken(t *testing.T) {
	dir := t.TempDir()
	s, err := Load(filepath.Join(dir, "nope.json"))
	if err != nil {
		t.Fatalf("missing file must be an empty store, got err %v", err)
	}
	if s == nil || len(s.Items) != 0 || s.NextID != 1 {
		t.Errorf("missing file store = %+v", s)
	}

	broken := filepath.Join(dir, "broken.json")
	os.WriteFile(broken, []byte("{not json"), 0o644)
	if _, err := Load(broken); err == nil {
		t.Error("broken JSON must return an error")
	}
}

// ---- Step 4 ----

func TestListFormat(t *testing.T) {
	s := NewStore()
	var buf bytes.Buffer
	s.List(&buf)
	if buf.String() != "(비어 있음)\n" {
		t.Errorf("empty list = %q", buf.String())
	}

	for i := 1; i <= 10; i++ {
		s.Add("item")
	}
	s.Done(2)
	buf.Reset()
	s.List(&buf)
	lines := strings.Split(strings.TrimRight(buf.String(), "\n"), "\n")
	if len(lines) != 10 {
		t.Fatalf("got %d lines:\n%s", len(lines), buf.String())
	}
	if lines[0] != "1  [ ] item" {
		t.Errorf("line 1 = %q; want %q", lines[0], "1  [ ] item")
	}
	if lines[1] != "2  [x] item" {
		t.Errorf("line 2 = %q; want %q", lines[1], "2  [x] item")
	}
	if lines[9] != "10 [ ] item" {
		t.Errorf("line 10 = %q; want %q (%%-3d keeps the column aligned)", lines[9], "10 [ ] item")
	}
}

// ---- Step 5 ----

func TestRunEndToEnd(t *testing.T) {
	file := filepath.Join(t.TempDir(), "todo.json")
	call := func(args ...string) (string, string, int) {
		var out, errb bytes.Buffer
		code := run(append([]string{"-file", file}, args...), &out, &errb)
		return out.String(), errb.String(), code
	}

	if out, _, code := call("add", "우유 사기"); code != 0 || out != "1  [ ] 우유 사기\n" {
		t.Fatalf("add: code=%d out=%q", code, out)
	}
	if _, _, code := call("add", "Go", "공부"); code != 0 {
		t.Fatalf("add (multi-word): code=%d", code)
	}
	if _, _, code := call("done", "1"); code != 0 {
		t.Fatalf("done: code=%d", code)
	}
	out, _, code := call("list")
	want := "1  [x] 우유 사기\n2  [ ] Go 공부\n"
	if code != 0 || out != want {
		t.Errorf("list: code=%d\n got %q\nwant %q", code, out, want)
	}
	if _, _, code := call("rm", "1"); code != 0 {
		t.Fatalf("rm: code=%d", code)
	}
	if out, _, _ := call("list"); out != "2  [ ] Go 공부\n" {
		t.Errorf("list after rm = %q", out)
	}
	if _, _, code := call("clear"); code != 0 {
		t.Fatalf("clear: code=%d", code)
	}
	if out, _, _ := call("list"); out != "(비어 있음)\n" {
		t.Errorf("list after clear = %q", out)
	}
	// 파일이 실제로 남아 있고, 다음 ID는 3이어야 한다.
	s, err := Load(file)
	if err != nil || s.NextID != 3 {
		t.Errorf("persisted NextID = %d err = %v; want 3", s.NextID, err)
	}
}

func TestRunErrors(t *testing.T) {
	file := filepath.Join(t.TempDir(), "todo.json")
	cases := []struct {
		name string
		args []string
		want string // stderr에 포함되어야 하는 문자열
	}{
		{"not found", []string{"done", "7"}, "todo: id 7 not found"},
		{"empty text", []string{"add", "   "}, "todo: empty text"},
		{"no text", []string{"add"}, "todo: empty text"},
		{"unknown", []string{"frobnicate"}, "사용법"},
		{"no command", nil, "사용법"},
		{"bad id", []string{"rm", "abc"}, "todo:"},
	}
	for _, c := range cases {
		var out, errb bytes.Buffer
		code := run(append([]string{"-file", file}, c.args...), &out, &errb)
		if code != 1 {
			t.Errorf("%s: exit code = %d; want 1", c.name, code)
		}
		if !strings.Contains(errb.String(), c.want) {
			t.Errorf("%s: stderr = %q; want it to contain %q", c.name, errb.String(), c.want)
		}
		if out.Len() != 0 {
			t.Errorf("%s: stdout must be empty, got %q", c.name, out.String())
		}
	}
	if _, err := os.Stat(file); err == nil {
		t.Error("failed commands must not create the file")
	}
}
