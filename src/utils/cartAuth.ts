import { getStoredToken } from '@/api/config'

export function hasCartAuthToken() {
  return Boolean(getStoredToken())
}

export function getCartAuthMessage() {
  return 'Faça login para adicionar itens ao carrinho.'
}

export function getCartAuthRedirectPath() {
  return '/auth/email'
}
