import axios from 'axios'
import { API_BASE, getStoredToken } from '@/api/config'

export interface Notificacao {
  id: number
  usuario: number
  mensagem: string
  lida: boolean
  data_envio: string
}

const LOCAL_NOTIFICATIONS_KEY = 'reveste_notifications_v1'

const api = axios.create({
  baseURL: API_BASE,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

function readLocalNotifications(): Notificacao[] {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalNotifications(notifications: Notificacao[]) {
  localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

export async function buscarNotificacoes(): Promise<Notificacao[]> {
  try {
    const response = await api.get('/api/notificacoes/')

    if (Array.isArray(response.data)) {
      return response.data
    }

    if (Array.isArray(response.data.results)) {
      return response.data.results
    }
  } catch {
    // fallback local
  }

  return readLocalNotifications().sort(
    (a, b) => new Date(b.data_envio).getTime() - new Date(a.data_envio).getTime(),
  )
}

export async function marcarNotificacaoComoLida(
  id: number,
): Promise<Notificacao> {
  try {
    const response = await api.patch(`/api/notificacoes/${id}/`, {
      lida: true,
    })

    return response.data
  } catch {
    const next = readLocalNotifications().map((item) =>
      item.id === id ? { ...item, lida: true } : item,
    )
    writeLocalNotifications(next)
    return next.find((item) => item.id === id) ?? {
      id,
      usuario: 0,
      mensagem: 'Notificação atualizada',
      lida: true,
      data_envio: new Date().toISOString(),
    }
  }
}