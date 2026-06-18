# Безопасность Express.js и rate limiting

- **topic_code:** `expressjs_security_rate_limiting`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-security-rate-limiting
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-security-rate-limiting.bank.json` → `pnpm seed:topic -- expressjs_security_rate_limiting`
- **status:** draft

## Вопрос

> Как защитить Express.js приложение? (безопасность и rate limiting)

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | helmet_headers | helmet() | 1.5 | core_plus | HTTP security headers |
| 1 | rate_limiting | Rate limiting | 2.0 | intermediate | brute-force protection |
| 2 | input_sanitization | Sanitization и limits | 1.5 | intermediate | NoSQL injection, body limit |
| 3 | cors_https_secrets | CORS, HTTPS, secrets | 2.0 | intermediate | env vars |
| 4 | password_hashing | Хеширование паролей | 1.5 | basic | bcrypt |
| 5 | security_middleware_order | Порядок stack | 1.0 | basic | до routes |
| 6 | security_checklist | Security checklist | 0.5 | mention | defense in depth |

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
