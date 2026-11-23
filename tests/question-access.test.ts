import test from 'node:test'
import assert from 'node:assert/strict'

import {
  canUserAccessQuestionReply,
  canUserDeleteQuestion,
  extractSellerKeysFromProduct,
} from '../src/utils/questionAccess.ts'

test('extrai identidade do vendedor sem confundir com o id do produto', () => {
  assert.deepEqual(
    extractSellerKeysFromProduct({
      id: 17,
      usuario: { id: 42, email: 'Vendedora@teste.com' },
    }),
    ['42', 'vendedora@teste.com'],
  )

  assert.deepEqual(extractSellerKeysFromProduct({ id: 17, nome: 'Calça jeans' }), [])
  assert.deepEqual(
    extractSellerKeysFromProduct({ id: 17, ownerId: 42, owner_email: 'dona@teste.com' }),
    ['42', 'dona@teste.com'],
  )
})

test('permite vendedor responder quando o id ou email batem com o dono do produto', () => {
  assert.equal(
    canUserAccessQuestionReply({
      currentUserId: '42',
      currentUserEmail: 'cliente@teste.com',
      productSellerKeys: ['7', 'seller@shop.com'],
    }),
    false,
  )

  assert.equal(
    canUserAccessQuestionReply({
      currentUserId: '7',
      currentUserEmail: 'cliente@teste.com',
      productSellerKeys: ['7', 'seller@shop.com'],
    }),
    true,
  )

  assert.equal(
    canUserAccessQuestionReply({
      currentUserId: '99',
      currentUserEmail: 'seller@shop.com',
      productSellerKeys: ['7', 'seller@shop.com'],
    }),
    true,
  )
})

test('permite remover apenas a pergunta do usuário que a fez', () => {
  assert.equal(
    canUserDeleteQuestion({
      currentUserId: '7',
      questionUserId: '7',
    }),
    true,
  )

  assert.equal(
    canUserDeleteQuestion({
      currentUserId: '7',
      questionUserId: '9',
    }),
    false,
  )
})
