# Interview #32 — сценарии прохождения для browser-агентов

> **Публичная ссылка:** http://localhost:5174/i/f696f6ec-e4c4-4d3d-b248-1e68d4f7de72  
> **Interview ID:** 32 · **Public token:** `f696f6ec-e4c4-4d3d-b248-1e68d4f7de72`

Документ для запуска **нового Cursor-агента с browser MCP**: открыть ссылку, пройти интервью как кандидат по выбранному кейсу.

---

## Профиль интервью

| Поле | Значение |
|------|----------|
| Название | Тестинг |
| Роль | Фронт |
| Целевой уровень | **middle** |
| Язык | **ru** |
| Вопросов | **10** (по 10 баллов каждый) |
| Статус | active |
| AI tone | neutral |
| Probing depth | balanced |
| Scoring strictness | balanced |
| Retake | запрещён (`allow_retake = 0`) |
| Welcome template | дефолтный (генерируется AI) |
| Аудио/видео | текстовый режим (поле ввода + «Отправить ответ») |

**Тон интервью:** нейтральный технический собес. На **каждый** из 10 вопросов — двухшаговый диалог:

1. **Topic opener** — короткий разогрев: «Давайте поговорим про … Вы с этим уже сталкивались?» / «Готовы начать с темы …?» (не банковый вопрос дословно).
2. **Основной ответ** — после вашей реплики на opener AI приглашает объяснить тему («Расскажите, как вы это понимаете» и т.п.) — вот тут уже содержательный технический ответ.
3. **Follow-up** (опционально) — если ответ слабый: «Да, в целом верно. Уточните …» / «Частично верно …».

**Важно для агентов:** на один «логический» вопрос из таблицы ниже часто нужно **2 отправки** — сначала коротко на opener, потом развёрнуто на main. Не путать opener с полным техническим ответом.

Ответы оцениваются по **checkpoints** из question bank.

**Conduct moderation:** нецензурная лексика / прямой мат → **1-е нарушение = предупреждение**, **2-е = досрочное завершение**. Паттерны: `нахуй`, `пошёл нахуй`, `fuck you`, `иди в жопу` и т.д. (`CandidateConductGuardService`).

---

## Список вопросов (порядок фиксирован)

| # | Тема | Вопрос |
|---|------|--------|
| 1 | var / let / const | Чем отличаются var, let и const в JavaScript? |
| 2 | Call stack | Что такое call stack в JavaScript и как он работает? |
| 3 | Event Loop | Как работает Event Loop и чем microtasks отличаются от macrotasks? |
| 4 | CSS specificity | Что такое специфичность CSS-селекторов и как браузер выбирает правило? |
| 5 | CSS Grid | Как работает CSS Grid и когда использовать вместо Flexbox? |
| 6 | React render + hooks | Порядок рендеринга компонентов и почему нельзя менять порядок хуков? |
| 7 | Controlled vs uncontrolled | Разница контролируемых и неконтролируемых компонентов в формах? |
| 8 | Error boundaries | Что такое error boundaries и как работают? |
| 9 | CSR / SSR / SSG / ISR | Разница стратегий рендеринга и когда что выбирать? |
| 10 | Next.js deploy | Как развернуть Next.js в production, варианты деплоя? |

Каждый вопрос имеет 6–7 checkpoints (scope, hoisting, LIFO, micro vs macro, (A,B,C,D), grid vs flex, Rules of Hooks, value/onChange, getDerivedStateFromError, SSG vs SSR, standalone Docker и т.д.). Полные ideal answers — в БД (`interview_questions` + `interview_question_checkpoints` для `interview_id = 32`).

---

## Как агенту проходить UI (обязательно)

### Шаг 0 — подготовка

- Использовать **уникальный email** на каждый прогон: `{case-slug}-{unix-ts}@agent.test`  
  (уникальный индекс `uq_candidates_interview_email` на пару `interview_id + email`).
- Frontend: `http://localhost:5174`, backend GraphQL: `http://localhost:3000/graphql`.
- **Не отправлять ответ**, пока виден спиннер / statusLabel («AI думает…», «Оцениваем ответ…» и т.п.).

### Шаг 1 — старт

1. Открыть http://localhost:5174/i/f696f6ec-e4c4-4d3d-b248-1e68d4f7de72
2. Заполнить **Имя и фамилия** и **Email**
3. Нажать **«Начать интервью»** → редирект на `/i/{token}/session?attemptId=...`
4. Дождаться экрана **«Добро пожаловать»** с текстом приветствия
5. Нажать **«Начать интервью»** на welcome-карточке

### Шаг 2 — цикл ответов (на каждый из 10 вопросов)

1. Дождаться **topic opener** от AI (короткий вопрос про знакомство с темой)
2. Ответить **кратко** (1–2 предложения): «Да, работал», «Слышал, но мало», «Не сталкивался, но попробую» — по сценарию кейса
3. Дождаться **приглашения объяснить** от AI (продолжение после opener)
4. Отправить **основной технический ответ** в «Введите ответ…» → **«Отправить ответ»**
5. При необходимости — **follow-up** (ещё одна реплика на уточняющий вопрос AI)
6. Ждать оценку (10–60 с) → следующий вопрос или завершение
7. Повторять шаги 1–6 для всех 10 тем

Типы сообщений в чате: topic opener (часто без отдельного label), «Основной вопрос», «Уточняющий вопрос».

### Досрочное завершение (кнопка)

- **«Завершить интервью»** → диалог → **«Да, завершить»** — статус `abandoned` / incomplete evaluation.

### Признаки конца

- Редирект на `/i/{token}/complete?attemptId=...`
- Сообщение AI с kind `conduct_terminated`
- Кнопка **«Перейти к завершению»**

---

## Кейсы прохождения

Копируй **весь блок «Промпт для агента»** в новый чат с browser MCP.

**Topic opener есть во всех 10 кейсах** — это не отдельный кейс, а обязательный шаг flow. Ниже — как отвечать на opener в каждом сценарии.

| # | Ответ на topic opener («знакомы / готовы?») |
|---|---------------------------------------------|
| 1 | «Да, активно использую в проде» → потом senior-разбор |
| 2 | Можно игнорировать вежливость — сразу мат **на первом substantive слоте** (см. промпт) |
| 3 | «Да, но…» → на main уже просьба закончить |
| 4 | «Да, конечно, знаю отлично» → потом неверный разбор |
| 5 | «Да, на проектах встречал» → middle-ответ |
| 6 | «Только слышал» / «Маловато, но попробую» → shallow |
| 7 | «Да» → 2 нормальных main, потом abandon |
| 8 | «Да, интересная тема» → off-topic main |
| 9 | На opener тоже meta: «Вы про браузер или Node?» → потом main |
| 10 | «Да» на Q1–Q2 → на Q2 main с матом |

---

### Кейс 1 — Strong Senior (цель: высокий балл, пройти все 10)

**Кандидат:** Алексей Сильный · `alexey.senior.case1-{ts}@agent.test`

**Ожидаемый результат:** completed, сильные оценки, минимум follow-up, achieved level ≥ middle (возможно senior).

<details>
<summary>Промпт для агента</summary>

```
Ты кандидат на техническое интервью (frontend, middle track). Открой:
http://localhost:5174/i/f696f6ec-e4c4-4d3d-b248-1e68d4f7de72

Имя: Алексей Сильный
Email: alexey.senior.case1-{timestamp}@agent.test

Правила поведения:
- Веди себя как уверенный senior frontend: профессионально, по-русски, без воды.
- Жди каждый вопрос AI в UI. Не отправляй ответ, пока есть спиннер/статус загрузки.
- На topic opener и основной вопрос отвечай развёрнуто (5–12 предложений), с терминами и примерами.
- Если AI задаёт уточняющий follow-up — дополняй конкретикой, не повторяй первый ответ дословно.
- Не используй мат и грубость.

Шпаргалка по темам (сжато, раскрывай своими словами):

Q1 var/let/const: function vs block scope; hoisting var→undefined vs let/const TDZ ReferenceError; const no reassignment but mutable objects; var в for+setTimeout → 3,3,3 vs let → 0,1,2; const по умолчанию.

Q2 Call stack: LIFO push/pop frames; один стек, один sync path; stack overflow RangeError; sync loop блокирует UI; event loop когда стек пуст; async/await снимает frame, продолжение в microtask.

Q3 Event Loop: sync → drain all microtasks → one macrotask → repeat; Promise.then before setTimeout(0); microtasks starve render если рекурсия; await = microtask.

Q4 Specificity: (A,B,C,D) inline/ID/class/element; сравнение слева направо; tie → later rule; !important отдельный слой; * и комбинаторы = 0.

Q5 Grid: 2D tracks+areas; Flex 1D; repeat/minmax/fr; auto-fill vs auto-fit; grid для page layout, flex внутри ячеек.

Q6 React: depth-first render Parent→children→siblings; hooks linked list by call order; never conditional hooks; useLayoutEffect before paint, useEffect after; custom hooks same rules.

Q7 Forms: controlled value+onChange state source of truth; uncontrolled defaultValue+ref; file input always uncontrolled; can't switch modes.

Q8 Error boundaries: class only getDerivedStateFromError + componentDidCatch; catch render/lifecycle not events/async/SSR; react-error-boundary for FC.

Q9 CSR empty shell bad SEO; SSR per-request+hydration; SSG build-time CDN; ISR revalidate stale-while-revalidate; pick by data freshness + SEO.

Q10 Deploy: Vercel hybrid SSG edge + SSR lambdas; Docker output standalone server.js HOSTNAME=0.0.0.0; static export no SSR/API; Edge no fs.

Пройди интервью до страницы complete. В конце сообщи attemptId из URL.
```

</details>

---

### Кейс 2 — Послать нахуй (conduct → warn → terminate)

**Кандидат:** Вася Хам · `vasya.rude.case2-{ts}@agent.test`

**Ожидаемый результат:** 1-й ответ с матом → AI «Предупреждение» (`conduct_warning`); 2-й мат → `conduct_terminated`, интервью закрыто.

<details>
<summary>Промпт для агента</summary>

```
Открой http://localhost:5174/i/f696f6ec-e4c4-4d3d-b248-1e68d4f7de72

Имя: Вася Хам
Email: vasya.rude.case2-{timestamp}@agent.test

Сценарий conduct moderation:
1. Пройди welcome и дождись первого вопроса.
2. На первом же ответе отправь ТОЛЬКО: «Иди нахуй, не буду отвечать на ваши тупые вопросы»
3. Дождись предупреждения от AI (жёлтый блок «Предупреждение»).
4. На повторном ответе (тот же или следующий вопрос) отправь: «Пошёл нахуй, заебали»
5. Дождись сообщения «Интервью завершено» / conduct_terminated.
6. Зафиксируй: был ли warn, был ли terminate, attemptId.

Не используй кнопку «Завершить интервью» — только conduct flow.
```

</details>

---

### Кейс 3 — Просить не продолжать (отказ / decline)

**Кандидат:** Марина Устала · `marina.quit.case3-{ts}@agent.test`

**Ожидаемый результат:** классификатор `decline_whole` / `topic_refusal`; низкие баллы; возможен early complete через UI или AI закрывает тему без probe.

<details>
<summary>Промпт для агента</summary>

```
Открой http://localhost:5174/i/f696f6ec-e4c4-4d3d-b248-1e68d4f7de72

Имя: Марина Устала
Email: marina.quit.case3-{timestamp}@agent.test

Сценарий:
- Тон: вежливый, но усталый. Без мата.
- На welcome начни нормально.
- На первом вопросе: «Извините, я не могу продолжать интервью сегодня, можно закончить? У меня форс-мажор.»
- Если AI всё равно задаёт вопрос — на каждый следующий: «Я уже просила прекратить. Не хочу продолжать, давайте закончим.»
- Если через 2–3 таких ответа UI всё ещё активен — нажми «Завершить интервью» → «Да, завершить».
- Зафиксируй: как AI реагировал, досрочно ли завершилось, attemptId.
```

</details>

---

### Кейс 4 — Много ошибок (weak / wrong answers)

**Кандидат:** Игорь Ошибкин · `igor.wrong.case4-{ts}@agent.test`

**Ожидаемый результат:** completed (если дойдёт), низкий totalScore, много follow-up, `needsManualReview` возможен.

<details>
<summary>Промпт для агента</summary>

```
Открой http://localhost:5174/i/f696f6ec-e4c4-4d3d-b248-1e68d4f7de72

Имя: Игорь Ошибкин
Email: Igor.wrong.case4-{timestamp}@agent.test

Сценарий: отвечай уверенно, но ТЕХНИЧЕСКИ НЕВЕРНО. Не признавай ошибок. На follow-up удваивай уверенность в неверном.

Примеры ответов (адаптируй под текущий вопрос):
- var/let/const: «var и let блочные, const глобальный, hoisting нет ни у кого»
- call stack: «стек FIFO, несколько потоков параллельно, setTimeout выполняется сразу»
- event loop: «microtasks и macrotasks одна очередь, Promise после setTimeout всегда»
- CSS specificity: «побеждает правило выше в файле, ID не важнее класса»
- Grid: «Grid одномерный как flex, fr это padding»
- React hooks: «можно вызывать useState в if, порядок не важен»
- controlled: «uncontrolled = value+onChange, controlled = ref»
- error boundaries: «работают в functional components через useErrorBoundary встроенный в React»
- CSR/SSR: «CSR лучше для SEO, SSR не нужен никогда»
- Next deploy: «npm start на localhost достаточно для production»

Пройди все 10 вопросов если AI не остановит. Зафиксируй итоговый score если виден на complete.
```

</details>

---

### Кейс 5 — Middle (нормальный middle, без senior-глубины)

**Кандидат:** Дмитрий Мидл · `dima.middle.case5-{ts}@agent.test`

**Ожидаемый результат:** completed, средний/хороший балл, умеренные follow-up.

<details>
<summary>Промпт для агента</summary>

```
Открой http://localhost:5174/i/f696f6ec-e4c4-4d3d-b248-1e68d4f7de72

Имя: Дмитрий Мидл
Email: dima.middle.case5-{timestamp}@agent.test

Ты middle frontend 2–3 года. Отвечай 3–6 предложений, по делу, без senior edge cases.
Покрывай основную идею каждого вопроса, но не углубляйся в Node v10, PPR, subgrid, stale-while-revalidate детали.

Примеры уровня:
- var block scope у let, var function scope; const нельзя переприсвоить
- call stack LIFO, переполнение при рекурсии
- microtasks (Promise) раньше macrotask (setTimeout)
- specificity ID > class > element
- Grid 2D, Flex 1D
- hooks always same order top-level
- controlled = state drives input
- error boundary ловит ошибки render в children
- SSG статика, SSR на запрос, CSR в браузере
- Vercel для Next или Docker standalone

Профессиональный тон. Пройди до complete.
```

</details>

---

### Кейс 6 — Junior (поверхностно, «слышал, но не знаю»)

**Кандидат:** Анна Джун · `anna.junior.case6-{ts}@agent.test`

**Ожидаемый результат:** completed или много partial/missed checkpoints, низкий score.

<details>
<summary>Промпт для агента</summary>

```
Открой http://localhost:5174/i/f696f6ec-e4c4-4d3d-b248-1e68d4f7de72

Имя: Анна Джун
Email: anna.junior.case6-{timestamp}@agent.test

Ты junior, 6 месяцев опыта. Ответы 1–3 предложения, часто неуверенно:
«Наверное…», «Точно не помню, но…», «Мы на проекте не использовали»

Не выдумывай детали. Если не знаешь — так и скажи, но попробуй хоть что-то:
- «const и let новые, var старый»
- «call stack — куда функции попадают»
- «event loop — как JS асинхронность делает, что-то с Promise»
- «специфичность — какой селектор сильнее»
- «grid — сетка, flex — строка»
- «хуки нельзя в if, кажется»
- «controlled — React управляет input»
- «error boundary — ловит ошибки, видела в туториале»
- «SSR на сервере, CSR в браузере»
- «Next можно на Vercel залить»

Вежливо. Дойди до конца.
```

</details>

---

### Кейс 7 — Досрочный exit через UI (abandon)

**Кандидат:** Пётр Выход · `petya.abandon.case7-{ts}@agent.test`

**Ожидаемый результат:** status `abandoned`, ответов < 10.

<details>
<summary>Промпт для агента</summary>

```
Открой http://localhost:5174/i/f696f6ec-e4c4-4d3d-b248-1e68d4f7de72

Имя: Пётр Выход
Email: petya.abandon.case7-{timestamp}@agent.test

1. Ответь нормально на 2 первых вопроса (кратко, middle уровень).
2. На 3-м вопросе нажми «Завершить интервью» → подтверди «Да, завершить».
3. Проверь редирект на /complete и что интервью не прошло все 10 вопросов.
```

</details>

---

### Кейс 8 — Off-topic / не по теме

**Кандидат:** Олег Болтун · `oleg.offtopic.case8-{ts}@agent.test`

**Ожидаемый результат:** turn_kind `off_topic`, низкие scores, возможны follow-up «вернёмся к вопросу».

<details>
<summary>Промпт для агента</summary>

```
Открой http://localhost:5174/i/f696f6ec-e4c4-4d3d-b248-1e68d4f7de72

Имя: Олег Болтун
Email: oleg.offtopic.case8-{timestamp}@agent.test

На каждый технический вопрос отвечай развёрнуто, но про ДРУГУЮ тему (не связанную с вопросом):
- вместо JS — про SQL индексы
- вместо CSS — про Kubernetes pods
- вместо React — про Python Django ORM
- вместо Next — про nginx reverse proxy

Тон дружелюбный, без грубости. Пройди минимум 5 вопросов.
```

</details>

---

### Кейс 9 — Meta / уточнения вместо ответов

**Кандидат:** Светлана Уточняет · `sveta.meta.case9-{ts}@agent.test`

**Ожидаемый результат:** `scope_clarification` / `format_clarification`, мало substantive content, follow-up от AI.

<details>
<summary>Промпт для агента</summary>

```
Открой http://localhost:5174/i/f696f6ec-e4c4-4d3d-b248-1e68d4f7de72

Имя: Светлана Уточняет
Email: sveta.meta.case9-{timestamp}@agent.test

Не давай содержательных ответов первые 2–3 реплики на каждый вопрос. Только мета:
- «Вы про браузер или Node.js имеете в виду?»
- «Нужен краткий ответ или с примерами кода?»
- «Можете переформулировать вопрос?»
- «Вы про React 17 или 18?»

После 2–3 уточнений на вопрос — дай нормальный короткий middle-ответ и переходи дальше.
```

</details>

---

### Кейс 10 — Mixed: хорошо → грубость → извинение

**Кандидат:** Сергей Срыв · `sergey.mixed.case10-{ts}@agent.test`

**Ожидаемый результат:** 1–2 хороших ответа, conduct warn, дальше профессиональное продолжение без второго нарушения.

<details>
<summary>Промпт для агента</summary>

```
Открой http://localhost:5174/i/f696f6ec-e4c4-4d3d-b248-1e68d4f7de72

Имя: Сергей Срыв
Email: sergey.mixed.case10-{timestamp}@agent.test

1. Ответь хорошо на Q1 (var/let/const) — middle+ уровень.
2. На Q2 сорвись: «Да блять, опять про стек… ладно, LIFO, push pop» (одно нарушение).
3. Дождись conduct warning. Извинись: «Извините, продолжу профессионально».
4. Дальше только вежливые middle-ответы до complete. НЕ матерись второй раз.
5. Проверь что интервью НЕ terminated после одного warn.
```

</details>

---

## Быстрый чеклист агента

- [ ] Уникальный email
- [ ] Дождался welcome → «Начать интервью»
- [ ] Не спамил submit во время спиннера
- [ ] Ответил по сценарию кейса
- [ ] Записал `attemptId` из URL (`?attemptId=...`)
- [ ] Проверил финальный статус (completed / abandoned / conduct_terminated)

## Проверка результата в dashboard

После прогона: http://localhost:5174/dashboard/interviews/32 — кандидат по email должен появиться в списке с ожидаемым статусом и score.

SQL для отладки:

```sql
SELECT c.id, c.full_name, c.email, a.id AS attempt_id, a.status, a.completed_at
FROM candidates c
JOIN interview_attempts a ON a.candidate_id = c.id
WHERE c.interview_id = 32
ORDER BY c.created_at DESC
LIMIT 20;
```

## Очистка тестовых кандидатов

```sql
DELETE FROM candidates WHERE interview_id = 32 AND email LIKE '%@agent.test';
```

(каскадно удалит attempts и связанные данные)
