import type {
  CandidateTurnKind,
  TopicOpenerReadiness,
} from '../types/candidate-turn-classifier.types';
import type { EvaluationMode } from '../types/evaluation-mode.type';
import { allowsFullCheckpointScoring } from './resolve-evaluation-mode.util';

export function shouldScoreTopicOpenerAnswer(input: {
  evaluationMode: EvaluationMode;
  candidateTurnKind: CandidateTurnKind | null;
  gateShouldScore: boolean | null;
  openerReadinessFallback?: TopicOpenerReadiness | null;
}): boolean {
  if (!allowsFullCheckpointScoring(input.evaluationMode)) {
    return false;
  }

  if (input.candidateTurnKind !== 'substantive_answer') {
    return false;
  }

  if (input.gateShouldScore === true) {
    return true;
  }

  if (input.gateShouldScore === false) {
    return false;
  }

  return input.openerReadinessFallback === 'ready';
}
