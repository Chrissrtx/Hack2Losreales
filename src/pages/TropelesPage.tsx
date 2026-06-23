import { useEffect, useState } from 'react';
import { useTropelFilters, useTropeles } from '../hooks/useTropeles';
import { useSectors } from '../hooks/useSectors';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { Species, VitalState } from '../types/api';

const SPECIES_OPTIONS: Species[] = ['BLOBITO', 'CHISPA', 'GRUNON', 'DORMILON', 'GLITCHY'];
const VITAL_STATE_OPTIONS: VitalState[] = ['ESTABLE', 'HAMBRIENTO', 'AGITADO', 'MUTANDO', 'CRITICO'];

const VITAL_STATE_COLOR: Record<VitalState, string> = {
  ESTABLE: 'bg-emerald-100 text-emerald-800',
  HAMBRIENTO: 'bg-amber-100 text-amber-800',
  AGITADO: 'bg-orange-100 text-orange-800',
  MUTANDO: 'bg-purple-100 text-purple-800',
  CRITICO: 'bg-red-100 text-red-800',
};

export default function TropelesPage() {
  const { filters, updateFilters, setPage } = useTropelFilters();
  const { sectors } = useSectors();

  // Input local: escribir no debe disparar un fetch por cada tecla.
  const [qInput, setQInput] = useState(filters.q);
  const debouncedQ = useDebouncedValue(qInput, 350);

  useEffect(() => {
    if (debouncedQ !== filters.q) updateFilters({ q: debouncedQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  useEffect(() => {
    setQInput(filters.q);
  }, [filters.q]);

  const { data, status, error } = useTropeles(filters);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Atlas de Tropeles</h1>

      <div className="flex flex-wrap gap-3">
        <input
          value={qInput}
          onChange={(e) => setQInput(e.target.value.slice(0, 80))}
          placeholder="Buscar por nombre..."
          className="border rounded px-3 py-2 text-sm flex-1 min-w-[200px]"
        />

        <select
          value={filters.species}
          onChange={(e) => updateFilters({ species: e.target.value as Species | '' })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Toda especie</option>
          {SPECIES_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.vitalState}
          onChange={(e) => updateFilters({ vitalState: e.target.value as VitalState | '' })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Todo estado vital</option>
          {VITAL_STATE_OPTIONS.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <select
          value={filters.sectorId}
          onChange={(e) => updateFilters({ sectorId: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Todo sector</option>
          {sectors.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => updateFilters({ sort: e.target.value as typeof filters.sort })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="updatedAt,desc">Mas reciente</option>
          <option value="name,asc">Nombre A-Z</option>
          <option value="chaosIndex,desc">Mas caos</option>
        </select>
      </div>

      <div className="min-h-[420px]">
        {status === 'loading' && data && (
          <p className="text-xs text-gray-400 mb-2">Actualizando...</p>
        )}

        {status === 'loading' && !data && (
          <p className="text-sm text-gray-500">Cargando Tropeles...</p>
        )}

        {status === 'error' && (
          <p className="text-sm text-red-600">
            No se pudo cargar la lista{error ? `: ${error.message}` : ''}.
          </p>
        )}

        {status === 'success' && data && data.content.length === 0 && (
          <p className="text-sm text-gray-500">No hay Tropeles que coincidan con estos filtros.</p>
        )}

        {data && data.content.length > 0 && (
          <ul className="divide-y border rounded">
            {data.content.map((t) => (
              <li key={t.id} className="p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-gray-500">
                    {t.species} &middot; {t.sector.name} &middot; cuidador: {t.guardianName}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${VITAL_STATE_COLOR[t.vitalState]}`}>
                    {t.vitalState}
                  </span>
                  <span title="Indice de caos">⚡ {t.chaosIndex}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data && data.totalPages > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span>
            Pagina {data.currentPage + 1} de {data.totalPages} &middot; {data.totalElements} Tropeles
          </span>
          <div className="flex gap-2">
            <button
              disabled={filters.page <= 0}
              onClick={() => setPage(filters.page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={filters.page + 1 >= data.totalPages}
              onClick={() => setPage(filters.page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}