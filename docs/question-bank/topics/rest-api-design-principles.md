# Принципы проектирования REST API

- **topic_code:** `rest_api_design_principles`
- **source:** https://itlead.org/interview-questions/architecture/rest-api-design-principles
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/rest-api-design-principles.bank.json` → `pnpm seed:topic -- rest_api_design_principles`
- **status:** draft

## Вопрос

> Какие принципы и лучшие практики при проектировании REST API вы знаете?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | rest_resources_nouns | Ресурсы, существительные и HTTP-методы | 1.5 | core_plus | ядро REST — `/users`, GET/POST/DELETE, stateless |
| 1 | rest_vs_rpc | REST vs RPC-стиль | 1.0 | basic | URL как существительное, метод как глагол; кешируемость CDN |
| 2 | http_methods_status_codes | HTTP-методы и статус-коды CRUD | 2.0 | intermediate | 201+Location, 204 DELETE, 404, 200/304 |
| 3 | put_vs_patch | PUT vs PATCH | 1.5 | intermediate | полная замена vs частичное обновление, JSON Patch |
| 4 | stateless_auth | Stateless и авторизация | 1.0 | basic | JWT Bearer, без серверных сессий |
| 5 | common_mistakes | Типичные ошибки REST | 2.0 | intermediate | verb paths, singular, 200 вместо 201, без pagination |
| 6 | pagination_filtering | Пагинация и фильтрация списков | 1.0 | basic | `?page&limit`, массив `data`, metadata |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| http_methods_status_codes | rest_resources_nouns | 0.45 |
| common_mistakes | http_methods_status_codes | 0.40 |
| put_vs_patch | http_methods_status_codes | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / reject |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
