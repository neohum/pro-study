package doctor

import (
	"errors"
	"testing"
)

func TestCheckReportsMissingTools(t *testing.T) {
	orig := LookPath
	LookPath = func(name string) (string, error) {
		if name == "go" {
			return orig("go")
		}
		return "", errors.New("missing")
	}
	t.Cleanup(func() { LookPath = orig })

	ts := Check()
	if len(ts) != 7 {
		t.Fatalf("도구 %d개, want 7", len(ts))
	}
	if AllFound(ts) {
		t.Fatal("일부 도구가 없는데 AllFound=true")
	}
	for _, tool := range ts {
		switch tool.Cmd {
		case "go":
			if !tool.Found || tool.Version == "" {
				t.Errorf("go = %+v", tool)
			}
		default:
			if tool.Found || tool.Hint == "" {
				t.Errorf("%s = %+v", tool.Cmd, tool)
			}
		}
	}
}
