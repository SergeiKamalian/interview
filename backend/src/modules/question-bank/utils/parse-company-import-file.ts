import * as XLSX from 'xlsx';
import type { BankAnswerExample, BankCheckpoint } from '../../../seed/bank-topic.types';
import { QUESTION_DIFFICULTIES } from '../types/question-difficulty.enum';
import { QUESTION_LEVELS } from '../types/question-level.enum';
import {
  COMPANY_IMPORT_COLUMNS,
  type CompanyImportBundle,
  type CompanyImportFieldError,
  type CompanyImportFlatRow,
  type CompanyImportParseResult,
  type CompanyImportQuestionBundle,
  type CompanyImportTopicMeta,
  type CompanyImportWarning,
  type ParsedImportQuestionMeta,
} from '../types/company-import-internal.type';

const CHECKPOINT_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;
const TAXONOMY_CODE_PATTERN = /^[a-z][a-z0-9_]*$/;
const WEIGHT_TOLERANCE = 0.01;
const MAX_IMPORT_ROWS = 500;

const REQUIRED_COLUMNS: Array<(typeof COMPANY_IMPORT_COLUMNS)[number]> = [
  'topic_code',
  'topic_name',
  'skill_code',
  'profession_code',
  'level',
  'difficulty',
  'question_text',
  'short_answer',
  'ideal_answer',
  'checkpoint_key',
  'checkpoint_title',
  'checkpoint_expected',
  'checkpoint_weight',
];

export function parseCompanyImportFile(
  buffer: Buffer,
  filename: string,
): CompanyImportParseResult {
  const errors: CompanyImportFieldError[] = [];
  const warnings: CompanyImportWarning[] = [];

  const extension = filename.toLowerCase().split('.').pop() ?? '';
  if (extension !== 'csv' && extension !== 'xlsx') {
    return {
      bundle: null,
      errors: [
        {
          row: 0,
          field: 'file',
          message: 'Unsupported file type. Use .csv or .xlsx',
        },
      ],
      warnings,
    };
  }

  let rawRows: Record<string, unknown>[];
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        bundle: null,
        errors: [{ row: 0, field: 'file', message: 'Workbook has no sheets' }],
        warnings,
      };
    }

    rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      workbook.Sheets[sheetName],
      { defval: '' },
    );
  } catch {
    return {
      bundle: null,
      errors: [{ row: 0, field: 'file', message: 'Failed to parse import file' }],
      warnings,
    };
  }

  if (rawRows.length === 0) {
    return {
      bundle: null,
      errors: [{ row: 0, field: 'file', message: 'Import file is empty' }],
      warnings,
    };
  }

  if (rawRows.length > MAX_IMPORT_ROWS) {
    return {
      bundle: null,
      errors: [
        {
          row: 0,
          field: 'file',
          message: `Import exceeds ${MAX_IMPORT_ROWS} row limit`,
        },
      ],
      warnings,
    };
  }

  const flatRows: CompanyImportFlatRow[] = [];
  for (let index = 0; index < rawRows.length; index += 1) {
    const rowNumber = index + 2;
    const normalized = normalizeRow(rawRows[index] ?? {}, rowNumber, errors);
    if (normalized) {
      flatRows.push(normalized);
    }
  }

  if (errors.length > 0) {
    return { bundle: null, errors, warnings };
  }

  return groupImportRows(flatRows, errors, warnings);
}

function normalizeRow(
  raw: Record<string, unknown>,
  rowNumber: number,
  errors: CompanyImportFieldError[],
): CompanyImportFlatRow | null {
  const normalized: Partial<CompanyImportFlatRow> = { rowNumber };

  for (const [rawKey, rawValue] of Object.entries(raw)) {
    const column = normalizeColumnName(rawKey);
    if (!COMPANY_IMPORT_COLUMNS.includes(column as (typeof COMPANY_IMPORT_COLUMNS)[number])) {
      continue;
    }

    normalized[column as (typeof COMPANY_IMPORT_COLUMNS)[number]] = String(rawValue ?? '').trim();
  }

  for (const column of REQUIRED_COLUMNS) {
    const value = normalized[column];
    if (!value || value.length === 0) {
      errors.push({
        row: rowNumber,
        field: column,
        message: `Missing required column: ${column}`,
      });
    }
  }

  if (errors.some((error) => error.row === rowNumber)) {
    return null;
  }

  return normalized as CompanyImportFlatRow;
}

export function normalizeColumnName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function groupImportRows(
  rows: CompanyImportFlatRow[],
  errors: CompanyImportFieldError[],
  warnings: CompanyImportWarning[],
): CompanyImportParseResult {
  const topicMap = new Map<string, CompanyImportTopicMeta>();
  const questionMap = new Map<string, CompanyImportQuestionBundle>();

  for (const row of rows) {
    validateRowFields(row, errors);

    const topicCode = row.topic_code;
    if (!topicMap.has(topicCode)) {
      const interviewWeight = parseInterviewWeight(row, errors);
      topicMap.set(topicCode, {
        code: topicCode,
        name: row.topic_name,
        skillCode: row.skill_code,
        interviewWeight: interviewWeight ?? 5,
      });
    } else {
      const existingTopic = topicMap.get(topicCode)!;
      if (existingTopic.name !== row.topic_name) {
        errors.push({
          row: row.rowNumber,
          field: 'topic_name',
          message: `Inconsistent topic_name for topic_code ${topicCode}`,
        });
      }
      if (existingTopic.skillCode !== row.skill_code) {
        errors.push({
          row: row.rowNumber,
          field: 'skill_code',
          message: `Inconsistent skill_code for topic_code ${topicCode}`,
        });
      }
    }

    const questionKey = `${topicCode}::${row.question_text}`;
    let question = questionMap.get(questionKey);
    if (!question) {
      const meta = parseQuestionMeta(row, errors);
      if (!meta) {
        continue;
      }

      question = {
        importKey: questionKey,
        topicCode,
        professionCode: meta.professionCode,
        topic: {
          code: topicCode,
          name: row.topic_name,
          skillCode: row.skill_code,
          interviewWeight: topicMap.get(topicCode)!.interviewWeight,
        },
        question: {
          professionCode: meta.professionCode,
          level: meta.level,
          difficulty: meta.difficulty,
          questionText: meta.questionText,
          shortAnswer: meta.shortAnswer,
          idealAnswer: meta.idealAnswer,
          maxScore: 10,
          skills: [row.skill_code],
        },
        checkpoints: [],
        examples: [],
      };
      questionMap.set(questionKey, question);
    } else {
      validateQuestionConsistency(question, row, errors);
    }

    if (errors.some((error) => error.row === row.rowNumber)) {
      continue;
    }

    appendCheckpoint(question!, row, errors);
    appendExamples(question!, row, warnings);
  }

  for (const question of questionMap.values()) {
    validateQuestionCheckpoints(question, errors);
  }

  if (errors.length > 0) {
    return { bundle: null, errors, warnings };
  }

  const bundle: CompanyImportBundle = {
    topics: [...topicMap.values()],
    questions: [...questionMap.values()],
  };

  return { bundle, errors, warnings };
}

function validateRowFields(row: CompanyImportFlatRow, errors: CompanyImportFieldError[]): void {
  if (!TAXONOMY_CODE_PATTERN.test(row.topic_code)) {
    errors.push({
      row: row.rowNumber,
      field: 'topic_code',
      message: 'topic_code must be snake_case (a-z, 0-9, underscore)',
    });
  }

  if (!TAXONOMY_CODE_PATTERN.test(row.checkpoint_key)) {
    errors.push({
      row: row.rowNumber,
      field: 'checkpoint_key',
      message: 'checkpoint_key must be snake_case (a-z, 0-9, underscore)',
    });
  }

  if (!TAXONOMY_CODE_PATTERN.test(row.skill_code)) {
    errors.push({
      row: row.rowNumber,
      field: 'skill_code',
      message: 'skill_code must be snake_case (a-z, 0-9, underscore)',
    });
  }

  if (!QUESTION_LEVELS.includes(row.level as (typeof QUESTION_LEVELS)[number])) {
    errors.push({
      row: row.rowNumber,
      field: 'level',
      message: `level must be one of: ${QUESTION_LEVELS.join(', ')}`,
    });
  }

  if (
    !QUESTION_DIFFICULTIES.includes(
      row.difficulty as (typeof QUESTION_DIFFICULTIES)[number],
    )
  ) {
    errors.push({
      row: row.rowNumber,
      field: 'difficulty',
      message: `difficulty must be one of: ${QUESTION_DIFFICULTIES.join(', ')}`,
    });
  }

  if (row.question_text.length < 30) {
    errors.push({
      row: row.rowNumber,
      field: 'question_text',
      message: 'question_text must be at least 30 characters',
    });
  }
}

function parseInterviewWeight(
  row: CompanyImportFlatRow,
  errors: CompanyImportFieldError[],
): number | null {
  if (!row.interview_weight) {
    return 5;
  }

  const weight = Number(row.interview_weight);
  if (!Number.isFinite(weight) || weight < 1 || weight > 10) {
    errors.push({
      row: row.rowNumber,
      field: 'interview_weight',
      message: 'interview_weight must be between 1 and 10',
    });
    return null;
  }

  return weight;
}

function parseQuestionMeta(
  row: CompanyImportFlatRow,
  errors: CompanyImportFieldError[],
): ParsedImportQuestionMeta | null {
  if (!row.short_answer || !row.ideal_answer) {
    return null;
  }

  return {
    professionCode: row.profession_code,
    level: row.level as ParsedImportQuestionMeta['level'],
    difficulty: row.difficulty as ParsedImportQuestionMeta['difficulty'],
    questionText: row.question_text,
    shortAnswer: row.short_answer,
    idealAnswer: row.ideal_answer,
  };
}

function validateQuestionConsistency(
  question: CompanyImportQuestionBundle,
  row: CompanyImportFlatRow,
  errors: CompanyImportFieldError[],
): void {
  const checks: Array<[string, string, string]> = [
    ['profession_code', question.professionCode, row.profession_code],
    ['level', question.question.level, row.level],
    ['difficulty', question.question.difficulty, row.difficulty],
    ['short_answer', question.question.shortAnswer, row.short_answer],
    ['ideal_answer', question.question.idealAnswer, row.ideal_answer],
  ];

  for (const [field, expected, actual] of checks) {
    if (expected !== actual) {
      errors.push({
        row: row.rowNumber,
        field,
        message: `Inconsistent ${field} for the same question in topic ${question.topicCode}`,
      });
    }
  }
}

function appendCheckpoint(
  question: CompanyImportQuestionBundle,
  row: CompanyImportFlatRow,
  errors: CompanyImportFieldError[],
): void {
  if (question.checkpoints.some((checkpoint) => checkpoint.key === row.checkpoint_key)) {
    errors.push({
      row: row.rowNumber,
      field: 'checkpoint_key',
      message: `Duplicate checkpoint_key ${row.checkpoint_key} within question`,
    });
    return;
  }

  const score = Number(row.checkpoint_weight);
  if (!Number.isFinite(score) || score <= 0) {
    errors.push({
      row: row.rowNumber,
      field: 'checkpoint_weight',
      message: 'checkpoint_weight must be a positive number',
    });
    return;
  }

  const mustConcepts = splitPipeList(row.must_concepts);
  const falseClaims = splitPipeList(row.false_claims);

  const checkpoint: BankCheckpoint = {
    key: row.checkpoint_key,
    title: row.checkpoint_title,
    expected: row.checkpoint_expected,
    score,
    sortOrder: question.checkpoints.length,
    evaluationHints:
      mustConcepts.length > 0 || falseClaims.length > 0
        ? {
            mustConcepts,
            falseClaims,
          }
        : null,
  };

  question.checkpoints.push(checkpoint);
}

function appendExamples(
  question: CompanyImportQuestionBundle,
  row: CompanyImportFlatRow,
  warnings: CompanyImportWarning[],
): void {
  if (row.example_good) {
    pushExample(question, row.example_good, 'good', warnings, row.rowNumber);
  }

  if (row.example_bad) {
    pushExample(question, row.example_bad, 'bad', warnings, row.rowNumber);
  }
}

function pushExample(
  question: CompanyImportQuestionBundle,
  text: string,
  exampleType: 'good' | 'bad',
  warnings: CompanyImportWarning[],
  rowNumber: number,
): void {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  const duplicate = question.examples.some(
    (example) => example.exampleType === exampleType && example.exampleText === trimmed,
  );
  if (duplicate) {
    warnings.push({
      row: rowNumber,
      message: `Duplicate ${exampleType} example skipped`,
    });
    return;
  }

  const example: BankAnswerExample = {
    exampleType,
    exampleText: trimmed,
    sortOrder: question.examples.length,
    checkpointKey: null,
  };
  question.examples.push(example);
}

function validateQuestionCheckpoints(
  question: CompanyImportQuestionBundle,
  errors: CompanyImportFieldError[],
): void {
  if (question.checkpoints.length === 0) {
    errors.push({
      row: 0,
      field: 'checkpoint_key',
      message: `Question "${question.question.questionText}" has no checkpoints`,
    });
    return;
  }

  const sum = question.checkpoints.reduce((total, checkpoint) => total + checkpoint.score, 0);
  if (Math.abs(sum - 10) > WEIGHT_TOLERANCE) {
    errors.push({
      row: 0,
      field: 'checkpoint_weight',
      message: `Checkpoint weights for "${question.question.questionText}" must sum to 10, got ${sum}`,
    });
  }
}

function splitPipeList(value: string): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split('|')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
