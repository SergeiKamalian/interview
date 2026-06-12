# ✅ TASK-03.1 — Создание Vite React TypeScript приложения

Status: [x] done  
Priority: High  
Parent block: `03-✅-frontend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Инициализировать Vite + React 18 + TypeScript в `frontend/` с npm scripts и strict TS config.

---

## Completion Notes

**Сделано:**

- Vite + React 19 + TypeScript в `frontend/` (pnpm)
- `package.json`: scripts `dev`, `build`, `preview`, `lint`; name `ai-interviewer-frontend`
- `tsconfig.app.json`: `"strict": true`
- `vite.config.ts`: port 5173, proxy `/graphql` и `/health` → `http://127.0.0.1:3000`
- Минимальный `App.tsx` placeholder (без broken hero.png import)
- `index.html` title: AI Interviewer

**Проверки:**

| Команда | Ожидание | Результат |
|---------|----------|-----------|
| `cd frontend && pnpm run build` | exit 0 | OK (~95ms vite build) |
| `cd frontend && pnpm run lint` | exit 0 | OK, no errors |

**Follow-ups:** TASK-03.2 Tailwind CSS
