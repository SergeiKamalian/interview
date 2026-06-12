# ⬜ TASK-03.10 — Базовые UI primitives

Status: [ ] todo  
Priority: Medium  
Parent block: `03-⬜-frontend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать переиспользуемые компоненты Button, Input, Card, Spinner, Alert в `shared/ui` с Tailwind и variant props.

## Context

Dashboard и public candidate flow будут потреблять GraphQL API backend. RTK Query — единый data layer; REST только для upload/health. Структура папок — FSD-like: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.

Эта подзадача — часть блока `03-⬜-frontend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Базовые UI primitives» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth forms и protected routes (блок 04).
- Question bank UI (блок 05).
- Interview public flow (блок 06).
- Dashboard pages (блок 08).
- Voice/video (блок 09).

## Files / Folders Allowed

- `frontend/src/shared/ui/Button/Button.tsx`
- `frontend/src/shared/ui/Input/Input.tsx`
- `frontend/src/shared/ui/Card/Card.tsx`
- `frontend/src/shared/ui/Spinner/Spinner.tsx`
- `frontend/src/shared/ui/Alert/Alert.tsx`
- `frontend/src/shared/ui/index.ts`

## Requirements

1. Button: variants primary/secondary/ghost, sizes sm/md/lg, disabled, loading.
2. Input: label, error message, type text/email/password.
3. Card: header, body, footer slots.
4. Spinner: aria-label.
5. Alert: success/error/info.
6. Export barrel index.

## Step-by-step Plan

1. Создать компоненты с Tailwind.
2. Добавить на HomePage demo section.
3. Проверить a11y basics (focus, aria).

## Acceptance Criteria

- 5 primitives экспортируются из shared/ui.
- Variants работают.
- Используются на placeholder page.

## Checks

```bash
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
