// Tipos compartidos con el contrato publico de la API (ver Swagger del backend).
// Mantener esto sincronizado con lo que use el resto del equipo (A / C) para evitar `any`.

export type Species = 'BLOBITO' | 'CHISPA' | 'GRUNON' | 'DORMILON' | 'GLITCHY';
export type VitalState = 'ESTABLE' | 'HAMBRIENTO' | 'AGITADO' | 'MUTANDO' | 'CRITICO';
export type SignalType =
  | 'HAMBRE'
  | 'ABANDONO'
  | 'MUTACION'
  | 'FUGA'
  | 'CONFLICTO'
  | 'REPRODUCCION_MASIVA'
  | 'SENAL_CORRUPTA';
export type Severity = 'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO';
export type SignalStatus = 'RECIBIDA' | 'PROCESANDO' | 'ATENDIDA';

export interface SectorRef {
  id: string;
  name: string;
  sectorCode: string;
}

export interface SectorSummary extends SectorRef {
  climate: string;
  capacity: number;
  currentLoad: number;
  stabilityLevel: number;
}

export interface TropelDTO {
  id: string;
  name: string;
  species: Species;
  vitalState: VitalState;
  energyLevel: number;
  chaosIndex: number;
  mutationStage: number;
  guardianName: string;
  sector: SectorRef;
  createdAt: string;
  updatedAt: string;
}

export interface TropelPage {
  content: TropelDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface SignalTropelRef {
  id: string;
  name: string;
  species: Species;
}

export interface SignalDTO {
  id: string;
  signalType: SignalType;
  severity: Severity;
  status: SignalStatus;
  rawContent: string;
  tropel: SignalTropelRef;
  createdAt: string;
  updatedAt: string;
}

export interface SignalsFeedResponse {
  items: SignalDTO[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
}

export interface ApiErrorBody {
  error: string;
  message: string;
  timestamp: string;
  path: string;
  details?: Record<string, unknown>;
}