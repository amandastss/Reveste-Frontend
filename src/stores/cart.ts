import { defineStore } from 'pinia'
import axios from 'axios'

export interface CartItem {
  id: number
  produto: number
  name: string
  price: number
  quantity: number
  image: string
  color?: string
  size?: string
}

interface CarrinhoProduto {
  id: number
  produto: number
  nome: string
  preco: string | number
  imagem_url: string
  cor?: string
  tamanho?: string
}

const API_URL = import.meta.env.VITE_API_URL

function getHeaders() {
  const token = localStorage.getItem('token')

  return {
    Authorization: `Bearer ${token}`,
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    pedidoId: null as number | null,
    status: null as string | null,
  }),

  getters: {
    subtotal: (state) => state.items.reduce((total, item) => total + Number(item.price), 0),
  },

  actions: {
    async loadCart() {
      const token = localStorage.getItem('token')

      if (!token) {
        this.items = []
        this.pedidoId = null
        this.status = null
        return
      }

      try {
        const response = await axios.get(`${API_URL}/api/carrinho/`, {
          headers: getHeaders(),
        })

        const data = response.data

        this.pedidoId = data.pedido_id
        this.status = data.status

        this.items = (data.itens || []).map((item: CarrinhoProduto) => ({
          id: item.id,
          produto: item.produto,
          name: item.nome,
          price: Number(item.preco),
          quantity: 1,
          image: item.imagem_url,
          color: item.cor,
          size: item.tamanho,
        }))
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error)

        this.items = []
        this.pedidoId = null
        this.status = null

        throw error
      }
    },

    async addItem(productId: number) {
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Você precisa estar logado para adicionar produtos ao carrinho.')
      }

      try {
        await axios.post(
          `${API_URL}/api/carrinho/`,
          {
            productId,
          },
          {
            headers: getHeaders(),
          },
        )

        await this.loadCart()
      } catch (error) {
        console.error('Erro ao adicionar produto ao carrinho:', error)

        throw error
      }
    },

    async removeItem(productId: number) {
      try {
        await axios.delete(`${API_URL}/api/carrinho/`, {
          headers: getHeaders(),

          data: {
            productId,
          },
        })

        this.items = this.items.filter((item) => item.produto !== productId)
      } catch (error) {
        console.error('Erro ao remover produto:', error)

        throw error
      }
    },

    clearCart() {
      this.items = []
      this.pedidoId = null
      this.status = null
    },
  },
})
