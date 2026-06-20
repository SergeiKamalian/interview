# TASK-16.7 — Backend: проброс config в adaptive context packet

Status: [x] done

## Goal

Доставить interview-level настройки (tone/depth/strictness) в adaptive engine на рантайме.

## Depends on

- TASK-16.6.

## Context

- Сейчас в движок попадает только snapshot вопросов/checkpoints; interview-level поля НЕ доходят.
- Точка сборки контекста: `AdaptiveInterviewContextService.buildContextPacket()`; тип — `AdaptiveInterviewContextPacket` (`backend/src/modules/adaptive-interview/`).

## Scope

- Расширить `AdaptiveInterviewContextPacket` полями `aiTone`, `probingDepth`, `scoringStrictness` (+ при необходимости `timeLimitMinutes`).
- В `buildContextPacket()` подгрузить строку `interviews` для attempt и заполнить эти поля.
- НЕ менять поведение пока — только проброс (используют 16.8–16.10). Дефолты, если поля пустые.

## Verification

- `pnpm -C backend build` + targeted eslint.
- Unit/log smoke: packet содержит новые поля со значениями из interview; при дефолтном интервью — дефолты.

## Completion Notes

**Сделано:**
- `types/adaptive-interview-context.types.ts`: `AdaptiveInterviewContextPacket` и `BuildAdaptiveInterviewContextInput` расширены полями `aiTone` / `probingDepth` / `scoringStrictness` / `timeLimitMinutes` (типы из `interview-core/types/interview-config.enum.ts`).
- `utils/build-adaptive-interview-context.util.ts`: новые поля прокидываются из input в packet (чистый passthrough).
- `interview-core.repository.ts`: новый метод `findById(interviewId)` — загрузка interview row без companyId (для движка; читает в т.ч. config-колонки из migration 020).
- `services/adaptive-interview-context.service.ts`: в `buildContextPacket()` строка interviews подгружается через `findById(interviewQuestion.interviewId)` (добавлено в существующий `Promise.all`) и поля заполняются из неё; дефолты `DEFAULT_AI_TONE`/`DEFAULT_PROBING_DEPTH`/`DEFAULT_SCORING_STRICTNESS` и `timeLimitMinutes=null`, если interview не найден.
- Поведение НЕ меняется — только проброс (применят 16.8–16.10). Инвариант банка соблюдён: структура вопросов/checkpoints/max_score не затронуты.
- Spec `adaptive-interview-context.service.spec.ts`: мок репозитория дополнен `findById`; добавлены ассерты passthrough (strict/deep/lenient/30) и отдельный тест на дефолты при отсутствии interview row.

**Верификация:**
- `pnpm -C backend run build` → OK (дважды: после правок и после prettier --fix).
- Targeted eslint на 5 изменённых файлов → clean (prettier-замечания, в т.ч. pre-existing в затронутых файлах, исправлены `--fix`).
- Unit smoke: `npx jest adaptive-interview-context.service build-adaptive-interview-context.util` → 2 suites / 6 tests passed.
  - Тест 1: packet содержит `aiTone='strict'`, `probingDepth='deep'`, `scoringStrictness='lenient'`, `timeLimitMinutes=30` из interview row. Ожидал passthrough — получено.
  - Тест 2: при `findById → null` packet получает дефолты `neutral`/`balanced`/`balanced`, `timeLimitMinutes=null`. Ожидал дефолты — получено.
- Регресс: `npx jest src/modules/adaptive-interview src/modules/interview-core` → 52 suites / 304 passed, 1 skipped (ERROR в логе — ожидаемый negative-path тест валидатора). Ничего не сломано.
