import { BadRequestException } from '@nestjs/common';
import { validateCompanyQuestionMetadata } from './question-bank.validator';

describe('validateCompanyQuestionMetadata', () => {
  it('allows metadata for company-owned questions', () => {
    expect(() =>
      validateCompanyQuestionMetadata(
        { companyPriority: 5, isRequired: true, status: undefined },
        { isCompanyOwned: true },
      ),
    ).not.toThrow();
  });

  it('rejects metadata for global questions', () => {
    expect(() =>
      validateCompanyQuestionMetadata(
        { companyPriority: 5 },
        { isCompanyOwned: false },
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects companyPriority outside 0..10', () => {
    expect(() =>
      validateCompanyQuestionMetadata(
        { companyPriority: 11 },
        { isCompanyOwned: true },
      ),
    ).toThrow(BadRequestException);
  });
});
