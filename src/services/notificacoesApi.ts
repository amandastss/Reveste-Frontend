import axios from 'axios'

export interface Notificacao {
  id: number
  usuario: number
  mensagem: string
  lida: boolean
  data_envio: string
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export async function buscarNotificacoes(): Promise<Notificacao[]> {
  const response = await api.get('/api/notificacoes/')

  console.log('NOTIFICAÇÕES - resposta:', response.data)

  if (Array.isArray(response.data)) {
    return response.data
  }

  if (Array.isArray(response.data.results)) {
    return response.data.results
  }

  console.error(
    'Formato inesperado das notificações:',
    response.data
  )

  return []
}

export async function marcarNotificacaoComoLida(
  id: number
): Promise<Notificacao> {
  const response = await api.patch(
    `/api/notificacoes/${id}/`,
    {
      lida: true,
    }
  )

  return response.data
}