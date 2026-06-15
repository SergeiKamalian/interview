# Frontend

React + Vite + TypeScript + Tailwind + Redux Toolkit + RTK Query + GraphQL.

**Эталон frontend:** `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-panel` — структура `src/`, routing, UI-паттерны.

**Отличие от эталона:** data layer — RTK Query + GraphQL (в `captcha-panel` — Effector + REST).

## Scripts

```bash
pnpm install
pnpm run dev      # http://localhost:5174
pnpm --dir ../backend run dev:local  # full local stack from backend, frontend on http://localhost:5174
pnpm run build
pnpm run lint
```

## Environment

Copy `.env.example` → `.env.development` (or `.env.local`).

| Variable | Description |
|----------|-------------|
| `VITE_GRAPHQL_URL` | GraphQL endpoint (dev default: `/graphql` via Vite proxy) |
| `VITE_API_URL` | REST API base for files/health (optional) |
| `VITE_APP_NAME` | App title in layouts |

Typed access: `src/shared/config/env.ts`

## Structure (FSD-like)

```txt
src/
  app/       — bootstrap, router, store, styles
  pages/     — route pages
  widgets/   — layouts, composite UI
  features/  — user actions (block 04+)
  entities/  — domain models (block 05+)
  shared/    — ui, api, config
```

## Dev proxy

Vite proxies `/graphql` and `/health` → `http://127.0.0.1:3000`. Start backend before testing GraphQL on home page. Full local stack uses `FRONTEND_PORT=5174` by default to avoid conflicts with `captcha-panel`.
