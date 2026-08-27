import apiClient from './config'

export async function criarCheckout() {
  const response = await apiClient.post(
    '/pagamentos/criar-checkout/'
  )

  return response.data
}
