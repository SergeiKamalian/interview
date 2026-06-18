# Отладка приложений и поиск утечек памяти

- **topic_code:** `how_to_debug_application_and_find_memory_leaks`
- **source:** https://itlead.org/interview-questions/general/how-to-debug-application-and-find-memory-leaks
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/how-to-debug-application-and-find-memory-leaks.bank.json` → `pnpm seed:topic -- how_to_debug_application_and_find_memory_leaks`
- **status:** ready

## Вопрос

> Как отлаживать приложение и находить утечки памяти в браузере и Node.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | memory_leak_definition | Понимает что такое утечка памяти | 1.5 | core_plus | ядро — определение leak и роль GC |
| 1 | gc_mark_sweep | Знает как V8/GC связан с утечками | 1.5 | core_plus | mark-sweep и old generation из ITLead |
| 2 | debug_tools | Знает инструменты профилирования памяти | 2 | intermediate | tool comparison из ITLead |
| 3 | common_leak_patterns | Знает типичные паттерны утечек | 2 | intermediate | Common mistakes из ITLead |
| 4 | fix_patterns | Знает правильные паттерны исправления | 1.5 | basic | fix patterns из quick example |
| 5 | debug_workflow | Описывает workflow отладки утечки | 1.5 | basic | follow-up debugging workflow |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
