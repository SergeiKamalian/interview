# TASK-15.6 — Добавить save as template

Status: [ ] todo

## Goal

Позволить сохранять существующее interview как reusable template.

## Scope

- Backend mutation `createInterviewTemplateFromInterview`.
- UI action from interview details/list.
- Copy metadata and ordered `source_question_id` from `interview_questions`.
- Не копировать snapshot checkpoints в template.

## Verification

- Backend and frontend build.
- GraphQL smoke-check save-from-interview.
- UI smoke-check: сохранить interview как template и создать новое interview из него.
