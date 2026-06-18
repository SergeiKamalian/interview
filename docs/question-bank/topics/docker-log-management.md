# Управление логами в Docker

- **topic_code:** `docker_log_management`
- **source:** https://itlead.org/interview-questions/docker/docker-log-management
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-log-management.bank.json` → `pnpm seed:topic -- docker_log_management`
- **status:** draft

## Вопрос

> Как организовать управление логами в Docker?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | stdout_twelve_factor | stdout/stderr и Twelve-Factor | 1.5 | core_plus | ядро — приложение пишет только в stdout/stderr |
| 1 | log_drivers | Встроенные log drivers | 1.5 | core_plus | json-file, local, fluentd, loki, awslogs и когда что |
| 2 | log_rotation | Ротация логов | 2.0 | intermediate | max-size, max-file, compress — production must-have |
| 3 | centralized_shipping | Централизованная доставка | 1.5 | intermediate | Loki, ELK, CloudWatch, shipper с хоста |
| 4 | structured_json_logging | Структурированные JSON-логи | 1.0 | basic | machine-parseable, фильтрация по полям |
| 5 | docker_logs_limits | Ограничения docker logs | 1.0 | basic | только json-file/local/journald; remote drivers |
| 6 | common_mistakes | Типичные ошибки | 1.5 | intermediate | файлы в контейнере, без ротации, PII, docker logs в prod |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| log_drivers | stdout_twelve_factor | 0.45 |
| log_rotation | common_mistakes | 0.40 |
| centralized_shipping | docker_logs_limits | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
