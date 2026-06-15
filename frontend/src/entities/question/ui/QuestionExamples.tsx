import type { QuestionAnswerExample } from '../model/types';

type QuestionExamplesProps = {
  examples: QuestionAnswerExample[];
};

export function QuestionExamples({ examples }: QuestionExamplesProps) {
  const goodExamples = examples.filter((item) => item.exampleType === 'good');
  const badExamples = examples.filter((item) => item.exampleType === 'bad');

  if (examples.length === 0) {
    return (
      <p className="text-sm text-slate-500">Примеры ответов не заданы.</p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
        <h4 className="mb-2 text-sm font-medium text-green-900">
          Хорошие ответы
        </h4>
        <ul className="space-y-2 text-sm text-green-900">
          {goodExamples.map((example) => (
            <li key={example.id} className="rounded bg-white/70 p-2">
              {example.exampleText}
            </li>
          ))}
          {goodExamples.length === 0 && (
            <li className="text-green-700">Нет примеров</li>
          )}
        </ul>
      </div>
      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
        <h4 className="mb-2 text-sm font-medium text-red-900">
          Плохие ответы
        </h4>
        <ul className="space-y-2 text-sm text-red-900">
          {badExamples.map((example) => (
            <li key={example.id} className="rounded bg-white/70 p-2">
              {example.exampleText}
            </li>
          ))}
          {badExamples.length === 0 && (
            <li className="text-red-700">Нет примеров</li>
          )}
        </ul>
      </div>
    </div>
  );
}
