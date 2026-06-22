import { readFileSync } from 'fs';
import { join } from 'path';
import {
  normalizeColumnName,
  parseCompanyImportFile,
} from './parse-company-import-file';

const fixturesDir = join(__dirname, '..', 'fixtures');

describe('parseCompanyImportFile', () => {
  it('parses valid sample CSV into grouped topics and questions', () => {
    const buffer = readFileSync(join(fixturesDir, 'sample-company-import.csv'));
    const result = parseCompanyImportFile(buffer, 'sample-company-import.csv');

    expect(result.errors).toEqual([]);
    expect(result.bundle).not.toBeNull();
    expect(result.bundle!.topics).toHaveLength(2);
    expect(result.bundle!.questions).toHaveLength(2);
    expect(result.bundle!.questions[0]?.checkpoints).toHaveLength(2);
    expect(result.bundle!.questions[1]?.checkpoints).toHaveLength(2);

    const memoQuestion = result.bundle!.questions.find((question) =>
      question.topicCode === 'acme_react_hooks',
    );
    expect(memoQuestion?.checkpoints.reduce((sum, cp) => sum + cp.score, 0)).toBe(10);
  });

  it('returns weight sum error when checkpoints do not total 10', () => {
    const csv = [
      'topic_code,topic_name,skill_code,interview_weight,profession_code,level,difficulty,question_text,short_answer,ideal_answer,checkpoint_key,checkpoint_title,checkpoint_expected,checkpoint_weight',
      'bad_weights,Bad Weights,react,5,frontend_developer,junior,basic,Какой минимальный набор знаний нужен junior React разработчику?,JSX props state hooks basics.,Junior знает JSX props state hooks component lifecycle basics.,only_one,Single checkpoint,Explains one concept only.,7',
    ].join('\n');

    const result = parseCompanyImportFile(Buffer.from(csv), 'bad-weights.csv');

    expect(result.bundle).toBeNull();
    expect(result.errors.some((error) => error.field === 'checkpoint_weight')).toBe(
      true,
    );
  });

  it('returns duplicate checkpoint key error within question', () => {
    const csv = [
      'topic_code,topic_name,skill_code,interview_weight,profession_code,level,difficulty,question_text,short_answer,ideal_answer,checkpoint_key,checkpoint_title,checkpoint_expected,checkpoint_weight',
      'dup_key,Dup Key,react,5,frontend_developer,junior,basic,Какой минимальный набор знаний нужен junior React разработчику?,JSX props state hooks basics.,Junior знает JSX props state hooks component lifecycle basics.,same_key,First,First checkpoint,5',
      'dup_key,Dup Key,react,5,frontend_developer,junior,basic,Какой минимальный набор знаний нужен junior React разработчику?,JSX props state hooks basics.,Junior знает JSX props state hooks component lifecycle basics.,same_key,Second,Duplicate checkpoint,5',
    ].join('\n');

    const result = parseCompanyImportFile(Buffer.from(csv), 'dup-key.csv');

    expect(result.bundle).toBeNull();
    expect(
      result.errors.some((error) => error.field === 'checkpoint_key'),
    ).toBe(true);
  });

  it('rejects invalid snake_case topic_code', () => {
    const csv = [
      'topic_code,topic_name,skill_code,interview_weight,profession_code,level,difficulty,question_text,short_answer,ideal_answer,checkpoint_key,checkpoint_title,checkpoint_expected,checkpoint_weight',
      'Invalid-Code,Invalid,react,5,frontend_developer,junior,basic,Какой минимальный набор знаний нужен junior React разработчику?,JSX props state hooks basics.,Junior знает JSX props state hooks component lifecycle basics.,valid_key,Valid,Valid checkpoint,10',
    ].join('\n');

    const result = parseCompanyImportFile(Buffer.from(csv), 'invalid-code.csv');

    expect(result.bundle).toBeNull();
    expect(result.errors.some((error) => error.field === 'topic_code')).toBe(true);
  });
});

describe('normalizeColumnName', () => {
  it('normalizes header labels to snake_case', () => {
    expect(normalizeColumnName('Topic Code')).toBe('topic_code');
    expect(normalizeColumnName(' checkpoint_weight ')).toBe('checkpoint_weight');
  });
});
