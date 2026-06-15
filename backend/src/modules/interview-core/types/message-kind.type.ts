export const MESSAGE_KINDS = [
  'main_question',
  'main_answer',
  'follow_up_question',
  'follow_up_answer',
  'system_note',
] as const;

export type MessageKind = (typeof MESSAGE_KINDS)[number];
