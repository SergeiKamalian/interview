# Question Bank — design docs

Source of truth для вопросов, checkpoints и **весов по сложности**.

```txt
ITLead / статья → topic design doc → seed SQL → interview snapshot → оценка /10
```

## Где что лежит

| Что | Где |
|-----|-----|
| Шкала весов (0.5 … 3) | [checkpoint-weight-rubric.md](./checkpoint-weight-rubric.md) |
| ITLead → level / interview_weight | [itlead-level-mapping.md](./itlead-level-mapping.md) |
| Дизайн конкретной темы | [topics/](./topics/) |
| DDL и поля БД | [../database/schemas/question-bank.md](../database/schemas/question-bank.md) |
| SQL seeds (legacy) | `backend/seeds/*.seed.sql` |
| JSON bank (новые темы) | `backend/seeds/topics/*.bank.json` |
| ITLead manifest | `backend/seeds/itlead-topics.manifest.json` |
| ITLead grid (каталог) | `backend/seeds/itlead-questions.grid.json` |
| ITLead worklist (лист импорта) | `backend/seeds/itlead-import.worklist.json` |
| **Промпт для Cursor (один файл)** | [ITLEAD_AGENT_PROMPT.md](./ITLEAD_AGENT_PROMPT.md) |
| Playbook (подробности) | [itlead-import-playbook.md](./itlead-import-playbook.md) |

## Workflow для новой темы (по ссылке ITLead)

1. Определить **уровень** (junior / middle / senior) — явно из сообщения или по [itlead-level-mapping.md](./itlead-level-mapping.md).
2. Добавить URL в `backend/seeds/itlead-topics.manifest.json` (`status: draft`).
3. Создать `docs/question-bank/topics/<topic_code>.md` по [шаблону](./topics/README.md).
4. Разбить материал на checkpoints, назначить **weight** по рубрике; `SUM(weight) = 10`.
5. Создать `backend/seeds/topics/<topic_code>.bank.json` — checkpoints, `evaluationHints`, examples (см. [seeds/topics/README.md](../../backend/seeds/topics/README.md)).
6. Manifest → `status: ready` → `cd backend && pnpm seed:topic -- <topic_code>` (или `pnpm seed:topic -- --all`).
7. Пересоздать interview → browser QA (bad / casual / formal).
8. В Completion Notes фиксировать только **X/10** из `finalEvaluationByAttempt.totalScore`.

**Legacy:** Fiber и lazy пока в `.seed.sql`; новые темы — через JSON + `seed:topic`.

**Browser QA waits:** не `sleep 40` сразу — поллинг **10 с → snapshot → ещё 10 с** если UI не готов (кнопка, textarea, /complete).

## Итоговый score

### По одному вопросу (checkpoint weights)

Всегда **0–10**:

```txt
questionScore = (Σ score_awarded / Σ checkpoint.weight) × 10
```

`checkpoint.weight` = колонка `question_checkpoints.score` в БД. См. [checkpoint-weight-rubric.md](./checkpoint-weight-rubric.md).

### По всему интервью (topic interview weights)

Итог интервью — **взвешенное среднее** по темам:

```txt
finalScore = Σ(topicScore × topicWeight) / Σ(topicWeight)
```

- `topics.interview_weight` — важность темы (1–10, default 1)
- Снапшот в `interview_questions.topic_weight` при создании интервью
- Подробнее: [../scoring/interview-weighted-score.md](../scoring/interview-weighted-score.md)
