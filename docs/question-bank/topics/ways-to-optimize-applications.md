# Способы оптимизации приложений

- **topic_code:** `ways_optimize_applications`
- **source:** https://itlead.org/interview-questions/general/ways-to-optimize-applications
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/ways-to-optimize-applications.bank.json` → `pnpm seed:topic -- ways_optimize_applications`
- **status:** draft

## Вопрос

> Какие способы оптимизации веб-приложений вы знаете?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | network_optimization | Знает сетевую оптимизацию | 1.5 | core_plus | Network layer TL;DR |
| 1 | caching_headers | Настраивает HTTP-кеширование | 1 | basic | Caching headers section |
| 2 | code_splitting_lazy | Применяет code splitting и lazy loading | 2 | intermediate | Code splitting — major load time win |
| 3 | images_assets | Оптимизирует изображения и статику | 1 | basic | Image optimization |
| 4 | runtime_optimization | Оптимизирует runtime: debounce, workers, virtualization | 2 | intermediate | Runtime layer techniques |
| 5 | react_memoization | Применяет React memoization обоснованно | 1.5 | intermediate | React memoization — measure first |
| 6 | measure_web_vitals | Измеряет производительность перед оптимизацией | 1 | basic | Measure first + Web Vitals follow-up |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 6 – 8 | invite / maybe |
| formal strong | 8 – 9.5 | strong_invite / invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
