export function normalizeQuestionIdentity(value: string | number | null | undefined): string {
  return String(value ?? '').trim().toLowerCase()
}

export function extractSellerKeysFromProduct(value: unknown): string[] {
  const sellerKeys = new Set<string>()

  const walk = (node: unknown, isSellerObject = false) => {
    if (node == null) return

    if (typeof node === 'string' || typeof node === 'number') {
      if (isSellerObject) {
        const normalized = normalizeQuestionIdentity(node)
        if (normalized) sellerKeys.add(normalized)
      }
      return
    }

    if (Array.isArray(node)) {
      node.forEach((item) => walk(item, isSellerObject))
      return
    }

    if (typeof node !== 'object') return

    const record = node as Record<string, unknown>

    for (const [key, nested] of Object.entries(record)) {
      const lowerKey = key.toLowerCase()

      const isSellerIdField = [
        'user_id',
        'usuario_id',
        'seller_id',
        'vendedor_id',
        'owner_id',
        'creator_id',
        'author_id',
        'autor_id',
        'criador_id',
        'userid',
        'usuarioid',
        'sellerid',
        'vendedorid',
        'ownerid',
        'creatorid',
        'authorid',
        'autorid',
        'criadorid',
        'user_email',
        'usuario_email',
        'seller_email',
        'vendedor_email',
        'owner_email',
        'creator_email',
        'author_email',
      ].includes(lowerKey)

      const isSellerReferenceField = [
        'usuario',
        'user',
        'vendedor',
        'seller',
        'owner',
        'criador',
        'autor',
        'created_by',
        'published_by',
        'author',
        'publicado_por',
        'criado_por',
      ].includes(lowerKey) || lowerKey.includes('usuario') || lowerKey.includes('vendedor') || lowerKey.includes('seller') || lowerKey.includes('owner')

      if (isSellerIdField) {
        const normalized = normalizeQuestionIdentity(nested as string | number | null | undefined)
        if (normalized) {
          sellerKeys.add(normalized)
        }
        continue
      }

      if (lowerKey === 'id' && isSellerObject) {
        const normalized = normalizeQuestionIdentity(nested as string | number | null | undefined)
        if (normalized) sellerKeys.add(normalized)
        continue
      }

      if (
        isSellerObject &&
        ['email', 'username', 'user_email', 'usuario_email'].includes(lowerKey)
      ) {
        const normalized = normalizeQuestionIdentity(nested as string | number | null | undefined)
        if (normalized) sellerKeys.add(normalized)
        continue
      }

      if (isSellerReferenceField) {
        walk(nested, true)
      }
    }
  }

  walk(value)

  return Array.from(sellerKeys).filter(Boolean)
}

export function canUserAccessQuestionReply({
  currentUserId,
  currentUserEmail,
  productSellerKeys,
}: {
  currentUserId: string
  currentUserEmail: string
  productSellerKeys: Array<string | number | null | undefined>
}): boolean {
  const sellerKeys = Array.from(
    new Set(
      productSellerKeys
        .map((value) => normalizeQuestionIdentity(value))
        .filter(Boolean),
    ),
  )

  const userMatches = [
    normalizeQuestionIdentity(currentUserId),
    normalizeQuestionIdentity(currentUserEmail),
  ].filter(Boolean)

  if (!sellerKeys.length || !userMatches.length) {
    return false
  }

  return sellerKeys.some((sellerKey) => userMatches.includes(sellerKey))
}

export function canUserDeleteQuestion({
  currentUserId,
  questionUserId,
}: {
  currentUserId: string
  questionUserId: string | number | null | undefined
}): boolean {
  const current = normalizeQuestionIdentity(currentUserId)
  const questionOwner = normalizeQuestionIdentity(questionUserId)

  if (!current || !questionOwner) {
    return false
  }

  return current === questionOwner
}
