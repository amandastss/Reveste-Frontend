import assert from 'node:assert/strict'
import { beforeEach, describe, mock, test } from 'node:test'
import authApi from '../src/api/authApi.ts'
import api, { resolveApiBaseUrl } from '../src/api/config.js'

class MemoryStorage {
  private store = new Map<string, string>()

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  setItem(key: string, value: string) {
    this.store.set(key, String(value))
  }

  removeItem(key: string) {
    this.store.delete(key)
  }

  clear() {
    this.store.clear()
  }
}

describe('api config', () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage() as Storage
    localStorage.clear()
  })

  test('falls back to the backend URL when VITE_API_URL is missing', () => {
    assert.equal(
      resolveApiBaseUrl(''),
      'https://reveste-backend.class.fabricadesoftware.ifc.edu.br',
    )
  })

  test('removes trailing slashes from custom API URLs', () => {
    assert.equal(resolveApiBaseUrl('https://api.example.com//'), 'https://api.example.com')
  })

  test('blocks unauthenticated profile requests before they hit the backend', async () => {
    const getSpy = mock.method(api, 'get', async () => {
      throw new Error('network should not be called when unauthenticated')
    })

    await assert.rejects(
      () => authApi.fetchUserProfile(),
      (error: unknown) => {
        assert.equal(typeof error === 'object' && error !== null && 'message' in error, true)
        assert.match(String((error as Error).message), /login|autentic|token/i)
        return true
      },
    )

    assert.equal(getSpy.mock.calls.length, 0)
  })
})
