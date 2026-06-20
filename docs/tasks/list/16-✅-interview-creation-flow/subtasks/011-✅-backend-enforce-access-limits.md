# TASK-16.11 — Backend: enforcement лимитов на входе кандидата

Status: [x] done

## Goal

Применять дедлайн, кап прохождений и правило попыток при входе кандидата.

## Depends on

- TASK-16.5, TASK-16.6.

## Context

- Публичный вход кандидата: `interview-public.service` + `findByPublicToken` (`interview-core`).
- Кандидаты/attempts: `candidates`, `interview_attempts` (миграция 006).

## Scope

- При старте публичного интервью проверять:
  - **expired** — `now > expires_at` → отказ с понятной причиной;
  - **full** — completed attempts `>= max_completions` → отказ;
  - **allow_retake = 0** — повторный email уже завершал → отказ/блок повторной попытки.
- Вернуть структурированные коды ошибок (по аналогии с существующими, напр. как `QUESTION_SCOPE_VIOLATION`).
- Не ломать существующий happy-path (active + в пределах лимитов).

## Verification

- `pnpm -C backend build` + targeted eslint.
- Smoke: интервью с прошедшим `expires_at` → отказ; `max_completions=1` после одного completed → отказ; повторный email при `allow_retake=0` → отказ; валидный случай → старт ок.

## Completion Notes

Реализовано в `interview-public.service.ts` (`startPublicInterview`) — проверки только при создании НОВОЙ попытки, resume активной (pending/in_progress) попытки не ломается:

- `assertInterviewNotExpired(expiresAt)` — до транзакции; `now > expires_at` → `ForbiddenException` code `INTERVIEW_EXPIRED`.
- `assertCanStartNewAttempt(interview, email, query)` — внутри транзакции в ветке `if (!attempt)`:
  - `max_completions != null` и `countCompletedAttempts(interviewId) >= max_completions` → code `INTERVIEW_FULL`;
  - `allow_retake = 0` и `hasCompletedAttemptForEmail(interviewId, email)` → code `INTERVIEW_RETAKE_NOT_ALLOWED`.
- Новые repo-методы `countCompletedAttempts` / `hasCompletedAttemptForEmail` (`interview-core.repository.ts`), принимают `QueryFn` (работают в транзакции).

Структурированные коды ошибок по аналогии с `QUESTION_SCOPE_VIOLATION` (через `ForbiddenException({ message, code })`).

### Команды / проверки

- `pnpm -C backend build` → exit 0.
- `eslint` по `interview-public.service.ts` + `interview-core.repository.ts` → чисто (поправлен 1 pre-existing prettier-перенос строки, сдвинутый правками).
- GraphQL smoke (изолированный backend `PORT=4131`, общий dev MySQL, интервью id=21 временно `active`, потом возвращён в `draft`; тестовые candidates/attempts удалены):
  - expired (`expires_at` в прошлом) → `INTERVIEW_EXPIRED`;
  - `max_completions=0` → `INTERVIEW_FULL`;
  - `allow_retake=0` + email с completed attempt → `INTERVIEW_RETAKE_NOT_ALLOWED`;
  - валидный кейс → `startPublicInterview` вернул `attemptId` (happy-path не сломан).
- После смоука: интервью 21 восстановлено (`draft`, `expires_at=2026-12-31 23:59`, `max_completions=50`, `allow_retake=1`), тестовые строки удалены (leftover=0).
