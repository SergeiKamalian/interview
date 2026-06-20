import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum AttemptReviewStatusEnum {
  pending = 'pending',
  in_review = 'in_review',
  reviewed = 'reviewed',
}

export enum AiAssessmentVerdictEnum {
  pending = 'pending',
  agree = 'agree',
  disagree = 'disagree',
}

export enum CompanyAttemptDecisionEnum {
  pending = 'pending',
  shortlist = 'shortlist',
  reject = 'reject',
  invite_live = 'invite_live',
  hold = 'hold',
}

registerEnumType(AttemptReviewStatusEnum, { name: 'AttemptReviewStatus' });
registerEnumType(AiAssessmentVerdictEnum, { name: 'AiAssessmentVerdict' });
registerEnumType(CompanyAttemptDecisionEnum, {
  name: 'CompanyAttemptDecision',
});

@ObjectType()
export class AttemptReviewStateType {
  @Field(() => AttemptReviewStatusEnum)
  reviewStatus!: AttemptReviewStatusEnum;

  @Field(() => AiAssessmentVerdictEnum)
  aiAssessmentVerdict!: AiAssessmentVerdictEnum;

  @Field(() => CompanyAttemptDecisionEnum)
  companyDecision!: CompanyAttemptDecisionEnum;

  @Field(() => Int, { nullable: true })
  reviewedAt?: number | null;
}

@ObjectType()
export class AttemptReviewPayloadType extends AttemptReviewStateType {
  @Field()
  attemptId!: string;
}

export enum AiAssessmentVerdictInputEnum {
  agree = 'agree',
  disagree = 'disagree',
}

export enum CompanyAttemptDecisionInputEnum {
  shortlist = 'shortlist',
  reject = 'reject',
  invite_live = 'invite_live',
  hold = 'hold',
}

registerEnumType(AiAssessmentVerdictInputEnum, {
  name: 'AiAssessmentVerdictInput',
});
registerEnumType(CompanyAttemptDecisionInputEnum, {
  name: 'CompanyAttemptDecisionInput',
});

@InputType()
export class SetAttemptAiVerdictInput {
  @Field()
  @IsString()
  attemptId!: string;

  @Field(() => AiAssessmentVerdictInputEnum)
  @IsEnum(AiAssessmentVerdictInputEnum)
  verdict!: AiAssessmentVerdictInputEnum;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string | null;
}

@InputType()
export class SetAttemptCompanyDecisionInput {
  @Field()
  @IsString()
  attemptId!: string;

  @Field(() => CompanyAttemptDecisionInputEnum)
  @IsEnum(CompanyAttemptDecisionInputEnum)
  decision!: CompanyAttemptDecisionInputEnum;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string | null;
}

@ObjectType()
export class AttemptShareLinkType {
  @Field()
  attemptId!: string;

  @Field()
  token!: string;

  @Field()
  sharePath!: string;

  @Field(() => Int, { nullable: true })
  expiresAt?: number | null;
}

@InputType()
export class CreateAttemptShareLinkInput {
  @Field()
  @IsString()
  attemptId!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  expiresInDays?: number | null;
}

@ObjectType()
export class AttemptReviewNoteType {
  @Field(() => ID)
  id!: string;

  @Field()
  attemptId!: string;

  @Field()
  body!: string;

  @Field()
  authorId!: string;

  @Field()
  authorName!: string;

  @Field(() => Int)
  createdAt!: number;

  @Field(() => Int)
  updatedAt!: number;
}

@InputType()
export class CreateAttemptReviewNoteInput {
  @Field()
  @IsString()
  attemptId!: string;

  @Field()
  @IsString()
  @MaxLength(5000)
  body!: string;
}

@InputType()
export class UpdateAttemptReviewNoteInput {
  @Field()
  @IsString()
  noteId!: string;

  @Field()
  @IsString()
  @MaxLength(5000)
  body!: string;
}

export enum DecisionAuditEventSourceEnum {
  attempt_review = 'attempt_review',
  shortlist = 'shortlist',
}

registerEnumType(DecisionAuditEventSourceEnum, {
  name: 'DecisionAuditEventSource',
});

@ObjectType()
export class DecisionAuditEventType {
  @Field()
  eventId!: string;

  @Field(() => DecisionAuditEventSourceEnum)
  source!: DecisionAuditEventSourceEnum;

  @Field()
  action!: string;

  @Field(() => String, { nullable: true })
  previousValue?: string | null;

  @Field(() => String, { nullable: true })
  newValue?: string | null;

  @Field(() => String, { nullable: true })
  reason?: string | null;

  @Field(() => String, { nullable: true })
  actorEmail?: string | null;

  @Field(() => String, { nullable: true })
  actorName?: string | null;

  @Field(() => Int)
  occurredAt!: number;
}

@ObjectType()
export class AttemptReviewDecisionHistoryPayloadType {
  @Field(() => [DecisionAuditEventType])
  items!: DecisionAuditEventType[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;
}
