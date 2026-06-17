# Topic design docs

Один файл = одна тема question bank. Имя файла = `topics.code` (snake_case).

## Шаблон (копировать для новой ссылки)

```markdown
# <Human title>

- **topic_code:** `my_topic_code`
- **source:** <ITLead or other URL>
- **level:** middle | junior | senior | lead  ← см. [itlead-level-mapping.md](../itlead-level-mapping.md)
- **difficulty:** basic | intermediate | advanced  ← обычно пара к level
- **interview_weight:** 5  ← важность темы в finalScore (1–10)
- **question max_score:** 10.00
- **seed:** `backend/seeds/my-topic.seed.sql`
- **status:** draft | seeded | qa-done

## Вопрос

> Текст основного вопроса кандидату

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | ... | ... | 1.0 | basic | ... |
| 1 | ... | ... | 2.0 | intermediate | ... |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 6 – 8 | invite / maybe |
| formal strong | 8 – 9.5 | strong_invite / invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
```

## Правила

1. Сначала design doc, потом seed — не наоборот.
2. **Уровень темы** — из сообщения или [itlead-level-mapping.md](../itlead-level-mapping.md) (junior/middle/senior → level, difficulty, interview_weight).
3. Веса checkpoint согласовать с [checkpoint-weight-rubric.md](../checkpoint-weight-rubric.md).
4. После re-seed пересоздать interview (snapshot immutable).
5. В отчётах только **X/10**, не raw sum checkpoints.
