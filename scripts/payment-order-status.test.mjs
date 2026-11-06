import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyOrderPaymentStatus } from '../src/utils/paymentOrderStatus.js'

test('somente o status persistido PAGO confirma a compra', () => {
  assert.equal(classifyOrderPaymentStatus('PAGO').state, 'success')
  assert.equal(classifyOrderPaymentStatus(' pago ').state, 'success')
})

test('pedido cancelado não é apresentado como pagamento aprovado', () => {
  assert.equal(classifyOrderPaymentStatus('CANCELADO').state, 'failure')
})

test('status pendente ou desconhecido nunca confirma a compra', () => {
  for (const status of ['PENDENTE', 'AGUARDANDO_PAGAMENTO', 'PROCESSANDO', '', null, undefined]) {
    assert.equal(classifyOrderPaymentStatus(status).state, 'pending')
  }
})
