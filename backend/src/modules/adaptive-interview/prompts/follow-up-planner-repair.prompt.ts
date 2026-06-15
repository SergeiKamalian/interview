export const FOLLOW_UP_PLANNER_REPAIR_INSTRUCTION = [
  'Your previous response was invalid or incomplete.',
  'Return ONLY valid JSON with follow_up_question and reason.',
  'Do not add markdown fences or explanatory text.',
].join(' ');

export function buildFollowUpPlannerRepairUserPrompt(
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
