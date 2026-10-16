import { defineStore } from 'pinia'
import { getUserFavoritesStorageKey, readFavorites, type FavoriteProduct, writeFavorites } from '@/utils/favorites'

export interface FavoriteItem extends FavoriteProduct {
  marca?: string
}

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    items: [] as FavoriteItem[],
  }),

  actions: {
    getFavoritesKey() {
      return getUserFavoritesStorageKey()
    },

    loadFavorites() {
      this.items = readFavorites() as FavoriteItem[]
    },

    saveFavorites() {
      writeFavorites(this.items as FavoriteProduct[])
    },

    isFavorite(id: number) {
      return this.items.some(item => Number(item.id) === Number(id))
    },

    toggleFavorite(product: FavoriteItem) {
      const itemId = Number(product.id)
      const index = this.items.findIndex(item => Number(item.id) === itemId)

      if (index !== -1) {
        this.items.splice(index, 1)
      } else {
        this.items.push({
          ...product,
          id: itemId,
          preco: Number(product.preco || 0),
        })
      }

      this.saveFavorites()
    },

    removeFavorite(id: number) {
      this.items = this.items.filter(item => Number(item.id) !== Number(id))
      this.saveFavorites()
    },

    clearFavorites() {
      this.items = []
      this.saveFavorites()
    },
  },
})