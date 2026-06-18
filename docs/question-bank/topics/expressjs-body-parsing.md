# Парсинг тела запроса в Express.js

- **topic_code:** `expressjs_body_parsing`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-body-parsing
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-body-parsing.bank.json` → `pnpm seed:topic -- expressjs_body_parsing`
- **status:** draft

## Вопрос

> Как работает парсинг тела запроса (body parsing) в Express.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | body_stream_basics | Понимает stream и req.body | 2 | intermediate | ядро — stream → req.body |
| 1 | json_and_urlencoded | Знает express.json и urlencoded | 2 | intermediate | два основных built-in parser |
| 2 | parser_order | Порядок регистрации parsers | 1.5 | core_plus | самый частый junior баг |
| 3 | limits_and_content_type | Лимиты и Content-Type | 1.5 | core_plus | limit и header match |
| 4 | multipart_and_raw | Multipart и raw body | 1.5 | core_plus | когда built-in не подходит |
| 5 | common_mistakes | Типичные ошибки парсинга | 1.5 | intermediate | mistakes block из ITLead |

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
