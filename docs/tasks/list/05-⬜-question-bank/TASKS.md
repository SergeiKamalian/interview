# 05 — Банк вопросов Tasks

Overall status: ⬜ todo

---

## Subtasks

### TASK-05.1 — Схема БД для question bank

Status: [ ] todo  
File:

```txt
subtasks/001-⬜-add-question-bank-database-schema.md
```

Goal:

Спроектировать таблицы вопросника: `question_categories`, `questions`, `question_checkpoints`, `question_answer_examples` с привязкой к company.

---

### TASK-05.2 — SQL-миграции question bank

Status: [ ] todo  
File:

```txt
subtasks/002-⬜-add-question-bank-sql-migrations.md
```

Goal:

Создать и применить raw SQL миграции для question bank таблиц и индексов с идемпотентным поведением.

---

### TASK-05.3 — GraphQL API банка вопросов

Status: [ ] todo  
File:

```txt
subtasks/003-⬜-add-question-bank-graphql-api.md
```

Goal:

Добавить GraphQL типы и resolver-операции для чтения списка вопросов, детальной карточки и базовых mutation операций.

---

### TASK-05.4 — CRUD-сервисы банка вопросов

Status: [ ] todo  
File:

```txt
subtasks/004-⬜-add-question-bank-crud-services.md
```

Goal:

Реализовать backend service/repository слой для CRUD операций над question bank с транзакциями для checkpoints/examples.

---

### TASK-05.5 — Seed-данные вопросов для frontend

Status: [ ] todo  
File:

```txt
subtasks/005-⬜-seed-frontend-questions.md
```

Goal:

Добавить набор seed-вопросов для локальной разработки, чтобы frontend мог сразу отображать question bank без ручного ввода.

---

### TASK-05.6 — Валидация question bank правил

Status: [ ] todo  
File:

```txt
subtasks/006-⬜-add-question-bank-validation-rules.md
```

Goal:

Добавить backend-валидацию данных вопроса: диапазоны весов checkpoint, ограничения длины текстов и целостность good/bad examples.

---

### TASK-05.7 — Admin UI placeholders для банка

Status: [ ] todo  
File:

```txt
subtasks/007-⬜-add-question-bank-admin-ui-placeholders.md
```

Goal:

Сделать в dashboard базовые заглушки UI для раздела question bank: список, фильтры, кнопка создания, пустые состояния.

---

### TASK-05.8 — Поддержка весов checkpoint

Status: [ ] todo  
File:

```txt
subtasks/008-⬜-add-checkpoint-weights.md
```

Goal:

Добавить явную поддержку весов checkpoint в API и UI, чтобы каждый вопрос имел прозрачную структуру оценивания.

---

### TASK-05.9 — Примеры хороших и плохих ответов

Status: [ ] todo  
File:

```txt
subtasks/009-⬜-add-good-bad-answer-examples.md
```

Goal:

Добавить хранение и выдачу good/bad answer examples для каждого вопроса, чтобы использовать их как reference в интервью и AI оценке.

---

## Completion rule

Блок `05-⬜-question-bank` считается completed только когда все subtasks `05.1`–`05.9` имеют status `[x] done`; папка переименована в `04-✅-question-bank`.
