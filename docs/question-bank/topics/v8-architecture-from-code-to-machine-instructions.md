# Архитектура V8: от кода до машинных инструкций

- **topic_code:** `v8_architecture_from_code_machine_instructions`
- **source:** https://itlead.org/interview-questions/general/v8-architecture-from-code-to-machine-instructions
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/v8-architecture-from-code-to-machine-instructions.bank.json` → `pnpm seed:topic -- v8_architecture_from_code_machine_instructions`
- **status:** draft

## Вопрос

> Как устроена архитектура V8 и как JavaScript-код превращается в машинные инструкции?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | v8_pipeline_stages | Описывает pipeline Parser → Ignition → Sparkplug → TurboFan | 2 | core_plus | ядро TL;DR 4-stage pipeline |
| 1 | hidden_classes_ic | Понимает Hidden Classes и Inline Caching | 1.5 | core_plus | Hidden Classes and IC section |
| 2 | ic_morphic_states | Различает monomorphic, polymorphic, megamorphic | 1.5 | intermediate | IC states performance difference |
| 3 | deoptimization | Объясняет deoptimization и type mismatch | 2 | intermediate | Deoptimization section |
| 4 | generational_gc | Знает generational garbage collection V8 | 1 | basic | Generational GC section |
| 5 | v8_optimization_mistakes | Знает антипаттерны для V8 optimization | 1.5 | intermediate | Common mistakes |
| 6 | osr_senior_async | Понимает OSR и deopt в async/generators | 0.5 | advanced | Senior follow-up OSR async |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 6 – 8 | invite / maybe |
| formal strong | 8 – 9.5 | strong_invite / invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
