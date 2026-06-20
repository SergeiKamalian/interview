# 19-✅-post-interview-company-flow — Post-interview company flow

## Цель блока

Собрать company-side workflow после прохождения интервью: компания должна быстро увидеть завершённые попытки, понять статус AI-оценки, открыть отчёт, shortlist'нуть кандидата и принять решение по следующему шагу.

---

## Контекст

Блоки `08`, `17` и `18` уже дали dashboard, candidate report, quality scoring, achieved level и talent pool. Но после завершения интервью компании нужен не только отчёт по одному кандидату, а операционный список:

```txt
completed attempts → AI evaluation status → review queue → candidate report → shortlist / next step
```

---

## Входит в блок

- Review queue завершённых attempts для компании.
- Фильтры по evaluation status, shortlist и recommendation.
- Быстрые переходы в candidate report и interview details.
- Отображение score, achieved level, recommendation, manual review signals.
- Подготовка дальнейших действий hiring team без прохождения candidate flow.

---

## Не входит в первый проход

- ATS export/webhooks — отдельный блок `12`.
- Email automation.
- Team roles / approvals (кроме read-only share link в TASK-19.16).
- Video/audio playback controls — отдельные media-блоки.

## Wave 2 (2026-06) — hiring operations

После wave 1 (review queue, decision workspace, AI compare) добавлена wave 2:

- persistent review state + agree/disagree с ИИ;
- таблица кандидатов с pagination, selection, без Report в основном flow;
- shortlist/quick actions, export выбранных, compare 3+, notes, share link, audit.

См. `TASKS.md` — порядок 19.10 → … → 19.18.

---

## Architecture Rules

- GraphQL остаётся основным business API.
- Первый slice должен переиспользовать существующие таблицы `interview_attempts`, `candidates`, `interviews`, `final_evaluations`, `candidate_shortlist`.
- Frontend: RTK Query + GraphQL operations, FSD-like placement.
- UI строится на shadcn/ui components из `@shared/ui`.
