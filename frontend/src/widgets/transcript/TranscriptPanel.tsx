import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Alert, Card, Input } from '@shared/ui';
import { formatUnixDate } from '@shared/lib/format';

type TranscriptSegment = {
  messageId: string;
  role: string;
  content: string;
  sequenceOrder: number;
  timestamp: number;
  questionText?: string | null;
  interviewQuestionId?: string | null;
};

type TranscriptPanelProps = {
  segments: TranscriptSegment[];
  highlightMessageId?: string | null;
  onSegmentClick?: (messageId: string) => void;
};

function highlightText(text: string, query: string): ReactNode {
  if (!query.trim()) {
    return text;
  }

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="rounded bg-yellow-200 px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function TranscriptPanel({
  segments,
  highlightMessageId,
  onSegmentClick,
}: TranscriptPanelProps) {
  const [search, setSearch] = useState('');
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return segments;
    return segments.filter((segment) => segment.content.toLowerCase().includes(q));
  }, [segments, search]);

  if (segments.length === 0) {
    return (
      <Card header="Transcript">
        <Alert variant="info" title="Not available yet">
          Transcript появится после ответов кандидата.
        </Alert>
      </Card>
    );
  }

  return (
    <Card header="Transcript">
      <div className="mb-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по transcript…"
        />
      </div>
      <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
        {filtered.map((segment) => (
          <div
            key={segment.messageId}
            ref={(node) => {
              refs.current[segment.messageId] = node;
            }}
            className={[
              'rounded-lg border px-3 py-2 text-sm',
              segment.role === 'ai' ? 'border-slate-200 bg-slate-50' : 'border-blue-100 bg-white',
              highlightMessageId === segment.messageId ? 'ring-2 ring-brand-primary' : '',
            ].join(' ')}
            onClick={() => onSegmentClick?.(segment.messageId)}
          >
            <div className="mb-1 flex items-center justify-between gap-2 text-xs text-slate-500">
              <span className="font-medium uppercase">{segment.role}</span>
              <span>{formatUnixDate(segment.timestamp)}</span>
            </div>
            {segment.questionText && (
              <p className="mb-1 text-xs text-slate-500">Q: {segment.questionText}</p>
            )}
            <p className="whitespace-pre-wrap text-slate-800">
              {highlightText(segment.content, search)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
