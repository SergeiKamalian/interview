# ITLead topic bank files

Каталог всех вопросов: `pnpm seed:fetch-itlead-grid` → `itlead-import.worklist.json`.

Playbook для агента: [docs/question-bank/itlead-import-playbook.md](../../docs/question-bank/itlead-import-playbook.md).

## Workflow

```txt
grid API (slug list) → detail API (content) → design doc → *.bank.json → pnpm seed:topic
```

1. Добавь URL в `backend/seeds/itlead-topics.manifest.json` (`status: draft`).
2. Создай `docs/question-bank/topics/<topic_code>.md` по [шаблону](./topics/README.md).
3. Разбить материал на checkpoints, назначить **weight** по рубрике; `SUM(weight) = 10`.
4. Создать `backend/seeds/topics/<topic_code>.bank.json` — checkpoints, `evaluationHints`, examples.
5. **Синк уровня из API:** `pnpm seed:sync-itlead -- <url>` → `difficulty` из `api.itlead.org`.
6. Manifest → `status: ready` → `pnpm seed:topic -- <topic_code>`.

```bash
cd backend
pnpm seed:sync-itlead -- https://itlead.org/interview-questions/react/react-hydration-and-ssr
pnpm seed:topic -- react_hydration_ssr
# или все ready из manifest:
pnpm seed:topic -- --all
```

6. Пересоздай interview (snapshot immutable).
7. Browser QA: bad / casual / formal.

## Язык и кодировка

- Все тексты в `*.bank.json` — **на русском** (перевод с ITLead EN). Идентификаторы (`topic.code`, `checkpoint_key`) — латиница.
- Файл сохранять в **UTF-8**. `pnpm seed:topic` читает UTF-8 и пишет в MySQL `utf8mb4`.

## Формат `*.bank.json`

| Поле | Описание |
|------|----------|
| `topic.code` | `topics.code` в БД (snake_case) |
| `topic.interviewWeight` | `topics.interview_weight` (1–10) |
| `question.level` / `difficulty` | см. [itlead-level-mapping.md](../../docs/question-bank/itlead-level-mapping.md) |
| `checkpoints[].score` | **Σ = 10.00** |
| `checkpoints[].evaluationHints` | тот же JSON, что в `question_checkpoints.evaluation_hints` |
| `examples[]` | `checkpointKey: null` = question-level; иначе per-checkpoint |

Скрипт **удаляет и пересоздаёт** вопрос темы (idempotent re-seed), затем backfill `interview_question_checkpoints` / `interview_answer_examples` для существующих interviews.

## Почему JSON, а не один MD

- MD хорош для design doc и обсуждения.
- Checkpoints, `mustConcepts`, `falseClaims`, per-checkpoint examples — структурированные данные; JSON проще валидировать и заливать без SQL-ошибок.
- Manifest связывает URL ↔ файл ↔ статус (`draft` → `ready` → `seeded`).

Legacy темы (Fiber, lazy) пока в `.seed.sql` — в manifest помечены `legacy-sql`.

## Образец

См. `react-hydration-ssr.bank.json` — **senior**-тема с hints, probe groups и per-checkpoint examples.

Для **senior** тем уровня Fiber расширяй:

- `probeConceptGroups`, `impliesCheckpointFloors`
- больше `examples` с `checkpointKey` (good formal + good casual + bad)
- `confusionPairs` где темы путают (Suspense vs ErrorBoundary и т.д.)
