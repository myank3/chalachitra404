import { useState, useEffect, useCallback } from 'react';

export type EmbedStatus = 'loading' | 'ready' | 'failed';

export function useEmbedHealth(embedUrl: string, timeoutMs: number = 6000) {
  const [status, setStatus] = useState<EmbedStatus>('loading');

  useEffect(() => {
    if (!embedUrl) {
      setStatus('failed');
      return;
    }

    setStatus('loading');

    const timer = setTimeout(() => {
      setStatus((current) => (current === 'loading' ? 'failed' : current));
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [embedUrl, timeoutMs]);

  const setReady = useCallback(() => {
    setStatus('ready');
  }, []);

  return { status, setReady };
}
