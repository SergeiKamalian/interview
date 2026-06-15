import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { AttemptStatusEnum } from '../../interview-core/types/interview.type';

@ObjectType()
export class CompanyInterviewListItemType {
  @Field()
  attemptId!: string;

  @Field()
  interviewId!: string;

  @Field()
  interviewTitle!: string;

  @Field()
  jobRole!: string;

  @Field()
  candidateName!: string;

  @Field()
  candidateEmail!: string;

  @Field(() => AttemptStatusEnum)
  status!: AttemptStatusEnum;

  @Field(() => Int, { nullable: true })
  startedAt?: number | null;

  @Field(() => Int, { nullable: true })
  completedAt?: number | null;

  @Field(() => Float, { nullable: true })
  overallScore?: number | null;
}

@ObjectType()
export class CompanyInterviewsPayloadType {
  @Field(() => [CompanyInterviewListItemType])
  items!: CompanyInterviewListItemType[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;
}
