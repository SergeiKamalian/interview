import { useTopicSkillQuestionAnalyticsQuery } from '@entities/analytics/api/topicSkillQuestionApi';
import { formatScore } from '@shared/lib/format';
import { Alert, Card, Spinner } from '@shared/ui';

export function AnalyticsByTopicSkillQuestionPage() {
  const { data, isLoading, isError, error } = useTopicSkillQuestionAnalyticsQuery({});

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Spinner />
        Загрузка quality analytics…
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="error" title="Не удалось загрузить аналитику">
        {'message' in (error as object)
          ? String((error as { message: string }).message)
          : 'Unknown error'}
      </Alert>
    );
  }

  if (!data || data.totalCompletedAttempts === 0) {
    return (
      <Alert variant="info" title="Недостаточно данных">
        Нужны завершённые интервью с AI-оценкой.
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {data.lowSampleWarning && (
        <Alert variant="info" title="Мало данных для выводов">
          Завершённых интервью: {data.totalCompletedAttempts}. Минимальный порог — 5.
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <Card header="Topics (weak first)">
          <div className="space-y-2 text-sm">
            {data.topics.map((topic) => (
              <div key={topic.topicName} className="flex justify-between gap-2">
                <span>{topic.topicName}</span>
                <span className="text-slate-600">
                  {formatScore(topic.avgScore)} · pass {(topic.passRate * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card header="Strongest skills">
          <div className="space-y-2 text-sm">
            {data.skills.map((skill) => (
              <div key={skill.skillName} className="flex justify-between gap-2">
                <span>{skill.skillName}</span>
                <span className="text-slate-600">
                  {formatScore(skill.avgScore)} · n={skill.sampleCount}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card header="Questions (weak first)">
          <div className="space-y-3 text-sm">
            {data.questions.map((question) => (
              <div key={question.questionId}>
                <p className="font-medium text-slate-800">{question.questionText}</p>
                <p className="text-slate-600">
                  {formatScore(question.avgScore)} · pass {(question.passRate * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
