# Project Status

Этот файл показывает, где мы сейчас находимся в проекте.

---

## Emoji-статусы

```txt
⬜ todo
🟡 in progress
✅ done
⛔ blocked
```

---

## Current Active Block

Active block:

```txt
15-🟡-interview-templates
```

Block status:

```txt
🟡 in progress (TASK-15.6 save as template remaining)
```

Block title:

```txt
Interview Templates
```

Note: Блок **20 закрыт целиком** (Company Question Bank — overlay, import, playbooks). Следующий активный блок — **15** (resume TASK-15.6).

---

## Current Active Subtask

Active subtask ID:

```txt
TASK-15.6
```

File:

```txt
docs/tasks/list/15-🟡-interview-templates/subtasks/006-⬜-save-interview-as-template.md
```

Last completed subtask:

```txt
TASK-20.12 — Company playbook packs: migration 029 playbooks+items; GraphQL CRUD + applyPlaybookToInterviewDraft; frontend Playbooks section on Question Bank, Save as playbook + Apply dropdown in wizard step 2; excludeQuestionIds in suggest. Verify: backend build+jest 11 passed, migrate 029 OK, graphql:sync 78 ops, frontend build OK, GraphQL smoke create 2 pinned + apply count=10, tenant company12 [].
```

Archived — previous last completed:

```txt
TASK-20.11 — Frontend Excel import wizard: кнопка «Импорт из Excel» на Question Bank; Dialog upload→preview (create/update/errors)→commit; шаблон xlsx в public/templates/ (Данные+Инструкция RU); REST preview multipart + GraphQL commitCompanyQuestionImport; CTA черновики. Verify: graphql:sync 74 ops exit0, frontend build exit0, eslint company-question-import exit0, xlsx template 2 rows OK.
```

Archived — previous last completed:

```txt
TASK-20.10 — Backend Excel/CSV bulk import: parse xlsx/csv flat columns → group topics/questions/checkpoints; validation Σ weights=10, enums, snake_case; REST POST /api/company/question-bank/import/preview multipart; GraphQL commitCompanyQuestionImport(importToken); Redis importToken 15min; default status=draft. Verify: backend build exit0, jest 9 passed, curl preview 2 topics/2 questions/4 checkpoints + commit + re-import update diff OK.
```

Archived — previous last completed:

```txt
TASK-20.9 — Interview wizard Step2 custom-first UX: Tabs «Наши вопросы|Платформа|Все» (default Наши), QuestionScopeBadges (Custom/Required/Draft), секция «Обязательные» pinned+locked, sort company→companyPriority, AI suggest toast+Alert «N из M — ваши вопросы» + highlight custom; GraphQL suggest extended questions{isCustom,isRequired,companyPriority,status}. Verify: graphql:sync 73 ops exit0, frontend build exit0, eslint Step2+sort helper exit0.
```

Archived — previous last completed:

```txt
TASK-20.3 — Backend company topics/skills CRUD: repository create/update/archive для company skills/topics; extended lookups (global + company) с isCustom; GraphQL mutations createCompanySkill/Topic, update*, archive*; tenant scope @CurrentUser().companyId; validation snake_case + duplicate reject + global forbidden. Verify: backend build exit0, jest 15 passed (repository+service+suggestion), GraphQL smoke create/list/isolation/duplicate/forbidden OK, schema.gql regen.
```

Archived — previous last completed:

```txt
TASK-20.2 — DB migration 027_company_question_bank_overlay.sql: skills/topics company_id + scoped unique, questions metadata (source_question_id, status, company_priority, is_required), company_question_overrides table. Verify: migrate Applied OK, re-run idempotent skip, DESCRIBE/SHOW CREATE via docker mysql, 20 global skills + 564 topics company_id NULL.
```

Archived — previous last completed:

```txt
TASK-19.16 — Shareable candidate review link: migration `026_interview_attempt_share_tokens.sql`; GraphQL `attemptShareLink` / `createAttemptShareLink` / `revokeAttemptShareLink`; REST `GET /api/public/attempt-share/:token` (summary-only); UI `AttemptShareDialog` на AttemptReviewPage + public `/share/:token`. Verify: backend build+test (10 passed), migrate OK, frontend graphql:sync+build OK, curl invalid token → 404 Share link not found.
```

Archived — previous last completed:

```txt
TASK-19.17 — Candidate context panel: widget CandidateContextPanel на AttemptReviewPage (reuse useCandidateReportQuery) — контакты, LinkedIn/GitHub, talent pool/achieved level, другие завершённые интервью компании, ссылка на полный отчёт; read-only. Verify: eslint exit0, vite build exit0; pnpm run build падает на graphql:sync из-за ops других subtasks (не 19.17).
```

Archived — previous last completed:

```txt
TASK-19.11 — Interview candidates table upgrade: GraphQL interviewAttemptsPage с server-side pagination/filters; таблица «Все кandidатов» с колонками review/level/manual review/shortlist, checkbox selection, фильтр непросмотренных, убран Report. Verify: backend+frontend build OK, graphql sync 51 ops, smoke interviewAttemptsPage(32).
```

Archived — previous last completed:

```txt
TASK-19.8 — Interview details modal context: расширена модалка `Детали интервью` на `/dashboard/interviews/:id`, чтобы company user видел стек и вопросы. Backend `interviewDetails` теперь отдаёт `professionName`, `level`, `skills`, `questions { id sortOrder questionText level difficulty topicName maxScore }`; repository подтягивает skills через `interview_questions.source_question_id -> question_skills -> skills`. Frontend operation/codegen обновлены; modal стала scrollable `max-w-4xl` с секциями `Основное`, `Стек`, `Вопросы интервью`, показывает профессию, уровень, ссылку, skills badges и все вопросы с темой/сложностью/баллами. Verify: backend eslint exit0, frontend eslint exit0, backend build exit0, frontend build exit0 (только стандартный Vite chunk warning), GraphQL smoke `interviewDetails(32)` вернул `Frontend Developer`, 6 skills и 10 questions; browser smoke `/dashboard/interviews/32` на временном Vite :4662 + backend :3000 в dark mode открыл modal с новыми секциями. Важно: TASK-19.5 report export / handoff prep не закрывался и остаётся active todo.
```

Archived — previous last completed:

```txt
TASK-19.1 — Company review queue: добавлен company-side review queue после прохождения интервью. Backend: новый GraphQL query companyReviewQueue(filters) в candidates module, tenant-scope через @CurrentUser().companyId, берёт completed non-preview attempts из interview_attempts + candidates + interviews + final_evaluations + candidate_shortlist; поля candidate/interview/completedAt/evaluationStatus/score/hireRecommendation/achievedLevel/achievedLevelMethod/needsManualReview/shortlistStatus; фильтры search/evaluationStatus/shortlistedOnly/manualReviewOnly, pagination/sort. Frontend: GraphQL operation + RTK Query useCompanyReviewQueueQuery, route /dashboard/review, sidebar link Review queue, таблица на shadcn Table, фильтры и ссылки Report/Details. Verify: backend build exit0; jest company-review-queue.service.spec 3 passed; frontend graphql:sync exit0 (registry 49 ops); frontend build exit0 (только Vite chunk warning); targeted eslint backend/frontend exit0 после Prettier --fix; GraphQL smoke company1 total=2 attempts 105/102; UI smoke /dashboard/review через Vite proxy показал 2 строки: Алексей Петров 8.5 strong_invite middle none, Sergey Frontend 5.5 maybe junior shortlisted.
```

Archived — previous last completed:

```txt
TASK-18.10 — UI: talent pool в визарде через компактную кнопку-счётчик + модалку (shadcn Dialog). Переписал TalentPoolMatches: тот же useMatchingCandidatesForLevelQuery (backend/GraphQL не тронуты, count = длина массива), но вместо всегда-инлайн Card теперь кнопка «Есть {N} подходящ{ий|их} кандидат{|а|ов} из архива» (русские склонения, иконка users) → клик открывает Dialog (DialogContent + ScrollArea) со списком; строка кандидата вынесена в CandidateRow и сохраняет ВСЕ поля (имя, achievedLevel badge, «приблизительно» при estimate, professionName, matchedSkills, email, «Из интервью «…» · дата», ссылка «Открыть отчёт» → /dashboard/candidates/<id>/report). Empty-state: нет профессии → null; loading → disabled-кнопка outline со спиннером; count===0 → muted-хинт «Подходящих кандидатов из архива пока нет.»; error → Alert. Реактивно на смену level/profession/skills. Step1Vacancy не менялся. Verify: eslint TalentPoolMatches.tsx exit0, pnpm -C frontend build (tsc+vite) exit0; backend пересобран и поднят на :3000 (старый dist был без полей 18.8 → 400; после rebuild ок), фронт dev :5200 (vite-proxy /graphql→:3000), company1 HS256-токен в localStorage; вживую: Frontend+Middle → «Есть 1 подходящий кандидат» (singular), Frontend+Junior → «Есть 2 подходящих кандидата» → модалка с 2 кандидатами (Алексей Петров middle + Sergey Frontend junior, все поля, href report=103), Frontend+Senior → кнопка пропала + muted-хинт. Скриншоты кнопки/модалки/empty сняты. БЛОК 18 ЗАКРЫТ ЦЕЛИКОМ, папка → 18-✅-achieved-level-talent-pool. Активный блок → 15-🟡-interview-templates, subtask TASK-15.6.
```

Archived — предыдущий last completed (TASK-18.9):

```txt
TASK-18.9 — Backfill achieved_level на старых завершённых попытках (детерминированно, без LLM). Вынес сбор scoreInputs в чистый util backend/src/modules/ai-evaluation/utils/build-score-inputs.util.ts (buildScoreInputs) — единый источник маппинга для live-оценки (FinalEvaluationService теперь использует его, поведение не изменилось) и backfill. Добавил FinalEvaluationService.collectScoreInputs(companyId, attemptId, interviewId): тот же способ (summaries при adaptiveSummaries.length >= interviewQuestions.length, иначе question_evaluations), но без LLM и без throw — null при отсутствии per-question данных (skip). FinalEvaluationRepository: findAchievedLevelBackfillCandidates() (achieved_level IS NULL AND achieved_level_method IS NULL + interview_id через JOIN) и backfillAchievedLevel() (UPDATE ... WHERE id=? AND achieved_level IS NULL AND achieved_level_method IS NULL — идемпотентно, не перетирает live-строки). Standalone Nest-скрипт backend/src/scripts/backfill-achieved-level.ts (createApplicationContext на минимальном модуле без HTTP/GraphQL + process.exit), npm-скрипт backfill:achieved-level; лог: кандидаты/обновлено-с-уровнем/обновлено-estimate-null/пропущено-нет-данных/no-op. Unit-тест build-score-inputs.util.spec (3 кейса). Verify (живая БД ai_interviewer @ :3322): build exit0; eslint 0 на 5 изменённых файлах; jest ai-evaluation+scoring 14 suites/47 passed. ДО COUNT(achieved_level IS NULL)=3 → backfill: fe#66(attempt103)→senior/evidence, fe#67(104)→senior/evidence, fe#68(105)→middle/evidence (3 updated) → ПОСЛЕ COUNT=0. Ручная сверка: attempt103 один senior-вопрос 9.70/10=0.97≥0.65→senior; attempt105 10 middle-вопросов Σ77.48/91.5=0.847≥0.65→middle — совпало. Идемпотентность: второй запуск Candidates=0/Updated=0. Скоринг/hireRecommendation/промпт НЕ тронуты. БЛОК 18 ЗАКРЫТ ЦЕЛИКОМ, папка → 18-✅-achieved-level-talent-pool. Активный блок → 15-🟡, subtask TASK-15.6.
```

Archived — предыдущий last completed (TASK-18.8):

```txt
TASK-18.8 — Talent pool по стеку (профессия = жёсткий фильтр, skills = ранжирование/подсветка, дедуп per-profession). Backend: matchingCandidatesForLevel(level: QuestionLevel!, professionId: ID!, skillIds: [ID!]) — professionId обязателен, skillIds опц.; тенант-скоуп по company_id из @CurrentUser() (не из аргументов). talent-pool.repository.ts: жёсткий фильтр AND i.profession_id = ? (параметр) + INNER JOIN professions (profession_id NULLABLE → интервью без профессии исключены); дедуп ROW_NUMBER() PARTITION BY c.email теперь в рамках профессии (один email = два кандидата на разные профессии); skill overlap matched_skill_count = COUNT(DISTINCT qs.skill_id) по interview_questions.source_question_id→question_skills→skills ∩ skillIds (NULL source_question_id→0), ORDER BY уровень↓, matched_skill_count↓, completed_at↓; второй метод findSourceInterviewSkills для имён. service: matchedSkills = skills источника ∩ skillIds (без skillIds → полный стек источника), matchedSkillCount из SQL (0 без skillIds). TalentPoolCandidateType += professionId/professionName/matchedSkills:[String!]!/matchedSkillCount:Int!; schema.gql regen (boot dist dev). Frontend: GraphQL op MatchingCandidatesForLevel += $professionId: ID! / $skillIds: [ID!] + новые поля, codegen (registry 48); talentPoolApi аргумент-объект {level,professionId,skillIds}; TalentPoolMatches skip пока нет профессии (пустое «Выберите профессию…»), бейдж professionName + подсветка matchedSkills; Step1Vacancy прокидывает professionId/skillIds. Решение по skillIds: фронт шлёт их из визарда; skills только ранжируют/подсвечивают, не фильтруют. Verify: backend build exit0; eslint 0 на 5 файлах; jest src/modules/candidates 5 passed (обновлён spec на professionId+skillIds, intersection, полный стек без skillIds, skip skill-lookup при []); schema.gql содержит обновлённый query+поля. Real GraphQL e2e (boot dist :4655 dev, HS256 token JWT_SECRET company1, синтетика: profession 7 backend + завершённое интервью + candidate «Sergey Backend» с тем же email что Sergey Frontend, achieved_level=senior — после прогона удалена): prof=1(FE) junior skills=[React]→Sergey Frontend junior matchedSkills=[React] cnt1; skills=[React,Node]→[React] cnt1; без skills→[JavaScript,React] cnt0; prof=1 middle→[]; prof=7(BE) junior→ТОЛЬКО Sergey Backend senior (фронтендер с тем же email НЕ показан); prof=7 lead→[]; prof=999→[]; company12 prof=1→[] (тенант); без auth→UNAUTHENTICATED. Доказано: жёсткий фильтр профессии, дедуп per-profession, skill-ранжирование, лестница, тенант-скоуп. frontend graphql:sync exit0 (registry 48), build (tsc+vite) exit0, eslint 0 на 3 .tsx/.ts. Ограничение: браузерная проверка визарда («по возможности») не делалась — на проде одна профессия с данными (синтетика удалена), e2e уже прогоняет ровно запрос фронта через скомпилированный резолвер; не плодили dev-серверы. Блок 18 НЕ закрыт (остаётся 18.9 backfill). Активный subtask → TASK-18.9.
```

Archived — предыдущий last completed (TASK-18.6):

```txt
TASK-18.6 — Backend: talent pool query. Новый GraphQL query matchingCandidatesForLevel(level: QuestionLevel!): [TalentPoolCandidateType!]! в модуле candidates (candidate-данные + тенант-скоуп через @CurrentUser().companyId, как у candidates-dashboard/candidate-report). Repository — raw SQL (mysql2, параметры): JOIN final_evaluations fe → interview_attempts ia → candidates c → interviews i, тенант fe.company_id=? (индекс idx_final_evaluations_company_achieved), фильтры status='completed'/is_preview=0/achieved_level IS NOT NULL, порог лестницы FIELD(achieved_level,'junior','middle','senior','lead') >= FIELD(:level,…), дедуп по c.email через ROW_NUMBER() OVER (PARTITION BY email ORDER BY FIELD(level) DESC, completed_at DESC, ia.id DESC)+rn=1. TalentPoolCandidateType: candidateId/fullName/email/achievedLevel(QuestionLevel)/achievedLevelMethod(AchievedLevelMethod)/sourceInterviewId/sourceInterviewTitle/completedAt. schema.gql regen. Verify: build OK, eslint 0/6 файлов, jest candidates 3 passed (+новый talent-pool.service.spec), real e2e (boot dist :4582, JWT): company1 junior → 1 кандидат (Sergey Frontend, attempt 102, junior/evidence, interview 31); company1 middle/senior → []; company12 junior → [] (тенант-изоляция); без auth → UNAUTHENTICATED. Ограничение: дедуп нескольких попыток одного email не воспроизводился на проде (одна achieved_level-строка) — покрыт unit+SQL. Активный subtask → TASK-18.7.
```

Next recommended subtask:

```txt
TASK-15.6 — Save interview as template
```

Optional / deferred:

```txt
TASK-17.7 — Разнести combined-turn (оценка ≠ follow-up). НЕ обязателен: цель «сильный senior ≥ 8/10» достигнута 17.1–17.6/17.8. Делать только если появятся новые свидетельства, что один combined-вызов оценщика мешает калибровке.
```

Last updated:

```txt
2026-06-20 (TASK-18.10 done + БЛОК 18 ЗАКРЫТ ЦЕЛИКОМ — UX talent pool в визарде: вместо всегда-инлайн списка кандидатов теперь компактная кнопка-счётчик + модалка (shadcn Dialog). Переписан frontend/src/features/interview-create/ui/wizard/TalentPoolMatches.tsx: тот же useMatchingCandidatesForLevelQuery({level,professionId,skillIds}) (backend/GraphQL/codegen НЕ трогали, count = длина массива), но рендер заменён на Button «Есть {N} подходящ{ий|их} кандидат{|а|ов} из архива» (русские склонения candidatesPhrase 1 / 2–4 / 5+, иконка users) → клик открывает Dialog (DialogContent + ScrollArea max-h-60vh) со списком; строка кандидата → CandidateRow с ВСЕМИ полями (имя, achievedLevel badge, «приблизительно» при estimate, professionName, matchedSkills, email, «Из интервью «…» · дата», ссылка «Открыть отчёт» → /dashboard/candidates/<id>/report). Empty-state: нет профессии → null; loading/refetch → disabled outline-кнопка со спиннером; count===0 → ненавязчивый muted-хинт «Подходящих кандидатов из архива пока нет.»; error → Alert. Реактивно к смене level/profession/skills (RTK Query refetch). Step1Vacancy НЕ менялся. Verify: eslint TalentPoolMatches.tsx exit0; pnpm -C frontend build (tsc+vite) exit0; backend пересобран (старый dist :3000 был без полей 18.8 → GraphQL 400; rebuild → ок) и поднят на :3000, фронт dev :5200 (vite-proxy /graphql→:3000), company1 HS256-токен (JWT_SECRET) в localStorage, base-ui Select через CDP-dispatch на [role=option]. GraphQL curl: prof=1 junior→2 (Алексей Петров middle, Sergey Frontend junior), middle→1, senior→[]. UI вживую: Frontend+Middle → «Есть 1 подходящий кандидат из архива» (singular); Frontend+Junior → «Есть 2 подходящих кандидата из архива» → модалка с 2 кандидатами (все поля, report href=103); Frontend+Senior → кнопка пропала, muted-хинт. 3 скриншота (кнопка/модалка/empty). Ограничение: prof=7 Backend в UI не гонял (синтетика 18.8 удалена, на проде только Frontend; фильтр профессии доказан e2e в 18.8). Папка → 18-✅-achieved-level-talent-pool, README/TASKS Overall → ✅. Активный блок → 15-🟡-interview-templates, subtask TASK-15.6 (save as template).)
```

```txt
2026-06-20 (TASK-18.9 done + БЛОК 18 ЗАКРЫТ ЦЕЛИКОМ — Backfill achieved_level на старых завершённых попытках, детерминированно без LLM. Вынес сбор scoreInputs в чистый util build-score-inputs.util.ts (buildScoreInputs) — единый источник для live-оценки (FinalEvaluationService использует его, поведение не изменилось) и backfill; FinalEvaluationService.collectScoreInputs(companyId, attemptId, interviewId) — тот же способ (summaries vs question_evaluations) без LLM/throw, null при отсутствии данных→skip; FinalEvaluationRepository.findAchievedLevelBackfillCandidates() (achieved_level IS NULL AND method IS NULL + interview_id JOIN) + backfillAchievedLevel() (UPDATE WHERE id=? AND achieved_level IS NULL AND method IS NULL — идемпотентно). Standalone Nest-скрипт src/scripts/backfill-achieved-level.ts (createApplicationContext, минимальный модуль без HTTP/GraphQL) + npm backfill:achieved-level; unit-тест build-score-inputs.util.spec (3 кейса). Verify (живая БД :3322): build exit0, eslint 0 на 5 файлах, jest ai-evaluation+scoring 14 suites/47 passed; ДО COUNT(IS NULL)=3 → backfill 3 updated (attempt103→senior, 104→senior, 105→middle, все evidence) → ПОСЛЕ COUNT=0; ручная сверка совпала; 2-й запуск Candidates=0 (идемпотентно). Скоринг/hireRecommendation/промпт НЕ тронуты. Папка → 18-✅-achieved-level-talent-pool, README/TASKS → ✅. Completion Rule блока выполнен (включая «той же профессии» 18.8 и backfill 18.9). Активный блок → 15-🟡-interview-templates, subtask TASK-15.6.)
```

```txt
2026-06-20 (TASK-18.8 done — Talent pool по стеку: профессия = жёсткий фильтр, skills = ранжирование/подсветка, дедуп per-profession. Backend matchingCandidatesForLevel(level, professionId: ID!, skillIds: [ID!]) — professionId обязателен, тенант-скоуп из @CurrentUser(); repository AND i.profession_id=? + INNER JOIN professions (NULL profession_id исключён), дедуп PARTITION BY email в рамках профессии, matched_skill_count = source skills ∩ skillIds (source_question_id→question_skills→skills), findSourceInterviewSkills для имён; TalentPoolCandidateType += professionId/professionName/matchedSkills/matchedSkillCount; schema.gql regen. Frontend: op += $professionId/$skillIds + поля (codegen 48 ops), talentPoolApi аргумент-объект, TalentPoolMatches skip без профессии + professionName/matchedSkills подсветка, Step1Vacancy прокидывает professionId/skillIds. Verify: backend build/eslint(5 файлов)/jest candidates 5 passed; real GraphQL e2e (dist :4655, синтетика backend-профессии с тем же email → удалена): prof=1 FE отдаёт только Sergey Frontend, prof=7 BE отдаёт только Sergey Backend (фронтендер с тем же email НЕ виден на бэке), skill-подсветка/ранжирование, лестница, тенант company12→[], без auth→UNAUTHENTICATED; frontend graphql:sync/build/eslint exit0. Ограничение: браузерная проверка визарда не делалась (на проде одна профессия после удаления синтетики; e2e уже прогоняет запрос фронта). Блок 18 НЕ закрыт — остаётся TASK-18.9 (backfill). Активный subtask → TASK-18.9.)
```

```txt
2026-06-20 (TASK-18.7 done + БЛОК 18 ЗАКРЫТ — Frontend talent pool UI при создании интервью. Добавлены: GraphQL operation MatchingCandidatesForLevel($level: QuestionLevel!) (frontend/src/shared/api/graphql/operations/matching-candidates-for-level.graphql) + codegen (типы MatchingCandidatesForLevelQuery/Variables, operations.registry 48 ops); RTK Query useMatchingCandidatesForLevelQuery в features/interview-create/api/talentPoolApi.ts (baseApi.injectEndpoints, тег Candidate, тот же паттерн что candidateReportApi, companyId берётся из auth-контекста бэка — не аргументом); shadcn-компонент TalentPoolMatches (features/interview-create/ui/wizard/TalentPoolMatches.tsx, Card/Badge/Spinner/Alert + Tailwind, стиль как DemonstratedLevelCard из 18.5): заголовок «Кандидаты, уже показавшие уровень ≥ <X>», список fullName + бейдж achievedLevel + бейдж «приблизительно» при method=estimate, email, «Из интервью «<sourceInterviewTitle>» · <дата>», ссылка «Открыть отчёт» → /dashboard/candidates/<candidateId>/report, пустое состояние «Пока нет кандидатов, показавших этот уровень.», реагирует на data.level (RTK Query перезапрашивает); встроен в Step1Vacancy сразу после секции «Основное». Флоу создания интервью не изменён (блок информационный). Verify: pnpm -C frontend graphql:sync exit0 (codegen OK, registry 48 ops); pnpm -C frontend build (tsc -b + vite) exit0; eslint 0 ошибок на 3 файлах (TalentPoolMatches.tsx, Step1Vacancy.tsx, talentPoolApi.ts). Backend talent pool на живых данных (rebuilt dist :3000, JWT company1): matchingCandidatesForLevel junior → 1 кандидат «Sergey Frontend» candidate.test+strong@example.com achievedLevel=junior method=evidence sourceInterviewTitle=«Тестинг» completedAt=1781949071; middle/senior/lead → []. UI behavioral (фронт dev :5200 → vite proxy /graphql → backend :3000, company1 access-token в localStorage): открыт визард /dashboard/interviews/create — level=middle (default) показал пустое состояние (живой запрос вернул []); смена уровня на junior → блок перезапросился и показал карточку «Sergey Frontend / Junior / candidate.test+strong@example.com / Из интервью «Тестинг» · 20 июн. 2026 г., 13:51 / Открыть отчёт» (скриншот снят); href ссылки = /dashboard/candidates/100/report (корректный роут отчёта). Ограничение: company1 авторизован минтом HS256 access-token (JWT_SECRET, payload {sub:1,companyId:1,email}) и инъекцией в localStorage — пароль владельца неизвестен, регистрация дала бы новую компанию без talent-pool данных; тенант-скоуп/порог лестницы доказаны на живых данных. base-ui Select (shadcn) в автоматизации: опция выбрана через CDP-dispatch события на [role=option] (обычный пользовательский клик работает штатно). Все subtask 18.1–18.7 ✅ → блок закрыт, папка переименована 18-🟡 → 18-✅-achieved-level-talent-pool (как 16-✅/17-✅), Overall status TASKS.md/README → ✅. Активный блок возвращён к 15-🟡-interview-templates, subtask TASK-15.6 (save as template).)
```

```txt
2026-06-20 (TASK-18.6 done — Backend talent pool query. matchingCandidatesForLevel(level: QuestionLevel!): [TalentPoolCandidateType!]! размещён в модуле candidates (это candidate-данные с тенант-скоупом, тот же паттерн @CurrentUser().companyId, что candidates-dashboard/candidate-report; lookup-queries блока 16 — про выбор вопросов, не сюда). TalentPoolRepository — raw SQL (mysql2, только параметры): JOIN final_evaluations fe → interview_attempts ia → candidates c → interviews i; тенант fe.company_id=? (индекс idx_final_evaluations_company_achieved); фильтры ia.status='completed', ia.is_preview=0, fe.achieved_level IS NOT NULL; порог по лестнице FIELD(fe.achieved_level,'junior','middle','senior','lead') >= FIELD(?, …) через параметр (без конкатенации значений); дедуп по c.email оконной ROW_NUMBER() OVER (PARTITION BY c.email ORDER BY FIELD(achieved_level) DESC, completed_at DESC, ia.id DESC) + внешний rn=1 (MySQL 8.4); сортировка вывода уровень↓/completed_at↓. TalentPoolService маппит в GraphQL (epoch-seconds), резолвер @UseGuards(GqlAuthGuard) + companyId из @CurrentUser() (НЕ из аргументов), wiring в candidates.module. schema.gql regen (query + type TalentPoolCandidateType). Дедуп-правило: одна строка/email = лучшая попытка (max level, затем последняя completed_at, затем max ia.id). Verify: pnpm -C backend build exit0; eslint 0 ошибок на 6 файлах (фикс: лишний type-assertion в резолвере, unbound-method в spec); npx jest src/modules/candidates → 3 passed (новый talent-pool.service.spec: forward company+level, маппинг epoch-seconds, null method/completedAt). Real GraphQL e2e: boot dist/main :4582 (NODE_ENV=development), JWT HS256 c JWT_SECRET payload {sub,companyId,email} (guard читает companyId из payload, без DB-session) → company1 level=junior вернул кандидата 100 «Sergey Frontend» candidate.test+strong@example.com achievedLevel=junior method=evidence sourceInterviewId=31 «Тестинг» completedAt=1781949071 (attempt 102 README-сценария); company1 level=middle/senior → []; company12 level=junior → [] (тенант-изоляция, чужого не видно); без Authorization → UNAUTHENTICATED. Ограничение: на проде одна achieved_level-строка → дедуп нескольких попыток одного email доказан unit-тестом + детерминированным SQL (ROW_NUMBER), тенант-скоуп и порог лестницы — на живых данных. Активный subtask → TASK-18.7.)
```

```txt
2026-06-20 (TASK-18.5 done — expose achievedLevel + per-level breakdown в GraphQL/UI. Backend: FinalEvaluationType += achievedLevel (QuestionLevel, переиспользован QuestionLevelEnum), achievedLevelMethod (новый AchievedLevelMethodEnum {evidence,estimate}), achievedLevelNote (String), targetLevel (QuestionLevel), levelBreakdown ([LevelBreakdownType {level,earned,maxScore,ratio,passed}]). Наименее инвазивный путь: FinalEvaluationService кладёт весь computeAchievedLevel результат в raw_response.achievedLevelResult, mapFinalEvaluationToGraphql читает оттуда levelBreakdown+note (без второго пересчёта); achieved_level/method-колонки остаются source of truth для talent pool. targetLevel прокинут из interviews.level: candidate-report.repository (i.level→latestTargetLevel) и interview-details.repository (level в SELECT), сервисы передают 3-м аргументом в маппер. Старые строки деградируют корректно (levelBreakdown=[], note=null), колонки+targetLevel всё равно отдаются. schema.gql regen (boot dev app, autoSchemaFile). Frontend: новый shadcn-виджет DemonstratedLevelCard (Card+Badge+Tailwind-бары) — «Target·Demonstrated», per-level бар (earned/maxScore, passed/not-passed), estimate→бейдж+note; подключён в CandidateReportPage; candidate-report.graphql += поля; codegen (47 ops). Verify: pnpm -C backend build exit0; eslint 0 ошибок на 8 файлах; jest ai-evaluation+scoring 12/41 + новый ai-evaluation.mapper.spec 3 passed; final-evaluation.service.spec проверяет perLevel в raw_response; pnpm graphql:sync OK (типы обновились); pnpm -C frontend build exit0; eslint .tsx чисто. Real GraphQL e2e: boot нового dist :4577, JWT(JWT_SECRET) company1 → evaluateInterviewAttempt(102) live LLM → achievedLevel=junior/evidence, levelBreakdown=[junior 7.16/10 r0.72 passed, middle 4.76/10 r0.48 not-passed]; candidateReport(100) → targetLevel=middle, achievedLevel=junior, тот же breakdown (точный сценарий README: цель middle, демонстрировано ниже). Note: targetLevel приходит только через report-резолверы; evaluateInterviewAttempt/finalEvaluationByAttempt отдают targetLevel=null (вне scope). Активный subtask → TASK-18.6.)
```

```txt
2026-06-20 (TASK-18.4 done — persist achievedLevel в final evaluation. FinalEvaluationService: после scoringService.calculateInterviewScore(scoreInputs) вызывается computeAchievedLevel(scoreInputs) (тот же массив с level у каждого вопроса); achievedLevel (или null) + achievedLevelMethod (result.method) проброшены в upsertByAttemptId. Слой сохранения: FinalEvaluationEntity + UpsertFinalEvaluationData получили achievedLevel: QuestionLevel|null и achievedLevelMethod: 'evidence'|'estimate'|null; repository пишет/читает achieved_level/achieved_level_method (INSERT + ON DUPLICATE KEY UPDATE + SELECT + mapRow) на колонки migration 023. Инвариант соблюдён: скоринг/mapHireRecommendation/промпт финалки НЕ тронуты — achieved level отдельная ось. Verify: pnpm -C backend build → exit 0; eslint на service/entity/repository/spec → 0 ошибок; npx jest src/modules/ai-evaluation src/modules/scoring → 12 suites/41 passed. Новый final-evaluation.service.spec (раньше теста не было) мокает зависимости и прогоняет реальный computeAchievedLevel: junior 9/10 + middle 8/10 → upsert.achievedLevel='middle'/method='evidence'; senior 2/10 → null/'estimate'. End-to-end real eval не запускался (нужен live LLM в evaluateJson) — по договорённости верифицировано unit-тестом. Активный subtask → TASK-18.5.)
```

```txt
2026-06-20 (TASK-18.3 done — DB migration achieved_level: создан backend/migrations/023_final_evaluation_achieved_level.sql в конвенции проекта (plain ALTER без guards, как 020/021/022; шапка Domain ai-evaluation + Depends on 007). Добавлены на final_evaluations: achieved_level ENUM('junior','middle','senior','lead') NULL (AFTER hire_recommendation), achieved_level_method ENUM('evidence','estimate') NULL, индекс idx_final_evaluations_company_achieved (company_id, achieved_level) для talent pool. docs/database/schemas/ai-evaluation.md синхронизирован (колонки + индекс + ссылки на 023). Verify: pnpm migrate → "Applied OK: 023" / applied 1 migration; DESCRIBE final_evaluations показал обе колонки enum NULL; SHOW INDEX показал idx_final_evaluations_company_achieved (seq1 company_id, seq2 achieved_level). Идемпотентность через schema_migrations (повторный pnpm migrate пропустит). Активный subtask → TASK-18.4.)
```

```txt
2026-06-20 (TASK-17.8 done + БЛОК 17 ЗАКРЫТ — Data hygiene + ревизия question_evaluations. (1) interview 31: job_role «Фроненд»→«Фронтенд» исправлен данными (тестовая запись); welcome рендерился из job_role (template NULL→DEFAULT с {{jobRole}}), так что фикс job_role чинит и welcome; title «Тестинг» оставлен (валидное слово). (2) Лёгкая нормализация: @Transform trim на title/jobRole в CreateInterviewInput (ValidationPipe transform:true) — срезает случайные пробелы; орфографию автоматом не ловим (вне scope, зафиксировано комментарием). (3) question_evaluations: премиса «пустая» неверна — 2 строки для attempt 102 (по одной на main-answer). Решение: ACTIVE-канонический per-question store (НЕ deprecated, НЕ мёртвый путь): пишется на завершённой попытке через AdaptiveEvidenceEvaluationService.syncQuestionEvaluationsFromEvidence (зеркалит interview_question_summaries → фиксы 17.3/17.4 попадают автоматически) или legacy upsertByInterviewMessage; читается FinalEvaluationService + GraphQL-резолверами. Строки только у завершённых/оценённых попыток (96/98/100/101 имеют лишь checkpoint_states). docs/database/schemas/ai-evaluation.md синхронизирован (статус + источники). Verify: job_role=Фронтенд в БД, build OK, eslint чисто, interview-core jest 1 passed. БЛОК 17: обязательные 17.1–17.6 + 17.8 ✅; 17.7 опционален и отложен (цель «сильный senior ≥ 8/10» достигнута). Папка → 17-✅-interview-evaluation-quality. Активный блок → возврат к 15-🟡, subtask TASK-15.6.)
```

```txt
2026-06-20 (TASK-17.6 done — Калибровка golden «сильный senior» + регресс attempt 102: harness golden-calibration.spec обобщён под не-fiber вопросы (buildGenericContext по блоку context кейса — реальные чекпоинты банка + evaluationHints + полный кумулятивный ответ как evidence; тип GoldenCalibrationCase расширен). Добавлены golden-кейсы на ПОЛНЫХ ответах attempt 102: q55-virtualization-strong-senior (messages 1090+1092) и q56-closures-strong-senior (1094+1096+1098) — оба воспроизводят ложный accuracy=wrong на definition-чекпоинте при «суть сохранена/описан корректно» (17.2) и застрявший в partial сильный ответ (17.4). Третий кейс «depth=shallow + сильный ответ → НЕ weak» в build-question-summary.util.spec (правильный слой для 17.3-знаменателя: неспрошенные второстепенные исключены, 6.8/7.0≈0.97). Регресс было→стало: Q55 4.76/10 weak→9.30/10 (must-have covered), Q56 7.16/10 medium→9.42/10 (must-have covered), финал 5.5 average/maybe→strong/invite на уровне per-question. Доказан fail-before/pass-after: контролируемый revert 17.2+17.4 в apply-checkpoint-score-floors.util → ratio 0.78/0.742 FAIL, после restore (git diff чист) — зелёные. Verify: golden 14 passed/1 skipped, question-summary 4 passed, adaptive+ai-evaluation 64 suites/356 passed, eslint чисто, nest build OK. Замечания: harness детерминированный (mock оценщика → guards), живой LLM-реэвал не запускался (gated CALIBRATION_LIVE_AI=1, недетерминирован); scoringStrictness=balanced (конвенция, attempt 102 был lenient — это лишь поднимает балл). Активный subtask → TASK-17.8.)
```

```txt
2026-06-20 (TASK-17.5 done — Полный ответ в оценщик + честный evidence_summary: root cause усечения — boundText(..., maxTextLength=500) в build-adaptive-interview-context.util.ts резал latestCandidateAnswer и candidate localTurns (ответы 2-3K символов → «…» → оценщик «ответ обрывается»). Фикс: новый лимит maxCandidateAnswerLength (default 8000, env ADAPTIVE_MAX_CANDIDATE_ANSWER_LENGTH) — candidate-контент bound'ится по нему, интервьюер-турны остаются на maxTextLength; типы (AdaptiveInterviewContextLimits + inline BuildAdaptiveInterviewContextInput.limits) и .env.example обновлены. evidence_summary: attachFalseClaimEvidence перезаписывал summary через extractMatchedFalseClaimQuote, который без совпавшей фразы откатывался на первое предложение — добавлена строгая extractMatchedFalseClaimQuoteStrict (matched claim или null, без fallback); теперь summary перезаписывается только при реально cited false claim, иначе сохраняется evidence_summary модели. Verify: build OK, eslint clean на изменённых (убран мёртвый _checkpointKey, прочее --fix), build-adaptive-interview-context.util.spec обновлён (полный 2500-симв ответ не режется + bound при 50), новый false-claim-quote.util.spec (4 кейса), adaptive+ai-evaluation 64 suites/353 passed, golden зелёная. Регресс attempt 102 — в TASK-17.6. Блок 17: 17.1–17.5 done, активный subtask → TASK-17.6.)
```

```txt
2026-06-20 (TASK-17.4 done — Достижимость covered + покрытие в финале: новая upgradeStrongPartialToCovered() в apply-checkpoint-score-floors.util.ts (финальный проход) поднимает partial→covered при score≥0.8·max ∧ confidence≥0.7 ∧ depth∈{understands,knows} ∧ coverage=high ∧ нет contradiction/false_claim/shallow-accept-floor marker (порог depth/coverage добавлен сверх голого score+conf, т.к. enforceStatusScoreAlignment держал covered только на full score, а shallow-accept floor инфлейтит basic-tier до ≥0.8). build-question-summary.util.ts: summary с «{covered}/{всего} covered» → «{covered+partial}/{assessed} addressed ({c} covered, {p} partial). Score X/Y» (покрытие=covered+partial, знаменатель=assessed из 17.3) — это и был источник ложного «0/7 covered» через final-evidence-context. final-evaluation.prompt.ts 2.0.0→2.1.0: guardrails — coverage=covered+partial, не звать addressed «missing/low», нарратив согласован с баллом, coverage-risk только при score<50%·max. Verify: build OK, eslint clean на изменённых, 6 новых unit-кейсов upgrade + 3 summary, adaptive+ai-evaluation 63 suites/348 passed, golden зелёная (промежуточный регресс react-fiber-basic-tier-shallow-accept исправлен гейтами). Регресс attempt 102 — в TASK-17.6. Активный subtask → TASK-17.5.)
```

```txt
2026-06-20 (TASK-17.3 done — Probing depth vs знаменатель скоринга, вариант C (гибрид): новый isCheckpointAssessed() в build-question-summary.util.ts включает чекпоинт в score/maxScore только если он must-have (isMustHaveCheckpoint: тир PROBE_REQUIRED ∨ weight≥2 ∨ weight/max≥0.2) ∨ есть evidence (covered/partial/score>0) ∨ реально спрошен (followUpCount>0). Неспрошенные второстепенные исключаются из знаменателя (не топят балл), спрошенный-но-missed остаётся в знаменателе со штрафом; guard: пустой ответ без must-have → fallback на полный max (0/max, не 0/0). isMustHaveCheckpoint+MUST_HAVE_CHECKPOINT_WEIGHT_RATIO формализованы в probe-policy.util.ts; комментарий в adaptive-interview-context.config.ts (shallow режет только второстепенные, must-have обходят minPriorityToProbe). Verify: build OK, targeted eslint чист на изменённых файлах (9 ошибок в probe-policy.util.ts — pre-existing, подтверждено git stash), 2 новых unit-кейса (6/6 без неспрошенных vs 6/7 со спрошенным-missed), adaptive-interview 54 suites/320 passed, golden 12 passed. Регресс attempt 102 — в TASK-17.6. Активный subtask → TASK-17.4.)
```

```txt
2026-06-20 (TASK-17.2 done — Фикс ложных false_claim/accuracy=wrong: applyRationaleContradictionCap теперь вешает cap ТОЛЬКО при процитированной false-claim из evaluationHints.falseClaims банка (hasCitedFalseClaim + matchesCheckpointFalseClaims), а не по сырому флагу модели; добавлен bail на self-contradiction rationale (rationaleIndicatesSoundEvidence + rationaleAffirmsAnswerIsCorrect: «не противоречит»/«суть сохранена»/«описан корректно»). Промпты per-turn (2.9.0→2.10.0) + adaptive-ai-conversation: accuracy=wrong/false_claim только при конкретной cited error, «верно но неполно»=partial. Verify: build OK, eslint clean (+ убраны 2 pre-existing unused-symbol ошибки), 2 новых unit-кейса (covered+«не противоречит» без cited→не капается; covered+cited false claim→cap), golden 17 зелёная, adaptive-interview 54 suites/318 passed. Активный subtask → TASK-17.3.)
```

```txt
2026-06-20 (TASK-17.1 done — Model routing per role: добавлены опциональные env AI_MODEL_CLASSIFIER/FOLLOW_UP/VOICE/FINAL (дефолт = AI_MODEL_EVALUATION); новый резолвер model-routing.util.ts (operationType→role→model, fallback на evaluation для unknown); AiProviderConfig.resolveModel() + проброс в 5 методов AiProviderService через debug.operationType; final-evaluation теперь шлёт operationType=final_summary. Checkpoint-evaluator остаётся на AI_MODEL_EVALUATION. Verify: build OK, eslint OK на изменённых файлах, jest 22/22 (резолвер + registerAs: пустые env → всё = AI_MODEL_EVALUATION, заданные → разные модели), ai_usage_logs подтвердил реальные operation_type. Активный subtask → TASK-17.2.)
```

```txt
2026-06-20 (Создан блок 17-🟡-interview-evaluation-quality: README + TASKS + 8 subtask-файлов (17.1 model routing, 17.2 false-positive caps, 17.3 probing vs знаменатель, 17.4 covered/coverage, 17.5 полный ответ в оценщик, 17.6 калибровка, 17.7 опц. decouple combined-turn, 17.8 data hygiene). Источник: анализ attempt 102/interview 31 — сильный senior получил 5.5/10 «average/maybe». Активный блок переключён на 17, активный subtask TASK-17.1.)
```

```txt
2026-06-20 (TASK-16.19 done + БЛОК 16 ЗАКРЫТ ЦЕЛИКОМ: live preview «попробовать как кандидат» — migration 022 (is_preview на interview_attempts), owner-auth мутация startInterviewPreview (работает на draft, переиспользует public session-flow), preview исключён из лимитов/аналитики/воронки/списков (7 репозиториев) и из авто-evaluation; schema.gql regen (47 ops codegen); frontend кнопка на странице управления → новая вкладка с candidate-сессией. Verify: legacy curl smoke (draft→start→begin→submit×2→completed, overview/attempts/funnel пустые, 2-й preview при maxCompletions=1 разрешён) + browser e2e с live LLM (welcome → основной вопрос). Папка блока → 16-✅-interview-creation-flow.)
```

---

## Done (block 14)

- [x] TASK-14.1 — Coverage vs accuracy taxonomy
- [x] TASK-14.2 — Golden calibration dataset + CI
- [x] TASK-14.3 — LLM follow-ups, no rubric fallback
- [x] TASK-14.4 — Follow-up early stop policy
- [x] TASK-14.5 — False claim penalty hardening
- [x] TASK-14.6 — Per-checkpoint HR report (dashboard)
- [x] TASK-14.7 — Coverage vs accuracy dual axis UI
- [x] TASK-14.8 — Ideal answer comparison
- [x] TASK-14.9 — Red flags / misconceptions block
- [x] TASK-14.10 — Confidence + manual review UI
- [x] TASK-14.11 — Evaluator vs guard divergence logging
- [x] TASK-14.12 — A/B prompt versioning
- [x] TASK-14.13 — Verify topic_opener not scored
- [x] TASK-14.14 — Follow-up answer weight < main answer
- [x] TASK-14.15 — Bank-driven guards (remove fiber hardcode)
- [x] TASK-14.16 — DB checkpoint evaluation hints + snapshot
- [x] TASK-14.17 — Scoring accuracy, red flags & legacy sync
- [x] TASK-14.18 — Probe-or-Accept + OpenAI prompts 2.6
- [x] TASK-14.19 — Weight-based follow-up budget allocator
- [x] TASK-14.20 — Transitive checkpoint floors
- [x] TASK-14.21 — Topic mismatch redirect
- [x] TASK-14.22 — Residual gap probe (narrowing follow-up)
- [x] TASK-14.23 — UI: уверенность AI в оценке (clarity)
- [x] TASK-14.24 — Probe missed structural checkpoints
- [x] TASK-14.25 — Floors guard coverage=none
- [x] TASK-14.26 — Min probes before topic switch
- [x] TASK-14.27 — Candidate clarification on vague follow-up

## Wave 3 (done)

- [x] TASK-14.28 — Candidate turn AI classifier
- [x] TASK-14.29 — Wire classifier into submit + policy
- [x] TASK-14.30 — Deprecate legacy intent regex
- [x] TASK-14.31 — Bank-driven false claims

## Wave 4 (evaluation mode router) — done

- [x] TASK-14.32 — Evaluation mode contract
- [x] TASK-14.33 — Submit evaluation mode routing
- [x] TASK-14.34 — Guards + merge mode-aware freeze
- [x] TASK-14.35 — Policy target refusal branch
- [x] TASK-14.36 — Golden attempt #91 regression
- [x] TASK-14.37 — Fix follow-up Cyrillic mojibake (ENC-01)

---

## Current block (15)

- [x] TASK-15.1 — Document interview templates design
- [x] TASK-15.2 — Add SQL schema for interview templates
- [x] TASK-15.3 — Add backend GraphQL API templates
- [x] TASK-15.4 — Add frontend GraphQL/RTK Query layer
- [x] TASK-15.5 — Add create interview template modal
- [ ] TASK-15.6 — Add save interview as template

---

## Previous block (10)

- [x] TASK-10.1 — Microphone permission
- [x] TASK-10.2 — Audio recording
- [x] TASK-10.3 — Audio upload endpoint
- [x] TASK-10.5 — Text-to-speech
- [x] TASK-10.6 — Audio storage

---

## Deferred

- [ ] TASK-10.4 — Speech-to-text (skipped in current implementation pass)

---

## Next blocks

- [x] Block `18-✅-achieved-level-talent-pool` — achieved level + talent pool по стеку + backfill (18.1–18.9 ✅)
- [x] Block `17-✅-interview-evaluation-quality` — калибровка оценки + model routing (17.1–17.6, 17.8 ✅; 17.7 опц. отложен)
- [x] Block `20-✅-company-question-bank` — company overlay, Excel import, playbooks (20.1–20.12 ✅)
- [ ] Block `15-🟡-interview-templates` — возобновить на TASK-15.6 (save as template) ← активный
- [ ] Block `11-⬜-video` — Video interview recording
- [ ] Block `12-⬜-ats-integrations` — ATS integrations
- [ ] Block `13-⬜-deployment` — Deployment

---

## Blocked

No blocked tasks.
