/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AiCostFilterInput = {
  dateFrom?: string | null | undefined;
  dateTo?: string | null | undefined;
  model?: string | null | undefined;
  provider?: string | null | undefined;
};

export type AnswerExampleType =
  | 'bad'
  | 'good';

export type AttemptStatus =
  | 'abandoned'
  | 'completed'
  | 'in_progress'
  | 'pending';

export type BeginInterviewAttemptInput = {
  attemptId: string;
  publicToken: string;
};

export type CheckpointMatchStatus =
  | 'met'
  | 'not_met'
  | 'partially_met';

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

export type CreateInterviewInput = {
  interviewLanguage?: string | null | undefined;
  interviewerName?: string | null | undefined;
  isVideoEnabled?: boolean | null | undefined;
  jobDescription?: string | null | undefined;
  jobRole: string;
  level: QuestionLevel;
  professionId?: string | null | undefined;
  questionCount?: number | null | undefined;
  questionIds: Array<string>;
  title: string;
  welcomeMessageTemplate?: string | null | undefined;
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

export type InterviewMessageKind =
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
  | 'draft';

export type InterviewStrengthCategory =
  | 'medium'
  | 'strong'
  | 'weak';

export type LoginInput = {
  email: string;
  password: string;
};

export type MessageRole =
  | 'ai'
  | 'candidate';

export type QuestionBankFilterInput = {
  difficulty?: QuestionDifficulty | null | undefined;
  level?: QuestionLevel | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  professionId?: string | null | undefined;
  search?: string | null | undefined;
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

export type RegisterInput = {
  companyName: string;
  email: string;
  fullName: string;
  password: string;
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

export type TopicSkillQuestionFilterInput = {
  dateFrom?: string | null | undefined;
  dateTo?: string | null | undefined;
  jobRole?: string | null | undefined;
  level?: QuestionLevel | null | undefined;
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

export type BeginInterviewAttemptMutationVariables = Exact<{
  input: BeginInterviewAttemptInput;
}>;


export type BeginInterviewAttemptMutation = { beginInterviewAttempt: { attemptId: string, status: AttemptStatus, isWelcomePending: boolean, welcomeMessage: string | null, totalQuestions: number, answeredQuestions: number, currentQuestionText: string | null, currentQuestionId: string | null, messages: Array<{ id: string, role: MessageRole, content: string, sequenceOrder: number, messageKind: InterviewMessageKind | null }> } };

export type CandidateReportQueryVariables = Exact<{
  candidateId: string | number;
}>;


export type CandidateReportQuery = { candidateReport: { candidateId: string, fullName: string, email: string, phone: string | null, linkedinUrl: string | null, githubUrl: string | null, shortlistStatus: string, shortlistReason: string | null, latestFinalEvaluation: { id: string, totalScore: number, finalScore: number, totalWeight: number, averageScore: number | null, strengthCategory: InterviewStrengthCategory, category: FinalEvaluationCategory, hireRecommendation: HireRecommendation, summary: string, detailedSummary: string | null, strengths: Array<string>, weaknesses: Array<string>, risks: Array<string>, needsManualReview: boolean, categoryBreakdown: Array<{ categoryKey: string, categoryLabel: string, scoreNormalized: number, weight: number, contribution: number }>, topicEvaluations: Array<{ topic: string, score: number, weight: number, weightedScore: number, strengthCategory: InterviewStrengthCategory }> } | null, interviewHistory: Array<{ attemptId: string, interviewId: string, interviewTitle: string, jobRole: string, status: AttemptStatus, completedAt: number | null, totalScore: number | null }> } };

export type CheckpointResultsByAttemptQueryVariables = Exact<{
  attemptId: string | number;
}>;


export type CheckpointResultsByAttemptQuery = { checkpointResultsByAttempt: { attemptId: string, questionGroups: Array<{ interviewQuestionId: string, questionText: string, needsManualReview: boolean, checkpoints: Array<{ id: string, checkpointKey: string, checkpointTitle: string, status: CheckpointMatchStatus, scoreAwarded: number, maxScore: number, evidenceQuote: string | null, reasoningShort: string | null }> }> } };

export type CompanyCandidatesQueryVariables = Exact<{
  filters?: CompanyCandidatesFilterInput | null | undefined;
}>;


export type CompanyCandidatesQuery = { companyCandidates: { total: number, page: number, pageSize: number, items: Array<{ candidateId: string, fullName: string, email: string, interviewsCount: number, avgScore: number | null, lastInterviewDate: number | null, shortlistStatus: string }> } };

export type CompanyInterviewsQueryVariables = Exact<{
  filters?: CompanyInterviewsFilterInput | null | undefined;
}>;


export type CompanyInterviewsQuery = { companyInterviews: { total: number, page: number, pageSize: number, items: Array<{ attemptId: string, interviewId: string, interviewTitle: string, jobRole: string, candidateName: string, candidateEmail: string, status: AttemptStatus, startedAt: number | null, completedAt: number | null, overallScore: number | null }> } };

export type CompleteInterviewAttemptMutationVariables = Exact<{
  publicToken: string;
  attemptId: string | number;
}>;


export type CompleteInterviewAttemptMutation = { completeInterviewAttempt: { attemptId: string, status: AttemptStatus, totalQuestions: number, answeredQuestions: number, messages: Array<{ id: string, role: MessageRole, content: string }> } };

export type CreateInterviewMutationVariables = Exact<{
  input: CreateInterviewInput;
}>;


export type CreateInterviewMutation = { createInterview: { id: string, title: string, jobRole: string, level: QuestionLevel, status: InterviewStatus, publicToken: string, publicUrl: string, questionCount: number, interviewerName: string | null, welcomeMessageTemplate: string | null } };

export type EvaluateInterviewAttemptMutationVariables = Exact<{
  attemptId: string | number;
}>;


export type EvaluateInterviewAttemptMutation = { evaluateInterviewAttempt: { questionCount: number, finalEvaluation: { id: string, totalScore: number, finalScore: number, totalWeight: number, averageScore: number | null, strengthCategory: InterviewStrengthCategory, category: FinalEvaluationCategory, hireRecommendation: HireRecommendation, summary: string, needsManualReview: boolean, categoryBreakdown: Array<{ categoryKey: string, categoryLabel: string, scoreNormalized: number, weight: number, contribution: number }>, topicEvaluations: Array<{ topic: string, score: number, weight: number, weightedScore: number, strengthCategory: InterviewStrengthCategory }> } } };

export type FinalEvaluationByAttemptQueryVariables = Exact<{
  attemptId: string | number;
}>;


export type FinalEvaluationByAttemptQuery = { finalEvaluationByAttempt: { id: string, interviewAttemptId: string, totalScore: number, finalScore: number, totalWeight: number, averageScore: number | null, strengthCategory: InterviewStrengthCategory, category: FinalEvaluationCategory, hireRecommendation: HireRecommendation, summary: string, detailedSummary: string | null, strengths: Array<string>, weaknesses: Array<string>, risks: Array<string>, needsManualReview: boolean, categoryBreakdown: Array<{ categoryKey: string, categoryLabel: string, scoreNormalized: number, weight: number, contribution: number }>, topicEvaluations: Array<{ topic: string, score: number, weight: number, weightedScore: number, strengthCategory: InterviewStrengthCategory }> } | null };

export type HelloQueryVariables = Exact<{ [key: string]: never; }>;


export type HelloQuery = { hello: string };

export type InterviewQueryVariables = Exact<{
  id: string | number;
}>;


export type InterviewQuery = { interview: { id: string, title: string, jobRole: string, status: InterviewStatus, publicUrl: string, questionCount: number } };

export type InterviewDetailsQueryVariables = Exact<{
  interviewId: string | number;
}>;


export type InterviewDetailsQuery = { interviewDetails: { id: string, title: string, jobRole: string, status: InterviewStatus, questionCount: number, publicUrl: string, createdAt: number, evaluationStatus: string, primaryFinalEvaluation: { id: string, totalScore: number, finalScore: number, totalWeight: number, averageScore: number | null, strengthCategory: InterviewStrengthCategory, category: FinalEvaluationCategory, hireRecommendation: HireRecommendation, summary: string, strengths: Array<string>, weaknesses: Array<string>, risks: Array<string>, needsManualReview: boolean, categoryBreakdown: Array<{ categoryKey: string, categoryLabel: string, scoreNormalized: number, weight: number, contribution: number }>, topicEvaluations: Array<{ topic: string, score: number, weight: number, weightedScore: number, strengthCategory: InterviewStrengthCategory }> } | null, attempts: Array<{ attemptId: string, candidateId: string, candidateName: string, candidateEmail: string, status: AttemptStatus, startedAt: number | null, completedAt: number | null, overallScore: number | null, hireRecommendation: HireRecommendation | null, evaluationStatus: string }> } };

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

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { user: { id: string, email: string, fullName: string, isActive: boolean }, company: { id: string, name: string, slug: string, isActive: boolean } } };

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


export type QuestionBankListQuery = { questionBank: { total: number, items: Array<{ id: string, questionText: string, level: QuestionLevel, difficulty: QuestionDifficulty, maxScore: number, isActive: boolean, topic: { id: string, code: string, name: string, interviewWeight: number, skill: { id: string, code: string, name: string } | null }, profession: { id: string, code: string, name: string } }> } };

export type QuestionBankQueryVariables = Exact<{
  filters?: QuestionBankFilterInput | null | undefined;
}>;


export type QuestionBankQuery = { questionBank: { total: number, items: Array<{ id: string, questionText: string, level: QuestionLevel, difficulty: QuestionDifficulty, maxScore: number, isActive: boolean, topic: { id: string, code: string, name: string, interviewWeight: number, skill: { id: string, code: string, name: string } | null }, profession: { id: string, code: string, name: string }, skills: Array<{ id: string, code: string, name: string }>, checkpoints: Array<{ id: string, checkpointKey: string, title: string, expected: string, score: number, sortOrder: number }>, answerExamples: Array<{ id: string, exampleType: AnswerExampleType, exampleText: string, sortOrder: number }> }> } };

export type QuestionQueryVariables = Exact<{
  id: string | number;
}>;


export type QuestionQuery = { question: { id: string, questionText: string, level: QuestionLevel, difficulty: QuestionDifficulty, maxScore: number, isActive: boolean, shortAnswer: string, idealAnswer: string, topic: { id: string, code: string, name: string, interviewWeight: number }, profession: { id: string, code: string, name: string }, checkpoints: Array<{ id: string, checkpointKey: string, title: string, expected: string, score: number, sortOrder: number }>, answerExamples: Array<{ id: string, exampleType: AnswerExampleType, exampleText: string, sortOrder: number }> } };

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

export type StartPublicInterviewMutationVariables = Exact<{
  input: StartPublicInterviewInput;
}>;


export type StartPublicInterviewMutation = { startPublicInterview: { attemptId: string, currentQuestionText: string | null, totalQuestions: number } };

export type SubmitInterviewAnswerMutationVariables = Exact<{
  input: SubmitInterviewAnswerInput;
}>;


export type SubmitInterviewAnswerMutation = { submitInterviewAnswer: { status: AttemptStatus, nextQuestionText: string | null, pendingMessageText: string | null, answeredQuestions: number, totalQuestions: number, answeredMainQuestions: number, totalMainQuestions: number, messageKind: InterviewMessageKind | null, currentInterviewQuestionId: string | null, isFollowUp: boolean, currentQuestionFollowUpCount: number } };

export type TopicSkillQuestionAnalyticsQueryVariables = Exact<{
  filters?: TopicSkillQuestionFilterInput | null | undefined;
}>;


export type TopicSkillQuestionAnalyticsQuery = { topicSkillQuestionAnalytics: { totalCompletedAttempts: number, lowSampleWarning: boolean, topics: Array<{ topicName: string, avgScore: number, passRate: number, sampleCount: number }>, skills: Array<{ skillName: string, avgScore: number, passRate: number, sampleCount: number }>, questions: Array<{ questionId: string, questionText: string, avgScore: number, passRate: number, sampleCount: number }> } };

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
export const HelloDocument = new TypedDocumentString(`
    query Hello {
  hello
}
    `) as unknown as TypedDocumentString<HelloQuery, HelloQueryVariables>;
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
    status
    questionCount
    publicUrl
    createdAt
    evaluationStatus
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
      maxScore
      isActive
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
      maxScore
      isActive
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
    maxScore
    isActive
    shortAnswer
    idealAnswer
    topic {
      id
      code
      name
      interviewWeight
    }
    profession {
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