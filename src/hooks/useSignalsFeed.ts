import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch, ApiError, buildQueryString, isAbortError } from '../lib/apiClient';
import type { Severity, SignalDTO, SignalStatus, SignalType, SignalsFeedResponse } from '../types/api';

export interface SignalFeedFilters {
  signalType: SignalType | '';
  severity: Severity | '';
  status: SignalStatus | '';
  q: string;
}

function parseFilters(params: URLSearchParams): SignalFeedFilters {
  return {
    signalType: (params.get('signalType') as SignalType) ?? '',
    severity: (params.get('severity') as Severity) ?? '',
    status: (params.get('status') as SignalStatus) ?? '',
    q: (params.get('q') ?? '').slice(0, 80),
  };
}

export function useSignalFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFilters(searchParams);

  const updateFilters = useCallback(
    (patch: Partial<SignalFeedFilters>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([key, value]) => {
          if (value === '' || value === undefined || value === null) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        });
        return next;
      });
    },
    [setSearchParams]
  );

  return { filters, updateFilters };
}

type FeedStatus = 'idle' | 'loading' | 'loading-more' | 'success' | 'error';

/**
 * Feed cursor-based de Senales.
 * - Una sola carga en vuelo a la vez (isLoadingRef).
 * - Deduplica por id entre paginas (seenIdsRef).
 * - Cambiar filtros reinicia desde cero; un loadMore fallido conserva lo ya cargado.
 */
export function useSignalsFeed(filters: SignalFeedFilters, limit = 15) {
  const [items, setItems] = useState<SignalDTO[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState<FeedStatus>('idle');
  const [error, setError] = useState<ApiError | null>(null);

  const isLoadingRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const fetchPage = useCallback(
    (cursor: string | null, isReset: boolean) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setStatus(isReset ? 'loading' : 'loading-more');
      setError(null);

      const qs = buildQueryString({
        cursor: cursor ?? undefined,
        limit,
        signalType: filters.signalType,
        severity: filters.severity,
        status: filters.status,
        q: filters.q,
      });

      apiFetch<SignalsFeedResponse>(`/signals/feed${qs}`, {}, controller.signal)
        .then((res) => {
          const fresh = res.items.filter((it) => !seenIdsRef.current.has(it.id));
          fresh.forEach((it) => seenIdsRef.current.add(it.id));
          setItems((prev) => (isReset ? fresh : [...prev, ...fresh]));
          setNextCursor(res.nextCursor);
          setHasMore(res.hasMore);
          setStatus('success');
        })
        .catch((err) => {
          if (isAbortError(err)) return;
          setStatus('error');
          setError(err instanceof ApiError ? err : new ApiError(0, 'NETWORK_ERROR', 'Error de red'));
        })
        .finally(() => {
          isLoadingRef.current = false;
        });
    },
    [limit, filters.signalType, filters.severity, filters.status, filters.q]
  );

  // Cambiar filtros reinicia el feed desde cero.
  useEffect(() => {
    seenIdsRef.current = new Set();
    setItems([]);
    setNextCursor(null);
    setHasMore(true);
    fetchPage(null, true);
    return () => controllerRef.current?.abort();
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingRef.current) return;
    fetchPage(nextCursor, false);
  }, [hasMore, nextCursor, fetchPage]);

  // Si el ultimo intento fallo, reintenta la misma pagina sin borrar lo ya cargado.
  const retry = useCallback(() => {
    fetchPage(nextCursor, items.length === 0);
  }, [fetchPage, nextCursor, items.length]);

  return { items, status, error, hasMore, loadMore, retry };
}