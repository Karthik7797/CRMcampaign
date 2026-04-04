import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crm_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// API functions
export const leadsApi = {
  getAll: (params?: Record<string, any>) => api.get('/leads', { params }),
  getOne: (id: string) => api.get(`/leads/${id}`),
  create: (data: any) => api.post('/leads', data),
  update: (id: string, data: any) => api.put(`/leads/${id}`, data),
  delete: (id: string) => api.delete(`/leads/${id}`),
  assign: (id: string, userId: string) => api.post(`/leads/${id}/assign`, { userId }),
}

export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
}

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const tasksApi = {
  getAll: (params?: Record<string, any>) => api.get('/tasks', { params }),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  toggle: (id: string) => api.patch(`/tasks/${id}/toggle`),
  delete: (id: string) => api.delete(`/tasks/${id}`),
}

export const commsApi = {
  getAll: (params?: Record<string, any>) => api.get('/communications', { params }),
  getByLead: (leadId: string) => api.get(`/communications/lead/${leadId}`),
  create: (data: any) => api.post('/communications', data),
  delete: (id: string) => api.delete(`/communications/${id}`),
}

export const usersApi = {
  getAll: (params?: Record<string, any>) => api.get('/users', { params }),
  getOne: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  resetPassword: (id: string, data: any) => api.post(`/users/${id}/reset-password`, data),
  deactivate: (id: string) => api.delete(`/users/${id}`),
}
