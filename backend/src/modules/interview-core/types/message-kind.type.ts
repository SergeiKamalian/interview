export const MESSAGE_KINDS = [
  'welcome',
  'main_question',
  'main_answer',
  'follow_up_question',
  'follow_up_answer',
  'system_note',
] as const;

export type MessageKind = (typeof MESSAGE_KINDS)[number];
