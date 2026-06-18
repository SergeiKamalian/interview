# Body в GET-запросе

- **topic_code:** `chy_mozhna_vidpravlyaty_body_v_get_zapyti`
- **source:** https://itlead.org/interview-questions/general/chy-mozhna-vidpravlyaty-body-v-get-zapyti
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/chy-mozhna-vidpravlyaty-body-v-get-zapyti.bank.json` → `pnpm seed:topic -- chy_mozhna_vidpravlyaty_body_v_get_zapyti`
- **status:** draft

## Вопрос

> Можно ли отправлять body в GET-запросе?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | rfc_semantics | Знает семантику RFC 7231 | 1.5 | core_plus | RFC |
| 1 | server_behavior | Понимает поведение серверов | 2 | core_plus | server handling |
| 2 | caching_cdn | Понимает проблемы кеширования | 1.5 | intermediate | CDN cache |
| 3 | decision_rules | Применяет правила | 1.5 | intermediate | decision |
| 4 | client_limits | Знает ограничения клиентов | 1.5 | intermediate | client limits |
| 5 | exceptions | Знает исключения | 1 | basic | exceptions |
| 6 | common_mistakes | Знает типичные ошибки | 1 | basic | mistakes |

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
