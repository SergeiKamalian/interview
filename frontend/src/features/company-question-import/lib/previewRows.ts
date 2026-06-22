import type {
  CompanyQuestionImportPreview,
  ImportPreviewRow,
} from '../model/types';

export function buildImportPreviewRows(
  preview: CompanyQuestionImportPreview,
): ImportPreviewRow[] {
  const rows: ImportPreviewRow[] = [];

  for (const item of preview.toCreate.topics) {
    rows.push({
      id: `create-topic-${item.code ?? item.importKey ?? rows.length}`,
      kind: 'create',
      entity: 'topic',
      code: item.code,
      name: item.name,
      details: item.importKey ? `importKey: ${item.importKey}` : undefined,
    });
  }

  for (const item of preview.toCreate.skills) {
    rows.push({
      id: `create-skill-${item.code ?? rows.length}`,
      kind: 'create',
      entity: 'skill',
      code: item.code,
      name: item.name,
    });
  }

  for (const item of preview.toCreate.questions) {
    rows.push({
      id: `create-question-${item.importKey ?? item.code ?? rows.length}`,
      kind: 'create',
      entity: 'question',
      code: item.code,
      name: item.topicCode,
      details: [
        item.questionText,
        item.checkpointCount != null
          ? `${item.checkpointCount} checkpoints`
          : null,
      ]
        .filter(Boolean)
        .join(' · '),
    });
  }

  for (const item of preview.toUpdate.topics) {
    rows.push({
      id: `update-topic-${item.code ?? rows.length}`,
      kind: 'update',
      entity: 'topic',
      code: item.code,
      name: item.name,
    });
  }

  for (const item of preview.toUpdate.questions) {
    rows.push({
      id: `update-question-${item.importKey ?? item.code ?? rows.length}`,
      kind: 'update',
      entity: 'question',
      code: item.code,
      name: item.topicCode,
      details: item.questionText ?? undefined,
    });
  }

  return rows;
}

export function hasImportPreviewChanges(
  preview: CompanyQuestionImportPreview,
): boolean {
  const { toCreate, toUpdate } = preview;
  return (
    toCreate.topics.length > 0 ||
    toCreate.skills.length > 0 ||
    toCreate.questions.length > 0 ||
    toCreate.checkpoints > 0 ||
    toUpdate.topics.length > 0 ||
    toUpdate.questions.length > 0
  );
}
