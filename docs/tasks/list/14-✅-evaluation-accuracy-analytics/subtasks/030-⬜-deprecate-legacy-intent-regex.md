# TASK-14.30 — Deprecate legacy intent regex

Status: [ ] todo

## Depends on

TASK-14.29

## Solution

- Удалить `SCOPE_ASK_PATTERNS`, `DECLINE_PATTERNS`, `UNCERTAIN/READY_PATTERNS` из hot path
- Оставить `buildClarificationFollowUpQuestion` template parsing (генерация, не классификация)
- Feature flag `CLASSIFIER_REGEX_EMERGENCY_FALLBACK=false` по умолчанию
- Обновить/удалить regex-only unit tests

## Acceptance criteria

- [ ] Grep: нет `SCOPE_ASK_PATTERNS` / `DECLINE_PATTERNS` в policy path
- [ ] Emergency fallback задокументирован
- [ ] CI green
