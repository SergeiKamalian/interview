# Мониторинг Docker в production

- **topic_code:** `monitor_docker_containers_production`
- **source:** https://itlead.org/interview-questions/docker/monitor-docker-containers-production
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/monitor-docker-containers-production.bank.json` → `pnpm seed:topic -- monitor_docker_containers_production`
- **status:** draft

## Вопрос

> Как мониторить Docker контейнеры в production?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | monitoring_layers | Понимает три слоя мониторинга | 2 | core_plus | TL;DR три шара |
| 1 | standard_stack | Знает стандартный стек cAdvisor+Prometheus+Grafana | 1.5 | core_plus | Standard stack ITLead |
| 2 | essential_alerts | Знает ключевые алерты | 1.5 | intermediate | Essential alerts |
| 3 | logs_pipeline | Понимает отдельный pipeline логов | 1.5 | intermediate | Logs separate pipeline |
| 4 | healthcheck_monitoring | Связывает healthcheck с мониторингом | 1 | basic | Health-driven monitoring |
| 5 | daemon_metrics | Знает метрики Docker daemon | 1 | basic | Daemon metrics endpoint |
| 6 | common_mistakes | Знает типичные ошибки | 1.5 | basic | Common mistakes |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
