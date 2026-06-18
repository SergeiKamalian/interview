# ITLead → bank.json (промпт для Cursor-агента)

**Прикрепи этот файл к чату и напиши:** «следующий todo» или «следующий todo из react».

Агент делает **одну тему за запуск**: читает API → создаёт полный `*.bank.json` → обновляет трекер.

---

## 1. Где смотреть «сделано / не сделано»

| Файл | Что показывает |
|------|----------------|
| `backend/seeds/itlead-import.worklist.json` | **главный трекер** — 564 вопроса, поле `importStatus` |
| `backend/seeds/itlead-topics.manifest.json` | темы, которые уже в проекте (seeded / legacy) |
| `backend/seeds/topics/*.bank.json` | готовые данные для заливки в БД |

Обновить каталог с ITLead (если давно не обновляли):

```bash
cd backend && pnpm seed:fetch-itlead-grid
```

В начале worklist:

```json
"byStatus": { "todo": 561, "seeded": 1, "legacy-sql": 2 }
```

**Статусы:** `todo` → не сделано · `draft` → bank в работе · `ready` → готов к seed · `seeded` → в БД · `legacy-sql` / `skip` → не трогать

**Следующий вопрос:** первая запись с `"importStatus": "todo"` (опционально фильтр `categorySlug`).

---

## 2. API (источник данных)

```txt
Каталог:  GET https://api.itlead.org/api/questions/grid
Детали:   GET https://api.itlead.org/api/questions/{slug}
```

Агент **обязан** вызвать detail API по `slug` из worklist. HTML страницы не парсить.

Из detail API берём:

| Поле API | Куда в bank.json |
|----------|------------------|
| `slug`, `titleEn`, `difficulty`, `category.slug` | `itlead` + маппинг level |
| `shortAnswerEn` | основа для `question.shortAnswer` (перевод на русский) |
| `contentMarkdownEn` | основа для `idealAnswer`, checkpoints, examples |
| `descriptionEn` | контекст для `questionText` |

Checkpoints API **не отдаёт** — проектируешь по markdown (заголовки `##`/`###`, TL;DR, Common mistakes, Examples, Interview questions).

---

## 3. Что создать (deliverable)

Один файл:

```txt
backend/seeds/topics/{slug}.bank.json
```

**Эталон качества:** `backend/seeds/topics/react-hydration-ssr.bank.json` — читай целиком перед генерацией.

Опционально (не блокер): `docs/question-bank/topics/{slug}.md` — краткий design doc.

---

## 4. Схема `*.bank.json`

```json
{
  "topic": {
    "code": "snake_case",
    "name": "Human Name",
    "skillCode": "react",
    "interviewWeight": 7
  },
  "question": {
    "professionCode": "frontend_developer",
    "level": "senior",
    "difficulty": "advanced",
    "questionText": "Вопрос на русском",
    "shortAnswer": "1–3 предложения",
    "idealAnswer": "Полный эталонный ответ (абзац/несколько) — всё важное из ITLead markdown",
    "maxScore": 10,
    "skills": ["react", "javascript"]
  },
  "checkpoints": [ /* 5–9 штук, SUM(score) = 10.00 */ ],
  "examples": [ /* 15–35 штук: question-level + per-checkpoint */ ],
  "itlead": {
    "slug": "...",
    "apiUrl": "https://api.itlead.org/api/questions/{slug}",
    "pageUrl": "https://itlead.org/interview-questions/{categorySlug}/{slug}",
    "difficulty": "SENIOR",
    "titleEn": "...",
    "categorySlug": "react",
    "syncedAt": "ISO-8601"
  }
}
```

### Маппинг `difficulty` (API → bank)

| API | `level` | `difficulty` | `interviewWeight` |
|-----|---------|--------------|-------------------|
| JUNIOR | junior | basic | 2 |
| MIDDLE | middle | intermediate | 5 |
| SENIOR | senior | advanced | 7 |
| LEAD | lead | advanced | 9 |

### `topic.code` и имена файлов

- slug `reconciliation-in-react` → code `reconciliation_react`
- bank file: `topics/reconciliation-in-react.bank.json` (по slug из worklist)
- `skillCode`: из `categorySlug` (`react`→`react`, `javascript`→`javascript`, `html-css`→`css`)

### Checkpoints — обязательные правила

- **5–9 checkpoints**, `sortOrder` с 0
- **`SUM(score) = 10.00`** точно
- Веса по tier: `mention` 0.5 · `basic` 1.0 · `core_plus` 1.5 · `intermediate` 2.0 · `advanced` 2.5 · `expert` 3.0
- Каждый checkpoint с `evaluationHints`:
  - `complexityTier`, `weightRationale`
  - `mustConcepts` (10–20 терминов, **только русский**)
  - `falseClaims` (3–5 типичных заблуждений)
  - `minMatchedConcepts`: 2 (или 1 для бонусных)
  - `positiveFloorScore`: 0.75–0.85
- Для middle+: `probeConceptGroups` (1–3 на сложных checkpoint)
- Для senior / важных связок: `impliesCheckpointFloors`, `confusionPairs`, `probePolicy`
- `falseClaimCapFraction: 0` на checkpoint с критичными ошибками

### Examples — обязательные правила

- **3 question-level good** (formal + casual mix)
- **3 question-level bad**
- **Per checkpoint:** минимум 2 good (formal + casual) + 1 bad
- `checkpointKey: null` — question-level; иначе привязка к checkpoint

### Язык — только русский

**Все текстовые поля в bank.json — на русском.** ITLead API на английском: переводи смысл, не копируй EN дословно.

| Поле | Язык |
|------|------|
| `topic.name` | русский |
| `question.questionText`, `shortAnswer`, `idealAnswer` | русский |
| `checkpoints[].title`, `expected` | русский |
| `evaluationHints.*` (rationale, ask, falseClaims, mustConcepts, anchorTerms*) | русский |
| `examples[].exampleText` | русский |
| `checkpoint_key`, `topic.code` | латиница snake_case (идентификаторы) |

**Исключение:** устоявшиеся тех-акронимы латиницей внутри русского текста — OK: `SSR`, `DOM`, `hydration`, `reconcile`, `useEffect`, `renderToString`.

**Запрещено:** английские предложения, `titleEn` в question/checkpoints, дубли EN+RU в `mustConcepts`.

### Кодировка — кириллица в БД

Файл **обязан** быть UTF-8 (без BOM). При сохранении:

- кириллица читаемая: `гидратация`, `обработчик`, `несовпадение`
- **не** mojibake: `Ð³Ð¸Ð´Ñ`, `РіРёРґС`, `ÐÐ°Ðº`

Цепочка до MySQL уже настроена:

```txt
*.bank.json (UTF-8) → readFileSync('utf8') → mysql charset utf8mb4 → таблицы utf8mb4_unicode_ci
```

`pnpm seed:topic` сам выставляет `SET NAMES utf8mb4`. После seed можно проверить:

```bash
docker compose exec mysql mysql -uai_interviewer -pchangeme ai_interviewer \
  --default-character-set=utf8mb4 \
  -e "SELECT question_text FROM questions q JOIN topics t ON t.id=q.topic_id WHERE t.code='{topic_code}' LIMIT 1;"
```

В выводе должен быть нормальный русский текст, не кракозябры.

---

## 5. Как проектировать checkpoints из markdown

1. Прочитай `contentMarkdownEn` целиком.
2. Каждый смысловой блок `##` / `###` → кандидат в checkpoint.
3. TL;DR / Key point → ядро (core_plus).
4. Common mistakes / Wrong → отдельный checkpoint + `falseClaims`.
5. Code examples → `mustConcepts` + examples.
6. Interview questions в конце статьи → probeConceptGroups.
7. Самый важный для уровня checkpoint — больший weight (до 2.0–2.5 на middle, 2.0 на senior pitfalls).

**По уровню:**

| Уровень | checkpoints | hints depth |
|---------|-------------|-------------|
| JUNIOR | 5–6, больше basic | mustConcepts + falseClaims |
| MIDDLE | 6–7, mix basic/intermediate | + probeConceptGroups |
| SENIOR | 7–9, core_plus + intermediate | + floors, confusionPairs, probePolicy |

---

## 6. После создания bank.json (агент обновляет трекер)

1. Добавить в `backend/seeds/itlead-topics.manifest.json`:

```json
{
  "source": "https://itlead.org/interview-questions/{categorySlug}/{slug}",
  "bankFile": "topics/{slug}.bank.json",
  "status": "ready"
}
```

2. В `backend/seeds/itlead-import.worklist.json` — у записи с этим `slug` поставить `"importStatus": "ready"`.

3. В Completion Notes написать: slug, topic_code, checkpoints count, sum weights, сколько examples.

**Не запускать seed автоматически** — пользователь заливает в БД сам.

---

## 7. Как пользователь заливает в БД

Новые темы — **не SQL** (Fiber/lazy — legacy `.seed.sql`).

```bash
cd backend
pnpm seed:sync-itlead -- https://itlead.org/interview-questions/{categorySlug}/{slug}
pnpm seed:topic -- {topic_code}
```

`seed:topic` делает то же, что раньше делал `fiber-evaluation-hints.seed.sql`: topics, questions, checkpoints, evaluation_hints, examples — всё из `*.bank.json`.

После успешного seed → manifest и worklist → `"seeded"`.

---

## 8. Промпт (копировать в чат)

```txt
Прочитай docs/question-bank/ITLEAD_AGENT_PROMPT.md.
Открой backend/seeds/itlead-import.worklist.json.
Возьми следующий importStatus=todo [категория: {CATEGORY}].
1) GET https://api.itlead.org/api/questions/{slug}
2) Создай backend/seeds/topics/{slug}.bank.json по образцу react-hydration-ssr.bank.json
3) Обнови manifest (ready) и worklist entry
4) В ответе: путь к файлу, topic_code, Σ weights, число checkpoints/examples
```

---

## 9. Уже сделано (не пересоздавать)

| slug | status | bank / seed |
|------|--------|-------------|
| `react-fiber-and-virtual-dom-update-process` | legacy-sql | SQL seeds |
| `reactlazy-and-suspense-lazy-components-in-react` | legacy-sql | SQL seeds |
| `react-hydration-and-ssr` | seeded | `topics/react-hydration-ssr.bank.json` |

Остальные — `todo` в worklist.
