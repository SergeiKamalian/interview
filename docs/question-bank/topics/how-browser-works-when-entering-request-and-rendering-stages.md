# Как работает браузер: запрос и рендеринг

- **topic_code:** `how_browser_works_when_entering_request_rendering_stages`
- **source:** https://itlead.org/interview-questions/general/how-browser-works-when-entering-request-and-rendering-stages
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/how-browser-works-when-entering-request-and-rendering-stages.bank.json` → `pnpm seed:topic -- how_browser_works_when_entering_request_rendering_stages`
- **status:** draft

## Вопрос

> Как браузер обрабатывает ввод URL и этапы рендеринга страницы?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | network_phase | Описывает сетевую фазу | 2 | core_plus | network |
| 1 | rendering_pipeline | Описывает rendering pipeline | 2 | core_plus | render pipeline |
| 2 | js_blocking | Понимает блокировку JS | 1.5 | intermediate | JS blocking |
| 3 | performance_tips | Знает perf оптимизации | 1.5 | intermediate | perf |
| 4 | dns_details | Понимает DNS resolution | 1 | basic | DNS |
| 5 | http2_multiplex | Знает HTTP/2 на connection | 1.5 | intermediate | HTTP/2 |
| 6 | common_mistakes | Знает типичные ошибки | 0.5 | mention | mistakes |

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
