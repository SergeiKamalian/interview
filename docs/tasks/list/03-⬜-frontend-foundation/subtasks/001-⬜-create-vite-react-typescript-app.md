# ⬜ TASK-03.1 — Создание Vite React TypeScript приложения

Status: [ ] todo  
Priority: High  
Parent block: `03-⬜-frontend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Инициализировать Vite + React 18 + TypeScript в `frontend/` с npm scripts и strict TS config.

## Context

Dashboard и public candidate flow будут потреблять GraphQL API backend. RTK Query — единый data layer; REST только для upload/health. Структура папок — FSD-like: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.

Эта подзадача — часть блока `03-⬜-frontend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Создание Vite React TypeScript приложения» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth forms и protected routes (блок 04).
- Question bank UI (блок 05).
- Interview public flow (блок 06).
- Dashboard pages (блок 08).
- Voice/video (блок 09).

## Files / Folders Allowed

- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json`
- `frontend/tsconfig.app.json`
- `frontend/index.html`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`

## Requirements

1. Шаблон: `npm create vite@latest frontend -- --template react-ts`.
2. Scripts: `dev`, `build`, `preview`, `lint`.
3. Strict mode в tsconfig.
4. Proxy `/graphql` → backend в vite.config (dev).

## Step-by-step Plan

1. Создать Vite project в `frontend/`.
2. Настроить vite.config.ts (port 5173).
3. Проверить `npm run dev` и `npm run build`.

## Acceptance Criteria

- Vite dev server стартует.
- Production build успешен.
- TypeScript strict без ошибок.

## Checks

```bash
cd frontend && npm run build
cd frontend && npm run lint
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
