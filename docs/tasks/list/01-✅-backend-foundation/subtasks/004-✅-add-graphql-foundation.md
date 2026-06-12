# ✅ TASK-01.4 — GraphQL-фундамент (Apollo)

Status: [x] done  
Priority: High  
Parent block: `01-🟡-backend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Настроить Apollo GraphQL code-first на `/graphql` с auto schema, playground в dev и тестовым query `hello`.

## Completion Notes

**Сделано:**
- Установлены `@nestjs/graphql`, `@nestjs/apollo`, `@apollo/server`, `graphql`, `@as-integrations/express5` (требуется для NestJS 11 + Express 5).
- `AppGraphQLModule` с `GraphQLModule.forRootAsync`, `autoSchemaFile: src/schema.gql`.
- `HelloResolver` с query `hello: String!` → `'AI Interviewer API'`.
- Playground/introspection: `GRAPHQL_PLAYGROUND=true` или `NODE_ENV=development` по умолчанию.
- `formatError`: в production только `message` + `code`, без stack.

**Проверки (все прошли):**
1. `pnpm run build` — OK
2. `pnpm run lint` — OK
3. `POST /graphql` `{"query":"{ hello }"}` → `{"data":{"hello":"AI Interviewer API"}}`
4. `GET /graphql` с `Accept: text/html` в dev → HTTP 200 (Apollo Sandbox landing)
5. `src/schema.gql` автогенерируется с `hello: String!`
6. Production error `{ unknownField }` → только message + code, без stack trace

**Follow-ups:** peer warning `@apollo/server@^4` vs installed v5 — работает, при проблемах можно зафиксировать v4.
