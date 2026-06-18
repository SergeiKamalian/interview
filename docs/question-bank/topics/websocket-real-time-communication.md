# WebSocket и real-time коммуникация

- **topic_code:** `websocket_real_time_communication`
- **source:** https://itlead.org/interview-questions/general/websocket-real-time-communication
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/websocket-real-time-communication.bank.json` → `pnpm seed:topic -- websocket_real_time_communication`
- **status:** draft

## Вопрос

> Что такое WebSocket и как он работает?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | websocket_definition | Суть WebSocket | 1.5 | core_plus | TL;DR: persistent full-duplex после HTTP upgrade |
| 1 | handshake_upgrade | Handshake 101 | 1.5 | core_plus | Sec-WebSocket-Key/Accept, SHA1+GUID |
| 2 | vs_http_alternatives | Сравнение с polling/SSE/HTTP | 2.0 | intermediate | таблица направлений, HTTP/2 vs WS |
| 3 | when_to_use | Когда использовать | 1.0 | basic | chat/games vs SSE/polling |
| 4 | common_mistakes | Типичные ошибки | 2.0 | intermediate | reconnect, JSON, heartbeat, wss |
| 5 | frames_heartbeat | Фреймы и ping/pong | 1.0 | basic | opcode, MASK, readyState |
| 6 | production_patterns | React, Nginx, масштаб | 1.0 | basic | useRef cleanup, proxy headers, Redis |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| handshake_upgrade | websocket_definition | 0.45 |
| common_mistakes | frames_heartbeat | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 5 – 7 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
