# Управление сессиями в Express.js

- **topic_code:** `expressjs_session_management`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-session-management
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-session-management.bank.json` → `pnpm seed:topic -- expressjs_session_management`
- **status:** draft

## Вопрос

> Как работает управление сессиями (session management) в Express.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | session_concept | Модель сессий | 1.5 | core_plus | server store + cookie ID |
| 1 | express_session_config | express-session config | 1.5 | intermediate | secret, resave, cookie |
| 2 | session_stores | Session stores | 2.0 | intermediate | Redis vs MemoryStore |
| 3 | login_logout_flow | Login/logout | 1.5 | intermediate | destroy, regenerate |
| 4 | sessions_vs_jwt | Sessions vs JWT | 2.0 | basic | trade-offs |
| 5 | production_session_setup | Production setup | 1.0 | basic | Redis + auth middleware |
| 6 | session_mistakes | Типичные ошибки | 0.5 | mention | hardcoded secret |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe |
| formal strong | 7 – 9 | invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
