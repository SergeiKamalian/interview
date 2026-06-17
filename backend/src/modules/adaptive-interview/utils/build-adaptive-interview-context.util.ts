import type {
  AdaptiveInterviewContextPacket,
  BuildAdaptiveInterviewContextInput,
} from '../types/adaptive-interview-context.types';

export function boundText(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function buildAdaptiveInterviewContextPacket(
  input: BuildAdaptiveInterviewContextInput,
): AdaptiveInterviewContextPacket {
  const questionMessages = input.questionMessages
    .filter((message) => message.interviewQuestionId === input.interviewQuestionId)
    .sort((left, right) => left.sequenceOrder - right.sequenceOrder);

  const candidateMessages = questionMessages.filter(
    (message) => message.role === 'candidate',
  );
  const latestCandidateMessage =
    candidateMessages[candidateMessages.length - 1] ?? null;

  const referenceAnswer = pickReferenceAnswer(
    input.shortAnswer,
    input.idealAnswer,
    input.limits.maxReferenceAnswerLength,
  );

  const checkpointStates = input.checkpointStates
    .map((state) => ({
      checkpointKey: state.checkpointKey,
      status: state.status,
      scoreAwarded: state.scoreAwarded,
      maxScore: state.maxScore,
      followUpCount: state.followUpCount,
    }))
    .sort((left, right) => left.checkpointKey.localeCompare(right.checkpointKey));

  const evidenceSnippets = input.checkpointStates
    .filter((state) => state.evidenceSummary?.trim())
    .map((state) => ({
      checkpointKey: state.checkpointKey,
      summary: boundText(state.evidenceSummary!, input.limits.maxTextLength),
    }))
    .sort((left, right) => left.checkpointKey.localeCompare(right.checkpointKey));

  const localTurns = buildLocalTurns(
    questionMessages,
    input.limits.localTurnLimit,
    input.limits.maxTextLength,
  );

  const usedForQuestion = checkpointStates.reduce(
    (total, state) => total + state.followUpCount,
    0,
  );

  return {
    interviewQuestionId: input.interviewQuestionId,
    interviewId: input.interviewId,
    attemptId: input.attemptId,
    companyId: input.companyId,
    questionText: boundText(input.questionText, input.limits.maxTextLength),
    referenceAnswer,
    maxScore: input.maxScore,
    checkpoints: input.checkpoints.map((checkpoint) => ({
      ...checkpoint,
      title: boundText(checkpoint.title, input.limits.maxTextLength),
      expected: boundText(checkpoint.expected, input.limits.maxTextLength),
    })),
    badAnswerExamples: (input.badAnswerExamples ?? [])
      .slice(0, 3)
      .map((example) => boundText(example, input.limits.maxTextLength)),
    latestCandidateAnswer: latestCandidateMessage
      ? boundText(latestCandidateMessage.content, input.limits.maxTextLength)
      : '',
    latestCandidateMessageId: latestCandidateMessage?.id ?? null,
    latestAnswerMessageKind:
      latestCandidateMessage?.messageKind === 'follow_up_answer'
        ? 'follow_up_answer'
        : latestCandidateMessage?.messageKind === 'main_answer'
          ? 'main_answer'
          : null,
    targetCheckpointKey: latestCandidateMessage?.targetCheckpointKey ?? null,
    checkpointStates,
    evidenceSnippets,
    localTurns,
    followUpLimits: {
      maxPerQuestion: input.limits.maxFollowUpsPerQuestion,
      maxPerCheckpoint: input.limits.maxFollowUpsPerCheckpoint,
      usedForQuestion,
    },
  };
}

function pickReferenceAnswer(
  shortAnswer: string,
  idealAnswer: string,
  maxLength: number,
): string {
  const short = shortAnswer.trim();
  if (short.length > 0) {
    return boundText(short, maxLength);
  }

  return boundText(idealAnswer, maxLength);
}

function buildLocalTurns(
  questionMessages: BuildAdaptiveInterviewContextInput['questionMessages'],
  localTurnLimit: number,
  maxTextLength: number,
): AdaptiveInterviewContextPacket['localTurns'] {
  const maxMessages = localTurnLimit * 2;

  return questionMessages.slice(-maxMessages).map((message) => ({
    sequenceOrder: message.sequenceOrder,
    role: message.role,
    content: boundText(message.content, maxTextLength),
    messageKind:
      message.messageKind === 'follow_up_answer'
        ? 'follow_up_answer'
        : message.messageKind === 'main_answer'
          ? 'main_answer'
          : null,
    targetCheckpointKey: message.targetCheckpointKey ?? null,
  }));
}
