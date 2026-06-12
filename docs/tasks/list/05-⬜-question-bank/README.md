# 05-⬜-question-bank — Банк вопросов

## Цель блока

Построить source-of-truth банк вопросов для интервью: схема MySQL, миграции raw SQL, GraphQL API и CRUD-сервисы, плюс базовые данные и admin UI placeholders.

## Контекст

Question bank используется рекрутером для подготовки интервью и кандидатом в flow блока 06. Данные должны быть строго структурированы: категория, сложность, чекпоинты, веса и примеры good/bad ответов, чтобы затем AI evaluation мог опираться на единый источник.

## Что входит в этот блок

- MySQL сущности question bank и связи между ними.
- SQL миграции для таблиц банка вопросов.
- GraphQL query/mutation для чтения и управления вопросами.
- Backend CRUD-сервисы с валидацией бизнес-правил.
- Seed набор вопросов для frontend/demo окружения.
- Validation rules: длина текста, диапазоны весов, уникальность ключей.
- Admin UI placeholders в dashboard для будущего редактора.
- Checkpoint weights и примеры good/bad answer в модели.

## Что НЕ входит в этот блок

- Полноценный WYSIWYG редактор вопросов.
- Версионирование вопросов и audit trail.
- Импорт из внешних ATS/LMS систем.
- AI auto-generation вопросов.
- Финальный production UI question manager (блок 08+).

## Важные архитектурные решения

- Question bank в MySQL — source of truth для interview selection.
- NestJS modules: `question-bank` + GraphQL resolvers + services.
- Raw SQL migrations (`backend/migrations/`) без ORM.
- GraphQL защищён через auth guards, операции scoped по company.
- Frontend React Vite RTK Query читает банк через `/graphql`.
- Модель расширяема: checkpoint-и и answer examples выделены в отдельные таблицы.

## Зависимости от предыдущих блоков

- Блок `02-⬜-database-design`: design doc `docs/database/schemas/question-bank.md` — схема professions/skills/topics/questions/checkpoints должна быть спроектирована до SQL migrations.
- Блок `04-⬜-auth-company`: users/companies/auth guards для защищённого доступа.
- Блок `01-🟡-backend-foundation`: migration runner, GraphQL foundation, DatabaseService.
- Блок `03-⬜-frontend-foundation`: admin UI placeholders.

## Ожидаемый результат после завершения блока

Компания может создавать и получать вопросы через GraphQL, данные валидируются на backend, есть seed для демо, а dashboard имеет заготовку интерфейса question bank для следующих блоков.
