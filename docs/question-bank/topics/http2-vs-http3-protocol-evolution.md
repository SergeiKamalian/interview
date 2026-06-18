# HTTP/2 vs HTTP/3: эволюция протокола

- **topic_code:** `http2_vs_http3_protocol_evolution`
- **source:** https://itlead.org/interview-questions/general/http2-vs-http3-protocol-evolution
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/http2-vs-http3-protocol-evolution.bank.json` → `pnpm seed:topic -- http2_vs_http3_protocol_evolution`
- **status:** ready

## Вопрос

> Чем HTTP/2 отличается от HTTP/3 и когда какой протокол выбирать?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | http2_multiplexing | Понимает HTTP/2 и multiplexing | 1.5 | core_plus | HTTP/2 basics |
| 1 | http3_quic | Понимает HTTP/3 и QUIC | 1.5 | core_plus | HTTP/3 core |
| 2 | hol_blocking | Объясняет HOL blocking TCP vs QUIC | 2 | intermediate | key difference ITLead |
| 3 | when_to_use_protocol | Выбирает h2 vs h3 | 1.5 | basic | when to use |
| 4 | common_mistakes | Знает типичные ошибки h2/h3 | 2 | intermediate | common mistakes |
| 5 | handshake_internals | Знает handshake и negotiation | 1.5 | basic | how it works internally |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
