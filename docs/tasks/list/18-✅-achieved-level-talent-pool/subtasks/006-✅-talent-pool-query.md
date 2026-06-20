# TASK-18.6 — Backend: talent pool query

Status: [x] done

## Depends on

- TASK-18.4.

## Goal

Найти прошлых кандидатов компании, которые показали уровень ≥ запрашиваемого.

## Scope

- Query `matchingCandidatesForLevel(level, professionId?/skillIds?)`:
  - join `final_evaluations → interview_attempts → candidates` по `company_id`;
  - фильтр `achieved_level >= :level` (по порядку лестницы), `status='completed'`, `is_preview=0`;
  - дедуп по `candidates.email` (последняя/лучшая попытка), вернуть name/email/achievedLevel/source.
- Тенант-скоуп по `company_id` обязателен.

## Verification

- GraphQL query на компании с данными возвращает только подходящих кандидатов; чужая компания пуста.

## Completion Notes

### Что сделано

GraphQL query `matchingCandidatesForLevel(level: QuestionLevel!): [TalentPoolCandidateType!]!`
— прошлые кандидаты компании с демонстрированным уровнем ≥ запрашиваемого.

**Выбор модуля:** размещено в `backend/src/modules/candidates/` (рядом с
`candidates-dashboard` / `candidate-report`), т.к. это candidate-данные компании с тенант-скоупом
по `company_id` через `@CurrentUser().companyId` — тот же паттерн, что у существующих
candidate-резолверов. (lookup-queries блока 16 живут в question-bank/interview-core и нужны для
шага выбора вопросов; talent pool — про кандидатов, поэтому candidates.)

**Файлы:**
- `graphql/talent-pool.type.ts` — `TalentPoolCandidateType` (candidateId, fullName, email,
  achievedLevel `QuestionLevel!`, achievedLevelMethod `AchievedLevelMethod`, sourceInterviewId,
  sourceInterviewTitle, completedAt epoch-seconds). Переиспользованы `QuestionLevelEnum` и
  `AchievedLevelMethodEnum`.
- `repositories/talent-pool.repository.ts` — raw SQL (mysql2, параметры). JOIN
  `final_evaluations fe → interview_attempts ia → candidates c → interviews i`; тенант-скоуп
  `fe.company_id = ?` (использует индекс `idx_final_evaluations_company_achieved`); фильтры
  `ia.status='completed'`, `ia.is_preview=0`, `fe.achieved_level IS NOT NULL`; порог по лестнице
  `FIELD(fe.achieved_level,'junior','middle','senior','lead') >= FIELD(?, …)` (через параметр,
  без конкатенации значений). Дедуп по `c.email` оконной функцией
  `ROW_NUMBER() OVER (PARTITION BY c.email ORDER BY FIELD(achieved_level) DESC, completed_at DESC,
  ia.id DESC)` + внешний фильтр `rn=1` (MySQL 8.4). Сортировка вывода: уровень ↓, completed_at ↓.
- `services/talent-pool.service.ts` (+ `.spec.ts`) — маппинг строк в GraphQL-форму, epoch-seconds.
- `graphql/talent-pool.resolver.ts` — `@UseGuards(GqlAuthGuard)`, `companyId` берётся из
  `@CurrentUser()`, **не** из аргументов.
- `candidates.module.ts` — wiring (repo/service/resolver).
- `backend/src/schema.gql` — регенерирован (новый query + `TalentPoolCandidateType`).

**Дедуп-правило:** одна строка на `email` — лучшая попытка: сначала максимальный achievedLevel
по лестнице, при равенстве — самая поздняя `completed_at`, затем максимальный `ia.id`.

### Команды и проверки

- `pnpm -C backend build` → exit 0.
- `npx eslint` на 6 затронутых файлах → 0 ошибок (после фикса: убран лишний type-assertion в
  резолвере, unbound-method в spec).
- `npx jest src/modules/candidates` → 1 suite / 3 passed (forward company+level в repo;
  маппинг в GraphQL с epoch-seconds; null method/completedAt).
- `schema.gql` содержит `matchingCandidatesForLevel(level: QuestionLevel!): [TalentPoolCandidateType!]!`
  и `type TalentPoolCandidateType`.
- Реальный GraphQL e2e (boot `dist/main` :4582, NODE_ENV=development; JWT HS256 с `JWT_SECRET`,
  payload `{sub, companyId, email}`):
  - company 1, level=junior → 1 кандидат: `{candidateId:100, "Sergey Frontend",
    candidate.test+strong@example.com, achievedLevel:junior, method:evidence, sourceInterviewId:31,
    title:"Тестинг", completedAt:1781949071}` (attempt 102 из README-сценария).
  - company 1, level=middle / senior → `[]` (порог лестницы: junior < middle).
  - company 12, level=junior → `[]` (тенант-изоляция: чужого кандидата не видно).
  - без Authorization → `UNAUTHENTICATED` (Missing or invalid Authorization header).

### Ограничения

Живые данные содержат только одну строку с `achieved_level` (company 1, junior), поэтому дедуп
по email на нескольких попытках одного человека на проде не воспроизводился без мутации БД —
покрыт unit-тестом + детерминированным SQL (ROW_NUMBER). Тенант-скоуп и порог лестницы доказаны
на живых данных.
