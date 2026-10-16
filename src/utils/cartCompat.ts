export function getCartMutationBodies(productId: number, quantity = 1) {
  const candidates = [
    { productId, quantity },
    { product_id: productId, quantity },
    { product_id: productId },
    { produto_id: productId, quantity },
    { produto_id: productId },
    { produto: productId, quantity },
    { produto: productId },
    { product: productId, quantity },
    { product: productId },
    { id: productId, quantity },
    { id: productId },
  ]

  return candidates.filter(
    (candidate, index, array) =>
      index ===
      array.findIndex(
        (item) => JSON.stringify(item) === JSON.stringify(candidate),
      ),
  )
}
