export const CHECKPOINT_EVALUATION_REPAIR_INSTRUCTION = [
  'Your previous response was invalid or incomplete.',
  'Return ONLY valid JSON that matches the required schema exactly.',
  'Include exactly one result per provided checkpoint_key.',
  'Do not add markdown fences or explanatory text.',
].join(' ');

export function buildCheckpointEvaluationRepairUserPrompt(
  originalUserPrompt: string,
  previousResponse: string,
  errors: string[],
): string {
  return [
    originalUserPrompt,
    '',
    'Previous invalid response:',
    previousResponse,
    '',
    'Validation errors:',
    ...errors.map((error) => `- ${error}`),
    '',
    'Fix the response and return valid JSON only.',
  ].join('\n');
}
