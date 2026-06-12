# 10 — ATS-интеграции Tasks

Overall status: ⬜ todo

---

## Subtasks

### TASK-10.1 — Конфигурация webhook для ATS

Status: [ ] todo  
File:

```txt
subtasks/001-⬜-add-webhook-config.md
```

Goal:

Добавить хранение и валидацию webhook-конфигурации ATS (URL, secret, auth headers, enabled flag) на уровне компании.

---

### TASK-10.2 — Отправка результата при завершении интервью

Status: [ ] todo  
File:

```txt
subtasks/002-⬜-add-send-result-on-completion.md
```

Goal:

Реализовать автоматическую отправку результатов интервью в ATS после перехода интервью в статус `completed`.

---

### TASK-10.3 — Экспорт результатов в JSON

Status: [ ] todo  
File:

```txt
subtasks/003-⬜-add-export-json.md
```

Goal:

Добавить JSON-экспорт результата интервью в стабильном формате для API-клиентов и ручной передачи в ATS.

---

### TASK-10.4 — Экспорт результатов в CSV

Status: [ ] todo  
File:

```txt
subtasks/004-⬜-add-export-csv.md
```

Goal:

Добавить CSV-экспорт результатов интервью для HR-аналитики, отчётности и загрузки в legacy ATS.

---

### TASK-10.5 — Логи интеграционных отправок

Status: [ ] todo  
File:

```txt
subtasks/005-⬜-add-integration-logs.md
```

Goal:

Сделать аудит отправок в ATS: статусы попыток, response code, latency, error message и correlation id для диагностики.

---

### TASK-10.6 — Retry-механизм для ATS отправок

Status: [ ] todo  
File:

```txt
subtasks/006-⬜-add-retry-mechanism.md
```

Goal:

Добавить устойчивый retry для неуспешных отправок в ATS с backoff, лимитом попыток и dead-letter состоянием.

---

### TASK-10.7 — Базовый API-адаптер ATS

Status: [ ] todo  
File:

```txt
subtasks/007-⬜-add-basic-ats-api-adapter.md
```

Goal:

Ввести единый абстрактный слой ATS API adapter для стандартизации HTTP-запросов, auth и преобразования payload.

---

## Completion rule

Блок `10-⬜-ats-integrations` считается completed только когда все subtasks `10.1`–`10.7` имеют status `[x] done`; папка переименована в `09-✅-ats-integrations`.
