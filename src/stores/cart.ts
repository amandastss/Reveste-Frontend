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

const API_URL = import.meta.env.VITE_API_URL

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    subtotal: (state) =>
      state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
  },

  actions: {

    // 🔹 CARREGAR CARRINHO
    async loadCart() {
      const token = localStorage.getItem('token')

      if (token) {
        try {
          const res = await axios.get(
            `${API_URL}/api/cart/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          console.log('CARRINHO - resposta:', res.data)

          this.items = Array.isArray(res.data)
            ? res.data
            : res.data.results || []

        } catch (error) {
          console.error(
            'Erro ao carregar carrinho:',
            error
          )

          this.items = []
        }

      } else {
        const saved = localStorage.getItem('cart')

        try {
          this.items = saved
            ? JSON.parse(saved)
            : []

          if (!Array.isArray(this.items)) {
            this.items = []
          }

        } catch (error) {
          console.error(
            'Erro ao ler carrinho local:',
            error
          )

          this.items = []
        }
      }
    },


    // 🔹 ADICIONAR ITEM
    async addItem(item: CartItem) {
      const token = localStorage.getItem('token')

      const existing = this.items.find(
        (i) => i.id === item.id
      )

      // Atualiza visualmente primeiro
      if (existing) {
        existing.quantity++
      } else {
        this.items.push({
          ...item,
          quantity: 1,
        })
      }

      // Usuário logado → backend
      if (token) {
        try {
          await axios.post(
            `${API_URL}/api/cart/`,
            item,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          console.log(
            'Produto enviado para o backend'
          )

        } catch (error) {
          console.error(
            'Erro ao salvar carrinho no backend:',
            error
          )
        }

      } else {
        // Visitante → localStorage
        localStorage.setItem(
          'cart',
          JSON.stringify(this.items)
        )
      }
    },


    // 🔹 ATUALIZAR QUANTIDADE
    async updateQuantity(
      id: number,
      quantity: number
    ) {
      const item = this.items.find(
        (i) => i.id === id
      )

      if (!item) return

      item.quantity = quantity

      const token = localStorage.getItem('token')

      if (token) {
        try {
          await axios.patch(
            `${API_URL}/api/cart/${id}/`,
            {
              quantity,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

        } catch (error) {
          console.error(
            'Erro ao atualizar quantidade:',
            error
          )
        }

      } else {
        localStorage.setItem(
          'cart',
          JSON.stringify(this.items)
        )
      }
    },


    // 🔹 REMOVER ITEM
    async removeItem(id: number) {
      const token = localStorage.getItem('token')

      // Remove visualmente
      this.items = this.items.filter(
        (item) => item.id !== id
      )

      if (token) {
        try {
          await axios.delete(
            `${API_URL}/api/cart/${id}/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

        } catch (error) {
          console.error(
            'Erro ao remover produto:',
            error
          )
        }

      } else {
        localStorage.setItem(
          'cart',
          JSON.stringify(this.items)
        )
      }
    },
  },
})