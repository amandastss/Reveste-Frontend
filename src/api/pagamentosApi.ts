import axios, { type AxiosError } from 'axios'
import api from './config'

export interface PedidoItemBackend {
  id: number
  produto: number
  quantidade: number
  preco: string | number
  nome: string | null
  cor: string | null
  tamanho: string | null
  imagem_url: string | null
}

export interface CarrinhoBackend {
  pedido_id: number
  status: string
  itens: PedidoItemBackend[]
  total: string | number
}

export interface PedidoPreparadoResponse {
  pedido_id: number
  status: string
  detail?: string
}

export interface CheckoutResponse {
  pedido_id: number
  amount?: string | number
  payer_email?: string
  preference_id?: string
  status?: string
  payment_in_progress?: boolean
  payment_status?: string | null
}

export interface PaymentBrickFormData {
  token: string
  installments: number
  payment_method_id: string
  issuer_id?: string | number
  payer?: {
    email?: string
    identification?: { type?: string; number?: string }
  }
}

export interface PaymentResponse {
  pedido_id: number
  id: string | number | null
  status: string | null
  status_detail?: string | null
}

export interface PedidoStatusResponse {
  id: number
  status: string
  total?: string | number
  itens?: PedidoItemBackend[]
}

export class PaymentApiError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
    readonly communicationFailure = false,
  ) {
    super(message)
    this.name = 'PaymentApiError'
  }
}

function parseResponseData(data: unknown): unknown {
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data) as unknown
  } catch {
    throw new PaymentApiError('O servidor retornou uma resposta inesperada.')
  }
}

function getRecord(data: unknown): Record<string, unknown> | null {
  return typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : null
}

function errorMessage(error: AxiosError<unknown>): string {
  const statusCode = error.response?.status
  const data = getRecord(error.response?.data)
  const detail = typeof data?.detail === 'string' ? data.detail : ''

  if (statusCode === 401 || statusCode === 403) {
    return 'Sua sessão expirou. Entre novamente para continuar.'
  }
  if (statusCode === 400 || statusCode === 404 || statusCode === 409) {
    return detail || 'O pedido não pode ser processado. Atualize o carrinho e tente novamente.'
  }
  return 'Não foi possível comunicar com o servidor. Consulte o pedido antes de tentar novamente.'
}

async function request<T>(operation: () => Promise<unknown>): Promise<T> {
  try {
    const response = await operation()
    return parseResponseData(response) as T
  } catch (error: unknown) {
    if (error instanceof PaymentApiError) throw error
    if (axios.isAxiosError(error)) {
      const communicationFailure = !error.response || error.code === 'ECONNABORTED'
      throw new PaymentApiError(errorMessage(error), error.response?.status, communicationFailure)
    }
    throw new PaymentApiError(
      'Não foi possível concluir a operação. Tente novamente.',
      undefined,
      true,
    )
  }
}

function requireObject<T>(value: T, message: string): T {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new PaymentApiError(message)
  }
  return value
}

export function getCarrinho(): Promise<CarrinhoBackend> {
  return request<CarrinhoBackend>(() =>
    api.get('/carrinho/').then((response) => response.data),
  ).then((data) => requireObject(data, 'Não foi possível carregar o carrinho.'))
}

export function finalizarCarrinho(): Promise<PedidoPreparadoResponse> {
  return request<PedidoPreparadoResponse>(() =>
    api.post('/carrinho/finalizar/').then((response) => response.data),
  ).then((data) => {
    requireObject(data, 'Não foi possível preparar o pedido.')
    if (!Number.isFinite(Number(data.pedido_id)) || typeof data.status !== 'string') {
      throw new PaymentApiError('O servidor retornou dados inválidos para o pedido.')
    }
    return data
  })
}

export function criarCheckout(): Promise<CheckoutResponse> {
  return request<CheckoutResponse>(() =>
    api.post('/pagamentos/criar-checkout/').then((response) => response.data),
  ).then((data) => {
    requireObject(data, 'Não foi possível preparar o pagamento.')
    if (!Number.isFinite(Number(data.pedido_id))) {
      throw new PaymentApiError('O servidor não identificou o pedido do checkout.')
    }
    return data
  })
}

export function processarPagamento(
  pedidoId: number,
  formData: PaymentBrickFormData,
): Promise<PaymentResponse> {
  const payload = {
    pedido_id: pedidoId,
    token: formData.token,
    installments: formData.installments,
    payment_method_id: formData.payment_method_id,
    ...(formData.issuer_id ? { issuer_id: formData.issuer_id } : {}),
    ...(formData.payer?.identification
      ? { payer: { identification: formData.payer.identification } }
      : {}),
  }
  return request<PaymentResponse>(() =>
    api.post('/pagamentos/processar/', payload).then((response) => response.data),
  ).then((data) => requireObject(data, 'Não foi possível interpretar a resposta do pagamento.'))
}

export function consultarPedido(pedidoId: number): Promise<PedidoStatusResponse> {
  return request<PedidoStatusResponse>(() =>
    api.get(`/pedidos/${pedidoId}/`).then((response) => response.data),
  ).then((data) => requireObject(data, 'Não foi possível consultar o pedido.'))
}

export function isPedidoPago(status: string | undefined): boolean {
  return status?.trim().toUpperCase() === 'PAGO'
}

export function isPedidoCancelado(status: string | undefined): boolean {
  return status?.trim().toUpperCase() === 'CANCELADO'
}
