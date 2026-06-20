# TASK-19.7 — Interview overview priority redesign

Status: [x] done

## Goal

Убрать бесполезный статичный блок `Decision workflow` со страницы интервью и заменить верхнюю аналитику на более информативную company-side сводку по кандидатам.

## Scope

- Убрать `Decision workflow`.
- Переработать `Interview overview` в `Сводка отбора` с реальными метриками.
- Показать компании:
  - сколько кандидатов было;
  - сколько прошли интервью;
  - сколько получили ИИ-оценку;
  - сколько имеют хорошие результаты;
  - средний балл;
  - лучший результат;
  - конверсию прохождения.
- Добавить блок `Что важно сейчас` с приоритетом действий на основе attempts/recommendations.
- Сохранить dark-mode friendly theme tokens.
- Не менять backend/API.

## Verification

- [x] Targeted eslint.
- [x] Frontend build.
- [x] Browser smoke в dark mode.

## Completion Notes

- `frontend/src/pages/dashboard/interviews/InterviewDetailsPage.tsx`:
  - удалён `Decision workflow`;
  - `Interview overview` заменён на `Сводка отбора`;
  - добавлены вычисления `evaluatedAttempts`, `pendingEvaluationCount`, `goodResultAttempts`, `averageScore`, `completionRate`, `bestCandidate`, `reviewPriority`;
  - добавлен блок `Что важно сейчас` с actionable summary: кого смотреть первым, готово ли сравнение, качество потока;
  - русифицированы labels: `Top candidates`, `All candidates`, `Compare candidates`, `Review`, `Compare`, `Report`, `Score`, `Recommendation`;
  - исправлены мелкие тексты/грамматика в overview.
- `frontend/src/widgets/interview/InterviewManagePanel.tsx`:
  - `AI-настройки` → `ИИ-настройки`.
- `TASK-19.5 — Report export / handoff prep` не закрывался и остаётся todo.

Commands / checks:

- `pnpm -C frontend exec eslint src/pages/dashboard/interviews/InterviewDetailsPage.tsx src/widgets/interview/InterviewManagePanel.tsx` → exit 0.
- `pnpm -C frontend build` → exit 0; только стандартный Vite chunk-size warning.
- `rg "Decision workflow|Interview overview|Review|review|AI-настройки|shortlist|Top candidates|All candidates|Compare candidates|Score|Recommendation|Candidate|Completed|Actions|Public link|Questions|Created|Role" frontend/src ...` → no matches в изменённых файлах.
- Browser smoke:
  - `localhost:5174` не был доступен из окружения, поэтому поднят временный Vite `:4662` с `VITE_GRAPHQL_URL=/graphql`; backend `:3000` healthy.
  - Открыта `/dashboard/interviews/32`, включён dark mode.
  - Snapshot показал `Сводка отбора`, `Что важно сейчас`, `ИИ-настройки`, метрики `Всего кандидатов`, `Прошли интервью`, `Оценены ИИ`, `Хорошие результаты`, `Средний балл`, `Лучший результат`; `Decision workflow` отсутствует.
