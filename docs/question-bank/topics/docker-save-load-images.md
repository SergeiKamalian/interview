# Передача Docker-образов без registry

- **topic_code:** `docker_save_load_images`
- **source:** https://itlead.org/interview-questions/docker/docker-save-load-images
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-save-load-images.bank.json` → `pnpm seed:topic -- docker_save_load_images`
- **status:** draft

## Вопрос

> Как передать Docker-образ между хостами без registry?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | save_load_definition | Понимает docker save и docker load | 1.5 | core_plus | export IMAGE в tar со слоями и metadata; load импортирует в другой daemon |
| 1 | save_vs_export | Отличает save/load от export/import | 2.0 | intermediate | image vs container; слои и CMD/ENV vs flattened без metadata — главная ловушка |
| 2 | save_load_workflow | Знает базовый workflow save → transfer → load | 1.5 | core_plus | `-o`, scp/USB, `docker load -i`; имя и тег сохраняются |
| 3 | compression_streaming | Сжатие и стриминг без temp-файла | 1.0 | basic | gzip/zstd, pipe через SSH, несколько образов в одном tar |
| 4 | common_mistakes | Знает типичные ошибки save/load | 2.0 | intermediate | export вместо save, stdout без redirect, огромный tar, import без имени |
| 5 | when_to_use | Понимает когда save/load, а когда registry | 1.0 | basic | air-gapped/offline vs CI/CD, dedup, pull-by-digest |
| 6 | save_vs_pull | Отличает save от pull | 1.0 | basic | pull из registry по HTTP vs export локального образа в tar |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| save_vs_export | save_load_definition | 0.45 |
| common_mistakes | save_vs_export | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / invite |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
| | | | | | | |
