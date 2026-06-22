import type { AnswerExampleEntity } from './entities/answer-example.entity';
import type { CompanyQuestionOverrideEntity } from './entities/company-question-override.entity';
import type { ProfessionEntity } from './entities/profession.entity';
import type { QuestionCheckpointEntity } from './entities/question-checkpoint.entity';
import type { QuestionWithDetailsEntity } from './entities/question.entity';
import type { SkillEntity } from './entities/skill.entity';
import type { TopicEntity } from './entities/topic.entity';
import {
  AnswerExampleTypeEnum,
  type QuestionAnswerExampleType,
} from './types/question-answer-example.type';
import type { QuestionCheckpointType } from './types/question-checkpoint.type';
import {
  QuestionDifficultyEnum,
  QuestionLevelEnum,
  QuestionStatusEnum,
  type QuestionType,
} from './types/question.type';
import type {
  CompanyQuestionOverrideType,
  OverrideAnswerExampleType,
} from './types/company-question-override.type';
import type { ProfessionType } from './types/profession.type';
import type { SkillType } from './types/skill.type';
import type { TopicType } from './types/topic.type';

export function mapProfessionToGraphql(
  profession: ProfessionEntity,
): ProfessionType {
  return {
    id: String(profession.id),
    code: profession.code,
    name: profession.name,
  };
}

export function mapTopicToGraphql(topic: TopicEntity): TopicType {
  return {
    id: String(topic.id),
    code: topic.code,
    name: topic.name,
    interviewWeight: topic.interviewWeight,
    skill: topic.skill ? mapSkillToGraphql(topic.skill) : null,
    isCustom: topic.companyId != null,
  };
}

export function mapSkillToGraphql(skill: SkillEntity): SkillType {
  return {
    id: String(skill.id),
    code: skill.code,
    name: skill.name,
    isCustom: skill.companyId != null,
  };
}

export function mapCheckpointToGraphql(
  checkpoint: QuestionCheckpointEntity,
): QuestionCheckpointType {
  const hints = checkpoint.evaluationHints;

  return {
    id: String(checkpoint.id),
    checkpointKey: checkpoint.checkpointKey,
    title: checkpoint.title,
    expected: checkpoint.expected,
    score: checkpoint.score,
    sortOrder: checkpoint.sortOrder,
    evaluationHints: hints
      ? {
          mustConcepts: hints.mustConcepts,
          falseClaims: hints.falseClaims,
          minMatchedConcepts: hints.minMatchedConcepts,
          positiveFloorScore: hints.positiveFloorScore,
        }
      : null,
  };
}

export function mapOverrideAnswerExampleToGraphql(
  example: NonNullable<CompanyQuestionOverrideEntity['extraAnswerExamples']>[number],
): OverrideAnswerExampleType {
  return {
    exampleType: example.exampleType as AnswerExampleTypeEnum,
    exampleText: example.exampleText,
    sortOrder: example.sortOrder,
    checkpointKey: example.checkpointKey,
  };
}

export function mapCompanyQuestionOverrideToGraphql(
  override: CompanyQuestionOverrideEntity,
): CompanyQuestionOverrideType {
  return {
    id: String(override.id),
    sourceQuestionId: String(override.sourceQuestionId),
    extraMustConcepts: override.extraMustConcepts,
    extraFalseClaims: override.extraFalseClaims,
    extraAnswerExamples: override.extraAnswerExamples
      ? override.extraAnswerExamples.map(mapOverrideAnswerExampleToGraphql)
      : null,
    topicWeightOverride: override.topicWeightOverride,
    createdAt: override.createdAt,
    updatedAt: override.updatedAt,
  };
}

export function mapAnswerExampleToGraphql(
  example: AnswerExampleEntity,
): QuestionAnswerExampleType {
  return {
    id: String(example.id),
    exampleType: example.exampleType as AnswerExampleTypeEnum,
    exampleText: example.exampleText,
    sortOrder: example.sortOrder,
  };
}

export function mapQuestionToGraphql(
  question: QuestionWithDetailsEntity,
  profession: ProfessionEntity,
  topic: TopicEntity,
  skills: SkillEntity[],
): QuestionType {
  return {
    id: String(question.id),
    companyId: question.companyId ? String(question.companyId) : null,
    sourceQuestionId: question.sourceQuestionId
      ? String(question.sourceQuestionId)
      : null,
    status: question.status as QuestionStatusEnum,
    companyPriority: question.companyPriority,
    isRequired: question.isRequired,
    isCustom: question.companyId != null,
    questionText: question.questionText,
    shortAnswer: question.shortAnswer,
    idealAnswer: question.idealAnswer,
    maxScore: question.maxScore,
    level: question.level as QuestionLevelEnum,
    difficulty: question.difficulty as QuestionDifficultyEnum,
    isActive: question.isActive,
    profession: mapProfessionToGraphql(profession),
    topic: mapTopicToGraphql(topic),
    skills: skills.map(mapSkillToGraphql),
    checkpoints: question.checkpoints
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapCheckpointToGraphql),
    answerExamples: question.answerExamples
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapAnswerExampleToGraphql),
  };
}
