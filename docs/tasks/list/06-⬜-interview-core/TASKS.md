# 06 — Ядро интервью Tasks

Overall status: ⬜ todo

---

## Subtasks

### TASK-06.1 — Схема сущности interview

Status: [ ] todo  
File:

```txt
subtasks/001-⬜-add-interview-entity-schema.md
```

Goal:

Добавить базовую схему interview-домена: таблицы `interviews` и `interview_questions` с привязкой к company и question bank.

---

### TASK-06.2 — Создание интервью рекрутером

Status: [ ] todo  
File:

```txt
subtasks/002-⬜-add-interview-creation.md
```

Goal:

Реализовать GraphQL mutation создания интервью с выбором списка вопросов из question bank и сохранением порядка.

---

### TASK-06.3 — Публичный токен интервью

Status: [ ] todo  
File:

```txt
subtasks/003-⬜-add-public-interview-token.md
```

Goal:

Добавить генерацию и валидацию `public_token` для кандидата: безопасный, уникальный, используемый в public API.

---

### TASK-06.4 — Выбор вопросов из банка

Status: [ ] todo  
File:

```txt
subtasks/004-⬜-add-question-selection-from-bank.md
```

Goal:

Сделать backend/frontend механизм выбора вопросов из question bank при создании интервью с фильтрами и предпросмотром.

---

### TASK-06.5 — Сущность кандидата

Status: [ ] todo  
File:

```txt
subtasks/005-⬜-add-candidate-entity.md
```

Goal:

Добавить сущность `candidates` для хранения данных участника интервью, связанного с конкретным interview и компанией.

---

### TASK-06.6 — Сущность попытки интервью

Status: [ ] todo  
File:

```txt
subtasks/006-⬜-add-interview-attempt-entity.md
```

Goal:

Добавить таблицу `interview_attempts` для трекинга прогресса прохождения: старт, текущий вопрос, статус завершения, тайминги.

---

### TASK-06.7 — Сущность transcript сообщений

Status: [ ] todo  
File:

```txt
subtasks/007-⬜-add-messages-transcript-entity.md
```

Goal:

Добавить таблицу `messages_transcript` для сохранения истории вопросов/ответов text interview в рамках `interview_attempt`.

---

### TASK-06.8 — Публичный flow кандидата

Status: [ ] todo  
File:

```txt
subtasks/008-⬜-add-candidate-public-flow.md
```

Goal:

Реализовать public GraphQL flow: кандидат открывает ссылку по token, вводит данные, стартует попытку и получает первый вопрос.

---

### TASK-06.9 — Text interview flow

Status: [ ] todo  
File:

```txt
subtasks/009-⬜-add-text-interview-flow.md
```

Goal:

Сделать основной текстовый сценарий: выдача текущего вопроса, отправка ответа кандидатом, переход к следующему вопросу с записью transcript.

---

### TASK-06.10 — Логика завершения интервью

Status: [ ] todo  
File:

```txt
subtasks/010-⬜-add-interview-completion-logic.md
```

Goal:

Добавить завершение interview attempt: явное `complete`, авто-завершение на последнем вопросе или по таймауту, фиксация итогового статуса и времени.

---

## Completion rule

Блок `06-⬜-interview-core` считается completed только когда все subtasks `06.1`–`06.10` имеют status `[x] done`; папка переименована в `05-✅-interview-core`.
