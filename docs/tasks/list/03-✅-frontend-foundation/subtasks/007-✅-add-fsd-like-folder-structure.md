# ✅ TASK-03.7 — FSD-like структура папок

Status: [x] done  
Priority: Medium  
Parent block: `03-✅-frontend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Организовать `src/` по слоям FSD-like с path aliases в tsconfig и vite.

## Context

Dashboard и public candidate flow будут потреблять GraphQL API backend. RTK Query — единый data layer; REST только для upload/health. Структура папок — FSD-like: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.

Эта подзадача — часть блока `03-✅-frontend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «FSD-like структура папок» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth forms и protected routes (блок 04).
- Question bank UI (блок 05).
- Interview public flow (блок 06).
- Dashboard pages (блок 08).
- Voice/video (блок 09).

## Files / Folders Allowed

- `frontend/src/app/`
- `frontend/src/pages/`
- `frontend/src/widgets/`
- `frontend/src/features/`
- `frontend/src/entities/`
- `frontend/src/shared/`
- `frontend/tsconfig.json`
- `frontend/vite.config.ts`

## Requirements

1. Слои: app (bootstrap), pages, widgets, features, entities, shared.
2. Alias: `@app`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared`.
3. Переместить существующие файлы в правильные слои.
4. README stub в каждом слое (1-2 строки).

## Step-by-step Plan

1. Создать папки слоёв.
2. Настроить aliases.
3. Переместить router, store в `app/`.
4. Обновить imports.
5. Проверить build.

## Acceptance Criteria

- Все слои существуют.
- Aliases резолвятся.
- Build без broken imports.

## Checks

```bash
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
