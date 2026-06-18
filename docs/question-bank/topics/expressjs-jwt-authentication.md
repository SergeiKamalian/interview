# JWT-аутентификация в Express.js

- **topic_code:** `expressjs_jwt_authentication`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-jwt-authentication
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-jwt-authentication.bank.json` → `pnpm seed:topic -- expressjs_jwt_authentication`
- **status:** draft

## Вопрос

> Как реализовать JWT-аутентификацию в Express.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | jwt_flow | Flow login и middleware | 2 | intermediate | core JWT flow |
| 1 | jwt_structure | Структура JWT | 1 | basic | how token works |
| 2 | security_mistakes | Безопасность verify | 2 | intermediate | critical security |
| 3 | storage_xss | Хранение token XSS | 1.5 | core_plus | XSS resistance |
| 4 | jwt_vs_sessions | JWT vs sessions | 1.5 | core_plus | architecture choice |
| 5 | refresh_tokens | Refresh token pattern | 2 | intermediate | production auth |

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
