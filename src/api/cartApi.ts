import api from './config'
import type { AxiosResponse } from 'axios'
import type { CartItem } from '@/stores/cart'

// ── Get Cart ──────────────────────────────────────────────────────────────
export const getCart = async (): Promise<AxiosResponse<CartItem[]>> => {
  try {
    return await api.get('/carrinho/')
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error)
    throw error
  }
}

// ── Add to Cart ───────────────────────────────────────────────────────────
export const addToCart = async (
  item: Omit<CartItem, 'id'>
): Promise<AxiosResponse<CartItem[]>> => {
  try {
    return await api.post('/carrinho/', item)
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error)
    throw error
  }
}

// ── Remove from Cart ──────────────────────────────────────────────────────
export const removeFromCart = async (
  itemId: number
): Promise<AxiosResponse<CartItem[]>> => {
  try {
    return await api.delete(`/carrinho/${itemId}/`)
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error)
    throw error
  }
}

// ── Update Cart Item ──────────────────────────────────────────────────────
export const updateCartItem = async (
  itemId: number,
  updates: Partial<CartItem>
): Promise<AxiosResponse<CartItem[]>> => {
  try {
    return await api.patch(`/carrinho/${itemId}/`, updates)
  } catch (error) {
    console.error('Erro ao atualizar item do carrinho:', error)
    throw error
  }
}

// ── Clear Cart ────────────────────────────────────────────────────────────
export const clearCart = async (): Promise<AxiosResponse> => {
  try {
    return await api.delete('/carrinho/')
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error)
    throw error
  }
}
