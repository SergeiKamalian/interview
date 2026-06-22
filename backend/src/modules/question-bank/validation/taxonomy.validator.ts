import { BadRequestException } from '@nestjs/common';

const TAXONOMY_CODE_PATTERN = /^[a-z][a-z0-9_]*$/;

export function validateTaxonomyCode(code: string): void {
  const trimmed = code.trim();
  if (!TAXONOMY_CODE_PATTERN.test(trimmed)) {
    throw new BadRequestException({
      message: `Invalid code: ${code}. Must be snake_case (e.g. internal_platform)`,
      code: 'INVALID_TAXONOMY_CODE',
    });
  }
}

export function validateInterviewWeight(weight: number): void {
  if (!Number.isFinite(weight) || weight < 1 || weight > 10) {
    throw new BadRequestException({
      message: 'interviewWeight must be between 1 and 10',
      code: 'INVALID_INTERVIEW_WEIGHT',
    });
  }
}

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'ER_DUP_ENTRY'
  );
}
