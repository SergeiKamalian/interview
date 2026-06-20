# 16-✅-interview-creation-flow — Enhanced Interview Creation Flow

## Цель блока

Перестроить создание интервью в полноценный визард настройки AI-интервьюера: профессия/скиллы → подбор вопросов (с AI) → поведение AI (тон/глубина/строгость) → формат/тайминги → доступ/лимиты → результаты → превью/публикация.

Главный дифференциатор: компания настраивает AI-интервьюера как «сотрудника» (характер, глубина, строгость, рамки), а не просто выбирает вопросы.

---

## Контекст

Текущий flow (`CreateInterviewPage` + `QuestionPicker`) умеет только: title/jobRole/level, welcome text, плоский выбор вопросов (limit 100, без фильтров), draft/publish без единого центра управления.

Чего нет (и добавляем в этом блоке):

- выбор профессии и релевантных скиллов из справочника;
- красивый подбор вопросов (тема/сложность/score, skills-first), AI-кнопка подбора из банка;
- поведение AI: tone / probing depth / scoring strictness (3 независимые ручки);
- лимиты: дедлайн, кап прохождений, попытки, тайминги, проходной порог;
- единый lifecycle и страница управления интервью;
- JD → предзаполненный визард; live preview.

---

## Источник правды (design)

- `docs/interview-creation/README.md` — основной design-doc этого блока (видение, визард, модель данных, маппинг на код, roadmap).

Перед началом любого subtask читать этот design-doc.

---

## Входит в блок

- Backend: list-queries professions/skills/topics; фильтр `skillIds`; AI-подбор вопросов из банка.
- DB: migration с новыми полями на `interviews` + `interview_templates`.
- Backend: проброс конфигурации интервью в adaptive engine (tone/depth/strictness).
- Backend: enforcement лимитов на входе кандидата.
- Backend: JD → prefill resolver.
- Frontend: визард создания (шаги 1–7), новый подбор вопросов, JD-модалка, lifecycle/redirects, страница управления.
- Templates: parity новых полей + редактируемое создание из шаблона.
- Live preview («попробовать как кандидат»).

---

## Не входит в первый проход

- Детектор списывания / proctoring (осознанно отложено).
- Кросс-платформенный бенчмаркинг.
- Сравнение кандидатов (попарно/3–4) — отдельный флоу результатов, не создание.
- Skill-radar / тепловая карта.
- Брендированная страница кандидата.
- AI-генерация НОВЫХ вопросов (только подбор из банка).

---

## Architecture Rules

- `question bank` остаётся source of truth. AI только ОТБИРАЕТ существующие вопросы, не создаёт новые.
- Tone/depth/strictness меняют разговор и follow-up-бюджет, НЕ меняют `max_score`/checkpoints/критерии.
- Принцип «всё редактируемо до создания»: JD и шаблон только ПРЕДЗАПОЛНЯЮТ визард.
- Шаблон = редактируемые настройки, а не готовое интервью.
- Единая точка создания на backend — `InterviewCoreService.createInterview()`.
- Backend imports без `.js` suffix; GraphQL — основной API; frontend — RTK Query + GraphQL.
- **Frontend UI — только shadcn/ui** (`.cursor/rules/frontend-ui-shadcn.mdc`). Компоненты из `@shared/ui`; недостающие ставить из папки `frontend/`: `pnpm dlx shadcn@latest add <component>`. Каталог: https://ui.shadcn.com/docs/components. Не писать кастомные аналоги и не тащить другие UI-киты.

---

## Design Docs

- `docs/interview-creation/README.md`
- `docs/database/schemas/interview-core.md`
- `docs/database/schemas/interview-templates.md`
- `docs/database/schemas/question-bank.md`
