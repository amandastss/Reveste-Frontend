
import axios from 'axios'

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  'https://reveste-backend.class.fabricadesoftware.ifc.edu.br'
).replace(/\/+$/, '')

const api = axios.create({
  baseURL: `${API_BASE}/api`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }

  return config
})

export default api
