import api from './config'

export interface CheckoutPreparado {
  pedido_id: number
  status: string
  amount: number
  payer_email: string
  payment_in_progress?: boolean
  payment_status?: string | null
}

export interface DadosPagamento {
  pedido_id: number
  token?: string
  payment_method_id: string
  installments?: number
  issuer_id?: string | number
  payer?: {
    email?: string
    first_name?: string
    last_name?: string
    identification?: {
      type: string
      number: string
    }
    address?: {
      city?: string
      federal_unit?: string
      neighborhood?: string
      street_name?: string
      street_number?: string
      zip_code?: string
    }
  }
}

export interface RespostaPagamento {
  id?: string | number
  status?: string
  status_detail?: string
  pedido_id?: number | string
  payment_method_id?: string
  qr_code?: string
  qr_code_base64?: string
  ticket_url?: string
  detail?: string
}

export async function criarCheckout(): Promise<CheckoutPreparado> {
  const response = await api.post<CheckoutPreparado>(
    '/pagamentos/criar-checkout/',
  )
  return response.data
}

export async function processarPagamento(dados: DadosPagamento): Promise<RespostaPagamento> {
  const response = await api.post<RespostaPagamento>('/pagamentos/processar/', dados)
  return response.data
}
