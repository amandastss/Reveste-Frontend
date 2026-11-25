import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { normalizeCep, validateDeliveryAddress } from '../src/utils/addressValidation.ts'

const validAddress = {
  zip_code: '01234-567',
  street_name: 'Rua das Flores',
  street_number: '123',
  neighborhood: 'Centro',
  city: 'São Paulo',
  federal_unit: 'SP',
}

describe('delivery address validation', () => {
  test('normalizes CEP digits', () => {
    assert.equal(normalizeCep('01234-567'), '01234567')
  })

  test('accepts a complete address', () => {
    assert.equal(validateDeliveryAddress(validAddress), null)
  })

  test('rejects incomplete CEP', () => {
    assert.match(validateDeliveryAddress({ ...validAddress, zip_code: '1234' }) || '', /CEP válido/)
  })

  test('rejects missing address fields', () => {
    assert.match(validateDeliveryAddress({ ...validAddress, street_number: '' }) || '', /número/)
  })

  test('rejects invalid UF', () => {
    assert.match(
      validateDeliveryAddress({ ...validAddress, federal_unit: 'São Paulo' }) || '',
      /UF válida/,
    )
  })
})
