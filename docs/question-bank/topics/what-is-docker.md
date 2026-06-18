# Что такое Docker

- **topic_code:** `what_is_docker`
- **source:** https://itlead.org/interview-questions/docker/what-is-docker
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-docker.bank.json` → `pnpm seed:topic -- what_is_docker`
- **status:** draft

## Вопрос

> Что такое Docker и зачем он нужен?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | docker_definition | Понимает суть Docker | 1.5 | core_plus | ядро TL;DR — платформа + контейнер |
| 1 | container_not_vm | Контейнер ≠ VM | 1.5 | core_plus | namespaces/cgroups vs guest kernel |
| 2 | image_vs_container | Отличает образ от контейнера | 1 | basic | blueprint vs running instance |
| 3 | when_to_use | Когда Docker уместен | 1 | basic | works on my machine + compose onboarding |
| 4 | common_mistakes | Знает типичные ошибки | 2 | intermediate | mutable container vs immutable image |
| 5 | docker_vs_k8s | Docker vs Kubernetes | 1.5 | core_plus | follow-up из ITLead |
| 6 | real_world_value | Практическая ценность | 1.5 | core_plus | real-world adoption ITLead |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
