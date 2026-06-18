import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BankTopicManifest } from './bank-topic.types';
import type { ItleadImportStatus } from './itlead-api.types';
import {
  buildWorklistFromGrid,
  extractSlugFromItleadUrl,
  fetchItleadQuestionsGrid,
  suggestedBankFile,
  slugToTopicCode,
} from './itlead-api.util';

function loadStatusOverrides(): Map<
  string,
  { status: ItleadImportStatus; bankFile?: string; note?: string }
> {
  const overrides = new Map<
    string,
    { status: ItleadImportStatus; bankFile?: string; note?: string }
  >();

  const manifestPath = join(process.cwd(), 'seeds', 'itlead-topics.manifest.json');
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(
      readFileSync(manifestPath, 'utf8'),
    ) as BankTopicManifest;

    for (const entry of manifest.topics) {
      const slug = extractSlugFromItleadUrl(entry.source);
      overrides.set(slug, {
        status: entry.status,
        bankFile: entry.bankFile,
        note: entry.note ?? undefined,
      });
    }
  }

  const topicsDir = join(process.cwd(), 'seeds', 'topics');
  if (existsSync(topicsDir)) {
    for (const file of readdirSync(topicsDir)) {
      if (!file.endsWith('.bank.json')) {
        continue;
      }

      const bank = JSON.parse(
        readFileSync(join(topicsDir, file), 'utf8'),
      ) as { itlead?: { slug?: string }; topic?: { code?: string } };

      const slug = bank.itlead?.slug;
      if (!slug || overrides.has(slug)) {
        continue;
      }

      overrides.set(slug, {
        status: 'seeded',
        bankFile: `topics/${file}`,
      });
    }
  }

  return overrides;
}

async function main(): Promise<void> {
  const grid = await fetchItleadQuestionsGrid();
  const statusBySlug = loadStatusOverrides();
  const worklist = buildWorklistFromGrid(grid, statusBySlug);

  const seedsDir = join(process.cwd(), 'seeds');
  const gridPath = join(seedsDir, 'itlead-questions.grid.json');
  const worklistPath = join(seedsDir, 'itlead-import.worklist.json');

  writeFileSync(gridPath, `${JSON.stringify(grid, null, 2)}\n`, 'utf8');
  writeFileSync(worklistPath, `${JSON.stringify(worklist, null, 2)}\n`, 'utf8');

  console.log(`Saved grid: ${gridPath}`);
  console.log(`Saved worklist: ${worklistPath}`);
  console.log(
    `Categories: ${grid.categories.length}, questions: ${worklist.totalQuestions}`,
  );
  console.log('By status:', worklist.byStatus);
}

void main().catch((error: unknown) => {
  const reason =
    error instanceof Error ? (error.stack ?? error.message) : String(error);

  console.error(`Fetch ITLead grid failed: ${reason}`);
  process.exit(1);
});
