import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BankTopicFile, BankTopicManifest } from './bank-topic.types';
import type { ItleadBankMeta } from './itlead-api.types';
import {
  buildItleadApiUrl,
  buildItleadPageUrl,
  extractSlugFromItleadUrl,
  fetchItleadQuestion,
  mapItleadDifficulty,
} from './itlead-api.util';

function parseArgs(argv: string[]): { target: string; bankFile?: string } {
  const fileFlagIndex = argv.indexOf('--file');
  if (fileFlagIndex >= 0 && argv[fileFlagIndex + 1]) {
    const bankFile = argv[fileFlagIndex + 1];
    const positional = argv.filter(
      (arg, index) =>
        !arg.startsWith('--') &&
        index !== fileFlagIndex + 1 &&
        argv[index - 1] !== '--file',
    );
    if (positional.length === 0) {
      throw new Error('Usage: pnpm seed:sync-itlead -- <url|slug> --file topics/foo.bank.json');
    }
    return { target: positional[0], bankFile };
  }

  const positional = argv.filter((arg) => !arg.startsWith('--'));
  if (positional.length === 0) {
    throw new Error(
      'Usage: pnpm seed:sync-itlead -- <url|slug> [--file topics/foo.bank.json]',
    );
  }

  return { target: positional[0] };
}

function resolveBankFileFromManifest(slug: string): string {
  const manifestPath = join(process.cwd(), 'seeds', 'itlead-topics.manifest.json');
  const manifest = JSON.parse(
    readFileSync(manifestPath, 'utf8'),
  ) as BankTopicManifest;

  for (const entry of manifest.topics) {
    if (entry.status === 'legacy-sql') {
      continue;
    }

    try {
      const entrySlug = extractSlugFromItleadUrl(entry.source);
      if (entrySlug === slug) {
        return entry.bankFile;
      }
    } catch {
      continue;
    }
  }

  throw new Error(`No manifest entry found for slug: ${slug}`);
}

function readBankFile(relativePath: string): BankTopicFile {
  const absolutePath = join(process.cwd(), 'seeds', relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Bank file not found: ${absolutePath}`);
  }

  return JSON.parse(readFileSync(absolutePath, 'utf8')) as BankTopicFile;
}

function writeBankFile(relativePath: string, bank: BankTopicFile): void {
  const absolutePath = join(process.cwd(), 'seeds', relativePath);
  writeFileSync(absolutePath, `${JSON.stringify(bank, null, 2)}\n`, 'utf8');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const apiData = await fetchItleadQuestion(args.target);
  const mapping = mapItleadDifficulty(apiData.difficulty);

  const bankPath =
    args.bankFile ?? resolveBankFileFromManifest(apiData.slug);
  const bank = readBankFile(bankPath);

  bank.topic.interviewWeight = mapping.interviewWeight;
  bank.question.level = mapping.level;
  bank.question.difficulty = mapping.difficulty;

  const categorySlug = apiData.category?.slug ?? 'react';
  const itleadMeta: ItleadBankMeta = {
    slug: apiData.slug,
    apiUrl: buildItleadApiUrl(apiData.slug),
    pageUrl: buildItleadPageUrl(apiData.slug, categorySlug),
    difficulty: apiData.difficulty,
    titleEn: apiData.titleEn,
    categorySlug,
    syncedAt: new Date().toISOString(),
  };

  const bankWithMeta = bank as BankTopicFile & { itlead?: ItleadBankMeta };
  bankWithMeta.itlead = itleadMeta;

  writeBankFile(bankPath, bankWithMeta);

  console.log(
    `Synced ${apiData.slug}: ITLead ${apiData.difficulty} → level=${mapping.level}, difficulty=${mapping.difficulty}, interview_weight=${mapping.interviewWeight}`,
  );
  console.log(`Updated ${bankPath}`);
}

void main().catch((error: unknown) => {
  const reason =
    error instanceof Error ? (error.stack ?? error.message) : String(error);

  console.error(`ITLead meta sync failed: ${reason}`);
  process.exit(1);
});
