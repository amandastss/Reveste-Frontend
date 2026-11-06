export type CheckoutResultState = 'success' | 'pending' | 'failure'

export interface CheckoutResult {
  state: CheckoutResultState
  pedidoId: string | null
  status: string | null
  message: string
}

export function getCheckoutResultState(search: string): CheckoutResult {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const pedidoId = params.get('pedido_id') ?? params.get('pedidoId')
  const status = params.get('status') ?? params.get('payment_status') ?? null

  const normalizedStatus = status?.toLowerCase() ?? ''

  if (normalizedStatus === 'approved' || normalizedStatus === 'aprovado') {
    return {
      state: 'success',
      pedidoId,
      status: normalizedStatus,
      message: 'Pagamento aprovado com sucesso.',
    }
  }

  if (
    normalizedStatus === 'pending' ||
    normalizedStatus === 'in_process' ||
    normalizedStatus === 'pendente'
  ) {
    return {
      state: 'pending',
      pedidoId,
      status: normalizedStatus,
      message: 'Pagamento em processamento. Aguarde a confirmação.',
    }
  }

  if (
    normalizedStatus === 'rejected' ||
    normalizedStatus === 'cancelled' ||
    normalizedStatus === 'cancelado' ||
    normalizedStatus === 'failure' ||
    normalizedStatus === 'failed'
  ) {
    return {
      state: 'failure',
      pedidoId,
      status: normalizedStatus,
      message: 'Pagamento não foi aprovado. Tente novamente ou escolha outra forma de pagamento.',
    }
  }

  return {
    state: 'failure',
    pedidoId,
    status: normalizedStatus || null,
    message: 'O status do pagamento não foi identificado. Verifique seu pedido em “Meus pedidos”.',
  }
}

export function getFriendlyCheckoutError(
  status?: number | string,
  fallbackMessage?: string,
): string {
  const normalizedStatus = Number(status)

  if ([400, 404].includes(normalizedStatus)) {
    return 'Não foi possível iniciar a compra no momento. Verifique sua sessão e tente novamente.'
  }

  if (normalizedStatus === 502 || normalizedStatus === 503 || normalizedStatus === 504) {
    return 'O serviço de pagamento está temporariamente indisponível. Tente novamente em alguns instantes.'
  }

  if (normalizedStatus === 401 || normalizedStatus === 403) {
    return 'Sua sessão expirou. Faça login novamente para concluir a compra.'
  }

  return fallbackMessage || 'Não foi possível concluir a compra. Tente novamente.'
}
