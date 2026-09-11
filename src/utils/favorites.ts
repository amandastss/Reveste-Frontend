export interface FavoriteProduct {
  id: number
  nome: string
  preco: number
  imagem_url?: string | null
  categoria?: string | number | { id?: number; nome?: string; name?: string; title?: string } | null
}

const STORAGE_PREFIX = 'reveste_favorites_v1'

const toStorageKey = (value?: string | null) => {
  const normalized = (value || 'guest').trim().toLowerCase()
  return normalized || 'guest'
}

const isFavoriteProductLike = (item: unknown): item is FavoriteProduct =>
  !!item &&
  typeof item === 'object' &&
  typeof (item as { id?: unknown }).id === 'number' &&
  typeof (item as { nome?: unknown }).nome === 'string'

const readLegacyFavorites = (): FavoriteProduct[] => {
  try {
    const collected: FavoriteProduct[] = []
    const candidateKeys = new Set<string>()

    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser) as Record<string, unknown>
      const candidates = [
        user.email,
        user.username,
        user.name,
        user.id,
      ]

      for (const value of candidates) {
        if (value !== undefined && value !== null && String(value).trim()) {
          candidateKeys.add(String(value).trim())
        }
      }
    }

    const email = localStorage.getItem('email')
    if (email && email.trim()) {
      candidateKeys.add(email.trim())
    }

    const explicitKey = localStorage.getItem('favorites_user_key')
    if (explicitKey && explicitKey.trim()) {
      candidateKeys.add(explicitKey.trim())
    }

    for (const value of Array.from(candidateKeys)) {
      candidateKeys.add(`favorites_${value}`)
      candidateKeys.add(`${STORAGE_PREFIX}:${toStorageKey(value)}`)
    }

    for (let index = 0; index < localStorage.length; index += 1) {
      const storageKey = localStorage.key(index)
      if (!storageKey) {
        continue
      }

      if (!storageKey.startsWith('favorites_') && !storageKey.startsWith(`${STORAGE_PREFIX}:`)) {
        continue
      }

      if (candidateKeys.size > 0 && !candidateKeys.has(storageKey)) {
        const normalized = storageKey.replace(/^favorites_/, '').replace(`${STORAGE_PREFIX}:`, '')
        if (normalized && !Array.from(candidateKeys).some(candidate => candidate === normalized || `favorites_${candidate}` === storageKey || `${STORAGE_PREFIX}:${toStorageKey(candidate)}` === storageKey)) {
          continue
        }
      }

      const raw = localStorage.getItem(storageKey)
      if (!raw) {
        continue
      }

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        continue
      }

      collected.push(...parsed.filter(isFavoriteProductLike))
    }

    const uniqueById = new Map<number, FavoriteProduct>()
    for (const item of collected) {
      uniqueById.set(Number(item.id), item)
    }

    return Array.from(uniqueById.values())
  } catch {
    return []
  }
}

export const getUserFavoritesStorageKey = () => {
  try {
    const storedUser = localStorage.getItem('user')
    let userIdentifier: string | undefined

    if (storedUser) {
      const user = JSON.parse(storedUser) as Record<string, unknown>
      const rawUserIdentifier =
        (user.email as string | number | undefined) ||
        (user.username as string | number | undefined) ||
        (user.name as string | number | undefined) ||
        (user.id as string | number | undefined)

      userIdentifier = rawUserIdentifier !== undefined && rawUserIdentifier !== null
        ? String(rawUserIdentifier)
        : undefined

      if (userIdentifier && userIdentifier.trim()) {
        const normalized = userIdentifier.trim()
        const previousKey = localStorage.getItem('favorites_user_key')
        if (previousKey !== normalized) {
          localStorage.setItem('favorites_user_key', normalized)
        }
        return `${STORAGE_PREFIX}:${toStorageKey(normalized)}`
      }
    }

    const email = localStorage.getItem('email')
    if (email && email.trim()) {
      const normalizedEmail = email.trim()
      const previousKey = localStorage.getItem('favorites_user_key')
      if (previousKey !== normalizedEmail) {
        localStorage.setItem('favorites_user_key', normalizedEmail)
      }
      return `${STORAGE_PREFIX}:${toStorageKey(normalizedEmail)}`
    }

    const explicitKey = localStorage.getItem('favorites_user_key')
    if (explicitKey && explicitKey.trim()) {
      return `${STORAGE_PREFIX}:${toStorageKey(explicitKey)}`
    }
  } catch {
    // ignora falha ao ler o usuário salvo
  }

  return `${STORAGE_PREFIX}:guest`
}

export const readFavorites = (): FavoriteProduct[] => {
  try {
    const keysToRead = new Set<string>([
      getUserFavoritesStorageKey(),
      `${STORAGE_PREFIX}:guest`,
    ])

    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser) as Record<string, unknown>
      for (const value of [user.email, user.username, user.name, user.id]) {
        if (value !== undefined && value !== null && String(value).trim()) {
          const normalized = String(value).trim()
          keysToRead.add(`${STORAGE_PREFIX}:${toStorageKey(normalized)}`)
          keysToRead.add(`favorites_${normalized}`)
        }
      }
    }

    const email = localStorage.getItem('email')
    if (email && email.trim()) {
      const normalized = email.trim()
      keysToRead.add(`${STORAGE_PREFIX}:${toStorageKey(normalized)}`)
      keysToRead.add(`favorites_${normalized}`)
    }

    const explicitKey = localStorage.getItem('favorites_user_key')
    if (explicitKey && explicitKey.trim()) {
      const normalized = explicitKey.trim()
      keysToRead.add(`${STORAGE_PREFIX}:${toStorageKey(normalized)}`)
      keysToRead.add(`favorites_${normalized}`)
    }

    const collected: FavoriteProduct[] = []

    for (const key of keysToRead) {
      const raw = localStorage.getItem(key)
      if (!raw) {
        continue
      }

      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          collected.push(...parsed.filter(isFavoriteProductLike))
        }
      } catch {
        // ignora chave corrompida
      }
    }

    const merged = [...collected, ...readLegacyFavorites()]
    const uniqueById = new Map<number, FavoriteProduct>()
    for (const item of merged) {
      uniqueById.set(Number(item.id), item)
    }

    const favorites = Array.from(uniqueById.values())
    if (favorites.length > 0) {
      writeFavorites(favorites)
      return favorites
    }

    return []
  } catch {
    return []
  }
}

export const writeFavorites = (favorites: FavoriteProduct[]) => {
  try {
    localStorage.setItem(getUserFavoritesStorageKey(), JSON.stringify(favorites))
  } catch {
    // ignora falhas de storage
  }
}

export const isFavoriteProduct = (productId: number | string) => {
  const favorites = readFavorites()
  return favorites.some((item) => Number(item.id) === Number(productId))
}

export const addFavorite = (product: FavoriteProduct) => {
  const favorites = readFavorites()

  const next = favorites.some((item) => Number(item.id) === Number(product.id))
    ? favorites
    : [
        {
          ...product,
          id: Number(product.id),
          preco: Number(product.preco || 0),
        },
        ...favorites,
      ]

  writeFavorites(next)
  return !next.some((item) => Number(item.id) === Number(product.id)) || !favorites.some((item) => Number(item.id) === Number(product.id))
}

export const removeFavorite = (productId: number | string) => {
  const favorites = readFavorites()
  const next = favorites.filter((item) => Number(item.id) !== Number(productId))
  writeFavorites(next)
  return next
}

export const toggleFavorite = (product: FavoriteProduct) => {
  const favorites = readFavorites()
  const alreadySaved = favorites.some((item) => Number(item.id) === Number(product.id))

  if (alreadySaved) {
    const next = favorites.filter((item) => Number(item.id) !== Number(product.id))
    writeFavorites(next)
    return false
  }

  const next = [
    {
      ...product,
      id: Number(product.id),
      preco: Number(product.preco || 0),
    },
    ...favorites,
  ]

  writeFavorites(next)
  return true
}

export const getFavoriteCount = () => readFavorites().length
