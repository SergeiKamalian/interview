# Что такое .dockerignore

- **topic_code:** `what_is_dockerignore`
- **source:** https://itlead.org/interview-questions/docker/what-is-dockerignore
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-dockerignore.bank.json` → `pnpm seed:topic -- what_is_dockerignore`
- **status:** draft

## Вопрос

> Что такое .dockerignore и зачем он нужен?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | dockerignore_definition | Назначение .dockerignore | 2.0 | core_plus | фильтр build context, speed/size/security |
| 1 | build_context | Build context | 1.5 | basic | корень context, upload в daemon |
| 2 | pattern_syntax | Синтаксис паттернов | 1.5 | basic | glob, negation, порядок правил |
| 3 | why_exclude_entries | Что исключать | 2.0 | intermediate | node_modules, .git, .env, dist |
| 4 | common_mistakes | Типичные ошибки | 2.0 | intermediate | нет файла, COPY . ., wrong location |
| 5 | inspect_context | Проверка context | 1.0 | mention | transferring context, tar exclude |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
