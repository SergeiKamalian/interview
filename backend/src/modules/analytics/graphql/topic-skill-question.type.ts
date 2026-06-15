import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TopicAnalyticsItemType {
  @Field()
  topicName!: string;

  @Field(() => Float)
  avgScore!: number;

  @Field(() => Float)
  passRate!: number;

  @Field(() => Int)
  sampleCount!: number;
}

@ObjectType()
export class SkillAnalyticsItemType {
  @Field()
  skillName!: string;

  @Field(() => Float)
  avgScore!: number;

  @Field(() => Float)
  passRate!: number;

  @Field(() => Int)
  sampleCount!: number;
}

@ObjectType()
export class QuestionAnalyticsItemType {
  @Field()
  questionId!: string;

  @Field()
  questionText!: string;

  @Field(() => Float)
  avgScore!: number;

  @Field(() => Float)
  passRate!: number;

  @Field(() => Int)
  sampleCount!: number;
}

@ObjectType()
export class TopicSkillQuestionAnalyticsType {
  @Field(() => [TopicAnalyticsItemType])
  topics!: TopicAnalyticsItemType[];

  @Field(() => [SkillAnalyticsItemType])
  skills!: SkillAnalyticsItemType[];

  @Field(() => [QuestionAnalyticsItemType])
  questions!: QuestionAnalyticsItemType[];

  @Field(() => Int)
  totalCompletedAttempts!: number;

  @Field()
  lowSampleWarning!: boolean;
}
