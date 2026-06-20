import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

@InputType()
export class CompareInterviewCandidatesInput {
  @Field(() => ID)
  @IsString()
  interviewId!: string;

  @Field(() => [ID])
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  attemptIds!: string[];
}

@ObjectType()
export class CandidateComparisonRankingEntryType {
  @Field(() => ID)
  attemptId!: string;

  @Field()
  rank!: number;

  @Field()
  headline!: string;

  @Field()
  tradeOff!: string;
}

@ObjectType()
export class CandidateComparisonUseCaseType {
  @Field()
  title!: string;

  @Field(() => ID, { nullable: true })
  recommendedAttemptId?: string | null;

  @Field()
  rationale!: string;
}

@ObjectType()
export class CandidateComparisonCandidateNoteType {
  @Field(() => ID)
  attemptId!: string;

  @Field()
  candidateName!: string;

  @Field()
  bestFor!: string;

  @Field(() => [String])
  strengths!: string[];

  @Field(() => [String])
  risks!: string[];

  @Field(() => [String])
  followUpQuestions!: string[];
}

@ObjectType()
export class CandidateComparisonAdviceType {
  @Field(() => ID, { nullable: true })
  recommendedAttemptId?: string | null;

  @Field()
  recommendationTitle!: string;

  @Field()
  recommendationSummary!: string;

  @Field(() => [String])
  decisionRationale!: string[];

  @Field(() => [CandidateComparisonUseCaseType])
  useCases!: CandidateComparisonUseCaseType[];

  @Field(() => [CandidateComparisonCandidateNoteType])
  candidateNotes!: CandidateComparisonCandidateNoteType[];

  @Field(() => [CandidateComparisonRankingEntryType])
  ranking!: CandidateComparisonRankingEntryType[];

  @Field(() => [String])
  caveats!: string[];
}
