import axios from 'axios'

const configuredBase =
  import.meta.env.VITE_API_URL ?? 'https://reveste-backend.class.fabricadesoftware.ifc.edu.br'
const API_BASE = configuredBase.replace(/\/+$/, '').replace(/\/api$/i, '')

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 20000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default api
