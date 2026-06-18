# Логирование Morgan и Winston в Express.js

- **topic_code:** `expressjs_logging_morgan_winston`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-logging-morgan-winston
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-logging-morgan-winston.bank.json` → `pnpm seed:topic -- expressjs_logging_morgan_winston`
- **status:** draft

## Вопрос

> Как реализовать логирование в Express.js (Morgan, Winston)?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | morgan_vs_winston | Morgan vs Winston | 2 | intermediate | key distinction |
| 1 | morgan_setup | Настройка Morgan | 1.5 | core_plus | HTTP logging |
| 2 | winston_setup | Настройка Winston | 1.5 | core_plus | app logging |
| 3 | sensitive_data | Sensitive data в логах | 2 | intermediate | security critical |
| 4 | request_id | Request ID correlation | 1.5 | core_plus | distributed tracing lite |
| 5 | production_setup | Production logging | 1.5 | core_plus | prod patterns |

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
