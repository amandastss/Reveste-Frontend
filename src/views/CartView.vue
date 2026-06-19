
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()
const confirmRemoveId = ref<number | null>(null)
const confirmRemoveName = ref('')

// ── Carrinho ──────────────────────────────────────────────────────────────────
function goBack() {
  window.history.back()
}

function askRemoveItem(item: { id: number; name: string }) {
  confirmRemoveId.value = item.id
  confirmRemoveName.value = item.name
}

async function confirmRemoveItem() {
  if (confirmRemoveId.value === null) return
  await cartStore.removeItem(confirmRemoveId.value)
  confirmRemoveId.value = null
  confirmRemoveName.value = ''
}

function cancelRemoveItem() {
  confirmRemoveId.value = null
  confirmRemoveName.value = ''
}

async function removeItem(itemId: number) {
  await cartStore.removeItem(itemId)
}

function checkout() {
  alert('Página de pagamento ainda não criada.')
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await cartStore.fetchCart()
})
</script>

<template>
  <div class="cart-page">
    <header class="cart-header">
      <button class="back-btn" @click="goBack">←</button>
      <h1>SEU CARRINHO</h1>
    </header>

    <!-- Loading State -->
    <div v-if="cartStore.loading" class="loading-state">
      Carregando carrinho...
    </div>

    <!-- Error State -->
    <div v-else-if="cartStore.error" class="error-state">
      {{ cartStore.error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="cartStore.isEmpty" class="empty-state">
      <p>Seu carrinho está vazio</p>
      <button @click="goBack" class="back-to-shopping">Continuar comprando</button>
    </div>

    <!-- Cart Items -->
    <section v-else class="cart-items">
      <div
        v-for="item in cartStore.items"
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
            <p class="price">R$ {{ (item.price * item.quantity).toFixed(2) }}</p>
          </div>

          <button class="remove-btn" @click="askRemoveItem(item)">Excluir</button>
        </div>
      </div>
    </section>

    <div v-if="confirmRemoveId !== null" class="confirm-overlay" @click.self="cancelRemoveItem">
      <div class="confirm-dialog">
        <h3>Confirmar exclusão</h3>
        <p>Tem certeza que quer excluir <strong>{{ confirmRemoveName }}</strong> do carrinho?</p>
        <div class="confirm-actions">
          <button class="btn-secondary" @click="cancelRemoveItem">Cancelar</button>
          <button class="btn-primary" @click="confirmRemoveItem">Excluir</button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer v-if="!cartStore.isEmpty && !cartStore.loading" class="cart-footer">
      <div class="subtotal">
        <span>Sub total</span>
        <span>R$ {{ cartStore.subtotal.toFixed(2) }}</span>
      </div>

      <button class="checkout-btn" @click="checkout">
        SEGUIR PARA PAGAMENTO
      </button>
    </footer>

  </div>
</template>

<style scoped>
@import '/src/css/cart.css';

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.confirm-dialog {
  width: min(100%, 380px);
  background: #fff;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}

.confirm-dialog h3 {
  margin: 0 0 12px;
  font-size: 18px;
}

.confirm-dialog p {
  margin: 0 0 20px;
  line-height: 1.6;
  color: #333;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary,
.btn-primary {
  min-width: 110px;
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.btn-secondary {
  background: #f2f2f2;
  color: #333;
}

.btn-primary {
  background: #d72d2d;
  color: #fff;
}
</style>
