# Микросервисная архитектура

- **topic_code:** `microservices_architecture`
- **source:** https://itlead.org/interview-questions/architecture/microservices-architecture
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/microservices-architecture.bank.json` → `pnpm seed:topic -- microservices_architecture`
- **status:** draft

## Вопрос

> Что такое микросервисная архитектура и когда её имеет смысл применять?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | microservices_definition | Определение и ключевое правило | 1.5 | core_plus | ядро — независимые сервисы, своя БД, decoupling через события |
| 1 | monolith_vs_microservices | Монолит vs микросервисы | 1.5 | core_plus | изоляция и независимый деплой vs сетевая сложность |
| 2 | service_communication | Синхронная и асинхронная коммуникация | 1.5 | intermediate | REST/gRPC vs Kafka, eventual consistency |
| 3 | database_per_service_saga | База на сервис и Saga | 1.5 | intermediate | antipattern shared DB, нет ACID между сервисами, компенсации |
| 4 | infrastructure_patterns | API Gateway, discovery, circuit breaker | 1.0 | basic | инфраструктурный минимум из ITLead |
| 5 | when_to_use | Когда микросервисы оправданы | 1.0 | basic | не с нуля, команды, масштаб, Conway's Law |
| 6 | common_mistakes | Типичные ошибки | 2.0 | intermediate | shared DB, sync chains, versioning, tracing |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| monolith_vs_microservices | microservices_definition | 0.45 |
| database_per_service_saga | service_communication | 0.40 |
| common_mistakes | database_per_service_saga | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual strong | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
