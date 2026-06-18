# OWASP: уязвимости браузера

- **topic_code:** `owasp_browser_vulnerabilities`
- **source:** https://itlead.org/interview-questions/general/owasp-browser-vulnerabilities
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/owasp-browser-vulnerabilities.bank.json` → `pnpm seed:topic -- owasp_browser_vulnerabilities`
- **status:** ready

## Вопрос

> Какие основные браузерные уязвимости OWASP (XSS, CSRF, clickjacking) и как от них защищаться?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | xss_types | Понимает XSS и варианты | 2 | intermediate | XSS variants core |
| 1 | csrf_protection | Знает CSRF и защиту | 1.5 | core_plus | CSRF section |
| 2 | clickjacking_fix | Знает clickjacking и frame-ancestors | 1.5 | basic | clickjacking |
| 3 | csp_and_sanitize | Понимает CSP и санитизацию | 2 | intermediate | CSP common mistakes |
| 4 | cookie_security | Знает безопасные cookie flags | 1.5 | basic | HttpOnly Secure |
| 5 | common_mistakes | Знает типичные ошибки защиты | 1.5 | basic | common mistakes senior |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
