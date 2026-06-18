import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createPool } from 'mysql2/promise';
import type { BankTopicFile, BankTopicManifest } from './bank-topic.types';
import {
  applyBankTopic,
  listAllBankFiles,
  readBankFile,
} from './bank-topic-seed.util';

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

function parseArgs(argv: string[]): {
  mode: 'file' | 'all' | 'all-files' | 'topic-code';
  target?: string;
} {
  if (argv.includes('--all-files')) {
    return { mode: 'all-files' };
  }

  if (argv.includes('--all')) {
    return { mode: 'all' };
  }

  const fileFlagIndex = argv.indexOf('--file');
  if (fileFlagIndex >= 0 && argv[fileFlagIndex + 1]) {
    return { mode: 'file', target: argv[fileFlagIndex + 1] };
  }

  const positional = argv.filter((arg) => !arg.startsWith('--'));
  if (positional.length > 0) {
    return { mode: 'topic-code', target: positional[0] };
  }

  throw new Error(
    'Usage: pnpm seed:topic -- <topic_code> | pnpm seed:topic -- --file topics/foo.bank.json | pnpm seed:topic -- --all | pnpm seed:topic -- --all-files',
  );
}

function resolveBankPathFromTopicCode(topicCode: string): string {
  for (const bankPath of listAllBankFiles()) {
    const bank = JSON.parse(
      readFileSync(join(process.cwd(), 'seeds', bankPath), 'utf8'),
    ) as BankTopicFile;

    if (bank.topic.code === topicCode) {
      return bankPath;
    }
  }

  const manifestPath = join(process.cwd(), 'seeds', 'itlead-topics.manifest.json');
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(
      readFileSync(manifestPath, 'utf8'),
    ) as BankTopicManifest;

    for (const entry of manifest.topics) {
      const bankPath = join(process.cwd(), 'seeds', entry.bankFile);
      if (!existsSync(bankPath)) {
        continue;
      }

      const bank = JSON.parse(readFileSync(bankPath, 'utf8')) as BankTopicFile;
      if (bank.topic.code === topicCode) {
        return entry.bankFile;
      }
    }
  }

  throw new Error(`Topic code not found in bank files: ${topicCode}`);
}

async function applyFromManifest(pool: ReturnType<typeof createPoolFromEnv>): Promise<void> {
  const manifestPath = join(process.cwd(), 'seeds', 'itlead-topics.manifest.json');
  const manifest = JSON.parse(
    readFileSync(manifestPath, 'utf8'),
  ) as BankTopicManifest;

  const ready = manifest.topics.filter((topic) => topic.status === 'ready');
  if (ready.length === 0) {
    console.log('No manifest entries with status=ready');
    return;
  }

  for (const entry of ready) {
    const bank = readBankFile(entry.bankFile);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      await applyBankTopic(connection, bank);
      await connection.commit();
      console.log(`Applied ${bank.topic.code} from ${entry.bankFile}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

async function applyAllFilesFromDisk(
  pool: ReturnType<typeof createPoolFromEnv>,
): Promise<void> {
  for (const bankPath of listAllBankFiles()) {
    const bank = readBankFile(bankPath);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      await applyBankTopic(connection, bank);
      await connection.commit();
      console.log(`Applied ${bank.topic.code} from ${bankPath}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

async function main(): Promise<void> {
  loadEnvFromDotEnvFile();
  const pool = createPoolFromEnv();
  const args = parseArgs(process.argv.slice(2));

  try {
    if (args.mode === 'all-files') {
      await applyAllFilesFromDisk(pool);
      return;
    }

    if (args.mode === 'all') {
      await applyFromManifest(pool);
      return;
    }

    const bankPath =
      args.mode === 'file'
        ? args.target!
        : resolveBankPathFromTopicCode(args.target!);

    const bank = readBankFile(bankPath);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      await applyBankTopic(connection, bank);
      await connection.commit();
      console.log(`Applied ${bank.topic.code} from ${bankPath}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  const reason =
    error instanceof Error ? (error.stack ?? error.message) : String(error);

  console.error(`Bank topic seed failed: ${reason}`);
  process.exit(1);
});
