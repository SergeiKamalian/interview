# Шаблонизаторы в Express.js

- **topic_code:** `expressjs_template_engines`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-template-engines
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-template-engines.bank.json` → `pnpm seed:topic -- expressjs_template_engines`
- **status:** draft

## Вопрос

> Как использовать шаблонизаторы (template engines) в Express.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | template_engine_setup | Настройка view engine | 2.0 | basic | quick setup |
| 1 | ejs_syntax | Синтаксис EJS | 2.0 | basic | tag reference |
| 2 | partials_locals | Partials и locals | 1.5 | basic | include, app.locals |
| 3 | render_vs_json | render vs JSON API | 1.5 | basic | when to use |
| 4 | xss_safety | XSS в templates | 2.0 | intermediate | safe vs unsafe |
| 5 | template_mistakes | Типичные ошибки | 1.0 | mention | npm install engine |

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
