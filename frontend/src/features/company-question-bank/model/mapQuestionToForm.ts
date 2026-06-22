import type { QuestionDetail } from '@entities/question/model/types';
import {
  createDefaultQuestionEditorValues,
  type QuestionEditorFormValues,
} from '../model/types';

export function mapQuestionDetailToFormValues(
  question: QuestionDetail,
): QuestionEditorFormValues {
  return {
    questionText: question.questionText,
    shortAnswer: question.shortAnswer,
    idealAnswer: question.idealAnswer,
    professionId: question.profession.id,
    topicId: question.topic.id,
    skillIds: question.skills.map((skill) => skill.id),
    level: question.level,
    difficulty: question.difficulty,
    status: question.status,
    companyPriority: question.companyPriority,
    isRequired: question.isRequired,
    checkpoints: question.checkpoints.map((checkpoint) => ({
      checkpointKey: checkpoint.checkpointKey,
      title: checkpoint.title,
      expected: checkpoint.expected,
      score: checkpoint.score,
      sortOrder: checkpoint.sortOrder,
      mustConcepts: checkpoint.evaluationHints?.mustConcepts ?? [],
      falseClaims: checkpoint.evaluationHints?.falseClaims ?? [],
    })),
    answerExamples: question.answerExamples.map((example) => ({
      exampleType: example.exampleType,
      exampleText: example.exampleText,
      sortOrder: example.sortOrder,
    })),
  };
}

export function createInitialFormValues(
  question?: QuestionDetail | null,
): QuestionEditorFormValues {
  if (question) {
    return mapQuestionDetailToFormValues(question);
  }

  return createDefaultQuestionEditorValues();
}
