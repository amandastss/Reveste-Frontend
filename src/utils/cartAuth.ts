export function hasCartAuthToken() {
  return Boolean(localStorage.getItem('token'))
}

export function getCartAuthMessage() {
  return 'Faça login para adicionar itens ao carrinho.'
}

export function getCartAuthRedirectPath() {
  return '/auth/email'
}
