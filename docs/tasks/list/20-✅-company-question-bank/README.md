# 20-✅-company-question-bank — Company Question Bank (Knowledge Layer)

## Цель блока

Дать компаниям слой **своих** вопросов, тем, стеков, red/green flags и playbooks поверх платформенного question bank — без нарушения принципа «банк = source of truth для AI-оценки».

Компания должна уметь:

```txt
свои темы/стеки → свои вопросы + fork global → overrides на red/green flags
→ импорт из Excel → приоритет custom при создании интервью → snapshot → та же честная оценка /10
```

---

## Контекст

Блок `05-question-bank` дал платформенный банк (~564 тем ITLead) с checkpoints, weights, `mustConcepts` / `falseClaims`, snapshot policy.

Уже частично готово:

- `questions.company_id` — global vs company-owned (design + migration `005`)
- Backend GraphQL: `createQuestion` / `updateQuestion` / `archiveQuestion` с checkpoints и hints
- Visibility: `(company_id IS NULL OR company_id = ?)`
- `suggestInterviewQuestions` — AI подбирает из банка, но **без приоритета** company questions
- Frontend `QuestionBankPage` — read-only, кнопка «Создать вопрос» disabled

Не хватает:

- company-scoped **topics/skills** (сейчас только global lookup)
- fork global question, draft/publish, priority / pinned required
- overrides на global questions (extra red/green без полного дублирования)
- Excel/CSV import
- UI CRUD + custom-first UX в визарде создания интервью

---

## Источник правды (design)

- `docs/database/schemas/question-bank.md` — базовая схема (global)
- `docs/database/schemas/company-question-bank.md` — **создаётся в TASK-20.1** (overlay, overrides, import, priority)
- `docs/question-bank/checkpoint-weight-rubric.md` — веса checkpoints (Σ = 10)
- `backend/seeds/topics/*.bank.json` — канонический формат для bulk import

---

## Входит в блок

### Wave 1 — Foundation

- Design doc company knowledge layer
- DB migration: company taxonomy + question metadata + overrides table
- Backend company topics/skills API
- Backend fork + draft/publish + priority fields
- Backend overrides + snapshot merge

### Wave 2 — Selection priority + UI

- Backend custom priority в `suggestInterviewQuestions` + JD draft + AI prompt
- Frontend question bank CRUD
- Frontend company topics + fork flow
- Frontend interview wizard: «Наши вопросы» / «Платформа», badges, pinned

### Wave 3 — Import + playbooks

- Backend Excel/CSV import (validate → preview → commit)
- Frontend import wizard + downloadable template
- Company playbook packs (pinned required mix, интеграция с interview templates где уместно)

---

## Не входит в блок

- AI **генерация** новых вопросов с нуля (только структурирование при import — human review обязателен)
- Изменение платформенных global questions компанией (только fork / override)
- Cross-company sharing question bank
- ATS export вопросов
- Изменение scoring math (остаётся checkpoint weights → /10)

---

## Architecture Rules

- Question bank остаётся **source of truth**: AI сравнивает ответ только с **snapshot** checkpoints
- Company layer = overlay, не второй банк
- `SUM(checkpoint.score) = questions.max_score = 10` — валидатор на save/import
- Tenant isolation: company questions/topics/overrides видны только своей компании
- Global bank read-only для компаний
- GraphQL — основной API; Excel upload — REST multipart (как file upload в проекте)
- Frontend: RTK Query + GraphQL, UI — shadcn из `@shared/ui`, FSD-like placement
- Import internally маппится на тот же контракт, что `*.bank.json`

---

## Recommended subtask order

```txt
20.1 → 20.2 → 20.3 → 20.4 → 20.5 → 20.6
→ 20.7 → 20.8 → 20.9 → 20.10 → 20.11 → 20.12
```

Wave 1 (20.1–20.5) можно частично параллелить backend после 20.2, но **20.1 и 20.2 — строго первыми**.
