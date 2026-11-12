export function classifyOrderPaymentStatus(status) {
  const normalized = String(status || '').trim().toUpperCase()

  if (normalized === 'PAGO') {
    return {
      state: 'success',
      message: 'Pagamento aprovado e pedido confirmado pelo servidor.',
    }
  }

  if (normalized === 'CANCELADO') {
    return {
      state: 'failure',
      message: 'O pedido foi cancelado. Atualize o carrinho antes de tentar novamente.',
    }
  }

  return {
    state: 'pending',
    message: 'Pagamento recebido e aguardando confirmação do pedido pelo servidor. Não faça outro pagamento enquanto isso.',
  }
}
