-- React.lazy & Suspense (source: https://itlead.org/interview-questions/react/reactlazy-and-suspense-lazy-components-in-react)
-- IMPORTANT: apply with utf8mb4 client charset:
--   docker compose exec -T mysql mysql -uai_interviewer -pchangeme --default-character-set=utf8mb4 ai_interviewer < backend/seeds/react-lazy-suspense.seed.sql

SET NAMES utf8mb4;

-- Purge QA attempts for lazy interviews before bank re-insert.
DELETE ics FROM interview_checkpoint_states ics
JOIN interview_attempts ia ON ia.id = ics.interview_attempt_id
WHERE ia.interview_id IN (5, 6, 7, 8, 9);

DELETE ifu FROM interview_follow_ups ifu
JOIN interview_attempts ia ON ia.id = ifu.interview_attempt_id
WHERE ia.interview_id IN (5, 6, 7, 8, 9);

DELETE im FROM interview_messages im
JOIN interview_attempts ia ON ia.id = im.interview_attempt_id
WHERE ia.interview_id IN (5, 6, 7, 8, 9);

DELETE FROM interview_attempts WHERE interview_id IN (5, 6, 7, 8, 9);

-- Legacy: interview #5 corrupted encoding QA (kept for reference in comments).
DELETE iae FROM interview_answer_examples iae
JOIN interview_questions iq ON iq.id = iae.interview_question_id
JOIN questions q ON q.id = iq.source_question_id
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_lazy_suspense';

DELETE iqc FROM interview_question_checkpoints iqc
JOIN interview_questions iq ON iq.id = iqc.interview_question_id
JOIN questions q ON q.id = iq.source_question_id
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_lazy_suspense';

DELETE iq FROM interview_questions iq
JOIN questions q ON q.id = iq.source_question_id
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_lazy_suspense';

DELETE ae FROM answer_examples ae
JOIN questions q ON q.id = ae.question_id
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_lazy_suspense';

DELETE qc FROM question_checkpoints qc
JOIN questions q ON q.id = qc.question_id
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_lazy_suspense';

DELETE qs FROM question_skills qs
JOIN questions q ON q.id = qs.question_id
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_lazy_suspense';

DELETE q FROM questions q
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_lazy_suspense';

INSERT INTO topics (skill_id, code, name, interview_weight)
SELECT s.id, 'react_lazy_suspense', 'React.lazy и Suspense', 5
FROM skills s WHERE s.code = 'react'
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  interview_weight = VALUES(interview_weight);

INSERT INTO questions (
  company_id, profession_id, topic_id, level, difficulty,
  question_text, short_answer, ideal_answer, max_score
)
SELECT NULL, p.id, t.id, 'middle', 'intermediate',
  'Как работают React.lazy и Suspense для ленивой загрузки компонентов?',
  'React.lazy оборачивает dynamic import() и возвращает компонент для обычного рендера. Suspense перехватывает состояние загрузки и показывает fallback, пока chunk не подтянулся — это code splitting почти без настройки.',
  'React.lazy(() => import("./Dashboard")) возвращает компонент, который React рендерит как обычный. При первом рендере lazy-компонента React приостанавливает дерево: dynamic import оборачивается в Promise, Suspense ловит suspend и показывает fallback (спиннер, skeleton, placeholder). Когда Promise резолвится, React продолжает рендер. Bundler (Webpack или Vite) видит import() и автоматически создаёт отдельный chunk-файл — отдельная .js-сборка без ручной настройки. React.lazy работает только с default export. Для named export нужна обёртка: lazy(() => import("./UserCard").then(mod => ({ default: mod.UserCard }))). Lazy объявляют на уровне модуля, вне тела компонента — иначе на каждом рендере создаётся новая ссылка и ломается кеширование chunk. Без Suspense выше по дереву lazy-компонент упадёт в runtime. Один Suspense может оборачивать несколько lazy-детей: fallback виден, пока грузится хотя бы один. Если chunk не скачался (сеть), React бросает ошибку вверх — в проде нужен ErrorBoundary вокруг Suspense; Suspense сам network errors не ловит. Хорошие кейсы: route-level splitting (React Router), тяжёлые модалки и drawer по клику, admin-разделы, chart/editor/PDF viewer. Плохие кейсы: мелкие компоненты и всё, что рендерится сразу на первом экране — async overhead не окупается. React.lazy client-only; на сервере Next.js использует next/dynamic (ssr: false, встроенный loading). Типичные ошибки: забыть Suspense, объявить lazy внутри компонента, думать что Suspense заменяет ErrorBoundary.',
  10.00
FROM professions p
JOIN topics t ON t.code = 'react_lazy_suspense'
WHERE p.code = 'frontend_developer';

INSERT INTO question_skills (question_id, skill_id)
SELECT q.id, s.id
FROM questions q
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_lazy_suspense'
JOIN skills s ON s.code IN ('react', 'javascript');

INSERT INTO question_checkpoints (question_id, checkpoint_key, title, expected, score, sort_order)
SELECT q.id, cp.checkpoint_key, cp.title, cp.expected, cp.score, cp.sort_order
FROM questions q
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_lazy_suspense'
JOIN (
  SELECT 'lazy_api' AS checkpoint_key,
         'Понимает React.lazy' AS title,
         'Кандидат объясняет: React.lazy оборачивает dynamic import(), возвращает компонент для рендера; при первом рендере React suspend, загружается отдельный chunk.' AS expected,
         1.00 AS score, 0 AS sort_order
  UNION ALL SELECT 'suspense_fallback', 'Понимает Suspense и fallback',
         'Кандидат говорит: Suspense перехватывает загрузку lazy-компонента и показывает fallback UI, пока Promise import не резолвится.',
         1.00, 1
  UNION ALL SELECT 'code_splitting', 'Понимает code splitting',
         'Кандидат упоминает: Webpack/Vite автоматически создают отдельный chunk для dynamic import(), без ручной настройки.',
         1.00, 2
  UNION ALL SELECT 'default_export', 'Знает ограничение default export',
         'Кандидат говорит: lazy ожидает default export; для named export — .then(mod => ({ default: mod.Component })).',
         1.00, 3
  UNION ALL SELECT 'module_level_lazy', 'Объявляет lazy на уровне модуля',
         'Кандидат объясняет: const Page = lazy(...) на уровне модуля, не внутри function Component() на каждом рендере.',
         2.00, 4
  UNION ALL SELECT 'error_boundary', 'Знает про ErrorBoundary',
         'Кандидат понимает: при ошибке загрузки chunk React бросает ошибку вверх; в проде ErrorBoundary вокруг Suspense обязателен.',
         2.00, 5
  UNION ALL SELECT 'when_to_use', 'Понимает когда применять',
         'Кандидат называет route-level split, тяжёлые модалки/admin/chart; не lazy-loadит мелочь и первый экран.',
         2.00, 6
) cp;

UPDATE question_checkpoints qc
JOIN questions q ON q.id = qc.question_id
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_lazy_suspense'
SET qc.evaluation_hints = CASE qc.checkpoint_key
  WHEN 'lazy_api' THEN JSON_OBJECT(
    'complexityTier', 'basic',
    'weightRationale', 'dynamic import + suspend — ядро темы',
    'probePolicy', JSON_OBJECT(
      'requireProbeBeforeFinalPartial', false,
      'minScoreAfterShallowAccept', 0.55
    ),
    'mustConcepts', JSON_ARRAY(
      'React.lazy', 'lazy', 'dynamic import', 'import()', 'chunk', 'Promise', 'suspend',
      'ленив', 'отложен', 'отдельн'
    ),
    'falseClaims', JSON_ARRAY(
      'lazy работает на сервере как SSR', 'React.lazy это SSR',
      'lazy заменяет Suspense', 'lazy не нужен import'
    ),
    'minMatchedConcepts', 2,
    'positiveFloorScore', 0.85
  )
  WHEN 'suspense_fallback' THEN JSON_OBJECT(
    'complexityTier', 'basic',
    'weightRationale', 'без Suspense lazy не работает в UI',
    'probePolicy', JSON_OBJECT(
      'requireProbeBeforeFinalPartial', false,
      'minScoreAfterShallowAccept', 0.55
    ),
    'confusionPairs', JSON_ARRAY(
      JSON_OBJECT(
        'checkpointKey', 'suspense_fallback',
        'oftenConfusedWith', JSON_ARRAY('error_boundary'),
        'anchorTermsExpected', JSON_ARRAY('Suspense', 'fallback', 'loading', 'загрузк', 'spinner', 'skeleton'),
        'anchorTermsWrongTopic', JSON_ARRAY('ErrorBoundary', 'error boundary', 'ловит ошибк', 'network error')
      )
    ),
    'mustConcepts', JSON_ARRAY(
      'Suspense', 'fallback', 'спиннер', 'skeleton', 'placeholder', 'загрузк', 'loading',
      'приостанов', 'suspend', 'пока груз'
    ),
    'falseClaims', JSON_ARRAY(
      'Suspense не нужен для lazy', 'без Suspense lazy работает',
      'Suspense ловит network error без ErrorBoundary', 'Suspense заменяет ErrorBoundary'
    ),
    'minMatchedConcepts', 2,
    'positiveFloorScore', 0.85
  )
  WHEN 'code_splitting' THEN JSON_OBJECT(
    'complexityTier', 'basic',
    'weightRationale', 'bundler автоматически режет chunk',
    'probePolicy', JSON_OBJECT(
      'requireProbeBeforeFinalPartial', false,
      'minScoreAfterShallowAccept', 0.55
    ),
    'mustConcepts', JSON_ARRAY(
      'code splitting', 'chunk', 'Webpack', 'Vite', 'bundler', 'dynamic import',
      'отдельн', 'файл', 'бандл', 'сборк'
    ),
    'falseClaims', JSON_ARRAY(
      'нужно вручную настраивать chunk', 'lazy не создаёт отдельный файл',
      'code splitting только в Next.js'
    ),
    'minMatchedConcepts', 2,
    'positiveFloorScore', 0.85
  )
  WHEN 'default_export' THEN JSON_OBJECT(
    'complexityTier', 'basic',
    'weightRationale', 'частая ошибка: named export без .then',
    'probePolicy', JSON_OBJECT(
      'requireProbeBeforeFinalPartial', false,
      'minScoreAfterShallowAccept', 0.55
    ),
    'mustConcepts', JSON_ARRAY(
      'default export', 'named export', '.then', 'mod.', 'default: mod',
      'именован', 'экспорт', 'UserCard'
    ),
    'falseClaims', JSON_ARRAY(
      'lazy работает с named export напрямую', 'named export без then',
      'любой export подходит'
    ),
    'minMatchedConcepts', 2,
    'positiveFloorScore', 0.85
  )
  WHEN 'module_level_lazy' THEN JSON_OBJECT(
    'complexityTier', 'intermediate',
    'weightRationale', 'pitfall: lazy внутри render ломает кеш chunk',
    'probePolicy', JSON_OBJECT(
      'requireProbeBeforeFinalPartial', true,
      'shallowAcceptMaxFraction', 0.5,
      'minScoreAfterShallowAccept', 0.55
    ),
    'impliesCheckpointFloors', JSON_ARRAY(
      JSON_OBJECT('checkpointKey', 'lazy_api', 'floorFraction', 0.55),
      JSON_OBJECT('checkpointKey', 'default_export', 'floorFraction', 0.45)
    ),
    'probeConceptGroups', JSON_ARRAY(
      JSON_OBJECT(
        'match', JSON_ARRAY('уровень модуля', 'module level', 'вне компонент', 'вне function'),
        'ask', 'почему lazy объявляют на уровне модуля, а не внутри компонента'
      ),
      JSON_OBJECT(
        'match', JSON_ARRAY('на каждом рендер', 'внутри render', 'в теле функции'),
        'ask', 'что ломается если создавать lazy на каждом рендере'
      )
    ),
    'mustConcepts', JSON_ARRAY(
      'уровень модуля', 'module level', 'вне компонент', 'на каждом рендер',
      'const Chart = lazy', 'не внутри функции', 'вне function'
    ),
    'falseClaims', JSON_ARRAY(
      'можно объявлять lazy внутри компонента', 'lazy внутри render',
      'lazy в теле функции на каждом рендере нормально'
    ),
    'minMatchedConcepts', 2,
    'positiveFloorScore', 0.85
  )
  WHEN 'error_boundary' THEN JSON_OBJECT(
    'complexityTier', 'intermediate',
    'weightRationale', 'production: network fail chunk — ErrorBoundary, не Suspense',
    'probePolicy', JSON_OBJECT(
      'requireProbeBeforeFinalPartial', true,
      'shallowAcceptMaxFraction', 0.5,
      'minScoreAfterShallowAccept', 0.55
    ),
    'impliesCheckpointFloors', JSON_ARRAY(
      JSON_OBJECT('checkpointKey', 'suspense_fallback', 'floorFraction', 0.5)
    ),
    'confusionPairs', JSON_ARRAY(
      JSON_OBJECT(
        'checkpointKey', 'error_boundary',
        'oftenConfusedWith', JSON_ARRAY('suspense_fallback'),
        'anchorTermsExpected', JSON_ARRAY('ErrorBoundary', 'error boundary', 'chunk fail', 'network', 'Failed to load'),
        'anchorTermsWrongTopic', JSON_ARRAY('fallback', 'spinner', 'Suspense ловит', 'loading UI')
      )
    ),
    'probeConceptGroups', JSON_ARRAY(
      JSON_OBJECT(
        'match', JSON_ARRAY('ErrorBoundary', 'error boundary', 'chunk fail', 'network'),
        'ask', 'как ErrorBoundary обрабатывает ошибку загрузки chunk'
      ),
      JSON_OBJECT(
        'match', JSON_ARRAY('Suspense', 'fallback'),
        'ask', 'чем Suspense отличается от ErrorBoundary при failed import'
      )
    ),
    'mustConcepts', JSON_ARRAY(
      'ErrorBoundary', 'error boundary', 'ошибк загруз', 'chunk fail',
      'сеть', 'network', 'упадёт', 'прод', 'Failed to load'
    ),
    'falseClaims', JSON_ARRAY(
      'Suspense сам ловит ошибки сети', 'ErrorBoundary не нужен',
      'lazy сам обрабатывает failed chunk'
    ),
    'minMatchedConcepts', 2,
    'positiveFloorScore', 0.85
  )
  WHEN 'when_to_use' THEN JSON_OBJECT(
    'complexityTier', 'advanced',
    'weightRationale', 'route/modal vs lazy всего на первом экране',
    'probePolicy', JSON_OBJECT(
      'requireProbeBeforeFinalPartial', true,
      'shallowAcceptMaxFraction', 0.5,
      'minScoreAfterShallowAccept', 0.55
    ),
    'impliesCheckpointFloors', JSON_ARRAY(
      JSON_OBJECT('checkpointKey', 'code_splitting', 'floorFraction', 0.45),
      JSON_OBJECT('checkpointKey', 'lazy_api', 'floorFraction', 0.4)
    ),
    'probeConceptGroups', JSON_ARRAY(
      JSON_OBJECT(
        'match', JSON_ARRAY('route', 'React Router', 'роут', 'модал', 'drawer'),
        'ask', 'где lazy даёт выигрыш — route-level или modal'
      ),
      JSON_OBJECT(
        'match', JSON_ARRAY('первый экран', 'overhead', 'мелк', 'кнопк'),
        'ask', 'когда lazy не стоит применять'
      )
    ),
    'mustConcepts', JSON_ARRAY(
      'route', 'роут', 'React Router', 'модал', 'drawer', 'admin',
      'chart', 'editor', 'первый экран', 'overhead', 'тяжёл'
    ),
    'falseClaims', JSON_ARRAY(
      'lazy-load всё подряд', 'lazy для каждого компонента',
      'можно lazy-load кнопку на первом экране без overhead',
      'async overhead не существует'
    ),
    'minMatchedConcepts', 2,
    'positiveFloorScore', 0.75
  )
  ELSE qc.evaluation_hints
END;

INSERT INTO answer_examples (question_id, example_type, example_text, sort_order)
SELECT q.id, ex.example_type, ex.example_text, ex.sort_order
FROM questions q
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_lazy_suspense'
JOIN (
  SELECT 'good' AS example_type,
         'const Dashboard = lazy(() => import("./pages/Dashboard")); оборачиваю в <Suspense fallback={<Spinner />}>. Vite сам вынесет chunk — пользователь на /home не качает /admin.' AS example_text,
         0 AS sort_order
  UNION ALL SELECT 'good',
         'ну lazy это dynamic import, Suspense fallback пока chunk грузится, отдельный файл', 1
  UNION ALL SELECT 'bad',
         'React.lazy работает с SSR на сервере, Suspense не нужен.', 10
  UNION ALL SELECT 'bad',
         'lazy с named export напрямую, объявляю lazy внутри function Page() на каждом рендере.', 11
  UNION ALL SELECT 'bad',
         'Suspense ловит network errors, ErrorBoundary не нужен. lazy-load всё подряд включая кнопку первого экрана.', 12
) ex;

INSERT INTO answer_examples (question_id, checkpoint_key, example_type, example_text, sort_order)
SELECT q.id, cp.checkpoint_key, cp.example_type, cp.example_text, cp.sort_order
FROM questions q
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_lazy_suspense'
JOIN (
  SELECT 'lazy_api' AS checkpoint_key, 'good' AS example_type,
         'React.lazy(() => import("./Page")) — при первом рендере suspend, подтягивается chunk.' AS example_text, 20 AS sort_order
  UNION ALL SELECT 'lazy_api', 'good',
         'lazy оборачивает dynamic import, компонент грузится когда реально рендерим', 21
  UNION ALL SELECT 'suspense_fallback', 'good',
         '<Suspense fallback={<p>Loading...</p>}> — fallback пока Promise import не резолвится.', 22
  UNION ALL SELECT 'suspense_fallback', 'good',
         'fallback спиннер пока chunk качается, потом рендер продолжается', 23
  UNION ALL SELECT 'code_splitting', 'good',
         'Webpack/Vite видят import() и режут отдельный .js chunk автоматически.', 24
  UNION ALL SELECT 'default_export', 'good',
         'lazy ждёт default export; для named: .then(mod => ({ default: mod.UserCard })).', 25
  UNION ALL SELECT 'module_level_lazy', 'good',
         'const HeavyChart = lazy(...) на уровне модуля, не внутри function ReportPage().', 26
  UNION ALL SELECT 'error_boundary', 'good',
         '<ErrorBoundary><Suspense fallback={...}><LazyPage /></Suspense></ErrorBoundary> — chunk fail не роняет всё приложение.', 27
  UNION ALL SELECT 'when_to_use', 'good',
         'lazy на роуты React Router и тяжёлые модалки; не на кнопку первого экрана.', 28
  UNION ALL SELECT 'lazy_api', 'bad',
         'React.lazy это SSR-хук на сервере, Suspense не нужен.', 30
  UNION ALL SELECT 'suspense_fallback', 'bad',
         'Suspense ловит network errors, ErrorBoundary не нужен.', 31
  UNION ALL SELECT 'default_export', 'bad',
         'lazy работает с любым named export без .then обёртки.', 32
) cp;

-- Backfill snapshot from bank (re-run safe).
UPDATE interview_question_checkpoints iqc
JOIN interview_questions iq ON iq.id = iqc.interview_question_id
JOIN question_checkpoints qc
  ON qc.question_id = iq.source_question_id
 AND qc.checkpoint_key = iqc.checkpoint_key
SET iqc.evaluation_hints = qc.evaluation_hints
WHERE qc.evaluation_hints IS NOT NULL;

DELETE iae FROM interview_answer_examples iae
JOIN interview_questions iq ON iq.id = iae.interview_question_id
JOIN questions q ON q.id = iq.source_question_id
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_lazy_suspense'
WHERE iae.checkpoint_key IS NOT NULL;

INSERT INTO interview_answer_examples (
  interview_question_id, checkpoint_key, example_type, example_text, sort_order
)
SELECT iq.id, ae.checkpoint_key, ae.example_type, ae.example_text, ae.sort_order
FROM interview_questions iq
JOIN answer_examples ae ON ae.question_id = iq.source_question_id
WHERE ae.checkpoint_key IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM interview_answer_examples iae
    WHERE iae.interview_question_id = iq.id
      AND iae.checkpoint_key <=> ae.checkpoint_key
      AND iae.example_type = ae.example_type
      AND iae.sort_order = ae.sort_order
  );
