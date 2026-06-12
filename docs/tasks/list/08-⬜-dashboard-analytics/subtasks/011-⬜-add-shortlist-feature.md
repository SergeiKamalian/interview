# ⬜ TASK-08.11 — Функция shortlist кандидатов

Status: [ ] todo  
Priority: High  
Parent block: `08-⬜-dashboard-analytics`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Внедрить полноценную shortlist функциональность: пометка кандидатов, причины, фильтрация и быстрый доступ к топ-кандидатам.

## Context

После блоков 07-07 в системе есть интервью, ответы кандидатов и результаты AI-оценки. Блок 08 превращает эти данные в рабочий интерфейс для hiring team: от таблицы интервью до кандидата report page и shortlist действий.

Эта подзадача — часть блока `08-⬜-dashboard-analytics` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Функция shortlist кандидатов» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Создание question bank (блок 05).
- Public candidate interview UI (блок 06).
- Voice/video capture и playback controls (блок 09, кроме отображения ссылок).
- Внешние BI-дэшборды (Looker/PowerBI).

## Files / Folders Allowed

- `backend/migrations/0yb_create_candidate_shortlist.sql`
- `backend/src/modules/shortlist/shortlist.module.ts`
- `backend/src/modules/shortlist/graphql/shortlist.resolver.ts`
- `backend/src/modules/shortlist/repositories/shortlist.repository.ts`
- `frontend/src/features/shortlist/ui/ShortlistToggleButton.tsx`
- `frontend/src/entities/candidate/api/shortlistApi.ts`
- `frontend/src/pages/dashboard/candidates/CandidatesPage.tsx`

## Requirements

1. Таблица `candidate_shortlist`: `id`, `company_id`, `candidate_id`, `status`, `reason`, `created_by`, `created_at`, `updated_at`.
2. Уникальность `(company_id, candidate_id)`.
3. Status enum: `shortlisted`, `removed` (soft-state).
4. Mutation API: add/remove shortlist с optional reason.
5. Candidates page поддерживает фильтр `shortlisted only`.
6. События shortlist учитываются в audit trail.

## Step-by-step Plan

1. Добавить SQL-миграцию shortlist таблицы.
2. Реализовать backend resolver/mutations и repository upsert.
3. Добавить RTK Query endpoints для toggle действий.
4. Интегрировать кнопку shortlist в candidate table и report page.
5. Проверить race conditions при быстрых повторных кликах (disable button while pending).

## Acceptance Criteria

- Shortlist workflow работает end-to-end.
- Статус кандидата стабильно отображается в таблицах и карточках.
- Есть аудит изменений shortlist по компании.

## Checks

```bash
cd backend && npm run migrate
cd backend && npm run build
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
