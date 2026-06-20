# 17 — Interview Evaluation Quality Tasks

Overall status: ✅ done (17.1–17.6 + 17.8 закрыты; 17.7 опциональный — отложен)

Один prompt = один subtask. Перед каждым subtask читать `README.md` этого блока (там доказательная база по attempt 102 и карта кода).

Зависимости — в каждом subtask-файле (`Depends on`). Рекомендуемый порядок — по номеру; 17.1 идёт первым (даёт максимальный эффект при минимальном риске).

Обязательная верификация любого фикса оценки:
- `pnpm -C backend build` + targeted eslint;
- прогон `golden-calibration.spec.ts`;
- регресс на attempt 102 (перепрогон оценки и сравнение «было/стало»; цель сильного senior — ≥ 8/10, strong, invite/strong_invite).

---

## Subtasks

### TASK-17.1 — Model routing per role

Status: [x] done
File: `subtasks/001-✅-model-routing-per-role.md`

### TASK-17.2 — Фикс ложных false_claim / accuracy=wrong (cap корректных ответов)

Status: [x] done
File: `subtasks/002-✅-fix-false-positive-accuracy-caps.md`

### TASK-17.3 — Probing depth vs знаменатель скоринга (не штрафовать неспрошенные чекпоинты)

Status: [x] done
File: `subtasks/003-✅-probing-depth-vs-scoring-denominator.md`

### TASK-17.4 — Достижимость `covered` + корректный подсчёт покрытия в финале

Status: [x] done
File: `subtasks/004-✅-covered-status-and-coverage-reporting.md`

### TASK-17.5 — Полный ответ в оценщик + честный evidence_summary

Status: [x] done
File: `subtasks/005-✅-full-answer-to-evaluator-and-evidence.md`

### TASK-17.6 — Калибровка: golden «сильный senior» + регресс attempt 102

Status: [x] done
File: `subtasks/006-✅-calibration-strong-senior-regression.md`

### TASK-17.7 — (Опционально) Разнести combined-turn (оценка ≠ follow-up)

Status: [ ] todo (опциональный — отложен, не требуется для закрытия блока)
File: `subtasks/007-⬜-optional-decouple-combined-turn.md`

### TASK-17.8 — Data hygiene + ревизия question_evaluations

Status: [x] done
File: `subtasks/008-✅-data-hygiene-and-question-evaluations.md`

---

## Completion Rule

Блок можно закрыть только когда:

- model routing работает (сильная модель на Evaluator + Final, дешёвая на Classifier/Voice), при отсутствии новых env — fallback на прежнюю модель без изменения поведения;
- корректные ответы больше не получают ложный `accuracy=wrong`/`false_claim`-cap;
- неспрошенные чекпоинты не топят балл (нормировка или гарантия probing must-have);
- `covered` достижим, финал не пишет ложное «0/N covered» и не заносит это в risks;
- оценщик получает полный текст ответа, `evidence_summary` отражает реально оценённый фрагмент;
- golden-калибровка зелёная + регресс attempt 102 показывает «сильный senior → ≥ 8/10, strong, invite/strong_invite».

> 17.7 — опциональный; не обязателен для закрытия блока, если 17.1–17.6 уже дают корректную калибровку.
