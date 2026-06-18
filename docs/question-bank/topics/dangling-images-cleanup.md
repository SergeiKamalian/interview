# Dangling images и очистка

- **topic_code:** `dangling_images_cleanup`
- **source:** https://itlead.org/interview-questions/docker/dangling-images-cleanup
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/dangling-images-cleanup.bank.json` → `pnpm seed:topic -- dangling_images_cleanup`
- **status:** draft

## Вопрос

> Что такое dangling Docker images и как их удалить?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | dangling_definition | Определяет dangling image | 2.0 | core_plus | ядро TL;DR — без тега, без ссылок |
| 1 | dangling_vs_unused | Отличает dangling от unused | 1.5 | basic | частая путаница из ITLead таблицы |
| 2 | how_dangling_appear | Знает как появляются dangling | 1.0 | basic | tag reuse, re-pull, failed build |
| 3 | cleanup_prune_commands | Команды очистки | 2.0 | core_plus | docker image prune — главный практический ответ |
| 4 | common_mistakes | Типичные ошибки | 2.0 | intermediate | prune vs -a, volumes, «corrupt» |
| 5 | list_and_inspect | Просмотр и диагностика | 1.5 | basic | docker images -f dangling, system df |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 4 – 6 | maybe |
| formal strong | 7 – 9 | invite |
