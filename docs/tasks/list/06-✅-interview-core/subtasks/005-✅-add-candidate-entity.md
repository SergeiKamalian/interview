# ⬜ TASK-06.5 — Сущность кандидата

Status: [ ] todo  
Priority: Medium  
Parent block: `06-⬜-interview-core`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить сущность `candidates` для хранения данных участника интервью, связанного с конкретным interview и компанией.

## Context

Question bank уже готов как source of truth, auth для рекрутера реализован. Теперь нужно связать всё в жизненный цикл интервью: recruiter создаёт интервью, кандидат по публичной ссылке отвечает, система сохраняет сообщения и завершает попытку с итоговым статусом.

Эта подзадача — часть блока `06-⬜-interview-core` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Сущность кандидата» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- AI scoring и автоматическая оценка качества ответов (блок 07).
- Advanced recruiter dashboard analytics (блок 08).
- Voice/video каналы и media processing (блок 09).
- Email/SMS приглашения и напоминания (блок 11).
- Production hardening и release pipeline (блок 11).

## Files / Folders Allowed

- `backend/migrations/011_create_candidates.sql`
- `backend/src/modules/candidate/candidate.module.ts`
- `backend/src/modules/candidate/candidate.repository.ts`

## Requirements

1. Поля: `id`, `company_id`, `interview_id`, `email`, `full_name`, `phone` optional, timestamps.
2. UNIQUE (`interview_id`, `email`) для исключения дублей в рамках интервью.
3. FK на `interviews` и `companies`.
4. PII хранится минимально необходимое, без лишних атрибутов.

## Step-by-step Plan

1. Создать SQL миграцию таблицы candidates.
2. Добавить repository методы поиска/создания кандидата.
3. Подключить модуль в interview public flow.
4. Проверить duplicate email constraint.

## Acceptance Criteria

- Кандидат может быть создан и найден по interview/email.
- Ограничения целостности работают.
- Сущность готова для attempt flow.

## Checks

```bash
cd backend && npm run migrate
cd backend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
