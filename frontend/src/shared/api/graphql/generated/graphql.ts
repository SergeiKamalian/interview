/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AchievedLevelMethod =
  | 'estimate'
  | 'evidence';

export type AiAssessmentVerdict =
  | 'agree'
  | 'disagree'
  | 'pending';

export type AiAssessmentVerdictInput =
  | 'agree'
  | 'disagree';

export type AiCostFilterInput = {
  dateFrom?: string | null | undefined;
  dateTo?: string | null | undefined;
  model?: string | null | undefined;
  provider?: string | null | undefined;
};

export type AiTone =
  | 'friendly'
  | 'neutral'
  | 'strict';

export type AnswerExampleInput = {
  checkpointKey?: string | null | undefined;
  exampleText: string;
  exampleType: AnswerExampleType;
  sortOrder: number;
};

export type AnswerExampleType =
  | 'bad'
  | 'good';

export type AttemptReviewDecisionHistoryFilterInput = {
  page?: number;
  pageSize?: number;
};

export type AttemptReviewStatus =
  | 'in_review'
  | 'pending'
  | 'reviewed';

export type AttemptStatus =
  | 'abandoned'
  | 'completed'
  | 'in_progress'
  | 'pending';

export type BeginInterviewAttemptInput = {
  attemptId: string;
  publicToken: string;
};

export type CheckpointEvaluationHintsInput = {
  falseClaims?: Array<string> | null | undefined;
  minMatchedConcepts?: number | null | undefined;
  mustConcepts?: Array<string> | null | undefined;
  positiveFloorScore?: number | null | undefined;
};

export type CheckpointInput = {
  checkpointKey: string;
  evaluationHints?: CheckpointEvaluationHintsInput | null | undefined;
  expected: string;
  score: number;
  sortOrder: number;
  title: string;
};

export type CheckpointMatchStatus =
  | 'met'
  | 'not_met'
  | 'partially_met';

export type CommitCompanyQuestionImportInput = {
  importToken: string;
  status?: QuestionStatus | null | undefined;
};

export type CompanyAttemptDecision =
  | 'hold'
  | 'invite_live'
  | 'pending'
  | 'reject'
  | 'shortlist';

export type CompanyAttemptDecisionInput =
  | 'hold'
  | 'invite_live'
  | 'reject'
  | 'shortlist';

export type CompanyCandidatesFilterInput = {
  maxScore?: number | null | undefined;
  minScore?: number | null | undefined;
  page?: number;
  pageSize?: number;
  search?: string | null | undefined;
  shortlistedOnly?: boolean | null | undefined;
  skillCode?: string | null | undefined;
  sort?: string;
  sortDirection?: string;
  topicCode?: string | null | undefined;
};

export type CompanyInterviewSummariesFilterInput = {
  hasAttemptsOnly?: boolean | null | undefined;
  interviewLanguage?: string | null | undefined;
  level?: QuestionLevel | null | undefined;
  page?: number;
  pageSize?: number;
  search?: string | null | undefined;
  sort?: string;
  sortDirection?: string;
  status?: InterviewStatus | null | undefined;
};

export type CompanyInterviewTemplatesFilterInput = {
  includeArchived?: boolean | null | undefined;
  level?: QuestionLevel | null | undefined;
  page?: number;
  pageSize?: number;
  search?: string | null | undefined;
};

export type CompanyInterviewsFilterInput = {
  dateFrom?: string | null | undefined;
  dateTo?: string | null | undefined;
  page?: number;
  pageSize?: number;
  search?: string | null | undefined;
  sort?: string;
  sortDirection?: string;
  status?: AttemptStatus | null | undefined;
};

export type CompanyQuestionPlaybookItemInput = {
  isPinned?: boolean;
  questionId: string | number;
  sortOrder?: number;
};

export type CompanyReviewQueueFilterInput = {
  evaluationStatus?: string | null | undefined;
  manualReviewOnly?: boolean | null | undefined;
  page?: number;
  pageSize?: number;
  search?: string | null | undefined;
  shortlistedOnly?: boolean | null | undefined;
  sort?: string;
  sortDirection?: string;
  unreviewedOnly?: boolean | null | undefined;
};

export type CompareInterviewCandidatesInput = {
  attemptIds: Array<string | number>;
  interviewId: string | number;
};

export type CreateAttemptReviewNoteInput = {
  attemptId: string;
  body: string;
};

export type CreateAttemptShareLinkInput = {
  attemptId: string;
  expiresInDays?: number | null | undefined;
};

export type CreateCompanyQuestionPlaybookInput = {
  items: Array<CompanyQuestionPlaybookItemInput>;
  level: QuestionLevel;
  name: string;
  professionId: string | number;
  skillIds?: Array<string | number> | null | undefined;
};

export type CreateCompanySkillInput = {
  code: string;
  name: string;
};

export type CreateCompanyTopicInput = {
  code: string;
  interviewWeight?: number | null | undefined;
  name: string;
  skillId: string;
};

export type CreateInterviewInput = {
  aiTone?: AiTone | null | undefined;
  allowRetake?: boolean | null | undefined;
  expiresAt?: string | null | undefined;
  interviewLanguage?: string | null | undefined;
  interviewerName?: string | null | undefined;
  isVideoEnabled?: boolean | null | undefined;
  jobDescription?: string | null | undefined;
  jobRole: string;
  level: QuestionLevel;
  maxCompletions?: number | null | undefined;
  passingScore?: number | null | undefined;
  probingDepth?: ProbingDepth | null | undefined;
  professionId?: string | null | undefined;
  questionCount?: number | null | undefined;
  questionIds: Array<string>;
  requireGithub?: boolean | null | undefined;
  requireLinkedin?: boolean | null | undefined;
  requirePhone?: boolean | null | undefined;
  scoringStrictness?: ScoringStrictness | null | undefined;
  timeLimitMinutes?: number | null | undefined;
  title: string;
  welcomeMessageTemplate?: string | null | undefined;
};

export type CreateInterviewTemplateInput = {
  aiTone?: AiTone | null | undefined;
  allowRetake?: boolean | null | undefined;
  interviewLanguage?: string | null | undefined;
  interviewerName?: string | null | undefined;
  isVideoEnabled?: boolean | null | undefined;
  jobDescription?: string | null | undefined;
  jobRole: string;
  level: QuestionLevel;
  maxCompletions?: number | null | undefined;
  passingScore?: number | null | undefined;
  probingDepth?: ProbingDepth | null | undefined;
  professionId?: string | number | null | undefined;
  questionIds: Array<string | number>;
  requireGithub?: boolean | null | undefined;
  requireLinkedin?: boolean | null | undefined;
  requirePhone?: boolean | null | undefined;
  scoringStrictness?: ScoringStrictness | null | undefined;
  timeLimitMinutes?: number | null | undefined;
  title: string;
  welcomeMessageTemplate?: string | null | undefined;
};

export type CreateQuestionInput = {
  answerExamples: Array<AnswerExampleInput>;
  checkpoints: Array<CheckpointInput>;
  companyPriority?: number | null | undefined;
  difficulty: QuestionDifficulty;
  idealAnswer: string;
  isRequired?: boolean | null | undefined;
  level: QuestionLevel;
  maxScore: number;
  professionId: string;
  questionText: string;
  shortAnswer: string;
  skillIds: Array<string>;
  status?: QuestionStatus | null | undefined;
  topicId: string;
};

export type DashboardAttentionKind =
  | 'abandoned'
  | 'in_progress'
  | 'needs_review'
  | 'strong_candidate';

export type DecisionAuditEventSource =
  | 'attempt_review'
  | 'shortlist';

export type DraftInterviewFromJobDescriptionInput = {
  count?: number | null | undefined;
  jobDescription: string;
  language?: string | null | undefined;
};

export type FinalEvaluationCategory =
  | 'average'
  | 'basic'
  | 'good'
  | 'strong'
  | 'weak';

export type HireRecommendation =
  | 'invite'
  | 'maybe'
  | 'reject'
  | 'strong_invite'
  | 'strong_reject';

export type InterviewAttemptsFilterInput = {
  disagreeOnly?: boolean | null | undefined;
  hireRecommendation?: string | null | undefined;
  page?: number;
  pageSize?: number;
  search?: string | null | undefined;
  sort?: string;
  sortDirection?: string;
  unreviewedOnly?: boolean | null | undefined;
};

export type InterviewMessageKind =
  | 'conduct_terminated'
  | 'conduct_violation'
  | 'conduct_warning'
  | 'follow_up_answer'
  | 'follow_up_question'
  | 'main_answer'
  | 'main_question'
  | 'system_note'
  | 'topic_opener'
  | 'topic_opener_answer'
  | 'welcome';

export type InterviewStatus =
  | 'active'
  | 'archived'
  | 'draft'
  | 'paused';

export type InterviewStrengthCategory =
  | 'medium'
  | 'strong'
  | 'weak';

export type InterviewTemplateStatus =
  | 'active'
  | 'archived';

export type LoginInput = {
  email: string;
  password: string;
};

export type MessageRole =
  | 'ai'
  | 'candidate';

export type ProbingDepth =
  | 'balanced'
  | 'deep'
  | 'shallow';

export type QuestionBankFilterInput = {
  difficulty?: QuestionDifficulty | null | undefined;
  includeForkReplacedGlobal?: boolean | null | undefined;
  level?: QuestionLevel | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  professionId?: string | null | undefined;
  scope?: QuestionScope | null | undefined;
  search?: string | null | undefined;
  skillIds?: Array<string> | null | undefined;
  status?: QuestionStatus | null | undefined;
  topicId?: string | null | undefined;
};

export type QuestionDifficulty =
  | 'advanced'
  | 'basic'
  | 'intermediate';

export type QuestionLevel =
  | 'junior'
  | 'lead'
  | 'middle'
  | 'senior';

export type QuestionScope =
  | 'all'
  | 'company'
  | 'global';

export type QuestionStatus =
  | 'draft'
  | 'published';

export type RegisterInput = {
  companyName: string;
  email: string;
  fullName: string;
  password: string;
};

export type ScoringStrictness =
  | 'balanced'
  | 'lenient'
  | 'strict';

export type SetAttemptAiVerdictInput = {
  attemptId: string;
  reason?: string | null | undefined;
  verdict: AiAssessmentVerdictInput;
};

export type SetAttemptCompanyDecisionInput = {
  attemptId: string;
  decision: CompanyAttemptDecisionInput;
  reason?: string | null | undefined;
};

export type ShortlistStatus =
  | 'removed'
  | 'shortlisted';

export type StartPublicInterviewInput = {
  email: string;
  fullName: string;
  githubUrl?: string | null | undefined;
  linkedinUrl?: string | null | undefined;
  phone?: string | null | undefined;
  publicToken: string;
};

export type SubmitInterviewAnswerInput = {
  answer: string;
  attemptId: string;
  mediaAssetId?: string | null | undefined;
  publicToken: string;
};

export type SuggestInterviewQuestionsInput = {
  count?: number | null | undefined;
  excludeQuestionIds?: Array<string> | null | undefined;
  level?: QuestionLevel | null | undefined;
  professionId: string;
  skillIds?: Array<string> | null | undefined;
};

export type TopicSkillQuestionFilterInput = {
  dateFrom?: string | null | undefined;
  dateTo?: string | null | undefined;
  jobRole?: string | null | undefined;
  level?: QuestionLevel | null | undefined;
};

export type UpdateAttemptReviewNoteInput = {
  body: string;
  noteId: string;
};

export type UpdateCompanySkillInput = {
  code?: string | null | undefined;
  id: string | number;
  name?: string | null | undefined;
};

export type UpdateCompanyTopicInput = {
  code?: string | null | undefined;
  id: string | number;
  interviewWeight?: number | null | undefined;
  name?: string | null | undefined;
  skillId?: string | null | undefined;
};

export type UpdateQuestionInput = {
  answerExamples: Array<AnswerExampleInput>;
  checkpoints: Array<CheckpointInput>;
  companyPriority?: number | null | undefined;
  difficulty: QuestionDifficulty;
  id: string;
  idealAnswer: string;
  isRequired?: boolean | null | undefined;
  level: QuestionLevel;
  maxScore: number;
  professionId: string;
  questionText: string;
  shortAnswer: string;
  skillIds: Array<string>;
  status?: QuestionStatus | null | undefined;
  topicId: string;
};

export type UpsertCompanyQuestionOverrideInput = {
  extraAnswerExamples?: Array<AnswerExampleInput> | null | undefined;
  extraFalseClaims?: Array<string> | null | undefined;
  extraMustConcepts?: Array<string> | null | undefined;
  sourceQuestionId: string | number;
  topicWeightOverride?: number | null | undefined;
};

export type AdaptiveCheckpointReviewByAttemptQueryVariables = Exact<{
  attemptId: string | number;
}>;


export type AdaptiveCheckpointReviewByAttemptQuery = { adaptiveCheckpointReviewByAttempt: { attemptId: string, needsManualReview: boolean, redFlags: Array<{ checkpointKey: string, checkpointTitle: string, summary: string, candidateQuote: string | null, severity: string }>, questionGroups: Array<{ interviewQuestionId: string, questionText: string, idealAnswer: string | null, needsManualReview: boolean, checkpoints: Array<{ checkpointKey: string, checkpointTitle: string, status: string, scoreAwarded: number, maxScore: number, rationale: string | null, evidenceSummary: string | null, confidence: number | null, needsManualReview: boolean, depthLabel: string, coveragePercent: number, accuracyPercent: number }> }> } };

export type AddCandidateToShortlistMutationVariables = Exact<{
  candidateId: string | number;
  reason?: string | null | undefined;
}>;


export type AddCandidateToShortlistMutation = { addCandidateToShortlist: { candidateId: string, status: ShortlistStatus, reason: string | null } };

export type AiCostAnalyticsQueryVariables = Exact<{
  filters?: AiCostFilterInput | null | undefined;
}>;


export type AiCostAnalyticsQuery = { aiCostAnalytics: { kpi: { totalCostUsd: number, costPerInterview: number, costPerCandidate: number, totalRequests: number }, byModel: Array<{ model: string, promptTokens: number, completionTokens: number, totalCostUsd: number }>, topExpensiveInterviews: Array<{ interviewAttemptId: string, interviewTitle: string | null, totalCostUsd: number, latencyMs: number | null }>, elevenLabs: { kpi: { totalCostUsd: number, totalCharacters: number, totalRequests: number }, byOperation: Array<{ operationType: string, characterCount: number, totalCostUsd: number }> } } };

export type ApplyPlaybookToInterviewDraftMutationVariables = Exact<{
  playbookId: string | number;
  count?: number | null | undefined;
}>;


export type ApplyPlaybookToInterviewDraftMutation = { applyPlaybookToInterviewDraft: { questionIds: Array<string>, pinnedQuestionIds: Array<string>, count: number } };

export type ArchiveCompanyQuestionPlaybookMutationVariables = Exact<{
  id: string | number;
}>;


export type ArchiveCompanyQuestionPlaybookMutation = { archiveCompanyQuestionPlaybook: boolean };

export type ArchiveCompanySkillMutationVariables = Exact<{
  id: string | number;
}>;


export type ArchiveCompanySkillMutation = { archiveCompanySkill: { id: string, code: string, name: string, isCustom: boolean } };

export type ArchiveCompanyTopicMutationVariables = Exact<{
  id: string | number;
}>;


export type ArchiveCompanyTopicMutation = { archiveCompanyTopic: { id: string, code: string, name: string, interviewWeight: number, isCustom: boolean } };

export type ArchiveInterviewMutationVariables = Exact<{
  id: string | number;
}>;


export type ArchiveInterviewMutation = { archiveInterview: { id: string, status: InterviewStatus, publicUrl: string } };

export type ArchiveQuestionMutationVariables = Exact<{
  id: string | number;
}>;


export type ArchiveQuestionMutation = { archiveQuestion: { id: string, isActive: boolean } };

export type AttemptReviewDecisionHistoryQueryVariables = Exact<{
  attemptId: string | number;
  filters?: AttemptReviewDecisionHistoryFilterInput | null | undefined;
}>;


export type AttemptReviewDecisionHistoryQuery = { attemptReviewDecisionHistory: { total: number, page: number, pageSize: number, items: Array<{ eventId: string, source: DecisionAuditEventSource, action: string, previousValue: string | null, newValue: string | null, reason: string | null, actorEmail: string | null, actorName: string | null, occurredAt: number }> } };

export type AttemptReviewNotesQueryVariables = Exact<{
  attemptId: string | number;
}>;


export type AttemptReviewNotesQuery = { attemptReviewNotes: Array<{ id: string, attemptId: string, body: string, authorId: string, authorName: string, createdAt: number, updatedAt: number }> };

export type AttemptShareLinkQueryVariables = Exact<{
  attemptId: string | number;
}>;


export type AttemptShareLinkQuery = { attemptShareLink: { attemptId: string, token: string, sharePath: string, expiresAt: number | null } | null };

export type BeginInterviewAttemptMutationVariables = Exact<{
  input: BeginInterviewAttemptInput;
}>;


export type BeginInterviewAttemptMutation = { beginInterviewAttempt: { attemptId: string, status: AttemptStatus, isWelcomePending: boolean, welcomeMessage: string | null, totalQuestions: number, answeredQuestions: number, currentQuestionText: string | null, currentQuestionId: string | null, messages: Array<{ id: string, role: MessageRole, content: string, sequenceOrder: number, messageKind: InterviewMessageKind | null }> } };

export type CandidateReportQueryVariables = Exact<{
  candidateId: string | number;
}>;


export type CandidateReportQuery = { candidateReport: { candidateId: string, fullName: string, email: string, phone: string | null, linkedinUrl: string | null, githubUrl: string | null, shortlistStatus: string, shortlistReason: string | null, latestFinalEvaluation: { id: string, totalScore: number, finalScore: number, totalWeight: number, averageScore: number | null, strengthCategory: InterviewStrengthCategory, category: FinalEvaluationCategory, hireRecommendation: HireRecommendation, achievedLevel: QuestionLevel | null, achievedLevelMethod: AchievedLevelMethod | null, achievedLevelNote: string | null, targetLevel: QuestionLevel | null, summary: string, detailedSummary: string | null, strengths: Array<string>, weaknesses: Array<string>, risks: Array<string>, needsManualReview: boolean, levelBreakdown: Array<{ level: QuestionLevel, earned: number, maxScore: number, ratio: number, passed: boolean }>, categoryBreakdown: Array<{ categoryKey: string, categoryLabel: string, scoreNormalized: number, weight: number, contribution: number }>, topicEvaluations: Array<{ topic: string, score: number, weight: number, weightedScore: number, strengthCategory: InterviewStrengthCategory }> } | null, interviewHistory: Array<{ attemptId: string, interviewId: string, interviewTitle: string, jobRole: string, status: AttemptStatus, completedAt: number | null, totalScore: number | null }> } };

export type CheckpointResultsByAttemptQueryVariables = Exact<{
  attemptId: string | number;
}>;


export type CheckpointResultsByAttemptQuery = { checkpointResultsByAttempt: { attemptId: string, questionGroups: Array<{ interviewQuestionId: string, questionText: string, needsManualReview: boolean, checkpoints: Array<{ id: string, checkpointKey: string, checkpointTitle: string, status: CheckpointMatchStatus, scoreAwarded: number, maxScore: number, evidenceQuote: string | null, reasoningShort: string | null }> }> } };

export type CommitCompanyQuestionImportMutationVariables = Exact<{
  input: CommitCompanyQuestionImportInput;
}>;


export type CommitCompanyQuestionImportMutation = { commitCompanyQuestionImport: { topicsCreated: number, topicsUpdated: number, skillsCreated: number, questionsCreated: number, questionsUpdated: number } };

export type CompanyCandidatesQueryVariables = Exact<{
  filters?: CompanyCandidatesFilterInput | null | undefined;
}>;


export type CompanyCandidatesQuery = { companyCandidates: { total: number, page: number, pageSize: number, items: Array<{ candidateId: string, fullName: string, email: string, interviewsCount: number, avgScore: number | null, lastInterviewDate: number | null, shortlistStatus: string }> } };

export type CompanyDashboardOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type CompanyDashboardOverviewQuery = { companyDashboardOverview: { interviewsTotal: number, shortlistTotal: number, metrics: { candidatesTotal: number, completedTotal: number, inProgressTotal: number, shortlistedTotal: number, abandonedTotal: number, needsReviewTotal: number, strongInviteTotal: number, completionRate: number | null, interviewsTotal: number, activeInterviewsTotal: number }, interviews: Array<{ interviewId: string, title: string, jobRole: string, status: InterviewStatus, level: QuestionLevel, interviewLanguage: string, questionCount: number, publicUrl: string, createdAt: number, attemptsTotal: number, attemptsCompleted: number, attemptsInProgress: number, attemptsAbandoned: number, attemptsPending: number, completionRate: number | null, shortlistedCount: number, strongInviteCount: number, needsManualReviewCount: number, avgScore: number | null, lastActivityAt: number | null }>, attentionItems: Array<{ kind: DashboardAttentionKind, attemptId: string, interviewId: string, interviewTitle: string, jobRole: string, candidateId: string, candidateName: string, overallScore: number | null, hireRecommendation: HireRecommendation | null, occurredAt: number }>, shortlistPreview: Array<{ candidateId: string, fullName: string, email: string, interviewsCount: number, avgScore: number | null, lastInterviewDate: number | null }>, weakTopics: Array<{ topicName: string, avgScore: number, passRate: number, sampleCount: number }> } };

export type CompanyInterviewSummariesQueryVariables = Exact<{
  filters?: CompanyInterviewSummariesFilterInput | null | undefined;
}>;


export type CompanyInterviewSummariesQuery = { companyInterviewSummaries: { total: number, page: number, pageSize: number, items: Array<{ interviewId: string, title: string, jobRole: string, status: InterviewStatus, level: QuestionLevel, interviewLanguage: string, questionCount: number, publicUrl: string, createdAt: number, attemptsTotal: number, attemptsCompleted: number, attemptsInProgress: number, attemptsAbandoned: number, attemptsPending: number, completionRate: number | null, shortlistedCount: number, strongInviteCount: number, needsManualReviewCount: number, avgScore: number | null, lastActivityAt: number | null }>, facets: { total: number, active: number, draft: number, archived: number, withAttempts: number } } };

export type CompanyInterviewTemplatesQueryVariables = Exact<{
  filters?: CompanyInterviewTemplatesFilterInput | null | undefined;
}>;


export type CompanyInterviewTemplatesQuery = { companyInterviewTemplates: { total: number, page: number, pageSize: number, items: Array<{ id: string, title: string, jobRole: string, level: QuestionLevel, interviewLanguage: string, questionCount: number, jobDescription: string | null, professionId: string | null, isVideoEnabled: boolean, interviewerName: string | null, welcomeMessageTemplate: string | null, aiTone: AiTone, probingDepth: ProbingDepth, scoringStrictness: ScoringStrictness, maxCompletions: number | null, allowRetake: boolean, timeLimitMinutes: number | null, passingScore: number | null, requirePhone: boolean, requireLinkedin: boolean, requireGithub: boolean, status: InterviewTemplateStatus, createdAt: number, updatedAt: number, questions: Array<{ questionId: string, sortOrder: number }> }> } };

export type CompanyInterviewsQueryVariables = Exact<{
  filters?: CompanyInterviewsFilterInput | null | undefined;
}>;


export type CompanyInterviewsQuery = { companyInterviews: { total: number, page: number, pageSize: number, items: Array<{ attemptId: string, interviewId: string, interviewTitle: string, jobRole: string, candidateName: string, candidateEmail: string, status: AttemptStatus, startedAt: number | null, completedAt: number | null, overallScore: number | null }> } };

export type CompanyQuestionOverrideQueryVariables = Exact<{
  sourceQuestionId: string | number;
}>;


export type CompanyQuestionOverrideQuery = { companyQuestionOverride: { id: string, sourceQuestionId: string, extraMustConcepts: Array<string> | null, extraFalseClaims: Array<string> | null, topicWeightOverride: number | null, updatedAt: unknown } | null };

export type CompanyQuestionPlaybooksQueryVariables = Exact<{ [key: string]: never; }>;


export type CompanyQuestionPlaybooksQuery = { companyQuestionPlaybooks: Array<{ id: string, name: string, professionId: string, level: QuestionLevel, skillIds: Array<string> | null, isActive: boolean, itemCount: number, pinnedCount: number, items: Array<{ questionId: string, sortOrder: number, isPinned: boolean }> }> };

export type CompanyReviewQueueQueryVariables = Exact<{
  filters?: CompanyReviewQueueFilterInput | null | undefined;
}>;


export type CompanyReviewQueueQuery = { companyReviewQueue: { total: number, page: number, pageSize: number, items: Array<{ attemptId: string, candidateId: string, candidateName: string, candidateEmail: string, interviewId: string, interviewTitle: string, jobRole: string, completedAt: number | null, evaluationStatus: string, totalScore: number | null, hireRecommendation: HireRecommendation | null, achievedLevel: QuestionLevel | null, achievedLevelMethod: AchievedLevelMethod | null, needsManualReview: boolean, shortlistStatus: string }> } };

export type CompareInterviewCandidatesMutationVariables = Exact<{
  input: CompareInterviewCandidatesInput;
}>;


export type CompareInterviewCandidatesMutation = { compareInterviewCandidates: { recommendedAttemptId: string | null, recommendationTitle: string, recommendationSummary: string, decisionRationale: Array<string>, caveats: Array<string>, ranking: Array<{ attemptId: string, rank: number, headline: string, tradeOff: string }>, useCases: Array<{ title: string, recommendedAttemptId: string | null, rationale: string }>, candidateNotes: Array<{ attemptId: string, candidateName: string, bestFor: string, strengths: Array<string>, risks: Array<string>, followUpQuestions: Array<string> }> } };

export type CompleteInterviewAttemptMutationVariables = Exact<{
  publicToken: string;
  attemptId: string | number;
}>;


export type CompleteInterviewAttemptMutation = { completeInterviewAttempt: { attemptId: string, status: AttemptStatus, totalQuestions: number, answeredQuestions: number, messages: Array<{ id: string, role: MessageRole, content: string }> } };

export type CreateAttemptReviewNoteMutationVariables = Exact<{
  input: CreateAttemptReviewNoteInput;
}>;


export type CreateAttemptReviewNoteMutation = { createAttemptReviewNote: { id: string, attemptId: string, body: string, authorId: string, authorName: string, createdAt: number, updatedAt: number } };

export type CreateAttemptShareLinkMutationVariables = Exact<{
  input: CreateAttemptShareLinkInput;
}>;


export type CreateAttemptShareLinkMutation = { createAttemptShareLink: { attemptId: string, token: string, sharePath: string, expiresAt: number | null } };

export type CreateCompanyQuestionPlaybookMutationVariables = Exact<{
  input: CreateCompanyQuestionPlaybookInput;
}>;


export type CreateCompanyQuestionPlaybookMutation = { createCompanyQuestionPlaybook: { id: string, name: string, professionId: string, level: QuestionLevel, skillIds: Array<string> | null, itemCount: number, pinnedCount: number, items: Array<{ questionId: string, sortOrder: number, isPinned: boolean }> } };

export type CreateCompanySkillMutationVariables = Exact<{
  input: CreateCompanySkillInput;
}>;


export type CreateCompanySkillMutation = { createCompanySkill: { id: string, code: string, name: string, isCustom: boolean } };

export type CreateCompanyTopicMutationVariables = Exact<{
  input: CreateCompanyTopicInput;
}>;


export type CreateCompanyTopicMutation = { createCompanyTopic: { id: string, code: string, name: string, interviewWeight: number, isCustom: boolean, skill: { id: string, code: string, name: string } | null } };

export type CreateInterviewFromTemplateMutationVariables = Exact<{
  templateId: string | number;
}>;


export type CreateInterviewFromTemplateMutation = { createInterviewFromTemplate: { id: string, title: string, jobRole: string, level: QuestionLevel, status: InterviewStatus, publicToken: string, publicUrl: string, questionCount: number, interviewerName: string | null, welcomeMessageTemplate: string | null } };

export type CreateInterviewTemplateFromInterviewMutationVariables = Exact<{
  interviewId: string | number;
  title?: string | null | undefined;
}>;


export type CreateInterviewTemplateFromInterviewMutation = { createInterviewTemplateFromInterview: { id: string, title: string, jobRole: string, level: QuestionLevel, interviewLanguage: string, questionCount: number, jobDescription: string | null, professionId: string | null, isVideoEnabled: boolean, interviewerName: string | null, welcomeMessageTemplate: string | null, aiTone: AiTone, probingDepth: ProbingDepth, scoringStrictness: ScoringStrictness, maxCompletions: number | null, allowRetake: boolean, timeLimitMinutes: number | null, passingScore: number | null, requirePhone: boolean, requireLinkedin: boolean, requireGithub: boolean, status: InterviewTemplateStatus, createdAt: number, updatedAt: number, questions: Array<{ questionId: string, sortOrder: number }> } };

export type CreateInterviewTemplateMutationVariables = Exact<{
  input: CreateInterviewTemplateInput;
}>;


export type CreateInterviewTemplateMutation = { createInterviewTemplate: { id: string, title: string, jobRole: string, level: QuestionLevel, interviewLanguage: string, questionCount: number, jobDescription: string | null, professionId: string | null, isVideoEnabled: boolean, interviewerName: string | null, welcomeMessageTemplate: string | null, aiTone: AiTone, probingDepth: ProbingDepth, scoringStrictness: ScoringStrictness, maxCompletions: number | null, allowRetake: boolean, timeLimitMinutes: number | null, passingScore: number | null, requirePhone: boolean, requireLinkedin: boolean, requireGithub: boolean, status: InterviewTemplateStatus, createdAt: number, updatedAt: number, questions: Array<{ questionId: string, sortOrder: number }> } };

export type CreateInterviewMutationVariables = Exact<{
  input: CreateInterviewInput;
}>;


export type CreateInterviewMutation = { createInterview: { id: string, title: string, jobRole: string, level: QuestionLevel, status: InterviewStatus, publicToken: string, publicUrl: string, questionCount: number, interviewerName: string | null, welcomeMessageTemplate: string | null } };

export type CreateQuestionMutationVariables = Exact<{
  input: CreateQuestionInput;
}>;


export type CreateQuestionMutation = { createQuestion: { id: string, questionText: string, status: QuestionStatus, isCustom: boolean, isRequired: boolean, companyPriority: number } };

export type DraftInterviewFromJobDescriptionMutationVariables = Exact<{
  input: DraftInterviewFromJobDescriptionInput;
}>;


export type DraftInterviewFromJobDescriptionMutation = { draftInterviewFromJobDescription: { title: string | null, jobRole: string | null, professionId: string | null, level: QuestionLevel | null, skillIds: Array<string>, questionIds: Array<string>, generatedByAi: boolean } };

export type EvaluateInterviewAttemptMutationVariables = Exact<{
  attemptId: string | number;
}>;


export type EvaluateInterviewAttemptMutation = { evaluateInterviewAttempt: { questionCount: number, finalEvaluation: { id: string, totalScore: number, finalScore: number, totalWeight: number, averageScore: number | null, strengthCategory: InterviewStrengthCategory, category: FinalEvaluationCategory, hireRecommendation: HireRecommendation, summary: string, needsManualReview: boolean, categoryBreakdown: Array<{ categoryKey: string, categoryLabel: string, scoreNormalized: number, weight: number, contribution: number }>, topicEvaluations: Array<{ topic: string, score: number, weight: number, weightedScore: number, strengthCategory: InterviewStrengthCategory }> } } };

export type FinalEvaluationByAttemptQueryVariables = Exact<{
  attemptId: string | number;
}>;


export type FinalEvaluationByAttemptQuery = { finalEvaluationByAttempt: { id: string, interviewAttemptId: string, totalScore: number, finalScore: number, totalWeight: number, averageScore: number | null, strengthCategory: InterviewStrengthCategory, category: FinalEvaluationCategory, hireRecommendation: HireRecommendation, summary: string, detailedSummary: string | null, strengths: Array<string>, weaknesses: Array<string>, risks: Array<string>, needsManualReview: boolean, categoryBreakdown: Array<{ categoryKey: string, categoryLabel: string, scoreNormalized: number, weight: number, contribution: number }>, topicEvaluations: Array<{ topic: string, score: number, weight: number, weightedScore: number, strengthCategory: InterviewStrengthCategory }> } | null };

export type ForkQuestionMutationVariables = Exact<{
  sourceQuestionId: string | number;
}>;


export type ForkQuestionMutation = { forkQuestion: { id: string, questionText: string, status: QuestionStatus, isCustom: boolean, sourceQuestionId: string | null } };

export type HelloQueryVariables = Exact<{ [key: string]: never; }>;


export type HelloQuery = { hello: string };

export type InterviewAttemptsPageQueryVariables = Exact<{
  interviewId: string | number;
  filters?: InterviewAttemptsFilterInput | null | undefined;
}>;


export type InterviewAttemptsPageQuery = { interviewAttemptsPage: { total: number, page: number, pageSize: number, items: Array<{ attemptId: string, candidateId: string, candidateName: string, candidateEmail: string, status: AttemptStatus, completedAt: number | null, overallScore: number | null, hireRecommendation: HireRecommendation | null, evaluationStatus: string, achievedLevel: QuestionLevel | null, achievedLevelMethod: AchievedLevelMethod | null, needsManualReview: boolean, shortlistStatus: string, reviewStatus: AttemptReviewStatus, aiAssessmentVerdict: AiAssessmentVerdict, companyDecision: CompanyAttemptDecision, reviewedAt: number | null, hasTeamNotes: boolean }> } };

export type InterviewQueryVariables = Exact<{
  id: string | number;
}>;


export type InterviewQuery = { interview: { id: string, title: string, jobRole: string, status: InterviewStatus, publicUrl: string, questionCount: number } };

export type InterviewDetailsQueryVariables = Exact<{
  interviewId: string | number;
}>;


export type InterviewDetailsQuery = { interviewDetails: { id: string, title: string, jobRole: string, professionName: string | null, level: string, status: InterviewStatus, questionCount: number, publicUrl: string, createdAt: number, evaluationStatus: string, skills: Array<string>, questions: Array<{ id: string, sortOrder: number, questionText: string, level: string, difficulty: string, topicName: string | null }>, primaryFinalEvaluation: { id: string, totalScore: number, finalScore: number, totalWeight: number, averageScore: number | null, strengthCategory: InterviewStrengthCategory, category: FinalEvaluationCategory, hireRecommendation: HireRecommendation, summary: string, strengths: Array<string>, weaknesses: Array<string>, risks: Array<string>, needsManualReview: boolean, categoryBreakdown: Array<{ categoryKey: string, categoryLabel: string, scoreNormalized: number, weight: number, contribution: number }>, topicEvaluations: Array<{ topic: string, score: number, weight: number, weightedScore: number, strengthCategory: InterviewStrengthCategory }> } | null, attempts: Array<{ attemptId: string, candidateId: string, candidateName: string, candidateEmail: string, status: AttemptStatus, startedAt: number | null, completedAt: number | null, overallScore: number | null, hireRecommendation: HireRecommendation | null, evaluationStatus: string, achievedLevel: QuestionLevel | null, achievedLevelMethod: AchievedLevelMethod | null, needsManualReview: boolean, shortlistStatus: string, reviewStatus: AttemptReviewStatus, aiAssessmentVerdict: AiAssessmentVerdict, companyDecision: CompanyAttemptDecision, reviewedAt: number | null, hasTeamNotes: boolean }> } };

export type InterviewSessionQueryVariables = Exact<{
  publicToken: string;
  attemptId: string | number;
}>;


export type InterviewSessionQuery = { interviewSession: { attemptId: string, status: AttemptStatus, totalQuestions: number, answeredQuestions: number, currentQuestionText: string | null, currentQuestionId: string | null, welcomeMessage: string | null, isWelcomePending: boolean, messages: Array<{ id: string, role: MessageRole, content: string, sequenceOrder: number, messageKind: InterviewMessageKind | null, interviewQuestionId: string | null, targetCheckpointKey: string | null }> } };

export type InterviewTranscriptQueryVariables = Exact<{
  attemptId: string | number;
}>;


export type InterviewTranscriptQuery = { interviewTranscript: { attemptId: string, segments: Array<{ messageId: string, role: MessageRole, content: string, sequenceOrder: number, timestamp: number, questionText: string | null, interviewQuestionId: string | null }> } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { accessToken: string, tokenType: string, user: { id: string, email: string, fullName: string, isActive: boolean }, company: { id: string, name: string, slug: string, isActive: boolean } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: { success: boolean } };

export type ManagedInterviewQueryVariables = Exact<{
  id: string | number;
}>;


export type ManagedInterviewQuery = { interview: { id: string, title: string, jobRole: string, level: QuestionLevel, interviewLanguage: string, questionCount: number, status: InterviewStatus, publicToken: string, publicUrl: string, isVideoEnabled: boolean, interviewerName: string | null, welcomeMessageTemplate: string | null, aiTone: AiTone, probingDepth: ProbingDepth, scoringStrictness: ScoringStrictness, expiresAt: string | null, maxCompletions: number | null, allowRetake: boolean, timeLimitMinutes: number | null, passingScore: number | null, requirePhone: boolean, requireLinkedin: boolean, requireGithub: boolean } };

export type MarkAttemptReviewStartedMutationVariables = Exact<{
  attemptId: string | number;
}>;


export type MarkAttemptReviewStartedMutation = { markAttemptReviewStarted: { attemptId: string, reviewStatus: AttemptReviewStatus, aiAssessmentVerdict: AiAssessmentVerdict, companyDecision: CompanyAttemptDecision, reviewedAt: number | null } };

export type MatchingCandidatesForLevelQueryVariables = Exact<{
  level: QuestionLevel;
  professionId: string | number;
  skillIds?: Array<string | number> | string | number | null | undefined;
}>;


export type MatchingCandidatesForLevelQuery = { matchingCandidatesForLevel: Array<{ candidateId: string, fullName: string, email: string, achievedLevel: QuestionLevel, achievedLevelMethod: AchievedLevelMethod | null, sourceInterviewId: string, sourceInterviewTitle: string, professionId: string, professionName: string, matchedSkills: Array<string>, matchedSkillCount: number, completedAt: number | null }> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { user: { id: string, email: string, fullName: string, isActive: boolean }, company: { id: string, name: string, slug: string, isActive: boolean } } };

export type PauseInterviewMutationVariables = Exact<{
  id: string | number;
}>;


export type PauseInterviewMutation = { pauseInterview: { id: string, status: InterviewStatus, publicUrl: string } };

export type ProfessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfessionsQuery = { professions: Array<{ id: string, code: string, name: string }> };

export type PublicInterviewQueryVariables = Exact<{
  publicToken: string;
}>;


export type PublicInterviewQuery = { publicInterview: { title: string, jobRole: string, questionCount: number, interviewLanguage: string } };

export type PublishInterviewMutationVariables = Exact<{
  id: string | number;
}>;


export type PublishInterviewMutation = { publishInterview: { id: string, status: InterviewStatus, publicUrl: string, publicToken: string } };

export type QuestionBankListQueryVariables = Exact<{
  filters?: QuestionBankFilterInput | null | undefined;
}>;


export type QuestionBankListQuery = { questionBank: { total: number, items: Array<{ id: string, questionText: string, level: QuestionLevel, difficulty: QuestionDifficulty, isActive: boolean, isCustom: boolean, isRequired: boolean, companyPriority: number, status: QuestionStatus, sourceQuestionId: string | null, topic: { id: string, code: string, name: string, interviewWeight: number, isCustom: boolean, skill: { id: string, code: string, name: string, isCustom: boolean } | null }, profession: { id: string, code: string, name: string }, skills: Array<{ id: string, code: string, name: string, isCustom: boolean }> }> } };

export type QuestionBankQueryVariables = Exact<{
  filters?: QuestionBankFilterInput | null | undefined;
}>;


export type QuestionBankQuery = { questionBank: { total: number, items: Array<{ id: string, questionText: string, level: QuestionLevel, difficulty: QuestionDifficulty, isActive: boolean, isCustom: boolean, isRequired: boolean, companyPriority: number, status: QuestionStatus, sourceQuestionId: string | null, topic: { id: string, code: string, name: string, interviewWeight: number, isCustom: boolean, skill: { id: string, code: string, name: string, isCustom: boolean } | null }, profession: { id: string, code: string, name: string }, skills: Array<{ id: string, code: string, name: string, isCustom: boolean }>, checkpoints: Array<{ id: string, checkpointKey: string, title: string, expected: string, score: number, sortOrder: number, evaluationHints: { mustConcepts: Array<string> | null, falseClaims: Array<string> | null } | null }>, answerExamples: Array<{ id: string, exampleType: AnswerExampleType, exampleText: string, sortOrder: number }> }> } };

export type QuestionQueryVariables = Exact<{
  id: string | number;
}>;


export type QuestionQuery = { question: { id: string, questionText: string, level: QuestionLevel, difficulty: QuestionDifficulty, isActive: boolean, isCustom: boolean, isRequired: boolean, companyPriority: number, status: QuestionStatus, maxScore: number, shortAnswer: string, idealAnswer: string, sourceQuestionId: string | null, topic: { id: string, code: string, name: string, interviewWeight: number, skill: { id: string, code: string, name: string } | null }, profession: { id: string, code: string, name: string }, skills: Array<{ id: string, code: string, name: string }>, checkpoints: Array<{ id: string, checkpointKey: string, title: string, expected: string, score: number, sortOrder: number, evaluationHints: { mustConcepts: Array<string> | null, falseClaims: Array<string> | null } | null }>, answerExamples: Array<{ id: string, exampleType: AnswerExampleType, exampleText: string, sortOrder: number }> } };

export type RefreshTokensMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshTokensMutation = { refreshTokens: { accessToken: string, tokenType: string } };

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { register: { accessToken: string, tokenType: string, user: { id: string, email: string, fullName: string, isActive: boolean }, company: { id: string, name: string, slug: string, isActive: boolean } } };

export type RemoveCandidateFromShortlistMutationVariables = Exact<{
  candidateId: string | number;
  reason?: string | null | undefined;
}>;


export type RemoveCandidateFromShortlistMutation = { removeCandidateFromShortlist: { candidateId: string, status: ShortlistStatus, reason: string | null } };

export type ResumeInterviewMutationVariables = Exact<{
  id: string | number;
}>;


export type ResumeInterviewMutation = { resumeInterview: { id: string, status: InterviewStatus, publicUrl: string } };

export type RevokeAttemptShareLinkMutationVariables = Exact<{
  attemptId: string | number;
}>;


export type RevokeAttemptShareLinkMutation = { revokeAttemptShareLink: boolean };

export type SetAttemptAiVerdictMutationVariables = Exact<{
  input: SetAttemptAiVerdictInput;
}>;


export type SetAttemptAiVerdictMutation = { setAttemptAiVerdict: { attemptId: string, reviewStatus: AttemptReviewStatus, aiAssessmentVerdict: AiAssessmentVerdict, companyDecision: CompanyAttemptDecision, reviewedAt: number | null } };

export type SetAttemptCompanyDecisionMutationVariables = Exact<{
  input: SetAttemptCompanyDecisionInput;
}>;


export type SetAttemptCompanyDecisionMutation = { setAttemptCompanyDecision: { attemptId: string, reviewStatus: AttemptReviewStatus, aiAssessmentVerdict: AiAssessmentVerdict, companyDecision: CompanyAttemptDecision, reviewedAt: number | null } };

export type SkillsQueryVariables = Exact<{
  professionId?: string | null | undefined;
}>;


export type SkillsQuery = { skills: Array<{ id: string, code: string, name: string, isCustom: boolean }> };

export type StartInterviewPreviewMutationVariables = Exact<{
  interviewId: string | number;
}>;


export type StartInterviewPreviewMutation = { startInterviewPreview: { attemptId: string, publicToken: string, totalQuestions: number } };

export type StartPublicInterviewMutationVariables = Exact<{
  input: StartPublicInterviewInput;
}>;


export type StartPublicInterviewMutation = { startPublicInterview: { attemptId: string, currentQuestionText: string | null, totalQuestions: number } };

export type SubmitInterviewAnswerMutationVariables = Exact<{
  input: SubmitInterviewAnswerInput;
}>;


export type SubmitInterviewAnswerMutation = { submitInterviewAnswer: { status: AttemptStatus, nextQuestionText: string | null, pendingMessageText: string | null, answeredQuestions: number, totalQuestions: number, answeredMainQuestions: number, totalMainQuestions: number, messageKind: InterviewMessageKind | null, currentInterviewQuestionId: string | null, isFollowUp: boolean, currentQuestionFollowUpCount: number } };

export type SuggestInterviewQuestionsMutationVariables = Exact<{
  input: SuggestInterviewQuestionsInput;
}>;


export type SuggestInterviewQuestionsMutation = { suggestInterviewQuestions: { count: number, candidateCount: number, generatedByAi: boolean, questionIds: Array<string>, questions: Array<{ id: string, isCustom: boolean, isRequired: boolean, companyPriority: number, status: QuestionStatus }> } };

export type TopicSkillQuestionAnalyticsQueryVariables = Exact<{
  filters?: TopicSkillQuestionFilterInput | null | undefined;
}>;


export type TopicSkillQuestionAnalyticsQuery = { topicSkillQuestionAnalytics: { totalCompletedAttempts: number, lowSampleWarning: boolean, topics: Array<{ topicName: string, avgScore: number, passRate: number, sampleCount: number }>, skills: Array<{ skillName: string, avgScore: number, passRate: number, sampleCount: number }>, questions: Array<{ questionId: string, questionText: string, avgScore: number, passRate: number, sampleCount: number }> } };

export type TopicsQueryVariables = Exact<{
  skillId?: string | null | undefined;
  professionId?: string | null | undefined;
}>;


export type TopicsQuery = { topics: Array<{ id: string, code: string, name: string, interviewWeight: number, isCustom: boolean, skill: { id: string, code: string, name: string, isCustom: boolean } | null }> };

export type UpdateAttemptReviewNoteMutationVariables = Exact<{
  input: UpdateAttemptReviewNoteInput;
}>;


export type UpdateAttemptReviewNoteMutation = { updateAttemptReviewNote: { id: string, attemptId: string, body: string, authorId: string, authorName: string, createdAt: number, updatedAt: number } };

export type UpdateCompanySkillMutationVariables = Exact<{
  input: UpdateCompanySkillInput;
}>;


export type UpdateCompanySkillMutation = { updateCompanySkill: { id: string, code: string, name: string, isCustom: boolean } };

export type UpdateCompanyTopicMutationVariables = Exact<{
  input: UpdateCompanyTopicInput;
}>;


export type UpdateCompanyTopicMutation = { updateCompanyTopic: { id: string, code: string, name: string, interviewWeight: number, isCustom: boolean, skill: { id: string, code: string, name: string } | null } };

export type UpdateQuestionMutationVariables = Exact<{
  input: UpdateQuestionInput;
}>;


export type UpdateQuestionMutation = { updateQuestion: { id: string, questionText: string, status: QuestionStatus, isCustom: boolean, isRequired: boolean, companyPriority: number } };

export type UpsertCompanyQuestionOverrideMutationVariables = Exact<{
  input: UpsertCompanyQuestionOverrideInput;
}>;


export type UpsertCompanyQuestionOverrideMutation = { upsertCompanyQuestionOverride: { id: string, sourceQuestionId: string, extraMustConcepts: Array<string> | null, extraFalseClaims: Array<string> | null, topicWeightOverride: number | null, updatedAt: unknown } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const AdaptiveCheckpointReviewByAttemptDocument = new TypedDocumentString(`
    query AdaptiveCheckpointReviewByAttempt($attemptId: ID!) {
  adaptiveCheckpointReviewByAttempt(attemptId: $attemptId) {
    attemptId
    needsManualReview
    redFlags {
      checkpointKey
      checkpointTitle
      summary
      candidateQuote
      severity
    }
    questionGroups {
      interviewQuestionId
      questionText
      idealAnswer
      needsManualReview
      checkpoints {
        checkpointKey
        checkpointTitle
        status
        scoreAwarded
        maxScore
        rationale
        evidenceSummary
        confidence
        needsManualReview
        depthLabel
        coveragePercent
        accuracyPercent
      }
    }
  }
}
    `) as unknown as TypedDocumentString<AdaptiveCheckpointReviewByAttemptQuery, AdaptiveCheckpointReviewByAttemptQueryVariables>;
export const AddCandidateToShortlistDocument = new TypedDocumentString(`
    mutation AddCandidateToShortlist($candidateId: ID!, $reason: String) {
  addCandidateToShortlist(candidateId: $candidateId, reason: $reason) {
    candidateId
    status
    reason
  }
}
    `) as unknown as TypedDocumentString<AddCandidateToShortlistMutation, AddCandidateToShortlistMutationVariables>;
export const AiCostAnalyticsDocument = new TypedDocumentString(`
    query AiCostAnalytics($filters: AiCostFilterInput) {
  aiCostAnalytics(filters: $filters) {
    kpi {
      totalCostUsd
      costPerInterview
      costPerCandidate
      totalRequests
    }
    byModel {
      model
      promptTokens
      completionTokens
      totalCostUsd
    }
    topExpensiveInterviews {
      interviewAttemptId
      interviewTitle
      totalCostUsd
      latencyMs
    }
    elevenLabs {
      kpi {
        totalCostUsd
        totalCharacters
        totalRequests
      }
      byOperation {
        operationType
        characterCount
        totalCostUsd
      }
    }
  }
}
    `) as unknown as TypedDocumentString<AiCostAnalyticsQuery, AiCostAnalyticsQueryVariables>;
export const ApplyPlaybookToInterviewDraftDocument = new TypedDocumentString(`
    mutation ApplyPlaybookToInterviewDraft($playbookId: ID!, $count: Int) {
  applyPlaybookToInterviewDraft(playbookId: $playbookId, count: $count) {
    questionIds
    pinnedQuestionIds
    count
  }
}
    `) as unknown as TypedDocumentString<ApplyPlaybookToInterviewDraftMutation, ApplyPlaybookToInterviewDraftMutationVariables>;
export const ArchiveCompanyQuestionPlaybookDocument = new TypedDocumentString(`
    mutation ArchiveCompanyQuestionPlaybook($id: ID!) {
  archiveCompanyQuestionPlaybook(id: $id)
}
    `) as unknown as TypedDocumentString<ArchiveCompanyQuestionPlaybookMutation, ArchiveCompanyQuestionPlaybookMutationVariables>;
export const ArchiveCompanySkillDocument = new TypedDocumentString(`
    mutation ArchiveCompanySkill($id: ID!) {
  archiveCompanySkill(id: $id) {
    id
    code
    name
    isCustom
  }
}
    `) as unknown as TypedDocumentString<ArchiveCompanySkillMutation, ArchiveCompanySkillMutationVariables>;
export const ArchiveCompanyTopicDocument = new TypedDocumentString(`
    mutation ArchiveCompanyTopic($id: ID!) {
  archiveCompanyTopic(id: $id) {
    id
    code
    name
    interviewWeight
    isCustom
  }
}
    `) as unknown as TypedDocumentString<ArchiveCompanyTopicMutation, ArchiveCompanyTopicMutationVariables>;
export const ArchiveInterviewDocument = new TypedDocumentString(`
    mutation ArchiveInterview($id: ID!) {
  archiveInterview(id: $id) {
    id
    status
    publicUrl
  }
}
    `) as unknown as TypedDocumentString<ArchiveInterviewMutation, ArchiveInterviewMutationVariables>;
export const ArchiveQuestionDocument = new TypedDocumentString(`
    mutation ArchiveQuestion($id: ID!) {
  archiveQuestion(id: $id) {
    id
    isActive
  }
}
    `) as unknown as TypedDocumentString<ArchiveQuestionMutation, ArchiveQuestionMutationVariables>;
export const AttemptReviewDecisionHistoryDocument = new TypedDocumentString(`
    query AttemptReviewDecisionHistory($attemptId: ID!, $filters: AttemptReviewDecisionHistoryFilterInput) {
  attemptReviewDecisionHistory(attemptId: $attemptId, filters: $filters) {
    items {
      eventId
      source
      action
      previousValue
      newValue
      reason
      actorEmail
      actorName
      occurredAt
    }
    total
    page
    pageSize
  }
}
    `) as unknown as TypedDocumentString<AttemptReviewDecisionHistoryQuery, AttemptReviewDecisionHistoryQueryVariables>;
export const AttemptReviewNotesDocument = new TypedDocumentString(`
    query AttemptReviewNotes($attemptId: ID!) {
  attemptReviewNotes(attemptId: $attemptId) {
    id
    attemptId
    body
    authorId
    authorName
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<AttemptReviewNotesQuery, AttemptReviewNotesQueryVariables>;
export const AttemptShareLinkDocument = new TypedDocumentString(`
    query AttemptShareLink($attemptId: ID!) {
  attemptShareLink(attemptId: $attemptId) {
    attemptId
    token
    sharePath
    expiresAt
  }
}
    `) as unknown as TypedDocumentString<AttemptShareLinkQuery, AttemptShareLinkQueryVariables>;
export const BeginInterviewAttemptDocument = new TypedDocumentString(`
    mutation BeginInterviewAttempt($input: BeginInterviewAttemptInput!) {
  beginInterviewAttempt(input: $input) {
    attemptId
    status
    isWelcomePending
    welcomeMessage
    totalQuestions
    answeredQuestions
    currentQuestionText
    currentQuestionId
    messages {
      id
      role
      content
      sequenceOrder
      messageKind
    }
  }
}
    `) as unknown as TypedDocumentString<BeginInterviewAttemptMutation, BeginInterviewAttemptMutationVariables>;
export const CandidateReportDocument = new TypedDocumentString(`
    query CandidateReport($candidateId: ID!) {
  candidateReport(candidateId: $candidateId) {
    candidateId
    fullName
    email
    phone
    linkedinUrl
    githubUrl
    shortlistStatus
    shortlistReason
    latestFinalEvaluation {
      id
      totalScore
      finalScore
      totalWeight
      averageScore
      strengthCategory
      category
      hireRecommendation
      achievedLevel
      achievedLevelMethod
      achievedLevelNote
      targetLevel
      levelBreakdown {
        level
        earned
        maxScore
        ratio
        passed
      }
      summary
      detailedSummary
      strengths
      weaknesses
      risks
      needsManualReview
      categoryBreakdown {
        categoryKey
        categoryLabel
        scoreNormalized
        weight
        contribution
      }
      topicEvaluations {
        topic
        score
        weight
        weightedScore
        strengthCategory
      }
    }
    interviewHistory {
      attemptId
      interviewId
      interviewTitle
      jobRole
      status
      completedAt
      totalScore
    }
  }
}
    `) as unknown as TypedDocumentString<CandidateReportQuery, CandidateReportQueryVariables>;
export const CheckpointResultsByAttemptDocument = new TypedDocumentString(`
    query CheckpointResultsByAttempt($attemptId: ID!) {
  checkpointResultsByAttempt(attemptId: $attemptId) {
    attemptId
    questionGroups {
      interviewQuestionId
      questionText
      needsManualReview
      checkpoints {
        id
        checkpointKey
        checkpointTitle
        status
        scoreAwarded
        maxScore
        evidenceQuote
        reasoningShort
      }
    }
  }
}
    `) as unknown as TypedDocumentString<CheckpointResultsByAttemptQuery, CheckpointResultsByAttemptQueryVariables>;
export const CommitCompanyQuestionImportDocument = new TypedDocumentString(`
    mutation CommitCompanyQuestionImport($input: CommitCompanyQuestionImportInput!) {
  commitCompanyQuestionImport(input: $input) {
    topicsCreated
    topicsUpdated
    skillsCreated
    questionsCreated
    questionsUpdated
  }
}
    `) as unknown as TypedDocumentString<CommitCompanyQuestionImportMutation, CommitCompanyQuestionImportMutationVariables>;
export const CompanyCandidatesDocument = new TypedDocumentString(`
    query CompanyCandidates($filters: CompanyCandidatesFilterInput) {
  companyCandidates(filters: $filters) {
    items {
      candidateId
      fullName
      email
      interviewsCount
      avgScore
      lastInterviewDate
      shortlistStatus
    }
    total
    page
    pageSize
  }
}
    `) as unknown as TypedDocumentString<CompanyCandidatesQuery, CompanyCandidatesQueryVariables>;
export const CompanyDashboardOverviewDocument = new TypedDocumentString(`
    query CompanyDashboardOverview {
  companyDashboardOverview {
    metrics {
      candidatesTotal
      completedTotal
      inProgressTotal
      shortlistedTotal
      abandonedTotal
      needsReviewTotal
      strongInviteTotal
      completionRate
      interviewsTotal
      activeInterviewsTotal
    }
    interviewsTotal
    interviews {
      interviewId
      title
      jobRole
      status
      level
      interviewLanguage
      questionCount
      publicUrl
      createdAt
      attemptsTotal
      attemptsCompleted
      attemptsInProgress
      attemptsAbandoned
      attemptsPending
      completionRate
      shortlistedCount
      strongInviteCount
      needsManualReviewCount
      avgScore
      lastActivityAt
    }
    attentionItems {
      kind
      attemptId
      interviewId
      interviewTitle
      jobRole
      candidateId
      candidateName
      overallScore
      hireRecommendation
      occurredAt
    }
    shortlistTotal
    shortlistPreview {
      candidateId
      fullName
      email
      interviewsCount
      avgScore
      lastInterviewDate
    }
    weakTopics {
      topicName
      avgScore
      passRate
      sampleCount
    }
  }
}
    `) as unknown as TypedDocumentString<CompanyDashboardOverviewQuery, CompanyDashboardOverviewQueryVariables>;
export const CompanyInterviewSummariesDocument = new TypedDocumentString(`
    query CompanyInterviewSummaries($filters: CompanyInterviewSummariesFilterInput) {
  companyInterviewSummaries(filters: $filters) {
    items {
      interviewId
      title
      jobRole
      status
      level
      interviewLanguage
      questionCount
      publicUrl
      createdAt
      attemptsTotal
      attemptsCompleted
      attemptsInProgress
      attemptsAbandoned
      attemptsPending
      completionRate
      shortlistedCount
      strongInviteCount
      needsManualReviewCount
      avgScore
      lastActivityAt
    }
    total
    page
    pageSize
    facets {
      total
      active
      draft
      archived
      withAttempts
    }
  }
}
    `) as unknown as TypedDocumentString<CompanyInterviewSummariesQuery, CompanyInterviewSummariesQueryVariables>;
export const CompanyInterviewTemplatesDocument = new TypedDocumentString(`
    query CompanyInterviewTemplates($filters: CompanyInterviewTemplatesFilterInput) {
  companyInterviewTemplates(filters: $filters) {
    items {
      id
      title
      jobRole
      level
      interviewLanguage
      questionCount
      jobDescription
      professionId
      isVideoEnabled
      interviewerName
      welcomeMessageTemplate
      aiTone
      probingDepth
      scoringStrictness
      maxCompletions
      allowRetake
      timeLimitMinutes
      passingScore
      requirePhone
      requireLinkedin
      requireGithub
      status
      createdAt
      updatedAt
      questions {
        questionId
        sortOrder
      }
    }
    total
    page
    pageSize
  }
}
    `) as unknown as TypedDocumentString<CompanyInterviewTemplatesQuery, CompanyInterviewTemplatesQueryVariables>;
export const CompanyInterviewsDocument = new TypedDocumentString(`
    query CompanyInterviews($filters: CompanyInterviewsFilterInput) {
  companyInterviews(filters: $filters) {
    items {
      attemptId
      interviewId
      interviewTitle
      jobRole
      candidateName
      candidateEmail
      status
      startedAt
      completedAt
      overallScore
    }
    total
    page
    pageSize
  }
}
    `) as unknown as TypedDocumentString<CompanyInterviewsQuery, CompanyInterviewsQueryVariables>;
export const CompanyQuestionOverrideDocument = new TypedDocumentString(`
    query CompanyQuestionOverride($sourceQuestionId: ID!) {
  companyQuestionOverride(sourceQuestionId: $sourceQuestionId) {
    id
    sourceQuestionId
    extraMustConcepts
    extraFalseClaims
    topicWeightOverride
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<CompanyQuestionOverrideQuery, CompanyQuestionOverrideQueryVariables>;
export const CompanyQuestionPlaybooksDocument = new TypedDocumentString(`
    query CompanyQuestionPlaybooks {
  companyQuestionPlaybooks {
    id
    name
    professionId
    level
    skillIds
    isActive
    itemCount
    pinnedCount
    items {
      questionId
      sortOrder
      isPinned
    }
  }
}
    `) as unknown as TypedDocumentString<CompanyQuestionPlaybooksQuery, CompanyQuestionPlaybooksQueryVariables>;
export const CompanyReviewQueueDocument = new TypedDocumentString(`
    query CompanyReviewQueue($filters: CompanyReviewQueueFilterInput) {
  companyReviewQueue(filters: $filters) {
    items {
      attemptId
      candidateId
      candidateName
      candidateEmail
      interviewId
      interviewTitle
      jobRole
      completedAt
      evaluationStatus
      totalScore
      hireRecommendation
      achievedLevel
      achievedLevelMethod
      needsManualReview
      shortlistStatus
    }
    total
    page
    pageSize
  }
}
    `) as unknown as TypedDocumentString<CompanyReviewQueueQuery, CompanyReviewQueueQueryVariables>;
export const CompareInterviewCandidatesDocument = new TypedDocumentString(`
    mutation CompareInterviewCandidates($input: CompareInterviewCandidatesInput!) {
  compareInterviewCandidates(input: $input) {
    recommendedAttemptId
    recommendationTitle
    recommendationSummary
    decisionRationale
    ranking {
      attemptId
      rank
      headline
      tradeOff
    }
    useCases {
      title
      recommendedAttemptId
      rationale
    }
    candidateNotes {
      attemptId
      candidateName
      bestFor
      strengths
      risks
      followUpQuestions
    }
    caveats
  }
}
    `) as unknown as TypedDocumentString<CompareInterviewCandidatesMutation, CompareInterviewCandidatesMutationVariables>;
export const CompleteInterviewAttemptDocument = new TypedDocumentString(`
    mutation CompleteInterviewAttempt($publicToken: String!, $attemptId: ID!) {
  completeInterviewAttempt(publicToken: $publicToken, attemptId: $attemptId) {
    attemptId
    status
    totalQuestions
    answeredQuestions
    messages {
      id
      role
      content
    }
  }
}
    `) as unknown as TypedDocumentString<CompleteInterviewAttemptMutation, CompleteInterviewAttemptMutationVariables>;
export const CreateAttemptReviewNoteDocument = new TypedDocumentString(`
    mutation CreateAttemptReviewNote($input: CreateAttemptReviewNoteInput!) {
  createAttemptReviewNote(input: $input) {
    id
    attemptId
    body
    authorId
    authorName
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<CreateAttemptReviewNoteMutation, CreateAttemptReviewNoteMutationVariables>;
export const CreateAttemptShareLinkDocument = new TypedDocumentString(`
    mutation CreateAttemptShareLink($input: CreateAttemptShareLinkInput!) {
  createAttemptShareLink(input: $input) {
    attemptId
    token
    sharePath
    expiresAt
  }
}
    `) as unknown as TypedDocumentString<CreateAttemptShareLinkMutation, CreateAttemptShareLinkMutationVariables>;
export const CreateCompanyQuestionPlaybookDocument = new TypedDocumentString(`
    mutation CreateCompanyQuestionPlaybook($input: CreateCompanyQuestionPlaybookInput!) {
  createCompanyQuestionPlaybook(input: $input) {
    id
    name
    professionId
    level
    skillIds
    itemCount
    pinnedCount
    items {
      questionId
      sortOrder
      isPinned
    }
  }
}
    `) as unknown as TypedDocumentString<CreateCompanyQuestionPlaybookMutation, CreateCompanyQuestionPlaybookMutationVariables>;
export const CreateCompanySkillDocument = new TypedDocumentString(`
    mutation CreateCompanySkill($input: CreateCompanySkillInput!) {
  createCompanySkill(input: $input) {
    id
    code
    name
    isCustom
  }
}
    `) as unknown as TypedDocumentString<CreateCompanySkillMutation, CreateCompanySkillMutationVariables>;
export const CreateCompanyTopicDocument = new TypedDocumentString(`
    mutation CreateCompanyTopic($input: CreateCompanyTopicInput!) {
  createCompanyTopic(input: $input) {
    id
    code
    name
    interviewWeight
    isCustom
    skill {
      id
      code
      name
    }
  }
}
    `) as unknown as TypedDocumentString<CreateCompanyTopicMutation, CreateCompanyTopicMutationVariables>;
export const CreateInterviewFromTemplateDocument = new TypedDocumentString(`
    mutation CreateInterviewFromTemplate($templateId: ID!) {
  createInterviewFromTemplate(templateId: $templateId) {
    id
    title
    jobRole
    level
    status
    publicToken
    publicUrl
    questionCount
    interviewerName
    welcomeMessageTemplate
  }
}
    `) as unknown as TypedDocumentString<CreateInterviewFromTemplateMutation, CreateInterviewFromTemplateMutationVariables>;
export const CreateInterviewTemplateFromInterviewDocument = new TypedDocumentString(`
    mutation CreateInterviewTemplateFromInterview($interviewId: ID!, $title: String) {
  createInterviewTemplateFromInterview(interviewId: $interviewId, title: $title) {
    id
    title
    jobRole
    level
    interviewLanguage
    questionCount
    jobDescription
    professionId
    isVideoEnabled
    interviewerName
    welcomeMessageTemplate
    aiTone
    probingDepth
    scoringStrictness
    maxCompletions
    allowRetake
    timeLimitMinutes
    passingScore
    requirePhone
    requireLinkedin
    requireGithub
    status
    createdAt
    updatedAt
    questions {
      questionId
      sortOrder
    }
  }
}
    `) as unknown as TypedDocumentString<CreateInterviewTemplateFromInterviewMutation, CreateInterviewTemplateFromInterviewMutationVariables>;
export const CreateInterviewTemplateDocument = new TypedDocumentString(`
    mutation CreateInterviewTemplate($input: CreateInterviewTemplateInput!) {
  createInterviewTemplate(input: $input) {
    id
    title
    jobRole
    level
    interviewLanguage
    questionCount
    jobDescription
    professionId
    isVideoEnabled
    interviewerName
    welcomeMessageTemplate
    aiTone
    probingDepth
    scoringStrictness
    maxCompletions
    allowRetake
    timeLimitMinutes
    passingScore
    requirePhone
    requireLinkedin
    requireGithub
    status
    createdAt
    updatedAt
    questions {
      questionId
      sortOrder
    }
  }
}
    `) as unknown as TypedDocumentString<CreateInterviewTemplateMutation, CreateInterviewTemplateMutationVariables>;
export const CreateInterviewDocument = new TypedDocumentString(`
    mutation CreateInterview($input: CreateInterviewInput!) {
  createInterview(input: $input) {
    id
    title
    jobRole
    level
    status
    publicToken
    publicUrl
    questionCount
    interviewerName
    welcomeMessageTemplate
  }
}
    `) as unknown as TypedDocumentString<CreateInterviewMutation, CreateInterviewMutationVariables>;
export const CreateQuestionDocument = new TypedDocumentString(`
    mutation CreateQuestion($input: CreateQuestionInput!) {
  createQuestion(input: $input) {
    id
    questionText
    status
    isCustom
    isRequired
    companyPriority
  }
}
    `) as unknown as TypedDocumentString<CreateQuestionMutation, CreateQuestionMutationVariables>;
export const DraftInterviewFromJobDescriptionDocument = new TypedDocumentString(`
    mutation DraftInterviewFromJobDescription($input: DraftInterviewFromJobDescriptionInput!) {
  draftInterviewFromJobDescription(input: $input) {
    title
    jobRole
    professionId
    level
    skillIds
    questionIds
    generatedByAi
  }
}
    `) as unknown as TypedDocumentString<DraftInterviewFromJobDescriptionMutation, DraftInterviewFromJobDescriptionMutationVariables>;
export const EvaluateInterviewAttemptDocument = new TypedDocumentString(`
    mutation EvaluateInterviewAttempt($attemptId: ID!) {
  evaluateInterviewAttempt(attemptId: $attemptId) {
    questionCount
    finalEvaluation {
      id
      totalScore
      finalScore
      totalWeight
      averageScore
      strengthCategory
      category
      hireRecommendation
      summary
      needsManualReview
      categoryBreakdown {
        categoryKey
        categoryLabel
        scoreNormalized
        weight
        contribution
      }
      topicEvaluations {
        topic
        score
        weight
        weightedScore
        strengthCategory
      }
    }
  }
}
    `) as unknown as TypedDocumentString<EvaluateInterviewAttemptMutation, EvaluateInterviewAttemptMutationVariables>;
export const FinalEvaluationByAttemptDocument = new TypedDocumentString(`
    query FinalEvaluationByAttempt($attemptId: ID!) {
  finalEvaluationByAttempt(attemptId: $attemptId) {
    id
    interviewAttemptId
    totalScore
    finalScore
    totalWeight
    averageScore
    strengthCategory
    category
    hireRecommendation
    summary
    detailedSummary
    strengths
    weaknesses
    risks
    needsManualReview
    categoryBreakdown {
      categoryKey
      categoryLabel
      scoreNormalized
      weight
      contribution
    }
    topicEvaluations {
      topic
      score
      weight
      weightedScore
      strengthCategory
    }
  }
}
    `) as unknown as TypedDocumentString<FinalEvaluationByAttemptQuery, FinalEvaluationByAttemptQueryVariables>;
export const ForkQuestionDocument = new TypedDocumentString(`
    mutation ForkQuestion($sourceQuestionId: ID!) {
  forkQuestion(sourceQuestionId: $sourceQuestionId) {
    id
    questionText
    status
    isCustom
    sourceQuestionId
  }
}
    `) as unknown as TypedDocumentString<ForkQuestionMutation, ForkQuestionMutationVariables>;
export const HelloDocument = new TypedDocumentString(`
    query Hello {
  hello
}
    `) as unknown as TypedDocumentString<HelloQuery, HelloQueryVariables>;
export const InterviewAttemptsPageDocument = new TypedDocumentString(`
    query InterviewAttemptsPage($interviewId: ID!, $filters: InterviewAttemptsFilterInput) {
  interviewAttemptsPage(interviewId: $interviewId, filters: $filters) {
    total
    page
    pageSize
    items {
      attemptId
      candidateId
      candidateName
      candidateEmail
      status
      completedAt
      overallScore
      hireRecommendation
      evaluationStatus
      achievedLevel
      achievedLevelMethod
      needsManualReview
      shortlistStatus
      reviewStatus
      aiAssessmentVerdict
      companyDecision
      reviewedAt
      hasTeamNotes
    }
  }
}
    `) as unknown as TypedDocumentString<InterviewAttemptsPageQuery, InterviewAttemptsPageQueryVariables>;
export const InterviewDocument = new TypedDocumentString(`
    query Interview($id: ID!) {
  interview(id: $id) {
    id
    title
    jobRole
    status
    publicUrl
    questionCount
  }
}
    `) as unknown as TypedDocumentString<InterviewQuery, InterviewQueryVariables>;
export const InterviewDetailsDocument = new TypedDocumentString(`
    query InterviewDetails($interviewId: ID!) {
  interviewDetails(interviewId: $interviewId) {
    id
    title
    jobRole
    professionName
    level
    status
    questionCount
    publicUrl
    createdAt
    evaluationStatus
    skills
    questions {
      id
      sortOrder
      questionText
      level
      difficulty
      topicName
    }
    primaryFinalEvaluation {
      id
      totalScore
      finalScore
      totalWeight
      averageScore
      strengthCategory
      category
      hireRecommendation
      summary
      strengths
      weaknesses
      risks
      needsManualReview
      categoryBreakdown {
        categoryKey
        categoryLabel
        scoreNormalized
        weight
        contribution
      }
      topicEvaluations {
        topic
        score
        weight
        weightedScore
        strengthCategory
      }
    }
    attempts {
      attemptId
      candidateId
      candidateName
      candidateEmail
      status
      startedAt
      completedAt
      overallScore
      hireRecommendation
      evaluationStatus
      achievedLevel
      achievedLevelMethod
      needsManualReview
      shortlistStatus
      reviewStatus
      aiAssessmentVerdict
      companyDecision
      reviewedAt
      hasTeamNotes
    }
  }
}
    `) as unknown as TypedDocumentString<InterviewDetailsQuery, InterviewDetailsQueryVariables>;
export const InterviewSessionDocument = new TypedDocumentString(`
    query InterviewSession($publicToken: String!, $attemptId: ID!) {
  interviewSession(publicToken: $publicToken, attemptId: $attemptId) {
    attemptId
    status
    totalQuestions
    answeredQuestions
    currentQuestionText
    currentQuestionId
    welcomeMessage
    isWelcomePending
    messages {
      id
      role
      content
      sequenceOrder
      messageKind
      interviewQuestionId
      targetCheckpointKey
    }
  }
}
    `) as unknown as TypedDocumentString<InterviewSessionQuery, InterviewSessionQueryVariables>;
export const InterviewTranscriptDocument = new TypedDocumentString(`
    query InterviewTranscript($attemptId: ID!) {
  interviewTranscript(attemptId: $attemptId) {
    attemptId
    segments {
      messageId
      role
      content
      sequenceOrder
      timestamp
      questionText
      interviewQuestionId
    }
  }
}
    `) as unknown as TypedDocumentString<InterviewTranscriptQuery, InterviewTranscriptQueryVariables>;
export const LoginDocument = new TypedDocumentString(`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    tokenType
    user {
      id
      email
      fullName
      isActive
    }
    company {
      id
      name
      slug
      isActive
    }
  }
}
    `) as unknown as TypedDocumentString<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = new TypedDocumentString(`
    mutation Logout {
  logout {
    success
  }
}
    `) as unknown as TypedDocumentString<LogoutMutation, LogoutMutationVariables>;
export const ManagedInterviewDocument = new TypedDocumentString(`
    query ManagedInterview($id: ID!) {
  interview(id: $id) {
    id
    title
    jobRole
    level
    interviewLanguage
    questionCount
    status
    publicToken
    publicUrl
    isVideoEnabled
    interviewerName
    welcomeMessageTemplate
    aiTone
    probingDepth
    scoringStrictness
    expiresAt
    maxCompletions
    allowRetake
    timeLimitMinutes
    passingScore
    requirePhone
    requireLinkedin
    requireGithub
  }
}
    `) as unknown as TypedDocumentString<ManagedInterviewQuery, ManagedInterviewQueryVariables>;
export const MarkAttemptReviewStartedDocument = new TypedDocumentString(`
    mutation MarkAttemptReviewStarted($attemptId: ID!) {
  markAttemptReviewStarted(attemptId: $attemptId) {
    attemptId
    reviewStatus
    aiAssessmentVerdict
    companyDecision
    reviewedAt
  }
}
    `) as unknown as TypedDocumentString<MarkAttemptReviewStartedMutation, MarkAttemptReviewStartedMutationVariables>;
export const MatchingCandidatesForLevelDocument = new TypedDocumentString(`
    query MatchingCandidatesForLevel($level: QuestionLevel!, $professionId: ID!, $skillIds: [ID!]) {
  matchingCandidatesForLevel(
    level: $level
    professionId: $professionId
    skillIds: $skillIds
  ) {
    candidateId
    fullName
    email
    achievedLevel
    achievedLevelMethod
    sourceInterviewId
    sourceInterviewTitle
    professionId
    professionName
    matchedSkills
    matchedSkillCount
    completedAt
  }
}
    `) as unknown as TypedDocumentString<MatchingCandidatesForLevelQuery, MatchingCandidatesForLevelQueryVariables>;
export const MeDocument = new TypedDocumentString(`
    query Me {
  me {
    user {
      id
      email
      fullName
      isActive
    }
    company {
      id
      name
      slug
      isActive
    }
  }
}
    `) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const PauseInterviewDocument = new TypedDocumentString(`
    mutation PauseInterview($id: ID!) {
  pauseInterview(id: $id) {
    id
    status
    publicUrl
  }
}
    `) as unknown as TypedDocumentString<PauseInterviewMutation, PauseInterviewMutationVariables>;
export const ProfessionsDocument = new TypedDocumentString(`
    query Professions {
  professions {
    id
    code
    name
  }
}
    `) as unknown as TypedDocumentString<ProfessionsQuery, ProfessionsQueryVariables>;
export const PublicInterviewDocument = new TypedDocumentString(`
    query PublicInterview($publicToken: String!) {
  publicInterview(publicToken: $publicToken) {
    title
    jobRole
    questionCount
    interviewLanguage
  }
}
    `) as unknown as TypedDocumentString<PublicInterviewQuery, PublicInterviewQueryVariables>;
export const PublishInterviewDocument = new TypedDocumentString(`
    mutation PublishInterview($id: ID!) {
  publishInterview(id: $id) {
    id
    status
    publicUrl
    publicToken
  }
}
    `) as unknown as TypedDocumentString<PublishInterviewMutation, PublishInterviewMutationVariables>;
export const QuestionBankListDocument = new TypedDocumentString(`
    query QuestionBankList($filters: QuestionBankFilterInput) {
  questionBank(filters: $filters) {
    total
    items {
      id
      questionText
      level
      difficulty
      isActive
      isCustom
      isRequired
      companyPriority
      status
      sourceQuestionId
      topic {
        id
        code
        name
        interviewWeight
        isCustom
        skill {
          id
          code
          name
          isCustom
        }
      }
      profession {
        id
        code
        name
      }
      skills {
        id
        code
        name
        isCustom
      }
    }
  }
}
    `) as unknown as TypedDocumentString<QuestionBankListQuery, QuestionBankListQueryVariables>;
export const QuestionBankDocument = new TypedDocumentString(`
    query QuestionBank($filters: QuestionBankFilterInput) {
  questionBank(filters: $filters) {
    total
    items {
      id
      questionText
      level
      difficulty
      isActive
      isCustom
      isRequired
      companyPriority
      status
      sourceQuestionId
      topic {
        id
        code
        name
        interviewWeight
        isCustom
        skill {
          id
          code
          name
          isCustom
        }
      }
      profession {
        id
        code
        name
      }
      skills {
        id
        code
        name
        isCustom
      }
      checkpoints {
        id
        checkpointKey
        title
        expected
        score
        sortOrder
        evaluationHints {
          mustConcepts
          falseClaims
        }
      }
      answerExamples {
        id
        exampleType
        exampleText
        sortOrder
      }
    }
  }
}
    `) as unknown as TypedDocumentString<QuestionBankQuery, QuestionBankQueryVariables>;
export const QuestionDocument = new TypedDocumentString(`
    query Question($id: ID!) {
  question(id: $id) {
    id
    questionText
    level
    difficulty
    isActive
    isCustom
    isRequired
    companyPriority
    status
    maxScore
    shortAnswer
    idealAnswer
    sourceQuestionId
    topic {
      id
      code
      name
      interviewWeight
      skill {
        id
        code
        name
      }
    }
    profession {
      id
      code
      name
    }
    skills {
      id
      code
      name
    }
    checkpoints {
      id
      checkpointKey
      title
      expected
      score
      sortOrder
      evaluationHints {
        mustConcepts
        falseClaims
      }
    }
    answerExamples {
      id
      exampleType
      exampleText
      sortOrder
    }
  }
}
    `) as unknown as TypedDocumentString<QuestionQuery, QuestionQueryVariables>;
export const RefreshTokensDocument = new TypedDocumentString(`
    mutation RefreshTokens {
  refreshTokens {
    accessToken
    tokenType
  }
}
    `) as unknown as TypedDocumentString<RefreshTokensMutation, RefreshTokensMutationVariables>;
export const RegisterDocument = new TypedDocumentString(`
    mutation Register($input: RegisterInput!) {
  register(input: $input) {
    accessToken
    tokenType
    user {
      id
      email
      fullName
      isActive
    }
    company {
      id
      name
      slug
      isActive
    }
  }
}
    `) as unknown as TypedDocumentString<RegisterMutation, RegisterMutationVariables>;
export const RemoveCandidateFromShortlistDocument = new TypedDocumentString(`
    mutation RemoveCandidateFromShortlist($candidateId: ID!, $reason: String) {
  removeCandidateFromShortlist(candidateId: $candidateId, reason: $reason) {
    candidateId
    status
    reason
  }
}
    `) as unknown as TypedDocumentString<RemoveCandidateFromShortlistMutation, RemoveCandidateFromShortlistMutationVariables>;
export const ResumeInterviewDocument = new TypedDocumentString(`
    mutation ResumeInterview($id: ID!) {
  resumeInterview(id: $id) {
    id
    status
    publicUrl
  }
}
    `) as unknown as TypedDocumentString<ResumeInterviewMutation, ResumeInterviewMutationVariables>;
export const RevokeAttemptShareLinkDocument = new TypedDocumentString(`
    mutation RevokeAttemptShareLink($attemptId: ID!) {
  revokeAttemptShareLink(attemptId: $attemptId)
}
    `) as unknown as TypedDocumentString<RevokeAttemptShareLinkMutation, RevokeAttemptShareLinkMutationVariables>;
export const SetAttemptAiVerdictDocument = new TypedDocumentString(`
    mutation SetAttemptAiVerdict($input: SetAttemptAiVerdictInput!) {
  setAttemptAiVerdict(input: $input) {
    attemptId
    reviewStatus
    aiAssessmentVerdict
    companyDecision
    reviewedAt
  }
}
    `) as unknown as TypedDocumentString<SetAttemptAiVerdictMutation, SetAttemptAiVerdictMutationVariables>;
export const SetAttemptCompanyDecisionDocument = new TypedDocumentString(`
    mutation SetAttemptCompanyDecision($input: SetAttemptCompanyDecisionInput!) {
  setAttemptCompanyDecision(input: $input) {
    attemptId
    reviewStatus
    aiAssessmentVerdict
    companyDecision
    reviewedAt
  }
}
    `) as unknown as TypedDocumentString<SetAttemptCompanyDecisionMutation, SetAttemptCompanyDecisionMutationVariables>;
export const SkillsDocument = new TypedDocumentString(`
    query Skills($professionId: String) {
  skills(professionId: $professionId) {
    id
    code
    name
    isCustom
  }
}
    `) as unknown as TypedDocumentString<SkillsQuery, SkillsQueryVariables>;
export const StartInterviewPreviewDocument = new TypedDocumentString(`
    mutation StartInterviewPreview($interviewId: ID!) {
  startInterviewPreview(interviewId: $interviewId) {
    attemptId
    publicToken
    totalQuestions
  }
}
    `) as unknown as TypedDocumentString<StartInterviewPreviewMutation, StartInterviewPreviewMutationVariables>;
export const StartPublicInterviewDocument = new TypedDocumentString(`
    mutation StartPublicInterview($input: StartPublicInterviewInput!) {
  startPublicInterview(input: $input) {
    attemptId
    currentQuestionText
    totalQuestions
  }
}
    `) as unknown as TypedDocumentString<StartPublicInterviewMutation, StartPublicInterviewMutationVariables>;
export const SubmitInterviewAnswerDocument = new TypedDocumentString(`
    mutation SubmitInterviewAnswer($input: SubmitInterviewAnswerInput!) {
  submitInterviewAnswer(input: $input) {
    status
    nextQuestionText
    pendingMessageText
    answeredQuestions
    totalQuestions
    answeredMainQuestions
    totalMainQuestions
    messageKind
    currentInterviewQuestionId
    isFollowUp
    currentQuestionFollowUpCount
  }
}
    `) as unknown as TypedDocumentString<SubmitInterviewAnswerMutation, SubmitInterviewAnswerMutationVariables>;
export const SuggestInterviewQuestionsDocument = new TypedDocumentString(`
    mutation SuggestInterviewQuestions($input: SuggestInterviewQuestionsInput!) {
  suggestInterviewQuestions(input: $input) {
    count
    candidateCount
    generatedByAi
    questionIds
    questions {
      id
      isCustom
      isRequired
      companyPriority
      status
    }
  }
}
    `) as unknown as TypedDocumentString<SuggestInterviewQuestionsMutation, SuggestInterviewQuestionsMutationVariables>;
export const TopicSkillQuestionAnalyticsDocument = new TypedDocumentString(`
    query TopicSkillQuestionAnalytics($filters: TopicSkillQuestionFilterInput) {
  topicSkillQuestionAnalytics(filters: $filters) {
    totalCompletedAttempts
    lowSampleWarning
    topics {
      topicName
      avgScore
      passRate
      sampleCount
    }
    skills {
      skillName
      avgScore
      passRate
      sampleCount
    }
    questions {
      questionId
      questionText
      avgScore
      passRate
      sampleCount
    }
  }
}
    `) as unknown as TypedDocumentString<TopicSkillQuestionAnalyticsQuery, TopicSkillQuestionAnalyticsQueryVariables>;
export const TopicsDocument = new TypedDocumentString(`
    query Topics($skillId: String, $professionId: String) {
  topics(skillId: $skillId, professionId: $professionId) {
    id
    code
    name
    interviewWeight
    isCustom
    skill {
      id
      code
      name
      isCustom
    }
  }
}
    `) as unknown as TypedDocumentString<TopicsQuery, TopicsQueryVariables>;
export const UpdateAttemptReviewNoteDocument = new TypedDocumentString(`
    mutation UpdateAttemptReviewNote($input: UpdateAttemptReviewNoteInput!) {
  updateAttemptReviewNote(input: $input) {
    id
    attemptId
    body
    authorId
    authorName
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<UpdateAttemptReviewNoteMutation, UpdateAttemptReviewNoteMutationVariables>;
export const UpdateCompanySkillDocument = new TypedDocumentString(`
    mutation UpdateCompanySkill($input: UpdateCompanySkillInput!) {
  updateCompanySkill(input: $input) {
    id
    code
    name
    isCustom
  }
}
    `) as unknown as TypedDocumentString<UpdateCompanySkillMutation, UpdateCompanySkillMutationVariables>;
export const UpdateCompanyTopicDocument = new TypedDocumentString(`
    mutation UpdateCompanyTopic($input: UpdateCompanyTopicInput!) {
  updateCompanyTopic(input: $input) {
    id
    code
    name
    interviewWeight
    isCustom
    skill {
      id
      code
      name
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateCompanyTopicMutation, UpdateCompanyTopicMutationVariables>;
export const UpdateQuestionDocument = new TypedDocumentString(`
    mutation UpdateQuestion($input: UpdateQuestionInput!) {
  updateQuestion(input: $input) {
    id
    questionText
    status
    isCustom
    isRequired
    companyPriority
  }
}
    `) as unknown as TypedDocumentString<UpdateQuestionMutation, UpdateQuestionMutationVariables>;
export const UpsertCompanyQuestionOverrideDocument = new TypedDocumentString(`
    mutation UpsertCompanyQuestionOverride($input: UpsertCompanyQuestionOverrideInput!) {
  upsertCompanyQuestionOverride(input: $input) {
    id
    sourceQuestionId
    extraMustConcepts
    extraFalseClaims
    topicWeightOverride
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<UpsertCompanyQuestionOverrideMutation, UpsertCompanyQuestionOverrideMutationVariables>;