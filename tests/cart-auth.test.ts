import { beforeEach, describe, expect, it } from 'vitest'
import {
  hasCartAuthToken,
  getCartAuthMessage,
  getCartAuthRedirectPath,
} from '../src/utils/cartAuth'

describe('cart authentication guard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('detects the absence of a token when the user is not authenticated', () => {
    expect(hasCartAuthToken()).toBe(false)
    expect(getCartAuthMessage()).toBe(
      'Faça login para adicionar itens ao carrinho.',
    )
    expect(getCartAuthRedirectPath()).toBe('/auth/email')
  })

  it('accepts a valid token as authenticated', () => {
    localStorage.setItem('token', 'abc123')

    expect(hasCartAuthToken()).toBe(true)
    expect(getCartAuthMessage()).toBe(
      'Faça login para adicionar itens ao carrinho.',
    )
    expect(getCartAuthRedirectPath()).toBe('/auth/email')
  })
})
