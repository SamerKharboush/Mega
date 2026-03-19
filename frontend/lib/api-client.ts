import { Database } from './supabase'

type Slide = Database['public']['Tables']['slides']['Row']
type Analysis = Database['public']['Tables']['analyses']['Row']

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiResponse<T> {
  data?: T
  error?: string
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { error: errorData.detail || `HTTP ${response.status}` }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' }
  }
}

// Slides API
export const slidesApi = {
  list: () => fetchApi<Slide[]>('/api/slides'),

  get: (id: string) => fetchApi<Slide>(`/api/slides/${id}`),

  getStatus: (id: string) =>
    fetchApi<{ status: Slide['status']; dzi_path: string | null }>(
      `/api/slides/${id}/status`
    ),

  preprocess: (slideId: string, storagePath: string) =>
    fetchApi<Slide>('/api/slides/preprocess', {
      method: 'POST',
      body: JSON.stringify({ slide_id: slideId, storage_path: storagePath }),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/api/slides/${id}`, { method: 'DELETE' }),
}

// Analyses API
export const analysesApi = {
  list: () => fetchApi<Analysis[]>('/api/analyses'),

  run: (slideId: string, task: Analysis['task']) =>
    fetchApi<{ job_id: string }>('/api/analyses/run', {
      method: 'POST',
      body: JSON.stringify({ slide_id: slideId, task }),
    }),

  getStatus: (jobId: string) =>
    fetchApi<Analysis>(`/api/analyses/${jobId}`),

  getHeatmap: (jobId: string) =>
    fetchApi<{ heatmap: number[][] }>(`/api/analyses/${jobId}/heatmap`),
}

// Reports API
export const reportsApi = {
  list: () => fetchApi<Analysis[]>('/api/reports'),

  get: (jobId: string) =>
    fetchApi<{ url: string }>(`/api/reports/${jobId}`),
}

// Billing API
export const billingApi = {
  createCheckoutSession: (priceId: string) =>
    fetchApi<{ url: string }>('/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ price_id: priceId }),
    }),

  createPortalSession: () =>
    fetchApi<{ url: string }>('/api/stripe/portal', {
      method: 'POST',
    }),
}