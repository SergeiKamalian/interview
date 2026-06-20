import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Alert, Card, Input } from '@shared/ui';
import { formatUnixDate } from '@shared/lib/format';
import { cn } from '@shared/lib/utils';

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

function roleLabel(role: string): string {
  if (role === 'ai' || role === 'assistant') {
    return 'ИИ-интервьюер';
  }

  if (role === 'candidate' || role === 'user') {
    return 'Кандидат';
  }

  return role;
}

function localizeTranscriptText(text: string): string {
  return text.replace(/\bAI\b/g, 'ИИ');
}

function highlightText(text: string, query: string): ReactNode {
  if (!query.trim()) {
    return text;
  }

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={index}
        className="rounded bg-yellow-300/80 px-0.5 text-yellow-950 dark:bg-yellow-500/30 dark:text-yellow-100"
      >
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
    return segments.filter((segment) =>
      localizeTranscriptText(segment.content).toLowerCase().includes(q),
    );
  }, [segments, search]);

  if (segments.length === 0) {
    return (
      <Card header="Расшифровка">
        <Alert variant="info" title="Пока недоступно">
          Расшифровка появится после ответов кандидата.
        </Alert>
      </Card>
    );
  }

  return (
    <Card header="Расшифровка">
      <div className="mb-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по расшифровке…"
        />
      </div>
      <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
        {filtered.map((segment) => (
          <div
            key={segment.messageId}
            ref={(node) => {
              refs.current[segment.messageId] = node;
            }}
            className={cn(
              'rounded-lg border px-3 py-2 text-sm transition-colors',
              segment.role === 'ai'
                ? 'border-border bg-muted/35'
                : 'border-brand-primary/20 bg-brand-primary/5',
              highlightMessageId === segment.messageId && 'ring-2 ring-brand-primary',
            )}
            onClick={() => onSegmentClick?.(segment.messageId)}
          >
            <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="font-medium uppercase">{roleLabel(segment.role)}</span>
              <span>{formatUnixDate(segment.timestamp)}</span>
            </div>
            {segment.questionText && (
              <p className="mb-1 text-xs text-muted-foreground">
                Вопрос: {localizeTranscriptText(segment.questionText)}
              </p>
            )}
            <p className="whitespace-pre-wrap text-foreground">
              {highlightText(localizeTranscriptText(segment.content), search)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
