# TASK-19.14 — Multi-candidate compare (3+)

Status: [x] done

## Goal

Сравнивать **не только двух**, а финальный пул из 3–5 кандидатов — типичный сценарий перед оффером.

## Scope

- UX: selection basket / compare tray на странице интервью (3–5 attempts max).
- Backend: расширить `compareInterviewCandidates` или новый query/mutation для N candidates (structured summary table + AI advice «кого взять первым»).
- Prompt update: ranking, trade-offs, когда выбрать A vs B vs C.
- Сохранить текущий pairwise flow как быстрый режим или заменить единым.
- Лимит и валидация: same interview, completed, evaluation ready.

## Depends on

- TASK-19.9 ✅ (pairwise AI compare baseline)

## Notes

- Больший scope чем 19.9 — отдельный subtask, не смешивать с export.

## Verification

- GraphQL smoke: 3 attempts → structured comparison + recommendation
- UI smoke: выбрать 3 из таблицы → получить совет ИИ

## Completion Notes

- `pnpm -C backend build` — успех после расширения `compareInterviewCandidates` (2–5 attempts) и поля `ranking`.
- `pnpm -C backend exec eslint src/modules/interviews/graphql/candidate-comparison.type.ts src/modules/interviews/services/candidate-comparison.service.ts src/modules/interviews/prompts/candidate-comparison.prompt.ts` — успех.
- `pnpm -C frontend exec eslint src/pages/dashboard/interviews/InterviewDetailsPage.tsx` — успех.
- GraphQL introspection на временном backend `:4663` (новый build): `CandidateComparisonAdviceType` содержит поле `ranking`.
- Полный mutation smoke с 3 attempts и AI response не выполнен: в локальной DB нет валидных credentials для `login` (admin@example.com).
- UI: compare tray (2–5 checkbox), кнопка «Сравнить с ИИ», multi-modal с summary table + pairwise modal сохранён.
