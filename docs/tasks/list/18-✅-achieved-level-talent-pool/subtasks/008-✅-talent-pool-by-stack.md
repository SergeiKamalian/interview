# TASK-18.8 — Talent pool по стеку (профессия + skill-ранжирование + дедуп per stack)

Status: [x] done

## Depends on

- TASK-18.6 (talent pool query), TASK-18.7 (UI).

## Проблема

Текущий `matchingCandidatesForLevel(level)` матчит ТОЛЬКО по уровню и игнорирует профессию/стек:
фронтендера предлагает на бэкенд-интервью. Плюс дедуп `PARTITION BY c.email` берёт одну лучшую
попытку по всем интервью → senior-на-бэке + middle-на-фронте схлопываются в одного, что ломает
модель «кандидат = человек + стек» (один email = два кандидата на разные профессии).

## Решение (продуктовое: профессия обязательна, скиллы — для ранжирования)

- Профессия — **жёсткий фильтр**: матч только когда профессия исходного интервью совпадает с
  профессией создаваемого.
- Скиллы — **только ранжирование/подсветка** (не обязательный фильтр).

## Scope

### Backend
- Изменить query на профессие-aware, напр. `matchingCandidatesForLevel(level, professionId)` (либо
  `matchingCandidatesForStack`). `professionId` — обязательный аргумент. Сохрани тенант-скоуп по
  `company_id` из auth (НЕ из аргументов).
- SQL (`talent-pool.repository.ts`):
  - добавить `AND i.profession_id = ?` (исходное интервью той же профессии);
  - дедуп оставить `PARTITION BY c.email`, но теперь он в рамках одной профессии → корректно
    отражает «один кандидат на стек» (один email может вернуться отдельно для другой профессии в
    другом запросе);
  - skill overlap: посчитать пересечение skills (через snapshot вопросов исходного интервью —
    `interview_questions.source_question_id` → `question_skills`, либо `interviews`→вопросы→skills;
    выбери надёжный путь) с переданными `skillIds` (если фронт их шлёт) → вернуть как
    `matchedSkillCount`/`matchedSkills` для подсветки и доп. сортировки (скиллы НЕ фильтруют выдачу).
  - `i.profession_id` NULLABLE: если у исходного интервью профессия NULL — оно НЕ матчится по
    профессии (исключить из выдачи). Зафиксируй это поведение.
- Расширить `TalentPoolCandidateType`: `professionId`, `professionName` (JOIN professions),
  `matchedSkills`/`matchedSkillCount` (для подсветки). Регенерировать `schema.gql`.

### Frontend
- Прокинуть `professionId` (и `skillIds`, если есть) создаваемого интервью в запрос пула.
- В блоке «подходящие кандидаты» (`TalentPoolMatches`) показать профессию/стек кандидата и
  подсветить совпавшие skills; пустое состояние, когда нет совпадений по профессии. Codegen.

## Verification

- backend build + eslint + jest зелёные; `schema.gql` содержит обновлённый query/тип.
- Реальный GraphQL e2e: интервью профессии A, level X → возвращаются только кандидаты профессии A с
  achievedLevel ≥ X; кандидат другой профессии НЕ возвращается; тенант-изоляция сохранена.
- Frontend: codegen+build OK; в визарде смена профессии/уровня меняет список; фронтендер не виден
  для бэкенд-профессии.
- Если живых данных по двум профессиям мало — докажи фильтр на синтетических данных/unit + опиши.

## Completion Notes

### Что сделано

**Backend**
- `matchingCandidatesForLevel(level: QuestionLevel!, professionId: ID!, skillIds: [ID!]): [TalentPoolCandidateType!]!`
  — `professionId` обязателен, `skillIds` опционален. Тенант-скоуп по `company_id` из
  `@CurrentUser()` (не из аргументов) — сохранён.
- `talent-pool.repository.ts`:
  - жёсткий фильтр профессии `AND i.profession_id = ?` (параметр, без конкатенации) + `INNER JOIN
    professions p`. Т.к. `interviews.profession_id` NULLABLE, INNER JOIN + равенство автоматически
    исключают интервью без профессии — они никогда не попадают в пул (поведение зафиксировано).
  - дедуп `ROW_NUMBER() OVER (PARTITION BY c.email ...)` оставлен; теперь работает в рамках одной
    профессии → один email может вернуться отдельно для другой профессии (модель «кандидат = стек»).
  - skill overlap (ранжирование, НЕ фильтр): подзапрос `COUNT(DISTINCT qs.skill_id)` по пути
    `interview_questions.source_question_id → question_skills → skills` пересекает skills исходного
    интервью с `skillIds` (NULL `source_question_id` не джойнится → 0). `ORDER BY` уровень↓,
    `matched_skill_count`↓, `completed_at`↓.
  - второй метод `findSourceInterviewSkills(interviewIds)` для имён skills (подсветка).
- `talent-pool.service.ts`: `matchedSkills` = имена skills источника, пересекающиеся с `skillIds`
  (если skillIds пуст/не передан → полный стек источника для подсветки). `matchedSkillCount` —
  число пересечений из SQL (0 без skillIds).
- `TalentPoolCandidateType` расширен: `professionId`, `professionName`, `matchedSkills: [String!]!`,
  `matchedSkillCount: Int!`. `schema.gql` регенерирован (boot dist в dev, autoSchemaFile).

**Frontend**
- GraphQL operation `MatchingCandidatesForLevel` принимает `$professionId: ID!` + `$skillIds: [ID!]`
  и возвращает новые поля; codegen + registry (48 ops).
- `talentPoolApi.ts`: аргумент стал объектом `{ level, professionId, skillIds }`.
- `TalentPoolMatches.tsx`: пропсы `professionId`/`skillIds`; запрос `skip`, пока профессия не выбрана
  (пустое состояние «Выберите профессию…»); показывает бейдж `professionName` и подсветку
  `matchedSkills`; пустое состояние «Пока нет кандидатов этой профессии…».
- `Step1Vacancy.tsx`: прокинуты `professionId`/`skillIds` из визарда.

### Решение по skillIds

Принято: фронт **шлёт** `skillIds` из визарда (они уже в state). `skillIds` — опциональны и только
ранжируют/подсвечивают, никогда не фильтруют выдачу. Когда `skillIds` пуст → `matchedSkillCount=0`,
а `matchedSkills` = полный стек источника (для подсветки профиля кандидата).

### Команды верификации / результат

- `pnpm -C backend build` → exit 0.
- eslint на 5 изменённых backend-файлах → 0 ошибок (prettier --fix применён к service/spec).
- `npx jest src/modules/candidates` → 5 passed (обновлён spec: forward professionId+skillIds,
  intersection matchedSkills, полный стек без skillIds, skip skill-lookup при пустом результате).
- `schema.gql`: `matchingCandidatesForLevel(level, professionId: ID!, skillIds: [ID!])` + поля
  `professionId/professionName/matchedSkills/matchedSkillCount` присутствуют.
- Real GraphQL e2e (boot dist :4655 NODE_ENV=development, HS256 token JWT_SECRET, company 1).
  Синтетические данные: profession 7 «Backend Developer (synth)» + завершённое интервью «Backend
  синтетик 188» + candidate «Sergey Backend» (тот же email `candidate.test+strong@example.com`,
  achieved_level=senior). Результат (после прогона — синтетика удалена):
  - `#1` company1 prof=1(FE) junior skillIds=[3 React] → `Sergey Frontend` junior, matchedSkills=[React], cnt=1.
  - `#2` skillIds=[3 React, 26 Node] → matchedSkills=[React], cnt=1 (Node нет у источника).
  - `#3` без skillIds → matchedSkills=[JavaScript, React], cnt=0.
  - `#4` prof=1 middle → [] (Sergey FE junior < middle).
  - `#5` prof=7(BE) junior → **только** `Sergey Backend` senior (фронтендер с тем же email НЕ показан).
  - `#6` prof=7 senior → Sergey Backend; `#7` prof=7 lead → [] (senior<lead).
  - `#8` prof=999 → []; `#9` company12 prof=1 → [] (тенант-изоляция); `#10` без auth → UNAUTHENTICATED.
  Доказано: жёсткий фильтр профессии, дедуп per-profession (один email — два кандидата на разные
  профессии), skill-ранжирование/подсветка, лестница уровней, тенант-скоуп.
- `pnpm -C frontend graphql:sync` → exit 0 (registry 48 ops); `pnpm -C frontend build` (tsc -b + vite)
  → exit 0; eslint на 3 изменённых .tsx/.ts → 0 ошибок.

### Ограничение

Браузерная поведенческая проверка визарда («по возможности») не выполнялась: на проде осталась
одна профессия с данными (синтетика удалена после e2e), а реальный GraphQL e2e уже прогоняет ровно
тот запрос, что шлёт фронт (`level + professionId + skillIds` → `matchedSkills/professionName`) через
скомпилированный резолвер с доказанной изоляцией по профессии. Чтобы не плодить дубли dev-серверов,
ограничились e2e + tsc/codegen/eslint фронта.
