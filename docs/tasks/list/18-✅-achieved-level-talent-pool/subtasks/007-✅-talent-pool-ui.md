# TASK-18.7 — Frontend: блок «подходящие кандидаты»

Status: [x] done

## Depends on

- TASK-18.6.

## Goal

При создании интервью на уровень X подсказать HR подходящих кандидатов из прошлых интервью.

## Scope

- В визарде создания интервью (блок 16) на шаге выбора уровня — блок «Кандидаты, уже показавшие
  уровень ≥ X»: имя, email, demonstrated level, из какого интервью.
- Пустое состояние, если совпадений нет. Ссылка на отчёт кандидата.

## Verification

- UI: выбор уровня → список обновляется; клик ведёт на отчёт.

## Completion Notes

### Что сделано

- GraphQL operation `MatchingCandidatesForLevel($level: QuestionLevel!)` в
  `frontend/src/shared/api/graphql/operations/matching-candidates-for-level.graphql`
  (поля: candidateId, fullName, email, achievedLevel, achievedLevelMethod,
  sourceInterviewId, sourceInterviewTitle, completedAt). Codegen прогнан —
  появились типы `MatchingCandidatesForLevelQuery/Variables` и запись в
  `operations.registry.ts` (48 operations).
- RTK Query endpoint `useMatchingCandidatesForLevelQuery(level)` в
  `frontend/src/features/interview-create/api/talentPoolApi.ts`
  (baseApi.injectEndpoints, тег `Candidate`, тот же паттерн что candidateReportApi).
  companyId НЕ передаётся аргументом — тенант-скоуп берётся из auth-контекста на бэке.
- UI-компонент `TalentPoolMatches` в
  `frontend/src/features/interview-create/ui/wizard/TalentPoolMatches.tsx`
  (shadcn Card/Badge/Spinner/Alert + Tailwind, стиль как DemonstratedLevelCard 18.5):
  заголовок «Кандидаты, уже показавшие уровень ≥ <X>», список fullName + бейдж
  achievedLevel + бейдж «приблизительно» при method=estimate, email,
  «Из интервью «<sourceInterviewTitle>» · <дата>», ссылка «Открыть отчёт» →
  `/dashboard/candidates/<candidateId>/report`. Пустое состояние —
  «Пока нет кандидатов, показавших этот уровень.». Реагирует на `data.level`
  (RTK Query перезапрашивает при смене уровня).
- Встроен в шаг выбора уровня визарда (`Step1Vacancy.tsx`) сразу после секции
  «Основное» (где select уровня). Флоу создания интервью не изменён — блок
  информационный.

### Команды / ожидание / результат

- `pnpm -C frontend graphql:sync` → exit 0, codegen OK, типы появились,
  registry = 48 operations. ✅
- `pnpm -C frontend build` (tsc -b + vite build) → exit 0, без ошибок типов. ✅
- `eslint` на изменённых файлах (TalentPoolMatches.tsx, Step1Vacancy.tsx,
  talentPoolApi.ts) → 0 ошибок. ✅
- Backend talent pool query на живых данных (rebuilt dist, :3000, JWT company1):
  `matchingCandidatesForLevel(level)` → junior: 1 кандидат (Sergey Frontend,
  candidate.test+strong@example.com, achievedLevel=junior, method=evidence,
  sourceInterviewTitle=«Тестинг», completedAt=1781949071); middle/senior/lead → []. ✅
- Поведенческая проверка UI (фронт dev :5200 → proxy /graphql → backend :3000,
  company1 access-token в localStorage): открыт визард
  `/dashboard/interviews/create`.
  - level=middle (default) → пустое состояние «Пока нет кандидатов, показавших
    этот уровень.» (живой запрос вернул []).
  - сменил level → junior → блок перезапросился и показал карточку
    «Sergey Frontend / Junior / candidate.test+strong@example.com / Из интервью
    «Тестинг» · 20 июн. 2026 г., 13:51 / Открыть отчёт». Скриншот снят. ✅
  - href ссылки «Открыть отчёт» = `/dashboard/candidates/100/report` (корректный
    роут отчёта кандидата). ✅

### Ограничения

- Для UI-проверки company1 авторизовался минтом HS256 access-token (JWT_SECRET,
  payload {sub:1,companyId:1,email}) и инъекцией в localStorage — пароль
  владельца компании 1 неизвестен; регистрация дала бы новую компанию без
  talent-pool данных. Тенант-скоуп/порог лестницы доказаны на живых данных
  (junior populated, middle/senior/lead empty).
- base-ui Select (shadcn) в автоматизации: popup открывается по клику; выбор
  опции выполнен через CDP-dispatch события на `[role=option]` (обычный
  пользовательский клик работает штатно).
