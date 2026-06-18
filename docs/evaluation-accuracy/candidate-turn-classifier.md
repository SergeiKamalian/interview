# Candidate Turn Classifier — Design (AI вместо regex intent)

> **Статус:** design approved for implementation  
> **Следующий subtask:** `TASK-14.28` — Candidate turn AI classifier  
> **Связанные файлы:** `candidate-clarification.util.ts`, `candidate-decline.util.ts`, `topic-opener.util.ts`, `adaptive-interview-submit.service.ts`

---

## 1. Проблема

Сейчас система пытается **понять намерение кандидата** через hardcoded regex по конкретным фразам. Это приводит к:

- **false positive** — длинный ответ с `?` в конце → `asked_for_scope`;
- **false negative** — «То есть речь про планировщик внутри Fiber?» без шаблонной фразы → не clarification;
- **конфликт слоёв** — evaluator AI говорит `engaged`, regex override → `asked_for_scope`;
- **ранний выход** — `isFullQuestionDecline` **до** `evaluate_turn` закрывает вопрос без scoring;
- **бесконечная гонка** — каждый новый кейс = ещё один паттерн.

### Масштаб (intent-слой, ~90+ паттернов)

| Файл | Паттернов | Что угадывает |
|------|-----------|---------------|
| `candidate-clarification.util.ts` | ~35 | scope clarification, format clarification, vague follow-up |
| `candidate-decline.util.ts` | ~33 | decline whole/scoped, topic refusal |
| `topic-opener.util.ts` | ~27 | opener readiness (ready/uncertain/declined) |
| `bad-answer-signature.util.ts` | ~12 | Fiber-specific false claims (отдельная волна) |
| `follow-up-acknowledgment.util.ts` | ~5 | robotic openers (косметика, не policy) |

### Каскад в pipeline (почему один баг тянет всё)

```txt
answer received
  → isFullQuestionDecline()           ← regex ДО AI, может завершить вопрос
  → evaluate_turn (AI disposition)
  → resolveScopeClarification...()    ← regex ПЕРЕБИВАЕТ AI disposition
  → shouldSkipFollowUps()
  → applyCheckpointScoreFloors()      ← ещё regex на текст кандидата
  → follow-up policy                  ← isScopeClarificationTurn (regex)
  → topic-mismatch                    ← тот же guard
  → probe-policy                      ← isTargetedTopicRefusal (regex)
```

**Вывод:** intent должен определяться **одним семантическим классификатором**, а не размазанными regex.

---

## 2. Решение: CandidateTurnClassifier

### 2.1 Принцип

```txt
Classifier (intent)  →  Evaluator (scores)  →  Policy (rules)  →  Bank hints (domain)
```

| Слой | Ответственность | Технология |
|------|-----------------|------------|
| **CandidateTurnClassifier** | Что кандидат *делает* этим сообщением (meta vs answer vs refuse) | Маленький LLM, strict JSON |
| **Per-turn checkpoint evaluator** | Насколько ответ покрывает checkpoints | Существующий evaluator (без disposition override) |
| **Follow-up / probe policy** | Следующий шаг интервью | Детерминированные правила по `turn_kind` + scores |
| **Question bank hints** | Domain knowledge (mustConcepts, falseClaims, confusionPairs) | Данные, не hardcoded regex |

### 2.2 Когда вызывается

**На каждый ответ кандидата**, до policy и (для meta/decline) до тяжёлого scoring:

- `main_answer`
- `follow_up_answer`
- `topic_opener_answer`

Опционально: **параллельно** с evaluator для substantive turns (latency ≈ max(classifier, evaluator), не sum).

### 2.3 Выход classifier (strict JSON)

```json
{
  "turn_kind": "substantive_answer",
  "confidence": "high",
  "reason": "Кандидат объясняет scheduler и MessageChannel своими словами."
}
```

| Поле | Тип | Обязательно |
|------|-----|-------------|
| `turn_kind` | enum (см. §3) | да |
| `confidence` | `high` \| `low` | да |
| `reason` | string, 1 предложение, русский | да |

При `confidence=low` — policy использует conservative fallback (см. §6).

---

## 3. Таксономия `turn_kind` — полное руководство для prompt

Classifier **не оценивает знания**. Он отвечает только: *кандидат пытается ответить по теме, уточняет вопрос, отказывается, или ушёл в сторону?*

### 3.1 `substantive_answer`

**Определение:** кандидат добавляет **техническое содержание** — объясняет, описывает механизм, приводит пример, пытается ответить (верно или неверно).

**Ключевой тест:** есть ли **новая техническая информация**, не сводящаяся к перефразу вопроса интервьюера?

| Пример | turn_kind | Почему |
|--------|-----------|--------|
| «Scheduler в Fiber использует MessageChannel и postMessage, чтобы не блокировать main thread» | `substantive_answer` | объяснение механизма |
| «useEffect срабатывает после paint, а не до» | `substantive_answer` | попытка ответа (даже если checkpoint другой) |
| «Не уверен в деталях, но вроде lanes задают приоритет обновлениям» | `substantive_answer` | неуверенность ≠ отказ; есть содержание |
| «Scheduler, да? Он же через requestIdleCallback работает» | `substantive_answer` | есть false claim, но это **ответ**, не meta |
| «То есть scheduler планирует work loop — верно? И он не блокирует UI» | `substantive_answer` | confirmation + **добавленное** объяснение |
| Длинный ответ из 3 предложений с одним «верно?» в конце | `substantive_answer` | вопрос в конце не отменяет содержание |

**НЕ substantive:**

| Пример | Правильный turn_kind |
|--------|---------------------|
| «Что именно вам интересно?» | `scope_clarification` |
| «Коротко или подробно отвечать?» | `format_clarification` |
| «Не знаю» | `decline_whole` или `decline_scoped` |
| «Хз, давайте про другое» | `off_topic` или `topic_refusal` |

**Маппинг:** → `candidate_disposition = engaged` или `misunderstood_question` (второе решает evaluator по checkpoint overlap, не classifier).

---

### 3.2 `scope_clarification`

**Определение:** кандидат **не добавляет технического содержания**. Он уточняет/подтверждает **о чём** вопрос: что имел в виду интервьюер, правильно ли понял тему, про какой аспект спрашивают.

**Ключевой тест:** сообщение — **только meta-dialogue** про scope вопроса, без попытки объяснить тему.

| Пример | turn_kind | Почему |
|--------|-----------|--------|
| «Что именно вам интересно?» | `scope_clarification` | чистый scope ask |
| «Вы про useEffect или useState?» | `scope_clarification` | disambiguation без ответа |
| «То есть речь про планировщик внутри Fiber?» | `scope_clarification` | confirmation без объяснения |
| «Правильно понимаю, вопрос про commit phase?» | `scope_clarification` | scope confirm |
| «Речь про scheduler, да?» | `scope_clarification` | короткое подтверждение темы |
| «What do you mean by scheduling here?» | `scope_clarification` | любой язык |
| Перефраз follow-up без новых фактов: «Вам нужно про MessageChannel?» | `scope_clarification` | повтор вопроса, не ответ |

**Граничные случаи:**

| Ситуация | Правило |
|----------|---------|
| Scope question **+** 1–2 термина из follow-up | всё равно `scope_clarification`, если нет объяснения |
| «Да?» / «Верно?» после длинного объяснения | `substantive_answer` (содержание уже было) |
| Только «да» / «нет» на opener | см. `topic_opener_readiness` (отдельный контекст §3.8) |

**Маппинг:** → `candidate_disposition = asked_for_scope`  
**Policy:** `clarification_redirect`, freeze score на targeted checkpoint, max 2 turns → `scope_clarification_exhausted`.

---

### 3.3 `format_clarification`

**Определение:** кандидат уточняет **как** отвечать (формат, глубина, длина), а не **о чём**.

**Ключевой тест:** вопрос про стиль ответа, не про предметную область.

| Пример | turn_kind |
|--------|-----------|
| «Коротко или подробно?» | `format_clarification` |
| «По делу или с деталями?» | `format_clarification` |
| «На высоком уровне или в деталях?» | `format_clarification` |
| «Brief or detailed?» | `format_clarification` |
| «Вам нужно чтобы я рассказал всё или только основное?» | `format_clarification` |
| «На пальцах объяснить?» | `format_clarification` |

**Отличие от scope:**

| scope | format |
|-------|--------|
| «Вы про scheduler или lanes?» | «Коротко про scheduler или подробно?» |
| «О чём именно вопрос?» | «Как именно отвечать?» |

**Маппинг:** → `asked_for_scope` (тот же policy path)  
**Ответ интервьюера:** «Кратко и по существу — [ядро предыдущего вопроса]».

---

### 3.4 `decline_whole`

**Определение:** кандидат **отказывается отвечать на весь текущий main question** (или явно говорит, что не знает тему целиком).

**Ключевой тест:** отказ **не ограничен** одним checkpoint / одним follow-up аспектом.

| Пример | turn_kind |
|--------|-----------|
| «Не знаю» | `decline_whole` |
| «Ничего не знаю по этой теме» | `decline_whole` |
| «Без понятия» | `decline_whole` |
| «I don't know anything about Fiber» | `decline_whole` |
| «Не разбираюсь в React internals вообще» | `decline_whole` |
| «Затрудняюсь ответить на этот вопрос» | `decline_whole` |

**НЕ decline_whole:**

| Пример | Правильный turn_kind |
|--------|---------------------|
| «На lanes я не смогу ответить, но scheduler вроде понимаю» | `substantive_answer` (есть частичный ответ) |
| «Про concurrent mode не знаю» (при scoped follow-up) | `decline_scoped` |
| «Давайте дальше» (при targeted probe) | `topic_refusal` |

**Маппинг:** → `declined`  
**Policy:** skip follow-ups, `applyCandidateDeclinedKnowledge`, complete question.

---

### 3.5 `decline_scoped`

**Определение:** кандидат отказывается от **конкретного под-aspect** (текущий follow-up / checkpoint), но **не** от всего main question.

**Ключевой тест:** отказ привязан к «этому», «именно это», «на этот пункт» — остальная тема может быть ок.

| Пример | turn_kind |
|--------|-----------|
| «На это я вряд ли смогу ответить» | `decline_scoped` |
| «Про lanes честно не разбирался» | `decline_scoped` |
| «Именно про deferred updates не скажу» | `decline_scoped` |
| «Не смогу ответить на эту часть» | `decline_scoped` |
| «Concurrent mode не трогал, остальное могу» | `substantive_answer` (есть partial engagement) |

**Маппинг:** → `declined` (scoped)  
**Policy:** targeted checkpoint → `missed`, **не** завершать весь question; follow-up на другой checkpoint возможен.

**Критично:** отличие от `decline_whole` — иначе «на это не знаю» закроет весь Fiber.

---

### 3.6 `topic_refusal`

**Определение:** кандидат **просит перейти дальше** или явно отказывается от **текущего targeted sub-topic** без классического «не знаю».

**Ключевой тест:** social refusal / skip intent на текущий probe.

| Пример | turn_kind |
|--------|-----------|
| «Давайте дальше» | `topic_refusal` |
| «Эту часть лучше не трогать» | `topic_refusal` |
| «Лучше про другое» | `topic_refusal` |
| «Не скажу про lanes» | `topic_refusal` |
| «Только названия слышал, детали не буду» | `topic_refusal` |

**Маппинг:** → `declined` (targeted)  
**Policy:** как `decline_scoped` для probe — закрыть probe на этом checkpoint, не весь question.

---

### 3.7 `confused`

**Определение:** кандидат говорит, что **не понимает вопрос/формулировку**, но **не отказывается** отвечать и не уточняет scope конкретно.

**Ключевой тест:** «не понял вопрос» без конкретного «вы про X или Y?».

| Пример | turn_kind |
|--------|-----------|
| «Не понял вопрос» | `confused` |
| «Не очень понимаю, о чём вы» | `confused` (ближе к confused, не scope — нет конкретики) |
| «Можете переформулировать?» | `confused` |
| «I'm not sure I understand the question» | `confused` |

**Граница с scope:**

| confused | scope_clarification |
|----------|---------------------|
| «Не понял» (общее) | «Вы про scheduler или work loop?» (конкретное) |
| «Переформулируйте» | «Что именно вам интересно?» |

**Маппинг:** → `confused`  
**Policy:** 1 redirect/clarification, потом stop follow-ups если повтор.

---

### 3.8 `off_topic`

**Определение:** ответ **не относится** к вопросу / checkpoint / диалогу (другая технология, бытовое, бессмыслица).

| Пример | turn_kind |
|--------|-----------|
| «А вы кофе пьёте?» | `off_topic` |
| «Я больше по Vue» (без связи с вопросом про React) | `off_topic` |
| «Не знаю, спросите про TypeScript» | `off_topic` |
| Пустой / «...» / набор символов | `off_topic` |

**НЕ off_topic:**

| Пример | Правильный turn_kind |
|--------|---------------------|
| Ответ про useState на вопрос про useEffect | `substantive_answer` → evaluator: `misunderstood_question` |
| «Не знаю» | `decline_whole` |

**Маппинг:** → `off_topic`  
**Policy:** redirect или skip в зависимости от follow-up budget.

---

### 3.9 `topic_opener_readiness` (контекст `topic_opener_answer`)

**Определение:** отдельный под-тип для **первого** ответа на topic opener («сталкивались с Fiber?»).  
В JSON можно быть полем `opener_readiness` при `message_kind=topic_opener_answer`, либо отдельными turn_kind:

| Значение | Пример | Действие |
|----------|--------|----------|
| `ready` | «Да, работал в проектах» | reveal main question, тон уверенный |
| `uncertain` | «Только слышал, в общих чертах» | reveal, мягкий тон |
| `declined` | «Не знаю эту тему» | reveal с escape hatch |

**Не путать:** «понимаю» в opener = `ready`; «не понимаю тему» = `declined`, не `confused`.

---

## 4. Маппинг `turn_kind` → существующая система

| turn_kind | candidate_disposition | Запускать full evaluator? | Policy highlight |
|-----------|----------------------|----------------------------|------------------|
| `substantive_answer` | `engaged` / `misunderstood_question`* | **да** | normal probe/follow-up |
| `scope_clarification` | `asked_for_scope` | да, но freeze targeted score | `clarification_redirect` |
| `format_clarification` | `asked_for_scope` | да, freeze | format reply template |
| `decline_whole` | `declined` | **нет** (fast path) | complete question |
| `decline_scoped` | `declined` | да (partial) | missed на targeted only |
| `topic_refusal` | `declined` | да | close probe |
| `confused` | `confused` | да | 1 redirect |
| `off_topic` | `off_topic` | да | redirect / skip |

\* `misunderstood_question` определяет **evaluator** по checkpoint overlap, не classifier.

---

## 5. Input контекст для classifier prompt

Classifier получает **минимальный** контекст (дешёвый вызов):

```txt
message_kind: main_answer | follow_up_answer | topic_opener_answer
main_question_text: ...
last_interviewer_message: ...   # follow-up, opener или main reveal
target_checkpoint_title: ...    # если follow-up
target_checkpoint_key: ...      # если есть
local_turns: последние 2–4 реплики (ai + candidate)
candidate_answer: ...
language_hint: ru (primary)
```

**Не передавать:** полный checkpoint rubric, ideal answer, все hints — это задача evaluator.

---

## 6. Prompt classifier (outline)

### System

```txt
You classify the candidate's latest message in a technical interview.
You do NOT score knowledge. You do NOT judge correctness.
You only decide what the candidate is DOING: answering, clarifying, refusing, etc.

Rules:
- Read the latest message IN CONTEXT of the last interviewer message.
- Paraphrases and informal Russian/English count — never keyword matching.
- If the candidate adds ANY technical explanation (even wrong) → substantive_answer, NOT scope_clarification.
- scope_clarification = meta only, NO new technical evidence.
- decline_scoped vs decline_whole: scoped = refuses ONE aspect; whole = refuses entire question.
- When unsure between scope_clarification and substantive_answer with a "?" → prefer substantive_answer if any explanation is present.

Return JSON only:
{ "turn_kind": "...", "confidence": "high|low", "reason": "..." }
```

### User block

Structured context from §5 + **decision checklist** для follow-up:

```txt
Decision checklist:
1. Did the candidate add NEW technical content? → substantive_answer
2. Only asking what you meant / which topic? → scope_clarification
3. Only asking how to answer (brief/detailed)? → format_clarification
4. Refuses entire question? → decline_whole
5. Refuses only this follow-up aspect? → decline_scoped or topic_refusal
6. Says they don't understand the question (vague)? → confused
7. Unrelated content? → off_topic
```

### Версионирование

- Prompt key: `candidate_turn_classifier`
- Version: `1.0.0`
- Golden calibration: отдельный dataset `golden-cases/candidate-turn-classifier/`

---

## 7. Изменения в pipeline

### 7.1 `adaptive-interview-submit.service.ts`

**Было:**

```txt
if (isFullQuestionDecline) → complete question  // до AI
evaluate_turn()
resolveScopeClarificationDisposition()  // regex override
```

**Станет:**

```txt
classifyTurn()  // первый AI call
if (decline_whole) → complete question
if (scope|format clarification) → evaluate with freeze flags, policy clarification
if (substantive|scoped decline|...) → evaluate_turn()
policy reads classifier.turn_kind only (no regex override)
```

### 7.2 Файлы: что убираем из policy path

| Файл | Действие |
|------|----------|
| `candidate-clarification.util.ts` | Убрать `SCOPE_ASK_PATTERNS` из `resolveScopeClarificationDisposition`; оставить `buildClarificationFollowUpQuestion` (генерация ответа) |
| `candidate-decline.util.ts` | Убрать regex из `shouldSkipFollowUps` / fast-path; deprecate `DECLINE_PATTERNS` |
| `topic-opener.util.ts` | `classifyTopicOpenerResponse` → из classifier `opener_readiness` |
| `apply-checkpoint-score-floors.util.ts` | Убрать `resolveScopeClarificationDisposition` override |
| `follow-up-policy.util.ts` | `isScopeClarificationTurn` → `turn_kind === scope|format` |
| `topic-mismatch.util.ts` | skip mismatch при `scope_clarification` / `format_clarification` |
| `probe-policy.util.ts` | `topic_refusal` / `decline_scoped` из classifier |

### 7.3 Что остаётся (не intent)

| Остаётся | Почему |
|----------|--------|
| Парсинг `depth=`, `probe=pending`, `redirect=asked` | machine-readable tags от evaluator |
| `textContainsPhrase(mustConcepts)` | data from question bank |
| `confusionPairs.anchorTerms` | data from question bank |
| `checkpoint-expected-speech.util.ts` | string transform для UX |
| `buildClarificationFollowUpQuestion` parsing «X или Y» | **генерация** ответа, не классификация |

### 7.4 Волна 2 (отдельные subtasks)

| Убрать позже | Замена |
|--------------|--------|
| `legacy-contradiction-cap.util.ts` (~41 regex) | `falseClaims` в bank hints + evaluator |
| `DISTINCTIVE_BAD_ANSWER_PATTERNS` | `badExamples` overlap + evaluator |
| `inferDepthFromRationale` keyword fallback | strict evaluator schema |

---

## 8. Fallback при сбое classifier

```txt
if classifier fails or confidence=low:
  - НЕ использовать regex override как primary
  - conservative: treat as substantive_answer → full evaluate_turn
  - log divergence event: classifier_fallback
  - optional: второй retry с repair prompt
```

Regex **только** как emergency при полном outage AI:

| Env | Default | Поведение |
|-----|---------|-----------|
| `CLASSIFIER_REGEX_EMERGENCY_FALLBACK` | `false` | При `classifyTurn` failed/invalid — `turn_kind` остаётся null, policy идёт через evaluator disposition |
| `CLASSIFIER_REGEX_EMERGENCY_FALLBACK=true` | — | `resolveClassifierEmergencyFallback()` → `inferLegacyTurnKindShadow()` из `legacy-intent-regex.util.ts`; лог `submit_answer.classifier_emergency_fallback` |

Паттерны `SCOPE_ASK_PATTERNS`, `DECLINE_PATTERNS`, `UNCERTAIN/READY_PATTERNS` живут **только** в `legacy-intent-regex.util.ts` (shadow logging + emergency). Policy path использует `turn_kind` / `isTargetedRefusalForPolicy()`.

`buildClarificationFollowUpQuestion` сохраняет **template parsing** (or-choice, format reply) — это генерация ответа, не классификация intent.

---

## 9. Observability

Логировать в `adaptive_ai_debug`:

```json
{
  "phase": "classify_turn",
  "turn_kind": "scope_clarification",
  "confidence": "high",
  "legacy_regex_would_say": "asked_for_scope",
  "divergence": false
}
```

На этапе миграции (фаза 0) — **shadow mode**: classifier + regex параллельно, policy по classifier, лог расхождений.

---

## 10. Golden calibration cases (минимум)

Файл: `backend/src/modules/adaptive-interview/calibration/golden-cases/candidate-turn-classifier.json`

Минимум **30 кейсов**, покрыть:

| Группа | Примеры |
|--------|---------|
| scope | «Что именно?», «Вы про X или Y?», «То есть про scheduler?» |
| format | «Коротко или подробно?» |
| substantive + ? | длинный ответ с «верно?» в конце |
| decline whole | «Не знаю», «Без понятия» |
| decline scoped | «На lanes не знаю», «На это не отвечу» |
| topic refusal | «Давайте дальше» |
| confused | «Не понял вопрос» |
| off_topic | нерелевант |
| opener | ready / uncertain / declined |
| false positive guards | «Не знаю useState, но useEffect...» → substantive |

CI: `golden-calibration.spec.ts` — отдельный suite `candidate-turn-classifier`.

---

## 11. Subtasks (порядок реализации)

| ID | Название | Scope |
|----|----------|-------|
| **14.28** | Candidate turn AI classifier | service, prompt, schema, shadow mode, golden cases |
| **14.29** | Wire classifier into submit + policy | убрать regex override из policy path |
| **14.30** | Deprecate legacy intent regex | удалить `SCOPE_ASK`, `DECLINE_PATTERNS` из hot path |
| **14.31** | Bank-driven false claims | миграция `legacy-contradiction-cap` → hints |

**Один prompt = один subtask.** Начинаем с **14.28**.

---

## 12. Acceptance criteria (блок classifier, 14.28)

- [ ] `CandidateTurnClassifierService` с prompt `1.0.0`
- [ ] Strict JSON schema + Joi validator
- [ ] Маппинг `turn_kind` → `CandidateAnswerDisposition`
- [ ] 30+ golden cases, CI green
- [ ] Shadow logging: classifier vs legacy regex
- [ ] Unit tests на маппинг и validator
- [ ] `pnpm test` + `pnpm build` backend

---

## 13. Связанные документы

- [`docs/evaluation-accuracy/README.md`](./README.md) — общий design evaluation accuracy
- [`docs/tasks/list/14-✅-evaluation-accuracy-analytics/subtasks/027-✅-candidate-clarification-follow-up.md`](../tasks/list/14-✅-evaluation-accuracy-analytics/subtasks/027-✅-candidate-clarification-follow-up.md) — предыдущий regex-based fix (будет superseded)
- `backend/src/modules/adaptive-interview/prompts/per-turn-checkpoint-evaluation.prompt.ts` — disposition block станет secondary после classifier

---

## 14. Wave 4 — Evaluation Mode Router (после live QA attempt #91)

**Проблема:** classifier v1.1.0 верно определяет intent (`scope_clarification`, `decline_scoped`), но downstream всё ещё делает **full re-score всех checkpoint'ов** на meta-turn → GUARD-02, DECL-01.

**Принцип:** только `substantive_answer` может менять cumulative evidence по всем checkpoint'ам. Meta-turn'ы — **target-only или skip**.

### 14.1 Таблица режимов

| `turn_kind` | `EvaluationMode` | Evaluate | Non-target checkpoints |
|-------------|------------------|----------|------------------------|
| `substantive_answer` | `full` | LLM, все CP | guards + merge как сейчас |
| `scope_clarification` | `clarification` | target-only или deterministic | **immutable** (priorState) |
| `format_clarification` | `clarification` | то же | immutable |
| `decline_scoped` | `target_refusal` | deterministic refusal cap | immutable |
| `topic_refusal` | `target_refusal` | то же | immutable |
| `confused` | `redirect` | light / skip | immutable |
| `off_topic` | `redirect` | light | immutable |
| `decline_whole` | `skip` | нет (fast path есть) | — |

### 14.2 Пайплайн

```txt
classifyTurn()
  → resolveEvaluationMode(turn_kind)
  → submit routes: skip | target_refusal update | clarification | full evaluate
  → guards (mode-aware freeze)
  → policy (clarification | target_refusal | normal allocator)
```

### 14.3 Subtasks (по одному агенту)

| ID | Файл | Scope |
|----|------|-------|
| 14.32 | `032-⬜-evaluation-mode-contract.md` | type + `resolveEvaluationMode` + unit tests |
| 14.33 | `033-⬜-submit-evaluation-mode-routing.md` | wire mode в submit + evaluator scope |
| 14.34 | `034-⬜-guards-merge-mode-aware-freeze.md` | GUARD-02 fix |
| 14.35 | `035-⬜-policy-target-refusal-branch.md` | DECL-01 fix |
| 14.36 | `036-⬜-golden-attempt91-meta-turn-regression.md` | golden case + bug closure |

**Регрессионный кейс:** attempt #91 turn 6 (`decline_scoped` на `fiber_pointers`) — `fiber_definition` / `render_phase` / `commit_phase` не обнуляются; policy не re-probe тот же CP.

**Вне scope wave 4:** ENC-01 (mojibake UTF-8 в UI).
