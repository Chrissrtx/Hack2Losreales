let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.slice(0, -1);
}
if (!baseUrl.endsWith('/api/v1')) {
  baseUrl += '/api/v1';
}
const API_BASE_URL = baseUrl;


export interface User {
  id: string;
  displayName: string;
  email: string;
  teamCode: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface DashboardSummary {
  totalTropels: number;
  criticalTropels: number;
  openSignals: number;
  sectorStabilityAvg: number;
  signalsBySeverity: {
    LEVE: number;
    MODERADO: number;
    GRAVE: number;
    CRITICO: number;
  };
  generatedAt: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  path: string;
  details?: Record<string, unknown>;
}

class ApiError extends Error {
  status: number;
  code: string;
  
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse | null = null;
    try {
      errorData = await response.json();
    } catch {
      // ignore
    }
    
    const errorCode = errorData?.error || 'UNKNOWN_ERROR';
    const errorMessage = errorData?.message || `Request failed with status ${response.status}`;
    throw new ApiError(response.status, errorCode, errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  login: async (credentials: Record<string, string>): Promise<LoginResponse> => {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  me: async (): Promise<User> => {
    return request<User>('/auth/me');
  },
  
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    return request<DashboardSummary>('/dashboard/summary');
  },
};


