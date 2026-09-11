import assert from 'node:assert/strict'
import { beforeEach, describe, test } from 'node:test'
import { getUserFavoritesStorageKey, readFavorites, writeFavorites } from '../src/utils/favorites.ts'

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

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null
  }

  get length() {
    return this.store.size
  }
}

describe('favorites storage synchronization', () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage() as Storage
    localStorage.clear()
  })

  test('uses the same storage key for the same user across profile and favorites screens', () => {
    localStorage.setItem('user', JSON.stringify({ id: 7, email: 'ana@teste.com' }))

    const expectedKey = 'reveste_favorites_v1:ana@teste.com'
    const item = { id: 123, nome: 'Camisa', preco: 99, imagem_url: null }

    writeFavorites([item])

    assert.equal(getUserFavoritesStorageKey(), expectedKey)
    assert.deepEqual(readFavorites(), [item])
    assert.deepEqual(JSON.parse(localStorage.getItem(expectedKey) ?? '[]'), [item])
  })

  test('reads favorites stored under legacy keys and keeps them in the unified key', () => {
    localStorage.setItem('user', JSON.stringify({ id: 9, email: 'joao@teste.com' }))
    localStorage.setItem('favorites_9', JSON.stringify([{ id: 321, nome: 'Calça', preco: 150, imagem_url: '/calca.png' }]))

    const favorites = readFavorites()

    assert.deepEqual(favorites, [{ id: 321, nome: 'Calça', preco: 150, imagem_url: '/calca.png' }])
    assert.equal(getUserFavoritesStorageKey(), 'reveste_favorites_v1:joao@teste.com')
    assert.deepEqual(JSON.parse(localStorage.getItem('reveste_favorites_v1:joao@teste.com') ?? '[]'), favorites)
  })
})
