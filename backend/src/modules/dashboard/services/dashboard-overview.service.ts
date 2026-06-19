import { Injectable } from '@nestjs/common';
import { HireRecommendationEnum } from '../../ai-evaluation/graphql/final-evaluation.type';
import { TopicSkillQuestionService } from '../../analytics/services/topic-skill-question.service';
import { CandidatesDashboardService } from '../../candidates/services/candidates-dashboard.service';
import { InterviewStatusEnum } from '../../interview-core/types/interview.type';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';
import { InterviewsDashboardService } from '../../interviews/services/interviews-dashboard.service';
import type { DashboardAttentionKindEnum } from '../graphql/dashboard-attention-kind.enum';
import type { CompanyDashboardOverviewType } from '../graphql/dashboard-overview.type';
import { DashboardOverviewRepository } from '../repositories/dashboard-overview.repository';

@Injectable()
export class DashboardOverviewService {
  constructor(
    private readonly repository: DashboardOverviewRepository,
    private readonly interviewsDashboardService: InterviewsDashboardService,
    private readonly candidatesDashboardService: CandidatesDashboardService,
    private readonly topicSkillQuestionService: TopicSkillQuestionService,
  ) {}

  async getOverview(companyId: number): Promise<CompanyDashboardOverviewType> {
    const metrics = await this.repository.getMetrics(companyId);
    const attentionRows = await this.repository.getAttentionItems(companyId, 8);

    const interviewsPayload =
      await this.interviewsDashboardService.listCompanyInterviewSummaries(
        companyId,
        {
          page: 1,
          pageSize: 10,
          sort: 'last_activity_at',
          sortDirection: 'desc',
        },
      );

    const shortlistPayload =
      await this.candidatesDashboardService.listCompanyCandidates(companyId, {
        page: 1,
        pageSize: 5,
        sort: 'avg_score',
        sortDirection: 'desc',
        shortlistedOnly: true,
      });

    const analytics = await this.topicSkillQuestionService.getAnalytics(
      companyId,
      {},
    );

    const weakTopics = analytics.topics
      .filter((topic) => topic.sampleCount >= 3)
      .sort((left, right) => left.passRate - right.passRate)
      .slice(0, 3)
      .map((topic) => ({
        topicName: topic.topicName,
        avgScore: topic.avgScore,
        passRate: topic.passRate,
        sampleCount: topic.sampleCount,
      }));

    return {
      metrics: {
        candidatesTotal: metrics.candidatesTotal,
        completedTotal: metrics.completedTotal,
        inProgressTotal: metrics.inProgressTotal,
        shortlistedTotal: metrics.shortlistedTotal,
        abandonedTotal: metrics.abandonedTotal,
        needsReviewTotal: metrics.needsReviewTotal,
        strongInviteTotal: metrics.strongInviteTotal,
        completionRate: metrics.completionRate,
        interviewsTotal: metrics.interviewsTotal,
        activeInterviewsTotal: metrics.activeInterviewsTotal,
      },
      interviews: interviewsPayload.items.map((item) => ({
        interviewId: item.interviewId,
        title: item.title,
        jobRole: item.jobRole,
        status: item.status as InterviewStatusEnum,
        level: item.level as QuestionLevelEnum,
        interviewLanguage: item.interviewLanguage,
        questionCount: item.questionCount,
        publicUrl: item.publicUrl,
        createdAt: item.createdAt,
        attemptsTotal: item.attemptsTotal,
        attemptsCompleted: item.attemptsCompleted,
        attemptsInProgress: item.attemptsInProgress,
        attemptsAbandoned: item.attemptsAbandoned,
        attemptsPending: item.attemptsPending,
        completionRate: item.completionRate,
        shortlistedCount: item.shortlistedCount,
        strongInviteCount: item.strongInviteCount,
        needsManualReviewCount: item.needsManualReviewCount,
        avgScore: item.avgScore,
        lastActivityAt: item.lastActivityAt,
      })),
      interviewsTotal: interviewsPayload.total,
      attentionItems: attentionRows.map((item) => ({
        kind: item.kind as DashboardAttentionKindEnum,
        attemptId: String(item.attemptId),
        interviewId: String(item.interviewId),
        interviewTitle: item.interviewTitle,
        jobRole: item.jobRole,
        candidateId: String(item.candidateId),
        candidateName: item.candidateName,
        overallScore: item.overallScore,
        hireRecommendation: item.hireRecommendation
          ? (item.hireRecommendation as HireRecommendationEnum)
          : null,
        occurredAt: Math.floor(item.occurredAt.getTime() / 1000),
      })),
      shortlistPreview: shortlistPayload.items.map((item) => ({
        candidateId: item.candidateId,
        fullName: item.fullName,
        email: item.email,
        interviewsCount: item.interviewsCount,
        avgScore: item.avgScore,
        lastInterviewDate: item.lastInterviewDate,
      })),
      shortlistTotal: shortlistPayload.total,
      weakTopics,
    };
  }
}
