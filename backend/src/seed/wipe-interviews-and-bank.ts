import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createPool, type Pool } from 'mysql2/promise';

function loadEnvFromDotEnvFile(): void {
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, 'utf8');

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      continue;
    }

    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function createPoolFromEnv(): Pool {
  const required = [
    'MYSQL_HOST',
    'MYSQL_PORT',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'MYSQL_DATABASE',
  ] as const;

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing env for seed: ${missing.join(', ')}`);
  }

  return createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: 'utf8mb4',
    timezone: 'Z',
    multipleStatements: true,
  });
}

export async function wipeInterviewsAndQuestionBank(
  pool: Pool,
): Promise<void> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');

    await connection.query('DELETE FROM candidate_shortlist_events');
    await connection.query('DELETE FROM candidate_shortlist');
    await connection.query('DELETE FROM interview_attempts');
    await connection.query('DELETE FROM interviews');

    await connection.query('DELETE FROM answer_examples');
    await connection.query('DELETE FROM question_checkpoints');
    await connection.query('DELETE FROM question_skills');
    await connection.query('DELETE FROM questions');
    await connection.query('DELETE FROM topics');

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function main(): Promise<void> {
  loadEnvFromDotEnvFile();
  const pool = createPoolFromEnv();

  try {
    await wipeInterviewsAndQuestionBank(pool);
    console.log(
      'Wiped interviews, attempts, candidates, and question bank (topics + questions)',
    );
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    const reason =
      error instanceof Error ? (error.stack ?? error.message) : String(error);

    console.error(`Wipe failed: ${reason}`);
    process.exit(1);
  });
}
