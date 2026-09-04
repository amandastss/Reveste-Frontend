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
    const key = getUserFavoritesStorageKey()
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (item): item is FavoriteProduct =>
        !!item &&
        typeof item === 'object' &&
        typeof item.id === 'number' &&
        typeof item.nome === 'string',
    )
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
