# TASK-16.14 — Frontend: визард создания (шаги 1,3–7) + state/nav

Status: [x] done

## Goal

Каркас визарда: шаги, навигация, единый state, превью/публикация. Шаг 2 — отдельно (16.15).

## Depends on

- TASK-16.6 (новые поля create), TASK-16.13 (хуки справочников).

## Context

- Текущий `CreateInterviewPage` + `QuestionPicker` (`frontend/src/pages/dashboard/CreateInterviewPage.tsx`, `frontend/src/features/interview-create/`).
- Route создания: `/dashboard/interviews/create` (`routes.tsx`).

## Scope

- Каркас визарда (новый набор компонентов в `frontend/src/features/interview-create/` или `widgets/`), шаги:
  - Шаг 1 — Вакансия: title, jobRole, level, language, jobDescription, profession (select), skills (multi-select, релевантные профессии через `useSkillsQuery(professionId)`).
  - Шаг 3 — Поведение AI: `aiTone`, `probingDepth`, `scoringStrictness` (понятные пресеты с описанием), interviewerName, welcome.
  - Шаг 4 — Формат/тайминги: video/voice/text, `timeLimitMinutes`.
  - Шаг 5 — Доступ/лимиты: `expiresAt`, `maxCompletions`, `allowRetake`, required-поля кандидата.
  - Шаг 6 — Результаты: `passingScore`.
  - Шаг 7 — Превью + Publish.
- Единый wizard-state (модель в `features/interview-create/model/`), навигация вперёд/назад, валидация по шагам.
- Submit → `createInterview` со всеми полями → редирект (детали в 16.17).
- Поддержать prefill извне (для JD/шаблона): state инициализируется переданными значениями.

## UI

- Только shadcn/ui (`.cursor/rules/frontend-ui-shadcn.mdc`): tabs/stepper, card, select, switch, radio-group, slider, date picker (calendar+popover), textarea. Недостающее ставить: `pnpm dlx shadcn@latest add <component>` (из `frontend/`). Каталог: https://ui.shadcn.com/docs/components.

## Verification

- `pnpm -C frontend build`/typecheck + lint.
- UI smoke: пройти все шаги, создать интервью; поля долетают в mutation (проверить network/GraphQL).

## Completion Notes

### Что сделано

- Единый wizard-state: `frontend/src/features/interview-create/model/interviewWizard.ts`
  - `WizardData` (все поля шагов 1–7), `defaultWizardData`, `WIZARD_STEPS`,
    хук `useInterviewWizard(initial?)` (update / навигация goNext/goBack/goTo /
    `isStepValid` / `canSubmit` / `buildCreateInput` → `CreateInterviewInput`).
  - Поддержка prefill извне через `initial?: Partial<WizardData>` (для JD/шаблона).
- Контейнер визарда: `frontend/src/features/interview-create/ui/InterviewCreateWizard.tsx`
  - Stepper (кликабельные шаги, отметка пройденных), рендер шага, навигация
    Назад/Далее (Далее блокируется при невалидном шаге), submit `createInterview`
    + кнопка Publish, вывод публичной ссылки и ошибок.
- Шаги (shadcn/ui): `ui/wizard/`
  - `Step1Vacancy` — title/jobRole/level/language/jobDescription, profession
    (SelectField), skills (ToggleGroup, релевантные через `useSkillsQuery(professionId)`).
  - `Step2Questions` — interim (чекбоксы из банка, scoped по профессии/скиллам/уровню);
    полноценный picker — в 16.15.
  - `Step3Behavior` — aiTone/probingDepth/scoringStrictness как radio-пресеты с
    описанием + interviewerName + welcome.
  - `Step4Format` — режим text/voice/video (radio) + timeLimitMinutes.
  - `Step5Access` — expiresAt (Calendar+Popover), maxCompletions, allowRetake,
    required-поля кандидата (Switch).
  - `Step6Results` — passingScore (Switch + Slider 0–10).
  - `Step7Review` — сводка всех настроек.
- Страница `frontend/src/pages/dashboard/CreateInterviewPage.tsx` переведена на
  `<InterviewCreateWizard onCancel=... />` (старый одностраничный flow заменён).
- `WizardStepProps` — общий тип props шага (`ui/wizard/types.ts`).

### shadcn-компоненты (доустановлены через `pnpm dlx shadcn@latest add`)

- `radio-group`, `slider`, `popover`, `calendar` (+ ранее `toggle-group`,
  `switch`, `select`, `checkbox`, `textarea`, `badge`, `label`).
  Существующие файлы (button и т.п.) не перезаписывались (`yes n |`).

### Verification

Команды (в `frontend/`):
- `npx tsc -b` → **passed** (типы wizard/шагов/контейнера ок, `buildCreateInput`
  совпадает с generated `CreateInterviewInput`).
- `npx eslint <wizard files + page>` → **0 ошибок**.
- `pnpm build` (вкл. `graphql:sync` codegen + `vite build`) → **passed**,
  3899 модулей, бандл собран.
- Dev-smoke: `vite --port 5199 --strictPort` → `curl /` = **200**, сервер
  стартует без ошибок резолва модулей; затем остановлен.

Ожидал: проект типизируется/собирается, визард-модули резолвятся, поля state
маппятся в mutation input. Получил: всё прошло.

Блокер (не закрывает scope): интерактивный click-through через все 7 шагов с
реальным `createInterview` по сети не гонял — dashboard за авторизацией и требует
поднятого backend/БД. Корректность submit-полей покрыта типами (`buildCreateInput`
типизирован под generated `CreateInterviewInput`) и успешным build. Полный
end-to-end click-through логично выполнить вместе с 16.15 (шаг вопросов).
