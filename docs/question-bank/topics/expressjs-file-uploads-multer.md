# Загрузка файлов с Multer в Express.js

- **topic_code:** `expressjs_file_uploads_multer`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-file-uploads-multer
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-file-uploads-multer.bank.json` → `pnpm seed:topic -- expressjs_file_uploads_multer`
- **status:** draft

## Вопрос

> Как обрабатывать загрузку файлов в Express.js с помощью Multer?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | why_multer | Зачем Multer | 1.5 | core_plus | gap Express built-ins |
| 1 | upload_methods | single array fields | 2 | intermediate | API surface multer |
| 2 | storage_options | memory vs disk storage | 1.5 | core_plus | storage choice |
| 3 | validation_limits | limits и fileFilter | 2 | intermediate | production security |
| 4 | error_handling_multer | Обработка ошибок Multer | 1.5 | core_plus | two error types |
| 5 | filename_s3 | Filename и S3 | 1.5 | core_plus | real-world upload |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / reject |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
