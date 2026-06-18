import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createPool } from 'mysql2/promise';
import {
  applyAllBankFiles,
  applySkillsSeed,
} from './bank-topic-seed.util';
import { wipeInterviewsAndQuestionBank } from './wipe-interviews-and-bank';

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

function createPoolFromEnv() {
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

async function main(): Promise<void> {
  loadEnvFromDotEnvFile();
  const pool = createPoolFromEnv();
  const skipWipe = process.argv.includes('--no-wipe');

  try {
    await applySkillsSeed(pool);

    if (!skipWipe) {
      await wipeInterviewsAndQuestionBank(pool);
      console.log('Wiped interviews and question bank');
    }

    const applied = await applyAllBankFiles(pool);
    console.log(`Rebank complete: ${applied} topics seeded`);
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  const reason =
    error instanceof Error ? (error.stack ?? error.message) : String(error);

  console.error(`Rebank failed: ${reason}`);
  process.exit(1);
});
