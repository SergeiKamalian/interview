# Content projection (ng-content) в Angular

- **topic_code:** `content_projection_angular`
- **source:** https://itlead.org/interview-questions/angular/content-projection-in-angular
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/content-projection-in-angular.bank.json` → `pnpm seed:topic -- content_projection_angular`
- **status:** ready

## Вопрос

> Как работает content projection (ng-content) в Angular?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | ng_content_definition | ng-content и проекция | 1.5 | core_plus | ядро — живые DOM-узлы родителя |
| 1 | ng_content_vs_input | ng-content vs @Input() | 1.5 | core_plus | разметка vs данные |
| 2 | select_named_slots | select и именованные слоты | 1.5 | core_plus | card/modal паттерн |
| 3 | common_mistakes | Типичные ошибки | 2.0 | intermediate | selector, *ngIf, Emulated styles |
| 4 | content_child_lifecycle | @ContentChildren и lifecycle | 1.5 | intermediate | ngAfterContentInit, tabs |
| 5 | when_to_use | Когда использовать | 1.0 | basic | wrappers vs data-only |
| 6 | template_outlet_vs_projection | ng-content vs ngTemplateOutlet | 1.0 | basic | follow-up из ITLead |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| ng_content_vs_input | ng_content_definition | 0.45 |
| common_mistakes | select_named_slots | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |

## Примечание перед seed

В `question-bank.seed.sql` пока нет skill `angular`. Перед `pnpm seed:topic` добавь:

```sql
INSERT INTO skills (code, name) VALUES ('angular', 'Angular')
ON DUPLICATE KEY UPDATE name = VALUES(name);
```
