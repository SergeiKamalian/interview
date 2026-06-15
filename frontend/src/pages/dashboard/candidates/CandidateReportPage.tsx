import { Link, useParams } from 'react-router-dom';
import { useCandidateReportQuery } from '@entities/candidate/api/candidateReportApi';
import { ShortlistToggleButton } from '@features/shortlist/ui/ShortlistToggleButton';
import { OverallScoreCard } from '@widgets/score/OverallScoreCard';
import { CategoryBreakdownChart } from '@widgets/score/CategoryBreakdownChart';
import { RecommendationCard } from '@widgets/score/RecommendationCard';
import { formatScore, formatUnixDate } from '@shared/lib/format';
import { Alert, Card, Spinner } from '@shared/ui';

export function CandidateReportPage() {
  const { candidateId = '' } = useParams();
  const { data, isLoading, isError, error } = useCandidateReportQuery(candidateId, {
    skip: !candidateId,
  });

  if (!candidateId) {
    return <Alert variant="error" title="Invalid route">Candidate id is missing.</Alert>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Spinner />
        Загрузка отчёта кандидата…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="error" title="Не удалось загрузить отчёт">
        {'message' in (error as object)
          ? String((error as { message: string }).message)
          : 'Candidate not found or access denied'}
      </Alert>
    );
  }

  const evaluation = data.latestFinalEvaluation;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{data.fullName}</h2>
        <p className="text-sm text-slate-500">{data.email}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card header="Profile">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd>{data.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">LinkedIn</dt>
              <dd>{data.linkedinUrl ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">GitHub</dt>
              <dd>{data.githubUrl ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Shortlist</dt>
              <dd className="font-medium">{data.shortlistStatus}</dd>
            </div>
          </dl>
        </Card>

        <Card header="Shortlist actions" className="lg:col-span-2">
          <ShortlistToggleButton
            candidateId={data.candidateId}
            shortlistStatus={data.shortlistStatus}
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <OverallScoreCard score={evaluation?.totalScore} />
        <RecommendationCard
          hireRecommendation={evaluation?.hireRecommendation}
          summary={evaluation?.summary}
          needsManualReview={evaluation?.needsManualReview}
        />
        <CategoryBreakdownChart items={evaluation?.categoryBreakdown ?? []} />
      </div>

      <Card header="Recommendations">
        {evaluation ? (
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <h4 className="mb-2 font-medium text-green-800">Strengths</h4>
              <ul className="list-disc space-y-1 pl-5 text-slate-700">
                {evaluation.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-amber-800">Weaknesses</h4>
              <ul className="list-disc space-y-1 pl-5 text-slate-700">
                {evaluation.weaknesses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-red-800">Risks</h4>
              <ul className="list-disc space-y-1 pl-5 text-slate-700">
                {evaluation.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Финальная оценка пока недоступна.</p>
        )}
      </Card>

      <Card header="Interview history">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-4">Interview</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Completed</th>
                <th className="py-2 pr-4">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.interviewHistory.map((item) => (
                <tr key={item.attemptId} className="border-t border-slate-100">
                  <td className="py-2 pr-4">
                    <Link
                      to={`/dashboard/interviews/${item.interviewId}?attemptId=${item.attemptId}`}
                      className="text-brand-primary hover:underline"
                    >
                      {item.interviewTitle}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{item.jobRole}</td>
                  <td className="py-2 pr-4">{item.status}</td>
                  <td className="py-2 pr-4">{formatUnixDate(item.completedAt)}</td>
                  <td className="py-2 pr-4">{formatScore(item.totalScore)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
