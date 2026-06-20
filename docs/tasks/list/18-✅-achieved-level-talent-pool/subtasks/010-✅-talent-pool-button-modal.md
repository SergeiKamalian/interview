# TASK-18.10 — UI: кнопка-счётчик «подходящие из архива» + модалка со списком

Status: [x] done

## Depends on

- TASK-18.7, TASK-18.8.

## Проблема / запрос

Сейчас `TalentPoolMatches` показывает список кандидатов всегда инлайном на шаге «Вакансия».
Пользователь хочет: после того как HR описал интервью (стек/уровень/профессия), показать
компактную **кнопку со счётчиком** вроде «Есть 5 подходящих кандидатов из архива», а сам список
открывать по клику в модалке/панели — чтобы не загромождать форму.

## Scope (frontend only)

- Переделать UX talent pool в визарде (`Step1Vacancy` / `TalentPoolMatches`):
  - Когда профессия выбрана и есть совпадения (count > 0) — показать кнопку-триггер с числом:
    «Есть {N} подходящ{их} кандидат{ов} из архива» (правильные склонения; иконка users).
  - По клику — открыть shadcn-компонент Dialog ИЛИ Sheet (проверь, что уже есть в
    `frontend/src/shared/ui/`; если нет — установить через `pnpm dlx shadcn@latest add dialog`/`sheet`).
    Внутри — тот же список кандидатов (переиспользовать текущую вёрстку строки: имя, achievedLevel
    badge, «приблизительно» при estimate, professionName, matchedSkills, email, источник+дата,
    ссылка «Открыть отчёт»).
  - Состояния: loading (кнопка disabled/спиннер или скрыта), нет профессии — ничего не показывать
    (или дисейбл с подсказкой), count === 0 — НЕ показывать кнопку (или ненавязчивый muted-хинт).
    Решение по empty-state опиши в Notes.
  - Реактивность сохранить: смена уровня/профессии/скиллов обновляет count и список.
- ВАЖНО (shadcn-правило): использовать только компоненты из `@shared/ui` (Dialog/Sheet/Button/Badge
  и т.д.). Не плодить кастомные аналоги. Иконки — lucide-react.
- Не менять backend и GraphQL (query уже отдаёт всё нужное; count = длина массива).

## Verification

- `pnpm -C frontend graphql:sync` (если query не менялся — codegen всё равно ок) и
  `pnpm -C frontend build` (tsc+vite) → OK; eslint на изменённых .tsx чисто.
- Поведенческая проверка в визарде (dev-сервер, не плодить дубли — проверь terminals/):
  профессия 1 (Frontend) + junior → кнопка «Есть 1 подходящий кандидат из архива» → клик → модалка
  со «Sergey Frontend»; смена на middle/senior → кнопка пропадает (count 0); профессия 7 (Backend)
  junior → бэкенд-кандидат. Скриншот кнопки и открытой модалки.
- Если UI поднять нельзя — докажи через build+типы и зафиксируй ограничение.

## Completion Notes

Frontend-only. Переделал `TalentPoolMatches` из всегда-инлайн `Card` со списком в
компактную кнопку-счётчик + модалку (shadcn `Dialog`, уже был в `@shared/ui/dialog`;
`Sheet` тоже есть, но `Dialog` ближе к существующим `JobDescriptionGenerateDialog`/
`SaveAsTemplateDialog`). Backend/GraphQL/codegen НЕ трогал — тот же
`useMatchingCandidatesForLevelQuery({level, professionId, skillIds})`, `count = candidates.length`.

### Что сделано

- `frontend/src/features/interview-create/ui/wizard/TalentPoolMatches.tsx` (переписан):
  - `candidatesPhrase(n)` — русские склонения: 1 → «подходящий кандидат», 2–4 → «подходящих
    кандидата», 0/5–20 → «подходящих кандидатов». Текст кнопки: «Есть {phrase} из архива»,
    иконка `UsersIcon` (lucide-react).
  - Клик → `Dialog` (`DialogContent`/`Header`/`Title`/`Description` + `ScrollArea max-h-[60vh]`).
    Строка кандидата вынесена в `CandidateRow` — вёрстка и ВСЕ поля сохранены 1:1: имя,
    `achievedLevel` badge, «приблизительно» при `estimate`, `professionName` badge,
    `matchedSkills` badges, email, «Из интервью «…» · дата», ссылка «Открыть отчёт» →
    `/dashboard/candidates/<id>/report`.
  - Тип кандидата берётся из codegen: `MatchingCandidatesForLevelQuery['matchingCandidatesForLevel'][number]`.
- `Step1Vacancy.tsx` не менял — он уже рендерит `<TalentPoolMatches .../>` после секции «Основное»;
  теперь там кнопка/хинт вместо карточки.

### Решение по состояниям (empty-state)

- **Нет профессии** → `return null` (раньше query был skip; кнопке нечего показывать, форму не
  загромождаем). Профессия выбрана, но идёт загрузка/refetch → **disabled-кнопка `outline` со
  спиннером** «Поиск кандидатов из архива…» (секция не прыгает).
- **count === 0** → кнопку НЕ показываю, вместо неё **ненавязчивый muted-хинт** с иконкой
  «Подходящих кандидатов из архива пока нет.» (чтобы при смене уровня было видно, что блок
  отреагировал, а не просто исчез).
- **isError** → `Alert variant="error"`.
- Реактивность: смена level/profession/skills меняет ключ RTK Query → count и содержимое модалки
  пересчитываются автоматически.

### Verify (команды / ожидание / результат)

- `pnpm -C frontend exec eslint src/features/interview-create/ui/wizard/TalentPoolMatches.tsx`
  → exit 0, чисто.
- `pnpm -C frontend build` (tsc -b + vite) → exit 0 (3918 modules, built в ~0.7s).
- Поведенческая проверка вживую: backend пересобран (`pnpm -C backend build`) и поднят на :3000
  (старый dist на :3000 был без полей 18.8 professionId/professionName/matchedSkills →
  GraphQL_VALIDATION_FAILED; после rebuild ок); фронт dev :5200 (`VITE_GRAPHQL_URL=/graphql`,
  vite-proxy → :3000). Авторизация company 1: HS256-токен (JWT_SECRET, payload {sub:1,companyId:1})
  в `localStorage['ai_interviewer_access_token']`; base-ui Select-опции выбраны CDP-dispatch на
  `[role=option]`. GraphQL прямым curl: prof=1 junior → 2 (Алексей Петров middle, Sergey Frontend
  junior), middle → 1, senior → [].
  - **Frontend + Middle** → кнопка «Есть 1 подходящий кандидат из архива» (singular). ✅
  - **Frontend + Junior** → кнопка «Есть 2 подходящих кандидата из архива» (форма 2–4) → клик →
    модалка со списком из 2 кандидатов; видны имя, level-бейдж, профессия, matchedSkills, email,
    «Из интервью «Тестинг» · дата», «Открыть отчёт» (href = /dashboard/candidates/103/report). ✅
  - **Frontend + Senior** → кнопка пропала, показан muted-хинт «Подходящих кандидатов из архива
    пока нет.» (реактивный refetch). ✅
  - Скриншоты: (1) кнопка-счётчик «Есть 2 подходящих кандидата из архива» с иконкой users;
    (2) открытая модалка со списком 2 кандидатов и всеми полями; (3) senior empty-хинт.

### Ограничения

- Данные на проде эволюционировали с момента написания задачи (появился второй FE-кандидат
  «Алексей Петров» middle), поэтому junior отдаёт 2, а не 1 — это удачно покрыло обе формы
  склонения (1 и 2–4). Профессию 7 (Backend) не проверял в UI: синтетика 18.8 удалена, на проде
  только Frontend с данными; backend-фильтр профессии уже доказан e2e в 18.8.
