import { defineStore } from 'pinia'

export interface FavoriteItem {
  id: number
  nome: string
  preco: number
  imagem_url?: string | null
  marca?: string
}

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    items: [] as FavoriteItem[],
  }),

  actions: {
    getFavoritesKey() {
      const savedUser = localStorage.getItem('user')

      if (!savedUser) {
        return 'favorites_guest'
      }

      try {
        const user = JSON.parse(savedUser)

        // Usa o ID do usuário para criar favoritos separados
        if (user?.id) {
          return `favorites_${user.id}`
        }

        // Caso não tenha ID, usa o email
        if (user?.email) {
          return `favorites_${user.email}`
        }

        return 'favorites_guest'
      } catch (error) {
        console.error('Erro ao identificar usuário:', error)

        return 'favorites_guest'
      }
    },

    loadFavorites() {
      const key = this.getFavoritesKey()

      const saved = localStorage.getItem(key)

      try {
        this.items = saved
          ? JSON.parse(saved)
          : []
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)

        this.items = []
      }
    },

    saveFavorites() {
      const key = this.getFavoritesKey()

      localStorage.setItem(
        key,
        JSON.stringify(this.items),
      )
    },

    isFavorite(id: number) {
      return this.items.some(
        item => item.id === id,
      )
    },

    toggleFavorite(product: FavoriteItem) {
      const index = this.items.findIndex(
        item => item.id === product.id,
      )

      if (index !== -1) {
        this.items.splice(index, 1)
      } else {
        this.items.push(product)
      }

      this.saveFavorites()
    },

    removeFavorite(id: number) {
      this.items = this.items.filter(
        item => item.id !== id,
      )

      this.saveFavorites()
    },

    clearFavorites() {
      this.items = []
    },
  },
})