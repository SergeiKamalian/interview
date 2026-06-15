import { useState } from 'react';
import { AnalyticsByTopicSkillQuestionPage } from './AnalyticsByTopicSkillQuestionPage';
import { AiCostAnalyticsPage } from './AiCostAnalyticsPage';
import { Button } from '@shared/ui';

type AnalyticsTab = 'quality' | 'cost';

export function AnalyticsPage() {
  const [tab, setTab] = useState<AnalyticsTab>('quality');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Analytics</h2>
          <p className="text-sm text-slate-500">
            Quality signals по topics/skills/questions и AI cost analytics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={tab === 'quality' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTab('quality')}
          >
            Quality
          </Button>
          <Button
            variant={tab === 'cost' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTab('cost')}
          >
            AI Cost
          </Button>
        </div>
      </div>

      {tab === 'quality' ? (
        <AnalyticsByTopicSkillQuestionPage />
      ) : (
        <AiCostAnalyticsPage />
      )}
    </div>
  );
}
