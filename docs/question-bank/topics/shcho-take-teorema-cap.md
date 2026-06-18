# Теорема CAP

- **topic_code:** `shcho_take_teorema_cap`
- **source:** https://itlead.org/interview-questions/architecture/shcho-take-teorema-cap
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/shcho-take-teorema-cap.bank.json` → `pnpm seed:topic -- shcho_take_teorema_cap`
- **status:** draft

## Вопрос

> Что такое теорема CAP?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | cap_definition | Определение CAP и три свойства | 1.5 | core_plus | ядро — C, A, P и невозможность всех трёх при partition |
| 1 | cp_vs_ap | Выбор CP или AP | 1.5 | core_plus | P обязателен в реальных сетях, реальный компромисс C vs A |
| 2 | partition_scope | Компромисс только при partition | 1.0 | basic | вне разбиения можно иметь C и A одновременно |
| 3 | common_mistakes | Типичные заблуждения | 2.0 | intermediate | CA-миф, CAP≠ACID, AP без merge, постоянный trade-off |
| 4 | when_to_use | Когда CP, когда AP | 1.0 | basic | финансы/блокировки vs ленты/аналитика из ITLead |
| 5 | quorum_mechanisms | Кворум, Raft и tunable consistency | 1.5 | intermediate | W+R>N, Raft/Paxos vs gossip, Cassandra уровни |
| 6 | pacelc_hybrid | PACELC и гибридные паттерны | 1.5 | intermediate | latency без partition, AP+CP для переводов, Jepsen |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| cp_vs_ap | cap_definition | 0.45 |
| common_mistakes | cap_definition | 0.35 |
| quorum_mechanisms | cp_vs_ap | 0.40 |
| pacelc_hybrid | quorum_mechanisms | 0.35 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual strong | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
