import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import type { CandidateTurnClassifierInput } from '../types/candidate-turn-classifier.types';

export function buildCandidateTurnClassifierInput(input: {
  context: AdaptiveInterviewContextPacket;
  attemptId?: number;
  interviewQuestionId?: number;
}): CandidateTurnClassifierInput {
  const { context } = input;
  const lastInterviewerMessage = resolveLastInterviewerMessage(context);
  const targetCheckpoint = context.checkpoints.find(
    (checkpoint) => checkpoint.checkpointKey === context.targetCheckpointKey,
  );

  const messageKind =
    context.latestAnswerMessageKind === 'follow_up_answer'
      ? 'follow_up_answer'
      : context.latestAnswerMessageKind === 'topic_opener_answer'
        ? 'topic_opener_answer'
        : 'main_answer';

  return {
    messageKind,
    mainQuestionText: context.questionText,
    lastInterviewerMessage,
    targetCheckpointTitle: targetCheckpoint?.title ?? null,
    targetCheckpointKey: context.targetCheckpointKey,
    localTurns: context.localTurns.map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
    candidateAnswer: context.latestCandidateAnswer,
    attemptId: input.attemptId,
    interviewQuestionId: input.interviewQuestionId,
  };
}

function resolveLastInterviewerMessage(
  context: AdaptiveInterviewContextPacket,
): string | null {
  for (let index = context.localTurns.length - 1; index >= 0; index -= 1) {
    const turn = context.localTurns[index];
    if (turn.role === 'ai') {
      return turn.content.trim() || null;
    }
  }

  return null;
}
