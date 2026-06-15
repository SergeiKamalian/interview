export type InterviewQuestionCheckpointEntity = {
  id: number;
  interviewQuestionId: number;
  checkpointKey: string;
  title: string;
  expected: string;
  score: number;
  sortOrder: number;
  createdAt: Date;
};
