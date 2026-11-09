import test from 'node:test'
import assert from 'node:assert/strict'

import { canUserAccessQuestionReply } from '../src/utils/questionAccess.ts'

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
