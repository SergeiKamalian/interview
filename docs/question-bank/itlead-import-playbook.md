# ITLead import playbook (для Cursor-агента)

Как импортировать вопросы из [ITLEAD](https://itlead.org/interview-questions/) в question bank.

> **Один файл для Cursor:** прикрепи [ITLEAD_AGENT_PROMPT.md](./ITLEAD_AGENT_PROMPT.md) и напиши «следующий todo».

## Два API

| Шаг | Endpoint | Зачем |
|-----|----------|-------|
| 1. Каталог | `GET https://api.itlead.org/api/questions/grid` | все категории + slug + difficulty |
| 2. Детали | `GET https://api.itlead.org/api/questions/{slug}` | markdown, shortAnswer, title, category |

Страница `https://itlead.org/interview-questions/{category}/{slug}` — для человека; **агент читает API**, не HTML.

## Файлы в репо

| Файл | Назначение |
|------|------------|
| `backend/seeds/itlead-questions.grid.json` | сырой ответ grid API (обновить: `pnpm seed:fetch-itlead-grid`) |
| `backend/seeds/itlead-import.worklist.json` | **плоский лист** 564 вопросов + `importStatus` |
| `backend/seeds/itlead-topics.manifest.json` | уже импортированные темы проекта |
| `backend/seeds/topics/*.bank.json` | данные для заливки в БД |
| `docs/question-bank/topics/*.md` | design doc (checkpoints, веса) |

Обновить каталог:

```bash
cd backend && pnpm seed:fetch-itlead-grid
```

## Worklist: как брать следующий вопрос

В `itlead-import.worklist.json` каждая запись:

```json
{
  "categorySlug": "react",
  "slug": "react-hydration-and-ssr",
  "difficulty": "SENIOR",
  "pageUrl": "https://itlead.org/interview-questions/react/react-hydration-and-ssr",
  "detailApiUrl": "https://api.itlead.org/api/questions/react-hydration-and-ssr",
  "suggestedTopicCode": "react_hydration_ssr",
  "suggestedBankFile": "topics/react-hydration-ssr.bank.json",
  "importStatus": "todo"
}
```

**Статусы:** `todo` → `draft` → `ready` → `seeded` | `legacy-sql` | `skip`

Команда агенту: *«продолжай worklist, категория react, следующий todo»* — фильтруй `importStatus: "todo"`.

## Откуда что брать при создании темы

```txt
grid API          → slug, categorySlug, difficulty, titleEn
detail API        → contentMarkdownEn, shortAnswerEn, descriptionEn
detail API        → level/difficulty/interview_weight (через seed:sync-itlead)
агент + рубрика   → checkpoints, weights (Σ=10), evaluationHints, examples
```

**Checkpoints API не отдаёт** — их проектирует агент по `contentMarkdownEn`:

- заголовки `##` / `###` → кандидаты в `checkpoint_key`
- TL;DR, Common mistakes, Follow-up → `falseClaims`, `probeConceptGroups`
- Examples в markdown → `answer_examples` (good/bad)
- веса → [checkpoint-weight-rubric.md](./checkpoint-weight-rubric.md) + `difficulty` из API

**Эталон готовой темы:** `backend/seeds/topics/react-hydration-ssr.bank.json`

**Эталон senior с hints:** Fiber — `fiber-evaluation-hints.seed.sql` + golden cases

## Пошаговый импорт одного slug

1. Найти запись в worklist по `slug`.
2. `curl https://api.itlead.org/api/questions/{slug}` — прочитать контент.
3. Создать `docs/question-bank/topics/{slug}.md` (design doc).
4. Создать `backend/seeds/topics/{slug}.bank.json` по образцу hydration.
5. Добавить в `itlead-topics.manifest.json` (`status: draft`).
6. Синк уровня:
   ```bash
   pnpm seed:sync-itlead -- https://itlead.org/interview-questions/{category}/{slug}
   ```
7. Manifest → `ready`, залить:
   ```bash
   pnpm seed:topic -- {topic_code}
   ```
8. Worklist entry → `importStatus: "seeded"`, manifest → `seeded`.
9. Пересоздать interview → browser QA.

## Маппинг difficulty (API → БД)

| API `difficulty` | `questions.level` | `questions.difficulty` | `interview_weight` |
|------------------|-------------------|------------------------|--------------------|
| JUNIOR | junior | basic | 2 |
| MIDDLE | middle | intermediate | 5 |
| SENIOR | senior | advanced | 7 |
| LEAD | lead | advanced | 9 |

Автоматически: `pnpm seed:sync-itlead`.

## topic_code и bank file

- `slug` `react-hydration-and-ssr` → `topic_code` `react_hydration_ssr` (дефисы → `_`)
- bank file: `topics/{slug}.bank.json`
- skill: из `categorySlug` (`react` → skill `react`, `javascript` → `javascript`, `html-css` → `css` + `html`)

## Что уже сделано

| slug | status |
|------|--------|
| `react-fiber-and-virtual-dom-update-process` | legacy-sql |
| `reactlazy-and-suspense-lazy-components-in-react` | legacy-sql |
| `react-hydration-and-ssr` | seeded |

Остальные 561 — `todo` в worklist.

## Промпт для агента (копировать)

```txt
Прочитай docs/question-bank/itlead-import-playbook.md и backend/seeds/itlead-import.worklist.json.
Возьми следующий вопрос со status=todo из категории {CATEGORY}.
1) GET detail API по slug
2) Создай design doc + bank.json по образцу react-hydration-ssr.bank.json
3) pnpm seed:sync-itlead + pnpm seed:topic
4) Обнови worklist и manifest → seeded
```
