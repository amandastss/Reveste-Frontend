import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { getCheckoutResultState, getFriendlyCheckoutError } from '../src/utils/checkoutPayment.ts'

describe('checkout payment flow', () => {
  test('maps approved status to success', () => {
    const result = getCheckoutResultState('?pedido_id=77&status=approved')

    assert.equal(result.state, 'success')
    assert.equal(result.pedidoId, '77')
  })

  test('maps pending status to pending', () => {
    const result = getCheckoutResultState('?pedido_id=88&status=pending')

    assert.equal(result.state, 'pending')
  })

  test('maps rejected status to failure', () => {
    const result = getCheckoutResultState('?pedido_id=99&status=rejected')

    assert.equal(result.state, 'failure')
    assert.match(result.message, /não foi aprovado|cancelado|pendente/i)
  })

  test('returns friendly messages for backend errors', () => {
    assert.match(getFriendlyCheckoutError(404), /não foi possível iniciar|tentar novamente/i)
    assert.match(getFriendlyCheckoutError(502), /temporariamente indisponível|tentar novamente/i)
  })
})
