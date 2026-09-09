# 06. WAL 기반 Key-Value 저장소

## 무엇을 만드는가

데이터 변경 내역을 먼저 디스크의 로그 파일(`wal.log`)에 순차적으로 기록(Write-Ahead Logging)하여 장애가 발생해도 데이터를 유실 없이 복구할 수 있는 영속성 Key-Value 저장소 엔진 및 CLI 도구다.

```
$ build/app.exe -dir data set user:1 "Alice"
OK
$ build/app.exe -dir data get user:1
Alice
$ build/app.exe -dir data set user:2 "Bob"
OK
$ build/app.exe -dir data snapshot
스냅샷 생성 완료 (WAL 로그 압축됨)
$ build/app.exe -dir data del user:1
OK
$ build/app.exe -dir data get user:1
(not found)
```

## 왜 이 프로젝트인가

Redis, PostgreSQL, SQLite, etcd 등 현대의 거의 모든 데이터베이스와 분산 저장소는 **WAL(Write-Ahead Log)** 아키텍처를 근간으로 합니다. 메모리에 있는 상태만으로는 전원 차단 시 데이터가 유실되고, 매번 전체 데이터를 디스크에 다시 쓰는 것은 입출력 비용이 너무 크기 때문입니다.

이 프로젝트에서는 추가 전용(append-only) 로그로 고속 쓰기를 달성하는 원리, `os.File.Sync`를 통한 디스크 플러시, `sync.RWMutex`를 통한 동시성 안전성, 비정상 종료 시 로그 재생(Replay)을 통한 크래시 복구, 그리고 스냅샷을 이용한 WAL 로그 압축(Compaction) 기법을 직접 구현하며 스토리지 엔진의 내부 동작을 체득합니다.

## 핵심 개념

### Write-Ahead Logging (WAL) 원리

데이터를 메모리 맵에 반영하기 **직전에** 디스크 로그 파일 끝에 작업을 순차 기록합니다. 전원이 즉시 꺼지더라도 다시 시작할 때 로그를 처음부터 순차 실행(Replay)하면 최종 상태를 완벽하게 재구성할 수 있습니다.

```go
type Record struct {
    Op    OpType `json:"op"`
    Key   string `json:"key"`
    Value string `json:"val,omitempty"`
}
```

### 디스크 버퍼 플러시 (File.Sync)

운영체제는 성능을 위해 디스크 쓰기 요청을 커널 페이지 캐시에 임시 보관합니다. 전원 공급 중단에도 영속성을 보장하려면 `file.Sync()`를 명시적으로 호출해 물리 디스크로 플러시해야 합니다.

```go
line, _ := json.Marshal(rec)
s.walFile.Write(append(line, '\n'))
s.walFile.Sync()
```

### 스냅샷과 로그 압축 (Compaction)

로그가 한없이 커지면 디스크 낭비가 심해지고 시작 시 복구 시간이 길어집니다. 주기적으로 현재 메모리 상태를 스냅샷(`snapshot.json`)에 원자적으로 저장하고, 기존 WAL 로그를 비워(truncate) 크기를 줄입니다.

```go
// 임시 파일에 저장 후 원자적 교체
os.WriteFile(tmpPath, snapData, 0o644)
os.Rename(tmpPath, snapPath)
// WAL 파일 0바이트로 초기화
s.walFile.Truncate(0)
s.walFile.Seek(0, io.SeekStart)
```

## 단계별 구현

### Step 1: 레코드 정의와 메모리 Map

`OpType`("SET", "DEL"), `Record` 구조체, 그리고 메모리 저장소 맵 `map[string]string`을 포함하는 `KVStore` 구조체를 정의합니다. `sync.RWMutex`를 적용하여 `Get`과 `Keys` 메서드를 구현합니다.

확인: 메모리 상에서 키 조회 및 키 목록 조회가 정상 동작하는지 확인합니다.

### Step 2: WAL(Write-Ahead Log) 추가 및 동기화

`Set`과 `Delete` 메서드를 구현합니다. 뮤텍스 락을 획득한 뒤, 먼저 레코드를 JSON 줄바꿈 형태로 WAL 파일에 추가하고 `Sync()`를 호출한 다음 메모리 맵을 갱신합니다.

확인: `Set` 호출 후 `wal.log` 파일에 JSON 레코드가 한 줄씩 추가되는지 확인합니다.

### Step 3: WAL 재생 및 시작 시 복구

저장소를 여는 `Open(dir)` 함수를 구현합니다. 디스크의 `snapshot.json`이 존재하면 먼저 로드하고, 이어서 `wal.log`를 한 줄씩 읽어 연산(`SET`, `DEL`)을 메모리 맵에 재생(Replay)합니다. 도중에 손상된 마지막 줄이 있으면 안전하게 무시합니다.

확인: 저장소를 닫았다가 다시 열었을 때 이전 데이터가 복구되는지 확인합니다.

### Step 4: 스냅샷 저장과 로그 압축(Compaction)

`Snapshot()` 메서드를 구현합니다. 현재 메모리의 모든 키-값을 `snapshot.json.tmp`에 쓴 뒤 `os.Rename`으로 안전하게 교체합니다. 스냅샷이 완료되면 `wal.log`의 크기를 0으로 자르고 파일 오프셋을 처음으로 되돌립니다.

확인: `Snapshot` 호출 후 `wal.log` 파일 크기가 0이 되고 `snapshot.json`이 생성되는지 확인합니다.

### Step 5: CLI 명령 디스패치와 실행기

`-dir` 플래그로 데이터 디렉터리를 지정받고, 서브커맨드(`set`, `get`, `del`, `snapshot`, `list`)를 실행하는 CLI 진입점(`main.go`, `run`)을 구현합니다.

확인: `app.exe -dir mydata set key value` 실행 후 `app.exe -dir mydata get key`로 조회가 되는지 확인합니다.

## 막혔을 때

| 증상 | 원인 |
| --- | --- |
| 비정상 종료 후 복구 시 데이터가 유실됨 | `Set`/`Delete` 호출 시 `walFile.Sync()`가 누락되어 OS 버퍼에만 남아 있었음 |
| 스냅샷 도중 프로세스가 죽어 파일이 손상됨 | 직접 파일을 덮어쓰지 말고 `.tmp` 파일에 기록 후 `os.Rename`을 사용해야 함 |
| `Close`를 호출한 뒤 `Set`을 호출하면 패닉 발생 | 닫힌 파일 디스크립터에 쓰기를 시도함. 저장소 상태 플래그 검증 필요 |
| 다중 고루틴에서 `fatal error: concurrent map read and map write` | 읽기 시 `RLock()`, 쓰기 시 `Lock()`이 누락되었음 |

## 더 나아가기

- 레코드마다 CRC32 체크섬을 함께 기록하여 디스크 비트 플립(Bit Rot) 감지
- 키 만료 시간(TTL) 지원 및 주기적인 만료 키 정리 백그라운드 고루틴 추가
- 대용량 데이터를 위한 바이너리 직렬화(`encoding/binary`) 포맷 적용

## 참고

- Martin Kleppmann: Designing Data-Intensive Applications (저장소와 검색)
- Go 표준 라이브러리: sync.RWMutex (<https://pkg.go.dev/sync#RWMutex>)
- Go 표준 라이브러리: os.File.Sync (<https://pkg.go.dev/os#File.Sync>)
