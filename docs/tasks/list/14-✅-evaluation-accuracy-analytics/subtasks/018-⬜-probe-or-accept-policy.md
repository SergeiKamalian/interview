# TASK-14.18 — Probe-or-Accept: не штрафовать за shallow, пока не спросили

## Status

- [ ] todo

## Контекст (прочитать агенту первым делом)

### Проблема, которую решаем

Кандидат на adaptive interview отвечает **коротко и по делу** на follow-up — объясняет **общий смысл** checkpoint, но **не углубляется** в детали, потому что его **не просили**. Система:

1. Ставит `partial` + `partial_knowledge` + низкий score (0.25–0.38)
2. В rationale пишет: «нет scheduler, MessageChannel, shouldYield…»
3. **Не задаёт** targeted follow-up на эти детали (или уходит к другому checkpoint)
4. Переходит к **следующему** sub-вопросу

**Итог:** оценка «знает поверхностно / недостаточно», хотя кандидат **не отказался** и **не ошибся** — просто **не получил шанс** раскрыть глубину.

### Реальный кейс (attempt #77, interview #4)

**Checkpoint:** `scheduling` — «Понимает планирование Fiber» (weight **2.5**, tier **advanced**)

**Ответ кандидата (корректный по смыслу):**

> «Планирование Fiber — React не делает весь рендер одним блоком. Разбивает на маленькие единицы, решает что раньше, что отложить. Ввод в поле — высокий приоритет, тяжёлый список — ниже.»

**Вердict системы:**

```txt
depth=partial_knowledge, coverage=medium, accuracy=partial
нет scheduler, чанки ~5ms, shouldYield, MessageChannel
score: 0.25/1
```

**Follow-up про scheduler/MessageChannel:** не задан (или не выбран planner'ом).  
**Следующий вопрос:** уже другой checkpoint.

**Ожидание продукта:** либо **probe** («Как именно React планирует — scheduler, MessageChannel?»), либо **shallow accept** (~0.5–0.65) с label «понимает идею, детали не проверяли», но **не** 0.25 как «не знает».

### Связь с attempt #76

Там была другая проблема (ложные red flags, занижение при cumulative evidence) — частично закрыта в **14.17**.  
**14.18** — про **логику интервью**: когда спрашивать, когда принимать shallow, когда финализировать score.

### Что уже есть в коде (не дублировать, расширять)

| Компонент | Путь | Роль |
|-----------|------|------|
| Follow-up policy | `backend/src/modules/adaptive-interview/utils/follow-up-policy.util.ts` | Выбор checkpoint для follow-up, early stop |
| `isExhaustedPartialCheckpoint` | там же | **Блокирует** follow-up если partial ≥ 50% max и depth=partial_knowledge |
| `evaluateFollowUpPolicy` | там же | Лимиты: 3 follow-ups/question, 1/checkpoint по default |
| Follow-up planner | `services/follow-up-planner.service.ts` | LLM/template вопрос |
| Submit flow | `services/adaptive-interview-submit.service.ts` | evaluate → plan follow-up |
| Per-turn evaluator | `services/per-turn-checkpoint-evaluator.service.ts` | AI score per turn |
| Checkpoint evidence | `utils/checkpoint-evidence-text.util.ts` | **14.17** — cumulative text per checkpoint |
| Score floors | `utils/apply-checkpoint-score-floors.util.ts` | Bank-driven guards |
| Complexity tier | `evaluation_hints.complexityTier` в bank | `mention`…`expert` |
| Weight rubric | `docs/question-bank/checkpoint-weight-rubric.md` | weight ↔ tier |

**Env defaults (проверить актуальные):**

- `ADAPTIVE_MAX_FOLLOW_UPS_PER_QUESTION=3`
- `ADAPTIVE_MAX_FOLLOW_UPS_PER_CHECKPOINT=1`
- `ADAPTIVE_QUESTION_SCORE_SUFFICIENT_RATIO=0.6`

---

## Goal

Ввести модель **Probe-or-Accept**:

1. **Probe** — обязательный targeted follow-up, если checkpoint **advanced+**, ответ shallow, gap по `mustConcepts`, probe ещё не был
2. **Accept** — tier-aware принятие shallow-ответа **без** штрафа «не знает» (floor по tier), если probe не требуется или исчерпан
3. **Cumulative close** — финальный score checkpoint только когда диалог по нему **closed** (probed / declined / covered), не на каждом turn «в этом ответе не сказано»

---

## Термины

| Термин | Значение |
|--------|----------|
| **Shallow answer** | Смысл верный, `mustConcepts` не полные, depth ≤ `partial_knowledge` |
| **Probe required** | Нужен follow-up перед финальным partial/missed |
| **Probe closed** | Был follow-up на этот checkpoint ИЛИ candidate declined ИЛИ covered |
| **Provisional score** | Score после turn, пока checkpoint open |
| **Final score** | Score после probe closed |

---

## Scope

### A. Checkpoint lifecycle state (DB или derived)

Добавить **probe status** для checkpoint state (можно derived из существующих полей, но лучше явно):

```txt
open          — partial/missed, probe required, followUpCount=0
provisional   — shallow accept возможен, ждём probe или accept policy
probed        — followUpCount ≥ 1, оценка финализируется
closed        — covered | declined | missed после probe
```

**Минимум без migration:** вычислять в policy из `status`, `followUpCount`, `rationale`, `evaluation_hints.complexityTier`.

**Опционально migration:** `interview_checkpoint_states.probe_status ENUM(...)`.

### B. `probeRequired(checkpoint, state, hints)` — generic util

```typescript
function probeRequired(input: {
  checkpoint: AdaptiveCheckpointDefinition;
  state: { status; scoreAwarded; maxScore; followUpCount; rationale };
  hints: CheckpointEvaluationHints | null;
}): boolean
```

**true**, если **все**:

- `state.status` ∈ `{ partial, missed, unclear }`
- `state.followUpCount === 0`
- `complexityTier` ∈ `{ intermediate, advanced, expert }` (из hints или derived от weight)
- gap: matched `mustConcepts` < `minMatchedConcepts` OR depth ∈ `{ mention_only, heard_of, partial_knowledge }`
- **нет** `false_claim` / semantic contradiction

**false**, если:

- tier ∈ `{ mention, basic }` → shallow accept path (см. C)
- уже `followUpCount ≥ 1`
- candidate `declined` на targeted follow-up

**Bank extension** (`evaluation_hints`, JSON, без topic hardcode):

```json
{
  "complexityTier": "advanced",
  "probePolicy": {
    "requireProbeBeforeFinalPartial": true,
    "shallowAcceptMaxFraction": 0.5,
    "minScoreAfterShallowAccept": 0.55
  }
}
```

Parser в `checkpoint-evaluation-hints.type.ts`.

### C. Tier-aware shallow accept (guards)

Если **probe не required** ИЛИ **probe budget исчерпан** (см. 14.19):

| complexityTier | max score без deep probe | label |
|----------------|--------------------------|-------|
| `mention` | 0.25–0.35 × max | упомянул |
| `basic` | 0.50–0.65 × max | поверхностно, верно |
| `core_plus` | 0.55–0.70 × max | понимает без деталей |
| `intermediate` | 0.50 × max **provisional** | нужен probe для выше |
| `advanced` / `expert` | **не финализировать** ниже 0.5 без probe | probe required |

Реализация: новый guard `applyShallowAcceptFloor` в `apply-checkpoint-score-floors.util.ts`, параметры **только из bank** `probePolicy`.

**Критично:** rationale AI не должен писать «не знает scheduler», если probe не был — guard заменяет на:

```txt
depth=partial_knowledge, probe=pending, coverage=medium: смысл верный, детали не проверены
```

### D. Follow-up policy: probe gate

Изменить `follow-up-policy.util.ts`:

1. **`isExhaustedPartialCheckpoint`** — **не** блокировать follow-up для `advanced` tier, если `probeRequired === true`, даже при score ≥ 50% max
2. **Приоритет eligible checkpoints:**
   - сначала `probeRequired === true` (weight × gap)
   - потом остальные partial
3. **`sufficient_question_score` early stop** — **не** срабатывает, если есть хотя бы один checkpoint с `probeRequired === true` и weight ≥ `intermediate` (2.0)
4. **Не переключаться** на другой checkpoint, пока текущий `targetCheckpointKey` имеет `probeRequired` и follow-up ещё не задан (sticky probe)

### E. OpenAI prompts — per-turn dynamic context (обязательно в этом subtask)

AI должен **участвовать** в probe-or-accept, а не только guards после факта. Контекст policy **не** класть в bootstrap агента — только при каждом `submitAnswer`.

#### Архитектура

| Слой | Файлы | Когда меняется |
|------|-------|----------------|
| System prompt (стабильные правила) | `per-turn-checkpoint-evaluation.prompt.ts`, `adaptive-ai-conversation.prompt.ts` | Версия **2.6.0** в этом subtask |
| Turn user prompt (runtime) | `buildPerTurnCheckpointEvaluationUserPrompt`, `buildEvaluateConversationTurnUserPrompt` | **Каждый ответ** |
| Follow-up planner | `follow-up-planner.prompt.ts` | probe + mustConcepts gap из policy |

**Новая util:** `build-interview-policy-turn-block.util.ts` — собирает блок из `AdaptiveInterviewContextPacket` + derived probe state.

#### System prompt — что добавить / исправить

1. **Убрать конфликт** «latest answer has highest weight» для open checkpoints → заменить на:
   - latest имеет приоритет только при **contradiction / false claim / decline**;
   - иначе оценка по **cumulative evidence** (main + targeted follow-ups по checkpoint).
2. **Probe-or-accept rules:**
   - пока `probe_status=open` — не ставить `missed` только потому, что в этом turn не назван detail из `mustConcepts`;
   - shallow-trailing shallow accept: короткий верный ответ без деталей → `partial` ≥ shallow floor, `depth=partial_knowledge`, rationale с `probe=pending`.
3. **Conversation bootstrap** (`buildEvaluateConversationBootstrapUserPrompt`) — **без** probe/budget; только question + checkpoints + reference.
4. В system conversation mode одна строка: «Later user messages may include an **Interview policy** block — follow it for this turn.»

Bump: `PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION` → `2.6.0`, `ADAPTIVE_AI_CONVERSATION_EVALUATE_PROMPT_VERSION` синхронно.

#### Turn user prompt — динамический блок `Interview policy (this turn)`

Пример (генерируется кодом, не hardcode Fiber):

```txt
Interview policy (this turn):
- Target checkpoint: scheduling (advanced, weight=2.5)
- Probe status: open — mustConcepts not yet asked in dialogue
- Missing mustConcepts: scheduler, MessageChannel, shouldYield
- Shallow accept floor: 0.55 (until probed or declined)
- Follow-up budget: 2 remaining for this question (see 14.19 for full allocator)

Scoring for this turn:
- Score from cumulative evidence for each checkpoint, not only the latest sentence
- Do NOT finalize missed on advanced checkpoints while probe_status=open unless false_claim or decline
- Rationale MUST include probe=pending when details were not asked yet
```

Поля блока (минимум):

- `targetCheckpointKey`, `complexityTier`, `weight`
- `probeStatus`, `probeRequired`, `missingMustConcepts[]`
- `shallowAcceptFloorFraction` (из bank `probePolicy`)
- `followUpsRemainingQuestion` (если уже есть в context; полный allocator — 14.19)

Расширить `AdaptiveInterviewContextPacket` / context builder в `adaptive-interview-context.service.ts`.

#### Follow-up planner prompt

При `probeRequired`:

- user prompt получает `missingMustConcepts` (human-readable из bank) + «mandatory depth probe, not generic recap»;
- шаблон смысла: «Вы верно описали [idea]. Уточните: [mustConcepts]».

При combined mode `suggested_follow_up` evaluator должен **совпадать** с policy target (или policy перезаписывает AI suggestion).

#### Merge rules

**Merge** (`merge-checkpoint-evaluation.util.ts`):

- Пока `probe_status !== closed`, incoming turn **не может** опустить score ниже `provisional floor`, кроме false claim / decline

#### Prompt verification

- [ ] `per-turn-checkpoint-evaluation.prompt.spec.ts` — system содержит cumulative + probe-or-accept; turn builder включает policy block когда `probeRequired`
- [ ] `adaptive-ai-conversation.prompt.spec.ts` (если есть) — bootstrap без policy, turn с policy
- [ ] Golden + unit: shallow scheduling turn prompt содержит `probe=pending` instruction
- [ ] `prompt_version` в логах = `2.6.0` после деплоя

### F. Follow-up question quality для probe

Planner/template для `probeRequired`:

```txt
«Вы верно описали [general idea]. Уточните, пожалуйста: [1–2 mustConcepts из hints, human-readable]»
```

Пример scheduling:

```txt
«Вы верно описали приоритеты. Как именно React планирует работу —
 scheduler, MessageChannel или shouldYield?»
```

**mustConcepts** для формулировки probe — из bank, не hardcode Fiber.

### G. Dashboard / HR report (минимум)

В adaptive checkpoint review показывать:

- `probeStatus`: open | probed | closed
- Если open + partial: badge **«ожидает уточнение»** или **«shallow, probe не проводился»**

Полный UI redesign — out of scope; достаточно поля в GraphQL если уже есть review type.

### H. Golden calibration cases

Добавить в `backend/src/modules/adaptive-interview/calibration/golden-cases/`:

1. **`react-fiber-scheduling-shallow-needs-probe.json`**
   - shallow scheduling answer, AI partial 0.25
   - **expected:** score ≥ 0.5 (shallow accept) OR policy marks probeRequired
   - follow-up policy **expected:** targetCheckpointKey=scheduling

2. **`react-fiber-scheduling-after-probe-decline.json`**
   - probe задан, candidate: «scheduler не знаю деталей»
   - **expected:** score ~0.5, closed, не missed

3. **`react-fiber-basic-tier-shallow-accept.json`**
   - basic tier checkpoint, короткий верный ответ
   - **expected:** score ≥ 0.55 без probe

---

## Out of scope (другие subtasks)

- **14.19** — лимит follow-ups по weight (budget allocator)
- **14.20** — transitive floors (сложный → простой)
- **14.21** — topic mismatch redirect (ответ про useState на вопрос про useEffect)
- GraphQL admin UI для `probePolicy` в question bank
- Two-pass interview (breadth pass + depth pass) — future
- Изменение `questions.max_score` или weights

---

## Acceptance criteria

- [ ] На Fiber attempt в стиле #77 (`scheduling` shallow): score **≥ 0.5** ИЛИ задан follow-up про scheduler **до** перехода к другому checkpoint
- [ ] `advanced` checkpoint с `partial_knowledge` и `followUpCount=0` → `probeRequired=true` в policy
- [ ] `isExhaustedPartialCheckpoint` **не** блокирует probe для advanced tier при probeRequired
- [ ] AI rationale не финализирует «не знает [detail]», если detail не спрашивали (probe=pending)
- [ ] Cumulative evidence: ответ за 2 сообщения на **один** checkpoint суммируется (regression test)
- [ ] Golden cases (3+) проходят в CI
- [ ] `pnpm test` + `pnpm build` backend OK
- [ ] Fiber seed: `probePolicy` на `scheduling`, `stack_vs_fiber` (advanced/core_plus)
- [ ] Prompt **2.6.0**: system + turn user block с probe policy; bootstrap без runtime policy
- [ ] `buildInterviewPolicyTurnBlock` покрыт unit-тестами

**Не в scope 14.18** (отдельный subtask): redirect при ответе не на тот checkpoint → **14.21**

---

## Verification (Completion Notes)

```bash
cd backend
pnpm test -- follow-up-policy apply-checkpoint-score-floors golden-calibration
pnpm build
```

**Manual smoke:**

1. Новый Fiber attempt, ответ на scheduling только «приоритеты и части» → должен прийти follow-up про scheduler
2. Ответ «не знаю scheduler» → score ~0.5, closed, interview идёт дальше
3. Сравнить attempt до/после на dashboard — scheduling не 0.25 без probe

---

## Зависимости

- **После:** 14.17 (cumulative evidence, bank hints) — желательно done
- **Перед:** 14.19 (budget), 14.20 (transitive) — логически после 14.18

---

## Completion Notes

_(заполнить агенту при закрытии)_
