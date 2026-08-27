import apiClient from './config'

export async function criarCheckout() {
  // ⚠️ IMPORTANTE: Endpoint retorna 404
  // Confirmar com backend a URL exata do endpoint de criação de checkout
  const response = await apiClient.post('/pagamentos/criar-checkout/')

  return response.data
}
