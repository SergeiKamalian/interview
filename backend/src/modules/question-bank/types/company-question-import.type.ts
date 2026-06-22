import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CompanyImportPreviewItemType {
  @Field(() => String, { nullable: true })
  code?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  importKey?: string;

  @Field(() => String, { nullable: true })
  topicCode?: string;

  @Field(() => String, { nullable: true })
  questionText?: string;

  @Field(() => Int, { nullable: true })
  checkpointCount?: number;
}

@ObjectType()
export class CompanyImportPreviewCreateType {
  @Field(() => [CompanyImportPreviewItemType])
  topics!: CompanyImportPreviewItemType[];

  @Field(() => [CompanyImportPreviewItemType])
  skills!: CompanyImportPreviewItemType[];

  @Field(() => [CompanyImportPreviewItemType])
  questions!: CompanyImportPreviewItemType[];

  @Field(() => Int)
  checkpoints!: number;
}

@ObjectType()
export class CompanyImportPreviewUpdateType {
  @Field(() => [CompanyImportPreviewItemType])
  topics!: CompanyImportPreviewItemType[];

  @Field(() => [CompanyImportPreviewItemType])
  questions!: CompanyImportPreviewItemType[];
}

@ObjectType()
export class CompanyImportFieldErrorType {
  @Field(() => Int)
  row!: number;

  @Field()
  field!: string;

  @Field()
  message!: string;
}

@ObjectType()
export class CompanyImportWarningType {
  @Field(() => Int)
  row!: number;

  @Field()
  message!: string;
}

@ObjectType()
export class CompanyQuestionImportPreviewPayload {
  @Field(() => CompanyImportPreviewCreateType)
  toCreate!: CompanyImportPreviewCreateType;

  @Field(() => CompanyImportPreviewUpdateType)
  toUpdate!: CompanyImportPreviewUpdateType;

  @Field(() => [CompanyImportFieldErrorType])
  errors!: CompanyImportFieldErrorType[];

  @Field(() => [CompanyImportWarningType])
  warnings!: CompanyImportWarningType[];

  @Field(() => String, { nullable: true })
  importToken?: string | null;
}

@ObjectType()
export class CompanyQuestionImportCommitPayload {
  @Field(() => Int)
  topicsCreated!: number;

  @Field(() => Int)
  topicsUpdated!: number;

  @Field(() => Int)
  skillsCreated!: number;

  @Field(() => Int)
  questionsCreated!: number;

  @Field(() => Int)
  questionsUpdated!: number;
}
