import { RouterProvider } from 'react-router-dom';
import { AppBootstrap } from '@app/providers/AppBootstrap';
import { router } from '@app/router';
import '@features/auth/api/authApi';
import '@entities/interview/api/interviewsApi';
import '@entities/interview/api/interviewTranscriptApi';
import '@entities/candidate/api/candidatesApi';
import '@entities/candidate/api/candidateReportApi';
import '@entities/candidate/api/shortlistApi';
import '@entities/evaluation/api/checkpointResultsApi';
import '@entities/evaluation/api/finalEvaluationApi';
import '@entities/evaluation/api/evaluationApi';
import '@entities/analytics/api/topicSkillQuestionApi';
import '@entities/analytics/api/aiCostApi';

export function App() {
  return (
    <AppBootstrap>
      <RouterProvider router={router} />
    </AppBootstrap>
  );
}
