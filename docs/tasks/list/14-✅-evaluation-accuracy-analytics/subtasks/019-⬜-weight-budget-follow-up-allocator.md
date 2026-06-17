# TASK-14.19 — Weight-based follow-up budget allocator

## Status

- [ ] todo

## Контекст (прочитать агенту первым делом)

### Проблема

Одна main question (например React Fiber) = **8–10 checkpoints**, суммарный weight = 10.  
Если на **каждый** partial checkpoint углубляться — интервью **затягивается** (10+ follow-ups).  
Если **не углубляться** — получаем attempt #77: scheduling 0.25 без probe, хотя weight **2.5**.

Нужен **бюджет**: ограниченное число follow-ups, но **умное распределение** — сначала туда, где **больше weight** и **больше gap**, а лёгкие checkpoints принимать shallow (см. **14.18**).

### Текущее поведение

`follow-up-policy.util.ts`:

- Max **3** follow-ups на question, **1** на checkpoint (env)
- Сортировка eligible: **weight desc** → status priority → sortOrder
- Early stop: `questionScoreSufficient` при score ≥ 60% max question
- Low-weight skip: если question score sufficient, checkpoints с weight < 20% max **не** получают follow-up

**Проблемы текущей логики:**

1. Flat limit «1 follow-up per checkpoint» — scheduling (2.5) и mention-tier (0.5) **равны** по количеству probes
2. `sufficient_question_score` может **остановить** interview, пока **advanced** checkpoint ещё `probeRequired` (14.18)
3. Нет явного **priority score** = f(weight, gap, tier, uncertainty)
4. Нет **reserve budget** для второго probe на самый важный checkpoint

### Продуктовая аналогия

```txt
Не спрашивать 10 раз «а подробнее?»
Спросить 3–4 раза — но по самым дорогим gaps.
```

---

## Goal

Реализовать **Weight Budget Allocator** — deterministic policy (не LLM), которая:

1. Считает **probe priority** для каждого eligible checkpoint
2. Распределяет **глобальный бюджет** follow-ups на question
3. Даёт **разный per-checkpoint cap** по tier/weight
4. Интегрируется с **14.18** `probeRequired` — обязательные probes потребляют budget первыми

---

## Формула priority (reference implementation)

```typescript
priority =
  (checkpoint.weight / questionMaxScore) *
  gapScore *
  tierMultiplier *
  uncertaintyMultiplier
```

| Factor | Источник | Диапазон |
|--------|----------|----------|
| `weight / questionMaxScore` | snapshot checkpoint | 0.05–0.30 |
| `gapScore` | 1 − (matchedMustConcepts / minMatchedConcepts) clamp 0..1 | bank hints |
| `tierMultiplier` | complexityTier | mention 0.3, basic 0.6, core_plus 0.8, intermediate 1.0, advanced 1.2, expert 1.3 |
| `uncertaintyMultiplier` | 1.0 if status=unclear; 0.9 partial; 0.7 missed | state |

**Eligible** только если 14.18 probe policy разрешает (не closed, не exhausted incorrectly).

---

## Scope

### A. Config (env + optional bank override)

**Env (defaults):**

```bash
ADAPTIVE_MAX_FOLLOW_UPS_PER_QUESTION=4        # было 3, обосновать в Completion Notes
ADAPTIVE_MAX_FOLLOW_UPS_PER_CHECKPOINT=1      # default
ADAPTIVE_MAX_FOLLOW_UPS_HEAVY_CHECKPOINT=2  # weight ≥ 2.0 OR tier advanced+
ADAPTIVE_HEAVY_CHECKPOINT_WEIGHT_RATIO=0.2   # weight/questionMax ≥ 0.2
ADAPTIVE_MIN_PRIORITY_TO_PROBE=0.15          # ниже — shallow accept без probe
```

**Bank override** (`evaluation_hints.probePolicy`):

```json
{
  "probePolicy": {
    "maxFollowUps": 2,
    "minPriorityToProbe": 0.1
  }
}
```

### B. `computeProbePriority()` util

Новый файл: `backend/src/modules/adaptive-interview/utils/probe-priority.util.ts`

- Input: checkpoint definition, state, hints, questionMaxScore
- Output: `{ priority: number; gapScore: number; reasons: string[] }`
- Unit tests с Fiber fixture checkpoints

### C. `allocateFollowUpBudget()` util

Новый файл: `backend/src/modules/adaptive-interview/utils/follow-up-budget-allocator.util.ts`

**Input:**

- all checkpoint states for question
- followUpsUsedForQuestion
- max budget (env)
- probeRequired flags (14.18)

**Output:**

```typescript
{
  canProbe: boolean;
  selectedCheckpointKey?: string;
  reason: string;
  remainingBudget: number;
  skippedLowPriority: string[]; // keys below minPriority
}
```

**Алгоритм:**

1. Если `probeRequired` checkpoints exist → **reserve** min(1, remainingBudget) для highest priority among them
2. Sort all eligible by priority desc
3. Skip if `priority < minPriorityToProbe` → shallow accept path (14.18)
4. Skip if checkpoint `followUpCount >= perCheckpointCap(weight, tier)`
5. Select top eligible not skipped
6. If `questionScoreSufficient` BUT exists probeRequired with priority ≥ threshold → **ignore** early stop (fix attempt #77 class)

### D. Per-checkpoint follow-up cap by weight

```typescript
function maxFollowUpsForCheckpoint(checkpoint, hints): number {
  if (hints.probePolicy?.maxFollowUps != null) return hints.probePolicy.maxFollowUps;
  if (checkpoint.score / questionMax >= HEAVY_RATIO) return env.HEAVY_CAP; // 2
  if (tier === 'mention' || tier === 'basic') return 0; // shallow only
  return 1;
}
```

**mention/basic:** 0 follow-ups — только shallow accept (14.18).

### E. Integrate into `evaluateFollowUpPolicy`

Replace/adjust sorting block:

- Call `allocateFollowUpBudget` instead of simple `.sort(compareCandidates)`
- Log decision reason для analytics (14.11 divergence logging pattern)

### F. Stagnation + budget interaction

Existing `follow_up_stagnation` (N turns без score delta):

- Если priority **высокий** (advanced, gap high) → allow **1 extra** probe beyond stagnation limit
- Если priority **низкий** → stagnation stops

### G. Golden + integration tests

**Unit:** `probe-priority.util.spec.ts`, `follow-up-budget-allocator.util.spec.ts`

**Scenario tests:**

| Scenario | Expected |
|----------|----------|
| scheduling partial + fiber_pointers partial, budget=2 | probe scheduling first (weight 2.5) |
| question score 65%, scheduling probeRequired | **continue**, не early stop |
| mention-tier partial | no probe, shallow accept |
| budget exhausted, scheduling still probeRequired | shallow accept max 0.5, mark `probe_closed=budget_exhausted` |

**Golden JSON:** `react-fiber-budget-prioritizes-scheduling.json`

### H. OpenAI turn prompt — budget block (расширение 14.18)

Allocator **не** меняет system prompt major version — дополняет `buildInterviewPolicyTurnBlock`:

```txt
Follow-up budget (this question):
- Used: 1 / 4
- Remaining: 3
- This checkpoint cap: 2 (heavy, weight=2.5)
- Priority rank: #1 scheduling (0.42)
- Skipped (low priority): fiber_pointers (0.08 < min 0.15)
```

**Evaluator instruction:** не ожидать depth probe на checkpoints из `Skipped`; применять shallow accept (14.18).

**Planner:** не предлагать второй probe на checkpoint ниже `minPriorityToProbe`.

Файлы: `build-interview-policy-turn-block.util.ts`, `per-turn-checkpoint-evaluation.prompt.ts`, `follow-up-planner.prompt.ts`.

### I. Docs

Обновить **только**:

- `docs/tasks/list/14-✅-evaluation-accuracy-analytics/subtasks/019-...` Completion Notes
- `docs/evaluation-accuracy/README.md` — секция «Follow-up budget» (кратко, если файл существует)

**Не** трогать `docs/PROJECT.md`, `docs/DECISIONS.md`.

---

## Out of scope

- Transitive inference (14.20)
- Topic mismatch redirect (14.21)
- Полный redesign planner persona — только budget fields в user prompt
- Frontend timeline UX для budget
- Dynamic budget по длительности интервью

---

## Acceptance criteria

- [ ] Fiber: при 2+ partial checkpoints probe идёт в **scheduling** раньше, чем в **fiber_pointers** (weight)
- [ ] `ADAPTIVE_QUESTION_SCORE_SUFFICIENT_RATIO` не останавливает interview при pending `probeRequired` advanced
- [ ] mention/basic tier: 0 follow-ups из allocator
- [ ] heavy checkpoint (weight ≥ 2.0): до 2 follow-ups если первый не closed gap
- [ ] Unit tests + integration с follow-up-policy
- [ ] `pnpm test` + `pnpm build` OK
- [ ] Turn user prompt включает follow-up budget block когда allocator active

---

## Verification (Completion Notes)

```bash
cd backend
pnpm test -- probe-priority follow-up-budget follow-up-policy
pnpm build
```

Manual: replay Fiber casual profile — scheduling должен получить follow-up; total follow-ups ≤ budget.

---

## Зависимости

- **Требует:** 14.18 (`probeRequired`, shallow accept) — можно stub probeRequired=false для isolated test allocator
- **До:** 14.20 (transitive floors использует closed/probed states)

---

## Completion Notes

_(заполнить агенту при закрытии)_
