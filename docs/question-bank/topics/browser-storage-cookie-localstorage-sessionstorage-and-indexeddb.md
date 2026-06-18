# Browser storage: cookie, LocalStorage, SessionStorage, IndexedDB

- **topic_code:** `browser_storage_cookie_localstorage_sessionstorage_indexeddb`
- **source:** https://itlead.org/interview-questions/general/browser-storage-cookie-localstorage-sessionstorage-and-indexeddb
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/browser-storage-cookie-localstorage-sessionstorage-and-indexeddb.bank.json` → `pnpm seed:topic -- browser_storage_cookie_localstorage_sessionstorage_indexeddb`
- **status:** draft

## Вопрос

> Какие типы хранилищ есть в браузере и чем они отличаются?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | storage_overview | Перечисляет типы browser storage | 1.5 | core_plus | overview |
| 1 | cookies_vs_web_storage | Отличает cookies от Web Storage | 2 | core_plus | key difference |
| 2 | local_vs_session | Отличает LocalStorage от SessionStorage | 1.5 | intermediate | local vs session |
| 3 | indexeddb_use | Понимает IndexedDB | 1.5 | intermediate | indexeddb |
| 4 | when_to_use | Выбирает правильное storage | 1.5 | intermediate | when to use |
| 5 | common_mistakes | Знает типичные ошибки | 1.5 | intermediate | mistakes |
| 6 | security_quota | Понимает security и quota | 0.5 | mention | security |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / reject |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
