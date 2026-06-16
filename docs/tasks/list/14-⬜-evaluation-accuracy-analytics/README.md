# 14-⬜-evaluation-accuracy-analytics — Точность оценки и HR-аналитика

## Цель блока

Сделать оценку AI-интервью **семантически честной** для HR: различать «упомянул» vs «понимает», не завышать score на 50/50 ответах, давать прозрачный per-checkpoint отчёт с red flags и confidence.

## Для нового агента — с чего начать

1. Прочитать **полный design doc**: [`docs/evaluation-accuracy/README.md`](../../../evaluation-accuracy/README.md)
2. Открыть `TASKS.md` этого блока.
3. Взять **один** subtask (рекомендуется `001` → `003` → `002`).
4. Прогнать Fiber 50/50 сценарий до и после изменений.

## Контекст: что уже сделано (не повторять)

Commit `f93b32b` (2026-06-16):

- Topic opener flow (`topic_opener`, `topic_opener_answer`) — migration 015.
- React Fiber question в `question-bank.seed.sql`.
- Evaluator prompt v2.4.0 — half-right/half-wrong → partial.
- Guards в `apply-checkpoint-score-floors.util.ts` — Fiber contradictions, rationale cap.
- Follow-up acknowledgment variety.

Это **базовая линия**, не финальное решение. Attempt 34 до фиксов давал 8.8/10; после фиксов нужно **перепроверить** и добить блок 14.

## Главное продуктовое изменение

```txt
Было:  «назвал Fiber» ≈ covered → 8.8/10 на 50/50 ответе
Нужно: «понимает механизм без лжи» = covered; «слышал/упомянул» = partial/missed
       → ~4.5–5.5/10 + понятный HR-отчёт
```

## Таксономия (ключевая идея пользователя)

| Уровень | Пример | Оценка |
|---------|--------|--------|
| **упомянул** | «Fiber, reconciliation, diffing» без связного объяснения | missed / low partial |
| **слышал** | «Слышал про Fiber, детали не помню» | unclear / low partial |
| **знает поверхностно** | Верная мысль, без глубины | partial ~0.5 |
| **понимает** | Связное объяснение с мелкими неточностями | partial высокий или covered |
| **знает точно** | Точный ответ, выдерживает follow-up | covered |
| **уверенно врёт** | «requestIdleCallback планирует Fiber» | missed + red flag |

## Что входит в блок

- Prompt: coverage vs accuracy, понимает/знает/слышал/упомянул.
- Golden calibration dataset + CI.
- Follow-up: LLM-first, без rubric в template fallback, early stop.
- Guards: false claims, bad_answer_examples.
- Dashboard: per-checkpoint report, dual axis, red flags, confidence, manual review.
- Observability: guard divergence, prompt A/B.

## Что НЕ входит

- Voice/STT/TTS (блок 10).
- Video proctoring.
- Изменение max_score / checkpoints в runtime.
- Полноценный ML classifier вместо LLM.

## Зависимости

- `09-✅-adaptive-ai-interview` — adaptive flow, per-turn evaluator.
- `07-✅-ai-evaluation` — final evaluation.
- `08-✅-dashboard-analytics` — UI для отчётов.

## Ключевые файлы

| Файл | Роль |
|------|------|
| `prompts/per-turn-checkpoint-evaluation.prompt.ts` | Evaluator |
| `utils/apply-checkpoint-score-floors.util.ts` | Post-guards |
| `services/follow-up-planner.service.ts` | Follow-up + fallback |
| `utils/follow-up-policy.util.ts` | Stop / limits |
| `services/adaptive-interview-submit.service.ts` | Orchestration |
| `seeds/question-bank.seed.sql` | Fiber test question |

## Verification (блок целиком)

```bash
pnpm --dir backend run test
# Golden set (после TASK-14.2):
pnpm --dir backend run test -- --testPathPattern=golden-calibration
```

E2E: Fiber 50/50 → final 4.5–5.5/10; follow-ups без rubric; dashboard с per-checkpoint cards.
