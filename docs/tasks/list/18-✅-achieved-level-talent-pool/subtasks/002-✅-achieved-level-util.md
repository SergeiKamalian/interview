# TASK-18.2 — Backend: util расчёта achievedLevel + тесты

Status: [x] done

## Depends on

- TASK-18.1.

## Goal

Чистая детерминированная функция: из per-question баллов (с уровнем вопроса) вычислить
`achievedLevel`, `method` (evidence|estimate) и разбивку по уровням. Без побочных эффектов,
без БД — легко юнит-тестируется.

## Scope

- Новый `backend/src/modules/scoring/achieved-level.util.ts`:
  - вход: массив `{ level, score, maxScore }` (берём из существующих `QuestionScoreInput`);
  - порог из env `ACHIEVED_LEVEL_PASS_RATIO` (default 0.65), как `readThreshold` в `scoring.constants.ts`;
  - лестница `junior(0) → middle(1) → senior(2) → lead(3)`;
  - evidence-режим (≥2 уровня): высший contiguous пройденный уровень;
  - estimate-режим (1 уровень): пройден → этот уровень (evidence); не пройден → null + estimatedLevel
    на уровень ниже, method=estimate, note про калибровочные вопросы;
  - вернуть `perLevel[]` (earned/max/ratio/passed) для отчёта.
- ВАЖНО: не трогать `calculateInterviewScore`/`mapHireRecommendation` — это отдельная ось.

## Verification

- `pnpm -C backend build` + targeted eslint.
- `npx jest achieved-level.util.spec` — кейсы: middle-pass/senior-fail на lead-интервью → middle;
  all-lead pass → lead/evidence; all-lead fail → null+estimate; пустой вход → null.

## Completion Notes

### Что сделано

Новый чистый util `backend/src/modules/scoring/achieved-level.util.ts`:

- `computeAchievedLevel(questions, passRatio?)` — группирует баллы по уровню вопроса
  (`junior→middle→senior→lead`), возвращает `achievedLevel`, `method` (evidence|estimate),
  `estimatedLevel`, `perLevel[]` (earned/max/ratio/passed), `note`.
- Лестница: achievedLevel = высший **contiguous** пройденный уровень снизу вверх (порог ≥ ratio).
- estimate-режим: single-level пройден → этот уровень (evidence); провален → null +
  `estimatedLevel` на уровень ниже + note про калибровочные вопросы.
- `readAchievedLevelPassRatio(env)` — порог из `ACHIEVED_LEVEL_PASS_RATIO` (default 0.65, валидация
  диапазона `(0,1]`), по образцу `scoring.constants.ts`.
- ИНВАРИАНТ соблюдён: `calculateInterviewScore`/`mapHireRecommendation` НЕ изменены — это отдельная ось.

### Команды / ожидание / результат

- `npx jest src/modules/scoring/achieved-level.util.spec.ts` → **11 passed** (middle-pass/senior-fail
  на lead-интервью → middle; all-lead pass → lead/evidence; all-lead fail → null+estimate(senior);
  contiguous junior-pass/middle-fail/senior-pass → junior; пустой вход → null; custom ratio; фильтр
  unknown level / maxScore≤0).
- `npx jest src/modules/scoring` → **17 passed** (новый + существующий `scoring.service.spec` без регресса).
- `pnpm -C backend build` → **OK** (exit 0).
- ReadLints на обоих файлах → чисто.

### Новые файлы

- new: `backend/src/modules/scoring/achieved-level.util.ts`
- new: `backend/src/modules/scoring/achieved-level.util.spec.ts`
