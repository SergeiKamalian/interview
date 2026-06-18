# TASK-14.30 — Deprecate legacy intent regex

Status: [x] done

## Depends on

TASK-14.29

## Solution

- Удалить `SCOPE_ASK_PATTERNS`, `DECLINE_PATTERNS`, `UNCERTAIN/READY_PATTERNS` из hot path
- Оставить `buildClarificationFollowUpQuestion` template parsing (генерация, не классификация)
- Feature flag `CLASSIFIER_REGEX_EMERGENCY_FALLBACK=false` по умолчанию
- Обновить/удалить regex-only unit tests

## Acceptance criteria

- [x] Grep: нет `SCOPE_ASK_PATTERNS` / `DECLINE_PATTERNS` в policy path
- [x] Emergency fallback задокументирован
- [x] CI green

## Completion Notes

**Проверка:**

```bash
cd backend
pnpm test   # 67 suites, 291 passed
pnpm build  # ok
rg 'SCOPE_ASK_PATTERNS|DECLINE_PATTERNS' src/modules/adaptive-interview --glob '*.ts'
# → только legacy-intent-regex.util.ts
```

**Ожидал:** паттерны только в legacy-модуле; policy по `turn_kind`; fallback выключен по умолчанию.

**Получил:** `legacy-intent-regex.util.ts` + shadow/emergency; policy через classifier и `isTargetedRefusalForPolicy()`; `CLASSIFIER_REGEX_EMERGENCY_FALLBACK=false` в config и `.env.example`.

**Изменения:**

- `legacy-intent-regex.util.ts` — все deprecated паттерны
- `classifier-emergency-fallback.util.ts` — emergency + `isTargetedRefusalForPolicy`
- `candidate-clarification/decline/topic-opener.util.ts` — убран regex из hot path
- `adaptive-interview-submit.service.ts` — emergency fallback при failed classify
- `docs/evaluation-accuracy/candidate-turn-classifier.md` §8 — документация флага
