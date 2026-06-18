# WebSocket интеграция с Express.js

- **topic_code:** `expressjs_websocket_integration`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-websocket-integration
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-websocket-integration.bank.json` → `pnpm seed:topic -- expressjs_websocket_integration`
- **status:** draft

## Вопрос

> Как интегрировать WebSocket с Express.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | ws_vs_http | Отличает WebSocket от HTTP | 1.5 | core_plus | TL;DR ws vs http |
| 1 | http_create_server | Знает http.createServer(app) | 2 | core_plus | core setup |
| 2 | socketio_vs_ws | Сравнивает Socket.IO и ws | 1.5 | intermediate | socketio vs ws |
| 3 | emit_patterns | Понимает emit targets и rooms | 1.5 | intermediate | emit patterns |
| 4 | scaling_redis | Знает масштабирование WebSocket | 1.5 | intermediate | scaling |
| 5 | when_to_use | Понимает когда нужен WebSocket | 1.5 | intermediate | when to use |
| 6 | common_mistakes | Знает типичные ошибки | 0.5 | mention | mistakes |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / reject |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
