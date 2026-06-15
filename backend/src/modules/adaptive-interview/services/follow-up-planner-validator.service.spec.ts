import { FollowUpPlannerValidatorService } from './follow-up-planner-validator.service';

describe('FollowUpPlannerValidatorService', () => {
  let service: FollowUpPlannerValidatorService;

  beforeEach(() => {
    service = new FollowUpPlannerValidatorService();
  });

  it('accepts a valid follow-up planner payload', () => {
    const result = service.validateResponse(
      JSON.stringify({
        follow_up_question: 'Can you explain the dependency array?',
        reason: 'Checkpoint is still missed.',
      }),
    );

    expect(result.status).toBe('valid');
    if (result.status === 'valid') {
      expect(result.data.followUpQuestion).toContain('dependency array');
    }
  });

  it('rejects empty follow-up question', () => {
    const result = service.validateResponse(
      JSON.stringify({
        follow_up_question: '',
        reason: 'Missing question text',
      }),
    );

    expect(result.status).toBe('invalid_ai_response');
  });
});
