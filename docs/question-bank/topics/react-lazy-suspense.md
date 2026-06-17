# React.lazy и Suspense

- **topic_code:** `react_lazy_suspense`
- **source:** https://itlead.org/interview-questions/react/reactlazy-and-suspense-lazy-components-in-react
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/react-lazy-suspense.seed.sql`
- **status:** seeded · qa-done (calibration gap)

## Вопрос

> Как работают React.lazy и Suspense для ленивой загрузки компонентов?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | lazy_api | Понимает React.lazy | 1.0 | basic | dynamic import + suspend — ядро темы |
| 1 | suspense_fallback | Suspense и fallback | 1.0 | basic | без Suspense lazy не работает в UI |
| 2 | code_splitting | Code splitting | 1.0 | basic | bundler + chunk, не ручной split |
| 3 | default_export | Default export | 1.0 | basic | частая ошибка middle |
| 4 | module_level_lazy | Lazy на уровне модуля | 2.0 | intermediate | pitfall: lazy внутри render |
| 5 | error_boundary | ErrorBoundary | 2.0 | intermediate | production: network fail chunk |
| 6 | when_to_use | Когда применять | 2.0 | intermediate | route/modal vs первый экран |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual strong | 6 – 8 | invite / maybe |
| formal strong | 8 – 9.5 | invite / strong_invite |

### Browser QA timing

Не ждать сразу 30–40 с. **Поллинг короткими шагами:**

1. После клика / отправки ответа → `sleep 10s` → `browser_snapshot`
2. Если UI ещё не готов (кнопка disabled, «Инициализируем…», нет textarea) → ещё `sleep 10s` → snapshot
3. Повторять до готовности, обычно хватает 10–20 с, редко 30 с

То же после `Начать интервью` и после `Отправить ответ`.

## QA log

| date | interview | public token | bad | casual | formal | notes |
|------|-----------|--------------|-----|--------|--------|-------|
| 2026-06-16 | #7 | ce3d8864-… | 0.6/10 | 5.4/10 | 7.5/10 | weights были равные 1.43 — до рубрики |
| 2026-06-17 | #9 | 11d7a1ab-… | **0/10** (att.68) | **4.3/10** (att.69) | **4.3/10** (att.70) | weighted topic model; **калибровка**: formal ≠ casual по тексту, но checkpoint states идентичны (все `partial`, 0 `covered`) → нужен tuning evaluator / hints |
