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
| SQL seeds | `backend/seeds/*.seed.sql` |

## Workflow для новой темы (по ссылке)

1. Определить **уровень** (junior / middle / senior) — явно из сообщения или по [itlead-level-mapping.md](./itlead-level-mapping.md).
2. Создать `docs/question-bank/topics/<topic_code>.md` по [шаблону](./topics/README.md).
3. Разбить материал на checkpoints, назначить **weight** по рубрике; `SUM(weight) = 10`.
4. В seed: `questions.level`, `questions.difficulty`, `topics.interview_weight`.
5. Написать/обновить `backend/seeds/<topic>.seed.sql` (utf8mb4).
6. Применить seed → создать interview → browser QA (bad / casual / formal).
7. В Completion Notes фиксировать только **X/10** из `finalEvaluationByAttempt.totalScore`.

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
