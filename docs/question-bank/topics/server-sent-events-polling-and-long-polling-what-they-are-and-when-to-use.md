# SSE, polling и long polling

- **topic_code:** `server_sent_events_polling_and_long_polling_what_they_are_and_when_to_use`
- **source:** https://itlead.org/interview-questions/general/server-sent-events-polling-and-long-polling-what-they-are-and-when-to-use
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/server-sent-events-polling-and-long-polling-what-they-are-and-when-to-use.bank.json` → `pnpm seed:topic -- server_sent_events_polling_and_long_polling_what_they_are_and_when_to_use`
- **status:** ready

## Вопрос

> Чем отличаются polling, long polling и Server-Sent Events и когда что использовать?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | three_patterns | Описывает три паттерна | 1.5 | core_plus | TL;DR three patterns |
| 1 | comparison_tradeoffs | Сравнивает latency load complexity | 2 | intermediate | comparison table |
| 2 | when_to_use | Выбирает паттерн для сценария | 1.5 | basic | when to use |
| 3 | sse_internals | Знает internals SSE | 1.5 | basic | how it works internally |
| 4 | common_mistakes | Знает типичные ошибки | 2 | intermediate | common mistakes |
| 5 | implementation_notes | Знает практику реализации | 1.5 | basic | real-world usage |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
