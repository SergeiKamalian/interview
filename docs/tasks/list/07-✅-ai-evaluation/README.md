# 07-⬜-ai-evaluation — AI-оценка интервью

## Цель блока

Построить production-ready pipeline AI-оценки ответов кандидата: checkpoint-анализ по вопросу, финальная агрегированная оценка интервью, расчет score по категориям и полный аудит использования LLM.

## AI Provider

Для всех subtasks блока 07 используется **OpenAI API** (официальный endpoint):

| Env | Значение |
|-----|----------|
| `AI_PROVIDER` | `openai` |
| `AI_BASE_URL` | `https://api.openai.com/v1` (default) |
| `AI_MODEL_EVALUATION` | `gpt-4o-mini` (MVP; можно сменить на `gpt-4o`) |
| `AI_API_KEY` | секрет в `backend/.env`, **не коммитить** |

Режим `compatible` в конфиге оставлен только для локальной отладки с OpenAI-compatible proxy; в production и в task-документации source of truth — OpenAI.

## Контекст

После блока 06 уже существует interview flow и ответы кандидата. В блоке 07 backend вызывает OpenAI Chat Completions, передаёт контекст вопроса из question bank, получает строго структурированный JSON, сохраняет результаты в MySQL и отдаёт данные в dashboard блок 08.

## Что входит в этот блок

- Конфигурация OpenAI-провайдера через env и typed config service.
- Prompt templates для checkpoint-оценки и финальной оценки интервью.
- JSON Schema / runtime validation для ответов модели.
- SQL-таблицы для question-level evaluation, checkpoint result и final evaluation.
- Сервис вычисления score по категориям и нормализация в шкалу 0-100.
- Логирование токенов, latency, estimated cost и provider/model metadata.
- Guardrails против hallucination: source-of-truth только из question bank и transcript.
- GraphQL API для запуска и чтения AI-оценки.
- README с env, ограничениями и сценариями повторной обработки.

## Что НЕ входит в этот блок

- UI отрисовка аналитики и отчетов (блок 08).
- Voice/video pipeline и ASR/TTS (блок 09).
- Fine-tuning модели и хранение dataset для обучения.
- Внешние BI-интеграции и экспорт в сторонние системы.

## Важные архитектурные решения

- Backend NestJS modules: `ai-evaluation`, `ai-provider`, `scoring`, `usage-logging`.
- MySQL storage через raw SQL migration + `DatabaseService` (без ORM).
- Question bank (`questions`, `question_checkpoints`) — единственный источник критериев оценки.
- OpenAI возвращает только структурированный JSON (`response_format: json_object`), который валидируется до записи в БД.
- Каждый AI вызов логируется в `ai_usage_logs` для cost analytics и трассировки.
- Результаты разделены по уровням: вопрос (`question_evaluations`), checkpoint (`checkpoint_results`), интервью (`final_evaluations`).

## Зависимости от предыдущих блоков

- Блок `02-⬜-database-design`: design doc `docs/database/schemas/ai-evaluation.md` — схема evaluations/checkpoint_results/ai_usage_logs должна быть спроектирована до SQL migrations.
- Блок `05-⬜-question-bank`: schema/API question bank (source of truth для checkpoints).
- Блок `06-⬜-interview-core`: интервью, ответы кандидата, transcript и public token flow.
- Блок `01-🟡-backend-foundation`: MySQL, migration runner, GraphQL foundation.

## Ожидаемый результат после завершения блока

Для завершенного интервью можно безопасно запустить AI-оценку: система использует checkpoints из question bank, получает валидный JSON от OpenAI, сохраняет все уровни оценок, считает итоговый score и пишет usage/cost лог.
