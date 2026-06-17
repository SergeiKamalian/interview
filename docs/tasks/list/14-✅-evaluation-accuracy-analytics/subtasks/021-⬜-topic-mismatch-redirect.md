# TASK-14.21 — Topic mismatch redirect: ответ не на тот checkpoint

## Status

- [ ] todo

## Контекст (прочитать агенту первым делом)

### Проблема

Main question про **несколько checkpoints** (или один broad question с sub-aspects). Кандидат отвечает **уверенно и по делу**, но про **другую тему**, чем спрашивали сейчас:

**Пример:**

- Вопрос: «Как работает **useEffect**?»
- Ответ: «**useState** хранит state в компоненте, при setState React перерисовывает…»

**Текущее поведение (плохое):**

1. Evaluator ставит на `useEffect` checkpoint: `missed`, score **0**
2. `candidate_disposition` часто `engaged` или `off_topic` (нерелевантно)
3. Follow-up уходит в другой partial checkpoint или early stop
4. Кандидат **не получает шанс** ответить на исходный вопрос

**Ожидание продукта (как живой интервьюер):**

```txt
«Похоже, вы отвечаете про useState, а мой вопрос был про useEffect.
 Можете рассказать именно про useEffect — когда он вызывается и зачем?»
```

**Не** «не знает → 0 → следующий checkpoint».

### Отличие от других disposition

| Ситуация | Disposition | Действие |
|----------|-------------|----------|
| Отказ / «не знаю» | `declined` | shallow accept или closed missed (14.18) |
| Не понял формулировку | `confused` | rephrase main question |
| Бессмыслица / не про React | `off_topic` | мягкий redirect на question |
| **Ответ про другой checkpoint темы** | **`misunderstood_question`** | **topic redirect follow-up** |
| Shallow, но по теме | `engaged` | probe depth (14.18) |

### Связь с другими subtasks

- **14.18** — probe-or-accept для shallow **по теме**; mismatch redirect **до** probe/finalize
- **14.19** — redirect **consumes 1 follow-up** из budget (priority выше generic probe)
- **14.17** — cumulative evidence: после redirect ответ на useEffect **не** обнуляет useState evidence (если useState — другой checkpoint)

---

## Goal

1. Детектировать **topic mismatch**: ответ semantically покрывает checkpoint **B**, пока target / main ask — checkpoint **A**
2. **Не финализировать** score на A как `missed` на первом turn mismatch
3. Задать **redirect follow-up** (LLM или template) и только после повторного ответа оценивать A
4. Обновить **OpenAI prompts** — evaluator + planner участвуют в детекте и формулировке redirect

---

## Scope

### A. Новый disposition: `misunderstood_question`

Расширить:

- `candidate-answer-disposition.type.ts`
- `per-turn-evaluation.schema.ts` (Joi)
- JSON schema в `per-turn-checkpoint-evaluation.prompt.ts`
- GraphQL / mapper если disposition exposed в report

**Определение:** кандидат engaged, ответ **substantive**, но primary semantic focus ≠ target checkpoint / main question focus.

### B. `detectTopicMismatch()` util

Новый файл: `backend/src/modules/adaptive-interview/utils/topic-mismatch.util.ts`

**Input:**

- `targetCheckpointKey` (если follow-up) или inferred «main ask» checkpoint
- `latestCandidateAnswer`
- all checkpoints definitions + optional `evaluation_hints.relatedConcepts` / checkpoint titles
- optional: AI `checkpoint_results` с high coverage на **другом** key при low на target

**Output:**

```typescript
{
  isMismatch: boolean;
  answeredCheckpointKey: string | null;  // e.g. useState checkpoint
  expectedCheckpointKey: string;
  confidence: number;
  reason: string;
}
```

**Heuristics (deterministic layer после AI):**

- AI вернул `coverage=high` на checkpoint B и `coverage=none|low` на target A
- Текст содержит strong signals B (`useState`, `setState`) без signals A (`useEffect`, `cleanup`, `dependencies`)
- Bank `evaluation_hints.confusionPairs` (optional JSON):

```json
{
  "confusionPairs": [
    {
      "checkpointKey": "use_effect",
      "oftenConfusedWith": ["use_state"],
      "anchorTermsExpected": ["effect", "cleanup", "dependency"],
      "anchorTermsWrongTopic": ["useState", "setState"]
    }
  ]
}
```

Parser в `checkpoint-evaluation-hints.type.ts` — generic, seed для React hooks topic когда появится в bank.

### C. Follow-up policy: redirect gate

Изменить `follow-up-policy.util.ts`:

1. **Priority выше** `probeRequired`: если `detectTopicMismatch` → `followUpKind=topic_redirect`
2. **Sticky:** пока redirect задан и нет ответа на target — не переключать target checkpoint
3. **Не early-stop** question пока pending redirect на main/target checkpoint
4. **Max 1 redirect** на checkpoint (не зацикливать «вы опять не туда»)

Новый тип follow-up в planner input: `followUpKind: 'depth_probe' | 'topic_redirect' | 'rephrase'`.

### D. OpenAI prompts

#### Evaluator (`per-turn-checkpoint-evaluation.prompt.ts` + conversation turn)

**System:**

- Новый disposition `misunderstood_question` в taxonomy
- Правило: если ответ clearly про **другой** checkpoint из списка — target checkpoint → `unclear` или provisional partial, **не** `missed` score 0
- `candidate_disposition=misunderstood_question` когда substantive wrong-topic

**Turn user block** (расширение `buildInterviewPolicyTurnBlock` из 14.18):

```txt
Topic focus (this turn):
- Expected checkpoint: use_effect
- Candidate answer appears to address: use_state (mismatch suspected)
- Instruction: do NOT finalize missed on use_effect; set disposition misunderstood_question if confident
```

#### Follow-up planner (`follow-up-planner.prompt.ts`)

Новая ветка `topic_redirect`:

```txt
The candidate answered about [wrong topic] but the question was about [expected topic].
Write ONE polite redirect in Russian (interviewer «я» → candidate «вы»):
- Briefly name the mismatch without quoting their full answer
- Ask them to answer the original topic
- Do NOT scold; sound like a helpful interviewer
Example tone: «Похоже, вы описали useState, а вопрос был про useEffect. Расскажете про useEffect?»
```

Template fallback если LLM fail (как 14.3 pattern): human-readable titles из checkpoint, не rubric keys.

Bump prompt version: **2.7.0** (или patch 2.6.1 если 14.21 сразу после 14.18).

### E. Score guards

`apply-checkpoint-score-floors.util.ts` или merge util:

- Пока `redirectPending` на checkpoint A — incoming score **не ниже** provisional (0 или previous), **кроме** если второй ответ тоже mismatch → тогда closed partial/missed
- Checkpoint B (useState): если кандидат реально ответил про B — **начислить** score на B из того же turn (cross-checkpoint credit), не игнорировать

### F. Golden calibration cases

`backend/src/modules/adaptive-interview/calibration/golden-cases/`:

1. **`react-hooks-useeffect-usestate-mismatch.json`**
   - Question useEffect, answer only useState
   - **expected:** disposition `misunderstood_question`, use_effect score not finalized 0, policy redirect

2. **`react-hooks-useeffect-after-redirect.json`**
   - Redirect given, second answer correct useEffect
   - **expected:** use_effect ≥ 0.6 covered/partial

3. **`react-hooks-double-mismatch.json`**
   - Redirect + again wrong topic
   - **expected:** closed missed on target, no infinite redirect loop

---

## Out of scope

- Полный React hooks question bank seed (достаточно fixture + 1 golden; seed hooks — отдельная задача question-bank)
- UI copy на frontend session page (backend возвращает follow-up text как сейчас)
- Multilingual mismatch detection beyond RU/EN mix уже в prompts

---

## Acceptance criteria

- [ ] useEffect question + useState answer → **не** immediate 0 на useEffect без redirect
- [ ] Follow-up содержит явное указание mismatch (useState vs useEffect) в human-readable форме
- [ ] `misunderstood_question` в schema + prompt + validation
- [ ] Redirect priority > generic probe в policy
- [ ] Max 1 redirect per target checkpoint
- [ ] Cross-checkpoint: useState checkpoint может получить partial из того же turn
- [ ] Golden cases (3) pass CI
- [ ] Prompt version bumped; turn block includes topic focus when mismatch
- [ ] `pnpm test` + `pnpm build` backend OK

---

## Verification (Completion Notes)

```bash
cd backend
pnpm test -- topic-mismatch follow-up-policy per-turn-checkpoint-evaluation.prompt
pnpm build
```

**Manual smoke:**

1. Создать/использовать question с 2 checkpoints (effect vs state) или mock context
2. Ответ только про useState → redirect про useEffect
3. Второй ответ про useEffect → score ≥ 0.5

---

## Зависимости

- **После:** 14.18 (probe lifecycle, `buildInterviewPolicyTurnBlock`, prompt 2.6.x)
- **Параллельно OK:** 14.19 budget (redirect consumes budget slot)
- **До:** не блокирует 14.20

---

## Completion Notes

_(заполнить агенту при закрытии)_
