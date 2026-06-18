# Parsing pipeline: bytes → DOM и CSSOM

- **topic_code:** `parsing_pipeline_from_bytes_to_dom_and_cssom`
- **source:** https://itlead.org/interview-questions/general/parsing-pipeline-from-bytes-to-dom-and-cssom
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/parsing-pipeline-from-bytes-to-dom-and-cssom.bank.json` → `pnpm seed:topic -- parsing_pipeline_from_bytes_to_dom_and_cssom`
- **status:** ready

## Вопрос

> Как браузер парсит HTML/CSS: pipeline от bytes до DOM и CSSOM?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | four_stages | Знает четыре стадии pipeline | 1.5 | core_plus | four stages ITLead |
| 1 | dom_vs_cssom | Отличает DOM от CSSOM | 1.5 | core_plus | DOM vs CSSOM |
| 2 | script_loading | Понимает script defer async blocking | 2 | intermediate | script loading examples |
| 3 | preload_scanner | Знает preload scanner | 1.5 | basic | preload scanner |
| 4 | common_mistakes | Знает типичные ошибки parsing | 2 | intermediate | common mistakes |
| 5 | when_to_care | Понимает когда это важно для perf | 1.5 | basic | when to care |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
