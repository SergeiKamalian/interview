# ⬜ TASK-06.3 — Публичный токен интервью

Status: [ ] todo  
Priority: High  
Parent block: `06-⬜-interview-core`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить генерацию и валидацию `public_token` для кандидата: безопасный, уникальный, используемый в public API.

## Context

Question bank уже готов как source of truth, auth для рекрутера реализован. Теперь нужно связать всё в жизненный цикл интервью: recruiter создаёт интервью, кандидат по публичной ссылке отвечает, система сохраняет сообщения и завершает попытку с итоговым статусом.

Эта подзадача — часть блока `06-⬜-interview-core` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Публичный токен интервью» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- AI scoring и автоматическая оценка качества ответов (блок 07).
- Advanced recruiter dashboard analytics (блок 08).
- Voice/video каналы и media processing (блок 09).
- Email/SMS приглашения и напоминания (блок 11).
- Production hardening и release pipeline (блок 11).

## Files / Folders Allowed

- `backend/src/modules/interview/token/public-token.service.ts`
- `backend/src/modules/interview/interview.service.ts`
- `backend/migrations/009_create_interviews.sql` (verify unique index)

## Requirements

1. Токен генерируется криптостойко (`crypto.randomBytes`), length >= 24 bytes base64url.
2. UNIQUE в БД на `public_token`.
3. Публичные операции ищут interview только по token + status.
4. Логи не должны печатать токен полностью (маскировать).

## Step-by-step Plan

1. Реализовать token generator и retry при коллизии.
2. Интегрировать генерацию в `createInterview`.
3. Добавить query lookup по token для public flow.
4. Проверить uniqueness нагрузочным тестом (light).

## Acceptance Criteria

- Каждое interview имеет уникальный public token.
- Token безопасен для публичной ссылки.
- Lookup по токену работает стабильно.

## Checks

```bash
cd backend && npm run build
docker compose exec mysql mysql -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e 'SELECT public_token FROM interviews LIMIT 5;'
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
