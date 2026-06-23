import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Stage {
  id: string;
  order: number;
  title: string;
  narrative: string;
  dominantEvent: string;
  metrics: {
    stability: number;
    energy: number;
    alerts: number;
  };
  assetKey: string;
  colorToken: string;
  progress: number;
}

interface Sector {
  id: string;
  name: string;
  climate: string;
}

interface StoryData {
  sector: Sector;
  stages: Stage[];
}

// Datos Mock detallados por Clima del Sector
const MOCK_STORIES: Record<string, StoryData> = {
  sec_001: {
    sector: {
      id: 'sec_001',
      name: 'Bosque de Pixeles (Sector Delta)',
      climate: 'PIXEL_FOREST'
    },
    stages: [
      {
        id: 'stage_1_0',
        order: 0,
        title: 'Primer Pulso Metálico',
        narrative: 'La actividad despierta entre pixeles verdes y musgo digital. Los sensores biológicos detectan la primera señal de pulso estable de los Blobitos nativos. El aire simulado registra niveles óptimos de humedad.',
        dominantEvent: 'HAMBRE',
        metrics: { stability: 95, energy: 88, alerts: 0 },
        assetKey: 'pixel-forest-dawn',
        colorToken: 'emerald',
        progress: 0.125
      },
      {
        id: 'stage_1_1',
        order: 1,
        title: 'Grito en las Hojas',
        narrative: 'Un silbido interrumpe la simulación. La especie Chispa emite sobrecargas eléctricas menores debido a un retraso de alimentación. La estabilidad del follaje digital cae un 5%.',
        dominantEvent: 'HAMBRE',
        metrics: { stability: 90, energy: 75, alerts: 1 },
        assetKey: 'pixel-forest-rustle',
        colorToken: 'teal',
        progress: 0.25
      },
      {
        id: 'stage_1_2',
        order: 2,
        title: 'Mutación Silenciosa',
        narrative: 'La humedad sube rápidamente y tres capullos de Glitchy comienzan a brillar en tonos ultravioleta. La etapa de mutación se ha disparado. Los operadores deben monitorear los niveles de caos.',
        dominantEvent: 'MUTACION',
        metrics: { stability: 82, energy: 78, alerts: 2 },
        assetKey: 'pixel-forest-glow',
        colorToken: 'indigo',
        progress: 0.375
      },
      {
        id: 'stage_1_3',
        order: 3,
        title: 'Corte de Enlace Sincrónico',
        narrative: 'Uno de los guardianes pierde conexión de telemetría. El sector queda temporalmente a merced de su propio algoritmo de auto-regulación. El pánico menor se propaga.',
        dominantEvent: 'ABANDONO',
        metrics: { stability: 70, energy: 60, alerts: 4 },
        assetKey: 'pixel-forest-mist',
        colorToken: 'purple',
        progress: 0.5
      },
      {
        id: 'stage_1_4',
        order: 4,
        title: 'Fuga de Partículas Lumínicas',
        narrative: 'Una fisura en el muro de contención del sector norte permite la filtración de Chispas hacia el exterior. Las alarmas de contención perimetral destellan en ámbar.',
        dominantEvent: 'FUGA',
        metrics: { stability: 55, energy: 48, alerts: 7 },
        assetKey: 'pixel-forest-leak',
        colorToken: 'amber',
        progress: 0.625
      },
      {
        id: 'stage_1_5',
        order: 5,
        title: 'Colisión de Frecuencias',
        narrative: 'Los Gruñones territoriales se disputan los nodos de carga de energía restantes en el claro del bosque. Ondas de choque de audio comprimido sacuden el suelo digital.',
        dominantEvent: 'CONFLICTO',
        metrics: { stability: 40, energy: 38, alerts: 9 },
        assetKey: 'pixel-forest-storm',
        colorToken: 'orange',
        progress: 0.75
      },
      {
        id: 'stage_1_6',
        order: 6,
        title: 'Inundación de Datos Corruptos',
        narrative: 'El buffer del sector colapsa por una avalancha de logs sin procesar. Texturas parpadeantes y bloques de color magenta invaden los árboles. Nivel crítico de corrupción.',
        dominantEvent: 'SENAL_CORRUPTA',
        metrics: { stability: 25, energy: 15, alerts: 14 },
        assetKey: 'pixel-forest-glitch',
        colorToken: 'rose',
        progress: 0.875
      },
      {
        id: 'stage_1_7',
        order: 7,
        title: 'Reinicio Holístico del Ecosistema',
        narrative: 'La consola de control room fuerza una purga total del buffer. Los pixeles corruptos se disuelven en una lluvia de datos cristalinos. El bosque vuelve a su calma original, listo para un nuevo ciclo.',
        dominantEvent: 'MUTACION',
        metrics: { stability: 90, energy: 95, alerts: 0 },
        assetKey: 'pixel-forest-rebirth',
        colorToken: 'violet',
        progress: 1.0
      }
    ]
  }
};

// Mapeo de colorToken a colores css y degradados
const COLOR_MAP: Record<string, { bg: string; border: string; glow: string; text: string; badge: string }> = {
  emerald: {
    bg: 'from-emerald-950/80 to-slate-950',
    border: 'border-emerald-500/50',
    glow: 'bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  teal: {
    bg: 'from-teal-950/80 to-slate-950',
    border: 'border-teal-500/50',
    glow: 'bg-teal-500/10 shadow-[0_0_50px_rgba(20,184,166,0.2)]',
    text: 'text-teal-400',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
  },
  indigo: {
    bg: 'from-indigo-950/80 to-slate-950',
    border: 'border-indigo-500/50',
    glow: 'bg-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.2)]',
    text: 'text-indigo-400',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
  },
  purple: {
    bg: 'from-purple-950/80 to-slate-950',
    border: 'border-purple-500/50',
    glow: 'bg-purple-500/10 shadow-[0_0_50px_rgba(168,85,247,0.2)]',
    text: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  amber: {
    bg: 'from-amber-950/80 to-slate-950',
    border: 'border-amber-500/50',
    glow: 'bg-amber-500/10 shadow-[0_0_50px_rgba(245,158,11,0.2)]',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  orange: {
    bg: 'from-orange-950/80 to-slate-950',
    border: 'border-orange-500/50',
    glow: 'bg-orange-500/10 shadow-[0_0_50px_rgba(249,115,22,0.2)]',
    text: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  },
  rose: {
    bg: 'from-rose-950/80 to-slate-950',
    border: 'border-rose-500/50',
    glow: 'bg-rose-500/10 shadow-[0_0_50px_rgba(244,63,94,0.2)]',
    text: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  },
  violet: {
    bg: 'from-violet-950/80 to-slate-950',
    border: 'border-violet-500/50',
    glow: 'bg-violet-500/10 shadow-[0_0_50px_rgba(139,92,246,0.2)]',
    text: 'text-violet-400',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
  }
};

export const SectorStory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => 
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Cargar datos (API con fallback a Mock usando la clave 'token' correcta del localStorage)
  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      setError(null);
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://hackaton-20261-front-587720740455.us-east1.run.app/api/v1';
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`${baseUrl}/sectors/${id || 'sec_001'}/story`, {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.warn('API call failed or not found. Falling back to local mock data.');
          const mockData = MOCK_STORIES[id || 'sec_001'] || MOCK_STORIES.sec_001;
          setData(mockData);
        }
      } catch (err) {
        console.warn('Error fetching API, using mock fallback:', err);
        const mockData = MOCK_STORIES[id || 'sec_001'] || MOCK_STORIES.sec_001;
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  // Detección de prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Intersection Observer para detectar etapa activa en el scroll
  useEffect(() => {
    if (!data || data.stages.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const order = parseInt(entry.target.getAttribute('data-order') || '0', 10);
          setActiveStage(order);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.story-stage-section');
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-slate-200">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-800 border-t-purple-500"></div>
          <span className="absolute text-xs font-semibold tracking-widest text-purple-400 uppercase">SYS</span>
        </div>
        <p className="mt-4 text-sm font-mono tracking-widest text-slate-400">CARGANDO SEC-STORY ENGINE...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-rose-400 px-6 text-center">
        <svg className="h-12 w-12 text-rose-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-bold tracking-wide font-mono">ERROR DE INICIALIZACIÓN</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md">No se pudo cargar la telemetría del sector. Por favor, verifica tu conexión o las variables del backend.</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-6 px-5 py-2 rounded border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-mono transition"
        >
          REGRESAR A LA CONSOLA
        </button>
      </div>
    );
  }

  const { sector, stages } = data;
  const currentStage = stages.find(s => s.order === activeStage) || stages[0];
  const colorStyles = COLOR_MAP[currentStage.colorToken] || COLOR_MAP.emerald;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && activeStage < stages.length - 1) {
      e.preventDefault();
      const nextEl = document.querySelector(`[data-order="${activeStage + 1}"]`);
      nextEl?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    } else if (e.key === 'ArrowUp' && activeStage > 0) {
      e.preventDefault();
      const prevEl = document.querySelector(`[data-order="${activeStage - 1}"]`);
      prevEl?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <div 
      className={`min-h-screen w-full bg-gradient-to-b ${colorStyles.bg} transition-all duration-1000 ease-in-out text-slate-100 font-sans flex flex-col md:flex-row relative overflow-hidden`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Storytelling interactivo del sector"
    >
      {/* CAPA DE LUCES AMBIENTALES Y MICRO-ANIMACIONES */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${colorStyles.glow} opacity-30 mix-blend-screen z-0`} />
      
      {/* EFECTO DE LÍNEAS DE RETÍCULA DIGITAL */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/20 to-slate-950 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_95%,_rgba(0,0,0,0.15)_95%)] bg-[length:100%_4px] pointer-events-none opacity-20 z-10" />

      {/* COLUMNA IZQUIERDA: PANEL DE CONTROL Y METRICAS VISUALES (STICKY) */}
      <div className="w-full md:w-[40%] md:h-screen md:sticky md:top-0 z-20 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/45 backdrop-blur-md">
        
        {/* CABECERA */}
        <div>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                if (document.startViewTransition) {
                  document.startViewTransition(() => navigate('/dashboard'));
                } else {
                  navigate('/dashboard');
                }
              }}
              className="text-xs font-mono font-bold tracking-widest text-slate-400 hover:text-slate-200 transition flex items-center gap-2 group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform inline-block">←</span> VOLVER AL DASHBOARD
            </button>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest border uppercase ${colorStyles.badge}`}>
              {sector.climate.replace('_', ' ')}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white uppercase font-mono">
            {sector.name}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">TELEMETRÍA DE HISTORIA RECONSTRUIDA</p>
        </div>

        {/* MOTOR DE VISUALIZACIÓN DINÁMICO */}
        <div className="my-8 flex-grow flex flex-col justify-center gap-6">
          
          <div className={`aspect-video w-full rounded-lg border ${colorStyles.border} bg-slate-950/60 p-4 relative overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-700`}>
            {/* GRID ANIMADO */}
            <div className="absolute inset-0 opacity-10 flex flex-wrap gap-1 p-2">
              {Array.from({ length: 48 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-6 h-6 rounded transition-all duration-1000 ${
                    (i + activeStage) % 3 === 0 ? 'bg-slate-100' : 'bg-transparent'
                  }`}
                  style={{
                    animationDelay: `${i * 30}ms`,
                    transform: `scale(${1 + (activeStage * 0.05)})`
                  }}
                />
              ))}
            </div>

            <div className="z-10 flex justify-between items-start">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">EVENTO ACTIVO</span>
              <span className={`text-xs font-mono font-bold tracking-wider ${colorStyles.text}`}>
                {currentStage.dominantEvent}
              </span>
            </div>

            <div className="z-10 flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono text-slate-400">FASE DE HISTORIA</span>
                <span className="text-2xl font-bold font-mono text-white">0{activeStage + 1} <span className="text-sm text-slate-500">/ 08</span></span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700 ease-out`}
                  style={{ width: `${(activeStage + 1) * 12.5}%` }}
                />
              </div>
            </div>
          </div>

          {/* INDICADORES CLAVE */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">ESTABILIDAD</div>
              <div className={`text-2xl font-bold font-mono mt-1 transition-all duration-700 ${
                currentStage.metrics.stability > 70 ? 'text-emerald-400' : currentStage.metrics.stability > 40 ? 'text-amber-400' : 'text-rose-500'
              }`}>
                {currentStage.metrics.stability}%
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">ENERGÍA</div>
              <div className="text-2xl font-bold font-mono mt-1 text-sky-400">
                {currentStage.metrics.energy}%
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">ALERTAS</div>
              <div className={`text-2xl font-bold font-mono mt-1 ${
                currentStage.metrics.alerts > 5 ? 'text-rose-500 animate-pulse' : currentStage.metrics.alerts > 0 ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {currentStage.metrics.alerts}
              </div>
            </div>
          </div>

        </div>

        {/* NAVEGACIÓN MANUAL RAPIDA */}
        <div className="border-t border-slate-900 pt-4 flex justify-between items-center text-xs font-mono text-slate-500">
          <span>USAR SCROLL O FLECHAS</span>
          <div className="flex gap-1.5">
            {stages.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  const targetEl = document.querySelector(`[data-order="${idx}"]`);
                  targetEl?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                }}
                className={`w-2.5 h-2.5 rounded-full border transition-all ${
                  idx === activeStage 
                    ? 'bg-white border-white scale-125' 
                    : 'bg-transparent border-slate-600 hover:border-slate-400'
                }`}
                aria-label={`Ir a etapa ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* COLUMNA DERECHA: TEXTOS NARRATIVOS (SCROLL) */}
      <div 
        ref={scrollContainerRef}
        className="w-full md:w-[60%] h-auto md:h-screen md:overflow-y-auto px-6 md:px-12 scroll-smooth flex flex-col z-20 select-none pb-24 md:pb-0"
      >
        {stages.map((stage, idx) => {
          const isSelected = idx === activeStage;
          return (
            <section
              key={stage.id}
              data-order={idx}
              className="story-stage-section min-h-[75vh] md:min-h-screen flex flex-col justify-center py-16 outline-none focus:ring-1 focus:ring-slate-800 rounded-lg transition-opacity duration-700"
              style={{
                opacity: isSelected ? 1 : 0.25,
                transform: !prefersReducedMotion && !isSelected ? 'translateY(10px)' : 'none',
                transition: 'opacity 0.7s ease, transform 0.7s ease'
              }}
              tabIndex={0}
              aria-label={`Etapa ${idx + 1}: ${stage.title}`}
            >
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full ${colorStyles.text} animate-ping`} />
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                    SECCIÓN {idx + 1}
                  </span>
                </div>

                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-6 uppercase font-mono">
                  {stage.title}
                </h2>

                <p className="text-slate-300 text-base md:text-lg leading-relaxed font-light text-justify font-sans">
                  {stage.narrative}
                </p>

                <div className="mt-8 pt-6 border-t border-slate-900/60 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500">EVENTO:</span> {stage.dominantEvent}
                  </div>
                  <div>
                    <span className="text-slate-500">INDICE DE RIESGO:</span> {(stage.metrics.alerts * 7.5).toFixed(0)}%
                  </div>
                  <div>
                    <span className="text-slate-500">ESTADO:</span> {stage.metrics.stability > 50 ? 'ESTABLE' : 'ALERTA'}
                  </div>
                </div>

              </div>
            </section>
          );
        })}
      </div>

      {/* PROGRESO FLUIDO */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-950 pointer-events-none z-50">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-rose-500 progress-bar-timeline"
          style={{
            width: `${((activeStage + 1) / stages.length) * 100}%`,
            transition: 'width 0.4s ease-out'
          }}
        />
      </div>

      <style>{`
        @supports (animation-timeline: scroll()) {
          .progress-bar-timeline {
            width: auto !important;
            animation: grow-progress linear both;
            animation-timeline: scroll(root);
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
          }
          @keyframes grow-progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.1);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </div>
  );
};
