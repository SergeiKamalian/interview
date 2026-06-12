# ⬜ TASK-08.6 — Отображение transcript

Status: [ ] todo  
Priority: Medium  
Parent block: `08-⬜-dashboard-analytics`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить отображение transcript кандидата на странице интервью/отчета с таймкодами и поиском по ключевым словам.

## Context

После блоков 07-07 в системе есть интервью, ответы кандидатов и результаты AI-оценки. Блок 08 превращает эти данные в рабочий интерфейс для hiring team: от таблицы интервью до кандидата report page и shortlist действий.

Эта подзадача — часть блока `08-⬜-dashboard-analytics` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Отображение transcript» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Создание question bank (блок 05).
- Public candidate interview UI (блок 06).
- Voice/video capture и playback controls (блок 09, кроме отображения ссылок).
- Внешние BI-дэшборды (Looker/PowerBI).

## Files / Folders Allowed

- `frontend/src/widgets/transcript/TranscriptPanel.tsx`
- `frontend/src/entities/interview/api/interviewTranscriptApi.ts`
- `backend/src/modules/interviews/graphql/interview-transcript.resolver.ts`
- `backend/src/modules/interviews/repositories/interview-transcript.repository.ts`

## Requirements

1. Transcript отображает блоки: вопрос -> ответ кандидата -> optional timestamp.
2. Поиск по transcript подсвечивает совпадения и скроллит к фрагменту.
3. Поддержка длинных transcript через виртуализацию или lazy rendering.
4. Если transcript отсутствует, показывать `Not available yet`.
5. Данные читаются только из сохраненного transcript, без клиентских догадок/генерации.
6. Секция transcript связана с checkpoint evidence для explainability.

## Step-by-step Plan

1. Реализовать backend query transcript по interview id.
2. Создать frontend компонент `TranscriptPanel` с поиском.
3. Интегрировать панель в details/report страницы.
4. Добавить link-to-evidence: клик по checkpoint открывает соответствующий transcript фрагмент.
5. Проверить поведение на большом transcript (>1000 строк).

## Acceptance Criteria

- Transcript читаем и полезен для ревью.
- Поиск и навигация по фрагментам работают.
- Нет попыток генерировать transcript на клиенте.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
