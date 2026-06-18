# HTTP-коды статусов

- **topic_code:** `http_status_codes`
- **source:** https://itlead.org/interview-questions/general/http-status-codes
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/http-status-codes.bank.json` → `pnpm seed:topic -- http_status_codes`
- **status:** ready

## Вопрос

> Что такое HTTP-коды статусов и как их правильно использовать?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | status_code_definition | Понимает назначение status codes | 1.5 | core_plus | ядро TL;DR |
| 1 | five_categories | Знает пять категорий кодов | 2 | intermediate | five categories из ITLead |
| 2 | when_to_use_codes | Выбирает правильный код для сценария | 1.5 | core_plus | when to use table |
| 3 | client_vs_server_errors | Отличает 4xx от 5xx | 1.5 | basic | decision rule 4xx vs 5xx |
| 4 | common_mistakes | Знает типичные ошибки со status codes | 2 | intermediate | Common mistakes ITLead |
| 5 | fetch_handling | Правильно обрабатывает коды в fetch | 1.5 | basic | fetch example ITLead |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
