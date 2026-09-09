package progress

import (
	"path/filepath"
	"testing"
)

func TestRecordAndReload(t *testing.T) {
	path := filepath.Join(t.TempDir(), "data", "progress.json")
	s, err := Open(path)
	if err != nil {
		t.Fatal(err)
	}
	if s.Get("c/01").Status != NotStarted {
		t.Fatal("초기 상태는 not-started")
	}
	s.Touch("c/01")
	if s.Get("c/01").Status != InProgress {
		t.Errorf("Touch 후 = %q", s.Get("c/01").Status)
	}
	s.Record("c/01", "test", false, 2, 5)
	if e := s.Get("c/01"); e.Status != InProgress || e.Passed != 2 || e.Total != 5 {
		t.Errorf("부분 통과 = %+v", e)
	}
	s.Record("c/01", "test", true, 5, 5)
	if s.Get("c/01").Status != Passed {
		t.Errorf("전부 통과했는데 Passed가 아님")
	}
	s.Record("c/01", "build", false, 0, 0)
	if s.Get("c/01").Status != Passed {
		t.Errorf("빌드 실패가 Passed를 되돌리면 안 된다")
	}
	s.Touch("c/01")
	if s.Get("c/01").Status != Passed {
		t.Errorf("Touch가 Passed를 되돌리면 안 된다")
	}

	s2, err := Open(path)
	if err != nil {
		t.Fatal(err)
	}
	if s2.Get("c/01").Status != Passed {
		t.Errorf("재로드 후 상태 유실")
	}
	sum := s2.Summarize([]string{"c/01", "c/02"})
	if sum.Passed != 1 || sum.Total != 2 {
		t.Errorf("Summarize = %+v", sum)
	}
}
