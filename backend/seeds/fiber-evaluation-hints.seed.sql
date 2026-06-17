-- Fiber evaluation_hints migrated from legacy positive-evidence-floor patterns (commit 3de5da3).
-- Run after migration 016 + question-bank seed.

UPDATE question_checkpoints qc
JOIN questions q ON q.id = qc.question_id
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_fiber'
SET qc.evaluation_hints = CASE qc.checkpoint_key
  WHEN 'fiber_definition' THEN JSON_OBJECT(
    'mustConcepts', JSON_ARRAY(
      'reconciliation', 'reconciler', 'fiber', 'связный список', 'fiber-узл',
      'render phase', 'commit phase', 'прерыва', 'инкремент', 'work loop',
      'createRoot', 'startTransition', 'useDeferredValue', 'React 18'
    ),
    'falseClaims', JSON_ARRAY(
      'Fiber это просто Virtual DOM', 'просто Virtual DOM',
      'Virtual DOM быстрее обновляет', 'Fiber — это Virtual DOM'
    ),
    'minMatchedConcepts', 2,
    'positiveFloorScore', 0.85
  )
  WHEN 'stack_vs_fiber' THEN JSON_OBJECT(
    'mustConcepts', JSON_ARRAY(
      'call stack', 'стек', 'рекурсив', 'синхрон', 'React 16',
      'связный список', 'linked list', 'work loop', 'fiber-узл',
      'прерыва', 'уступ', 'yield', 'main thread', 'shouldYield', 'инкремент'
    ),
    'falseClaims', JSON_ARRAY(
      'рендер полностью асинхронным через Promises',
      'Fiber сделал рендер полностью асинхронным'
    ),
    'minMatchedConcepts', 2,
    'positiveFloorScore', 0.85
  )
  WHEN 'fiber_pointers' THEN JSON_OBJECT(
    'mustConcepts', JSON_ARRAY('child', 'sibling', 'return', 'alternate', 'current', 'потомок', 'обход'),
    'falseClaims', JSON_ARRAY('parent и next', 'лежат в Redux', 'Virtual DOM хранит'),
    'minMatchedConcepts', 3,
    'positiveFloorScore', 0.85
  )
  WHEN 'render_phase' THEN JSON_OBJECT(
    'mustConcepts', JSON_ARRAY(
      'wip', 'work-in-progress', 'work in progress', 'alternate', 'current tree',
      'чернов', 'DOM не', 'не трога', 'не мутир', 'прерыва', 'shouldYield', 'render phase'
    ),
    'falseClaims', JSON_ARRAY(
      'render пишет в DOM', 'render phase пишет в DOM',
      'useEffect до paint', 'reconcileChildFibers сразу в DOM'
    ),
    'minMatchedConcepts', 2,
    'positiveFloorScore', 0.85
  )
  WHEN 'commit_phase' THEN JSON_OBJECT(
    'mustConcepts', JSON_ARRAY(
      'commit phase', 'commit', 'атомар', 'atomic', 'синхрон',
      'before mutation', 'mutation', 'layout', 'passive',
      'useLayoutEffect', 'useEffect'
    ),
    'falseClaims', JSON_ARRAY(
      'commit можно прервать', 'render и commit одно и то же',
      'render phase и commit phase одно и то же'
    ),
    'minMatchedConcepts', 2,
    'positiveFloorScore', 0.85
  )
  WHEN 'scheduling' THEN JSON_OBJECT(
    'mustConcepts', JSON_ARRAY(
      'scheduler', 'планирован', 'MessageChannel', 'postMessage',
      'shouldYield', 'should yield', '5ms', 'chunk', 'куск', 'тайм-слайс', 'yield'
    ),
    'falseClaims', JSON_ARRAY(
      'requestIdleCallback', 'idle callback', 'request idle callback'
    ),
    'minMatchedConcepts', 2,
    'positiveFloorScore', 0.85
  )
  WHEN 'lanes_priority' THEN JSON_OBJECT(
    'mustConcepts', JSON_ARRAY(
      'SyncLane', 'TransitionLane', 'lane', 'lanes', 'startTransition',
      'useDeferredValue', 'createRoot', 'transition', 'приоритет'
    ),
    'falseClaims', JSON_ARRAY(
      'lanes в Redux', 'ReactDOM.render поддерживает concurrent',
      'обернуть все setState в startTransition'
    ),
    'minMatchedConcepts', 1,
    'positiveFloorScore', 0.85
  )
  WHEN 'commit_limitation' THEN JSON_OBJECT(
    'mustConcepts', JSON_ARRAY(
      'прерыва', 'render', 'commit', 'атомар', 'синхрон', 'блокир',
      'виртуализац', 'virtualization', 'массов', 'DOM-мутац', 'тысяч'
    ),
    'falseClaims', JSON_ARRAY(
      'concurrent mode полностью убирает лаги',
      'concurrent mode полностью убирает',
      'не нужна virtualization', '20 000 div без virtualization'
    ),
    'minMatchedConcepts', 2,
    'positiveFloorScore', 0.75,
    'falseClaimCapFraction', 0
  )
  ELSE qc.evaluation_hints
END;

-- Refresh per-checkpoint examples in bank.
DELETE ae FROM answer_examples ae
JOIN questions q ON q.id = ae.question_id
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_fiber'
WHERE ae.checkpoint_key IS NOT NULL;

INSERT INTO answer_examples (question_id, checkpoint_key, example_type, example_text, sort_order)
SELECT q.id, cp.checkpoint_key, cp.example_type, cp.example_text, cp.sort_order
FROM questions q
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_fiber'
JOIN (
  SELECT 'fiber_definition' AS checkpoint_key, 'good' AS example_type,
         'Fiber — reconciliation engine на связном списке: render прерываемый, commit синхронный.' AS example_text, 10 AS sort_order
  UNION ALL SELECT 'fiber_definition', 'good',
         'ну типа новый движок reconciliation, render в памяти, commit уже в dom', 11
  UNION ALL SELECT 'stack_vs_fiber', 'good',
         'Раньше call stack синхронно; Fiber — связный список, может yield и продолжить с того же узла.', 12
  UNION ALL SELECT 'stack_vs_fiber', 'good',
         'короче раньше всё через стек — мог подвиснуть, сейчас кусками с yield', 13
  UNION ALL SELECT 'fiber_pointers', 'good',
         'child, sibling, return — обход вглубь; alternate/current для wip.', 14
  UNION ALL SELECT 'fiber_pointers', 'good',
         'ну у узла child sibling return, ещё alternate для wip', 15
  UNION ALL SELECT 'render_phase', 'good',
         'WIP alternate в памяти, current tree на экране, DOM не трогается.', 16
  UNION ALL SELECT 'render_phase', 'good',
         'wip черновик в памяти, dom пока старый, render прерывается', 17
  UNION ALL SELECT 'commit_phase', 'good',
         'Commit синхронный: mutation → layout (useLayoutEffect) → useEffect после paint.', 18
  UNION ALL SELECT 'commit_phase', 'good',
         'commit жёстко пишет в dom — его не прервёшь, useLayoutEffect тут', 19
  UNION ALL SELECT 'scheduling', 'good',
         'Scheduler: shouldYield ~5ms, MessageChannel/postMessage, не requestIdleCallback.', 20
  UNION ALL SELECT 'scheduling', 'good',
         'scheduler yield через message channel, не idle callback', 21
  UNION ALL SELECT 'lanes_priority', 'good',
         'SyncLane для ввода, TransitionLane для startTransition/useDeferredValue.', 22
  UNION ALL SELECT 'lanes_priority', 'good',
         'setState с lane, startTransition для тяжёлых обновлений', 23
  UNION ALL SELECT 'commit_limitation', 'good',
         'Concurrent прерывает render, но commit синхронный — нужна virtualization на тысячах узлов.', 24
  UNION ALL SELECT 'commit_limitation', 'good',
         'массовый commit всё равно блокирует браузер, virtualization нужна', 25
  UNION ALL SELECT 'scheduling', 'bad',
         'Fiber планирует через requestIdleCallback — браузер сам решает когда рендерить.', 30
  UNION ALL SELECT 'fiber_definition', 'bad',
         'Fiber — это просто Virtual DOM, React быстрее обновляет страницу.', 31
  UNION ALL SELECT 'commit_limitation', 'bad',
         'Concurrent mode полностью убирает лаги, virtualization не нужна на 20000 элементов.', 32
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
JOIN topics t ON t.id = q.topic_id AND t.code = 'react_fiber'
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
