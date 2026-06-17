# Checkpoint weight rubric

Вес checkpoint = **сложность / ценность** критерия для уровня вопроса (middle по умолчанию).

AI выставляет `score_awarded` от `0` до `weight`. Итог интервью нормализуется в **/10**.

---

## Шкала weight (на один checkpoint)

| weight | tier | Когда ставить |
|--------|------|----------------|
| **0.5** | `mention` | Бонусное упоминание, контекст, «приятно услышать», не блокер для middle |
| **1.0** | `basic` | Базовое понимание темы — без этого ответ слабый |
| **1.5** | `core_plus` | Важный нюанс, частая ошибка на собесах |
| **2.0** | `intermediate` | Production-паттерн, типичный pitfall, связка с другими темами |
| **2.5** | `advanced` | Глубокое понимание, trade-offs, неочевидные edge cases |
| **3.0** | `expert` | Senior/lead уровень: архитектурное решение, диагностика, «когда не делать» |

Допустимы любые значения `DECIMAL(5,2)` в диапазоне **0.5–3.0** (шаг 0.5 удобен для чтения).

**Не обязательно** использовать только 1 и 2 — для Fiber можно дать `scheduling` = 2.5, а `fiber_definition` = 1.5 и т.д.

---

## Правило суммы

```txt
questions.max_score = SUM(question_checkpoints.score) = 10.00
```

Валидатор backend проверяет равенство при save через GraphQL.

Если checkpoints много и сумма «не сходится» — нормализуй пропорции, но **не меняй относительный порядок** сложности.

---

## Глубина ответа внутри checkpoint

Один checkpoint с `weight = 2` может дать:

| Глубина (AI rationale) | Доля от weight | Пример при weight=2 |
|------------------------|----------------|---------------------|
| упомянул / слышал | 0 – 25% | 0 – 0.5 |
| поверхностно | 40 – 60% | 0.8 – 1.2 |
| понимает целиком | 100% | 2.0 |
| уверенно врёт | 0 + red flag | 0 |

Таксономия depth: `mention_only` → `heard_of` → `partial_knowledge` → `understands` → `knows` → `false_claim`.

---

## Как распределять по ITLead-статье

1. **Заголовки / подтемы статьи** → кандидаты в `checkpoint_key`.
2. **Первый блок (что это)** → обычно `basic` (1.0).
3. **«Как работает» / механизм** → `basic` или `core_plus` (1.0–1.5).
4. **Типичные ошибки / ограничения** → `intermediate` (1.5–2.0).
5. **Production / ErrorBoundary / когда применять** → `intermediate`–`advanced` (2.0–2.5).
6. **Сравнение с альтернативами (Next.js dynamic)** → `mention` или `advanced` (0.5–2.5) по важности для level.

После черновика — проверка:

- Сумма = 10?
- Самый тяжёлый checkpoint отражает то, что отличает strong от average?
- Bad-профиль не может набрать > 3/10 без red flags?

---

## Метаданные в БД

В `question_checkpoints.evaluation_hints` (JSON) рекомендуется дублировать tier для агента:

```json
{
  "complexityTier": "intermediate",
  "weightRationale": "Production: chunk load failure needs ErrorBoundary, not Suspense alone",
  "mustConcepts": ["..."],
  "falseClaims": ["..."]
}
```

Поле `score` в таблице — **единственный source of truth для математики**. `complexityTier` — для человека и для промпта.

---

## Примеры распределения на 10 баллов

### React.lazy (7 checkpoints)

| checkpoint | weight | tier |
|------------|--------|------|
| lazy_api | 1.0 | basic |
| suspense_fallback | 1.0 | basic |
| code_splitting | 1.0 | basic |
| default_export | 1.0 | basic |
| module_level_lazy | 2.0 | intermediate |
| error_boundary | 2.0 | intermediate |
| when_to_use | 2.0 | intermediate |

### Гипотетический Fiber (8 checkpoints, вариант)

| checkpoint | weight | tier |
|------------|--------|------|
| fiber_definition | 1.5 | core_plus |
| stack_vs_fiber | 1.5 | core_plus |
| fiber_pointers | 1.0 | basic |
| render_phase | 1.0 | basic |
| commit_phase | 1.0 | basic |
| scheduling | 2.5 | advanced |
| lanes_priority | 1.5 | core_plus |
| commit_limitation | 1.0 | basic |

Сумма = 10.0.
