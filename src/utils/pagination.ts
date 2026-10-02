export interface PaginatedProductsResult<T> {
  items: T[]
  nextPage: number | null
  hasMore: boolean
}

const extractNextPage = (nextUrl?: string | null): number | null => {
  if (!nextUrl) {
    return null
  }

  try {
    const url = new URL(nextUrl, 'https://local.test')
    const page = Number(url.searchParams.get('page'))
    return Number.isFinite(page) && page > 0 ? page : null
  } catch {
    return null
  }
}

export const normalizePaginatedProducts = <T>(data: unknown): PaginatedProductsResult<T> => {
  if (Array.isArray(data)) {
    return {
      items: data as T[],
      nextPage: null,
      hasMore: false,
    }
  }

  if (!data || typeof data !== 'object') {
    return {
      items: [],
      nextPage: null,
      hasMore: false,
    }
  }

  const payload = data as {
    results?: unknown
    next?: string | null
    count?: number
  }

  const items = Array.isArray(payload.results) ? (payload.results as T[]) : []
  const nextPage = extractNextPage(payload.next)

  if (nextPage !== null) {
    return {
      items,
      nextPage,
      hasMore: true,
    }
  }

  const totalItems = typeof payload.count === 'number' ? payload.count : null

  if (totalItems !== null && totalItems > items.length && items.length > 0) {
    return {
      items,
      nextPage: 2,
      hasMore: true,
    }
  }

  return {
    items,
    nextPage: null,
    hasMore: false,
  }
}
