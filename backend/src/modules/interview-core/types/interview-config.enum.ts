import { registerEnumType } from '@nestjs/graphql';

export enum AiToneEnum {
  friendly = 'friendly',
  neutral = 'neutral',
  strict = 'strict',
}

export enum ProbingDepthEnum {
  shallow = 'shallow',
  balanced = 'balanced',
  deep = 'deep',
}

export enum ScoringStrictnessEnum {
  lenient = 'lenient',
  balanced = 'balanced',
  strict = 'strict',
}

registerEnumType(AiToneEnum, { name: 'AiTone' });
registerEnumType(ProbingDepthEnum, { name: 'ProbingDepth' });
registerEnumType(ScoringStrictnessEnum, { name: 'ScoringStrictness' });

export type AiTone = `${AiToneEnum}`;
export type ProbingDepth = `${ProbingDepthEnum}`;
export type ScoringStrictness = `${ScoringStrictnessEnum}`;

export const DEFAULT_AI_TONE: AiTone = 'neutral';
export const DEFAULT_PROBING_DEPTH: ProbingDepth = 'balanced';
export const DEFAULT_SCORING_STRICTNESS: ScoringStrictness = 'balanced';

export const PASSING_SCORE_MIN = 0;
export const PASSING_SCORE_MAX = 10;
