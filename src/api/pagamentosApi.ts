import api from './config'
export interface CheckoutPreparado {
  pedido_id: number
  status: string
  amount: number
  payer_email: string
}
export interface DadosPagamento {
  pedido_id: number
  token: string
  payment_method_id: string
  installments: number
  issuer_id?: string | number
  payer?: {
    identification?: {
      type: string
      number: string
    }
  }
}

export async function criarCheckout(): Promise<CheckoutPreparado> {
  const response = await api.post<CheckoutPreparado>(
    '/pagamentos/criar-checkout/',
  )

  return response.data
}

export async function processarPagamento(dados: DadosPagamento) {
  const response = await api.post('/pagamentos/processar/', dados)
  return response.data
}
