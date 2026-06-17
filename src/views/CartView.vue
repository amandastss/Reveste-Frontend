
<script setup lang="ts">
import { ref, computed } from 'vue'
import EditItemModal from './EditItemModal.vue'

interface CartItem {
  id: number
  name: string
  color: string
  size: string
  price: number
  quantity: number
  image: string
}

const cartItems = ref<CartItem[]>([
  {
    id: 1,
    name: 'The Joni High Rise Loose 29L',
    color: 'Preto',
    size: 'M',
    price: 100,
    quantity: 2,
    image:
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Graydon Button-Up',
    color: 'Azul Claro',
    size: 'G',
    price: 159,
    quantity: 2,
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Desire Vest',
    color: 'Rosa',
    size: 'M',
    price: 85,
    quantity: 2,
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=400&auto=format&fit=crop'
  }
])

// ── Modal de edição ───────────────────────────────────────────────────────────
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

// ── Carrinho ──────────────────────────────────────────────────────────────────
const subtotal = computed(() =>
  cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
)

function goBack() {
  window.history.back()
}

function decreaseQuantity(item: CartItem) {
  if (item.quantity > 1) item.quantity--
}

function increaseQuantity(item: CartItem) {
  item.quantity++
}

function checkout() {
  alert('Página de pagamento ainda não criada.')
}
</script>

<template>
  <div class="cart-page">
    <header class="cart-header">
      <button class="back-btn" @click="goBack">←</button>
      <h1>SEU CARRINHO</h1>
    </header>

    <section class="cart-items">
      <div
        v-for="item in cartItems"
        :key="item.id"
        class="cart-item"
      >
        <img
          :src="item.image"
          :alt="item.name"
          class="item-image"
        />

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
    </section>

    <footer class="cart-footer">
      <div class="subtotal">
        <span>Sub total</span>
        <span>${{ subtotal }}</span>
      </div>

      <button class="checkout-btn" @click="checkout">
        SEGUIR PARA PAGAMENTO
      </button>
    </footer>

    <!-- Modal de edição -->
    <EditItemModal
      :item="itemBeingEdited"
      :visible="editModalVisible"
      @close="editModalVisible = false"
      @update="onItemUpdated"
    />
  </div>
</template>

<style scoped src="/src/css/cart.css"></style>
