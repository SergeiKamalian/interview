# ⬜ TASK-07.9 — Guardrails против AI-галлюцинаций

Status: [ ] todo  
Priority: High  
Parent block: `07-⬜-ai-evaluation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить защитные проверки, чтобы AI не придумывал критерии/факты: валидация источников, ограничение контекста и post-check перед записью.

## Context

После блока 05 уже существует interview flow и ответы кандидата. В блоке 06 backend вызывает LLM-провайдера, передает контекст вопроса из question bank, получает строго структурированный JSON, сохраняет результаты в MySQL и отдает данные в dashboard блок 08.

Эта подзадача — часть блока `07-⬜-ai-evaluation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Guardrails против AI-галлюцинаций» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- UI отрисовка аналитики и отчетов (блок 08).
- Voice/video pipeline и ASR/TTS (блок 09).
- Fine-tuning модели и хранение dataset для обучения.
- Внешние BI-интеграции и экспорт в сторонние системы.

## Files / Folders Allowed

- `backend/src/modules/ai-evaluation/services/hallucination-guard.service.ts`
- `backend/src/modules/ai-evaluation/services/checkpoint-evaluation.service.ts`
- `backend/src/modules/ai-evaluation/prompts/guardrail-rules.ts`
- `backend/src/modules/ai-evaluation/tests/hallucination-guard.spec.ts`

## Requirements

1. Источник истинных критериев только question bank checkpoints; любые неизвестные checkpoint ids отклоняются.
2. Evidence quote должен присутствовать в transcript/answer text (substring check или fuzzy match с порогом).
3. Запрещено принимать новые topics/skills, отсутствующие в вопросе.
4. При нарушении guardrail результат помечается `needs_manual_review`.
5. Сервис пишет причину отклонения в error log table или structured app log.
6. Guardrails применяются до финального score calculation.

## Step-by-step Plan

1. Создать guardrail rules и отдельный service post-validation.
2. Интегрировать вызов guardrails между JSON validation и storage.
3. Реализовать проверку происхождения checkpoint_id и evidence_quote.
4. Добавить тесты на synthetic hallucination payload.
5. Проверить fallback: интервью доступно для ручного ревью.

## Acceptance Criteria

- Система блокирует/маркирует галлюцинаторные результаты AI.
- Question bank остается source-of-truth для оценки.
- Некорректный AI output не влияет на итоговый score без ручной проверки.

## Checks

```bash
cd backend && npm run test -- hallucination-guard
cd backend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
