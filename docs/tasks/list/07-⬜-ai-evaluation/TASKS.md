# 07 — AI-оценка интервью Tasks

Overall status: ⬜ todo

---

## Subtasks

### TASK-07.1 — Конфигурация AI-провайдера

Status: [ ] todo  
File:

```txt
subtasks/001-⬜-add-ai-provider-config.md
```

Goal:

Добавить модуль конфигурации AI-провайдера (OpenAI/совместимый endpoint) с валидацией env и typed access для сервисов оценки.

---

### TASK-07.2 — Prompt для checkpoint-оценки

Status: [ ] todo  
File:

```txt
subtasks/002-⬜-add-evaluation-prompt-checkpoints.md
```

Goal:

Сформировать prompt pipeline для question-level оценки: модель получает вопрос, идеальный ответ и checkpoints из question bank и возвращает оценку по каждому checkpoint.

---

### TASK-07.3 — Структурированная JSON-схема ответа AI

Status: [ ] todo  
File:

```txt
subtasks/003-⬜-add-structured-json-schema.md
```

Goal:

Ввести строгую JSON Schema и runtime-валидацию ответа модели для checkpoint и финальной оценки с reject/repair стратегией при невалидном ответе.

---

### TASK-07.4 — Хранение оценки по вопросу

Status: [ ] todo  
File:

```txt
subtasks/004-⬜-add-question-evaluation-storage.md
```

Goal:

Создать таблицу и repository для хранения агрегированной AI-оценки конкретного ответа на вопрос интервью.

---

### TASK-07.5 — Хранение результата по checkpoint

Status: [ ] todo  
File:

```txt
subtasks/005-⬜-add-checkpoint-result-storage.md
```

Goal:

Добавить таблицу детальных checkpoint-результатов, чтобы хранить статус каждого критерия и evidence для explainability.

---

### TASK-07.6 — Хранение финальной оценки интервью

Status: [ ] todo  
File:

```txt
subtasks/006-⬜-add-final-evaluation-storage.md
```

Goal:

Сохранить итоговую AI-оценку по интервью: общий score, рекомендация, риски и summary для hiring manager.

---

### TASK-07.7 — Расчет score по категориям

Status: [ ] todo  
File:

```txt
subtasks/007-⬜-add-score-calculation.md
```

Goal:

Реализовать детерминированный scoring engine: агрегация checkpoint/question результатов в итоговый score интервью и category breakdown.

---

### TASK-07.8 — Логирование использования AI

Status: [ ] todo  
File:

```txt
subtasks/008-⬜-add-ai-usage-logging.md
```

Goal:

Добавить аудит AI-вызовов: провайдер, модель, токены, latency, estimated cost и связь с интервью для cost analytics.

---

### TASK-07.9 — Guardrails против AI-галлюцинаций

Status: [ ] todo  
File:

```txt
subtasks/009-⬜-add-ai-hallucination-guardrails.md
```

Goal:

Добавить защитные проверки, чтобы AI не придумывал критерии/факты: валидация источников, ограничение контекста и post-check перед записью.

---

## Completion rule

Блок `07-⬜-ai-evaluation` считается completed только когда все subtasks `07.1`–`07.9` имеют status `[x] done`; папка переименована в `06-✅-ai-evaluation`.
