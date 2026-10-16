import assert from 'node:assert/strict'
import { beforeEach, describe, test } from 'node:test'
import { hasCartAuthToken, getCartAuthMessage, getCartAuthRedirectPath } from '../src/utils/cartAuth.ts'

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

describe('cart authentication guard', () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage() as Storage
    localStorage.clear()
  })

  test('detects the absence of a token when the user is not authenticated', () => {
    assert.equal(hasCartAuthToken(), false)
    assert.equal(getCartAuthMessage(), 'Faça login para adicionar itens ao carrinho.')
    assert.equal(getCartAuthRedirectPath(), '/auth/email')
  })

  test('accepts a valid token as authenticated', () => {
    localStorage.setItem('token', 'abc123')

    assert.equal(hasCartAuthToken(), true)
    assert.equal(getCartAuthMessage(), 'Faça login para adicionar itens ao carrinho.')
    assert.equal(getCartAuthRedirectPath(), '/auth/email')
  })
})
