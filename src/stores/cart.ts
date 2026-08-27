import { defineStore } from 'pinia'
import axios from 'axios'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  color?: string
  size?: string
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    subtotal: (state) =>
      state.items.reduce((t, i) => t + i.price * i.quantity, 0),
  },

  actions: {
    // 🔹 CARREGAR CARRINHO
    async loadCart() {
      const token = localStorage.getItem('token')

      if (token) {
        // usuário logado → backend
        const res = await axios.get('/api/cart/', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.items = res.data
      } else {
        // visitante → localStorage
        const saved = localStorage.getItem('cart')
        this.items = saved ? JSON.parse(saved) : []
      }
    },

    // 🔹 ADICIONAR ITEM
    async addItem(item: CartItem) {
      const token = localStorage.getItem('token')

      const existing = this.items.find((i) => i.id === item.id)

      if (existing) {
        existing.quantity++
      } else {
        this.items.push({ ...item, quantity: 1 })
      }

      if (token) {
        await axios.post('/api/cart/', item, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },

    // 🔹 ATUALIZAR QTD
    async updateQuantity(id: number, quantity: number) {
      const item = this.items.find((i) => i.id === id)
      if (!item) return

      item.quantity = quantity

      const token = localStorage.getItem('token')

      if (token) {
        await axios.patch(`/api/cart/${id}/`, { quantity }, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },

    // 🔹 REMOVER
    async removeItem(id: number) {
      this.items = this.items.filter((i) => i.id !== id)

      const token = localStorage.getItem('token')

      if (token) {
        await axios.delete(`/api/cart/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },
  },
})