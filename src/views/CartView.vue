<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import EditItemModal from './EditItemModal.vue'

interface CartItem {
  id: number
  name: string
  image: string
  price: number
  quantity: number
  size?: string
  color?: string
}

const cartStore = useCartStore()

const cartItems = computed(() => cartStore.items)
const subtotal = computed(() => cartStore.subtotal)

const isEmpty = computed(() => 
  Array.isArray(cartItems.value) && cartItems.value.length === 0
)

// modal
const editModalVisible = ref(false)
const itemBeingEdited = ref<CartItem | null>(null)

function editItem(item: CartItem) {
  itemBeingEdited.value = item
  editModalVisible.value = true
}

function onItemUpdated(data: { size: string; color: string }) {
  if (itemBeingEdited.value) {
    itemBeingEdited.value.size = data.size
    itemBeingEdited.value.color = data.color
  }
}

// ações
function goBack() {
  window.history.back()
}

function decreaseQuantity(item: CartItem) {
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.id, item.quantity - 1)
  } else {
    const confirmRemove = confirm('Deseja remover este item do carrinho?')

    if (confirmRemove) {
      cartStore.removeItem(item.id)
    }
  }
}


function increaseQuantity(item: CartItem) {
  cartStore.updateQuantity(item.id, item.quantity + 1)
}

function checkout() {
  alert('Pagamento ainda não implementado')
}

onMounted(() => {
  cartStore.loadCart()
})
</script>

<template>
  <div class="cart-page">
    <header class="cart-header">
      <button @click="goBack" class="back-btn" aria-label="Voltar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
      <h1>Seu Carrinho</h1>
    </header>

    <section class="cart-items">
      <!-- CARRINHO VAZIO -->
      <div v-if="isEmpty" class="empty-cart">
        <p>Seu carrinho está vazio.</p>
      </div>

      <!-- ITENS -->
      <div v-else>
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <img :src="item.image" :alt="item.name" class="item-image" />

          <div class="item-info">
            <div class="top-info">
              <div>
                <h2>{{ item.name }}</h2>
                <div class="details">
                  <span>{{ item.color }}</span>
                  <span>|</span>
                  <span>{{ item.size }}</span>
                </div>
              </div>
              <p class="price">${{ item.price * item.quantity }}</p>
            </div>

            <button class="edit-btn" @click="editItem(item)">EDIT</button>

            <div class="quantity-controls">
              <button @click="decreaseQuantity(item)">−</button>
              <span>{{ item.quantity }}</span>
              <button @click="increaseQuantity(item)">+</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER (só aparece se tiver item) -->
    <footer v-if="!isEmpty" class="cart-footer">
      <div class="subtotal">
        <span>Sub total</span>
        <span>${{ subtotal }}</span>
      </div>

      <button class="checkout-btn" @click="checkout">
        SEGUIR PARA PAGAMENTO
      </button>
    </footer>

    <!-- MODAL -->
    <EditItemModal 
      v-if="itemBeingEdited"
      :item="itemBeingEdited as any"
      :visible="editModalVisible"
      @close="editModalVisible = false"
      @update="onItemUpdated"
    />
  </div>
</template>

<style scoped src="/src/css/cart.css"></style>