import { BadRequestException } from '@nestjs/common';
import type { CreateQuestionInput } from '../dto/create-question.input';

const CHECKPOINT_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

export function validateCompanyQuestionMetadata(
  input: Pick<
    CreateQuestionInput,
    'status' | 'companyPriority' | 'isRequired'
  >,
  options: { isCompanyOwned: boolean },
): void {
  const hasMetadata =
    input.status !== undefined ||
    input.companyPriority !== undefined ||
    input.isRequired !== undefined;

  if (!options.isCompanyOwned && hasMetadata) {
    throw new BadRequestException({
      message:
        'status, companyPriority and isRequired are only allowed for company-owned questions',
      code: 'GLOBAL_QUESTION_METADATA_FORBIDDEN',
    });
  }

  if (
    input.companyPriority !== undefined &&
    (!Number.isInteger(input.companyPriority) ||
      input.companyPriority < 0 ||
      input.companyPriority > 10)
  ) {
    throw new BadRequestException({
      message: 'companyPriority must be an integer between 0 and 10',
      code: 'INVALID_COMPANY_PRIORITY',
    });
  }
}

export function validateQuestionInput(input: CreateQuestionInput): void {
  const checkpointKeys = new Set<string>();

  for (const checkpoint of input.checkpoints) {
    if (!CHECKPOINT_KEY_PATTERN.test(checkpoint.checkpointKey)) {
      throw new BadRequestException({
        message: `Invalid checkpoint key: ${checkpoint.checkpointKey}`,
        code: 'INVALID_CHECKPOINT_KEY',
      });
    }

    if (checkpointKeys.has(checkpoint.checkpointKey)) {
      throw new BadRequestException({
        message: `Duplicate checkpoint key: ${checkpoint.checkpointKey}`,
        code: 'DUPLICATE_CHECKPOINT_KEY',
      });
    }

    checkpointKeys.add(checkpoint.checkpointKey);
  }

  const checkpointScoreSum = input.checkpoints.reduce(
    (sum, checkpoint) => sum + checkpoint.score,
    0,
  );

  if (Math.abs(checkpointScoreSum - input.maxScore) > 0.001) {
    throw new BadRequestException({
      message: `Checkpoint scores must sum to maxScore (${input.maxScore}), got ${checkpointScoreSum}`,
      code: 'CHECKPOINT_SCORE_MISMATCH',
    });
  }

  for (const example of input.answerExamples) {
    if (!example.exampleText.trim()) {
      throw new BadRequestException({
        message: 'Answer examples cannot be empty',
        code: 'EMPTY_ANSWER_EXAMPLE',
      });
    }
  }
}
