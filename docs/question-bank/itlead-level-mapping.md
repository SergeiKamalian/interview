# ITLead → уровень темы и веса

Когда приходит ссылка на [ITLEAD](https://itlead.org/interview-questions/) (или ты пишешь «это для senior / middle / junior»), **сначала определяем целевой уровень**, потом из него выводим все поля банка.

```txt
ITLead URL + уровень (явный или из контекста)
  → questions.level + questions.difficulty
  → topics.interview_weight
  → распределение checkpoint weights (Σ = 10)
  → QA-ожидания /10
```

## Откуда брать уровень

| Источник | Что делать |
|----------|------------|
| **ITLead API** | `GET https://api.itlead.org/api/questions/{slug}` → поле `difficulty` (`JUNIOR` / `MIDDLE` / `SENIOR`) — **source of truth** |
| Ты пишешь явно | «для senior» / «для миддлов» — если API недоступен |
| Контекст чата | «Fiber был для senior, lazy — для middle» |
| Содержание статьи | fallback, если API не отвечает |

**Автосинк:** `pnpm seed:sync-itlead -- <url|slug>` читает API и обновляет `level`, `difficulty`, `interview_weight` в `*.bank.json`.

Slug из URL: `https://itlead.org/interview-questions/react/react-hydration-and-ssr` → `react-hydration-and-ssr` → API `https://api.itlead.org/api/questions/react-hydration-and-ssr`.

## Таблица соответствий

| Целевой уровень | `questions.level` | `questions.difficulty` | `topics.interview_weight` | Checkpoint weights | Комментарий |
|-----------------|---------------------|------------------------|---------------------------|-------------------|-------------|
| **Junior** | `junior` | `basic` | **1 – 3** | больше `basic` (0.5–1.0), мало `advanced` | вводная / лёгкая тема в интервью |
| **Middle** | `middle` | `intermediate` | **3 – 6** | mix `basic` + `intermediate` (1.0–2.0) | стандартная рабочая тема |
| **Senior** | `senior` | `advanced` | **6 – 10** | больше `core_plus` / `advanced` (1.5–3.0) | ключевая тема для сильного кандидата |
| **Lead** (редко) | `lead` | `advanced` | **8 – 10** | как senior + system/design checkpoints | только если явно нужен lead-scope |

`interview_weight` — **не** то же самое, что checkpoint weight:

- **checkpoint weight** — внутри одного вопроса (какой критерий важнее в ответе);
- **interview_weight** — насколько тема влияет на **итоговый** `finalScore` интервью (weighted average).

## Примеры из проекта

| Тема | ITLead | Уровень | level / difficulty | interview_weight |
|------|--------|---------|-------------------|------------------|
| React Fiber & Virtual DOM | [fiber](https://itlead.org/interview-questions/react/react-fiber-and-virtual-dom-update-process) | **Senior** | `senior` / `advanced` | **8** |
| React Hydration & SSR | [hydration](https://itlead.org/interview-questions/react/react-hydration-and-ssr) | **Senior** (API) | `senior` / `advanced` | **7** |
| React.lazy & Suspense | [lazy](https://itlead.org/interview-questions/react/reactlazy-and-suspense-lazy-components-in-react) | **Middle** | `middle` / `intermediate` | **5** |

### Middle: React.lazy

- Базовые блоки статьи (lazy API, Suspense, code splitting, default export) → checkpoint **1.0** each.
- Pitfalls и production (lazy в render, ErrorBoundary, when to use) → **2.0** each.
- Design doc: [topics/react-lazy-suspense.md](./topics/react-lazy-suspense.md)

### Senior: React Fiber

- Определение Fiber, stack vs fiber, render/commit — ядро.
- Scheduler, lanes, ограничения commit — **тяжелее**, веса выше.
- Design doc: [topics/react-fiber.md](./topics/react-fiber.md)

## Workflow при новой ссылке

1. Открыть URL, прочитать статью.
2. Зафиксировать уровень (из сообщения или таблицы выше).
3. Создать `docs/question-bank/topics/<topic_code>.md` — в шапке **обязательно** `level` и `interview_weight`.
4. Разбить на checkpoints по [checkpoint-weight-rubric.md](./checkpoint-weight-rubric.md) с учётом уровня.
5. Seed SQL → `topics.interview_weight` + `questions.level` / `difficulty`.
6. Пересоздать interview (snapshot `topic_weight` immutable).
7. Browser QA: bad / casual / formal — в отчёте только **X/10**.

## QA-ориентиры по уровню (грубо)

| Профиль | Junior topic | Middle topic | Senior topic |
|---------|--------------|--------------|--------------|
| bad | 0 – 2 / 10 | 0 – 2 / 10 | 0 – 1.5 / 10 |
| casual strong | 4 – 6 | 5 – 7 | 4 – 6 |
| formal strong | 7 – 9 | 7 – 9 | 7 – 9.5 |

Senior тема **строже**: casual без глубины не должен получать высокий /10.
