# Контейнер vs виртуальная машина

- **topic_code:** `container_vs_virtual_machine`
- **source:** https://itlead.org/interview-questions/docker/container-vs-virtual-machine
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/container-vs-virtual-machine.bank.json` → `pnpm seed:topic -- container_vs_virtual_machine`
- **status:** draft

## Вопрос

> Чем контейнер отличается от виртуальной машины (VM)?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | container_vm_definition | Определяет контейнер и VM | 2.0 | core_plus | Key difference и TL;DR — ядро темы |
| 1 | isolation_mechanism | Механизмы изоляции | 1.5 | basic | namespaces/cgroups vs hypervisor |
| 2 | resource_overhead | Ресурсы и скорость | 2.0 | core_plus | старт, память, плотность из comparison table |
| 3 | isolation_strength | Сила изоляции | 1.5 | basic | shared kernel vs hardware-level |
| 4 | when_to_use | Выбор контейнер или VM | 2.0 | core_plus | decision rules ITLead |
| 5 | common_mistakes | Типичные заблуждения | 1.0 | basic | «лёгкая VM», CI, image vs RAM |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe |
| formal strong | 7 – 9 | invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
| | | | | | | |
