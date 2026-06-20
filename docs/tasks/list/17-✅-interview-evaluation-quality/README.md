# 17-🟡-interview-evaluation-quality — Калибровка и качество оценки интервью

## Цель блока

Починить калибровку оценки: сильный кандидат должен получать высокий балл, корректные ответы не должны помечаться как ошибочные, а глубина probing не должна структурно занижать балл. Плюс — назначить правильную модель каждой роли пайплайна (model routing), а не гонять всё на одной слабой модели.

Главная боль: **сильный senior получил 5.5/10 «average / maybe»** (attempt 102, interview 31) при образцовых развёрнутых ответах.

---

## Источник правды (доказательная база)

Анализ построен на реальном прогоне **attempt 102 / interview 31** (БД `ai_interviewer`, контейнер `ai-interviewer-local-mysql-1`, порт 3322).

### Факты прогона

| Параметр | Значение |
|---|---|
| Кандидат | Sergey Frontend (`candidate.test+strong@example.com`) |
| Конфиг интервью | tone=`friendly`, depth=`shallow`, strictness=`lenient` |
| Длины ответов кандидата | 2103 / 2447 / 2334 / 3269 / 2592 символов (в БД ПОЛНЫЕ) |
| Модель оценки | `gpt-5.4-nano` (одна на все роли) |
| Q55 (виртуализация React) | 4.76/10 → «weak», `0/7 checkpoints covered` |
| Q56 (замыкания JS) | 7.16/10 → «medium», `0/6 checkpoints covered` |
| Финал | **5.5/10, category=average, recommendation=maybe** |

### Корневые причины (из `interview_checkpoint_states` и `final_evaluations`)

1. **Слабая модель оценки.** `gpt-5.4-nano` на checkpoint-eval и final. В rationale прямые самопротиворечия: `accuracy=wrong ... суть виртуализации сохранена и не противоречит`.
2. **Ложные `false_claim` / `accuracy=wrong`.** Корректные определения помечаются как «material errors» → срабатывает contradiction-cap. `evidence_summary` при этом = первое предложение ответа (`да, сталкивался много раз`), т.е. «доказательство» нерелевантно.
3. **`shallow` + штраф за неспрошенные чекпоинты = гарантированно низкий балл.** Неспрошенные чекпоинты (`when_to_use`, `libraries_ecosystem`, `followup_concepts`, `memory_leak_dom`) стоят `missed=0.00` и топят итог.
4. **Статус `covered` недостижим → отчёт врёт «0/7 covered».** Максимум — `partial`. Финал считает «покрытием» только `covered`, заносит «0/7» в weaknesses/risks и снижает рекомендацию.
5. **`strictness=lenient` не смягчает по факту.** Floor'ы применяются (`Positive evidence floor applied`), но `false_claim`-cap их перебивает.
6. **Оценщик «не видит» полный ответ.** В rationale `ответ обрывается`, хотя ответы целые (2000–3300 символов).

---

## Архитектура оценки (как есть сейчас)

Пайплайн **уже разделён по ролям** (за один ответ кандидата):

```text
ответ кандидата
   ├─ 1. CandidateTurnClassifier   → сила/намерение ответа (turnKind + disposition + readiness)
   ├─ 2. TopicOpenerScoringGate    → стоит ли оценивать opener
   ├─ 3. PerTurnCheckpointEvaluator→ оценка чекпоинтов (+ combined: сразу suggested follow-up)
   ├─ 4. FollowUpPlanner           → продолжать ли probing, по какому чекпоинту
   ├─ 5. InterviewerVoice/Opener   → живой текст вопроса
   └─ (конец вопроса) QuestionSummary; (конец интервью) FinalEvaluation
```

Проблема не в нехватке ролей, а в том, что:
- все роли используют одну модель (`AiProviderService` → `config.modelEvaluation`);
- роль оценщика перегружена (`ADAPTIVE_AI_COMBINED_TURN=true`: оценка и follow-up одним вызовом);
- логика гардов/промптов даёт ложные срабатывания.

> Важно: `options.model` уже поддерживается во всех методах `AiProviderService` (`options?.model ?? config.modelEvaluation`), поэтому model routing — низкорисковый: нужен резолвер `operationType → model` и проброс `options.model`.

---

## Входит в блок

- **Model routing per role** (env `AI_MODEL_*` + резолвер по operationType + проброс).
- Фикс ложных `false_claim`/`accuracy=wrong` (промпты оценщика + guard-util).
- Согласование probing depth и знаменателя скоринга (не штрафовать неспрошенные чекпоинты).
- Достижимость статуса `covered` + корректный подсчёт «покрытия» в финале.
- Гарантия попадания полного ответа в оценщик + честный `evidence_summary`.
- Калибровка: golden-кейсы «сильный senior» + assert score-bands, регресс на attempt 102.
- (Опционально) разнести combined-turn (оценка ≠ follow-up).
- Data hygiene + ревизия `question_evaluations`.

---

## Не входит

- Новые роли/сервисы ИИ (роли уже есть — дробить дальше не нужно).
- Изменение `max_score` / checkpoints / критериев банка (source of truth неизменна).
- Изменение UX кандидата (балл кандидату не показываем — это правильно).
- Proctoring / anti-cheat.

---

## Architecture Rules

- `question bank` — source of truth. Меняем ТОЛЬКО логику оценки, не критерии/веса/`max_score`.
- Backend imports без `.js` suffix; GraphQL — основной API.
- Любой фикс оценки проверяется регрессом на attempt 102 («сильный senior должен получить ≥ 8/10, strong, invite/strong_invite») и прогоном `golden-calibration.spec.ts`.
- Model routing не должен ломать дефолт: при отсутствии новых env всё падает обратно на `AI_MODEL_EVALUATION` (байт-в-байт прежнее поведение).

---

## Ключевые файлы (карта кода)

- Конфиг модели: `backend/src/common/config/ai.schema.ts`, `backend/src/modules/ai-provider/ai-provider.config.ts`, `backend/src/modules/ai-provider/ai-provider.service.ts` (везде `options?.model ?? config.modelEvaluation`).
- Оценщик: `backend/src/modules/adaptive-interview/services/per-turn-checkpoint-evaluator.service.ts`.
- Промпты оценки: `backend/src/modules/adaptive-interview/prompts/per-turn-checkpoint-evaluation.prompt.ts`, `.../prompts/adaptive-ai-conversation.prompt.ts`.
- Гарды/floor'ы: `backend/src/modules/adaptive-interview/utils/apply-checkpoint-score-floors.util.ts`, `.../utils/bad-answer-signature.util.ts`, `.../utils/false-claim-quote.util.ts`, `.../utils/scoring-strictness.util.ts`, `.../utils/probe-policy.util.ts`.
- Контекст-пакет: `backend/src/modules/adaptive-interview/utils/build-adaptive-interview-context.util.ts`, `.../services/adaptive-interview-context.service.ts`, `.../utils/checkpoint-evidence-text.util.ts`.
- Классификатор / planner: `.../services/candidate-turn-classifier.service.ts`, `.../services/follow-up-planner.service.ts`.
- Финал: `backend/src/modules/ai-evaluation/services/final-evaluation.service.ts`, `.../prompts/final-evaluation.prompt.ts`.
- Калибровка: `backend/src/modules/adaptive-interview/calibration/golden-calibration.spec.ts` (+ `golden-cases/*.json`).
- Combined-turn флаг: `backend/src/modules/adaptive-interview/config/adaptive-interview-context.config.ts` (`ADAPTIVE_AI_COMBINED_TURN`).

---

## Как воспроизвести данные прогона

```bash
docker exec ai-interviewer-local-mysql-1 \
  mysql --default-character-set=utf8mb4 -uai_interviewer -pchangeme ai_interviewer \
  -e "SELECT interview_question_id qid, status, score_awarded, max_score, follow_up_count, LEFT(rationale,120) r \
      FROM interview_checkpoint_states WHERE interview_attempt_id=102 ORDER BY interview_question_id;"
```
