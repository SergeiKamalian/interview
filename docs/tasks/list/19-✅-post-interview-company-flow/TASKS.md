# 19 — Post-interview Company Flow Tasks

Overall status: ✅ done

---

## Wave 1 — Done

### TASK-19.1 — Company review queue

Status: [x] done  
File: `subtasks/001-✅-company-review-queue.md`

### TASK-19.2 — Candidate decision actions

Status: [x] done  
File: `subtasks/002-✅-candidate-decision-actions.md`

### TASK-19.3 — Separate candidate attempt review page

Status: [x] done  
File: `subtasks/003-✅-separate-candidate-attempt-review-page.md`

### TASK-19.4 — Candidate review UX redesign

Status: [x] done  
File: `subtasks/004-✅-candidate-review-ux-redesign.md`

### TASK-19.6 — Transcript dark mode fix + Russian review copy

Status: [x] done  
File: `subtasks/006-✅-transcript-dark-mode-fix.md`

### TASK-19.7 — Interview overview priority redesign

Status: [x] done  
File: `subtasks/007-✅-interview-overview-priority-redesign.md`

### TASK-19.8 — Interview details modal context

Status: [x] done  
File: `subtasks/008-✅-interview-details-modal-context.md`

### TASK-19.9 — AI candidate comparison advice

Status: [x] done  
File: `subtasks/009-✅-ai-candidate-comparison-advice.md`

---

## Wave 2 — Hiring operations (recommended order)

```txt
19.10 → 19.11 → 19.12 → 19.13 → 19.5 → 19.14 → 19.15 → 19.16 → 19.17 → 19.18
```

| # | Task | Суть |
|---|------|------|
| 19.10 | Company attempt review state | DB + API: просмотрено / согласен с ИИ / company decision |
| 19.11 | Interview candidates table upgrade | Пагинация, колонки, фильтры, checkbox, убрать Report |
| 19.12 | AI assessment verdict UI | Согласен / не согласен с оценкой ИИ |
| 19.13 | Shortlist + quick actions | Shortlist, reject, live, copy summary из таблицы |
| 19.5 | Report export / handoff | Экспорт **выбранных** строк |
| 19.14 | Multi-candidate compare (3+) | Сравнение финального пула |
| 19.15 | Team notes on attempts | Внутренние заметки команды |
| 19.16 | Shareable review link | Read-only ссылка для коллег |
| 19.17 | Candidate context panel | LinkedIn, история, talent pool hints |
| 19.18 | Decision audit history | Кто что решил и когда |

### TASK-19.10 — Company attempt review state

Status: [x] done  
File: `subtasks/010-✅-company-attempt-review-state.md`

### TASK-19.11 — Interview candidates table upgrade

Status: [x] done  
File: `subtasks/011-✅-interview-candidates-table-upgrade.md`

### TASK-19.12 — AI assessment verdict UI

Status: [x] done  
File: `subtasks/012-✅-ai-assessment-verdict-ui.md`

### TASK-19.13 — Shortlist + quick hiring actions

Status: [x] done  
File: `subtasks/013-✅-shortlist-quick-actions.md`

### TASK-19.5 — Report export / handoff prep

Status: [x] done  
File: `subtasks/005-✅-report-export-handoff-prep.md`

### TASK-19.14 — Multi-candidate compare (3+)

Status: [x] done  
File: `subtasks/014-✅-multi-candidate-compare.md`

### TASK-19.15 — Team notes on attempts

Status: [x] done  
File: `subtasks/015-✅-attempt-team-notes.md`

### TASK-19.16 — Shareable candidate review link

Status: [x] done  
File: `subtasks/016-✅-shareable-review-link.md`

### TASK-19.17 — Candidate context panel

Status: [x] done  
File: `subtasks/017-✅-candidate-context-panel.md`

### TASK-19.18 — Decision audit history

Status: [x] done  
File: `subtasks/018-✅-decision-audit-history.md`

---

## Completion Rule

Блок можно закрыть только когда:

- company user видит очередь завершённых attempts;
- по каждой попытке видны score / recommendation / achieved level / evaluation status;
- **понятно, кого уже смотрели и согласны ли с ИИ**;
- из очереди и страницы интервью можно принять hiring decision без лишних переходов;
- таблица кандидатов масштабируется (pagination) и поддерживает export выбранных;
- из очереди можно открыть attempt review (Report как отдельный deep-link — опционально, не обязателен в основном flow);
- поведение проверено через GraphQL smoke-check и frontend smoke-check.
