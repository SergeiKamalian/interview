# TASK-19.9 — AI candidate comparison advice

Status: [x] done

## Goal

Расширить сравнение двух кандидатов на странице интервью: вместо простого side-by-side отображения score/recommendation компания должна получать ИИ-совет, кого приоритизировать, для какого кейса кто подходит лучше, какие риски проверить и какие вопросы задать на live-интервью.

## Scope

- Добавлен backend GraphQL mutation `compareInterviewCandidates(input)` для двух attempts одного interview/company.
- Backend проверяет tenant scope, принадлежность attempts интервью, статус `completed` и наличие final evaluation.
- ИИ получает structured context из interview details + final evaluations: score, recommendation, achieved level, summary, strengths, weaknesses, risks.
- Ответ нормализуется в structured GraphQL type: итоговая рекомендация, кейсы, заметки по каждому кандидату, риски и follow-up questions.
- Frontend блок `Сравнение кандидатов` заменён на `ИИ-сравнение кандидатов`: выбор 2 кандидатов, CTA `Получить совет ИИ`, итоговый совет, кейсы, риски и вопросы для live-интервью.
- Сохраняется лимит сравнения: максимум 2 кандидата.

## Verification

- `pnpm -C backend exec eslint src/modules/interviews/graphql/candidate-comparison.type.ts src/modules/interviews/services/candidate-comparison.service.ts src/modules/interviews/prompts/candidate-comparison.prompt.ts`
- `pnpm -C backend build`
- `pnpm -C frontend exec eslint src/pages/dashboard/interviews/InterviewDetailsPage.tsx src/entities/interview/api/interviewsApi.ts src/entities/interview/api/interviewDetailsApi.ts`
- `pnpm -C frontend build`
- `pnpm -C frontend graphql:sync`
- GraphQL smoke на временном backend `:4663`: `compareInterviewCandidates(interviewId: "32", attemptIds: ["108", "105"])` вернул `recommendedAttemptId: "105"` и русскоязычный advice без GraphQL errors.
- UI smoke на временном Vite `:4662`: `/dashboard/interviews/32` в dark theme показывает `ИИ-сравнение кандидатов`; после выбора двух кандидатов кнопка `Получить совет ИИ` становится активной.

## Notes

- `TASK-19.5 — Report export / handoff prep` не закрывался и остаётся active todo.
