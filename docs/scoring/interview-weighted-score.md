# Interview weighted score model

## Overview

Each interview consists of one or more **topics** (sessions). Every topic is scored **0–10**. Topics differ in importance via **interview weight** (`weight`).

- **score** — how well the candidate answered the topic (0–10)
- **weight** — how important the topic is for the role (typically 1–10; default `1`)
- **weightedScore** — `score × weight` (useful for analytics)

## Final interview score

Weighted average across all evaluated topics in the attempt:

```txt
finalScore = sum(topic.score × topic.weight) / sum(topic.weight)
```

Rounded to one decimal: `Math.round(finalScore * 10) / 10`.

### Example

| Topic            | score | weight | weightedScore |
|------------------|-------|--------|---------------|
| HTML/CSS basics  | 8     | 2      | 16            |
| React            | 5     | 5      | 25            |
| TypeScript       | 9     | 3      | 27            |

```txt
finalScore = (16 + 25 + 27) / (2 + 5 + 3) = 6.8 / 10
```

## Strength category (3 levels)

Based on `finalScore` (0–10):

| Range   | Category |
|---------|----------|
| 0 – 4.9 | weak     |
| 5 – 7.4 | medium   |
| 7.5 – 10| strong   |

## Per-topic score (0–10)

For a single question in a topic:

```txt
topicScore = (earnedCheckpointScore / maxCheckpointScore) × 10
```

If multiple questions share the same topic name in one interview, their raw scores are combined first (`sum earned / sum max × 10`), then one weight applies to that topic group.

## Checkpoint weight vs topic weight

| Concept | Scope | Purpose |
|---------|-------|---------|
| **Checkpoint weight** | One question | Rubric: harder checkpoints count more inside the question (Σ ≈ 10 per question). See `docs/question-bank/checkpoint-weight-rubric.md`. |
| **Topic interview weight** | Whole interview | How much the topic affects **final** score (1–10). Stored on `topics.interview_weight`, snapshotted to `interview_questions.topic_weight`. |

## Storage

- `topics.interview_weight` — canonical weight in question bank
- `interview_questions.topic_weight` — immutable snapshot when interview is created
- `interview_final_evaluations.raw_response.deterministicScore` — full breakdown JSON (`topics`, `finalScore`, `totalWeight`, …)

## Defaults

- Missing `topic_weight` → `1`
- `totalWeight === 0` → `finalScore = 0`
