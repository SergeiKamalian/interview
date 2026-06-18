export type TopicOpenerScoringGateInput = {
  topicOpenerText: string;
  candidateAnswer: string;
  questionText: string;
  referenceAnswer?: string | null;
  attemptId?: number;
  interviewQuestionId?: number;
};

export type TopicOpenerScoringGateJsonResponse = {
  should_score: boolean;
  reason: string;
};

export type TopicOpenerScoringGateDecision = {
  shouldScore: boolean;
  reason: string;
};

export type TopicOpenerScoringGateRunResult =
  | { status: 'valid'; decision: TopicOpenerScoringGateDecision; rawContent: string }
  | { status: 'invalid'; errors: string[]; rawContent: string }
  | { status: 'failed'; error: string };
