import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type DashboardSummary } from '../services/api';
import { useSectors } from '../hooks/useSectors';


export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { sectors, status: sectorsStatus } = useSectors();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSectorClick = (sectorId: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate(`/sectors/${sectorId}/story`);
      });
    } else {
      navigate(`/sectors/${sectorId}/story`);
    }
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const summary = await api.getDashboardSummary();
        if (active) { 
          setData(summary);
        }
      } catch (err) {
        if (active) {
          const errMsg = err instanceof Error ? err.message : 'Failed to establish connection to Tuckersoft mainframe.';
          console.error('Failed to load dashboard summary:', err);
          setError(errMsg);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    api.getDashboardSummary()
      .then(setData)
      .catch((err) => {
        const errMsg = err instanceof Error ? err.message : 'Failed to establish connection to Tuckersoft mainframe.';
        console.error('Failed to load dashboard summary:', err);
        setError(errMsg);
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Title skeleton */}
        <div className="h-8 bg-gray-800 rounded-md w-1/4"></div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#0f111a] border border-indigo-500/10 rounded-xl p-6 h-32 flex flex-col justify-between">
              <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              <div className="h-8 bg-gray-800 rounded w-1/3"></div>
            </div>
          ))}
        </div>

        {/* Bottom panels skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#0f111a] border border-indigo-500/10 rounded-xl p-6 h-80">
            <div className="h-6 bg-gray-800 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-[#0f111a] border border-indigo-500/10 rounded-xl p-6 h-80">
            <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl max-w-md mb-6">
          <div className="text-rose-400 font-mono text-xs uppercase tracking-widest font-semibold mb-2">
            MAINFRAME_IO_ERROR
          </div>
          <p className="text-sm text-gray-400 font-mono">{error}</p>
        </div>
        <button
          onClick={handleRetry}
          className="px-6 py-2.5 font-mono text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all duration-300"
        >
          RECONNECT_MAINFRAME
        </button>
      </div>
    );
  }


  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="text-gray-400 font-mono text-sm tracking-wider">
          NO_DIAGNOSTICS_DATA_AVAILABLE
        </div>
      </div>
    );
  }

  const {
    totalTropels,
    criticalTropels,
    openSignals,
    sectorStabilityAvg,
    signalsBySeverity,
    generatedAt,
  } = data;

  // Stability color calculation
  const getStabilityColor = (val: number) => {
    if (val >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (val >= 60) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  };

  return (
    <div className="space-y-8">
      
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 pb-4 border-b border-indigo-500/5">
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-white m-0">COLONY OPERATIONAL REPORT</h2>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1">Real-time digital ecosystem telemetry</p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-gray-500 bg-gray-900/40 border border-indigo-500/5 px-3 py-1.5 rounded-lg">
          <span>LAST_UPDATE:</span>
          <span className="text-indigo-400 font-semibold">{new Date(generatedAt).toLocaleString()}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Tropels */}
        <div className="bg-[#0f111a] border border-indigo-500/10 rounded-xl p-6 shadow-lg shadow-black/30 hover:border-indigo-500/25 transition-all duration-300">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">Total Population</div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">{totalTropels}</span>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">CREATURES</span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Critical Tropels */}
        <div className="bg-[#0f111a] border border-indigo-500/10 rounded-xl p-6 shadow-lg shadow-black/30 hover:border-indigo-500/25 transition-all duration-300">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center">
            <span>Critical Status</span>
            {criticalTropels > 0 && (
              <span className="w-2 h-2 bg-rose-500 rounded-full ml-2 animate-ping"></span>
            )}
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-3xl font-extrabold tracking-tight ${criticalTropels > 0 ? 'text-rose-400' : 'text-white'}`}>
              {criticalTropels}
            </span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${criticalTropels > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-gray-800 text-gray-400'}`}>
              CRITICAL
            </span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-1.5 rounded-full ${criticalTropels > 0 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
              style={{ width: `${Math.min((criticalTropels / Math.max(totalTropels, 1)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Open Signals */}
        <div className="bg-[#0f111a] border border-indigo-500/10 rounded-xl p-6 shadow-lg shadow-black/30 hover:border-indigo-500/25 transition-all duration-300">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">Active Alerts</div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-amber-400">{openSignals}</span>
            <span className="text-xs font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-amber-300">UNRESOLVED</span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        {/* Sector Stability */}
        <div className="bg-[#0f111a] border border-indigo-500/10 rounded-xl p-6 shadow-lg shadow-black/30 hover:border-indigo-500/25 transition-all duration-300">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">Sector Stability</div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">{sectorStabilityAvg}%</span>
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${getStabilityColor(sectorStabilityAvg)}`}>
              {sectorStabilityAvg >= 80 ? 'STABLE' : sectorStabilityAvg >= 60 ? 'CAUTION' : 'DANGER'}
            </span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-1.5 rounded-full ${
                sectorStabilityAvg >= 80 ? 'bg-emerald-400' : sectorStabilityAvg >= 60 ? 'bg-amber-400' : 'bg-rose-500'
              }`} 
              style={{ width: `${sectorStabilityAvg}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Breakdowns section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Severity levels breakdown */}
        <div className="lg:col-span-2 bg-[#0f111a] border border-indigo-500/10 rounded-xl p-6 shadow-lg shadow-black/30">
          <h3 className="text-base font-semibold text-white tracking-wide mb-6 uppercase flex items-center">
            <span className="w-1.5 h-4 bg-indigo-500 rounded mr-2 inline-block"></span>
            Alert Severity Breakdown
          </h3>
          
          <div className="space-y-5">
            {/* Critical */}
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-1.5">
                <span className="text-rose-400 font-bold">CRITICAL</span>
                <span>{signalsBySeverity.CRITICO} signals</span>
              </div>
              <div className="w-full bg-gray-900 h-2.5 rounded border border-rose-500/10 overflow-hidden">
                <div 
                  className="bg-rose-500 h-2.5 rounded"
                  style={{ 
                    width: `${(signalsBySeverity.CRITICO / Math.max(openSignals, 1)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Grave */}
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-1.5">
                <span className="text-orange-400 font-bold">GRAVE</span>
                <span>{signalsBySeverity.GRAVE} signals</span>
              </div>
              <div className="w-full bg-gray-900 h-2.5 rounded border border-orange-500/10 overflow-hidden">
                <div 
                  className="bg-orange-500 h-2.5 rounded"
                  style={{ 
                    width: `${(signalsBySeverity.GRAVE / Math.max(openSignals, 1)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Moderado */}
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-1.5">
                <span className="text-yellow-400 font-bold">MODERADO</span>
                <span>{signalsBySeverity.MODERADO} signals</span>
              </div>
              <div className="w-full bg-gray-900 h-2.5 rounded border border-yellow-500/10 overflow-hidden">
                <div 
                  className="bg-yellow-500 h-2.5 rounded"
                  style={{ 
                    width: `${(signalsBySeverity.MODERADO / Math.max(openSignals, 1)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Leve */}
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-1.5">
                <span className="text-blue-400 font-bold">LEVE</span>
                <span>{signalsBySeverity.LEVE} signals</span>
              </div>
              <div className="w-full bg-gray-900 h-2.5 rounded border border-blue-500/10 overflow-hidden">
                <div 
                  className="bg-blue-500 h-2.5 rounded"
                  style={{ 
                    width: `${(signalsBySeverity.LEVE / Math.max(openSignals, 1)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

          </div>
        </div>

        {/* System Diagnostics panel */}
        <div className="bg-[#0f111a] border border-indigo-500/10 rounded-xl p-6 shadow-lg shadow-black/30">
          <h3 className="text-base font-semibold text-white tracking-wide mb-6 uppercase flex items-center">
            <span className="w-1.5 h-4 bg-purple-500 rounded mr-2 inline-block"></span>
            System Diagnostics
          </h3>
          
          <div className="space-y-4 font-mono text-xs text-gray-400">
            <div className="p-3 bg-[#07080c] rounded border border-indigo-500/5 space-y-1">
              <div className="text-[10px] text-gray-500">DIAGNOSTIC_MODE</div>
              <div className="text-emerald-400 font-semibold tracking-wide">SECURE_MONITORING</div>
            </div>

            <div className="p-3 bg-[#07080c] rounded border border-indigo-500/5 space-y-1">
              <div className="text-[10px] text-gray-500">SECTORS_ACCESSED</div>
              <div className="text-indigo-300 font-semibold">12 ACTIVE UNITS</div>
            </div>

            <div className="p-3 bg-[#07080c] rounded border border-indigo-500/5 space-y-1">
              <div className="text-[10px] text-gray-500">OPERATIONAL_PROTOCOL</div>
              <div className="text-indigo-300 font-semibold">PIZZA_PROTOCOL_V1</div>
            </div>

            <div className="pt-2 text-center text-[10px] text-gray-600">
              COMMUNICATION LINK: SECURE_SOCKET
            </div>
          </div>
        </div>

      </div>

      {/* Sectors Grid for Checkpoint 5 */}
      <div className="bg-[#0f111a] border border-indigo-500/10 rounded-xl p-6 shadow-lg shadow-black/30">
        <h3 className="text-base font-semibold text-white tracking-wide mb-6 uppercase flex items-center">
          <span className="w-1.5 h-4 bg-emerald-500 rounded mr-2 inline-block"></span>
          Ecosistemas de la Colonia (Sectores)
        </h3>

        {sectorsStatus === 'loading' && (
          <div className="text-sm text-gray-500 font-mono">Cargando sectores...</div>
        )}

        {sectorsStatus === 'error' && (
          <div className="text-sm text-rose-400 font-mono">Error al cargar telemetría de sectores.</div>
        )}

        {sectorsStatus === 'success' && sectors.length === 0 && (
          <div className="text-sm text-gray-500 font-mono">No hay sectores disponibles.</div>
        )}

        {sectorsStatus === 'success' && sectors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectors.map((sector) => {
              const stability = sector.stabilityLevel;
              const stabilityColor = stability >= 80 ? 'text-emerald-400' : stability >= 60 ? 'text-amber-400' : 'text-rose-500';
              const stabilityBg = stability >= 80 ? 'bg-emerald-500' : stability >= 60 ? 'bg-amber-500' : 'bg-rose-500';

              return (
                <div
                  key={sector.id}
                  onClick={() => handleSectorClick(sector.id)}
                  className="p-4 bg-[#07080c] border border-indigo-500/5 hover:border-indigo-500/30 rounded-lg cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 group hover:shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">{sector.sectorCode}</span>
                      <h4 className="text-sm font-semibold text-white mt-2 group-hover:text-indigo-400 transition-colors">{sector.name}</h4>
                    </div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase">{sector.climate.replace('_', ' ')}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-gray-500">ESTABILIDAD</span>
                      <span className={stabilityColor}>{stability}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                      <div className={`h-full ${stabilityBg} transition-all duration-500`} style={{ width: `${stability}%` }} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono border-t border-indigo-500/5 pt-3">
                    <span className="text-gray-500">CARGA: <strong className="text-gray-300">{sector.currentLoad} / {sector.capacity}</strong></span>
                    <span className="text-indigo-400 text-[10px] group-hover:translate-x-1 transition-transform inline-block">VER NARRATIVA →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
