package apk

import (
	"net"
	"os"
	"path/filepath"
	"testing"
)

func TestFormatBytes(t *testing.T) {
	tests := []struct {
		bytes    int64
		expected string
	}{
		{500, "500 B"},
		{1024, "1.0 KB"},
		{1536, "1.5 KB"},
		{1048576, "1.0 MB"},
		{5872025, "5.6 MB"},
	}
	for _, tt := range tests {
		got := formatBytes(tt.bytes)
		if got != tt.expected {
			t.Errorf("formatBytes(%d) = %s; want %s", tt.bytes, got, tt.expected)
		}
	}
}

func TestIsPrivateIPv4(t *testing.T) {
	tests := []struct {
		ip       string
		expected bool
	}{
		{"127.0.0.1", false},
		{"8.8.8.8", false},
		{"192.168.1.50", true},
		{"10.0.0.1", true},
		{"172.20.14.2", true},
		{"172.35.0.1", false},
	}
	for _, tt := range tests {
		ip := net.ParseIP(tt.ip).To4()
		got := isPrivateIPv4(ip)
		if got != tt.expected {
			t.Errorf("isPrivateIPv4(%s) = %v; want %v", tt.ip, got, tt.expected)
		}
	}
}

func TestManagerStatus(t *testing.T) {
	tmpDir := t.TempDir()
	mgr := NewManager(tmpDir)

	// 존재하지 않을 때
	st := mgr.Status()
	if st.Exists {
		t.Errorf("expected Exists to be false, got true")
	}

	// 가짜 APK 파일 생성
	apkPath := mgr.APKPath()
	if err := os.MkdirAll(filepath.Dir(apkPath), 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(apkPath, []byte("fake apk content"), 0644); err != nil {
		t.Fatal(err)
	}

	st = mgr.Status()
	if !st.Exists {
		t.Errorf("expected Exists to be true, got false")
	}
	if st.SizeBytes != 16 {
		t.Errorf("expected SizeBytes = 16, got %d", st.SizeBytes)
	}
}
