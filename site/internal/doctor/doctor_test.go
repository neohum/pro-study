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
	if len(ts) != 3 {
		t.Fatalf("도구 %d개, want 3", len(ts))
	}
	if AllFound(ts) {
		t.Fatal("gcc·code가 없는데 AllFound=true")
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
