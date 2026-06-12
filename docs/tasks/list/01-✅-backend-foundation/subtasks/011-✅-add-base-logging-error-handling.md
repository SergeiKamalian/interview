# ✅ TASK-01.11 — Базовое логирование и обработка ошибок

Status: [x] done  
Last updated: 2026-06-12

## Completion Notes

**Сделано:**
- `nestjs-pino` + `AppLoggerModule` (JSON prod, pretty dev)
- `AllExceptionsFilter` — REST JSON errors, stack только в dev
- `GraphQLExceptionFilter` — файл для GraphQL; prod errors через `formatError` в `graphql.module.ts`
- Redact: authorization, cookie, password, jwt, secret

**Проверки:**
- `GET /nonexistent` → HTTP 404 JSON (без зависания)
- `pnpm run build` / `pnpm run lint` — OK

**Fix:** убран `GraphQLExceptionFilter` из global HTTP filters — иначе HTTP-запросы зависали.
