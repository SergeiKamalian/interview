# COPY vs ADD в Dockerfile

- **topic_code:** `dockerfile_copy_vs_add`
- **source:** https://itlead.org/interview-questions/docker/dockerfile-copy-vs-add
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/dockerfile-copy-vs-add.bank.json` → `pnpm seed:topic -- dockerfile_copy_vs_add`
- **status:** draft

## Вопрос

> В чём разница между `COPY` и `ADD` в Dockerfile?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | copy_vs_add_core | Ключевое различие COPY и ADD | 2.0 | core_plus | TL;DR: оба копируют, ADD делает дополнительно tar и URL |
| 1 | copy_default_preferred | COPY — дефолтный выбор | 1.5 | basic | best practices, предсказуемость |
| 2 | add_extra_features | Дополнительные возможности ADD | 2.0 | basic | auto-extract tar, fetch URL |
| 3 | url_run_alternative | Альтернатива ADD URL | 1.5 | basic | RUN curl + checksum + cleanup |
| 4 | legitimate_add_usage | Когда ADD уместен | 1.0 | basic | FROM scratch + rootfs tar |
| 5 | common_mistakes | Типичные ошибки | 2.0 | intermediate | ADD вместо COPY, tar-сюрприз, URL без верификации |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
