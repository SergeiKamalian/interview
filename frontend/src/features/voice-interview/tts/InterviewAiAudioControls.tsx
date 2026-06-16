import type { InterviewAiAudioState } from '@features/voice-interview/tts/useInterviewAiAudio';
import { Button } from '@shared/ui';

type InterviewAiAudioControlsProps = {
  audioState: InterviewAiAudioState | null;
  onReplay: () => void;
};

function resolveStatusLabel(audioState: InterviewAiAudioState): string {
  switch (audioState.status) {
    case 'buffering':
      return 'Готовим озвучку…';
    case 'playing':
      return 'Воспроизводим вопрос…';
    case 'ready':
      return 'Нажмите «Слушать», чтобы озвучить вопрос';
    case 'ended':
      return 'Вопрос озвучен';
    case 'error':
      return 'Озвучка недоступна';
    default:
      return 'Озвучка';
  }
}

export function InterviewAiAudioControls({
  audioState,
  onReplay,
}: InterviewAiAudioControlsProps) {
  if (!audioState) {
    return null;
  }

  const canReplay =
    (audioState.status === 'ready' ||
      audioState.status === 'ended' ||
      audioState.status === 'error') &&
    Boolean(audioState.objectUrl);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
      <span>{resolveStatusLabel(audioState)}</span>
      {canReplay ? (
        <Button type="button" variant="secondary" size="sm" onClick={onReplay}>
          {audioState.status === 'ended' ? 'Повторить' : 'Слушать'}
        </Button>
      ) : null}
    </div>
  );
}
