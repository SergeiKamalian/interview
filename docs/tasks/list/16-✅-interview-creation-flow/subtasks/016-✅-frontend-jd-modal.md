# TASK-16.16 — Frontend: JD generate modal

Status: [x] done

## Goal

Кнопка «Сгенерировать из описания» → модалка → предзаполнение визарда из JD.

## Depends on

- TASK-16.12 (JD prefill resolver), TASK-16.14 (wizard shell с prefill).

## Context

- Принцип «всё редактируемо до создания»: JD только предзаполняет визард, не создаёт интервью.

## Scope

- `.graphql` operation + RTK hook для `draftInterviewFromJobDescription`.
- Модалка: textarea для JD + кнопка «Сгенерировать», loading/empty/error.
- Результат → инициализирует wizard-state (profession/level/skills/questionIds/title/jobRole) и открывает визард на шаге 1.
- Точка входа — из того же места, что «Создать интервью» (`CreateInterviewStartButton`).

## UI

- Только shadcn/ui (`.cursor/rules/frontend-ui-shadcn.mdc`): dialog, textarea, button, sonner (toast), skeleton/spinner для loading. Недостающее: `pnpm dlx shadcn@latest add <component>` (из `frontend/`). Каталог: https://ui.shadcn.com/docs/components.

## Verification

- `pnpm -C frontend build`/typecheck + lint.
- UI smoke: вставить JD → визард открывается предзаполненным; все поля редактируемы; можно дойти до создания.

## Completion Notes

Реализовано (frontend only — backend resolver `draftInterviewFromJobDescription` уже был в 16.12):

- **GraphQL op:** `frontend/src/shared/api/graphql/operations/draft-interview-from-job-description.graphql` (mutation `DraftInterviewFromJobDescription`, поля title/jobRole/professionId/level/skillIds/questionIds/generatedByAi). После codegen+registry — 42 операции.
- **RTK hook:** `useDraftInterviewFromJobDescriptionMutation` в `frontend/src/features/question-bank/api/questionBankApi.ts` (+ типы `JobDescriptionDraftArgs`/`JobDescriptionDraft`).
- **shadcn компоненты:** добавлены вручную (CLI `shadcn add` зависал >8 мин) по образцу `sheet.tsx`/`popover.tsx` на `@base-ui/react`: `frontend/src/shared/ui/dialog.tsx`, `frontend/src/shared/ui/alert-dialog.tsx` (alert-dialog — задел для 16.17).
- **Модалка:** `frontend/src/features/interview-create/ui/JobDescriptionGenerateDialog.tsx` — dialog + textarea + skeleton (loading) + sonner toast (success/warning/error). Не создаёт интервью, только строит `Partial<WizardData>`.
- **Prefill plumbing:** `frontend/src/features/interview-create/model/prefill.ts` (`InterviewWizardPrefillState`, `normalizeWizardLevel`). Модалка → `navigate('/dashboard/interviews/create', { state: { prefill, prefillSource: 'jd' } })`. `CreateInterviewPage` читает `location.state.prefill` → `InterviewCreateWizard initial=...` (всё редактируемо).
- **Точка входа:** в `CreateInterviewStartButton` (тот же модал, что «Создать интервью») добавлена кнопка «Сгенерировать из описания».
- **Toaster** примонтирован в `frontend/src/app/App.tsx` (`<Toaster position="top-right" richColors />`).

Проверки (команды → ожидание → результат):
- `pnpm graphql:sync` → codegen + registry без ошибок → OK (42 ops).
- `npx tsc -b` → без ошибок → OK.
- `npx eslint <changed files>` → без ошибок (только harmless .eslintignore warning) → OK.
- `pnpm build` (tsc + vite) → production-бандл собран без ошибок → OK.
- Полный browser-smoke JD→prefill объединён с e2e блока (16.17), т.к. требует поднятого frontend+backend+валидного LLM-ключа для `draftInterviewFromJobDescription`.
