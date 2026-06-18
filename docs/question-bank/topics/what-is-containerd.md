# Что такое containerd

- **topic_code:** `what_is_containerd`
- **source:** https://itlead.org/interview-questions/docker/what-is-containerd
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-containerd.bank.json` → `pnpm seed:topic -- what_is_containerd`
- **status:** draft

## Вопрос

> Что такое containerd и какова его роль в экосистеме Docker?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | containerd_role | Роль containerd | 1.5 | core_plus | TL;DR role |
| 1 | stack_position | Место в стеке | 2 | intermediate | architecture diagram |
| 2 | ctr_nerdctl | ctr и nerdctl | 1.5 | core_plus | tooling section |
| 3 | k8s_cri | containerd в Kubernetes | 2 | intermediate | post-dockershim |
| 4 | containerd_vs_runc | containerd vs runc | 1.5 | core_plus | common confusion |
| 5 | what_not_does | Чего containerd не делает | 1.5 | core_plus | boundaries ITLead |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
