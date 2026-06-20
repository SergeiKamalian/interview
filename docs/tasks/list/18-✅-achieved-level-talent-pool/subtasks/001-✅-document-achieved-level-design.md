# TASK-18.1 — Зафиксировать achieved-level design

Status: [x] done

## Goal

Описать дизайн achieved level + talent pool, алгоритм расчёта и модель данных.

## Completion Notes

Дизайн зафиксирован в `README.md` блока: мотивация (целевой уровень не входит в скоринг),
ось achieved level (evidence/estimate режимы), порог `ACHIEVED_LEVEL_PASS_RATIO=0.65`, хранение в
`final_evaluations`, матч кандидатов по `email` в рамках `company_id` для talent pool.
Решения пользователя: реализуем обе части (achieved level + talent pool); single-level интервью →
estimate-режим с пометкой и подсказкой добавить калибровочные вопросы.
