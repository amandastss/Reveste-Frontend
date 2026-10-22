
import axios from 'axios'

const getViteApiUrl = () => (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined)

export const resolveApiBaseUrl = (configUrl = getViteApiUrl()) =>
  (configUrl || 'https://reveste-backend.class.fabricadesoftware.ifc.edu.br').replace(/\/+$/, '')

export const API_BASE = resolveApiBaseUrl()

export const getStoredToken = () => {
  const candidateKeys = ['token', 'access', 'access_token', 'jwt', 'authToken']

  for (const key of candidateKeys) {
    const value = localStorage.getItem(key)
    if (value && value !== 'null' && value !== 'undefined') {
      return value
    }
  }

  return null
}

export const persistToken = (value) => {
  const token = typeof value === 'string' ? value.trim() : ''
  if (!token) return null

  const candidateKeys = ['token', 'access', 'access_token', 'jwt', 'authToken']
  candidateKeys.forEach((key) => localStorage.setItem(key, token))

  return token
}

const api = axios.create({
  baseURL: `${API_BASE}/api`,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }

  return config
})

export default api
