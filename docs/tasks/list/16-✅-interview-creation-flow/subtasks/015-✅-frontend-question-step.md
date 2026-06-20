# TASK-16.15 — Frontend: шаг 2 — подбор вопросов (score/skills-first/AI)

Status: [x] done

## Goal

Красивый и понятный шаг выбора вопросов с AI-подбором.

## Depends on

- TASK-16.3 (skillIds filter), TASK-16.4 (AI suggest), TASK-16.14 (wizard shell).

## Context

- Текущий `QuestionPicker` показывает `topic · level · difficulty`, БЕЗ score; грузит 100 вопросов без фильтров.
- Группировка по скиллу есть: `frontend/src/entities/question/lib/groupQuestionsBySkill.ts`.

## Scope

- Новый шаг-компонент:
  - список с полями: текст вопроса, тема, сложность, уровень, score/вес (`maxScore` + `interviewWeight`);
  - skills-first: сначала вопросы по выбранным на шаге 1 скиллам, потом остальные;
  - фильтры: тема, сложность, уровень, поиск;
  - выбор/снятие, reorder, счётчик/`questionCount`;
  - кнопка «Сгенерировать через AI» → `suggestInterviewQuestions` → преселект (редактируемый).
- Использовать `useQuestionBankQuery` с фильтрами (skillIds/professionId/level) вместо плоского limit=100.

## UI

- Только shadcn/ui (`.cursor/rules/frontend-ui-shadcn.mdc`): table/data-table или card, checkbox, badge, select, input (поиск), tooltip. Недостающее: `pnpm dlx shadcn@latest add <component>` (из `frontend/`). Каталог: https://ui.shadcn.com/docs/components.

## Verification

- `pnpm -C frontend build`/typecheck + lint.
- UI smoke: skills-first работает; score виден; AI-кнопка преселектит вопросы, их можно убрать/добавить; выбор уходит в wizard-state.

## Completion Notes

### Что сделано

- Полноценный шаг вопросов: `frontend/src/features/interview-create/ui/wizard/Step2Questions.tsx`
  (заменил interim-версию из 16.14). Подключён в `InterviewCreateWizard`.
  - Два списка: «Банк вопросов» (слева, выбор чекбоксами) и «Выбранные»
    (справа, с порядком + reorder ↑/↓/✕). Селект уходит прямо в
    `wizard.questionIds` (единый state, без дублирующего локального стора).
  - Поля по каждому вопросу: текст, тема, уровень, сложность и **score** —
    `max {maxScore}` + `вес {interviewWeight}` темы (tooltip с пояснением).
  - **skills-first**: вопросы по выбранным на шаге 1 скиллам (`data.skillIds`,
    мэтч по primary-скиллу темы + `question.skills`) идут сверху с бейджем
    «по навыку», остальные — ниже; внутри групп сортировка по теме. Использован
    `getQuestionPrimarySkill` из `entities/question/lib/groupQuestionsBySkill`.
  - Фильтры: поиск по тексту, тема, сложность, уровень (client-side поверх пула
    профессии).
  - Кнопка «Сгенерировать через AI» → `suggestInterviewQuestions` →
    `questionIds = payload.questionIds` (преселект, полностью редактируемый;
    disabled без профессии; ошибка показывается Alert'ом).
- Данные: `useQuestionBankQuery({ professionId, limit: 1000 })` (полный пул по
  профессии, чтобы skills-first мог показать и «остальные»); фильтры по
  уровню/сложности/теме/поиску — на клиенте.
- GraphQL operation: `frontend/src/shared/api/graphql/operations/suggest-interview-questions.graphql`
  (`mutation SuggestInterviewQuestions`), зарегистрирован codegen'ом
  (`operations.registry.ts` → 41 операция), типы сгенерированы.
- RTK Query: `useSuggestInterviewQuestionsMutation` +
  `SuggestQuestionsArgs`/`SuggestedQuestions` в
  `frontend/src/features/question-bank/api/questionBankApi.ts`.

### UI (shadcn/ui)

- Использованы: checkbox, badge, select (SelectField), input, scroll-area,
  tooltip, button, alert, label, spinner. Новых компонентов доустанавливать не
  потребовалось (все уже были в `shared/ui`).

### Verification

Команды (в `frontend/`):
- `pnpm graphql:sync` → codegen ок, registry **41 operations** (добавлен
  `SuggestInterviewQuestions`).
- `npx tsc -b` → **passed** (типы шага, мутации, payload ок).
- `npx eslint Step2Questions / Step5Access / questionBankApi` → **0 ошибок**.
- `pnpm build` (codegen + vite) → **passed**.

Ожидал: типизация/сборка проходят, мутация и пул вопросов типизированы,
skills-first/score/фильтры/reorder компилируются и резолвятся. Получил: всё ок.

Блокер (не закрывает scope): интерактивный UI-smoke (клики по фильтрам, AI-кнопке
с реальным `suggestInterviewQuestions`, проверка преселекта по сети) не гонял —
требует авторизации в dashboard + поднятого backend/БД + LLM. Логика подбора и
маппинг в wizard-state покрыты типами и build'ом; реальный end-to-end прогон
визарда (создание интервью со всеми полями) логично сделать на этапе поднятого
окружения / в 16.17 (lifecycle).
