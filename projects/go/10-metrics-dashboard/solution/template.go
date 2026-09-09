package main

import (
	"fmt"
	"html/template"
	"io"
)

func FormatBytes(b uint64) string {
	const unit = 1024
	if b < unit {
		return fmt.Sprintf("%d B", b)
	}
	div, exp := uint64(unit), 0
	for n := b / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(b)/float64(div), "KMGTPE"[exp])
}

type DashboardData struct {
	Title     string
	Snapshot  Snapshot
	Formatted struct {
		Heap  string
		Total string
	}
}

const dashboardHTML = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{.Title}}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #0f172a; color: #f8fafc; padding: 2rem; }
        .container { max-width: 900px; margin: 0 auto; }
        header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid #334155; padding-bottom: 1rem; }
        h1 { font-size: 1.5rem; font-weight: 700; color: #38bdf8; }
        .status-badge { background: #065f46; color: #34d399; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.25rem; }
        .card-label { font-size: 0.875rem; color: #94a3b8; margin-bottom: 0.5rem; }
        .card-value { font-size: 1.75rem; font-weight: 700; color: #f1f5f9; }
        .actions { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; }
        button { background: #2563eb; hover: background: #1d4ed8; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
        button:hover { background: #1d4ed8; }
        .log-box { background: #020617; border: 1px solid #1e293b; border-radius: 0.5rem; padding: 1rem; font-family: monospace; font-size: 0.85rem; color: #a5f3fc; height: 160px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{{.Title}}</h1>
            <span class="status-badge" id="sse-status">연결 대기중...</span>
        </header>

        <div class="grid">
            <div class="card">
                <div class="card-label">활성 고루틴 수</div>
                <div class="card-value" id="val-goroutines">{{.Snapshot.Goroutines}}</div>
            </div>
            <div class="card">
                <div class="card-label">힙 객체 메모리</div>
                <div class="card-value" id="val-heap">{{.Formatted.Heap}}</div>
            </div>
            <div class="card">
                <div class="card-label">런타임 전체 메모리</div>
                <div class="card-value" id="val-total">{{.Formatted.Total}}</div>
            </div>
            <div class="card">
                <div class="card-label">GC 누적 사이클</div>
                <div class="card-value" id="val-gc">{{.Snapshot.GCCycles}}</div>
            </div>
        </div>

        <div class="actions">
            <button onclick="triggerWorkload(50)">메모리 부하 시뮬레이션 (+50MB)</button>
            <button onclick="triggerWorkload(100)">대용량 부하 (+100MB)</button>
        </div>

        <div class="log-box" id="event-log">
            [시스템] 실시간 메트릭 스트림 대기중...
        </div>
    </div>

    <script>
        function formatBytes(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        }

        const logBox = document.getElementById('event-log');
        function addLog(msg) {
            const time = new Date().toLocaleTimeString();
            logBox.innerHTML = '[' + time + '] ' + msg + '<br>' + logBox.innerHTML;
        }

        const es = new EventSource('/api/stream');
        es.onopen = () => {
            const badge = document.getElementById('sse-status');
            badge.innerText = 'SSE 실시간 스트리밍';
            badge.style.background = '#065f46';
            badge.style.color = '#34d399';
            addLog('SSE 스트림 연결 성공');
        };

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                document.getElementById('val-goroutines').innerText = data.goroutines;
                document.getElementById('val-heap').innerText = formatBytes(data.heap_objects_bytes);
                document.getElementById('val-total').innerText = formatBytes(data.total_bytes);
                document.getElementById('val-gc').innerText = data.gc_cycles;
                addLog('메트릭 갱신 - 힙: ' + formatBytes(data.heap_objects_bytes) + ', 고루틴: ' + data.goroutines);
            } catch (e) {}
        };

        es.onerror = () => {
            const badge = document.getElementById('sse-status');
            badge.innerText = '연결 끊김 (재시도 중)';
            badge.style.background = '#7f1d1d';
            badge.style.color = '#f87171';
        };

        function triggerWorkload(mb) {
            fetch('/api/workload?mb=' + mb, { method: 'POST' })
                .then(res => res.json())
                .then(data => addLog('부하 요청 완료: ' + mb + 'MB 할당됨'));
        }
    </script>
</body>
</html>`

var parsedTemplate = template.Must(template.New("dashboard").Parse(dashboardHTML))

func RenderDashboard(w io.Writer, s Snapshot) error {
	data := DashboardData{
		Title:    "Go 런타임 메트릭 대시보드",
		Snapshot: s,
	}
	data.Formatted.Heap = FormatBytes(s.HeapObjectsBytes)
	data.Formatted.Total = FormatBytes(s.TotalBytes)
	return parsedTemplate.Execute(w, data)
}
