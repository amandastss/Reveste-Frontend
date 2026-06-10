import api from './config'
import type { AxiosResponse } from 'axios'

type AuthResponse<T = unknown> = Promise<AxiosResponse<T>>

type RegisterPayload = {
  email: string
  name: string
  password: string
  role: string
  phone?: string
  birth_date?: string
  profile_image?: string
  bio?: string
}

const checkEmail = (email: string): AuthResponse => {
  return api.post('/api/check-email/', { email })
}

const sendEmail = (email: string): AuthResponse => {
  return api.post('/api/send-email/', { email })
}

const login = (email: string, password: string): AuthResponse => {
  return api.post('/api/login/', { email, password })
}

async function fetchUserFromCandidates(token: string, userId?: string | number): Promise<Record<string, unknown> | null> {
  const authHeaders = (scheme: 'Token' | 'Bearer') => ({ headers: { Authorization: `${scheme} ${token}` } })

  try {
  const res = await api.get('/api/usuarios/me/', authHeaders('Token'))
  if (res && res.data) return res.data
} catch {}

try {
  const res = await api.get('/api/usuarios/me/', authHeaders('Bearer'))
  if (res && res.data) return res.data
} catch {}

  const candidates: string[] = []
  if (userId) {
    candidates.push(
      `/api/usuarios/${userId}/`,
      `/api/users/${userId}/`,
      `/api/users/${userId}`,
      `/api/usuario/${userId}/`,
      `/api/profile/${userId}/`,
      `/api/perfil/${userId}/`,
      `/api/registro/${userId}/`
    )
  }
  candidates.push('/api/profile/', '/api/user/', '/api/usuario/', '/api/usuarios/', '/api/users/')

  for (const url of candidates) {
    try {
      let r = null
      try { r = await api.get(url, authHeaders('Token')) } catch { r = await api.get(url, authHeaders('Bearer')) }
      if (r && r.data) return r.data
    } catch {
    }
  }

  return null
}

const register = (
  email: string,
  name: string,
  password: string,
  role = 'buyer',
  phone?: string,
  birth_date?: string,
  profile_image?: File | string,
  bio?: string
): AuthResponse<Record<string, unknown>> => {
  if (profile_image instanceof File) {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('name', name)
    formData.append('password', password)
    formData.append('role', role)
    if (phone) formData.append('phone', phone)
    if (birth_date) formData.append('birth_date', birth_date)
    if (bio) formData.append('bio', bio)
    // profile_image is File here
    formData.append('profile_image', profile_image)
    return api.post('/api/registro/', formData)
  }

  const data: RegisterPayload = { email, name, password, role }
  if (phone) data.phone = phone
  if (birth_date) data.birth_date = birth_date
  if (bio) data.bio = bio
  if (profile_image && typeof profile_image === 'string') data.profile_image = profile_image
  return api.post('/api/registro/', data)
}

const verifyCode = (email: string, code: string): AuthResponse => {
  return api.post('/api/verify-code/', { email, code })
}

const requestPasswordReset = (email: string): AuthResponse => {
  return api.post('/api/forgot-password/', { email })
}

const resetPassword = (email: string, code: string, newPassword: string): AuthResponse => {
  return api.post('/api/reset-password/', { email, code, new_password: newPassword })
}

export default {
  checkEmail,
  sendEmail,
  fetchUserFromCandidates,
  login,
  register,
  verifyCode,
  requestPasswordReset,
  resetPassword
}
