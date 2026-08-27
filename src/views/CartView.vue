<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const mensagemErro = ref('')
const carregando = ref(true)

const cartItems = computed(() => cartStore.items)
const subtotal = computed(() => cartStore.subtotal)

const isEmpty = computed(() => cartItems.value.length === 0)

function goBack() {
  router.back()
}

async function removeItem(productId: number) {
  mensagemErro.value = ''

  try {
    await cartStore.removeItem(productId)
  } catch (error: unknown) {
    let mensagem = 'Não foi possível remover o produto do carrinho.'
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: { detail?: string } } }
      mensagem = axiosError.response?.data?.detail || mensagem
    }
    mensagemErro.value = mensagem
  }
}

function irParaPagamento() {
  if (isEmpty.value) {
    return
  }

  router.push('/checkout')
}

onMounted(async () => {
  carregando.value = true
  mensagemErro.value = ''

  try {
    await cartStore.loadCart()
  } catch (error: unknown) {
    let mensagem = 'Não foi possível carregar o carrinho.'
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: { detail?: string } } }
      mensagem = axiosError.response?.data?.detail || mensagem
    }
    mensagemErro.value = mensagem
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <div class="cart-page">
    <header class="cart-header">
      <button @click="goBack" class="back-btn" aria-label="Voltar">←</button>

      <h1>Seu Carrinho</h1>
    </header>

    <main class="cart-content">
      <div v-if="carregando" class="loading">Carregando carrinho...</div>

      <div v-else-if="mensagemErro" class="cart-error">
        {{ mensagemErro }}
      </div>

      <div v-else-if="isEmpty" class="empty-cart">
        <h2>Seu carrinho está vazio</h2>

        <p>Adicione uma peça para continuar.</p>

        <button class="continue-btn" @click="router.push('/')">CONTINUAR COMPRANDO</button>
      </div>

      <section v-else class="cart-items">
        <article v-for="item in cartItems" :key="item.id" class="cart-item">
          <img v-if="item.image" :src="item.image" :alt="item.name" class="item-image" />

          <div class="item-info">
            <h2>{{ item.name }}</h2>

            <div class="details">
              <span v-if="item.color">
                {{ item.color }}
              </span>

              <span v-if="item.color && item.size"> · </span>

              <span v-if="item.size">
                {{ item.size }}
              </span>
            </div>

            <span class="unique-item"> Peça única </span>

            <strong class="price"> R$ {{ item.price.toFixed(2) }} </strong>

            <button class="remove-btn" @click="removeItem(item.produto)">REMOVER</button>
          </div>
        </article>
      </section>
    </main>

    <footer v-if="!carregando && !isEmpty" class="cart-footer">
      <div class="total">
        <span>Total</span>

        <strong> R$ {{ subtotal.toFixed(2) }} </strong>
      </div>

      <button class="checkout-btn" @click="irParaPagamento">SEGUIR PARA PAGAMENTO</button>
    </footer>
  </div>
</template>

<style scoped src="/src/css/cart.css"></style>
