# 07. TCP 브로드캐스트 채팅 서버

## 무엇을 만드는가

터미널이나 텔넷(`nc`, `telnet`)으로 여러 클라이언트가 동시 접속하여 실시간으로 대화를 주고받을 수 있는 TCP 다중 접속 브로드캐스트 채팅 서버다.

```
[서버 시작]
$ build/app.exe -port 9000
채팅 서버 시작 (포트: 9000)

[클라이언트 A]
$ nc localhost 9000
[서버] 환영합니다! /nick <이름> 으로 닉네임을 변경할 수 있습니다.
[입장] guest-1 님이 입장하셨습니다.
안녕하세요!
[guest-2] 반갑습니다!
/nick Alice
[알림] guest-1 님이 Alice 으로 닉네임을 변경했습니다.

[클라이언트 B]
$ nc localhost 9000
[서버] 환영합니다! /nick <이름> 으로 닉네임을 변경할 수 있습니다.
[입장] guest-2 님이 입장하셨습니다.
[guest-1] 안녕하세요!
반갑습니다!
```

## 왜 이 프로젝트인가

Go 언어가 가장 빛을 발하는 영역 중 하나는 고성능 네트워크 동시성 프로그래밍입니다. 전통적인 C 기반 네트워크 프로그래밍에서는 `epoll`이나 논블로킹 I/O를 다루기 위해 복잡한 상태 머신을 작성해야 했지만, Go에서는 Go 런타임의 넷폴러(Netpoller) 덕분에 "연결당 1개의 고루틴"이라는 직관적인 블로킹 코드로 수만 개의 동시 접속을 효율적으로 처리할 수 있습니다.

이 프로젝트는 `net.Listen`을 이용한 소켓 서버 구축, 연결당 읽기/쓰기 고루틴 분리, 중앙 집중식 브로드캐스트 채널 허브(Hub 패턴), 채널과 `select`를 활용한 다중화, 그리고 종료 시 모든 연결을 안전하게 회수하는 Graceful Shutdown 기법을 종합적으로 학습합니다.

## 핵심 개념

### 허브(Hub) 패턴과 채널 다중화

수많은 클라이언트가 서로 직접 메시지를 보내면 잠금(Lock) 경쟁과 데드락 위험이 큽니다. 중앙 `Hub` 고루틴 하나가 등록(`register`), 해제(`unregister`), 브로드캐스트(`broadcast`) 채널 이벤트를 단일 루프의 `select`로 처리하면 동기화 락 없이도 완벽한 동시성 안전을 달성할 수 있습니다.

```go
type Hub struct {
    clients    map[*Client]bool
    broadcast  chan string
    register   chan *Client
    unregister chan *Client
}
```

### 읽기 펌프와 쓰기 펌프 (Read/Write Pump)

각 TCP 연결마다 읽기 전용 고루틴(`readPump`)과 쓰기 전용 고루틴(`writePump`)을 분리합니다. `bufio.Scanner`로 상대방의 패킷을 기다리는 동안에도 송신 채널(`send chan string`)의 메시지를 즉시 전송할 수 있습니다.

```go
func (c *Client) writePump() {
    defer c.conn.Close()
    for msg := range c.send {
        c.conn.Write([]byte(msg + "\n"))
    }
}
```

### Context 기반 Graceful Shutdown

서버 프로세스가 종료될 때 클라이언트 소켓을 강제로 끊지 않고, 열려 있는 연결들에 종료 안내 메시지를 발송한 뒤 리스너와 채널을 순서대로 닫아 안전하게 자원을 정리합니다.

```go
ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
defer stop()
<-ctx.Done()
server.Shutdown()
```

## 단계별 구현

### Step 1: Client 구조체와 송수신 펌프

`Client` 구조체를 정의하고 송신 버퍼 채널 `send chan string`을 둡니다. 소켓 입력을 읽는 `readPump`와 버퍼 채널에서 메시지를 꺼내 소켓으로 출력하는 `writePump`를 작성합니다.

확인: 클라이언트 생성 및 채널을 통한 메시지 전송 로직을 검증합니다.

### Step 2: Hub 브로드캐스트 이벤트 루프

`Hub` 구조체를 작성하고 `Run()` 이벤트 루프를 구현합니다. 새 클라이언트 등록, 연결 해제 시 클라이언트 채널 닫기, 그리고 수신된 브로드캐스트 메시지를 접속 중인 모든 클라이언트에게 안전하게 전달(버퍼 오버플로우 방지)합니다.

확인: 허브에 등록된 다수의 클라이언트에 메시지가 동시에 분배되는지 확인합니다.

### Step 3: 프로토콜 파싱과 메시지 분기

클라이언트가 보낸 텍스트를 분석하여 명령어를 처리합니다. `/nick <새이름>`이면 닉네임을 변경하고 전체 알림을 전송하며, 일반 텍스트이면 `[닉네임] 내용` 형식으로 브로드캐스트합니다. 클라이언트 접속/퇴장 시에도 시스템 알림을 전송합니다.

확인: 닉네임 변경 명령어 입력 시 변경 알림과 이후 발신자 명의가 갱신되는지 확인합니다.

### Step 4: TCP 리스너와 연결 수락 루프

`net.Listen("tcp", addr)`로 소켓을 열고, `Accept()` 루프에서 접속이 발생할 때마다 `Client` 객체를 생성하여 `readPump`와 `writePump` 고루틴을 기동하는 `Server`를 구현합니다.

확인: `net.Dial`을 통해 TCP 포트로 접속하여 환영 메시지가 수신되는지 확인합니다.

### Step 5: Graceful Shutdown과 서버 진입점

포트 번호(`-port`, 기본 9000)를 플래그로 파싱하고 `SIGINT`/`SIGTERM` 시그널을 수신하여 활성 연결과 허브를 닫고 종료하는 `Shutdown` 및 `main` 진입점을 작성합니다.

확인: 서버 종료 명령 시 모든 클라이언트 소켓이 깨끗하게 닫히고 대기 중이던 고루틴이 누수 없이 종료되는지 확인합니다.

## 막혔을 때

| 증상 | 원인 |
| --- | --- |
| 클라이언트 한 명이 멈추면 서버 전체가 멈춤 | 특정 클라이언트의 `send` 채널이 꽉 찼을 때 Hub의 브로드캐스트가 블로킹됨 (`select default`로 처리 필요) |
| 클라이언트 연결이 끊겼는데 고루틴이 계속 실행됨 | `readPump`의 스캐너가 끝났을 때 `unregister` 채널에 알리지 않아 클라이언트가 맵에 남아 있음 |
| `fatal error: concurrent map writes` 발생 | Hub가 아닌 다른 고루틴에서 `hub.clients` 맵을 직접 조작함. 반드시 채널을 거쳐야 함 |
| `go test -race` 실행 시 데이터 레이스 검출 | 클라이언트의 `name` 필드를 읽고 쓰는 과정에서 동기화가 누락됨 (채널 또는 뮤텍스로 보호) |

## 더 나아가기

- `/w <상대방> <메시지>` 귓속말(DM) 기능 추가
- `/list` 명령어로 현재 접속자 명단 보기
- ANSI 색상 코드를 활용하여 닉네임과 시스템 알림에 색상 입히기

## 참고

- Gorilla WebSocket Chat 예제 (Hub 패턴 원형) (<https://github.com/gorilla/websocket/tree/master/examples/chat>)
- Go 표준 라이브러리: net 패키지 (<https://pkg.go.dev/net>)
- Go 표준 라이브러리: bufio 패키지 (<https://pkg.go.dev/bufio>)
