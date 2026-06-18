# Архитектура микрофронтендов

- **topic_code:** `microfrontend_architecture`
- **source:** https://itlead.org/interview-questions/architecture/microfrontend-architecture
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/microfrontend-architecture.bank.json` → `pnpm seed:topic -- microfrontend_architecture`
- **status:** draft

## Вопрос

> Что такое архитектура микрофронтендов и как она работает?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | mf_definition | Понимает микрофронтенды | 1.5 | core_plus | независимые MF, shell, runtime composition |
| 1 | vs_monolith | Отличает от монолита | 1.5 | core_plus | независимый deploy, стеки, изоляция |
| 2 | integration_approaches | Знает подходы интеграции | 1.5 | intermediate | MF, single-spa, iframe, build-time |
| 3 | when_to_use | Когда использовать / не использовать | 1.0 | basic | 3+ команд vs <20 dev, MVP |
| 4 | browser_composition | Как браузер композирует MF | 1.0 | basic | lifecycle mount/unmount, SystemJS |
| 5 | common_mistakes | Типичные ошибки | 1.5 | intermediate | CSS leak, React x5, window, unmount |
| 6 | communication_shared_deps | Коммуникация и shared deps | 1.0 | basic | BroadcastChannel, singleton React |
| 7 | migration_ssr_senior | Миграция и SSR (senior) | 1.0 | basic | feature flag, import maps, ESI/Podium |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| vs_monolith | mf_definition | 0.45 |
| common_mistakes | browser_composition | 0.35 |
| integration_approaches | mf_definition | 0.4 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / invite |
| formal strong | 7 – 9.5 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
