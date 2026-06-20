# TASK-16.18 — Templates parity + редактируемое create-from-template

Status: [x] done

## Goal

Шаблон = редактируемые настройки: хранит новые config-поля и предзаполняет визард, где всё можно поправить.

## Depends on

- TASK-16.5 (parity-колонки на templates), TASK-16.6, TASK-16.14.

## Context

- Сейчас `createInterviewFromTemplate(templateId)` создаёт интервью напрямую (без правки).
- Шаблоны: `backend/src/modules/interview-templates/`.

## Scope

- Backend:
  - `createInterviewTemplate` / `createInterviewTemplateFromInterview` сохраняют новые config-поля;
  - предусмотреть путь «создать из шаблона С правками»: либо принимать override-поля в существующей mutation, либо отдавать настройки шаблона на фронт для prefill + обычный `createInterview` (зафиксировать выбор в Notes).
- Frontend:
  - выбор шаблона предзаполняет визард (как JD), пользователь правит (убрать/добавить вопросы, сменить поля) → создаёт;
  - `createInterviewFromTemplate` напрямую остаётся как «быстрый» путь либо заменяется на prefill-флоу (по выбранному решению).

## Verification

- backend build + GraphQL smoke: template хранит новые поля; интервью из шаблона наследует их.
- frontend smoke: выбор шаблона открывает редактируемый визард; правки применяются; создание ок.

## Completion Notes

**Решение по «создать из шаблона с правками»:** выбран вариант **prefill-флоу** (как JD из 16.16) — выбор шаблона предзаполняет редактируемый визард и идёт обычный `createInterview`. Это консистентно с JD-модалкой и принципом «всё редактируемо до создания». Прямой `createInterviewFromTemplate` оставлен в API (и теперь тоже наследует config), но из UI основная кнопка «Из шаблона» ведёт в prefill-флоу.

Реализовано:

### Backend (config-колонки на templates существовали с миграции 020, но не читались/писались/отдавались)

- **Repository** (`interview-templates.repository.ts`): config-поля (`ai_tone`, `probing_depth`, `scoring_strictness`, `max_completions`, `allow_retake`, `time_limit_minutes`, `passing_score`, `require_phone`, `require_linkedin`, `require_github`) добавлены в row/entity/`CreateInterviewTemplateData`/`InterviewTemplateDraftFromInterview` (через общий `InterviewTemplateConfig`), во все SELECT'ы (list/findById), INSERT, `mapTemplate` и в чтение из `interviews` для `findTemplateDraftFromInterview`. `passing_score` (DECIMAL) → `Number(...)`.
- **GraphQL type** (`interview-template.type.ts`): config-поля на `InterviewTemplateType` (через `AiToneEnum`/`ProbingDepthEnum`/`ScoringStrictnessEnum`, Int/Float).
- **GraphQL input** (`interview-template.input.ts`): те же поля (optional) на `CreateInterviewTemplateInput` с валидацией (`@IsEnum`, `@Min(1)`, passing score 0..10).
- **Service** (`interview-templates.service.ts`): `createTemplate` (из input + дефолты), `createTemplateFromInterview` (из draft), `createInterviewFromTemplate` (наследует config в `CreateInterviewInput`), `mapTemplate` (отдаёт config). `expires_at` — намеренно interview-only (per-instance дедлайн), в шаблон не входит.
- `schema.gql` перегенерирован (config-поля на `InterviewTemplateType`).

### Frontend (prefill-флоу)

- **GraphQL ops:** config-поля добавлены в `company-interview-templates.graphql`, `create-interview-template.graphql`, `create-interview-template-from-interview.graphql` (единый shape `InterviewTemplate`). Codegen — 46 ops.
- **Prefill helper:** `buildWizardPrefillFromTemplate(template)` в `features/interview-create/model/prefill.ts` → `Partial<WizardData>` (title/role/level/lang/jobDescription/professionId, questionIds по sortOrder, tone/depth/strictness, interviewerName/welcome, mode из isVideoEnabled, timeLimit/maxCompletions/allowRetake/require*/passingScore).
- **Точка входа:** `CreateInterviewStartButton` — кнопка «Из шаблона» больше не создаёт интервью напрямую, а `navigate('/dashboard/interviews/create', { state: { prefill, prefillSource: 'template' } })` → редактируемый визард (как JD). Удалён прямой `createInterviewFromTemplate` mutation-хук из виджета.

### Проверки (команды → ожидание → результат)

- `pnpm -C backend build` → OK; eslint `interview-templates/` → без ошибок.
- **GraphQL smoke (curl, :3000):**
  - `createInterviewTemplate` с config → вернул strict/deep/strict, maxCompletions 3, allowRetake true, timeLimit 45, passingScore 7.5, requirePhone/github → OK;
  - `createInterviewFromTemplate` → интервью унаследовало ВСЕ config-поля 1:1 → OK;
  - `createInterview` → `createInterviewTemplateFromInterview` → config round-trip (friendly/shallow/lenient, timeLimit 20, allowRetake, requireLinkedin) → OK.
- `npx tsc -b` (frontend) → OK (после расширения mutation selection sets под единый `InterviewTemplate`); eslint changed → OK; `pnpm build` → OK; codegen → 46 ops.
- **Browser e2e (:5182 → :3000):** «Создать интервью» → карточка шаблона «E2E Prefill Template» → «Из шаблона» → визард открылся на `/dashboard/interviews/create` предзаполненным (title «E2E Prefill Template», role «Frontend Developer», шаг «Вопросы» → «Выбранные (2)»), всё редактируемо → OK.
