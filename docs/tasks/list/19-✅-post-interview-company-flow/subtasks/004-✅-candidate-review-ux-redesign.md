# TASK-19.4 — Candidate review UX redesign

Status: [x] done

## Goal

Переработать отдельную страницу candidate attempt review так, чтобы company user быстро понял решение: кого стоит звать дальше, какие сильные стороны, какие риски, где нужна ручная проверка и какие evidence смотреть.

## Scope

- Новый decision-oriented layout для `/dashboard/interviews/:interviewId/attempts/:attemptId/review`.
- Сверху compact summary: score, recommendation, manual review, completed/evaluation status.
- Блоки `Сильные стороны`, `Риски`, `Что проверить на live-интервью`, `Где не тратить время`.
- Compact skill/category overview вместо длинной простыни.
- Transcript/checkpoints оставить как evidence, но ниже и в раскрываемых/табовых секциях.
- Dark mode через theme tokens, без hardcoded light-only `slate-*`/`bg-white`.
- Без backend/API изменений.

## Verification

- [x] Targeted frontend eslint.
- [x] Frontend build.
- [x] Browser smoke `/dashboard/interviews/32/attempts/105/review`:
  - верх страницы даёт decision summary без длинной простыни;
  - strengths/risks/focus areas видны до transcript;
  - transcript/checkpoints доступны ниже как evidence;
  - dark mode не показывает light-only блоки.

## Completion Notes

- `AttemptReviewPage` переработан из “длинного отчёта” в company decision brief:
  - hero-блок `Hiring decision brief` с recommendation, score `/100`, summary, next step;
  - карточки `Плюсы`, `Минусы и риски`, `Проверить на live`;
  - `Skill signals` с compact category meters;
  - `Review focus` с strong/watch/risk, coverage/accuracy и `Где не тратить время`;
  - вкладки `Decision notes`, `Evidence`, `Transcript`, чтобы transcript/checkpoints не забивали первый экран.
- Для attempts без adaptive checkpoint groups UI теперь использует final evaluation strengths/weaknesses/risks и category breakdown, а не показывает пустые `0/0/0`.
- `AdaptiveCheckpointReviewPanel` и `CheckpointResultsPanel` переведены с hardcoded `slate-*`, `red-50`, `amber-50` на theme tokens (`bg-muted`, `border-border`, `text-muted-foreground`, `destructive/amber` opacity), чтобы dark mode был нормальным.
- Backend/API не менялись.

Commands / checks:

- `pnpm -C frontend exec eslint src/pages/dashboard/interviews/AttemptReviewPage.tsx src/widgets/checkpoints/AdaptiveCheckpointReviewPanel.tsx src/widgets/checkpoints/CheckpointResultsPanel.tsx` → exit 0.
- `pnpm -C frontend exec eslint src/pages/dashboard/interviews/AttemptReviewPage.tsx` после fallback polish → exit 0.
- `pnpm -C frontend build` → exit 0; только стандартный Vite chunk-size warning.
- `rg "slate-|bg-white|text-white|border-slate|bg-red-50|bg-amber-50|text-red-|text-amber-"` по изменённым review/checkpoint файлам → no matches.
- Browser smoke:
  - `5174` у пользователя не слушал, поэтому поднят временный Vite `:4662` с `VITE_GRAPHQL_URL=/graphql`, backend `:3000` был healthy.
  - `/dashboard/interviews/32/attempts/105/review` загрузился с candidate `Алексей Петров`, `Strong invite`, score `85/100`.
  - Первый экран показал `Hiring decision brief`, `Плюсы`, `Минусы и риски`, `Проверить на live`, `Skill signals`, `Review focus` до transcript.
  - После улучшения fallback `Review focus` перестал показывать пустые `0/0/0` для финальной оценки; использует category/checkpoint signals.
  - Dark mode включён через toggle (`Светлая тема` в кнопке), full-page screenshot `attempt-review-ux-dark.png` визуально без белых light-only карточек.
  - `Evidence` tab открылся, checkpoint cards доступны в dark mode.
