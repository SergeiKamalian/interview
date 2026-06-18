# Как работает HTTP и из чего состоит запрос

- **topic_code:** `how_http_works_what_an_http_request_consists_of`
- **source:** https://itlead.org/interview-questions/general/how-http-works-and-what-an-http-request-consists-of
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/how-http-works-and-what-an-http-request-consists-of.bank.json` → `pnpm seed:topic -- how_http_works_what_an_http_request_consists_of`
- **status:** draft

## Вопрос

> Как работает HTTP и из чего состоит HTTP-запрос?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | http_definition | Определяет HTTP | 1.5 | core_plus | definition |
| 1 | request_structure | Знает структуру запроса | 2 | core_plus | 5 parts |
| 2 | http_methods | Знает HTTP-методы | 1.5 | intermediate | methods |
| 3 | stateless_sessions | Понимает stateless и сессии | 1.5 | intermediate | stateless |
| 4 | http2_http3 | Знает HTTP/2 и HTTP/3 | 1.5 | intermediate | versions |
| 5 | common_mistakes | Знает типичные ошибки | 1.5 | intermediate | mistakes |
| 6 | response_basics | Знает структуру ответа | 0.5 | mention | response |

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
