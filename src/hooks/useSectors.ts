import { useEffect, useState } from 'react';
import { apiFetch, isAbortError } from '../lib/apiClient';
import type { SectorSummary } from '../types/api';

export function useSectors() {
  const [sectors, setSectors] = useState<SectorSummary[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();

    apiFetch<{ items: SectorSummary[] }>('/sectors', {}, controller.signal)
      .then((res) => {
        setSectors(res.items);
        setStatus('success');
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setStatus('error');
      });

    return () => controller.abort();
  }, []);

  return { sectors, status };
}