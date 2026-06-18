# Директивы в Angular и их типы

- **topic_code:** `what_are_directives_what_types_exist_angular`
- **source:** https://itlead.org/interview-questions/angular/what-are-directives-and-what-types-exist-in-angular
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-are-directives-and-what-types-exist-in-angular.bank.json` → `pnpm seed:topic -- what_are_directives_what_types_exist_angular`
- **status:** ready

## Вопрос

> Что такое директивы в Angular и какие типы директив существуют?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | directive_definition | Определение директивы | 1.5 | core_plus | @Directive, расширение HTML при компиляции |
| 1 | three_directive_types | Три типа директив | 2.0 | core_plus | attribute, structural, component — TL;DR |
| 2 | attribute_directives | Атрибутные директивы | 1.0 | basic | [appHighlight], ElementRef, HostListener, HostBinding |
| 3 | structural_directives | Структурные директивы | 2.0 | intermediate | *ngIf, TemplateRef, ViewContainerRef, createEmbeddedView |
| 4 | component_as_directive | Компонент как директива | 1.0 | basic | @Component extends @Directive, template, encapsulation |
| 5 | common_mistakes | Типичные ошибки | 2.0 | intermediate | Renderer2 vs nativeElement, TemplateRef, два * на элементе |
| 6 | when_to_use | Directive vs component vs service | 0.5 | basic | when to use таблица ITLead |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / invite |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
