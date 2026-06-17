import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';

export function collectCheckpointEvidenceText(
  context: AdaptiveInterviewContextPacket,
  checkpointKey: string,
): string {
  const candidateTurns = context.localTurns.filter(
    (turn) => turn.role === 'candidate' && turn.content.trim().length > 0,
  );

  const targetedTurns = candidateTurns.filter(
    (turn) => turn.targetCheckpointKey === checkpointKey,
  );

  const mainAnswerTurns = candidateTurns.filter(
    (turn) => turn.messageKind === 'main_answer',
  );

  const untargetedTurns = candidateTurns.filter(
    (turn) =>
      !turn.messageKind ||
      (turn.messageKind !== 'follow_up_answer' && turn.messageKind !== 'main_answer'),
  );

  const otherCheckpointFollowUps = candidateTurns.filter(
    (turn) =>
      turn.messageKind === 'follow_up_answer' &&
      turn.targetCheckpointKey &&
      turn.targetCheckpointKey !== checkpointKey,
  );

  const hasCheckpointScopedTurns =
    targetedTurns.length > 0 ||
    mainAnswerTurns.length > 0 ||
    otherCheckpointFollowUps.length > 0;

  const segments = hasCheckpointScopedTurns
    ? [...mainAnswerTurns, ...targetedTurns, ...untargetedTurns]
    : candidateTurns;

  const uniqueByOrder = [...segments]
    .sort((left, right) => left.sequenceOrder - right.sequenceOrder)
    .map((turn) => turn.content.trim())
    .filter((content, index, list) => content.length > 0 && list.indexOf(content) === index);

  if (uniqueByOrder.length > 0) {
    return uniqueByOrder.join(' ').toLowerCase();
  }

  return collectFullCandidateText(context);
}

export function collectFullCandidateText(
  context: AdaptiveInterviewContextPacket,
): string {
  return [
    ...context.localTurns
      .filter((turn) => turn.role === 'candidate')
      .map((turn) => turn.content),
    context.latestCandidateAnswer,
  ]
    .join(' ')
    .toLowerCase();
}

export function collectLatestCandidateText(
  context: AdaptiveInterviewContextPacket,
): string {
  return (context.latestCandidateAnswer ?? '').toLowerCase();
}

export function stripNeutralMetaphors(
  text: string,
  neutralMetaphors: string[] | undefined,
): string {
  if (!neutralMetaphors?.length || !text.trim()) {
    return text;
  }

  let result = text;
  for (const metaphor of neutralMetaphors) {
    const trimmed = metaphor.trim();
    if (!trimmed) {
      continue;
    }

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'gi'), ' ');
  }

  return result.replace(/\s+/g, ' ').trim();
}
