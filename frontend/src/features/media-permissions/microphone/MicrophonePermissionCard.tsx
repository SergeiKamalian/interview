import { Alert, Button } from '@shared/ui';
import {
  useMicrophonePermission,
  type MicrophonePermissionStatus,
} from './useMicrophonePermission';

const statusCopy: Record<
  MicrophonePermissionStatus,
  { title: string; description: string }
> = {
  granted: {
    title: 'Микрофон подключен',
    description:
      'Можно записать голосовой ответ ниже или продолжить отвечать текстом.',
  },
  prompt: {
    title: 'Голосовой ответ',
    description:
      'Чтобы записать аудиоответ, разрешите доступ к микрофону. Запрос появится только после нажатия кнопки.',
  },
  denied: {
    title: 'Микрофон заблокирован',
    description:
      'Разрешите доступ в настройках браузера для этой страницы или продолжайте интервью текстом.',
  },
  unavailable: {
    title: 'Микрофон недоступен',
    description:
      'Браузер или устройство не поддерживает доступ к микрофону. Текстовый ответ остается доступен.',
  },
};

function resolveAlertVariant(status: MicrophonePermissionStatus) {
  if (status === 'granted') {
    return 'success';
  }

  if (status === 'denied' || status === 'unavailable') {
    return 'error';
  }

  return 'info';
}

type MicrophonePermissionCardProps = {
  status?: MicrophonePermissionStatus;
  isRequesting?: boolean;
  errorMessage?: string | null;
  requestPermission?: () => Promise<void>;
};

export function MicrophonePermissionCard(props: MicrophonePermissionCardProps = {}) {
  const internal = useMicrophonePermission();
  const status = props.status ?? internal.status;
  const isRequesting = props.isRequesting ?? internal.isRequesting;
  const errorMessage = props.errorMessage ?? internal.errorMessage;
  const requestPermission =
    props.requestPermission ?? internal.requestPermission;

  const copy = statusCopy[status];
  const canRequest = status === 'prompt' || status === 'denied';

  return (
    <Alert variant={resolveAlertVariant(status)} title={copy.title}>
      <div className="space-y-3">
        <p>{errorMessage ?? copy.description}</p>

        {canRequest ? (
          <Button
            size="sm"
            loading={isRequesting}
            disabled={isRequesting}
            onClick={() => void requestPermission()}
          >
            Разрешить микрофон
          </Button>
        ) : null}

        {status === 'denied' ? (
          <p className="text-xs">
            Обычно доступ можно вернуть через иконку замка в адресной строке,
            затем обновить страницу интервью.
          </p>
        ) : null}
      </div>
    </Alert>
  );
}
