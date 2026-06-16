import { useCallback, useEffect, useState } from 'react';

export type MicrophonePermissionStatus =
  | 'granted'
  | 'prompt'
  | 'denied'
  | 'unavailable';

type UseMicrophonePermissionResult = {
  status: MicrophonePermissionStatus;
  isRequesting: boolean;
  errorMessage: string | null;
  requestPermission: () => Promise<void>;
};

function isMicrophoneUnavailable(): boolean {
  return (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia !== 'function'
  );
}

function resolveRequestError(error: unknown): {
  status: MicrophonePermissionStatus;
  message: string;
} {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return {
        status: 'denied',
        message: 'Браузер заблокировал доступ к микрофону.',
      };
    }

    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return {
        status: 'unavailable',
        message: 'Микрофон не найден на устройстве.',
      };
    }
  }

  return {
    status: 'unavailable',
    message: 'Не удалось получить доступ к микрофону.',
  };
}

export function useMicrophonePermission(): UseMicrophonePermissionResult {
  const [status, setStatus] = useState<MicrophonePermissionStatus>(() =>
    isMicrophoneUnavailable() ? 'unavailable' : 'prompt',
  );
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isMicrophoneUnavailable() || !navigator.permissions?.query) {
      return;
    }

    let permissionStatus: PermissionStatus | null = null;
    let isMounted = true;

    void navigator.permissions
      .query({ name: 'microphone' as PermissionName })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        permissionStatus = result;
        setStatus(result.state);
        result.onchange = () => {
          setStatus(result.state);
          if (result.state !== 'denied') {
            setErrorMessage(null);
          }
        };
      })
      .catch(() => {
        if (isMounted) {
          setStatus('prompt');
        }
      });

    return () => {
      isMounted = false;
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (isMicrophoneUnavailable()) {
      setStatus('unavailable');
      setErrorMessage('Микрофон недоступен в этом браузере или устройстве.');
      return;
    }

    setIsRequesting(true);
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setStatus('granted');
    } catch (error) {
      const resolved = resolveRequestError(error);
      setStatus(resolved.status);
      setErrorMessage(resolved.message);
    } finally {
      setIsRequesting(false);
    }
  }, []);

  return {
    status,
    isRequesting,
    errorMessage,
    requestPermission,
  };
}
