# Rootless Docker

- **topic_code:** `what_is_rootless_docker`
- **source:** https://itlead.org/interview-questions/docker/what-is-rootless-docker
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-rootless-docker.bank.json` → `pnpm seed:topic -- what_is_rootless_docker`
- **status:** draft

## Вопрос

> Что такое rootless Docker и когда его использовать?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | rootless_definition | Rootless Docker | 2.0 | core_plus | unprivileged dockerd, security |
| 1 | how_userns_works | UID mapping | 1.5 | intermediate | user namespaces, subuid |
| 2 | installation_setup | Установка | 1.0 | basic | DOCKER_HOST, systemctl --user |
| 3 | tradeoffs_limits | Trade-offs | 2.0 | intermediate | no privileged, slirp4netns |
| 4 | comparison_podman | vs Podman | 1.5 | intermediate | daemonless comparison |
| 5 | when_to_use | Когда использовать | 1.5 | basic | CI, HPC, regulated |
| 6 | common_mistakes | Типичные ошибки | 0.5 | mention | mix daemons, bind mount UID |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
