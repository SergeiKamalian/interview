import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateInterviewInput } from '../interview-core/dto/create-interview.input';
import { InterviewCoreService } from '../interview-core/interview-core.service';
import type { InterviewType } from '../interview-core/types/interview.type';
import { QuestionBankRepository } from '../question-bank/question-bank.repository';
import type {
  CompanyInterviewTemplatesFilterInput,
  CreateInterviewTemplateInput,
} from './graphql/interview-template.input';
import {
  AiToneEnum,
  DEFAULT_AI_TONE,
  DEFAULT_PROBING_DEPTH,
  DEFAULT_SCORING_STRICTNESS,
  ProbingDepthEnum,
  ScoringStrictnessEnum,
} from '../interview-core/types/interview-config.enum';
import type {
  CompanyInterviewTemplatesPayloadType,
  InterviewTemplateQuestionType,
  InterviewTemplateType,
} from './graphql/interview-template.type';
import { InterviewTemplateStatusEnum } from './graphql/interview-template.type';
import {
  InterviewTemplatesRepository,
  type InterviewTemplateEntity,
} from './interview-templates.repository';

@Injectable()
export class InterviewTemplatesService {
  constructor(
    private readonly repository: InterviewTemplatesRepository,
    private readonly questionBankRepository: QuestionBankRepository,
    private readonly interviewCoreService: InterviewCoreService,
  ) {}

  async listCompanyTemplates(
    companyId: number,
    filters: CompanyInterviewTemplatesFilterInput,
  ): Promise<CompanyInterviewTemplatesPayloadType> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const { items, total } = await this.repository.listForCompany(companyId, {
      ...filters,
      page,
      pageSize,
    });

    return {
      items: items.map((template) => this.mapTemplate(template)),
      total,
      page,
      pageSize,
    };
  }

  async createTemplate(
    companyId: number,
    userId: number,
    input: CreateInterviewTemplateInput,
  ): Promise<InterviewTemplateType> {
    const questionIds = this.parseQuestionIds(input.questionIds);
    await this.assertQuestionsVisible(companyId, questionIds);

    const template = await this.repository.createTemplate({
      companyId,
      createdByUserId: userId,
      title: input.title.trim(),
      jobRole: input.jobRole.trim(),
      professionId: input.professionId ? Number(input.professionId) : null,
      level: input.level,
      interviewLanguage: input.interviewLanguage?.trim() || 'ru',
      questionCount: questionIds.length,
      jobDescription: input.jobDescription?.trim() || null,
      isVideoEnabled: input.isVideoEnabled ?? false,
      interviewerName: input.interviewerName?.trim() || null,
      welcomeMessageTemplate: input.welcomeMessageTemplate?.trim() || null,
      aiTone: input.aiTone ?? DEFAULT_AI_TONE,
      probingDepth: input.probingDepth ?? DEFAULT_PROBING_DEPTH,
      scoringStrictness: input.scoringStrictness ?? DEFAULT_SCORING_STRICTNESS,
      maxCompletions: input.maxCompletions ?? null,
      allowRetake: input.allowRetake ?? false,
      timeLimitMinutes: input.timeLimitMinutes ?? null,
      passingScore: input.passingScore ?? null,
      requirePhone: input.requirePhone ?? false,
      requireLinkedin: input.requireLinkedin ?? false,
      requireGithub: input.requireGithub ?? false,
      questionIds,
    });

    return this.mapTemplate(template);
  }

  async createInterviewFromTemplate(
    companyId: number,
    userId: number,
    templateIdRaw: string,
  ): Promise<InterviewType> {
    const templateId = Number(templateIdRaw);
    if (!Number.isInteger(templateId) || templateId <= 0) {
      throw new BadRequestException({
        message: 'Invalid interview template ID',
        code: 'INVALID_INTERVIEW_TEMPLATE_ID',
      });
    }

    const template = await this.repository.findByIdForCompany(
      companyId,
      templateId,
    );
    if (!template || template.status !== InterviewTemplateStatusEnum.active) {
      throw new NotFoundException('Interview template not found');
    }

    if (template.questions.length === 0) {
      throw new BadRequestException({
        message: 'Interview template has no questions',
        code: 'EMPTY_INTERVIEW_TEMPLATE',
      });
    }

    const questionIds = template.questions
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((question) => question.questionId);
    await this.assertQuestionsVisible(companyId, questionIds);

    const input: CreateInterviewInput = {
      title: template.title,
      jobRole: template.jobRole,
      level: template.level,
      interviewLanguage: template.interviewLanguage,
      questionCount: questionIds.length,
      jobDescription: template.jobDescription ?? undefined,
      professionId: template.professionId
        ? String(template.professionId)
        : undefined,
      isVideoEnabled: template.isVideoEnabled,
      interviewerName: template.interviewerName ?? undefined,
      welcomeMessageTemplate: template.welcomeMessageTemplate ?? undefined,
      aiTone: template.aiTone as AiToneEnum,
      probingDepth: template.probingDepth as ProbingDepthEnum,
      scoringStrictness: template.scoringStrictness as ScoringStrictnessEnum,
      maxCompletions: template.maxCompletions ?? undefined,
      allowRetake: template.allowRetake,
      timeLimitMinutes: template.timeLimitMinutes ?? undefined,
      passingScore: template.passingScore ?? undefined,
      requirePhone: template.requirePhone,
      requireLinkedin: template.requireLinkedin,
      requireGithub: template.requireGithub,
      questionIds: questionIds.map(String),
    };

    return this.interviewCoreService.createInterview(companyId, userId, input);
  }

  async createTemplateFromInterview(
    companyId: number,
    userId: number,
    interviewIdRaw: string,
    title?: string | null,
  ): Promise<InterviewTemplateType> {
    const interviewId = Number(interviewIdRaw);
    if (!Number.isInteger(interviewId) || interviewId <= 0) {
      throw new BadRequestException({
        message: 'Invalid interview ID',
        code: 'INVALID_INTERVIEW_ID',
      });
    }

    const draft = await this.repository.findTemplateDraftFromInterview(
      companyId,
      interviewId,
    );
    if (!draft) {
      throw new NotFoundException('Interview not found');
    }

    if (draft.questionIds.length === 0) {
      throw new BadRequestException({
        message: 'Interview has no questions to save as template',
        code: 'EMPTY_INTERVIEW',
      });
    }

    if (draft.questionIds.some((questionId) => questionId == null)) {
      throw new BadRequestException({
        message: 'Interview contains questions without source question IDs',
        code: 'MISSING_SOURCE_QUESTION_IDS',
      });
    }

    const questionIds = draft.questionIds.filter(
      (questionId): questionId is number => questionId != null,
    );
    await this.assertQuestionsVisible(companyId, questionIds);

    const template = await this.repository.createTemplate({
      companyId,
      createdByUserId: userId,
      title: title?.trim() || draft.title,
      jobRole: draft.jobRole,
      professionId: draft.professionId,
      level: draft.level,
      interviewLanguage: draft.interviewLanguage,
      questionCount: questionIds.length,
      jobDescription: draft.jobDescription,
      isVideoEnabled: draft.isVideoEnabled,
      interviewerName: draft.interviewerName,
      welcomeMessageTemplate: draft.welcomeMessageTemplate,
      aiTone: draft.aiTone,
      probingDepth: draft.probingDepth,
      scoringStrictness: draft.scoringStrictness,
      maxCompletions: draft.maxCompletions,
      allowRetake: draft.allowRetake,
      timeLimitMinutes: draft.timeLimitMinutes,
      passingScore: draft.passingScore,
      requirePhone: draft.requirePhone,
      requireLinkedin: draft.requireLinkedin,
      requireGithub: draft.requireGithub,
      questionIds,
    });

    return this.mapTemplate(template);
  }

  private parseQuestionIds(questionIdsRaw: string[]): number[] {
    const questionIds = questionIdsRaw.map((id) => Number(id));

    if (questionIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new BadRequestException({
        message: 'Invalid question IDs',
        code: 'INVALID_QUESTION_IDS',
      });
    }

    if (new Set(questionIds).size !== questionIds.length) {
      throw new BadRequestException({
        message: 'Duplicate question IDs are not allowed',
        code: 'DUPLICATE_QUESTION_IDS',
      });
    }

    return questionIds;
  }

  private async assertQuestionsVisible(
    companyId: number,
    questionIds: number[],
  ): Promise<void> {
    const questions = await Promise.all(
      questionIds.map((id) =>
        this.questionBankRepository.findVisibleById(companyId, id),
      ),
    );

    if (questions.some((question) => !question)) {
      throw new BadRequestException({
        message: 'One or more questions are not accessible for this company',
        code: 'QUESTION_SCOPE_VIOLATION',
      });
    }
  }

  private mapTemplate(
    template: InterviewTemplateEntity,
  ): InterviewTemplateType {
    return {
      id: String(template.id),
      title: template.title,
      jobRole: template.jobRole,
      level: template.level,
      interviewLanguage: template.interviewLanguage,
      questionCount: template.questionCount,
      jobDescription: template.jobDescription,
      professionId: template.professionId
        ? String(template.professionId)
        : null,
      isVideoEnabled: template.isVideoEnabled,
      interviewerName: template.interviewerName,
      welcomeMessageTemplate: template.welcomeMessageTemplate,
      aiTone: template.aiTone as AiToneEnum,
      probingDepth: template.probingDepth as ProbingDepthEnum,
      scoringStrictness: template.scoringStrictness as ScoringStrictnessEnum,
      maxCompletions: template.maxCompletions,
      allowRetake: template.allowRetake,
      timeLimitMinutes: template.timeLimitMinutes,
      passingScore: template.passingScore,
      requirePhone: template.requirePhone,
      requireLinkedin: template.requireLinkedin,
      requireGithub: template.requireGithub,
      status: template.status,
      createdAt: Math.floor(template.createdAt.getTime() / 1000),
      updatedAt: Math.floor(template.updatedAt.getTime() / 1000),
      questions: template.questions.map(
        (question): InterviewTemplateQuestionType => ({
          questionId: String(question.questionId),
          sortOrder: question.sortOrder,
        }),
      ),
    };
  }
}
