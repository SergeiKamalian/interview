import { Field, Float, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';
import {
  AiToneEnum,
  ProbingDepthEnum,
  ScoringStrictnessEnum,
} from '../../interview-core/types/interview-config.enum';

export enum InterviewTemplateStatusEnum {
  active = 'active',
  archived = 'archived',
}

registerEnumType(InterviewTemplateStatusEnum, {
  name: 'InterviewTemplateStatus',
});

@ObjectType()
export class InterviewTemplateQuestionType {
  @Field()
  questionId!: string;

  @Field(() => Int)
  sortOrder!: number;
}

@ObjectType()
export class InterviewTemplateType {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  jobRole!: string;

  @Field(() => QuestionLevelEnum)
  level!: QuestionLevelEnum;

  @Field()
  interviewLanguage!: string;

  @Field(() => Int)
  questionCount!: number;

  @Field(() => String, { nullable: true })
  jobDescription?: string | null;

  @Field(() => String, { nullable: true })
  professionId?: string | null;

  @Field()
  isVideoEnabled!: boolean;

  @Field(() => String, { nullable: true })
  interviewerName?: string | null;

  @Field(() => String, { nullable: true })
  welcomeMessageTemplate?: string | null;

  @Field(() => AiToneEnum)
  aiTone!: AiToneEnum;

  @Field(() => ProbingDepthEnum)
  probingDepth!: ProbingDepthEnum;

  @Field(() => ScoringStrictnessEnum)
  scoringStrictness!: ScoringStrictnessEnum;

  @Field(() => Int, { nullable: true })
  maxCompletions?: number | null;

  @Field()
  allowRetake!: boolean;

  @Field(() => Int, { nullable: true })
  timeLimitMinutes?: number | null;

  @Field(() => Float, { nullable: true })
  passingScore?: number | null;

  @Field()
  requirePhone!: boolean;

  @Field()
  requireLinkedin!: boolean;

  @Field()
  requireGithub!: boolean;

  @Field(() => InterviewTemplateStatusEnum)
  status!: InterviewTemplateStatusEnum;

  @Field(() => Int)
  createdAt!: number;

  @Field(() => Int)
  updatedAt!: number;

  @Field(() => [InterviewTemplateQuestionType])
  questions!: InterviewTemplateQuestionType[];
}

@ObjectType()
export class CompanyInterviewTemplatesPayloadType {
  @Field(() => [InterviewTemplateType])
  items!: InterviewTemplateType[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;
}
