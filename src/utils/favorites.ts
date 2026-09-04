import api from '@/services/api'

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

const normalizeFavorite = (item: unknown): FavoriteProduct | null => {
  if (!item || typeof item !== 'object') {
    return null
  }

  const product = item as Record<string, unknown>

  const id = Number(product.id ?? product.product_id ?? product.produto_id ?? product.produto ?? product.product)
  const nome = String(product.nome ?? product.name ?? product.titulo ?? product.title ?? 'Produto')
  const preco = Number(product.preco ?? product.price ?? 0)

  if (!Number.isFinite(id) || id <= 0 || !nome) {
    return null
  }

  return {
    id,
    nome,
    preco,
    imagem_url:
      (typeof product.imagem_url === 'string' && product.imagem_url) ||
      (typeof product.image === 'string' && product.image) ||
      (typeof product.imagem === 'string' && product.imagem) ||
      null,
    categoria: (product.categoria as FavoriteProduct['categoria']) ?? null,
  }
}

const normalizeFavoritesList = (raw: unknown): FavoriteProduct[] => {
  if (!Array.isArray(raw)) {
    return []
  }

  return raw
    .map((item) => normalizeFavorite(item))
    .filter((item): item is FavoriteProduct => item !== null)
}

const getUserIdentifier = () => {
  try {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser) as Record<string, unknown>
      const rawUserIdentifier =
        (user.email as string | number | undefined) ||
        (user.username as string | number | undefined) ||
        (user.name as string | number | undefined) ||
        (user.id as string | number | undefined)

      if (rawUserIdentifier !== undefined && rawUserIdentifier !== null) {
        return String(rawUserIdentifier).trim()
      }
    }

    const email = localStorage.getItem('email')
    if (email && email.trim()) {
      return email.trim()
    }
  } catch {
    // ignora falha ao ler usuário salvo
  }

  return ''
}

export const getUserFavoritesStorageKey = () => {
  const userIdentifier = getUserIdentifier()
  if (userIdentifier) {
    return `${STORAGE_PREFIX}:${toStorageKey(userIdentifier)}`
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
    const normalized = favorites.map((item) => ({
      ...item,
      id: Number(item.id),
      preco: Number(item.preco || 0),
    }))

    localStorage.setItem(getUserFavoritesStorageKey(), JSON.stringify(normalized))
  } catch {
    // ignora falhas de storage
  }
}

const getToken = () => localStorage.getItem('token')

export const fetchFavoritesFromServer = async (): Promise<FavoriteProduct[]> => {
  const token = getToken()
  if (!token) {
    return readFavorites()
  }

  const endpoints = [
    '/favoritos/',
    '/favoritos',
    '/favoritos/me/',
    '/favoritos/me',
    '/usuarios/me/favoritos/',
    '/usuarios/me/favoritos',
    '/usuarios/favoritos/',
    '/usuarios/favoritos',
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint)
      const payload = response.data
      const data = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.favoritos)
              ? payload.favoritos
              : []

      const favorites = normalizeFavoritesList(data)
      if (favorites.length || Array.isArray(payload) && payload.length === 0) {
        writeFavorites(favorites)
        return favorites
      }
    } catch {
      // tenta o próximo endpoint
    }
  }

  return readFavorites()
}

const tryRemoteFavoriteMutation = async (action: 'add' | 'remove', product: FavoriteProduct) => {
  const token = getToken()
  if (!token) {
    return false
  }

  const endpoints = [
    '/favoritos/',
    '/favoritos',
    '/favoritos/me/',
    '/usuarios/me/favoritos/',
    '/usuarios/favoritos/',
  ]

  const payloads = [
    { produto: product.id, product_id: product.id, id: product.id },
    { produto_id: product.id },
    { product: product.id },
    { product_id: Number(product.id) },
  ]

  for (const endpoint of endpoints) {
    for (const payload of payloads) {
      try {
        if (action === 'add') {
          await api.post(endpoint, payload)
        } else {
          await api.delete(endpoint, { data: payload })
        }
        return true
      } catch {
        // tenta outra combinação de endpoint/payload
      }
    }
  }

  return false
}

export const isFavoriteProduct = (productId: number | string) => {
  const favorites = readFavorites()
  return favorites.some((item) => Number(item.id) === Number(productId))
}

export const addFavorite = async (product: FavoriteProduct) => {
  const favorites = readFavorites()
  const exists = favorites.some((item) => Number(item.id) === Number(product.id))

  if (!exists) {
    const next = [
      {
        ...product,
        id: Number(product.id),
        preco: Number(product.preco || 0),
      },
      ...favorites,
    ]

    writeFavorites(next)
    await tryRemoteFavoriteMutation('add', product)
    return true
  }

  return false
}

export const removeFavorite = async (productId: number | string) => {
  const favorites = readFavorites()
  const next = favorites.filter((item) => Number(item.id) !== Number(productId))
  writeFavorites(next)

  const target = favorites.find((item) => Number(item.id) === Number(productId))
  if (target) {
    await tryRemoteFavoriteMutation('remove', target)
  }

  return next
}

export const toggleFavorite = async (product: FavoriteProduct) => {
  const favorites = readFavorites()
  const alreadySaved = favorites.some((item) => Number(item.id) === Number(product.id))

  if (alreadySaved) {
    await removeFavorite(product.id)
    return false
  }

  await addFavorite(product)
  return true
}

export const getFavoriteCount = () => readFavorites().length

export const syncFavoritesFromServer = async () => {
  const favorites = await fetchFavoritesFromServer()
  writeFavorites(favorites)
  return favorites
}
