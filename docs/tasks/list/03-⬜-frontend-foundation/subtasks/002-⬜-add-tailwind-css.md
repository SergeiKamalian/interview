# ⬜ TASK-03.2 — Подключение Tailwind CSS

Status: [ ] todo  
Priority: High  
Parent block: `03-⬜-frontend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Настроить Tailwind CSS 3+ с postcss, базовыми цветами бренда и `@tailwind` directives в global CSS.

## Context

Dashboard и public candidate flow будут потреблять GraphQL API backend. RTK Query — единый data layer; REST только для upload/health. Структура папок — FSD-like: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.

Эта подзадача — часть блока `03-⬜-frontend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Подключение Tailwind CSS» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth forms и protected routes (блок 04).
- Question bank UI (блок 05).
- Interview public flow (блок 06).
- Dashboard pages (блок 08).
- Voice/video (блок 09).

## Files / Folders Allowed

- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/src/app/styles/index.css`

## Requirements

1. Пакеты: `tailwindcss`, `postcss`, `autoprefixer`.
2. Content paths: `./index.html`, `./src/**/*.{ts,tsx}`.
3. CSS variables для primary/secondary (optional).
4. Импорт CSS в `main.tsx`.

## Step-by-step Plan

1. Установить Tailwind.
2. Создать config и postcss.
3. Добавить test markup с utility classes.
4. Проверить стили в dev.

## Acceptance Criteria

- Tailwind classes применяются.
- Build включает purged CSS.

## Checks

```bash
cd frontend && npm run build
grep -q '@tailwind base' frontend/src/app/styles/index.css
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
