export type QuestionCheckpointEntity = {
  id: number;
  questionId: number;
  checkpointKey: string;
  title: string;
  expected: string;
  score: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};
