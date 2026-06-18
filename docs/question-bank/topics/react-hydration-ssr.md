# React Hydration & SSR

- **topic_code:** `react_hydration_ssr`
- **source:** https://itlead.org/interview-questions/react/react-hydration-and-ssr
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/react-hydration-ssr.bank.json` → `pnpm seed:topic -- react_hydration_ssr`
- **status:** seeded

## Вопрос

> Как работают server-side rendering (SSR) и hydration в React?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | hydration_definition | Что такое hydration | 1.5 | core_plus | ядро темы — attach handlers без rebuild DOM |
| 1 | ssr_vs_csr | SSR vs CSR | 1.5 | core_plus | trade-off: FCP/SEO vs server CPU |
| 2 | render_hydrate_flow | renderToString + hydrateRoot | 1.0 | basic | механизм из статьи ITLead |
| 3 | hydration_mismatch | Mismatch и fallback | 2.0 | intermediate | Date/window/random — частая ошибка |
| 4 | common_mistakes | Типичные ошибки | 2.0 | intermediate | browser API в render, fetch на клиенте |
| 5 | when_to_use | Когда SSR / CSR / hybrid | 1.0 | basic | public vs internal, islands |
| 6 | react18_streaming | React 18 streaming / selective | 1.0 | basic | Suspense boundaries, приоритет клика |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| ssr_vs_csr | hydration_definition | 0.45 |
| hydration_mismatch | common_mistakes | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
