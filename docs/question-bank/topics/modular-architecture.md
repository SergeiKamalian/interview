# Модульная архитектура

- **topic_code:** `modular_architecture`
- **source:** https://itlead.org/interview-questions/architecture/modular-architecture
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/modular-architecture.bank.json` → `pnpm seed:topic -- modular_architecture`
- **status:** draft

## Вопрос

> Что такое модульная архитектура и как правильно организовать границы между модулями в приложении?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | modular_definition | Понимает суть модульной архитектуры | 1.5 | core_plus | чёрные ящики, public API, index.js — ядро TL;DR |
| 1 | hard_boundaries_vs_folders | Отличает модули от папок | 1.5 | core_plus | тест: ломается ли внешний код при рефакторинге internals |
| 2 | public_api_pattern | Знает паттерн public API | 1.0 | basic | index.js + internal/, только экспортированное видно снаружи |
| 3 | boundary_mistakes | Знает типичные нарушения границ | 2.0 | intermediate | internal imports, shortcuts, over-export, shared config |
| 4 | circular_dependencies_dag | Понимает циклы и DAG | 2.0 | intermediate | circular imports, extract third module, Madge/Dpdm в CI |
| 5 | when_to_use | Понимает когда применять | 1.0 | basic | несколько команд, независимые фичи, >10k строк |
| 6 | modular_vs_microservices | Отличает от микросервисов | 1.0 | basic | один процесс/кодовая база vs сеть и деплой |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / invite |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
