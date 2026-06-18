# Типы фронтенд-тестирования

- **topic_code:** `types_frontend_testing`
- **source:** https://itlead.org/interview-questions/general/types-of-frontend-testing
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/types-of-frontend-testing.bank.json` → `pnpm seed:topic -- types_frontend_testing`
- **status:** draft

## Вопрос

> Какие типы фронтенд-тестирования вы знаете и когда какой применять?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | testing_pyramid_ratio | Понимает testing pyramid и соотношение 70/20/10 | 1.5 | core_plus | ядро TL;DR pyramid 70/20/10 |
| 1 | unit_integration_e2e_diff | Различает unit, integration и E2E | 2 | intermediate | Key difference table |
| 2 | when_use_test_type | Выбирает тип теста по задаче | 1.5 | basic | When to use |
| 3 | testing_tools_stack | Знает инструменты и runtime | 1 | basic | Tools and how tests run internally |
| 4 | snapshot_visual_testing | Понимает snapshot и visual regression | 1 | basic | Snapshot and visual types |
| 5 | testing_common_mistakes | Знает типичные ошибки тестирования | 2 | intermediate | Common mistakes |
| 6 | msw_vs_jest_mock | Выбирает MSW vs jest.mock | 1 | intermediate | Follow-up MSW vs jest.mock |

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
