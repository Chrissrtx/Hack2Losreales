import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch, ApiError, buildQueryString, isAbortError } from '../lib/apiClient';
import type { Species, TropelPage, VitalState } from '../types/api';

export type TropelSort = 'name,asc' | 'updatedAt,desc' | 'chaosIndex,desc';
export type TropelSize = 10 | 20 | 50;

export interface TropelFilters {
  page: number;
  size: TropelSize;
  species: Species | '';
  vitalState: VitalState | '';
  sectorId: string;
  q: string;
  sort: TropelSort;
}

const VALID_SIZES: TropelSize[] = [10, 20, 50];
const VALID_SORTS: TropelSort[] = ['name,asc', 'updatedAt,desc', 'chaosIndex,desc'];

function parseFilters(params: URLSearchParams): TropelFilters {
  const pageRaw = Number(params.get('page'));
  const sizeRaw = Number(params.get('size'));
  const sortRaw = params.get('sort') as TropelSort | null;

  return {
    page: Number.isInteger(pageRaw) && pageRaw >= 0 ? pageRaw : 0,
    size: VALID_SIZES.includes(sizeRaw as TropelSize) ? (sizeRaw as TropelSize) : 20,
    species: (params.get('species') as Species) ?? '',
    vitalState: (params.get('vitalState') as VitalState) ?? '',
    sectorId: params.get('sectorId') ?? '',
    q: (params.get('q') ?? '').slice(0, 80),
    sort: sortRaw && VALID_SORTS.includes(sortRaw) ? sortRaw : 'updatedAt,desc',
  };
}

/** Lee y escribe los filtros de Tropeles directamente en los searchParams de la URL. */
export function useTropelFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  // Cambiar cualquier filtro (que no sea `page`) siempre vuelve a la pagina 0.
  const updateFilters = useCallback(
    (patch: Partial<Omit<TropelFilters, 'page'>>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([key, value]) => {
          if (value === '' || value === undefined || value === null) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        });
        next.set('page', '0');
        return next;
      });
    },
    [setSearchParams]
  );

  const setPage = useCallback(
    (page: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(Math.max(0, page)));
        return next;
      });
    },
    [setSearchParams]
  );

  return { filters, updateFilters, setPage };
}

/** Trae la pagina de Tropeles correspondiente a `filters`, descartando respuestas tardias. */
export function useTropeles(filters: TropelFilters) {
  const [data, setData] = useState<TropelPage | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    setStatus('loading');
    setError(null);

    const qs = buildQueryString({
      page: filters.page,
      size: filters.size,
      species: filters.species,
      vitalState: filters.vitalState,
      sectorId: filters.sectorId,
      q: filters.q,
      sort: filters.sort,
    });

    apiFetch<TropelPage>(`/tropels${qs}`, {}, controller.signal)
      .then((res) => {
        if (requestIdRef.current !== requestId) return; // llego tarde: se descarta
        setData(res);
        setStatus('success');
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        if (requestIdRef.current !== requestId) return;
        setStatus('error');
        setError(err instanceof ApiError ? err : new ApiError(0, 'NETWORK_ERROR', 'Error de red'));
      });

    return () => controller.abort();
  }, [filters.page, filters.size, filters.species, filters.vitalState, filters.sectorId, filters.q, filters.sort]);

  return { data, status, error };
}