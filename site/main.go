// pro-study 로컬 학습 사이트 서버.
//
//	go run ./site            # 저장소 루트에서
//	go run ./site -root D:\works\pro-study -addr 127.0.0.1:8787 -open=false
package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"html/template"
	"io/fs"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"pro-study/site/internal/apk"
	"pro-study/site/internal/catalog"
	"pro-study/site/internal/doctor"
	"pro-study/site/internal/guide"
	"pro-study/site/internal/opener"
	"pro-study/site/internal/progress"
	"pro-study/site/internal/runner"
	"pro-study/site/internal/workspace"
	"pro-study/site/web"
)

func main() {
	addr := flag.String("addr", "127.0.0.1:8787", "바인딩 주소 (기본: 루프백, -lan 시 0.0.0.0 바인딩)")
	root := flag.String("root", "", "저장소 루트 (기본: projects/가 있는 현재 또는 상위 디렉터리)")
	openBrowser := flag.Bool("open", true, "기동 후 브라우저 열기")
	allowLAN := flag.Bool("lan", false, "내부 네트워크(LAN) 접속 허용 및 기기 APK 다운로드 지원")
	flag.Parse()

	if *allowLAN && *addr == "127.0.0.1:8787" {
		*addr = "0.0.0.0:8787"
	}
	if strings.HasPrefix(*addr, "0.0.0.0:") || strings.HasPrefix(*addr, ":") {
		*allowLAN = true
	}

	r, err := findRoot(*root)
	if err != nil {
		log.Fatal(err)
	}

	ln, err := net.Listen("tcp", *addr)
	if err != nil {
		log.Fatal(err)
	}

	if !*allowLAN && !isLoopback(ln.Addr()) {
		log.Fatalf("루프백 주소에만 바인딩할 수 있습니다: %s (-lan 플래그를 추가하면 내부 네트워크에서 접속 가능합니다)", ln.Addr())
	}

	_, port, err := net.SplitHostPort(ln.Addr().String())
	if err != nil {
		port = "8787"
	}

	srv, err := newServer(r, port, *allowLAN)
	if err != nil {
		log.Fatal(err)
	}
	for _, p := range srv.problems {
		log.Printf("경고: 프로젝트 제외 — %s", p)
	}
	log.Printf("루트: %s, 프로젝트 %d개", r, len(srv.cat.All()))

	localURL := "http://localhost:" + port + "/"
	log.Printf("로컬 학습 사이트: %s", localURL)

	if *allowLAN || !isLoopback(ln.Addr()) {
		log.Printf("📱 [내부 네트워크 모드 활성화]")
		log.Printf("   디바이스 APK 다운로드 페이지: http://%s:%s/apk", srv.lanInfo.PrimaryIP, port)
		for _, ip := range srv.lanInfo.AllIPs {
			if ip != srv.lanInfo.PrimaryIP {
				log.Printf("   (대체 IP): http://%s:%s/apk", ip, port)
			}
		}
	} else {
		log.Printf("💡 팁: 동일 Wi-Fi 모바일 기기에서 접속하려면 -lan 옵션을 사용하세요: go run ./site -lan")
	}

	httpSrv := &http.Server{Handler: srv.routes(), ReadHeaderTimeout: 10 * time.Second}
	go func() {
		if err := httpSrv.Serve(ln); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal(err)
		}
	}()
	if *openBrowser {
		launchBrowser(localURL)
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()
	<-ctx.Done()
	log.Print("종료 중…")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	httpSrv.Shutdown(shutdownCtx)
}

func findRoot(flagRoot string) (string, error) {
	if flagRoot != "" {
		return filepath.Abs(flagRoot)
	}
	cwd, err := os.Getwd()
	if err != nil {
		return "", err
	}
	for _, cand := range []string{cwd, filepath.Dir(cwd)} {
		if st, err := os.Stat(filepath.Join(cand, "projects")); err == nil && st.IsDir() {
			return cand, nil
		}
	}
	return "", fmt.Errorf("projects/ 디렉터리를 찾지 못했습니다. -root를 지정하세요 (cwd=%s)", cwd)
}

func isLoopback(a net.Addr) bool {
	tcp, ok := a.(*net.TCPAddr)
	return ok && tcp.IP.IsLoopback()
}

func launchBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", "", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	if err := cmd.Start(); err != nil {
		log.Printf("브라우저를 열지 못했습니다: %v", err)
	}
}

// ---- 서버 ----

type server struct {
	root     string
	store    *progress.Store
	runner   *runner.Runner
	tmpl     map[string]*template.Template
	mu       sync.RWMutex
	cat      *catalog.Catalog
	problems []catalog.Problem
	apkMgr   *apk.Manager
	port     string
	lanInfo  apk.LANIPInfo
	allowLAN bool
}

func newServer(root string, port string, allowLAN bool) (*server, error) {
	s := &server{
		root:     root,
		port:     port,
		allowLAN: allowLAN,
		apkMgr:   apk.NewManager(root),
		lanInfo:  apk.DetectLANIPs(),
	}
	if err := s.reload(); err != nil {
		return nil, err
	}
	store, err := progress.Open(filepath.Join(root, "data", "progress.json"))
	if err != nil {
		return nil, fmt.Errorf("progress.json 읽기 실패: %w", err)
	}
	s.store = store
	s.runner = runner.New()
	s.runner.OnDone = func(job *runner.Job, res runner.Result) {
		if err := s.store.Record(job.Project.ID, job.Stage, res.OK, res.Passed, res.Total); err != nil {
			log.Printf("진행률 저장 실패: %v", err)
		}
	}
	funcs := template.FuncMap{
		"statusLabel": statusLabel,
		"pct": func(a, b int) int {
			if b == 0 {
				return 0
			}
			return a * 100 / b
		},
	}
	s.tmpl = map[string]*template.Template{}
	for _, page := range []string{"home", "project", "doctor", "apk"} {
		t, err := template.New("layout").Funcs(funcs).ParseFS(web.Templates, "templates/layout.html", "templates/"+page+".html")
		if err != nil {
			return nil, err
		}
		s.tmpl[page] = t
	}
	return s, nil
}

// reload는 카탈로그를 다시 읽는다. 콘텐츠를 고치는 동안 서버를 재시작하지 않아도 되도록
// 페이지 요청마다 부른다(20개 JSON, 밀리초 단위).
func (s *server) reload() error {
	cat, problems, err := catalog.Load(s.root)
	if err != nil {
		return err
	}
	s.mu.Lock()
	s.cat, s.problems = cat, problems
	s.mu.Unlock()
	return nil
}

func (s *server) catalog() *catalog.Catalog {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.cat
}

func statusLabel(status string) string {
	switch status {
	case progress.Passed:
		return "통과"
	case progress.InProgress:
		return "진행 중"
	}
	return "시작 전"
}

func (s *server) routes() http.Handler {
	mux := http.NewServeMux()
	static, _ := fs.Sub(web.Static, "static")
	mux.Handle("GET /static/", http.StripPrefix("/static/", http.FileServerFS(static)))
	mux.HandleFunc("GET /{$}", s.handleHome)
	mux.HandleFunc("GET /p/{lang}/{slug}", s.handleProject)
	mux.HandleFunc("GET /doctor", s.handleDoctor)
	mux.HandleFunc("GET /apk", s.handleAPK)
	mux.HandleFunc("GET /api/apk/status", s.handleAPKStatus)
	mux.HandleFunc("GET /api/apk/download", s.handleAPKDownload)
	mux.HandleFunc("GET /api/apk/download/bookeink", s.handleBookeinkDownload)
	mux.HandleFunc("GET /api/apk/qr", s.handleAPKQR)
	mux.HandleFunc("POST /api/apk/build", s.handleAPKBuild)
	mux.HandleFunc("GET /api/apk/events", s.handleAPKEvents)
	mux.HandleFunc("GET /api/tree/{lang}/{slug}/{area}", s.handleTree)
	mux.HandleFunc("GET /api/file/{lang}/{slug}/{area}/{path...}", s.handleFile)
	mux.HandleFunc("GET /api/events/{id}", s.handleEvents)
	mux.HandleFunc("GET /api/progress", s.handleProgress)
	mux.HandleFunc("POST /api/open/{lang}/{slug}", s.handleOpen)
	mux.HandleFunc("POST /api/reset/{lang}/{slug}", s.handleReset)
	mux.HandleFunc("POST /api/run/{lang}/{slug}", s.handleRun)
	return s.guard(mux)
}

// guard는 DNS 리바인딩과 교차 출처 POST를 막는다.
// LAN 허용 모드에서는 동일 서브넷(사설망 IP) 및 .local 호스트명을 허용한다.
func (s *server) guard(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host := r.Host
		if h, _, err := net.SplitHostPort(host); err == nil {
			host = h
		}
		ip := net.ParseIP(host)
		isLocal := host == "localhost" || (ip != nil && ip.IsLoopback())
		isLanAllowed := s.allowLAN && (strings.HasSuffix(host, ".local") || (ip != nil && (apk.IsPrivateIPv4(ip.To4()) || ip.IsLinkLocalUnicast())))
		if !isLocal && !isLanAllowed {
			http.Error(w, "허용되지 않는 Host (내부망 기기 접속은 -lan 옵션이 필요합니다)", http.StatusForbidden)
			return
		}
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			site := r.Header.Get("Sec-Fetch-Site")
			origin := r.Header.Get("Origin")
			sameOrigin := site == "same-origin" || site == "none" ||
				(site == "" && (origin == "" || strings.EqualFold(origin, "http://"+r.Host)))
			if !sameOrigin {
				// 내부망 IP 접속 시 Origin 호스트 일치 여부 확인
				if origin != "" {
					origHost := strings.TrimPrefix(strings.TrimPrefix(origin, "http://"), "https://")
					if strings.EqualFold(origHost, r.Host) {
						sameOrigin = true
					}
				}
			}
			if !sameOrigin {
				http.Error(w, "교차 출처 요청은 허용하지 않습니다", http.StatusForbidden)
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}

// ---- 페이지 ----

type projectView struct {
	*catalog.Project
	Progress progress.Entry
}

type langView struct {
	Key, Name string
	Projects  []projectView
	Summary   progress.Summary
}

func (s *server) handleHome(w http.ResponseWriter, r *http.Request) {
	if err := s.reload(); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	cat := s.catalog()
	var langs []langView
	for _, l := range cat.Langs {
		lv := langView{Key: l.Key, Name: l.Name}
		var ids []string
		for _, p := range l.Projects {
			lv.Projects = append(lv.Projects, projectView{p, s.store.Get(p.ID)})
			ids = append(ids, p.ID)
		}
		lv.Summary = s.store.Summarize(ids)
		langs = append(langs, lv)
	}
	s.mu.RLock()
	problems := s.problems
	s.mu.RUnlock()
	s.render(w, "home", map[string]any{
		"Title":    "홈",
		"Langs":    langs,
		"Problems": problems,
	})
}

func (s *server) lookup(w http.ResponseWriter, r *http.Request) (*catalog.Project, bool) {
	p, ok := s.catalog().Get(r.PathValue("lang"), r.PathValue("slug"))
	if !ok {
		http.NotFound(w, r)
	}
	return p, ok
}

func (s *server) handleProject(w http.ResponseWriter, r *http.Request) {
	if err := s.reload(); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	p, ok := s.lookup(w, r)
	if !ok {
		return
	}
	readme, err := os.ReadFile(filepath.Join(p.Dir, "README.md"))
	if err != nil {
		readme = []byte("_README.md가 아직 없습니다._")
	}
	doc, err := guide.Render(readme)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	prev, next := s.catalog().Neighbors(p)
	work := workspace.Dir(s.root, p)
	s.render(w, "project", map[string]any{
		"Title":       p.Title,
		"P":           p,
		"Guide":       doc,
		"Progress":    s.store.Get(p.ID),
		"Prev":        prev,
		"Next":        next,
		"WorkExists":  workspace.Exists(s.root, p),
		"WorkDir":     work,
		"HasSolution": dirExists(filepath.Join(p.Dir, "solution")),
		"HasTests":    dirExists(filepath.Join(p.Dir, "tests")),
		"BuildCmd":    strings.Join(p.Build, " "),
		"RunCmd":      strings.Join(append(append([]string{}, p.Run...), p.RunArgs...), " "),
	})
}

func (s *server) handleDoctor(w http.ResponseWriter, r *http.Request) {
	tools := doctor.Check()
	s.render(w, "doctor", map[string]any{
		"Title":    "환경 점검",
		"Tools":    tools,
		"AllFound": doctor.AllFound(tools),
		"Root":     s.root,
	})
}

func (s *server) handleAPK(w http.ResponseWriter, r *http.Request) {
	st := s.apkMgr.Status()
	bSt := s.apkMgr.BookeinkStatus()

	host := r.Host
	if h, _, err := net.SplitHostPort(host); err == nil {
		if h == "localhost" || h == "127.0.0.1" {
			host = fmt.Sprintf("%s:%s", s.lanInfo.PrimaryIP, s.port)
		}
	} else if host == "localhost" || host == "127.0.0.1" {
		host = fmt.Sprintf("%s:%s", s.lanInfo.PrimaryIP, s.port)
	}

	apkURL := fmt.Sprintf("http://%s/apk", host)
	downloadURL := fmt.Sprintf("http://%s/api/apk/download", host)
	bookeinkDownloadURL := fmt.Sprintf("http://%s/api/apk/download/bookeink", host)
	qrURL := fmt.Sprintf("/api/apk/qr?text=%s", apkURL)

	s.render(w, "apk", map[string]any{
		"Title":               "Android E-ink 앱 (APK) 다운로드",
		"Status":              st,
		"BookeinkStatus":      bSt,
		"LANInfo":             s.lanInfo,
		"Port":                s.port,
		"AllowLAN":            s.allowLAN,
		"APKURL":              apkURL,
		"DownloadURL":         downloadURL,
		"BookeinkDownloadURL": bookeinkDownloadURL,
		"QRURL":               qrURL,
	})
}

func (s *server) handleAPKStatus(w http.ResponseWriter, r *http.Request) {
	app := r.URL.Query().Get("app")
	if app == "bookeink" {
		writeJSON(w, 200, s.apkMgr.BookeinkStatus())
		return
	}
	writeJSON(w, 200, map[string]any{
		"prostudy":         s.apkMgr.Status(),
		"bookeink":         s.apkMgr.BookeinkStatus(),
		"exists":           s.apkMgr.Status().Exists,
		"fileName":         s.apkMgr.Status().FileName,
		"sizeFormatted":    s.apkMgr.Status().SizeFormatted,
		"modTimeFormatted": s.apkMgr.Status().ModTimeFormatted,
		"isBuilding":       s.apkMgr.IsBuilding(),
		"lastError":        s.apkMgr.Status().LastError,
	})
}

func (s *server) handleAPKDownload(w http.ResponseWriter, r *http.Request) {
	if r.URL.Query().Get("app") == "bookeink" {
		s.handleBookeinkDownload(w, r)
		return
	}
	apkPath := s.apkMgr.APKPath()
	st, err := os.Stat(apkPath)
	if err != nil || st.IsDir() {
		jsonError(w, 404, "pro-study APK 파일이 아직 빌드되지 않았습니다. 웹 페이지에서 빌드를 먼저 실행해주세요.")
		return
	}
	fileName := s.apkMgr.APKFileName()
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", fileName))
	w.Header().Set("Content-Type", "application/vnd.android.package-archive")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", st.Size()))
	http.ServeFile(w, r, apkPath)
}

func (s *server) handleBookeinkDownload(w http.ResponseWriter, r *http.Request) {
	apkPath := s.apkMgr.BookeinkAPKPath()
	st, err := os.Stat(apkPath)
	if err != nil || st.IsDir() {
		jsonError(w, 404, "Bookeink APK 파일이 아직 빌드되지 않았습니다. Bookeink를 먼저 빌드해주세요.")
		return
	}
	w.Header().Set("Content-Disposition", "attachment; filename=\"bookeink.apk\"")
	w.Header().Set("Content-Type", "application/vnd.android.package-archive")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", st.Size()))
	http.ServeFile(w, r, apkPath)
}

func (s *server) handleAPKQR(w http.ResponseWriter, r *http.Request) {
	text := r.URL.Query().Get("text")
	if text == "" {
		host := r.Host
		if h, _, err := net.SplitHostPort(host); err == nil {
			if h == "localhost" || h == "127.0.0.1" {
				host = fmt.Sprintf("%s:%s", s.lanInfo.PrimaryIP, s.port)
			}
		} else if host == "localhost" || host == "127.0.0.1" {
			host = fmt.Sprintf("%s:%s", s.lanInfo.PrimaryIP, s.port)
		}
		text = fmt.Sprintf("http://%s/apk", host)
	}
	pngData, err := apk.GenerateQRPNG(text, 256)
	if err != nil {
		http.Error(w, "QR 코드 생성 실패: "+err.Error(), 500)
		return
	}
	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Cache-Control", "no-cache")
	w.Write(pngData)
}

func (s *server) handleAPKBuild(w http.ResponseWriter, r *http.Request) {
	if s.apkMgr.IsBuilding() {
		jsonError(w, 409, "이미 APK 빌드가 진행 중입니다.")
		return
	}
	app := r.URL.Query().Get("app")
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
		defer cancel()
		if app == "bookeink" {
			if err := s.apkMgr.BuildBookeink(ctx); err != nil {
				log.Printf("Bookeink APK 빌드 에러: %v", err)
			}
		} else {
			if err := s.apkMgr.Build(ctx); err != nil {
				log.Printf("pro-study APK 빌드 에러: %v", err)
			}
		}
	}()
	writeJSON(w, 202, map[string]string{"status": "building", "app": app})
}

func (s *server) handleAPKEvents(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", 500)
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("X-Accel-Buffering", "no")

	logs, unsub := s.apkMgr.SubscribeLogs()
	defer unsub()

	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case line, ok := <-logs:
			if !ok {
				return
			}
			data, _ := json.Marshal(map[string]any{
				"line":       line,
				"isBuilding": s.apkMgr.IsBuilding(),
			})
			fmt.Fprintf(w, "data: %s\n\n", data)
			flusher.Flush()
		case <-ticker.C:
			// 연결 유지용 heartbeat 및 상태 업데이트
			data, _ := json.Marshal(map[string]any{
				"heartbeat":  true,
				"isBuilding": s.apkMgr.IsBuilding(),
				"status":     s.apkMgr.Status(),
			})
			fmt.Fprintf(w, "data: %s\n\n", data)
			flusher.Flush()
		case <-r.Context().Done():
			return
		}
	}
}


func (s *server) render(w http.ResponseWriter, page string, data map[string]any) {
	data["Page"] = page
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := s.tmpl[page].ExecuteTemplate(w, "layout", data); err != nil {
		log.Printf("템플릿 %s: %v", page, err)
	}
}

func dirExists(p string) bool {
	st, err := os.Stat(p)
	return err == nil && st.IsDir()
}

// ---- API ----

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func jsonError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// areaDir은 코드 뷰어 탭(starter|solution|tests|work)을 실제 디렉터리로 바꾼다.
func (s *server) areaDir(p *catalog.Project, area string) (string, bool) {
	switch area {
	case "starter", "solution", "tests":
		return filepath.Join(p.Dir, area), true
	case "work":
		return workspace.Dir(s.root, p), true
	}
	return "", false
}

func (s *server) handleTree(w http.ResponseWriter, r *http.Request) {
	p, ok := s.lookup(w, r)
	if !ok {
		return
	}
	base, ok := s.areaDir(p, r.PathValue("area"))
	if !ok {
		http.NotFound(w, r)
		return
	}
	nodes, err := catalog.Tree(base)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			writeJSON(w, 200, []catalog.FileNode{})
			return
		}
		jsonError(w, 500, err.Error())
		return
	}
	if nodes == nil {
		nodes = []catalog.FileNode{}
	}
	writeJSON(w, 200, nodes)
}

func (s *server) handleFile(w http.ResponseWriter, r *http.Request) {
	p, ok := s.lookup(w, r)
	if !ok {
		return
	}
	base, ok := s.areaDir(p, r.PathValue("area"))
	if !ok {
		http.NotFound(w, r)
		return
	}
	b, err := catalog.ReadFile(base, r.PathValue("path"))
	if err != nil {
		http.NotFound(w, r)
		return
	}
	if len(b) > 512*1024 {
		http.Error(w, "파일이 너무 큽니다", http.StatusRequestEntityTooLarge)
		return
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Write(b)
}

func (s *server) handleOpen(w http.ResponseWriter, r *http.Request) {
	p, ok := s.lookup(w, r)
	if !ok {
		return
	}
	dir, created, err := workspace.Ensure(s.root, p)
	if err != nil {
		jsonError(w, 500, err.Error())
		return
	}
	s.store.Touch(p.ID)
	res := opener.Open(dir, workspace.EntryPath(p, dir))
	writeJSON(w, 200, map[string]any{
		"opened": res.Opened, "url": res.URL, "error": res.Error,
		"created": created, "dir": dir,
	})
}

func (s *server) handleReset(w http.ResponseWriter, r *http.Request) {
	p, ok := s.lookup(w, r)
	if !ok {
		return
	}
	dir, err := workspace.Reset(s.root, p)
	if err != nil {
		jsonError(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]any{"dir": dir})
}

func (s *server) handleRun(w http.ResponseWriter, r *http.Request) {
	p, ok := s.lookup(w, r)
	if !ok {
		return
	}
	var body struct {
		Stage string `json:"stage"`
		Stdin string `json:"stdin"`
	}
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 64*1024)).Decode(&body); err != nil {
		jsonError(w, 400, "잘못된 요청 본문")
		return
	}
	if !workspace.Exists(s.root, p) {
		jsonError(w, 409, workspace.ErrNoWorkspace.Error())
		return
	}
	job, err := s.runner.Start(p, workspace.Dir(s.root, p), body.Stage, body.Stdin)
	if err != nil {
		jsonError(w, 400, err.Error())
		return
	}
	writeJSON(w, 202, map[string]string{"id": job.ID})
}

func (s *server) handleEvents(w http.ResponseWriter, r *http.Request) {
	job, ok := s.runner.Get(r.PathValue("id"))
	if !ok {
		http.NotFound(w, r)
		return
	}
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", 500)
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("X-Accel-Buffering", "no")
	send := func(e runner.Event) {
		b, _ := json.Marshal(e)
		fmt.Fprintf(w, "data: %s\n\n", b)
		flusher.Flush()
	}
	replay, live, cancel := job.Subscribe()
	defer cancel()
	for _, e := range replay {
		send(e)
	}
	for {
		select {
		case e, ok := <-live:
			if !ok {
				return
			}
			send(e)
		case <-r.Context().Done():
			return
		}
	}
}

func (s *server) handleProgress(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, 200, s.store.All())
}
