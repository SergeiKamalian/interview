# Симметричный и асимметричный ключ в шифровании

- **topic_code:** `shcho_take_symetrychnyy_i_asymetrychnyy_klyuch_v_shyfruvanni`
- **source:** https://itlead.org/interview-questions/general/shcho-take-symetrychnyy-i-asymetrychnyy-klyuch-v-shyfruvanni
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/shcho-take-symetrychnyy-i-asymetrychnyy-klyuch-v-shyfruvanni.bank.json` → `pnpm seed:topic -- shcho_take_symetrychnyy_i_asymetrychnyy_klyuch_v_shyfruvanni`
- **status:** draft

## Вопрос

> Что такое симметричное и асимметричное шифрование и чем они отличаются?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | symmetric_asymmetric_definition | Понимает определение symmetric и asymmetric | 2 | core_plus | ядро TL;DR symmetric vs asymmetric |
| 1 | speed_key_distribution | Сравнивает скорость и проблему распределения ключей | 1.5 | core_plus | Key difference trade-off |
| 2 | when_use_crypto_type | Выбирает тип шифрования по сценарию | 1.5 | basic | When to use |
| 3 | hybrid_encryption_tls | Понимает гибридную модель TLS/HTTPS | 2 | intermediate | Hybrid encryption examples |
| 4 | crypto_common_mistakes | Знает типичные ошибки шифрования | 2 | intermediate | Common mistakes |
| 5 | aes_cbc_vs_gcm | Отличает AES-CBC от AES-GCM | 1 | basic | Follow-up AES-CBC vs GCM |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 6 – 8 | invite / maybe |
| formal strong | 8 – 9.5 | strong_invite / invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
