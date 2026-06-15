import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CompanyCandidateListItemType {
  @Field()
  candidateId!: string;

  @Field()
  fullName!: string;

  @Field()
  email!: string;

  @Field(() => Int)
  interviewsCount!: number;

  @Field(() => Float, { nullable: true })
  avgScore?: number | null;

  @Field(() => Int, { nullable: true })
  lastInterviewDate?: number | null;

  @Field()
  shortlistStatus!: string;
}

@ObjectType()
export class CompanyCandidatesPayloadType {
  @Field(() => [CompanyCandidateListItemType])
  items!: CompanyCandidateListItemType[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;
}
