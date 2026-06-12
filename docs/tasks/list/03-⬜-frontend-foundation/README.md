# 03-⬜-frontend-foundation — Фундамент frontend

## Цель блока

Создать каркас React + Vite + TypeScript frontend с Tailwind, React Router, Redux Toolkit, RTK Query (GraphQL), FSD-like структурой и базовыми UI primitives.

## Контекст

Dashboard и public candidate flow будут потреблять GraphQL API backend. RTK Query — единый data layer; REST только для upload/health. Структура папок — FSD-like: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.

## Что входит в этот блок

- Vite React TypeScript app в `frontend/`.
- Tailwind CSS + postcss + базовые design tokens.
- React Router v6 с layout routes.
- Redux Toolkit store + typed hooks.
- RTK Query api slice + GraphQL baseQuery.
- FSD-like folder structure и path aliases.
- Layouts: `AuthLayout`, `DashboardLayout`, `PublicLayout`.
- Env config: `VITE_API_URL`, `VITE_GRAPHQL_URL`.
- UI primitives: Button, Input, Card, Spinner, Alert.

## Что НЕ входит в этот блок

- Auth forms и protected routes (блок 04).
- Question bank UI (блок 05).
- Interview public flow (блок 06).
- Dashboard pages (блок 08).
- Voice/video (блок 09).

## Важные архитектурные решения

- Vite env prefix `VITE_*`.
- RTK Query `createApi` + custom `graphqlBaseQuery` → POST `/graphql`.
- GraphQL documents в `entities/*/api/` или `features/*/api/`.
- Tailwind — utility-first, без тяжёлого UI kit на MVP.
- Strict TypeScript, ESLint + Prettier как в backend.

## Зависимости от предыдущих блоков

- Блок `01-🟡-backend-foundation` — backend GraphQL endpoint (для интеграционной проверки).
- Блок `02-⬜-database-design` — не блокирует frontend scaffold, но design docs должны существовать параллельно для согласованности API.
- Node.js 20 LTS.

## Ожидаемый результат после завершения блока

`npm run dev` открывает app на localhost, Tailwind работает, router показывает placeholder pages, RTK Query может вызвать `{ hello }` с backend.
