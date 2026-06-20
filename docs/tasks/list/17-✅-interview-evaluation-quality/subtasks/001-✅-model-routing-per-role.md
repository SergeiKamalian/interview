# TASK-17.1 — Model routing per role

Status: [x] done

## Goal

Назначить модель каждой роли пайплайна оценки, а не гонять всё на одной `AI_MODEL_EVALUATION`. Сильная/reasoning-модель — на checkpoint-evaluator и final-evaluation (там критична точность); дешёвая/быстрая — на classifier, scoring-gate, interviewer-voice, opener. Это «разные ИИ под разные задачи» без новых сервисов.

## Depends on

- Нет (идёт первым, максимальный эффект при минимальном риске).

## Context

- Сейчас единственная модель из `AI_MODEL_EVALUATION` → `config.modelEvaluation` → `toClientConfig().model`. Все роли используют её.
- **Инфраструктура уже почти готова**: все методы `AiProviderService` принимают `options.model` и делают `options?.model ?? config.modelEvaluation` (см. `backend/src/modules/ai-provider/ai-provider.service.ts`, строки ~110/219/320/426/528). То есть достаточно резолвера `operationType → model` и проброса `options.model` в местах вызова.
- Операции (`operationType`) уже прокидываются в debug/usage-log: `evaluate_turn`, `evaluate_turn_prewarm`, `classify_turn` (см. classifier), follow-up planning, voice/opener generation, final evaluation, question summary.

## Scope

- `backend/src/common/config/ai.schema.ts`:
  - добавить опциональные env: `AI_MODEL_CLASSIFIER`, `AI_MODEL_FOLLOW_UP`, `AI_MODEL_VOICE`, `AI_MODEL_FINAL` (и при необходимости `AI_MODEL_SUMMARY`). Все опциональные, дефолт — `AI_MODEL_EVALUATION`.
  - расширить `AiConfig`/Joi-схему и `aiConfig` registerAs соответствующими полями.
- Резолвер `operationType → model`: новый util (например `backend/src/modules/ai-provider/model-routing.util.ts`) или метод на `AiProviderService`/`AiProviderConfig`, который по строке operationType возвращает нужную модель (fallback на `modelEvaluation`).
- Проброс `options.model` в местах вызова LLM по ролям:
  - `candidate-turn-classifier.service.ts` → classifier-модель;
  - `follow-up-planner.service.ts` (LLM-ветка) → follow-up-модель;
  - opener/voice (`main-question-opener.service.ts`, `topic-opener.util.ts` и т.п.) → voice-модель;
  - `final-evaluation.service.ts` → final-модель;
  - `per-turn-checkpoint-evaluator.service.ts` → оставить evaluation-модель (можно явно).
- Обновить `backend/.env.example` (закомментированные новые переменные + краткое описание «модель под роль»).
- НЕ ломать дефолт: при отсутствии новых env поведение байт-в-байт прежнее.

## Verification

- `pnpm -C backend build` + targeted eslint на изменённых файлах.
- Unit-тест резолвера: маппинг operationType → model, fallback на `modelEvaluation` при пустых env.
- Запуск с пустыми новыми env: модель везде = `AI_MODEL_EVALUATION` (регресс-нейтрально).
- Запуск с заданными env: в usage-log / debug видно, что разные операции уходят на разные модели (`SELECT operation_type, model, COUNT(*) FROM ai_usage_logs ... GROUP BY 1,2`).
- (Желательно) перепрогон оценки attempt 102 с сильной моделью на evaluator+final и фиксация «было/стало» (балл сильного senior должен заметно вырасти).

## Completion Notes

### Что добавлено (env)

В `backend/src/common/config/ai.schema.ts` добавлены **опциональные** env (все с дефолтом = `AI_MODEL_EVALUATION`):

- `AI_MODEL_FINAL` — сильная модель для финальной оценки (`final_summary`).
- `AI_MODEL_CLASSIFIER` — дешёвая модель для `candidate_turn_classifier` + `topic_opener_scoring_gate`.
- `AI_MODEL_FOLLOW_UP` — дешёвая модель для `plan_follow_up`.
- `AI_MODEL_VOICE` — дешёвая модель для `main_question_opener` + `main_question_reveal`.

Checkpoint-evaluator (`evaluate_turn` / `evaluate_turn_prewarm`) намеренно остаётся на `AI_MODEL_EVALUATION` (это и есть сильная модель оценки — отдельная env не нужна). `AI_MODEL_SUMMARY` не добавлялась: LLM-роли question-summary в пайплайне нет (`QuestionSummaryService` строит сводку детерминированно из checkpoint-states).

Расширены: Joi-схема (`aiEnvValidationSchema`, optional + allow('')), тип `AiConfig` (поля `modelClassifier/modelFollowUp/modelVoice/modelFinal`), `aiConfig` registerAs (хелпер `resolveRoleModel` → trim, пусто → `modelEvaluation`).

### Как устроен резолвер

Новый util `backend/src/modules/ai-provider/model-routing.util.ts`:

- `OPERATION_TYPE_TO_ROLE` — карта `operationType → role` (`evaluation | classifier | followUp | voice | final`).
- `buildAiRoleModels(config)` — собирает таблицу моделей по ролям из `AiConfig`.
- `resolveModelForOperation(operationType, models)` — неизвестный/пустой operationType → роль `evaluation` (т.е. `AI_MODEL_EVALUATION`).

Метод `AiProviderConfig.resolveModel(operationType?)` оборачивает резолвер. В `AiProviderService` дефолт модели во всех 5 методах изменён с `config.modelEvaluation` на `options?.model ?? this.aiProviderConfig.resolveModel(options?.debug?.operationType)`. Так как все вызовы LLM уже прокидывают `debug.operationType`, маршрутизация централизована и срабатывает автоматически. Единственный явный фикс call-site — `final-evaluation.service.ts`: `evaluateJson(..., { attemptId, operationType: 'final_summary' })` (раньше debug не передавался → шло как `chat_completion` на evaluation-модель). Явный `options.model` по-прежнему приоритетнее резолвера.

### Регресс-нейтральность

При отсутствии новых env каждая роль резолвится в `AI_MODEL_EVALUATION` → поведение байт-в-байт прежнее. Подтверждено тестами (см. ниже).

### Проверки (команды / ожидание / факт)

- `pnpm -C backend build` → ожидал успешную компиляцию → **exit 0**.
- `eslint` на изменённых файлах (`ai.schema.ts`, `model-routing.util.ts`, `.spec.ts`, `ai-provider.config.ts`, `ai-provider.service.ts`, `final-evaluation.service.ts`, `ai.schema.spec.ts`) → **0 ошибок** (попутно поправлен 1 pre-existing prettier-перенос в `final-evaluation.service.ts`).
- `jest model-routing.util.spec.ts` (резолвер: маппинг ролей + fallback на evaluation для unknown/undefined + регресс-набор при пустых env) → **19/19 passed**.
- `jest ai.schema.spec.ts` (registerAs: пустые env → все роли = `AI_MODEL_EVALUATION`; пустая строка/пробелы → fallback; заданные env → разные модели по ролям) → **3 кейса, всё passed** (суммарно 22/22 с резолвером).
- DB-проверка реальных `operation_type` в `ai_usage_logs` (`docker exec ... GROUP BY operation_type, model`): подтвердились значения `evaluate_turn`, `evaluate_turn_prewarm`, `final_summary`, `plan_follow_up`, `evaluate_answer` — совпадают с картой `OPERATION_TYPE_TO_ROLE`. Классификатор/opener/scoring-gate в usage-log не пишутся, но их `debug.operationType` идёт в `AiProviderService` (где и происходит routing).

### Не выполнено / отложено

- Полный live-прогон интервью с заданными per-role env и сверкой «разные операции → разные модели» через `ai_usage_logs` требует реального API-ключа и запущенной сессии; механизм маршрутизации проверен детерминированно (unit + config + соответствие реальным operation_type). Перепрогон оценки attempt 102 «было/стало» — это калибровочная цель блока, она закрывается в TASK-17.6 (после фиксов false-positive/denominator/coverage), здесь сделана только инфраструктура routing.
