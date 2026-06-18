# Subject и типы Subject в RxJS

- **topic_code:** `what_is_subject_what_types_subjects_exist_rxjs`
- **source:** https://itlead.org/interview-questions/angular/what-is-subject-and-what-types-of-subjects-exist-in-rxjs
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-subject-and-what-types-of-subjects-exist-in-rxjs.bank.json` → `pnpm seed:topic -- what_is_subject_what_types_subjects_exist_rxjs`
- **status:** ready

## Вопрос

> Что такое Subject в RxJS и какие типы Subject существуют?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | subject_definition | Subject и multicast | 1.5 | core_plus | Observable + Observer, .next() |
| 1 | hot_vs_cold | Горячий vs холодный | 1.5 | core_plus | cold Observable vs hot Subject |
| 2 | plain_subject | Обычный Subject | 1.0 | basic | без истории для поздних подписчиков |
| 3 | behavior_subject | BehaviorSubject | 1.5 | core_plus | текущее состояние, asObservable |
| 4 | replay_async_subjects | ReplaySubject и AsyncSubject | 1.5 | core_plus | буфер N и финал после complete |
| 5 | when_to_use | Когда какой тип | 1.0 | basic | decision rule из ITLead |
| 6 | common_mistakes | Типичные ошибки | 2.0 | intermediate | late sub, cleanup, unbounded buffer |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| behavior_subject | subject_definition | 0.45 |
| common_mistakes | plain_subject | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
