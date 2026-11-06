import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { resolveApiBaseUrl } from '../src/api/config.js'

describe('api config', () => {
  test('falls back to the backend URL when VITE_API_URL is missing', () => {
    assert.equal(
      resolveApiBaseUrl(''),
      'https://reveste-backend.class.fabricadesoftware.ifc.edu.br',
    )
  })

  test('removes trailing slashes from custom API URLs', () => {
    assert.equal(resolveApiBaseUrl('https://api.example.com//'), 'https://api.example.com')
  })
})
