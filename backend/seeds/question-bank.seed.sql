-- Question bank seed (idempotent) — global platform questions (company_id IS NULL)

INSERT INTO professions (code, name)
VALUES ('frontend_developer', 'Frontend Developer')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO skills (code, name) VALUES
  ('javascript', 'JavaScript'),
  ('typescript', 'TypeScript'),
  ('react', 'React'),
  ('css', 'CSS'),
  ('html', 'HTML')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO topics (skill_id, code, name)
SELECT s.id, 'react_hooks', 'React Hooks'
FROM skills s WHERE s.code = 'react'
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO topics (skill_id, code, name)
SELECT s.id, 'javascript_closures', 'JavaScript Closures'
FROM skills s WHERE s.code = 'javascript'
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO topics (skill_id, code, name)
SELECT s.id, 'typescript_generics', 'TypeScript Generics'
FROM skills s WHERE s.code = 'typescript'
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO topics (skill_id, code, name)
SELECT s.id, 'state_management', 'State Management'
FROM skills s WHERE s.code = 'react'
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO topics (skill_id, code, name)
SELECT s.id, 'css_flexbox', 'CSS Flexbox'
FROM skills s WHERE s.code = 'css'
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO topics (skill_id, code, name)
SELECT s.id, 'javascript_event_loop', 'JavaScript Event Loop'
FROM skills s WHERE s.code = 'javascript'
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO topics (skill_id, code, name)
SELECT s.id, 'react_forms', 'React Forms'
FROM skills s WHERE s.code = 'react'
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO topics (skill_id, code, name)
SELECT s.id, 'react_fiber', 'React Fiber & Reconciliation'
FROM skills s WHERE s.code = 'react'
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- useEffect question
INSERT INTO questions (
  company_id, profession_id, topic_id, level, difficulty,
  question_text, short_answer, ideal_answer, max_score
)
SELECT NULL, p.id, t.id, 'junior', 'basic',
  'Что такое useEffect в React?',
  'useEffect — это React Hook для выполнения побочных эффектов в функциональных компонентах.',
  'useEffect — это Hook в React, который позволяет выполнять побочные эффекты в функциональных компонентах. Например, можно делать запросы к API, подписываться на события, запускать таймеры или работать с внешними системами. useEffect запускается после рендера компонента. С помощью массива зависимостей можно контролировать, когда эффект должен запускаться повторно. Также useEffect может возвращать cleanup function для очистки подписок, таймеров или listeners.',
  5.00
FROM professions p
JOIN topics t ON t.code = 'react_hooks'
WHERE p.code = 'frontend_developer'
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.question_text = 'Что такое useEffect в React?'
      AND q.profession_id = p.id
  );

INSERT INTO question_skills (question_id, skill_id)
SELECT q.id, s.id
FROM questions q
JOIN professions p ON p.id = q.profession_id
JOIN skills s ON s.code IN ('react', 'javascript')
WHERE q.question_text = 'Что такое useEffect в React?'
  AND NOT EXISTS (
    SELECT 1 FROM question_skills qs
    WHERE qs.question_id = q.id AND qs.skill_id = s.id
  );

INSERT INTO question_checkpoints (question_id, checkpoint_key, title, expected, score, sort_order)
SELECT q.id, cp.checkpoint_key, cp.title, cp.expected, cp.score, cp.sort_order
FROM questions q
JOIN (
  SELECT 'side_effects' AS checkpoint_key, 'Понимает назначение useEffect' AS title,
         'Кандидат говорит, что useEffect нужен для побочных эффектов.' AS expected, 1.00 AS score, 0 AS sort_order
  UNION ALL SELECT 'dependency_array', 'Понимает dependency array', 'Кандидат объясняет роль массива зависимостей.', 1.00, 1
  UNION ALL SELECT 'run_timing', 'Понимает момент запуска', 'Кандидат говорит, что эффект запускается после рендера и при изменении зависимостей.', 1.00, 2
  UNION ALL SELECT 'cleanup', 'Знает cleanup function', 'Кандидат упоминает очистку подписок, таймеров или listeners.', 1.00, 3
  UNION ALL SELECT 'example', 'Приводит пример', 'Кандидат приводит практический пример использования useEffect.', 1.00, 4
) cp
WHERE q.question_text = 'Что такое useEffect в React?'
  AND NOT EXISTS (
    SELECT 1 FROM question_checkpoints qc
    WHERE qc.question_id = q.id AND qc.checkpoint_key = cp.checkpoint_key
  );

INSERT INTO answer_examples (question_id, example_type, example_text, sort_order)
SELECT q.id, ex.example_type, ex.example_text, ex.sort_order
FROM questions q
JOIN (
  SELECT 'good' AS example_type,
         'useEffect используется для побочных эффектов, например для запроса данных после рендера. Массив зависимостей определяет, когда эффект перезапускается. Можно вернуть функцию очистки, например чтобы удалить listener.' AS example_text,
         0 AS sort_order
  UNION ALL SELECT 'bad', 'useEffect просто запускает функцию в компоненте.', 1
  UNION ALL SELECT 'bad', 'useEffect нужен для создания состояния.', 2
) ex
WHERE q.question_text = 'Что такое useEffect в React?'
  AND NOT EXISTS (
    SELECT 1 FROM answer_examples ae
    WHERE ae.question_id = q.id AND ae.example_type = ex.example_type AND ae.sort_order = ex.sort_order
  );

-- useState question
INSERT INTO questions (
  company_id, profession_id, topic_id, level, difficulty,
  question_text, short_answer, ideal_answer, max_score
)
SELECT NULL, p.id, t.id, 'junior', 'basic',
  'Как работает useState в React и зачем он нужен?',
  'useState — Hook для хранения локального состояния в функциональном компоненте.',
  'useState позволяет функциональному компоненту хранить состояние между рендерами. Вызов useState возвращает текущее значение и функцию обновления. Обновление через setter инициирует повторный рендер компонента. Начальное значение можно передать аргументом или ленивой функцией.',
  3.00
FROM professions p
JOIN topics t ON t.code = 'react_hooks'
WHERE p.code = 'frontend_developer'
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.question_text = 'Как работает useState в React и зачем он нужен?'
      AND q.profession_id = p.id
  );

INSERT INTO question_checkpoints (question_id, checkpoint_key, title, expected, score, sort_order)
SELECT q.id, cp.checkpoint_key, cp.title, cp.expected, cp.score, cp.sort_order
FROM questions q
JOIN (
  SELECT 'purpose' AS checkpoint_key, 'Понимает назначение useState' AS title,
         'Кандидат объясняет, что useState хранит локальное состояние.' AS expected, 1.00 AS score, 0 AS sort_order
  UNION ALL SELECT 'setter', 'Понимает setter', 'Кандидат говорит, что setter обновляет состояние и вызывает ререндер.', 1.00, 1
  UNION ALL SELECT 'initial', 'Знает про initial state', 'Кандидат упоминает начальное значение или lazy init.', 1.00, 2
) cp
WHERE q.question_text = 'Как работает useState в React и зачем он нужен?'
  AND NOT EXISTS (
    SELECT 1 FROM question_checkpoints qc
    WHERE qc.question_id = q.id AND qc.checkpoint_key = cp.checkpoint_key
  );

-- Closures question
INSERT INTO questions (
  company_id, profession_id, topic_id, level, difficulty,
  question_text, short_answer, ideal_answer, max_score
)
SELECT NULL, p.id, t.id, 'middle', 'intermediate',
  'Объясните, что такое замыкание (closure) в JavaScript.',
  'Замыкание — это функция, которая запоминает лексическое окружение, в котором была создана.',
  'Замыкание возникает, когда внутренняя функция сохраняет доступ к переменным внешней функции даже после завершения внешней функции. Это основа приватности данных, колбэков и многих паттернов в JS. Важно понимать, что переменные берутся по ссылке, а не копируются.',
  4.00
FROM professions p
JOIN topics t ON t.code = 'javascript_closures'
WHERE p.code = 'frontend_developer'
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.question_text = 'Объясните, что такое замыкание (closure) в JavaScript.'
      AND q.profession_id = p.id
  );

INSERT INTO question_checkpoints (question_id, checkpoint_key, title, expected, score, sort_order)
SELECT q.id, cp.checkpoint_key, cp.title, cp.expected, cp.score, cp.sort_order
FROM questions q
JOIN (
  SELECT 'definition' AS checkpoint_key, 'Даёт определение closure' AS title,
         'Кандидат объясняет связь функции и лексического окружения.' AS expected, 1.00 AS score, 0 AS sort_order
  UNION ALL SELECT 'lexical_env', 'Упоминает lexical environment', 'Кандидат говорит про доступ к внешним переменным.', 1.00, 1
  UNION ALL SELECT 'example', 'Приводит пример', 'Кандидат показывает практический пример замыкания.', 1.00, 2
  UNION ALL SELECT 'pitfall', 'Знает типичную ошибку', 'Кандидат упоминает loop/var или stale closure.', 1.00, 3
) cp
WHERE q.question_text = 'Объясните, что такое замыкание (closure) в JavaScript.'
  AND NOT EXISTS (
    SELECT 1 FROM question_checkpoints qc
    WHERE qc.question_id = q.id AND qc.checkpoint_key = cp.checkpoint_key
  );

-- TypeScript generics
INSERT INTO questions (
  company_id, profession_id, topic_id, level, difficulty,
  question_text, short_answer, ideal_answer, max_score
)
SELECT NULL, p.id, t.id, 'middle', 'intermediate',
  'Для чего нужны generics в TypeScript и как их использовать?',
  'Generics позволяют описывать переиспользуемые типы и функции с параметром типа.',
  'Generics добавляют параметризацию типов, чтобы API оставались типобезопасными без дублирования. Их используют в функциях, интерфейсах, классах и utility types. Ограничения через extends помогают сузить допустимые типы.',
  4.00
FROM professions p
JOIN topics t ON t.code = 'typescript_generics'
WHERE p.code = 'frontend_developer'
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.question_text = 'Для чего нужны generics в TypeScript и как их использовать?'
      AND q.profession_id = p.id
  );

-- Virtual DOM
INSERT INTO questions (
  company_id, profession_id, topic_id, level, difficulty,
  question_text, short_answer, ideal_answer, max_score
)
SELECT NULL, p.id, t.id, 'junior', 'basic',
  'Что такое Virtual DOM в React и зачем он нужен?',
  'Virtual DOM — легковесное представление UI, с которым React сравнивает изменения перед обновлением реального DOM.',
  'React строит виртуальное дерево элементов, при изменении состояния создаёт новое дерево и сравнивает с предыдущим (diffing), затем применяет минимальный набор изменений к реальному DOM. Это улучшает производительность и упрощает декларативный UI.',
  3.00
FROM professions p
JOIN topics t ON t.code = 'state_management'
WHERE p.code = 'frontend_developer'
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.question_text = 'Что такое Virtual DOM в React и зачем он нужен?'
      AND q.profession_id = p.id
  );

-- Flexbox
INSERT INTO questions (
  company_id, profession_id, topic_id, level, difficulty,
  question_text, short_answer, ideal_answer, max_score
)
SELECT NULL, p.id, t.id, 'junior', 'basic',
  'Как выровнять элементы по центру с помощью CSS Flexbox?',
  'Используют display: flex на контейнере и justify-content/align-items: center.',
  'Для центрирования по горизонтали и вертикали на flex-контейнере задают display: flex, justify-content: center и align-items: center. Важно понимать главную и поперечную оси, а также разницу между justify-content и align-items.',
  3.00
FROM professions p
JOIN topics t ON t.code = 'css_flexbox'
WHERE p.code = 'frontend_developer'
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.question_text = 'Как выровнять элементы по центру с помощью CSS Flexbox?'
      AND q.profession_id = p.id
  );

-- JavaScript Event Loop
INSERT INTO questions (
  company_id, profession_id, topic_id, level, difficulty,
  question_text, short_answer, ideal_answer, max_score
)
SELECT NULL, p.id, t.id, 'middle', 'intermediate',
  'Как работает event loop в JavaScript?',
  'Event loop координирует call stack, очереди задач и выполнение асинхронных callbacks.',
  'JavaScript выполняет синхронный код в call stack. Асинхронные операции передают callbacks в очереди задач: microtasks (например, Promise callbacks) и macrotasks/tasks (например, setTimeout, события). Event loop берёт задачи, когда call stack пуст, при этом microtasks обычно выполняются перед переходом к следующей macrotask. Понимание порядка выполнения помогает объяснить поведение Promise, setTimeout и async/await.',
  5.00
FROM professions p
JOIN topics t ON t.code = 'javascript_event_loop'
WHERE p.code = 'frontend_developer'
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.question_text = 'Как работает event loop в JavaScript?'
      AND q.profession_id = p.id
  );

-- React controlled components
INSERT INTO questions (
  company_id, profession_id, topic_id, level, difficulty,
  question_text, short_answer, ideal_answer, max_score
)
SELECT NULL, p.id, t.id, 'junior', 'basic',
  'Что такое controlled component в React?',
  'Controlled component — это form element, значение которого хранится в React state и обновляется через onChange.',
  'Controlled component в React получает value из состояния компонента и сообщает изменения через onChange, где вызывается setter. Источником правды становится React state, а не DOM. Такой подход удобен для validation, conditional UI, submit handling и синхронизации формы с остальным состоянием приложения. Важно понимать отличие от uncontrolled components, где значение хранится в DOM и читается через ref.',
  4.00
FROM professions p
JOIN topics t ON t.code = 'react_forms'
WHERE p.code = 'frontend_developer'
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.question_text = 'Что такое controlled component в React?'
      AND q.profession_id = p.id
  );

-- React Fiber and Virtual DOM update process
INSERT INTO questions (
  company_id, profession_id, topic_id, level, difficulty,
  question_text, short_answer, ideal_answer, max_score
)
SELECT NULL, p.id, t.id, 'senior', 'advanced',
  'Как работает React Fiber и процесс обновления Virtual DOM?',
  'React Fiber — это новая архитектура reconciliation в виде связного списка fiber-узлов, которая позволяет прерывать render phase, приоритизировать обновления и затем атомарно применять изменения к DOM в commit phase.',
  'До React 16 reconciler обходил дерево через call stack синхронно: большое дерево могло блокировать main thread на сотни миллисекунд. Fiber заменил стек на связный список узлов с указателями child, sibling и return — работу можно прерывать через shouldYield() и продолжать с того же узла. При setState/useState обновление попадает в очередь fiber, React строит work-in-progress дерево (current.alternate), вызывает render-функции и diff-ит props/state. В render phase DOM не меняется — фаза чистая и прерываемая. После завершения WIP начинается commit phase: она синхронная и атомарная — getSnapshotBeforeUpdate, commitMutationEffects (реальные DOM-изменения), commitLayoutEffects (useLayoutEffect, lifecycle), затем после paint — useEffect. Fiber планирует работу через пакет scheduler (MessageChannel postMessage, чанки ~5ms), а не через requestIdleCallback. Приоритеты кодируются lane bitmasks: SyncLane для ввода пользователя, TransitionLane для startTransition — более высокий приоритет прерывает низкий. createRoot в React 18 включает concurrent features; ReactDOM.render остаётся на legacy sync path. Для тяжёлых списков (500+ элементов) или фильтрации при вводе используют startTransition или useDeferredValue, но commit большого числа DOM-узлов всё равно блокирует браузер — Fiber не разбивает запись в DOM, поэтому virtualization остаётся нужной. Типичные ошибки: оборачивать в startTransition обновление value инпута, думать что concurrent mode убирает весь jank, и злоупотреблять flushSync.',
  8.00
FROM professions p
JOIN topics t ON t.code = 'react_fiber'
WHERE p.code = 'frontend_developer'
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.question_text = 'Как работает React Fiber и процесс обновления Virtual DOM?'
      AND q.profession_id = p.id
  );

INSERT INTO question_skills (question_id, skill_id)
SELECT q.id, s.id
FROM questions q
JOIN professions p ON p.id = q.profession_id
JOIN skills s ON s.code IN ('react', 'javascript')
WHERE q.question_text = 'Как работает React Fiber и процесс обновления Virtual DOM?'
  AND NOT EXISTS (
    SELECT 1 FROM question_skills qs
    WHERE qs.question_id = q.id AND qs.skill_id = s.id
  );

INSERT INTO question_checkpoints (question_id, checkpoint_key, title, expected, score, sort_order)
SELECT q.id, cp.checkpoint_key, cp.title, cp.expected, cp.score, cp.sort_order
FROM questions q
JOIN (
  SELECT 'fiber_definition' AS checkpoint_key,
         'Понимает, что такое Fiber' AS title,
         'Кандидат объясняет Fiber как переосмысление reconciliation engine: связный список fiber-узлов для инкрементального, прерываемого и приоритетного рендера Virtual DOM.' AS expected,
         1.00 AS score, 0 AS sort_order
  UNION ALL SELECT 'stack_vs_fiber', 'Отличает stack reconciler от Fiber',
         'Кандидат говорит, что до React 16 дерево обходилось синхронно через call stack без пауз; Fiber позволяет прерывать работу и возобновлять с того же узла, чтобы UI оставался отзывчивым.',
         1.00, 1
  UNION ALL SELECT 'fiber_pointers', 'Знает структуру fiber-узла',
         'Кандидат называет три указателя: child (первый потомок), sibling (следующий на том же уровне), return (родитель).',
         1.00, 2
  UNION ALL SELECT 'render_phase', 'Объясняет render phase и WIP tree',
         'Кандидат описывает построение work-in-progress дерева (current.alternate), diff props/state, роль key для списков; подчёркивает, что render phase чистая, прерываемая и не мутирует DOM.',
         1.00, 3
  UNION ALL SELECT 'commit_phase', 'Объясняет commit phase',
         'Кандидат говорит, что commit phase синхронная и атомарная: DOM-мутации, layout effects (useLayoutEffect), затем после paint — useEffect. Понимает, что именно commit нельзя прервать.',
         1.00, 4
  UNION ALL SELECT 'scheduling', 'Понимает планирование Fiber',
         'Кандидат упоминает scheduler, чанки работы (~5ms), shouldYield(), MessageChannel/postMessage; может отметить, что requestIdleCallback не используется напрямую из-за грубых дедлайнов.',
         1.00, 5
  UNION ALL SELECT 'lanes_priority', 'Понимает приоритеты и concurrent API',
         'Кандидат объясняет lane bitmasks (SyncLane vs TransitionLane), startTransition/useDeferredValue, createRoot vs ReactDOM.render.',
         1.00, 6
  UNION ALL SELECT 'commit_limitation', 'Знает ограничения concurrent mode',
         'Кандидат понимает, что Fiber разбивает построение WIP, но не разбивает запись в DOM: массовый commit тысяч узлов всё равно блокирует браузер; virtualization/react-window по-прежнему нужна.',
         1.00, 7
) cp
WHERE q.question_text = 'Как работает React Fiber и процесс обновления Virtual DOM?'
  AND NOT EXISTS (
    SELECT 1 FROM question_checkpoints qc
    WHERE qc.question_id = q.id AND qc.checkpoint_key = cp.checkpoint_key
  );

INSERT INTO answer_examples (question_id, example_type, example_text, sort_order)
SELECT q.id, ex.example_type, ex.example_text, ex.sort_order
FROM questions q
JOIN (
  SELECT 'good' AS example_type,
         'Fiber заменил stack-based reconciler на связный список узлов, поэтому React может обрабатывать дерево кусками и уступать main thread при вводе пользователя. Сначала идёт render phase: строится WIP-дерево, diff-ятся fiber-узлы, DOM не трогается. Потом commit phase — синхронно применяются мутации DOM и layout effects. Для тяжёлой фильтрации большого списка я оставляю setInput синхронным, а filterLargeList оборачиваю в startTransition — так инпут не лагает, а список догоняет в фоне. Concurrent mode не отменяет jank от commit 20 000 DOM-узлов, поэтому для длинных списков всё равно нужна виртуализация.' AS example_text,
         0 AS sort_order
  UNION ALL SELECT 'good',
         'У каждого fiber есть child, sibling и return — обход идёт вглубь через child, потом через sibling, при тупике поднимаемся return. Приоритеты кодируются lanes: ввод пользователя (SyncLane) важнее transition-обновлений. useDeferredValue отстаёт от query на один или несколько рендеров, поэтому input остаётся мгновенным, а тяжёлый список фильтруется с низким приоритетом. createRoot в React 18 включает эти возможности, а legacy ReactDOM.render остаётся на синхронном пути.',
         1
  UNION ALL SELECT 'good',
         'Render phase можно прервать: React строит alternate-дерево и собирает список эффектов, не трогая реальный DOM. Commit phase — три подфазы: snapshot до мутаций, DOM updates, layout effects. useEffect выполняется уже после paint. Scheduler режет работу на ~5ms через MessageChannel, а не через requestIdleCallback. Типичная ошибка — обернуть setInputValue в startTransition: тогда лагает сам инпут; transition нужен только для вторичного тяжёлого обновления.',
         2
  UNION ALL SELECT 'bad',
         'Fiber — это просто Virtual DOM. React сравнивает деревья и обновляет страницу быстрее.',
         0
  UNION ALL SELECT 'bad',
         'Concurrent mode полностью убирает лаги. Можно рендерить 20 000 div без virtualization — Fiber всё разобьёт на кадры.',
         1
  UNION ALL SELECT 'bad',
         'Чтобы приложение стало concurrent, достаточно обернуть все setState в startTransition, включая value инпута. flushSync можно использовать везде, где нужен быстрый UI.',
         2
  UNION ALL SELECT 'bad',
         'Render phase и commit phase — одно и то же. React сразу пишет в DOM во время reconcileChildFibers.',
         3
) ex
WHERE q.question_text = 'Как работает React Fiber и процесс обновления Virtual DOM?'
  AND NOT EXISTS (
    SELECT 1 FROM answer_examples ae
    WHERE ae.question_id = q.id AND ae.example_type = ex.example_type AND ae.sort_order = ex.sort_order
  );

-- Skill links for seeded questions
INSERT INTO question_skills (question_id, skill_id)
SELECT q.id, s.id
FROM questions q
JOIN (
  SELECT 'Как работает useState в React и зачем он нужен?' AS question_text, 'react' AS skill_code
  UNION ALL SELECT 'Как работает useState в React и зачем он нужен?', 'javascript'
  UNION ALL SELECT 'Объясните, что такое замыкание (closure) в JavaScript.', 'javascript'
  UNION ALL SELECT 'Для чего нужны generics в TypeScript и как их использовать?', 'typescript'
  UNION ALL SELECT 'Что такое Virtual DOM в React и зачем он нужен?', 'react'
  UNION ALL SELECT 'Что такое Virtual DOM в React и зачем он нужен?', 'javascript'
  UNION ALL SELECT 'Как выровнять элементы по центру с помощью CSS Flexbox?', 'css'
  UNION ALL SELECT 'Как работает event loop в JavaScript?', 'javascript'
  UNION ALL SELECT 'Что такое controlled component в React?', 'react'
  UNION ALL SELECT 'Что такое controlled component в React?', 'javascript'
  UNION ALL SELECT 'Как работает React Fiber и процесс обновления Virtual DOM?', 'react'
  UNION ALL SELECT 'Как работает React Fiber и процесс обновления Virtual DOM?', 'javascript'
) map ON map.question_text = q.question_text
JOIN skills s ON s.code = map.skill_code
WHERE q.company_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM question_skills qs
    WHERE qs.question_id = q.id AND qs.skill_id = s.id
  );

-- TypeScript generics checkpoints
INSERT INTO question_checkpoints (question_id, checkpoint_key, title, expected, score, sort_order)
SELECT q.id, cp.checkpoint_key, cp.title, cp.expected, cp.score, cp.sort_order
FROM questions q
JOIN (
  SELECT 'type_parameter' AS checkpoint_key, 'Понимает параметр типа' AS title,
         'Кандидат объясняет, что generic добавляет параметр типа для функции, интерфейса, класса или типа.' AS expected, 1.00 AS score, 0 AS sort_order
  UNION ALL SELECT 'reusability', 'Понимает переиспользование', 'Кандидат говорит, что generics позволяют не дублировать похожие типы и API.', 1.00, 1
  UNION ALL SELECT 'type_safety', 'Понимает type safety', 'Кандидат объясняет, что generics сохраняют связь входных и выходных типов без any.', 1.00, 2
  UNION ALL SELECT 'constraints', 'Знает constraints', 'Кандидат упоминает extends или ограничение допустимых типов.', 1.00, 3
) cp
WHERE q.question_text = 'Для чего нужны generics в TypeScript и как их использовать?'
  AND NOT EXISTS (
    SELECT 1 FROM question_checkpoints qc
    WHERE qc.question_id = q.id AND qc.checkpoint_key = cp.checkpoint_key
  );

-- Virtual DOM checkpoints
INSERT INTO question_checkpoints (question_id, checkpoint_key, title, expected, score, sort_order)
SELECT q.id, cp.checkpoint_key, cp.title, cp.expected, cp.score, cp.sort_order
FROM questions q
JOIN (
  SELECT 'representation' AS checkpoint_key, 'Понимает representation' AS title,
         'Кандидат говорит, что Virtual DOM — это представление UI в памяти.' AS expected, 1.00 AS score, 0 AS sort_order
  UNION ALL SELECT 'diffing', 'Понимает diffing', 'Кандидат объясняет сравнение нового и предыдущего дерева.', 1.00, 1
  UNION ALL SELECT 'dom_updates', 'Понимает обновление DOM', 'Кандидат говорит, что React применяет нужные изменения к реальному DOM.', 1.00, 2
) cp
WHERE q.question_text = 'Что такое Virtual DOM в React и зачем он нужен?'
  AND NOT EXISTS (
    SELECT 1 FROM question_checkpoints qc
    WHERE qc.question_id = q.id AND qc.checkpoint_key = cp.checkpoint_key
  );

-- Flexbox checkpoints
INSERT INTO question_checkpoints (question_id, checkpoint_key, title, expected, score, sort_order)
SELECT q.id, cp.checkpoint_key, cp.title, cp.expected, cp.score, cp.sort_order
FROM questions q
JOIN (
  SELECT 'display_flex' AS checkpoint_key, 'Знает display flex' AS title,
         'Кандидат говорит, что контейнеру нужен display: flex.' AS expected, 1.00 AS score, 0 AS sort_order
  UNION ALL SELECT 'justify_content', 'Понимает justify-content', 'Кандидат объясняет центрирование по главной оси через justify-content: center.', 1.00, 1
  UNION ALL SELECT 'align_items', 'Понимает align-items', 'Кандидат объясняет центрирование по поперечной оси через align-items: center.', 1.00, 2
) cp
WHERE q.question_text = 'Как выровнять элементы по центру с помощью CSS Flexbox?'
  AND NOT EXISTS (
    SELECT 1 FROM question_checkpoints qc
    WHERE qc.question_id = q.id AND qc.checkpoint_key = cp.checkpoint_key
  );

-- JavaScript Event Loop checkpoints
INSERT INTO question_checkpoints (question_id, checkpoint_key, title, expected, score, sort_order)
SELECT q.id, cp.checkpoint_key, cp.title, cp.expected, cp.score, cp.sort_order
FROM questions q
JOIN (
  SELECT 'call_stack' AS checkpoint_key, 'Понимает call stack' AS title,
         'Кандидат объясняет, что синхронный код выполняется в call stack.' AS expected, 1.00 AS score, 0 AS sort_order
  UNION ALL SELECT 'task_queues', 'Понимает очереди задач', 'Кандидат упоминает очереди асинхронных callbacks/tasks.', 1.00, 1
  UNION ALL SELECT 'microtasks', 'Отличает microtasks', 'Кандидат говорит, что Promise callbacks/async continuation попадают в microtask queue.', 1.00, 2
  UNION ALL SELECT 'macrotasks', 'Отличает macrotasks', 'Кандидат упоминает setTimeout, events или timers как macrotasks/tasks.', 1.00, 3
  UNION ALL SELECT 'execution_order', 'Понимает порядок выполнения', 'Кандидат объясняет, что microtasks выполняются перед следующей macrotask, когда stack пуст.', 1.00, 4
) cp
WHERE q.question_text = 'Как работает event loop в JavaScript?'
  AND NOT EXISTS (
    SELECT 1 FROM question_checkpoints qc
    WHERE qc.question_id = q.id AND qc.checkpoint_key = cp.checkpoint_key
  );

-- React controlled components checkpoints
INSERT INTO question_checkpoints (question_id, checkpoint_key, title, expected, score, sort_order)
SELECT q.id, cp.checkpoint_key, cp.title, cp.expected, cp.score, cp.sort_order
FROM questions q
JOIN (
  SELECT 'state_as_source' AS checkpoint_key, 'Понимает source of truth' AS title,
         'Кандидат объясняет, что value хранится в React state.' AS expected, 1.00 AS score, 0 AS sort_order
  UNION ALL SELECT 'value_prop', 'Упоминает value prop', 'Кандидат говорит, что input получает value из state.', 1.00, 1
  UNION ALL SELECT 'on_change', 'Упоминает onChange', 'Кандидат объясняет обновление state через onChange/setter.', 1.00, 2
  UNION ALL SELECT 'uncontrolled_difference', 'Отличает uncontrolled', 'Кандидат объясняет отличие от uncontrolled components/ref/DOM state.', 1.00, 3
) cp
WHERE q.question_text = 'Что такое controlled component в React?'
  AND NOT EXISTS (
    SELECT 1 FROM question_checkpoints qc
    WHERE qc.question_id = q.id AND qc.checkpoint_key = cp.checkpoint_key
  );

-- Specific examples for detailed test questions
INSERT INTO answer_examples (question_id, example_type, example_text, sort_order)
SELECT q.id, ex.example_type, ex.example_text, ex.sort_order
FROM questions q
JOIN (
  SELECT 'Как работает event loop в JavaScript?' AS question_text, 'good' AS example_type,
         'Сначала выполняется синхронный код в call stack. Когда stack пуст, event loop берёт microtasks вроде Promise callbacks, затем переходит к следующей macrotask, например setTimeout.' AS example_text,
         0 AS sort_order
  UNION ALL SELECT 'Как работает event loop в JavaScript?', 'bad', 'Event loop просто делает JavaScript многопоточным.', 1
  UNION ALL SELECT 'Что такое controlled component в React?', 'good', 'Это input, где value берётся из React state, а onChange вызывает setState. Поэтому React state является source of truth и форму легко валидировать.', 0
  UNION ALL SELECT 'Что такое controlled component в React?', 'bad', 'Это компонент, который React сам контролирует без state и handlers.', 1
) ex ON ex.question_text = q.question_text
WHERE q.company_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM answer_examples ae
    WHERE ae.question_id = q.id AND ae.example_type = ex.example_type AND ae.sort_order = ex.sort_order
  );

-- Add generic good/bad examples for questions missing them
INSERT INTO answer_examples (question_id, example_type, example_text, sort_order)
SELECT q.id, 'good',
       'Кандидат даёт структурированный ответ с определением, механизмом и примером из практики.',
       0
FROM questions q
WHERE q.company_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM answer_examples ae
    WHERE ae.question_id = q.id AND ae.example_type = 'good'
  );

INSERT INTO answer_examples (question_id, example_type, example_text, sort_order)
SELECT q.id, 'bad',
       'Ответ слишком общий, без конкретики и без примеров.',
       0
FROM questions q
WHERE q.company_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM answer_examples ae
    WHERE ae.question_id = q.id AND ae.example_type = 'bad'
  );
