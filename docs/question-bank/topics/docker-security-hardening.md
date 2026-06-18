# Docker Security Hardening

- **topic_code:** `docker_security_hardening`
- **source:** https://itlead.org/interview-questions/docker/docker-security-hardening
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-security-hardening.bank.json` → `pnpm seed:topic -- docker_security_hardening`
- **status:** draft

## Вопрос

> Как реализовать security hardening Docker-контейнеров?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | hardening_rationale | Зачем нужен hardening | 1.5 | core_plus | shared kernel, defense-in-depth, CIS Benchmark |
| 1 | build_time_hardening | Build-time hardening | 1.5 | core_plus | USER nonroot, distroless, multi-stage, без секретов в слоях |
| 2 | runtime_hardening | Run-time флаги | 1.5 | core_plus | read-only, cap-drop, tmpfs, no-new-privileges, лимиты |
| 3 | seccomp_apparmor | Seccomp и AppArmor | 1.0 | basic | default profile vs unconfined, MAC |
| 4 | secrets_management | Управление секретами | 1.5 | core_plus | не env/ENV; mount, vault, Swarm secrets |
| 5 | image_scanning_supply | Scan и supply chain | 0.5 | mention | Trivy в CI, cosign, SBOM (senior bonus) |
| 6 | privileged_socket_mistakes | Опасные антипаттерны | 2.0 | intermediate | --privileged, docker.sock, root по умолчанию |
| 7 | host_daemon_hardening | Host/daemon hardening | 0.5 | mention | daemon.json, userns-remap, docker-bench-security |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| runtime_hardening | seccomp_apparmor | 0.45 |
| privileged_socket_mistakes | hardening_rationale | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
