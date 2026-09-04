import { defineStore } from 'pinia'

import api from '@/api/config'

export interface CartItem {
  id: number
  itemPedidoId: number
  name: string
  color: string
  size: string
  price: number
  quantity: number
  image: string
}

interface BackendCartItem {
  id: number
  quantidade: number
  preco: string | number
  nome: string | null
  cor: string | null
  tamanho: string | null
  imagem_url: string | null
  produto: number
}

interface BackendCartResponse {
  pedido_id: number
  status: string
  itens: BackendCartItem[]
  total: string | number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    loading: false,
  }),

  getters: {
    totalItems: (state) => {
      return state.items.reduce(
        (total, item) => total + item.quantity,
        0
      )
    },

    totalPrice: (state) => {
      return state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      )
    },
  },

  actions: {
    async loadCart() {
      this.loading = true

      try {
        const response = await api.get<BackendCartResponse>(
          '/carrinho/'
        )

        console.log(
          'CARRINHO VINDO DO BACKEND:',
          response.data
        )

        const cartItems = response.data.itens ?? []

        const itemsWithProductData = await Promise.all(
          cartItems.map(async (item) => {
            try {
              const productResponse = await api.get(
                `/produtos/${item.produto}/`
              )

              const produto = productResponse.data

              return {
                id: item.produto,
                itemPedidoId: item.id,

                name:
                  item.nome ??
                  produto.nome ??
                  produto.titulo ??
                  'Produto',

                color:
                  item.cor ??
                  produto.cor ??
                  '',

                size:
                  item.tamanho ??
                  produto.tamanho ??
                  '',

                price: Number(item.preco),

                quantity: item.quantidade,

                image:
                  item.imagem_url ??
                  produto.imagem_url ??
                  produto.imagem ??
                  produto.foto ??
                  '',
              }
            } catch (error) {
              console.error(
                `Erro ao carregar produto ${item.produto}:`,
                error
              )

              return {
                id: item.produto,
                itemPedidoId: item.id,

                name: item.nome ?? 'Produto',

                color: item.cor ?? '',

                size: item.tamanho ?? '',

                price: Number(item.preco),

                quantity: item.quantidade,

                image: item.imagem_url ?? '',
              }
            }
          })
        )

        this.items = itemsWithProductData
      } catch (error) {
        console.error(
          'Erro ao carregar carrinho:',
          error
        )

        this.items = []

        throw error
      } finally {
        this.loading = false
      }
    },

    async addItem(productId: number) {
      try {
        await api.post('/carrinho/', {
          productId,
        })

        await this.loadCart()
      } catch (error) {
        console.error(
          'Erro ao adicionar produto ao carrinho:',
          error
        )

        throw error
      }
    },

    async removeItem(productId: number) {
      try {
        await api.delete('/carrinho/', {
          data: {
            productId,
          },
        })

        this.items = this.items.filter(
          (item) => item.id !== productId
        )
      } catch (error) {
        console.error(
          'Erro ao remover item do carrinho:',
          error
        )

        throw error
      }
    },

    clearCart() {
      this.items = []
    },
  },
})