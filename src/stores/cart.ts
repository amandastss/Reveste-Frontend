import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCart, addToCart, removeFromCart, updateCartItem, clearCart } from '@/api/cartApi'

export interface CartItem {
  id: number
  productId: number
  name: string
  color: string
  size: string
  price: number
  quantity: number
  image: string
}

const STORAGE_KEY = 'reveste_cart'

// ── Helpers ───────────────────────────────────────────────────────────────
const saveToLocalStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (err) {
    console.warn('Erro ao salvar carrinho em localStorage:', err)
  }
}

const loadFromLocalStorage = (): CartItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (err) {
    console.warn('Erro ao carregar carrinho de localStorage:', err)
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadFromLocalStorage())
  const loading = ref(false)
  const error = ref<string | null>(null)
  const useBackend = ref(true)

  // ── Computed ──────────────────────────────────────────────────────────────
  const subtotal = computed(() =>
    items.value.reduce((total, item) => total + item.price * item.quantity, 0)
  )

  const itemCount = computed(() =>
    items.value.reduce((count, item) => count + item.quantity, 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  // ── Actions ───────────────────────────────────────────────────────────────
  const fetchCart = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await getCart()
      items.value = response.data || []
      saveToLocalStorage(items.value)
    } catch (err) {
      console.warn('Backend não disponível, usando localStorage:', err)
      useBackend.value = false
      items.value = loadFromLocalStorage()
      // Não mostrar erro ao usuário se for 404 (backend não implementado)
    } finally {
      loading.value = false
    }
  }

  const addItem = async (item: Omit<CartItem, 'id'>) => {
    loading.value = true
    error.value = null
    try {
      if (useBackend.value) {
        const response = await addToCart(item)
        items.value = response.data || []
      } else {
        // Fallback local
        const newId = items.value.length > 0 ? Math.max(...items.value.map(i => i.id)) + 1 : 1
        const newItem: CartItem = { id: newId, ...item }
        items.value.push(newItem)
      }
      saveToLocalStorage(items.value)
    } catch (err) {
      useBackend.value = false
      // Tentar salvar localmente
      const newId = items.value.length > 0 ? Math.max(...items.value.map(i => i.id)) + 1 : 1
      const newItem: CartItem = { id: newId, ...item }
      items.value.push(newItem)
      saveToLocalStorage(items.value)
    } finally {
      loading.value = false
    }
  }

  const removeItem = async (itemId: number) => {
    loading.value = true
    error.value = null
    try {
      if (useBackend.value) {
        const response = await removeFromCart(itemId)
        items.value = response.data || []
      } else {
        items.value = items.value.filter(i => i.id !== itemId)
      }
      saveToLocalStorage(items.value)
    } catch (err) {
      useBackend.value = false
      items.value = items.value.filter(i => i.id !== itemId)
      saveToLocalStorage(items.value)
    } finally {
      loading.value = false
    }
  }

  const updateItem = async (itemId: number, updates: Partial<CartItem>) => {
    loading.value = true
    error.value = null
    try {
      if (useBackend.value) {
        const response = await updateCartItem(itemId, updates)
        items.value = response.data || []
      } else {
        const item = items.value.find(i => i.id === itemId)
        if (item) {
          Object.assign(item, updates)
        }
      }
      saveToLocalStorage(items.value)
    } catch (err) {
      useBackend.value = false
      const item = items.value.find(i => i.id === itemId)
      if (item) {
        Object.assign(item, updates)
      }
      saveToLocalStorage(items.value)
    } finally {
      loading.value = false
    }
  }

  const clear = async () => {
    loading.value = true
    error.value = null
    try {
      if (useBackend.value) {
        await clearCart()
      }
      items.value = []
      saveToLocalStorage(items.value)
    } catch (err) {
      useBackend.value = false
      items.value = []
      saveToLocalStorage(items.value)
    } finally {
      loading.value = false
    }
  }

  const decreaseQuantity = async (itemId: number) => {
    const item = items.value.find(i => i.id === itemId)
    if (item && item.quantity > 1) {
      await updateItem(itemId, { quantity: item.quantity - 1 })
    }
  }

  const increaseQuantity = async (itemId: number) => {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      await updateItem(itemId, { quantity: item.quantity + 1 })
    }
  }

  return {
    // State
    items,
    loading,
    error,
    useBackend,

    // Computed
    subtotal,
    itemCount,
    isEmpty,

    // Actions
    fetchCart,
    addItem,
    removeItem,
    updateItem,
    clear,
    decreaseQuantity,
    increaseQuantity
  }
})
