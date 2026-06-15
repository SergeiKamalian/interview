/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation AddCandidateToShortlist($candidateId: ID!, $reason: String) {\n  addCandidateToShortlist(candidateId: $candidateId, reason: $reason) {\n    candidateId\n    status\n    reason\n  }\n}": typeof types.AddCandidateToShortlistDocument,
    "query AiCostAnalytics($filters: AiCostFilterInput) {\n  aiCostAnalytics(filters: $filters) {\n    kpi {\n      totalCostUsd\n      costPerInterview\n      costPerCandidate\n      totalRequests\n    }\n    byModel {\n      model\n      promptTokens\n      completionTokens\n      totalCostUsd\n    }\n    topExpensiveInterviews {\n      interviewAttemptId\n      interviewTitle\n      totalCostUsd\n      latencyMs\n    }\n  }\n}": typeof types.AiCostAnalyticsDocument,
    "query CandidateReport($candidateId: ID!) {\n  candidateReport(candidateId: $candidateId) {\n    candidateId\n    fullName\n    email\n    phone\n    linkedinUrl\n    githubUrl\n    shortlistStatus\n    shortlistReason\n    latestFinalEvaluation {\n      id\n      totalScore\n      category\n      hireRecommendation\n      summary\n      detailedSummary\n      strengths\n      weaknesses\n      risks\n      needsManualReview\n      categoryBreakdown {\n        categoryKey\n        categoryLabel\n        scoreNormalized\n        weight\n        contribution\n      }\n    }\n    interviewHistory {\n      attemptId\n      interviewId\n      interviewTitle\n      jobRole\n      status\n      completedAt\n      totalScore\n    }\n  }\n}": typeof types.CandidateReportDocument,
    "query CheckpointResultsByAttempt($attemptId: ID!) {\n  checkpointResultsByAttempt(attemptId: $attemptId) {\n    attemptId\n    questionGroups {\n      interviewQuestionId\n      questionText\n      needsManualReview\n      checkpoints {\n        id\n        checkpointKey\n        checkpointTitle\n        status\n        scoreAwarded\n        maxScore\n        evidenceQuote\n        reasoningShort\n      }\n    }\n  }\n}": typeof types.CheckpointResultsByAttemptDocument,
    "query CompanyCandidates($filters: CompanyCandidatesFilterInput) {\n  companyCandidates(filters: $filters) {\n    items {\n      candidateId\n      fullName\n      email\n      interviewsCount\n      avgScore\n      lastInterviewDate\n      shortlistStatus\n    }\n    total\n    page\n    pageSize\n  }\n}": typeof types.CompanyCandidatesDocument,
    "query CompanyInterviews($filters: CompanyInterviewsFilterInput) {\n  companyInterviews(filters: $filters) {\n    items {\n      attemptId\n      interviewId\n      interviewTitle\n      jobRole\n      candidateName\n      candidateEmail\n      status\n      startedAt\n      completedAt\n      overallScore\n    }\n    total\n    page\n    pageSize\n  }\n}": typeof types.CompanyInterviewsDocument,
    "mutation CompleteInterviewAttempt($publicToken: String!, $attemptId: ID!) {\n  completeInterviewAttempt(publicToken: $publicToken, attemptId: $attemptId) {\n    attemptId\n    status\n    totalQuestions\n    answeredQuestions\n    messages {\n      id\n      role\n      content\n    }\n  }\n}": typeof types.CompleteInterviewAttemptDocument,
    "mutation CreateInterview($input: CreateInterviewInput!) {\n  createInterview(input: $input) {\n    id\n    title\n    jobRole\n    level\n    status\n    publicToken\n    publicUrl\n    questionCount\n  }\n}": typeof types.CreateInterviewDocument,
    "mutation EvaluateInterviewAttempt($attemptId: ID!) {\n  evaluateInterviewAttempt(attemptId: $attemptId) {\n    questionCount\n    finalEvaluation {\n      id\n      totalScore\n      category\n      hireRecommendation\n      summary\n      needsManualReview\n      categoryBreakdown {\n        categoryKey\n        categoryLabel\n        scoreNormalized\n        weight\n        contribution\n      }\n    }\n  }\n}": typeof types.EvaluateInterviewAttemptDocument,
    "query FinalEvaluationByAttempt($attemptId: ID!) {\n  finalEvaluationByAttempt(attemptId: $attemptId) {\n    id\n    interviewAttemptId\n    totalScore\n    category\n    hireRecommendation\n    summary\n    detailedSummary\n    strengths\n    weaknesses\n    risks\n    needsManualReview\n    categoryBreakdown {\n      categoryKey\n      categoryLabel\n      scoreNormalized\n      weight\n      contribution\n    }\n  }\n}": typeof types.FinalEvaluationByAttemptDocument,
    "query Hello {\n  hello\n}": typeof types.HelloDocument,
    "query Interview($id: ID!) {\n  interview(id: $id) {\n    id\n    title\n    jobRole\n    status\n    publicUrl\n    questionCount\n  }\n}": typeof types.InterviewDocument,
    "query InterviewDetails($interviewId: ID!) {\n  interviewDetails(interviewId: $interviewId) {\n    id\n    title\n    jobRole\n    status\n    questionCount\n    publicUrl\n    createdAt\n    evaluationStatus\n    primaryFinalEvaluation {\n      id\n      totalScore\n      category\n      hireRecommendation\n      summary\n      strengths\n      weaknesses\n      risks\n      needsManualReview\n      categoryBreakdown {\n        categoryKey\n        categoryLabel\n        scoreNormalized\n        weight\n        contribution\n      }\n    }\n    attempts {\n      attemptId\n      candidateId\n      candidateName\n      candidateEmail\n      status\n      startedAt\n      completedAt\n      overallScore\n      hireRecommendation\n      evaluationStatus\n    }\n  }\n}": typeof types.InterviewDetailsDocument,
    "query InterviewSession($publicToken: String!, $attemptId: ID!) {\n  interviewSession(publicToken: $publicToken, attemptId: $attemptId) {\n    attemptId\n    status\n    totalQuestions\n    answeredQuestions\n    currentQuestionText\n    currentQuestionId\n    messages {\n      id\n      role\n      content\n      sequenceOrder\n    }\n  }\n}": typeof types.InterviewSessionDocument,
    "query InterviewTranscript($attemptId: ID!) {\n  interviewTranscript(attemptId: $attemptId) {\n    attemptId\n    segments {\n      messageId\n      role\n      content\n      sequenceOrder\n      timestamp\n      questionText\n      interviewQuestionId\n    }\n  }\n}": typeof types.InterviewTranscriptDocument,
    "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    tokenType\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}": typeof types.LoginDocument,
    "mutation Logout {\n  logout {\n    success\n  }\n}": typeof types.LogoutDocument,
    "query Me {\n  me {\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}": typeof types.MeDocument,
    "query PublicInterview($publicToken: String!) {\n  publicInterview(publicToken: $publicToken) {\n    title\n    jobRole\n    questionCount\n    interviewLanguage\n  }\n}": typeof types.PublicInterviewDocument,
    "mutation PublishInterview($id: ID!) {\n  publishInterview(id: $id) {\n    id\n    status\n    publicUrl\n    publicToken\n  }\n}": typeof types.PublishInterviewDocument,
    "query QuestionBank($filters: QuestionBankFilterInput) {\n  questionBank(filters: $filters) {\n    total\n    items {\n      id\n      questionText\n      level\n      difficulty\n      maxScore\n      isActive\n      topic {\n        id\n        code\n        name\n      }\n      profession {\n        id\n        code\n        name\n      }\n      skills {\n        id\n        code\n        name\n      }\n      checkpoints {\n        id\n        checkpointKey\n        title\n        expected\n        score\n        sortOrder\n      }\n      answerExamples {\n        id\n        exampleType\n        exampleText\n        sortOrder\n      }\n    }\n  }\n}\n\nquery Question($id: ID!) {\n  question(id: $id) {\n    id\n    questionText\n    level\n    difficulty\n    maxScore\n    isActive\n    shortAnswer\n    idealAnswer\n    topic {\n      name\n    }\n    profession {\n      name\n    }\n    checkpoints {\n      title\n      score\n      sortOrder\n    }\n    answerExamples {\n      exampleType\n      exampleText\n    }\n  }\n}": typeof types.QuestionBankDocument,
    "mutation RefreshTokens {\n  refreshTokens {\n    accessToken\n    tokenType\n  }\n}": typeof types.RefreshTokensDocument,
    "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    accessToken\n    tokenType\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}": typeof types.RegisterDocument,
    "mutation RemoveCandidateFromShortlist($candidateId: ID!, $reason: String) {\n  removeCandidateFromShortlist(candidateId: $candidateId, reason: $reason) {\n    candidateId\n    status\n    reason\n  }\n}": typeof types.RemoveCandidateFromShortlistDocument,
    "mutation StartPublicInterview($input: StartPublicInterviewInput!) {\n  startPublicInterview(input: $input) {\n    attemptId\n    currentQuestionText\n    totalQuestions\n  }\n}": typeof types.StartPublicInterviewDocument,
    "mutation SubmitInterviewAnswer($input: SubmitInterviewAnswerInput!) {\n  submitInterviewAnswer(input: $input) {\n    status\n    nextQuestionText\n    answeredQuestions\n    totalQuestions\n  }\n}": typeof types.SubmitInterviewAnswerDocument,
    "query TopicSkillQuestionAnalytics($filters: TopicSkillQuestionFilterInput) {\n  topicSkillQuestionAnalytics(filters: $filters) {\n    totalCompletedAttempts\n    lowSampleWarning\n    topics {\n      topicName\n      avgScore\n      passRate\n      sampleCount\n    }\n    skills {\n      skillName\n      avgScore\n      passRate\n      sampleCount\n    }\n    questions {\n      questionId\n      questionText\n      avgScore\n      passRate\n      sampleCount\n    }\n  }\n}": typeof types.TopicSkillQuestionAnalyticsDocument,
};
const documents: Documents = {
    "mutation AddCandidateToShortlist($candidateId: ID!, $reason: String) {\n  addCandidateToShortlist(candidateId: $candidateId, reason: $reason) {\n    candidateId\n    status\n    reason\n  }\n}": types.AddCandidateToShortlistDocument,
    "query AiCostAnalytics($filters: AiCostFilterInput) {\n  aiCostAnalytics(filters: $filters) {\n    kpi {\n      totalCostUsd\n      costPerInterview\n      costPerCandidate\n      totalRequests\n    }\n    byModel {\n      model\n      promptTokens\n      completionTokens\n      totalCostUsd\n    }\n    topExpensiveInterviews {\n      interviewAttemptId\n      interviewTitle\n      totalCostUsd\n      latencyMs\n    }\n  }\n}": types.AiCostAnalyticsDocument,
    "query CandidateReport($candidateId: ID!) {\n  candidateReport(candidateId: $candidateId) {\n    candidateId\n    fullName\n    email\n    phone\n    linkedinUrl\n    githubUrl\n    shortlistStatus\n    shortlistReason\n    latestFinalEvaluation {\n      id\n      totalScore\n      category\n      hireRecommendation\n      summary\n      detailedSummary\n      strengths\n      weaknesses\n      risks\n      needsManualReview\n      categoryBreakdown {\n        categoryKey\n        categoryLabel\n        scoreNormalized\n        weight\n        contribution\n      }\n    }\n    interviewHistory {\n      attemptId\n      interviewId\n      interviewTitle\n      jobRole\n      status\n      completedAt\n      totalScore\n    }\n  }\n}": types.CandidateReportDocument,
    "query CheckpointResultsByAttempt($attemptId: ID!) {\n  checkpointResultsByAttempt(attemptId: $attemptId) {\n    attemptId\n    questionGroups {\n      interviewQuestionId\n      questionText\n      needsManualReview\n      checkpoints {\n        id\n        checkpointKey\n        checkpointTitle\n        status\n        scoreAwarded\n        maxScore\n        evidenceQuote\n        reasoningShort\n      }\n    }\n  }\n}": types.CheckpointResultsByAttemptDocument,
    "query CompanyCandidates($filters: CompanyCandidatesFilterInput) {\n  companyCandidates(filters: $filters) {\n    items {\n      candidateId\n      fullName\n      email\n      interviewsCount\n      avgScore\n      lastInterviewDate\n      shortlistStatus\n    }\n    total\n    page\n    pageSize\n  }\n}": types.CompanyCandidatesDocument,
    "query CompanyInterviews($filters: CompanyInterviewsFilterInput) {\n  companyInterviews(filters: $filters) {\n    items {\n      attemptId\n      interviewId\n      interviewTitle\n      jobRole\n      candidateName\n      candidateEmail\n      status\n      startedAt\n      completedAt\n      overallScore\n    }\n    total\n    page\n    pageSize\n  }\n}": types.CompanyInterviewsDocument,
    "mutation CompleteInterviewAttempt($publicToken: String!, $attemptId: ID!) {\n  completeInterviewAttempt(publicToken: $publicToken, attemptId: $attemptId) {\n    attemptId\n    status\n    totalQuestions\n    answeredQuestions\n    messages {\n      id\n      role\n      content\n    }\n  }\n}": types.CompleteInterviewAttemptDocument,
    "mutation CreateInterview($input: CreateInterviewInput!) {\n  createInterview(input: $input) {\n    id\n    title\n    jobRole\n    level\n    status\n    publicToken\n    publicUrl\n    questionCount\n  }\n}": types.CreateInterviewDocument,
    "mutation EvaluateInterviewAttempt($attemptId: ID!) {\n  evaluateInterviewAttempt(attemptId: $attemptId) {\n    questionCount\n    finalEvaluation {\n      id\n      totalScore\n      category\n      hireRecommendation\n      summary\n      needsManualReview\n      categoryBreakdown {\n        categoryKey\n        categoryLabel\n        scoreNormalized\n        weight\n        contribution\n      }\n    }\n  }\n}": types.EvaluateInterviewAttemptDocument,
    "query FinalEvaluationByAttempt($attemptId: ID!) {\n  finalEvaluationByAttempt(attemptId: $attemptId) {\n    id\n    interviewAttemptId\n    totalScore\n    category\n    hireRecommendation\n    summary\n    detailedSummary\n    strengths\n    weaknesses\n    risks\n    needsManualReview\n    categoryBreakdown {\n      categoryKey\n      categoryLabel\n      scoreNormalized\n      weight\n      contribution\n    }\n  }\n}": types.FinalEvaluationByAttemptDocument,
    "query Hello {\n  hello\n}": types.HelloDocument,
    "query Interview($id: ID!) {\n  interview(id: $id) {\n    id\n    title\n    jobRole\n    status\n    publicUrl\n    questionCount\n  }\n}": types.InterviewDocument,
    "query InterviewDetails($interviewId: ID!) {\n  interviewDetails(interviewId: $interviewId) {\n    id\n    title\n    jobRole\n    status\n    questionCount\n    publicUrl\n    createdAt\n    evaluationStatus\n    primaryFinalEvaluation {\n      id\n      totalScore\n      category\n      hireRecommendation\n      summary\n      strengths\n      weaknesses\n      risks\n      needsManualReview\n      categoryBreakdown {\n        categoryKey\n        categoryLabel\n        scoreNormalized\n        weight\n        contribution\n      }\n    }\n    attempts {\n      attemptId\n      candidateId\n      candidateName\n      candidateEmail\n      status\n      startedAt\n      completedAt\n      overallScore\n      hireRecommendation\n      evaluationStatus\n    }\n  }\n}": types.InterviewDetailsDocument,
    "query InterviewSession($publicToken: String!, $attemptId: ID!) {\n  interviewSession(publicToken: $publicToken, attemptId: $attemptId) {\n    attemptId\n    status\n    totalQuestions\n    answeredQuestions\n    currentQuestionText\n    currentQuestionId\n    messages {\n      id\n      role\n      content\n      sequenceOrder\n    }\n  }\n}": types.InterviewSessionDocument,
    "query InterviewTranscript($attemptId: ID!) {\n  interviewTranscript(attemptId: $attemptId) {\n    attemptId\n    segments {\n      messageId\n      role\n      content\n      sequenceOrder\n      timestamp\n      questionText\n      interviewQuestionId\n    }\n  }\n}": types.InterviewTranscriptDocument,
    "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    tokenType\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}": types.LoginDocument,
    "mutation Logout {\n  logout {\n    success\n  }\n}": types.LogoutDocument,
    "query Me {\n  me {\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}": types.MeDocument,
    "query PublicInterview($publicToken: String!) {\n  publicInterview(publicToken: $publicToken) {\n    title\n    jobRole\n    questionCount\n    interviewLanguage\n  }\n}": types.PublicInterviewDocument,
    "mutation PublishInterview($id: ID!) {\n  publishInterview(id: $id) {\n    id\n    status\n    publicUrl\n    publicToken\n  }\n}": types.PublishInterviewDocument,
    "query QuestionBank($filters: QuestionBankFilterInput) {\n  questionBank(filters: $filters) {\n    total\n    items {\n      id\n      questionText\n      level\n      difficulty\n      maxScore\n      isActive\n      topic {\n        id\n        code\n        name\n      }\n      profession {\n        id\n        code\n        name\n      }\n      skills {\n        id\n        code\n        name\n      }\n      checkpoints {\n        id\n        checkpointKey\n        title\n        expected\n        score\n        sortOrder\n      }\n      answerExamples {\n        id\n        exampleType\n        exampleText\n        sortOrder\n      }\n    }\n  }\n}\n\nquery Question($id: ID!) {\n  question(id: $id) {\n    id\n    questionText\n    level\n    difficulty\n    maxScore\n    isActive\n    shortAnswer\n    idealAnswer\n    topic {\n      name\n    }\n    profession {\n      name\n    }\n    checkpoints {\n      title\n      score\n      sortOrder\n    }\n    answerExamples {\n      exampleType\n      exampleText\n    }\n  }\n}": types.QuestionBankDocument,
    "mutation RefreshTokens {\n  refreshTokens {\n    accessToken\n    tokenType\n  }\n}": types.RefreshTokensDocument,
    "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    accessToken\n    tokenType\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}": types.RegisterDocument,
    "mutation RemoveCandidateFromShortlist($candidateId: ID!, $reason: String) {\n  removeCandidateFromShortlist(candidateId: $candidateId, reason: $reason) {\n    candidateId\n    status\n    reason\n  }\n}": types.RemoveCandidateFromShortlistDocument,
    "mutation StartPublicInterview($input: StartPublicInterviewInput!) {\n  startPublicInterview(input: $input) {\n    attemptId\n    currentQuestionText\n    totalQuestions\n  }\n}": types.StartPublicInterviewDocument,
    "mutation SubmitInterviewAnswer($input: SubmitInterviewAnswerInput!) {\n  submitInterviewAnswer(input: $input) {\n    status\n    nextQuestionText\n    answeredQuestions\n    totalQuestions\n  }\n}": types.SubmitInterviewAnswerDocument,
    "query TopicSkillQuestionAnalytics($filters: TopicSkillQuestionFilterInput) {\n  topicSkillQuestionAnalytics(filters: $filters) {\n    totalCompletedAttempts\n    lowSampleWarning\n    topics {\n      topicName\n      avgScore\n      passRate\n      sampleCount\n    }\n    skills {\n      skillName\n      avgScore\n      passRate\n      sampleCount\n    }\n    questions {\n      questionId\n      questionText\n      avgScore\n      passRate\n      sampleCount\n    }\n  }\n}": types.TopicSkillQuestionAnalyticsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation AddCandidateToShortlist($candidateId: ID!, $reason: String) {\n  addCandidateToShortlist(candidateId: $candidateId, reason: $reason) {\n    candidateId\n    status\n    reason\n  }\n}"): typeof import('./graphql').AddCandidateToShortlistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query AiCostAnalytics($filters: AiCostFilterInput) {\n  aiCostAnalytics(filters: $filters) {\n    kpi {\n      totalCostUsd\n      costPerInterview\n      costPerCandidate\n      totalRequests\n    }\n    byModel {\n      model\n      promptTokens\n      completionTokens\n      totalCostUsd\n    }\n    topExpensiveInterviews {\n      interviewAttemptId\n      interviewTitle\n      totalCostUsd\n      latencyMs\n    }\n  }\n}"): typeof import('./graphql').AiCostAnalyticsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query CandidateReport($candidateId: ID!) {\n  candidateReport(candidateId: $candidateId) {\n    candidateId\n    fullName\n    email\n    phone\n    linkedinUrl\n    githubUrl\n    shortlistStatus\n    shortlistReason\n    latestFinalEvaluation {\n      id\n      totalScore\n      category\n      hireRecommendation\n      summary\n      detailedSummary\n      strengths\n      weaknesses\n      risks\n      needsManualReview\n      categoryBreakdown {\n        categoryKey\n        categoryLabel\n        scoreNormalized\n        weight\n        contribution\n      }\n    }\n    interviewHistory {\n      attemptId\n      interviewId\n      interviewTitle\n      jobRole\n      status\n      completedAt\n      totalScore\n    }\n  }\n}"): typeof import('./graphql').CandidateReportDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query CheckpointResultsByAttempt($attemptId: ID!) {\n  checkpointResultsByAttempt(attemptId: $attemptId) {\n    attemptId\n    questionGroups {\n      interviewQuestionId\n      questionText\n      needsManualReview\n      checkpoints {\n        id\n        checkpointKey\n        checkpointTitle\n        status\n        scoreAwarded\n        maxScore\n        evidenceQuote\n        reasoningShort\n      }\n    }\n  }\n}"): typeof import('./graphql').CheckpointResultsByAttemptDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query CompanyCandidates($filters: CompanyCandidatesFilterInput) {\n  companyCandidates(filters: $filters) {\n    items {\n      candidateId\n      fullName\n      email\n      interviewsCount\n      avgScore\n      lastInterviewDate\n      shortlistStatus\n    }\n    total\n    page\n    pageSize\n  }\n}"): typeof import('./graphql').CompanyCandidatesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query CompanyInterviews($filters: CompanyInterviewsFilterInput) {\n  companyInterviews(filters: $filters) {\n    items {\n      attemptId\n      interviewId\n      interviewTitle\n      jobRole\n      candidateName\n      candidateEmail\n      status\n      startedAt\n      completedAt\n      overallScore\n    }\n    total\n    page\n    pageSize\n  }\n}"): typeof import('./graphql').CompanyInterviewsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CompleteInterviewAttempt($publicToken: String!, $attemptId: ID!) {\n  completeInterviewAttempt(publicToken: $publicToken, attemptId: $attemptId) {\n    attemptId\n    status\n    totalQuestions\n    answeredQuestions\n    messages {\n      id\n      role\n      content\n    }\n  }\n}"): typeof import('./graphql').CompleteInterviewAttemptDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateInterview($input: CreateInterviewInput!) {\n  createInterview(input: $input) {\n    id\n    title\n    jobRole\n    level\n    status\n    publicToken\n    publicUrl\n    questionCount\n  }\n}"): typeof import('./graphql').CreateInterviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation EvaluateInterviewAttempt($attemptId: ID!) {\n  evaluateInterviewAttempt(attemptId: $attemptId) {\n    questionCount\n    finalEvaluation {\n      id\n      totalScore\n      category\n      hireRecommendation\n      summary\n      needsManualReview\n      categoryBreakdown {\n        categoryKey\n        categoryLabel\n        scoreNormalized\n        weight\n        contribution\n      }\n    }\n  }\n}"): typeof import('./graphql').EvaluateInterviewAttemptDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query FinalEvaluationByAttempt($attemptId: ID!) {\n  finalEvaluationByAttempt(attemptId: $attemptId) {\n    id\n    interviewAttemptId\n    totalScore\n    category\n    hireRecommendation\n    summary\n    detailedSummary\n    strengths\n    weaknesses\n    risks\n    needsManualReview\n    categoryBreakdown {\n      categoryKey\n      categoryLabel\n      scoreNormalized\n      weight\n      contribution\n    }\n  }\n}"): typeof import('./graphql').FinalEvaluationByAttemptDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Hello {\n  hello\n}"): typeof import('./graphql').HelloDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Interview($id: ID!) {\n  interview(id: $id) {\n    id\n    title\n    jobRole\n    status\n    publicUrl\n    questionCount\n  }\n}"): typeof import('./graphql').InterviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query InterviewDetails($interviewId: ID!) {\n  interviewDetails(interviewId: $interviewId) {\n    id\n    title\n    jobRole\n    status\n    questionCount\n    publicUrl\n    createdAt\n    evaluationStatus\n    primaryFinalEvaluation {\n      id\n      totalScore\n      category\n      hireRecommendation\n      summary\n      strengths\n      weaknesses\n      risks\n      needsManualReview\n      categoryBreakdown {\n        categoryKey\n        categoryLabel\n        scoreNormalized\n        weight\n        contribution\n      }\n    }\n    attempts {\n      attemptId\n      candidateId\n      candidateName\n      candidateEmail\n      status\n      startedAt\n      completedAt\n      overallScore\n      hireRecommendation\n      evaluationStatus\n    }\n  }\n}"): typeof import('./graphql').InterviewDetailsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query InterviewSession($publicToken: String!, $attemptId: ID!) {\n  interviewSession(publicToken: $publicToken, attemptId: $attemptId) {\n    attemptId\n    status\n    totalQuestions\n    answeredQuestions\n    currentQuestionText\n    currentQuestionId\n    messages {\n      id\n      role\n      content\n      sequenceOrder\n    }\n  }\n}"): typeof import('./graphql').InterviewSessionDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query InterviewTranscript($attemptId: ID!) {\n  interviewTranscript(attemptId: $attemptId) {\n    attemptId\n    segments {\n      messageId\n      role\n      content\n      sequenceOrder\n      timestamp\n      questionText\n      interviewQuestionId\n    }\n  }\n}"): typeof import('./graphql').InterviewTranscriptDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    tokenType\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}"): typeof import('./graphql').LoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Logout {\n  logout {\n    success\n  }\n}"): typeof import('./graphql').LogoutDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Me {\n  me {\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}"): typeof import('./graphql').MeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query PublicInterview($publicToken: String!) {\n  publicInterview(publicToken: $publicToken) {\n    title\n    jobRole\n    questionCount\n    interviewLanguage\n  }\n}"): typeof import('./graphql').PublicInterviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation PublishInterview($id: ID!) {\n  publishInterview(id: $id) {\n    id\n    status\n    publicUrl\n    publicToken\n  }\n}"): typeof import('./graphql').PublishInterviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query QuestionBank($filters: QuestionBankFilterInput) {\n  questionBank(filters: $filters) {\n    total\n    items {\n      id\n      questionText\n      level\n      difficulty\n      maxScore\n      isActive\n      topic {\n        id\n        code\n        name\n      }\n      profession {\n        id\n        code\n        name\n      }\n      skills {\n        id\n        code\n        name\n      }\n      checkpoints {\n        id\n        checkpointKey\n        title\n        expected\n        score\n        sortOrder\n      }\n      answerExamples {\n        id\n        exampleType\n        exampleText\n        sortOrder\n      }\n    }\n  }\n}\n\nquery Question($id: ID!) {\n  question(id: $id) {\n    id\n    questionText\n    level\n    difficulty\n    maxScore\n    isActive\n    shortAnswer\n    idealAnswer\n    topic {\n      name\n    }\n    profession {\n      name\n    }\n    checkpoints {\n      title\n      score\n      sortOrder\n    }\n    answerExamples {\n      exampleType\n      exampleText\n    }\n  }\n}"): typeof import('./graphql').QuestionBankDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RefreshTokens {\n  refreshTokens {\n    accessToken\n    tokenType\n  }\n}"): typeof import('./graphql').RefreshTokensDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    accessToken\n    tokenType\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}"): typeof import('./graphql').RegisterDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RemoveCandidateFromShortlist($candidateId: ID!, $reason: String) {\n  removeCandidateFromShortlist(candidateId: $candidateId, reason: $reason) {\n    candidateId\n    status\n    reason\n  }\n}"): typeof import('./graphql').RemoveCandidateFromShortlistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation StartPublicInterview($input: StartPublicInterviewInput!) {\n  startPublicInterview(input: $input) {\n    attemptId\n    currentQuestionText\n    totalQuestions\n  }\n}"): typeof import('./graphql').StartPublicInterviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SubmitInterviewAnswer($input: SubmitInterviewAnswerInput!) {\n  submitInterviewAnswer(input: $input) {\n    status\n    nextQuestionText\n    answeredQuestions\n    totalQuestions\n  }\n}"): typeof import('./graphql').SubmitInterviewAnswerDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query TopicSkillQuestionAnalytics($filters: TopicSkillQuestionFilterInput) {\n  topicSkillQuestionAnalytics(filters: $filters) {\n    totalCompletedAttempts\n    lowSampleWarning\n    topics {\n      topicName\n      avgScore\n      passRate\n      sampleCount\n    }\n    skills {\n      skillName\n      avgScore\n      passRate\n      sampleCount\n    }\n    questions {\n      questionId\n      questionText\n      avgScore\n      passRate\n      sampleCount\n    }\n  }\n}"): typeof import('./graphql').TopicSkillQuestionAnalyticsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
