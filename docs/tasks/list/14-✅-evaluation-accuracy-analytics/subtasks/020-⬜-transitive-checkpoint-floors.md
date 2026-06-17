# TASK-14.20 — Transitive checkpoint floors («20123×324 → 2×4»)

## Status

- [ ] todo

## Контекст (прочитать агенту первым делом)

### Проблема / идея

Если кандидат **глубоко и правильно** закрыл **сложный** checkpoint, высока вероятность, что он знает **более простые связанные** checkpoints — но **не обязательно** на 100%.

**Аналогия:**

```txt
Знает:  20123 × 324  →  скорее знает  →  2 × 4
Знает:  scheduling (MessageChannel, shouldYield)  →  скорее понимает  →  fiber_definition, lanes_priority
```

**Неправильно:**

```txt
scheduling covered  →  auto 1.0 на все остальные checkpoints  ❌
```

**Правильно:**

```txt
scheduling score 0.85+ (probed, closed)  →  floor 0.5 на lanes_priority  ✓
                                       →  floor 0.55 на fiber_definition  ✓
                                       →  НЕ auto-covered render_phase  ✓
```

Обратный случай **тоже возможен** (зазубрил scheduler, не понимает базу) — поэтому только **floor**, не covered.

### Реальный контекст из интервью

**Attempt #77:**

- `lanes_priority` = **0.85** (useTransition, useDeferredValue) — сам доказал
- `scheduling` = **0.25** (shallow, без probe) — **transitive НЕ применять** (источник weak)
- `render_phase` = **1.0** — strong

Если бы после **14.18+19** scheduling стал **0.85 probed closed**:

- `lanes_priority` мог бы получить **floor 0.5** без второго копания (overlap concepts)
- `fiber_definition` — floor **0.55**, follow-up optional skip

### Что уже есть

- `getPositiveEvidenceScoreFloor` — mustConcepts из **собственного** answer text
- `requiredConceptGroups` — **14.17**, paraphrase groups в **том же** checkpoint
- Weight sort в follow-up policy
- **Нет** cross-checkpoint inference

---

## Goal

Bank-driven **transitive floors**: когда checkpoint **A** закрыт с высоким score, checkpoints **B** из списка `impliesCheckpointFloors` получают **минимальный score floor**, если их текущий score ниже.

Вся семантика связей — **в question bank** (`evaluation_hints`), код generic один раз.

---

## Scope

### A. Bank schema extension

Добавить в `CheckpointEvaluationHints` (JSON, без migration):

```typescript
/** When THIS checkpoint is closed strong, raise floors elsewhere. */
impliesCheckpointFloors?: Array<{
  /** Target checkpoint_key in same question. */
  checkpointKey: string;
  /** Min fraction of TARGET max_score (0..1). */
  floorFraction: number;
  /** Source must reach this fraction of ITS max_score to trigger. */
  minSourceScoreFraction?: number; // default 0.75
}>;
```

**Пример Fiber seed** (`fiber-evaluation-hints.seed.sql`):

```sql
-- scheduling closed strong → lanes gets floor
WHEN 'scheduling' THEN JSON_OBJECT(
  ...,
  'impliesCheckpointFloors', JSON_ARRAY(
    JSON_OBJECT('checkpointKey', 'lanes_priority', 'floorFraction', 0.5),
    JSON_OBJECT('checkpointKey', 'fiber_definition', 'floorFraction', 0.45)
  )
)

-- stack_vs_fiber closed strong → fiber_definition floor
WHEN 'stack_vs_fiber' THEN JSON_OBJECT(
  ...,
  'impliesCheckpointFloors', JSON_ARRAY(
    JSON_OBJECT('checkpointKey', 'fiber_definition', 'floorFraction', 0.55)
  )
)
```

**Parser:** `parseCheckpointEvaluationHints` + spec.

**Snapshot:** backfill section в seed (как 14.16) для `interview_question_checkpoints`.

### B. Preconditions для срабатывания (strict)

Transitive floor применяется **только если**:

1. **Source checkpoint:**
   - `probe_status === closed` (14.18) ИЛИ `followUpCount ≥ 1` ИЛИ `status === covered`
   - `scoreAwarded >= maxScore * minSourceScoreFraction` (default **0.75**)
   - **Нет** `false_claim`, `similarity=bad_example` cap, `depth=false_claim`
   - **Нет** `accuracy=wrong` в rationale

2. **Target checkpoint:**
   - Текущий score **ниже** floor
   - Target **не** covered уже
   - Target **не** имеет stronger direct evidence (direct floor from own mustConcepts > transitive)

3. **Не применять** если source shallow (score < 0.75 × max) — fix attempt #77 class

### C. Generic util

`backend/src/modules/adaptive-interview/utils/transitive-checkpoint-floors.util.ts`

```typescript
export function applyTransitiveCheckpointFloors(input: {
  checkpoints: AdaptiveCheckpointDefinition[];
  states: Map<string, CheckpointStateSnapshot>;
}): Map<string, number> // checkpointKey → new floor score
```

- Pure function, no DB
- Called from `apply-checkpoint-score-floors.util.ts` **after** direct floors, **before** merge persist
- Или post-pass в `applyTurnEvaluationResults` over all states question-wide

**Rationale append:**

```txt
Transitive floor from scheduling (0.85): lanes_priority raised to 0.5.
```

### D. Interaction с 14.18 / 14.19

| Situation | Behavior |
|-----------|----------|
| scheduling 0.85 closed | lanes floor 0.5; **skip** lanes probe if lanes already ≥ floor |
| scheduling 0.25 open | **no** transitive |
| budget exhausted, lanes 0.25 | transitive **не** поднимает без strong source |
| lanes direct evidence 0.85 | max(direct, transitive) = 0.85, no change |

### E. Follow-up policy impact

Если transitive floor поднял target ≥ shallow accept threshold:

- `probeRequired` → **false** для target (gap reduced)
- Allocator (14.19) **skips** low-priority probe

### E2. OpenAI turn prompt — transitive hints (расширение 14.18)

Когда guard поднял floor, turn user block **информирует** evaluator (не просит AI решать самому):

```txt
Transitive floors (already applied by system — do not lower below):
- lanes_priority: floor 0.5 from scheduling (source score 0.85)
Instruction: score lanes_priority >= floor if no contradiction; do not require re-proving concepts implied by scheduling.
```

Генерируется из `applyTransitiveCheckpointFloors` output **до** persist или из derived state в context builder.

Bump patch prompt version если меняется turn block schema (2.6.x / 2.7.x).

### F. Anti-patterns (tests MUST fail)

| Case | Must NOT happen |
|------|-----------------|
| Bad candidate, scheduling false claim 0 | lanes auto 0.5 |
| Strong scheduling, lanes already 0 | lanes 0.85 from transitive alone |
| render covered | commit auto covered (different skills — no edge in seed) |
| Source partial 0.5 unprobed | any transitive |

### G. Golden calibration

1. **`react-fiber-transitive-scheduling-to-lanes.json`**
   - states: scheduling 0.85 closed, lanes 0.25
   - expected lanes ≥ 0.5

2. **`react-fiber-transitive-blocked-weak-source.json`**
   - scheduling 0.25, lanes 0.25
   - expected lanes unchanged 0.25

3. **`react-fiber-transitive-stack-to-definition.json`**
   - stack 0.75+, definition 0.25
   - expected definition ≥ 0.55

### H. Fiber fixture + seed

- `fiber-evaluation-hints.fixture.ts` — impliesCheckpointFloors для tests
- `fiber-evaluation-hints.seed.sql` — production hints
- Docs: `docs/question-bank/topics/react-fiber.md` — таблица implied floors (1 paragraph)

---

## Out of scope

- ML / LLM inference cross-checkpoint
- Transitive **across different questions** / topics
- Auto `covered` status (only floor)
- GraphQL UI editor для impliesCheckpointFloors

---

## Acceptance criteria

- [ ] `impliesCheckpointFloors` parsed from bank JSON
- [ ] Strong scheduling (≥0.75 max) raises lanes floor to 0.5 when lanes lower
- [ ] Weak scheduling (0.25) raises **nothing**
- [ ] Target already above floor unchanged
- [ ] Rationale documents transitive source
- [ ] Golden cases pass CI
- [ ] `pnpm test` + `pnpm build` OK
- [ ] Seed backfill snapshot for existing interviews
- [ ] Turn prompt включает transitive floor hints когда guard сработал

---

## Verification (Completion Notes)

```bash
cd backend
pnpm test -- transitive-checkpoint-floors golden-calibration
pnpm migrate  # only if added probe_status column (optional)
docker compose exec mysql mysql ... < seeds/fiber-evaluation-hints.seed.sql
pnpm build
```

Manual: attempt where scheduling probed to 0.85 → re-evaluate → lanes should bump from 0.25 if still low.

---

## Зависимости

- **После:** 14.18 (probe closed semantics), **14.19** (skip probe when floor sufficient)
- **После:** 14.17 (bank hints infrastructure)

---

## Связь трёх subtasks (roadmap для агента)

```txt
14.17 ✅/🟡  Scoring sync, cumulative evidence, red flags
    ↓
14.18 ⬜     Probe-or-Accept + OpenAI prompts 2.6 (dynamic turn block)
    ↓
14.19 ⬜     Budget: куда тратить follow-ups + budget block в turn prompt
    ↓
14.20 ⬜     Transitive floors + transitive hints в turn prompt
    ↓
14.21 ⬜     Topic mismatch redirect (useEffect vs useState)
```

**Один prompt = один subtask.** Не делать 18+19+20 в одном PR без явной команды.

---

## Completion Notes

_(заполнить агенту при закрытии)_
