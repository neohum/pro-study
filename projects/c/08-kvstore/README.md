# 08. 파일 기반 Key-Value 저장소

## 무엇을 만드는가

디스크 상의 바이너리 로그 파일과 인메모리 해시 인덱스를 결합한 Bitcask 스타일의 고성능 Key-Value 저장소를 구현한다. 모든 쓰기/삭제는 파일 끝에만 추가되는 Append-only 방식이며, 읽기는 해시맵을 통해 정확한 파일 위치(오프셋)로 즉시 시크(Seek)하여 O(1) 디스크 접근으로 처리한다. 시스템 충돌(Crash) 시의 자동 복구 및 디스크 공간 회수를 위한 컴팩션(Compaction)을 지원한다.

```
$ build/app.exe case01.db
set name alice
ok
get name
alice
set age 25
ok
get age
25
len
2
```

## 왜 이 프로젝트인가

데이터베이스 저장 엔진(Bitcask, LSM-Tree, WAL)의 기본은 "디스크 임의 쓰기(Random Write)를 피하고 순차 쓰기(Sequential Write)로 변환하는 것"이다. 디스크는 순차 I/O가 압도적으로 빠르며, 파일 끝에만 쓰는 방식은 충돌 복구를 매우 단순하게 만든다.

이 프로젝트에서는 3번 해시맵(`map.h`, `map.c`)을 키-오프셋 인덱스로 재활용하고, C23의 `_BitInt`와 바이트 단위 패킹 구조체, 파일 I/O 포인터 조작을 결합해 실제 프로덕션 DB 엔진의 핵심 원리를 구현한다.

## 핵심 개념

### Bitcask 모델: 로그 구조화 파일 + 인메모리 해시 인덱스

- **쓰기 (`set`)**: 파일의 끝(`SEEK_END`)에 바이너리 레코드를 기록하고, 인메모리 해시맵에 `key → 파일 오프셋`을 저장한다.
- **읽기 (`get`)**: 인메모리 해시맵에서 `offset`을 O(1)로 조회한 뒤, 파일에서 단 한 번의 `fseek`과 `fread`로 값을 꺼낸다.
- **삭제 (`del`)**: 값을 지우는 대신 `REC_DEL` 툼스톤(Tombstone) 레코드를 파일 끝에 기록하고 해시맵에서 키를 제거한다.

### C23: `_BitInt`와 바이너리 레코드 패킹

C23의 `_BitInt(N)`은 비트 단위 크기를 명시할 수 있는 정수 타입이다. 디스크 레코드의 플래그 필드나 헤더 크기를 정밀하게 설계할 수 있다.

```c
#pragma pack(push, 1)
typedef struct RecordHeader {
    uint32_t magic;    // 매직 바이트 (0x4B565354)
    uint8_t type;      // REC_SET 또는 REC_DEL
    uint32_t key_len;
    uint32_t val_len;
} RecordHeader;
#pragma pack(pop)
```

### 크래시 복구(Crash Recovery)와 컴팩션(Compaction)

- **크래시 복구**: 프로그램 재시작 시 0번 오프셋부터 파일 끝까지 레코드를 순차 재생(Replay)한다. 중간에 비정상 종료되어 잘린 레코드는 매직 바이트 검사로 걸러내고 인덱스 복원을 완료한다.
- **컴팩션**: 변경이나 삭제가 누적되면 이전 버전의 값들이 디스크 공간을 낭비한다. 현재 인덱스에 살아 있는 유효한 키들만 새 파일에 모아 쓴 후 원본 파일과 교체함으로써 디스크를 압축 회수한다.

## 단계별 구현

`starter/main.c`의 `TODO(step-N)` 주석이 아래 단계와 1:1이다. 각 단계를 마칠 때마다 컴파일하여 경고가 없는지 확인하자.

### Step 1: 바이너리 레코드 헤더와 KV 저장소 구조체

`RecordHeader` 바이너리 구조체를 정의하고, `store_open`에서 파일을 바이너리 읽기/쓰기 모드(`"r+b"` / `"w+b"`)로 열고 인메모리 해시 인덱스를 준비한다.

확인: `store_open` 호출 시 오류 없이 DB 인스턴스가 생성되는지 확인.

### Step 2: Append-only 로그 쓰기와 인메모리 인덱스

`store_set`과 `store_del`을 구현한다. 항상 `fseek(fp, 0, SEEK_END)`로 파일 끝으로 이동한 뒤 헤더, 키, 값을 연속해서 기록하고, 인메모리 맵의 오프셋을 갱신한다.

확인: `set key value` 명령 실행 후 파일 크기가 레코드 바이트만큼 증가하는지 확인.

### Step 3: 키 조회와 파일 오프셋 시크

`store_get`에서 인메모리 맵을 조회하여 파일 오프셋을 획득한다. `fseek(fp, offset, SEEK_SET)`로 정확한 위치로 이동한 후 헤더와 값을 읽어 출력한다. 키가 없으면 `error: not found`를 반환한다.

확인: `set name alice` 후 `get name`으로 `alice`가 출력되는지 확인.

### Step 4: 크래시 복구 및 순차 로그 재생

`store_recover`에서 파일의 처음부터 순차적으로 헤더와 레코드를 읽어 나간다. 유효한 `REC_SET`은 맵에 오프셋을 등록하고 `REC_DEL`은 맵에서 제거한다. `reopen` 명령어로 메모리를 비우고 디스크 로그만으로 인덱스가 복원되는지 검증한다.

확인: `04-recovery.in` 테스트로 `reopen` 후에도 최신 키-값 데이터가 유지되는지 확인.

### Step 5: 로그 컴팩션과 CLI 명령 루프

`map_each`를 사용해 살아 있는 최신 키-값 쌍만 임시 파일(`.compact`)에 순차 기록하고 원본 파일과 원자적으로 교체한다. 표준 입력 루프에서 `set`, `get`, `del`, `len`, `reopen`, `compact` 명령을 처리한다.

확인: `01-basic.in`부터 `05-compaction.in`까지 5개의 모든 테스트 케이스 통과.

## 막혔을 때

| 증상 | 원인 |
| --- | --- |
| Windows에서 파일 갱신 후 읽기 실패 | C 표준 I/O 스트림 규칙상 파일 읽기와 쓰기 전환 시점에 `fflush` 또는 `fseek` 호출이 필수 |
| `compact` 실행 중 파일 교체(`rename`) 실패 | 원본 파일 포인터나 임시 파일 포인터를 `fclose`로 닫기 전에 `rename`을 시도함 (Windows 파일 락) |
| `reopen` 후 키가 복원되지 않음 | 복구 루프에서 `REC_SET` 후 `val_len`만큼 파일 포인터를 건너뛰지 않아 다음 헤더가 어긋남 |
| starter 빌드 경고 발생 | `(void)param;`을 통해 미사용 파라미터 경고를 억제했는지 점검 |

## 더 나아가기

- CRC32 체크섬을 레코드 헤더에 추가하여 디스크 데이터 무결성 검증 강화.
- 파일 크기가 일정 기준(예: 64MB)을 넘기면 세그먼트를 분할하는 멀티 세그먼트 로그 구현.
- 인메모리 인덱스 없이도 범위 조회가 가능한 LSM-Tree(SSTable) 구조로 확장.

## 참고

- Justin Sheehy & David Smith: *Bitcask: A Log-Structured Hash Table for Fast Key/Value Data*
- C23 표준 초안 N3220: 6.2.5 기본 타입(`_BitInt`)
- Martin Kleppmann: *Designing Data-Intensive Applications* Chapter 3 (Storage and Retrieval)
