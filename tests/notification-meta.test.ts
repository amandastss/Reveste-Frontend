import test from 'node:test'
import assert from 'node:assert/strict'

import { getNotificationMeta } from '../src/utils/notificationMeta.ts'

test('reconhece notificação de resposta do vendedor para o cliente', () => {
  const result = getNotificationMeta({
    id: 1,
    usuario: 2,
    mensagem: 'Sua pergunta foi respondida pelo vendedor.',
    lida: false,
    data_envio: new Date().toISOString(),
    tipo: 'resposta',
  })

  assert.equal(result.kind, 'answer')
  assert.equal(result.title, 'Resposta do vendedor')
})

test('reconhece notificação de nova pergunta para o vendedor', () => {
  const result = getNotificationMeta({
    id: 2,
    usuario: 3,
    mensagem: 'Nova pergunta sobre o produto.',
    lida: false,
    data_envio: new Date().toISOString(),
    tipo: 'pergunta',
  })

  assert.equal(result.kind, 'question')
  assert.equal(result.title, 'Nova pergunta')
})
