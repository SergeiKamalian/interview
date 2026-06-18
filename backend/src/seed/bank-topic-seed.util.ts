import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Pool, PoolConnection } from 'mysql2/promise';
import type { BankTopicFile } from './bank-topic.types';

export function readBankFile(relativePath: string): BankTopicFile {
  const absolutePath = join(process.cwd(), 'seeds', relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Bank file not found: ${absolutePath}`);
  }

  const parsed = JSON.parse(readFileSync(absolutePath, 'utf8')) as BankTopicFile;
  validateBankFile(parsed, relativePath);
  return parsed;
}

function validateBankFile(bank: BankTopicFile, label: string): void {
  const weightSum = bank.checkpoints.reduce((sum, cp) => sum + cp.score, 0);
  const rounded = Math.round(weightSum * 100) / 100;

  if (rounded !== bank.question.maxScore) {
    throw new Error(
      `${label}: checkpoint score sum ${rounded} != question.maxScore ${bank.question.maxScore}`,
    );
  }

  if (bank.checkpoints.length === 0) {
    throw new Error(`${label}: checkpoints array is empty`);
  }
}

export function listAllBankFiles(): string[] {
  const topicsDir = join(process.cwd(), 'seeds', 'topics');
  return readdirSync(topicsDir)
    .filter((file) => file.endsWith('.bank.json'))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => `topics/${file}`);
}

async function deleteTopicData(
  connection: PoolConnection,
  topicCode: string,
): Promise<void> {
  await connection.query(
    `DELETE iae FROM interview_answer_examples iae
     JOIN interview_questions iq ON iq.id = iae.interview_question_id
     JOIN questions q ON q.id = iq.source_question_id
     JOIN topics t ON t.id = q.topic_id AND t.code = ?`,
    [topicCode],
  );

  await connection.query(
    `DELETE iqc FROM interview_question_checkpoints iqc
     JOIN interview_questions iq ON iq.id = iqc.interview_question_id
     JOIN questions q ON q.id = iq.source_question_id
     JOIN topics t ON t.id = q.topic_id AND t.code = ?`,
    [topicCode],
  );

  await connection.query(
    `DELETE iq FROM interview_questions iq
     JOIN questions q ON q.id = iq.source_question_id
     JOIN topics t ON t.id = q.topic_id AND t.code = ?`,
    [topicCode],
  );

  await connection.query(
    `DELETE ae FROM answer_examples ae
     JOIN questions q ON q.id = ae.question_id
     JOIN topics t ON t.id = q.topic_id AND t.code = ?`,
    [topicCode],
  );

  await connection.query(
    `DELETE qc FROM question_checkpoints qc
     JOIN questions q ON q.id = qc.question_id
     JOIN topics t ON t.id = q.topic_id AND t.code = ?`,
    [topicCode],
  );

  await connection.query(
    `DELETE qs FROM question_skills qs
     JOIN questions q ON q.id = qs.question_id
     JOIN topics t ON t.id = q.topic_id AND t.code = ?`,
    [topicCode],
  );

  await connection.query(
    `DELETE q FROM questions q
     JOIN topics t ON t.id = q.topic_id AND t.code = ?`,
    [topicCode],
  );
}

export async function applyBankTopic(
  connection: PoolConnection,
  bank: BankTopicFile,
): Promise<void> {
  await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');

  const topicCode = bank.topic.code;

  await deleteTopicData(connection, topicCode);

  const [topicInsertResult] = await connection.query(
    `INSERT INTO topics (skill_id, code, name, interview_weight)
     SELECT s.id, ?, ?, ?
     FROM skills s WHERE s.code = ?
     ON DUPLICATE KEY UPDATE
       skill_id = VALUES(skill_id),
       name = VALUES(name),
       interview_weight = VALUES(interview_weight)`,
    [
      bank.topic.code,
      bank.topic.name,
      bank.topic.interviewWeight,
      bank.topic.skillCode,
    ],
  );

  const topicAffected =
    typeof topicInsertResult === 'object' &&
    topicInsertResult !== null &&
    'affectedRows' in topicInsertResult
      ? Number(topicInsertResult.affectedRows)
      : 0;

  if (topicAffected === 0) {
    throw new Error(
      `Skill not found for topic ${topicCode}: ${bank.topic.skillCode}`,
    );
  }

  await connection.query(
    `INSERT INTO questions (
       company_id, profession_id, topic_id, level, difficulty,
       question_text, short_answer, ideal_answer, max_score
     )
     SELECT NULL, p.id, t.id, ?, ?, ?, ?, ?, ?
     FROM professions p
     JOIN topics t ON t.code = ?
     WHERE p.code = ?`,
    [
      bank.question.level,
      bank.question.difficulty,
      bank.question.questionText,
      bank.question.shortAnswer,
      bank.question.idealAnswer,
      bank.question.maxScore,
      topicCode,
      bank.question.professionCode,
    ],
  );

  const [questionRows] = await connection.query(
    `SELECT q.id
     FROM questions q
     JOIN topics t ON t.id = q.topic_id
     WHERE t.code = ?
     LIMIT 1`,
    [topicCode],
  );

  const rows = questionRows as Array<{ id: number }>;
  const questionId = rows[0]?.id;
  if (!questionId) {
    throw new Error(`Question not found after insert for topic ${topicCode}`);
  }

  for (const skillCode of bank.question.skills) {
    await connection.query(
      `INSERT INTO question_skills (question_id, skill_id)
       SELECT ?, s.id FROM skills s WHERE s.code = ?`,
      [questionId, skillCode],
    );
  }

  for (const checkpoint of bank.checkpoints) {
    const hintsJson =
      checkpoint.evaluationHints !== undefined &&
      checkpoint.evaluationHints !== null
        ? JSON.stringify(checkpoint.evaluationHints)
        : null;

    await connection.query(
      `INSERT INTO question_checkpoints (
         question_id, checkpoint_key, title, expected, evaluation_hints, score, sort_order
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        questionId,
        checkpoint.key,
        checkpoint.title,
        checkpoint.expected,
        hintsJson,
        checkpoint.score,
        checkpoint.sortOrder,
      ],
    );
  }

  for (const example of bank.examples) {
    await connection.query(
      `INSERT INTO answer_examples (
         question_id, checkpoint_key, example_type, example_text, sort_order
       ) VALUES (?, ?, ?, ?, ?)`,
      [
        questionId,
        example.checkpointKey ?? null,
        example.exampleType,
        example.exampleText,
        example.sortOrder,
      ],
    );
  }

  await connection.query(
    `UPDATE interview_question_checkpoints iqc
     JOIN interview_questions iq ON iq.id = iqc.interview_question_id
     JOIN question_checkpoints qc
       ON qc.question_id = iq.source_question_id
      AND qc.checkpoint_key = iqc.checkpoint_key
     SET iqc.evaluation_hints = qc.evaluation_hints
     WHERE iq.source_question_id = ?
       AND qc.evaluation_hints IS NOT NULL`,
    [questionId],
  );

  await connection.query(
    `DELETE iae FROM interview_answer_examples iae
     JOIN interview_questions iq ON iq.id = iae.interview_question_id
     WHERE iq.source_question_id = ?
       AND iae.checkpoint_key IS NOT NULL`,
    [questionId],
  );

  await connection.query(
    `INSERT INTO interview_answer_examples (
       interview_question_id, checkpoint_key, example_type, example_text, sort_order
     )
     SELECT iq.id, ae.checkpoint_key, ae.example_type, ae.example_text, ae.sort_order
     FROM interview_questions iq
     JOIN answer_examples ae ON ae.question_id = iq.source_question_id
     WHERE iq.source_question_id = ?
       AND ae.checkpoint_key IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM interview_answer_examples iae
         WHERE iae.interview_question_id = iq.id
           AND iae.checkpoint_key <=> ae.checkpoint_key
           AND iae.example_type = ae.example_type
           AND iae.sort_order = ae.sort_order
       )`,
    [questionId],
  );
}

export async function applySkillsSeed(pool: Pool): Promise<void> {
  const seedPath = join(process.cwd(), 'seeds', 'skills.seed.sql');
  const sql = readFileSync(seedPath, 'utf8');
  await pool.query(sql);
}

export async function applyAllBankFiles(pool: Pool): Promise<number> {
  const bankFiles = listAllBankFiles();
  let applied = 0;

  for (const bankPath of bankFiles) {
    const bank = readBankFile(bankPath);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      await applyBankTopic(connection, bank);
      await connection.commit();
      applied += 1;
      console.log(`Applied ${bank.topic.code} from ${bankPath}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  return applied;
}
