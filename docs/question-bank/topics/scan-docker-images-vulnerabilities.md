# Сканирование Docker образов на уязвимости

- **topic_code:** `scan_docker_images_vulnerabilities`
- **source:** https://itlead.org/interview-questions/docker/scan-docker-images-vulnerabilities
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/scan-docker-images-vulnerabilities.bank.json` → `pnpm seed:topic -- scan_docker_images_vulnerabilities`
- **status:** draft

## Вопрос

> Как сканировать Docker образы на уязвимости?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | scanning_overview | Понимает суть vulnerability scanning | 2 | core_plus | TL;DR scanning |
| 1 | tools_trivy_grype | Знает Trivy, Grype, Docker Scout | 1.5 | core_plus | Three popular tools |
| 2 | ci_gating | Интегрирует scan в CI с gating | 1.5 | intermediate | CI integration gate |
| 3 | scan_moments | Знает три момента сканирования | 1.5 | intermediate | Three scanning moments |
| 4 | os_vs_app_cves | Различает OS и app CVE | 1.5 | intermediate | OS vs app CVEs |
| 5 | trivyignore_sbom | Знает .trivyignore и SBOM | 1 | basic | trivyignore and SBOM |
| 6 | common_mistakes | Знает типичные ошибки | 1 | basic | Common mistakes |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
