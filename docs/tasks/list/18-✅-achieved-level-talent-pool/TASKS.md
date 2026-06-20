# 18 — Achieved level + talent pool Tasks

Overall status: ✅ done (18.1–18.10 ✅; achieved level + talent pool по стеку + backfill + UX кнопка-счётчик/модалка)

Один prompt = один subtask. Перед каждым subtask читать `README.md` этого блока.

Зависимости указаны в каждом subtask-файле (поле `Depends on`). Рекомендуемый порядок — по номеру.

---

## Subtasks

### TASK-18.1 — Зафиксировать achieved-level design

Status: [x] done
File: `subtasks/001-✅-document-achieved-level-design.md`

### TASK-18.2 — Backend: util расчёта achievedLevel + тесты

Status: [x] done
File: `subtasks/002-✅-achieved-level-util.md`

### TASK-18.3 — DB migration: achieved_level на final_evaluations

Status: [x] done
File: `subtasks/003-✅-db-achieved-level-column.md`

### TASK-18.4 — Backend: считать и сохранять achievedLevel в final evaluation ✅

Status: [x] done
File: `subtasks/004-✅-persist-achieved-level.md`

### TASK-18.5 — API + отчёт: achievedLevel + per-level breakdown в GraphQL/UI ✅

Status: [x] done
File: `subtasks/005-✅-expose-achieved-level.md`

### TASK-18.6 — Backend: talent pool query (кандидаты с achievedLevel >= target) ✅

Status: [x] done
File: `subtasks/006-✅-talent-pool-query.md`

### TASK-18.7 — Frontend: блок «подходящие кандидаты» при создании интервью ✅

Status: [x] done
File: `subtasks/007-✅-talent-pool-ui.md`

### TASK-18.8 — Talent pool по стеку (профессия + skill-ранжирование + дедуп per stack) ✅

Status: [x] done
File: `subtasks/008-✅-talent-pool-by-stack.md`

### TASK-18.9 — Backfill achieved_level на старых завершённых попытках ✅

Status: [x] done
File: `subtasks/009-✅-backfill-achieved-level.md`

### TASK-18.10 — UI: кнопка-счётчик «подходящие из архива» + модалка со списком ✅

Status: [x] done
File: `subtasks/010-✅-talent-pool-button-modal.md`

---

## Completion Rule

Блок можно закрыть только когда:

- achievedLevel считается детерминированно (evidence + estimate), покрыт unit-тестами;
- значение сохраняется на завершённой попытке и не ломает существующий скоринг/golden;
- в отчёте HR видит `Target vs Demonstrated` + разбивку по уровням;
- при создании интервью на уровень X показываются прошлые кандидаты с `achievedLevel >= X`
  **той же профессии** (стек учитывается; фронтендер не предлагается на бэкенд);
- дедуп даёт «кандидат на стек»: один email может быть в пуле дважды на разные профессии;
- старые завершённые попытки имеют посчитанный `achieved_level` (backfill);
- в визарде talent pool показан компактной кнопкой-счётчиком «есть N подходящих из архива»,
  список открывается в модалке/панели;
- end-to-end smoke (GraphQL + UI) подтверждён.
