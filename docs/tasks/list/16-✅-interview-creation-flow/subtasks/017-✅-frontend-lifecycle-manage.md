# TASK-16.17 — Frontend: lifecycle + redirects + страница управления

Status: [x] done

## Goal

Единый центр управления интервью и консистентные редиректы после создания.

## Depends on

- TASK-16.14.

## Context

- Сейчас: после ручного создания остаёшься на форме (publish тут же), после создания из шаблона — редирект на details без publish. Неконсистентно.
- Lifecycle (design): `draft → active → paused → archived` + вычисляемые expired/full.

## Scope

- После создания (любым способом) → редирект на страницу интервью (details/manage).
- Страница управления: share-ссылка (copy), статус-бейдж (включая expired/full), действия publish / pause / resume / archive, save-as-template, показ лимитов (дедлайн/кап/попытки) и настроек AI.
- Кнопки `pauseInterview`/`resumeInterview` (если backend-статус `paused` добавлен в 16.5/связном backend; иначе зафиксировать зависимость).
- Обновить `routes.tsx` при необходимости.

## UI

- Только shadcn/ui (`.cursor/rules/frontend-ui-shadcn.mdc`): card, badge (статус), button, dropdown-menu (действия), tooltip, sonner (toast), alert-dialog (archive confirm). Недостающее: `pnpm dlx shadcn@latest add <component>` (из `frontend/`). Каталог: https://ui.shadcn.com/docs/components.

## Verification

- `pnpm -C frontend build`/typecheck + lint.
- UI smoke: создать → редирект на manage; publish меняет статус; expired/full отображаются; copy-ссылки работает.

## Completion Notes

Реализовано (backend lifecycle + frontend manage page + редирект).

### Backend (статус `paused` не был поддержан в 16.5 — реализован здесь)

- **Миграция:** `backend/migrations/021_interview_paused_status.sql` — `ALTER TABLE interviews MODIFY COLUMN status ENUM('draft','active','paused','archived')`. Идемпотентна (повторный запуск runner'а — no-op, `MODIFY` к тому же типу безопасен).
- **Enum:** `paused` добавлен в `types/interview-status.enum.ts` и `types/interview.type.ts` (`InterviewStatusEnum`, `GRAPHQL_INTERVIEW_STATUSES`).
- **Repository:** `interview-core.repository.ts` → метод `updateStatus(companyId, interviewId, status)`.
- **Service:** `interview-core.service.ts` → `pauseInterview` (active→paused), `resumeInterview` (paused→active), `archiveInterview` (любой→archived) через общий `transitionStatus` с валидацией (`INTERVIEW_NOT_PAUSABLE` и т.п.).
- **Resolver:** мутации `pauseInterview` / `resumeInterview` / `archiveInterview` в `interview-core.resolver.ts`. `schema.gql` перегенерирован (enum + мутации).

### Frontend

- **GraphQL ops:** `managed-interview.graphql` (полный конфиг интервью), `pause-interview.graphql`, `resume-interview.graphql`, `archive-interview.graphql`.
- **RTK API:** `entities/interview/api/interviewManageApi.ts` — `useManagedInterviewQuery` + `usePause/useResume/useArchiveInterviewMutation` (инвалидация тэга `{type:'Interview', id}`). `publishInterview` тоже теперь инвалидирует id-тэг.
- **Manage panel:** `widgets/interview/InterviewManagePanel.tsx` (shadcn: card, badge, button, dropdown-menu, tooltip, sonner, alert-dialog) — статус-бейдж (+ вычисляемые `expired`/`full` для active), copy share-ссылки, действия publish/pause/resume и dropdown (save-as-template, archive с alert-dialog confirm), показ AI-настроек (tone/depth/strictness) и лимитов (завершения/дедлайн/пересдача/время/проходной балл). Встроена сверху в `InterviewDetailsPage` (route `/dashboard/interviews/:id`), `completedCount` берётся из attempts.
- **Редирект:** `InterviewCreateWizard` после `createInterview` → toast + `navigate('/dashboard/interviews/:id')` (убраны inline publish/публичная ссылка). Путь «из шаблона» в `CreateInterviewStartButton` уже редиректил на ту же страницу.

### Проверки (команды → ожидание → результат)

- `pnpm -C backend build` → OK.
- Миграция 021 применена к БД через runner → `status` ENUM содержит `paused` → OK.
- **GraphQL smoke (curl, свой backend :4150):** register → createInterview(draft) → publish→`active` → pause→`paused` → resume→`active` → archive→`archived`; pause(archived) → ошибка `INTERVIEW_NOT_PAUSABLE` («Only active interviews can be paused») → всё как ожидалось → OK.
- `npx tsc -b` (frontend) → OK; `npx eslint <changed>` → OK (после фикса `react-hooks/purity`: `Date.now()` вынесен в lazy `useState`).
- `pnpm graphql:sync` (codegen+registry) → 46 ops → OK.
- `pnpm build` (frontend prod) → OK.
- **E2E (свой backend :3000 через vite-proxy + frontend dev :5182, браузер):** register → wizard (7 шагов, 2 вопроса, лимит 30 мин, max 2 завершения) → «Создать интервью» → **редирект на `/dashboard/interviews/24`**; manage panel показал статус «Черновик», share-ссылку, AI-настройки и лимиты (Завершений 0/2, Лимит времени 30 мин). Клик «Опубликовать» → бейдж «Активно» + появилась «Пауза»; «Пауза» → «На паузе» + «Возобновить»; «Возобновить» → «Активно». Полный lifecycle отработал в UI.

### Заметки

- Dropdown «Действия» (save-as-template / archive): mutations верифицированы независимо (archive — curl smoke; save-as-template — существующий `CreateInterviewTemplateFromInterview`). В автоматизированном браузере (Electron webview) меню base-ui не удержалось открытым из-за focus-чувствительности синтетических кликов — это не дефект кода (тот же паттерн `render`-триггера работает в `nav-user`).
