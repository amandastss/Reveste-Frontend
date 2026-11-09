export function normalizeQuestionIdentity(value: string | number | null | undefined): string {
  return String(value ?? '').trim().toLowerCase()
}

export function extractSellerKeysFromProduct(value: unknown): string[] {
  const sellerKeys = new Set<string>()

  const walk = (node: unknown) => {
    if (node == null) return

    if (typeof node === 'string' || typeof node === 'number') {
      const normalized = normalizeQuestionIdentity(node)
      if (normalized) {
        sellerKeys.add(normalized)
      }
      return
    }

    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }

    if (typeof node !== 'object') return

    const record = node as Record<string, unknown>

    for (const [key, nested] of Object.entries(record)) {
      const lowerKey = key.toLowerCase()

      const isSellerIdField = [
        'id',
        'user_id',
        'usuario_id',
        'seller_id',
        'vendedor_id',
        'owner_id',
        'userId',
        'usuarioId',
        'sellerId',
        'vendedorId',
      ].includes(lowerKey)

      const isSellerReferenceField = [
        'usuario',
        'user',
        'vendedor',
        'seller',
        'owner',
        'criador',
        'autor',
      ].includes(lowerKey) || lowerKey.includes('usuario') || lowerKey.includes('vendedor') || lowerKey.includes('seller') || lowerKey.includes('owner')

      if (isSellerIdField) {
        const normalized = normalizeQuestionIdentity(nested as string | number | null | undefined)
        if (normalized) {
          sellerKeys.add(normalized)
        }
        continue
      }

      if (isSellerReferenceField) {
        walk(nested)
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
