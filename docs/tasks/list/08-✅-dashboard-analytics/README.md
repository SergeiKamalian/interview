# 08-✅-dashboard-analytics — Dashboard и аналитика

## Цель блока

Реализовать recruiter dashboard: список интервью, карточки кандидатов, детальный отчет с transcript/checkpoints/score и аналитикой по навыкам, темам и стоимости AI.

## Контекст

После блоков 06–07 в системе есть интервью, ответы кандидатов и результаты AI-оценки. Блок 08 превращает эти данные в рабочий интерфейс для hiring team: от таблицы интервью до candidate report page и shortlist действий.

## Что входит в этот блок

- Dashboard routes и layout для company user.
- Страница списка интервью с фильтрами и пагинацией.
- Страница деталей интервью и кандидата.
- Таблица кандидатов с основными метриками оценки.
- Candidate report page с transcript и checkpoint explainability.
- Визуализация score, category breakdown и recommendation.
- Аналитика по topic/skill/question и AI cost analytics.
- Shortlist feature для workflow рекрутера.
- Интеграция frontend с GraphQL API backend.

## Что НЕ входит в этот блок

- Создание question bank (блок 05).
- Public candidate interview UI (блок 06).
- Voice/video capture и playback controls (блок 09, кроме отображения ссылок).
- Внешние BI-дэшборды (Looker/PowerBI).

## Важные архитектурные решения

- Frontend FSD-like: `pages/dashboard/*`, `entities/interview`, `entities/candidate`, `widgets/analytics`.
- Data layer: RTK Query + GraphQL endpoints с typed mapping.
- Charts: легковесная библиотека (`recharts`/`nivo`) или собственные bar components.
- Server-side source of truth: `interviews`, `question_evaluations`, `checkpoint_results`, `final_evaluations`, `ai_usage_logs`.
- Role-aware доступ: только company users видят dashboard данные.
- Списки и карточки должны работать с empty/loading/error состояниями.

## Зависимости от предыдущих блоков

- Блок `02-⬜-database-design`: design doc `docs/database/schemas/analytics-cost.md` — analytics views и shortlist model.
- Блок `04-⬜-auth-company`: auth и company access control.
- Блок `06-⬜-interview-core`: интервью и кандидатские ответы.
- Блок `07-⬜-ai-evaluation`: AI evaluation и usage logs.
- Блок `03-⬜-frontend-foundation`: router/store/rtk-query/ui primitives.

## Ожидаемый результат после завершения блока

Рекрутер может открыть dashboard, увидеть интервью и кандидатов, перейти в детальный отчет с transcript/checkpoints/scores, проанализировать cost AI и пометить сильных кандидатов в shortlist.
