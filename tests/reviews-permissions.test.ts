import assert from 'node:assert/strict'
import { beforeEach, describe, test } from 'node:test'
import { canDeleteReview } from '../src/utils/reviews.ts'

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

beforeEach(() => {
  globalThis.localStorage = new MemoryStorage() as Storage
})

describe('review deletion permissions', () => {
  test('allows deleting when the current user is the review author', () => {
    assert.equal(canDeleteReview({ userId: 7 }, 7), true)
    assert.equal(canDeleteReview({ user: { id: 7 } }, 7), true)
  })

  test('allows deleting when the avatar matches the logged user, which is how this backend identifies authors', () => {
    localStorage.setItem('user', JSON.stringify({
      id: 2,
      name: 'Julia Costa',
      profile_image: 'https://cdn.example.com/julia.png',
      email: 'julia@example.com'
    }))

    assert.equal(canDeleteReview({ userAvatar: 'https://cdn.example.com/julia.png' }, 2), true)
    assert.equal(canDeleteReview({ userName: 'Julia Costa' }, 2), true)
  })

  test('blocks deleting when the current user is not the review author', () => {
    assert.equal(canDeleteReview({ userId: 7 }, 3), false)
    assert.equal(canDeleteReview({ user: { id: 7 } }, 3), false)
  })

  test('blocks deleting when there is no logged-in user', () => {
    assert.equal(canDeleteReview({ userId: 7 }, null), false)
    assert.equal(canDeleteReview({ user: { id: 7 } }, null), false)
  })
})
