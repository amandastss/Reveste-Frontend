import api from './config'
import type { AxiosResponse } from 'axios'

type AuthResponse<T = unknown> = Promise<AxiosResponse<T>>
type UserProfile = {
  "id": number
  "email": string
  "name": string
  "role": "buyer",
  "birth_date": string
  "phone": string
  "bio": string
  "profile_image": string
  "created_at": string
}

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

type ProfileUpdatePayload = {
  email?: string
  name?: string
  phone?: string
  birth_date?: string
  bio?: string
  profile_image?: File | string
}

const checkEmail = (email: string): AuthResponse => {
  return api.post('/check-email/', { email })
}

const sendEmail = (email: string): AuthResponse => {
  return api.post('/send-email/', { email })
}

const login = (email: string, password: string): AuthResponse => {
  return api.post('/token/', { email, password })
}

const fetchUserProfile = async () => {
  const profile = await api.get('/usuarios/me/')
  return profile.data as UserProfile
}

async function fetchUserFromCandidates(
  token: string,
  userId?: string | number
): Promise<Record<string, unknown> | null> {
  // const authHeaders = (scheme: 'Token' | 'Bearer') => ({
  //   headers: {
  //     Authorization: `${scheme} ${token}`
  //   }
  // })

  try {
    const res = await api.get('/usuarios/me/')
    if (res?.data) return res.data
  } catch {}

  const candidates: string[] = []

  if (userId) {
    candidates.push(
      `/usuarios/${userId}/`,
      `/users/${userId}/`,
      `/users/${userId}`,
      `/usuario/${userId}/`,
      `/profile/${userId}/`,
      `/perfil/${userId}/`,
      `/registro/${userId}/`
    )
  }

  candidates.push(
    '/profile/',
    '/user/',
    '/usuario/',
    '/usuarios/',
    '/users/'
  )

  for (const url of candidates) {
    try {
      let response

      try {
        response = await api.get(url)
      } catch {
        console.error(`Failed to fetch user from ${url}`)
      }

      if (response?.data) {
        return response.data
      }
    } catch {}
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

    formData.append('profile_image', profile_image)

    return api.post('/registro/', formData)
  }

  const data: RegisterPayload = {
    email,
    name,
    password,
    role
  }

  if (phone) data.phone = phone
  if (birth_date) data.birth_date = birth_date
  if (bio) data.bio = bio

  if (profile_image && typeof profile_image === 'string') {
    data.profile_image = profile_image
  }

  return api.post('/registro/', data)
}

const sendUpdateRequest = async (method: 'patch' | 'put', url: string, body: FormData | ProfileUpdatePayload) => {
  if (body instanceof FormData) {
    return api[method](url, body)
  }
  return api[method](url, body)
}

const updateProfile = async (payload: ProfileUpdatePayload): Promise<Record<string, unknown>> => {
  const rawUser = localStorage.getItem('user')
  const storedUser = rawUser ? (JSON.parse(rawUser) as Record<string, unknown>) : {}
  const userId = storedUser?.id

  const candidateUrls = [
    '/usuarios/me/',
    '/usuarios/me',
    '/usuario/me/',
    '/usuario/me',
    '/users/me/',
    '/users/me'
  ]

  if (userId !== undefined && userId !== null) {
    candidateUrls.push(
      `/usuarios/${userId}/`,
      `/usuarios/${userId}`,
      `/usuario/${userId}/`,
      `/usuario/${userId}`,
      `/users/${userId}/`,
      `/users/${userId}`
    )
  }

  const requestBody = (() => {
    if (!(payload.profile_image instanceof File)) {
      return payload
    }

    const formData = new FormData()
    if (payload.name) formData.append('name', payload.name)
    if (payload.email) formData.append('email', payload.email)
    if (payload.phone) formData.append('phone', payload.phone)
    if (payload.birth_date) formData.append('birth_date', payload.birth_date)
    if (payload.bio) formData.append('bio', payload.bio)
    formData.append('profile_image', payload.profile_image)
    return formData
  })()

  const methods: Array<'patch' | 'put'> = ['patch', 'put']

  let lastError: unknown = new Error('Nenhum endpoint de atualização disponível')

  for (const url of candidateUrls) {
    for (const method of methods) {
      try {
        const response = await sendUpdateRequest(method, url, requestBody)
        return response.data as Record<string, unknown>
      } catch (error: unknown) {
        lastError = error
        const status = error && typeof error === 'object' && 'response' in error && error.response && typeof (error.response as any).status === 'number'
          ? (error.response as any).status
          : undefined

        if (status === 401) {
          throw error
        }

        if (status === 405) {
          continue
        }

        continue
      }
    }
  }

  throw lastError
}

const verifyCode = (
  email: string,
  code: string
): AuthResponse => {
  return api.post('/verify-code/', { email, code })
}

const requestPasswordReset = (
  email: string
): AuthResponse => {
  return api.post('/forgot-password/', { email })
}

const resetPassword = (
  email: string,
  code: string,
  newPassword: string
): AuthResponse => {
  return api.post('/reset-password/', {
    email,
    code,
    new_password: newPassword
  })
}

export default {
  checkEmail,
  sendEmail,
  fetchUserFromCandidates,
  fetchUserProfile,
  login,
  register,
  updateProfile,
  verifyCode,
  requestPasswordReset,
  resetPassword
}
