/**
 * API Request utility with automatic 401 handling
 * When backend returns 401, automatically clear auth and redirect to login
 */

const API_BASE = '/api'

export async function apiRequest(endpoint, options = {}) {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}')
  
  const url = endpoint.startsWith('/api') ? endpoint : `${API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(auth.token ? { 'Authorization': `Bearer ${auth.token}` } : {}),
      ...options.headers,
    },
  })
  
  // If 401 Unauthorized, clear auth and redirect to login
  if (response.status === 401) {
    console.log('Session expired, redirecting to login...')
    localStorage.removeItem('auth')
    window.location.href = '/auth'
    throw new Error('Session expired')
  }
  
  return response
}

// Convenience methods
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
}

export default api


