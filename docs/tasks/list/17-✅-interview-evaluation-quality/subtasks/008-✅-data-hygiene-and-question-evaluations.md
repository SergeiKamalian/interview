# TASK-17.8 — Data hygiene + ревизия question_evaluations

Status: [x] done

## Goal

Подчистить мелкие, но заметные дефекты данных/отчётности, всплывшие при анализе attempt 102.

## Depends on

- Нет.

## Context

Находки из attempt 102 / interview 31:
- Опечатки/несогласованность интервью: `job_role` рендерится «Фроненд» (нужно «Фронтенд»), welcome-сообщение тоже «Фроненд»; `title` = «Тестинг». Это data-entry, не баг кода — но бьёт по восприятию (кандидат видит «Фроненд»).
- Таблица `question_evaluations` ПУСТАЯ для попытки: скоринг живёт только в `interview_checkpoint_states`. Нужно решить осознанно: либо заполнять `question_evaluations`, либо убрать её из ожиданий/документации, чтобы не путать.

## Scope

- Проверить, есть ли в UI валидация/нормализация `title`/`job_role` при создании интервью; при необходимости — лёгкая нормализация/подсказка (без переписывания визарда). Конкретно интервью 31 можно поправить данными (это тестовая запись).
- Ревизия `question_evaluations`:
  - найти, кто и когда должен её писать (есть ли мёртвый путь записи);
  - решение: дозаполнять из `question-summary`/checkpoint-агрегации ИЛИ задокументировать как deprecated и убрать из ожиданий (обновить `docs/database/schemas/` при необходимости).
- Не раздувать scope: только гигиена и ясность, без новой бизнес-логики.

## Verification

- `pnpm -C backend build` (если есть код-правки) + targeted eslint.
- Если правится UI — страница создания работает, новое интервью не сохраняет «Фроненд»-подобные опечатки без ведома пользователя.
- По `question_evaluations`: явное решение зафиксировано (заполняется ИЛИ задокументирована как deprecated); БД/доки согласованы.

## Completion Notes

### Data hygiene — interview 31

Состояние в БД: `title='Тестинг'`, `job_role='Фроненд'`, `welcome_message_template=NULL`.

- **Источник «Фроненд» в welcome:** шаблон NULL → используется `DEFAULT_WELCOME_MESSAGE_TEMPLATE` с подстановкой `{{jobRole}}` (`interview-welcome.util.ts`). То есть «Фроненд» в welcome — это НЕ отдельная опечатка, а рендер `job_role`. Фикс `job_role` чинит оба места.
- **Фикс данных (тестовая запись):** `UPDATE interviews SET job_role='Фронтенд' WHERE id=31 AND job_role='Фроненд';` → подтверждено `job_role='Фронтенд'`.
- **`title='Тестинг'` оставлен как есть:** это валидное слово (транслитерация «Testing») у тестовой записи, не орфографическая ошибка. Не раздуваю scope.

### UI/backend нормализация title/job_role

- Проверка: `CreateInterviewInput` валидирует `@IsString @IsNotEmpty @MaxLength(255)`, но НЕ тримит. Глобальный `ValidationPipe` имеет `transform: true` (`main.ts`), `@Transform` из class-transformer поддерживается (используется в других DTO).
- Добавлена лёгкая нормализация: `@Transform(({value}) => typeof value === 'string' ? value.trim() : value)` на `title` и `jobRole` — срезает случайные пробелы по краям (которые иначе попадают в welcome verbatim). Визард не переписывался.
- **Честное ограничение:** орфографические опечатки вида «Фроненд»→«Фронтенд» автоматической валидацией/нормализацией НЕ ловятся (это не whitespace и не enum). Спелл-чек — вне scope. Зафиксировано в коде комментарием.

### Ревизия question_evaluations — РЕШЕНИЕ

**Премиса subtask'а («таблица ПУСТАЯ для попытки») оказалась неверной.** Факт по БД: для attempt 102 есть **2 строки** (по одной на main-answer Q55/Q56). `question_evaluations` — НЕ мёртвый путь и НЕ deprecated.

Карта записи/чтения:
- **Пишут** (на завершённой попытке, `AiEvaluationService.evaluateInterviewAttempt`):
  - adaptive flow → `AdaptiveEvidenceEvaluationService.syncQuestionEvaluationsFromEvidence` синхронизирует из `interview_question_summaries`: `score`/`max_score`/`short_summary` зеркалят evidence-агрегат (`buildQuestionSummaryFromCheckpointStates`);
  - legacy flow → прямой `upsertByInterviewMessage`.
- **Читают:** `FinalEvaluationService` (`findByAttemptId`) для финальной оценки + GraphQL-резолверы (`questionEvaluations` по interview/attempt) + `checkpoint-results.service`.

**Почему строки только у attempt 102:** строки появляются лишь для **завершённых и оценённых** попыток; 96/98/100/101 имеют только `interview_checkpoint_states` (финальная оценка не запускалась). Это ожидаемо, не баг.

**Решение: оставляем как ACTIVE-канонический per-question store, дозаполнять отдельной логикой НЕ нужно.** Поскольку `short_summary` копируется из `interview_question_summaries.summary`, исправления покрытия из TASK-17.3/17.4 автоматически попадают в `question_evaluations` новых попыток. Старая строка attempt 102 («0/7 covered, 4.76/10») — исторический артефакт до фиксов блока 17; не бэкфилю (тестовая запись, и она же служит «before»-доказательством). Документация синхронизирована: `docs/database/schemas/ai-evaluation.md` (раздел `question_evaluations` дополнен статусом ACTIVE + источниками записи/чтения).

### Verify (команды / ожидал / получил)

- DB: `SELECT job_role FROM interviews WHERE id=31` → ожидал «Фронтенд» → получил «Фронтенд».
- DB: `SELECT COUNT(*) FROM question_evaluations WHERE interview_attempt_id=102` → 2 (не пусто).
- `npx eslint src/modules/interview-core/dto/create-interview.input.ts` → чисто (после типизации `value: unknown`).
- `npm run build` (nest build) → OK.
- `npx jest src/modules/interview-core` → 1 passed.

### Изменённые файлы

- БД: `interviews.job_role` для id=31 (data-only, тестовая запись).
- `backend/src/modules/interview-core/dto/create-interview.input.ts` (trim-нормализация title/jobRole).
- `docs/database/schemas/ai-evaluation.md` (статус и источники `question_evaluations`).
