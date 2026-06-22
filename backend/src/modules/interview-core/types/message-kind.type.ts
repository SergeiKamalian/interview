export const MESSAGE_KINDS = [
  'welcome',
  'topic_opener',
  'topic_opener_answer',
  'main_question',
  'main_answer',
  'follow_up_question',
  'follow_up_answer',
  'system_note',
  'conduct_violation',
  'conduct_warning',
  'conduct_terminated',
] as const;

export type MessageKind = (typeof MESSAGE_KINDS)[number];
