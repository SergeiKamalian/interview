#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const TOPICS = join(ROOT, 'backend/seeds/topics');

const slugs = [
  'shcho-take-clustered-i-non-clustered-indeksy',
  'shcho-take-kompozytni-indeksy',
  'shcho-take-noisy-tenants',
  'shcho-take-referential-actions-v-sql',
  'shcho-take-symetrychnyy-i-asymetrychnyy-klyuch-v-shyfruvanni',
  'shcho-take-throttling',
  'types-of-frontend-testing',
  'v8-architecture-from-code-to-machine-instructions',
  'ways-to-optimize-applications',
];

const rows = [];
for (const slug of slugs) {
  const path = join(TOPICS, `${slug}.bank.json`);
  const raw = readFileSync(path, 'utf8');
  const bank = JSON.parse(raw);
  const sum = bank.checkpoints.reduce((s, c) => s + c.score, 0);
  if (Math.abs(sum - 10) > 0.001) throw new Error(`${slug}: sum=${sum}`);
  if (!/[\u0400-\u04FF]/.test(bank.question.questionText)) throw new Error(`${slug}: no cyrillic`);
  if (/Ð|РіР/.test(raw)) throw new Error(`${slug}: mojibake`);
  rows.push({
    slug,
    topic_code: bank.topic.code,
    checkpoints: bank.checkpoints.length,
    'Σ weights': sum.toFixed(2),
    examples: bank.examples.length,
  });
}
console.table(rows);
