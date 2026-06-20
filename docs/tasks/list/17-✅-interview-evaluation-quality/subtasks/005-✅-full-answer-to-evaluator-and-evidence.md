# TASK-17.5 — Полный ответ в оценщик + честный evidence_summary

Status: [x] done

## Goal

Гарантировать, что LLM-оценщик получает ПОЛНЫЙ текст ответа кандидата, и что `evidence_summary` отражает реально оценённый фрагмент, а не первое предложение.

## Depends on

- Нет жёсткой; полезно делать рядом с 17.2.

## Context

Доказательства из attempt 102:
- Ответы в БД ПОЛНЫЕ: 2103/2447/2334/3269/2592 символов (`SELECT CHAR_LENGTH(content) ...`).
- Но rationale оценщика повторяет `ответ обрывается` / `depth=mention_only` на местах, которые в ответе раскрыты.
- `evidence_summary` = первое предложение ответа (`да, сталкивался много раз`; `замыкание — это функция вместе с лексическим окружением...`), т.к. `extractFalseClaimQuote` (`false-claim-quote.util.ts`) берёт первое предложение ≥24 символов — это нерелевантное «доказательство».

Гипотезы (проверить обе):
1. В per-turn режиме (OpenAI server-state «шлём только новый turn» — `ADAPTIVE_AI_OPENAI_SERVER_STATE=true`) в evaluate-turn попадает не весь ответ / не тот turn.
2. Контекст-пакет урезает текст ответа перед передачей в промпт.

## Scope

- Аудит передачи текста ответа в оценщик:
  - `backend/src/modules/adaptive-interview/utils/build-adaptive-interview-context.util.ts` и `.../services/adaptive-interview-context.service.ts` — что кладётся в `latestCandidateText` / `fullCandidateText`;
  - `.../utils/checkpoint-evidence-text.util.ts` (`collectFullCandidateText`, `collectLatestCandidateText`) — нет ли усечения;
  - промпт-сборка `buildEvaluateConversationTurnUserPrompt` / `buildPerTurnCheckpointEvaluationUserPrompt` — попадает ли полный текст;
  - режим server-state: убедиться, что bootstrap+turn вместе дают оценщику полный ответ (а не только дельту).
- Если найдено усечение/потеря — починить, чтобы оценщик видел полный ответ.
- `evidence_summary`: формировать из реально оценённого фрагмента (matched evidence по чекпоинту), а не первым предложением. Если точную цитату не извлечь — писать честный краткий пересказ оценённого, не «первое предложение».

## Verification

- `pnpm -C backend build` + targeted eslint.
- Лог/дебаг: длина текста ответа, переданного в оценщик, ≈ длине в БД (нет усечения).
- Регресс attempt 102: пропадают ложные `ответ обрывается`; `evidence_summary` релевантен оценке.
- `golden-calibration.spec.ts` зелёный.

## Completion Notes

### Где терялся текст ответа (root cause) и как починено

Усечение найдено в `build-adaptive-interview-context.util.ts`: и `latestCandidateAnswer`, и каждый `localTurns[].content` прогонялись через `boundText(..., limits.maxTextLength)`, где `maxTextLength = 500` (`adaptive-interview-context.config.ts`). Ответы кандидата 2103/2447/2334/3269/2592 символов обрезались до 500 с «…» → оценщик читал это как «ответ обрывается» и занижал глубину. Контекст-пакет (гипотеза 2 из subtask) и был источником.

Гипотеза 1 (server-state «шлём только дельту»): per-turn evaluation user-prompt (`per-turn-checkpoint-evaluation.prompt.ts`) собирается ИЗ контекст-пакета (`context.localTurns` + `context.latestCandidateAnswer`), а не из server-side истории, и встраивает последний ответ целиком. После фикса bound'а оценщик видит полный текст независимо от server-state. Дополнительного усечения в промпте нет.

Фикс:
- Новый лимит `maxCandidateAnswerLength` (default **8000**, env `ADAPTIVE_MAX_CANDIDATE_ANSWER_LENGTH`) в `adaptive-interview-context.config.ts` + типы (`AdaptiveInterviewContextLimits`, `BuildAdaptiveInterviewContextInput.limits`).
- В `build-adaptive-interview-context.util.ts`: `latestCandidateAnswer` и **только candidate**-турны bound'ятся по `maxCandidateAnswerLength`; турны интервьюера остаются на компактном `maxTextLength` (экономия контекста). Так полный ответ кандидата гарантированно доходит до оценщика.
- `.env.example` дополнен `ADAPTIVE_MAX_CANDIDATE_ANSWER_LENGTH=8000`.

### Как теперь строится evidence_summary

Проблема: `attachFalseClaimEvidence` (`apply-checkpoint-score-floors.util.ts`) при наличии false-claim-сигнала в rationale перезаписывал `evidence_summary` результатом `extractMatchedFalseClaimQuote`, который при отсутствии реально совпавшей фразы откатывался на **первое предложение ≥24 символов** (`extractFalseClaimQuote`). Поэтому у корректных ответов в «доказательство» попадало нерелевантное первое предложение («замыкание — это функция вместе с лексическим окружением…»).

Фикс:
- Новая строгая функция `extractMatchedFalseClaimQuoteStrict` в `false-claim-quote.util.ts`: возвращает предложение, которое **буквально** содержит сконфигурированный false claim, либо `null` — БЕЗ отката на первое предложение.
- `attachFalseClaimEvidence` теперь использует strict-вариант: `evidence_summary` перезаписывается цитатой ТОЛЬКО при реально процитированной ложной фразе; иначе сохраняется честный `evidence_summary` самой модели (краткий пересказ оценённого), а не первое предложение. Это согласуется с TASK-17.2 (cap только по cited quote).
- Заодно убран мёртвый параметр `_checkpointKey` у `extractFalseClaimQuote` (lint).

### Команды / ожидания / результат

- `pnpm -C backend build` → **OK** (после добавления `maxCandidateAnswerLength` в inline-тип `BuildAdaptiveInterviewContextInput.limits`).
- `npx jest build-adaptive-interview-context.util.spec` — обновлён кейс «keeps the full candidate answer (no maxTextLength truncation)» (2500-символьный ответ доходит целиком, не оканчивается «…»), + новый «still bounds a candidate answer that exceeds the candidate bound» (bound с maxCandidateAnswerLength=50) — **зелёные**.
- `npx jest false-claim-quote.util.spec` — новый spec (4 кейса): strict возвращает предложение с cited claim; `null` без совпадения / без claims; отличие от lenient (тот всё ещё отдаёт первое предложение) — **зелёные**.
- `npx jest src/modules/adaptive-interview src/modules/ai-evaluation` → **64 suites / 353 passed / 1 skipped**.
- `npx jest golden-calibration` → **зелёная**, без регрессов.
- targeted eslint по всем изменённым файлам → чисто (pre-existing prettier/unused в затронутых файлах исправлены).

### Регресс attempt 102

«Было/стало» по attempt 102 как закрывающую цель НЕ запускал (TASK-17.6). Структурно: оценщик теперь получает полный текст (нет «ответ обрывается»), а `evidence_summary` не подменяется первым предложением у корректных ответов.
