// Package apk는 안드로이드 APK 파일의 상태 확인, 빌드 및 서빙을 관리한다.
package apk

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sync"
	"time"

	"github.com/skip2/go-qrcode"
)

// Status는 현재 빌드된 APK의 상태 정보다.
type Status struct {
	Exists           bool      `json:"exists"`
	FileName         string    `json:"fileName"`
	FilePath         string    `json:"filePath"`
	SizeBytes        int64     `json:"sizeBytes"`
	SizeFormatted    string    `json:"sizeFormatted"`
	ModTime          time.Time `json:"modTime"`
	ModTimeFormatted string    `json:"modTimeFormatted"`
	IsBuilding       bool      `json:"isBuilding"`
	LastError        string    `json:"lastError,omitempty"`
}

// Manager는 APK 빌드 및 파일 관리를 담당한다.
type Manager struct {
	root        string
	mu          sync.RWMutex
	isBuilding  bool
	lastError   string
	lastLog     []string
	logSubs     map[chan string]struct{}
	logSubsLock sync.Mutex
}

// NewManager는 새로운 APK 관리자를 생성한다.
func NewManager(root string) *Manager {
	return &Manager{
		root:    root,
		logSubs: make(map[chan string]struct{}),
	}
}

// APKPath는 빌드 산출물 APK 파일의 절대 경로를 반환한다.
func (m *Manager) APKPath() string {
	return filepath.Join(m.root, "android-app", "app", "build", "outputs", "apk", "debug", "app-debug.apk")
}

// Status는 현재 APK 파일의 상태를 반환한다.
func (m *Manager) Status() Status {
	m.mu.RLock()
	defer m.mu.RUnlock()

	apkPath := m.APKPath()
	st, err := os.Stat(apkPath)
	if err != nil || st.IsDir() {
		return Status{
			Exists:     false,
			FileName:   "pro-study.apk",
			FilePath:   apkPath,
			IsBuilding: m.isBuilding,
			LastError:  m.lastError,
		}
	}

	loc, _ := time.LoadLocation("Asia/Seoul")
	if loc == nil {
		loc = time.Local
	}
	modTime := st.ModTime().In(loc)

	return Status{
		Exists:           true,
		FileName:         "pro-study.apk",
		FilePath:         apkPath,
		SizeBytes:        st.Size(),
		SizeFormatted:    formatBytes(st.Size()),
		ModTime:          modTime,
		ModTimeFormatted: modTime.Format("2006-01-02 15:04:05"),
		IsBuilding:       m.isBuilding,
		LastError:        m.lastError,
	}
}

// BookeinkDir는 Bookeink 프로젝트 디렉토리 경로를 반환한다.
func (m *Manager) BookeinkDir() string {
	if env := os.Getenv("BOOKEINK_ROOT"); env != "" {
		return env
	}
	cand := filepath.Join(m.root, "..", "bookeink")
	if st, err := os.Stat(cand); err == nil && st.IsDir() {
		return cand
	}
	return cand
}

// BookeinkAPKPath는 Bookeink APK 빌드 산출물 파일의 절대 경로를 반환한다.
// Release 빌드가 있으면 우선 반환하고, 없으면 Debug 빌드를 반환한다.
func (m *Manager) BookeinkAPKPath() string {
	bDir := m.BookeinkDir()
	relPath := filepath.Join(bDir, "app", "build", "outputs", "apk", "release", "app-release.apk")
	if st, err := os.Stat(relPath); err == nil && !st.IsDir() && st.Size() > 0 {
		return relPath
	}
	return filepath.Join(bDir, "app", "build", "outputs", "apk", "debug", "app-debug.apk")
}

// BookeinkStatus는 현재 Bookeink APK 파일의 상태를 반환한다.
func (m *Manager) BookeinkStatus() Status {
	m.mu.RLock()
	defer m.mu.RUnlock()

	apkPath := m.BookeinkAPKPath()
	st, err := os.Stat(apkPath)
	if err != nil || st.IsDir() {
		return Status{
			Exists:     false,
			FileName:   "bookeink.apk",
			FilePath:   apkPath,
			IsBuilding: m.isBuilding,
			LastError:  m.lastError,
		}
	}

	loc, _ := time.LoadLocation("Asia/Seoul")
	if loc == nil {
		loc = time.Local
	}
	modTime := st.ModTime().In(loc)

	return Status{
		Exists:           true,
		FileName:         "bookeink.apk",
		FilePath:         apkPath,
		SizeBytes:        st.Size(),
		SizeFormatted:    formatBytes(st.Size()),
		ModTime:          modTime,
		ModTimeFormatted: modTime.Format("2006-01-02 15:04:05"),
		IsBuilding:       m.isBuilding,
		LastError:        m.lastError,
	}
}

// IsBuilding은 현재 빌드가 진행 중인지 확인한다.
func (m *Manager) IsBuilding() bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.isBuilding
}

// SubscribeLogs는 빌드 로그 스트림 채널을 등록한다.
func (m *Manager) SubscribeLogs() (chan string, func()) {
	ch := make(chan string, 100)
	m.logSubsLock.Lock()
	m.logSubs[ch] = struct{}{}
	// 최근 로그 재생
	m.mu.RLock()
	for _, line := range m.lastLog {
		select {
		case ch <- line:
		default:
		}
	}
	m.mu.RUnlock()
	m.logSubsLock.Unlock()

	unsubscribe := func() {
		m.logSubsLock.Lock()
		delete(m.logSubs, ch)
		close(ch)
		m.logSubsLock.Unlock()
	}
	return ch, unsubscribe
}

func (m *Manager) broadcastLog(line string) {
	m.mu.Lock()
	m.lastLog = append(m.lastLog, line)
	if len(m.lastLog) > 500 {
		m.lastLog = m.lastLog[len(m.lastLog)-500:]
	}
	m.mu.Unlock()

	m.logSubsLock.Lock()
	defer m.logSubsLock.Unlock()
	for ch := range m.logSubs {
		select {
		case ch <- line:
		default:
		}
	}
}

// Build는 에셋 동기화와 안드로이드 APK gradle 빌드를 수행한다.
func (m *Manager) Build(ctx context.Context) error {
	m.mu.Lock()
	if m.isBuilding {
		m.mu.Unlock()
		return fmt.Errorf("이미 빌드가 진행 중입니다")
	}
	m.isBuilding = true
	m.lastError = ""
	m.lastLog = nil
	m.mu.Unlock()

	defer func() {
		m.mu.Lock()
		m.isBuilding = false
		m.mu.Unlock()
	}()

	m.broadcastLog("=== [1/2] Android 콘텐츠 에셋 패키징 시작 ===")
	// 1단계: node scripts/package-android-assets.js
	packageScript := filepath.Join(m.root, "scripts", "package-android-assets.js")
	nodeCmd := exec.CommandContext(ctx, "node", packageScript)
	nodeCmd.Dir = m.root
	if err := m.runCommandWithPipe(nodeCmd); err != nil {
		errStr := fmt.Sprintf("에셋 패키징 실패: %v", err)
		m.broadcastLog(errStr)
		m.mu.Lock()
		m.lastError = errStr
		m.mu.Unlock()
		return err
	}
	m.broadcastLog("=== 에셋 패키징 완료 ===")

	m.broadcastLog("=== [2/2] Gradle APK 빌드 시작 (assembleDebug) ===")
	// 2단계: gradlew assembleDebug
	androidDir := filepath.Join(m.root, "android-app")
	var gradleBin string
	if runtime.GOOS == "windows" {
		gradleBin = filepath.Join(androidDir, "gradlew.bat")
	} else {
		gradleBin = filepath.Join(androidDir, "gradlew")
		// 실행 권한 확인
		_ = os.Chmod(gradleBin, 0755)
	}

	gradleCmd := exec.CommandContext(ctx, gradleBin, "assembleDebug", "--no-daemon")
	gradleCmd.Dir = androidDir
	if err := m.runCommandWithPipe(gradleCmd); err != nil {
		errStr := fmt.Sprintf("APK 빌드 실패: %v", err)
		m.broadcastLog(errStr)
		m.mu.Lock()
		m.lastError = errStr
		m.mu.Unlock()
		return err
	}

	m.broadcastLog("=== APK 빌드 성공 완료! ===")
	status := m.Status()
	m.broadcastLog(fmt.Sprintf("생성 파일: %s (%s)", status.FileName, status.SizeFormatted))
	return nil
}

// BuildBookeink는 Bookeink 앱의 gradle APK 빌드를 수행한다.
func (m *Manager) BuildBookeink(ctx context.Context) error {
	m.mu.Lock()
	if m.isBuilding {
		m.mu.Unlock()
		return fmt.Errorf("이미 빌드가 진행 중입니다")
	}
	m.isBuilding = true
	m.lastError = ""
	m.lastLog = nil
	m.mu.Unlock()

	defer func() {
		m.mu.Lock()
		m.isBuilding = false
		m.mu.Unlock()
	}()

	m.broadcastLog("=== [Bookeink] Gradle APK 빌드 시작 (assembleDebug) ===")
	bookeinkDir := m.BookeinkDir()
	var gradleBin string
	if runtime.GOOS == "windows" {
		gradleBin = filepath.Join(bookeinkDir, "gradlew.bat")
	} else {
		gradleBin = filepath.Join(bookeinkDir, "gradlew")
		_ = os.Chmod(gradleBin, 0755)
	}

	gradleCmd := exec.CommandContext(ctx, gradleBin, "assembleDebug", "--no-daemon")
	gradleCmd.Dir = bookeinkDir
	if err := m.runCommandWithPipe(gradleCmd); err != nil {
		errStr := fmt.Sprintf("Bookeink APK 빌드 실패: %v", err)
		m.broadcastLog(errStr)
		m.mu.Lock()
		m.lastError = errStr
		m.mu.Unlock()
		return err
	}

	m.broadcastLog("=== Bookeink APK 빌드 성공 완료! ===")
	status := m.BookeinkStatus()
	m.broadcastLog(fmt.Sprintf("생성 파일: %s (%s)", status.FileName, status.SizeFormatted))
	return nil
}

func (m *Manager) runCommandWithPipe(cmd *exec.Cmd) error {
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return err
	}

	if err := cmd.Start(); err != nil {
		return err
	}

	var wg sync.WaitGroup
	wg.Add(2)

	pipeReader := func(r io.Reader) {
		defer wg.Done()
		scanner := bufio.NewScanner(r)
		for scanner.Scan() {
			m.broadcastLog(scanner.Text())
		}
	}

	go pipeReader(stdout)
	go pipeReader(stderr)

	wg.Wait()
	return cmd.Wait()
}

func formatBytes(b int64) string {
	const unit = 1024
	if b < unit {
		return fmt.Sprintf("%d B", b)
	}
	div, exp := int64(unit), 0
	for n := b / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(b)/float64(div), "KMGTPE"[exp])
}

// LANIPInfo는 감지된 로컬 네트워크 IP 정보들이다.
type LANIPInfo struct {
	PrimaryIP string   `json:"primaryIp"`
	AllIPs    []string `json:"allIps"`
}

// DetectLANIPs는 호스트 머신의 로컬 네트워크 IPv4 주소들을 감지한다.
func DetectLANIPs() LANIPInfo {
	var ips []string
	seen := make(map[string]bool)

	// 대표 IP 감지: 8.8.8.8 UDP dial (실제 패킷은 안 날아가고 기본 라우팅 인터페이스 결정)
	primary := ""
	conn, err := net.DialTimeout("udp", "8.8.8.8:80", 500*time.Millisecond)
	if err == nil {
		defer conn.Close()
		if udpAddr, ok := conn.LocalAddr().(*net.UDPAddr); ok {
			ip := udpAddr.IP.To4()
			if ip != nil && isPrivateIPv4(ip) {
				primary = ip.String()
				ips = append(ips, primary)
				seen[primary] = true
			}
		}
	}

	ifaces, err := net.Interfaces()
	if err == nil {
		for _, iface := range ifaces {
			if iface.Flags&net.FlagUp == 0 || iface.Flags&net.FlagLoopback != 0 {
				continue
			}
			addrs, err := iface.Addrs()
			if err != nil {
				continue
			}
			for _, addr := range addrs {
				var ip net.IP
				switch v := addr.(type) {
				case *net.IPNet:
					ip = v.IP
				case *net.IPAddr:
					ip = v.IP
				}
				if ip == nil {
					continue
				}
				ipv4 := ip.To4()
				if ipv4 != nil && isPrivateIPv4(ipv4) {
					ipStr := ipv4.String()
					if !seen[ipStr] {
						ips = append(ips, ipStr)
						seen[ipStr] = true
					}
				}
			}
		}
	}

	if primary == "" && len(ips) > 0 {
		primary = ips[0]
	}
	if primary == "" {
		primary = "127.0.0.1"
	}

	return LANIPInfo{
		PrimaryIP: primary,
		AllIPs:    ips,
	}
}

// isPrivateIPv4는 사설 IPv4 대역 여부를 확인한다.
func isPrivateIPv4(ip net.IP) bool {
	if ip == nil {
		return false
	}
	// 10.0.0.0/8
	if ip[0] == 10 {
		return true
	}
	// 172.16.0.0/12
	if ip[0] == 172 && ip[1] >= 16 && ip[1] <= 31 {
		return true
	}
	// 192.168.0.0/16
	if ip[0] == 192 && ip[1] == 168 {
		return true
	}
	return false
}

// IsPrivateIPv4는 사설 IPv4 대역 여부를 확인한다.
func IsPrivateIPv4(ip net.IP) bool {
	return isPrivateIPv4(ip)
}

// GenerateQRPNG는 지정된 문자열을 QR 코드 PNG 바이트로 인코딩한다.
func GenerateQRPNG(content string, size int) ([]byte, error) {
	if size <= 0 {
		size = 256
	}
	return qrcode.Encode(content, qrcode.Medium, size)
}


