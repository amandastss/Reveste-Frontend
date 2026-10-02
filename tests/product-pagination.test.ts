import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { normalizePaginatedProducts } from '../src/utils/pagination.ts'

describe('product pagination helpers', () => {
  test('extracts the next page from DRF paginated responses', () => {
    const result = normalizePaginatedProducts({
      count: 32,
      next: 'https://api.example.com/api/produtos/?page=2',
      previous: null,
      results: [{ id: 1 }, { id: 2 }],
    })

    assert.deepEqual(result.items.length, 2)
    assert.equal(result.nextPage, 2)
    assert.equal(result.hasMore, true)
  })

  test('keeps appending when the API still reports more items than the current page', () => {
    const result = normalizePaginatedProducts({
      count: 12,
      next: null,
      previous: null,
      results: [{ id: 1 }, { id: 2 }, { id: 3 }],
    })

    assert.equal(result.nextPage, 2)
    assert.equal(result.hasMore, true)
  })
})
