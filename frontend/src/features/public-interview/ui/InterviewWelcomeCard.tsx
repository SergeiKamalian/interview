import { InterviewAiAudioControls } from '@features/voice-interview/tts/InterviewAiAudioControls';
import type { InterviewAiAudioState } from '@features/voice-interview/tts/useInterviewAiAudio';
import { Button } from '@shared/ui';

type InterviewWelcomeCardProps = {
  welcomeMessage: string;
  isBeginning: boolean;
  aiAudioState?: InterviewAiAudioState | null;
  onReplayWelcome?: () => void;
  onBegin: () => Promise<void>;
};

export function InterviewWelcomeCard({
  welcomeMessage,
  isBeginning,
  aiAudioState,
  onReplayWelcome,
  onBegin,
}: InterviewWelcomeCardProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-900">
        <p className="mb-2 text-xs font-medium uppercase text-slate-500">
          Приветствие
        </p>
        <p className="whitespace-pre-wrap">{welcomeMessage}</p>
      </div>

      <InterviewAiAudioControls
        audioState={
          aiAudioState ?? {
            streamId: 'welcome-pending',
            mimeType: 'audio/mpeg',
            status: 'buffering',
            objectUrl: null,
          }
        }
        onReplay={() => onReplayWelcome?.()}
      />

      <Button
        onClick={() => void onBegin()}
        loading={isBeginning}
        disabled={isBeginning}
      >
        Начать интервью
      </Button>
    </div>
  );
}
