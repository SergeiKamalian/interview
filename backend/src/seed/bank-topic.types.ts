import type { CheckpointEvaluationHints } from '../modules/adaptive-interview/types/checkpoint-evaluation-hints.type';
import type { ItleadBankMeta } from './itlead-api.types';

export type BankTopicManifestEntry = {
  source: string;
  bankFile: string;
  status: 'draft' | 'ready' | 'seeded' | 'legacy-sql';
  note?: string;
};

export type BankTopicManifest = {
  topics: BankTopicManifestEntry[];
};

export type BankAnswerExample = {
  exampleType: 'good' | 'bad';
  exampleText: string;
  sortOrder: number;
  checkpointKey?: string | null;
};

export type BankCheckpoint = {
  key: string;
  title: string;
  expected: string;
  score: number;
  sortOrder: number;
  evaluationHints?: CheckpointEvaluationHints | null;
};

export type BankTopicFile = {
  topic: {
    code: string;
    name: string;
    skillCode: string;
    interviewWeight: number;
  };
  question: {
    professionCode: string;
    level: 'junior' | 'middle' | 'senior' | 'lead';
    difficulty: 'basic' | 'intermediate' | 'advanced';
    questionText: string;
    shortAnswer: string;
    idealAnswer: string;
    maxScore: number;
    skills: string[];
  };
  checkpoints: BankCheckpoint[];
  examples: BankAnswerExample[];
  /** Synced from https://api.itlead.org/api/questions/{slug} */
  itlead?: ItleadBankMeta;
};
