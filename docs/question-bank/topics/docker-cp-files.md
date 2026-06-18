# Копирование файлов между контейнером и хостом (docker cp)

- **topic_code:** `docker_cp_files`
- **source:** https://itlead.org/interview-questions/docker/docker-cp-files
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-cp-files.bank.json` → `pnpm seed:topic -- docker_cp_files`
- **status:** draft

## Вопрос

> Как копировать файлы между Docker-контейнером и хостом?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | cp_basic_syntax | Базовый синтаксис docker cp | 2.0 | intermediate | ядро — SRC/DST, CONTAINER:PATH, оба направления, running/stopped |
| 1 | direction_and_paths | Направление и поведение путей | 1.5 | core_plus | container→host vs host→container, trailing `/.` |
| 2 | recursive_and_metadata | Рекурсия и метаданные | 1.0 | basic | каталоги, `-a`, owner/permissions |
| 3 | common_mistakes | Типичные ошибки | 2.5 | intermediate | writable layer, между контейнерами, UID на хосте |
| 4 | when_not_to_use | Когда не использовать docker cp | 1.5 | core_plus | bind mount для dev, volume для данных |
| 5 | stream_tar_form | Потоковая форма (tar) | 1.5 | core_plus | stdin/stdout, pipe между контейнерами |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
