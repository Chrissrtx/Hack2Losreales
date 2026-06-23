import { useEffect, useRef, useState } from 'react';
import { useSignalFilters, useSignalsFeed } from '../hooks/useSignalsFeed';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { Severity, SignalStatus, SignalType } from '../types/api';

const SIGNAL_TYPE_OPTIONS: SignalType[] = [
  'HAMBRE', 'ABANDONO', 'MUTACION', 'FUGA', 'CONFLICTO', 'REPRODUCCION_MASIVA', 'SENAL_CORRUPTA',
];
const SEVERITY_OPTIONS: Severity[] = ['LEVE', 'MODERADO', 'GRAVE', 'CRITICO'];
const STATUS_OPTIONS: SignalStatus[] = ['RECIBIDA', 'PROCESANDO', 'ATENDIDA'];

const SEVERITY_COLOR: Record<Severity, string> = {
  LEVE: 'bg-sky-100 text-sky-800',
  MODERADO: 'bg-amber-100 text-amber-800',
  GRAVE: 'bg-orange-100 text-orange-800',
  CRITICO: 'bg-red-100 text-red-800',
};

export default function SignalsFeedPage() {
  const { filters, updateFilters } = useSignalFilters();

  const [qInput, setQInput] = useState(filters.q);
  const debouncedQ = useDebouncedValue(qInput, 350);

  useEffect(() => {
    if (debouncedQ !== filters.q) updateFilters({ q: debouncedQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const { items, status, error, hasMore, loadMore, retry } = useSignalsFeed(filters);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Feed de Senales</h1>

      <div className="flex flex-wrap gap-3">
        <input
          value={qInput}
          onChange={(e) => setQInput(e.target.value.slice(0, 80))}
          placeholder="Buscar..."
          className="border rounded px-3 py-2 text-sm flex-1 min-w-[180px]"
        />
        <select
          value={filters.signalType}
          onChange={(e) => updateFilters({ signalType: e.target.value as SignalType | '' })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Todo tipo</option>
          {SIGNAL_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filters.severity}
          onChange={(e) => updateFilters({ severity: e.target.value as Severity | '' })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Toda severidad</option>
          {SEVERITY_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => updateFilters({ status: e.target.value as SignalStatus | '' })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Todo estado</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="min-h-[420px] space-y-2">
        {status === 'loading' && items.length === 0 && (
          <p className="text-sm text-gray-500">Cargando feed...</p>
        )}

        {items.length === 0 && status === 'success' && (
          <p className="text-sm text-gray-500">No hay Senales que coincidan con estos filtros.</p>
        )}

        {items.map((signal) => (
          <div key={signal.id} className="border rounded p-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{signal.tropel.name} ({signal.tropel.species})</p>
              <p className="text-sm text-gray-600">{signal.rawContent}</p>
              <p className="text-xs text-gray-400">{signal.signalType} &middot; {signal.status}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${SEVERITY_COLOR[signal.severity]}`}>
              {signal.severity}
            </span>
          </div>
        ))}

        {status === 'error' && (
          <div className="text-sm text-red-600 flex items-center gap-2">
            <span>No se pudo cargar{error ? `: ${error.message}` : ''}.</span>
            <button onClick={retry} className="underline">Reintentar</button>
          </div>
        )}

        {status === 'loading-more' && (
          <p className="text-sm text-gray-400">Cargando mas...</p>
        )}

        {!hasMore && items.length > 0 && status !== 'error' && (
          <p className="text-sm text-gray-400 text-center py-2">No hay mas Senales.</p>
        )}

        <div ref={sentinelRef} aria-hidden className="h-1" />
      </div>
    </div>
  );
}