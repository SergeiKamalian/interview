# Архитектура современного браузера

- **topic_code:** `modern_browser_architecture_processes_and_threads`
- **source:** https://itlead.org/interview-questions/general/modern-browser-architecture-processes-and-threads
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/modern-browser-architecture-processes-and-threads.bank.json` → `pnpm seed:topic -- modern_browser_architecture_processes_and_threads`
- **status:** ready

## Вопрос

> Как устроена архитектура современного браузера: процессы и потоки?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | process_map | Знает процессы браузера | 1.5 | core_plus | process map ITLead |
| 1 | threads_in_renderer | Понимает потоки в renderer | 1.5 | core_plus | threads TL;DR |
| 2 | isolation_tradeoffs | Понимает изоляцию и trade-offs | 1.5 | basic | key difference single vs multi |
| 3 | performance_patterns | Знает паттерны производительности | 2 | intermediate | common mistakes perf |
| 4 | cross_tab_communication | Знает межвкладочную коммуникацию | 1.5 | basic | BroadcastChannel example |
| 5 | common_mistakes | Знает типичные ошибки | 2 | intermediate | common mistakes |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
