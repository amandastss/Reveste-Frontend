```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { criarCheckout } from '@/api/pagamentosApi'

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

const carregandoPagamento = ref(false)
const mensagemErro = ref('')

const cartItems = computed(() => cartStore.items)

const subtotal = computed(() => cartStore.subtotal)

const isEmpty = computed(() => {
  return Array.isArray(cartItems.value) && cartItems.value.length === 0
})

function goBack() {
  window.history.back()
}

async function removeItem(item: CartItem) {
  const confirmar = confirm(`Deseja remover "${item.name}" do carrinho?`)

  if (!confirmar) {
    return
  }

  mensagemErro.value = ''

  try {
    await cartStore.removeItem(item.id)
  } catch (erro) {
    console.error('Erro ao remover produto:', erro)

    mensagemErro.value = 'Não foi possível remover o produto do carrinho.'
  }
}

async function checkout() {
  if (isEmpty.value) {
    return
  }

  mensagemErro.value = ''
  carregandoPagamento.value = true

  try {
    const resposta = await criarCheckout()

    if (!resposta.checkout_url) {
      throw new Error('O link de pagamento não foi retornado.')
    }

    window.location.href = resposta.checkout_url
  } catch (erro: unknown) {
    console.error('Erro ao iniciar pagamento:', erro)

    let mensagem = 'Não foi possível iniciar o pagamento. Tente novamente.'

    if (typeof erro === 'object' && erro !== null && 'response' in erro) {
      const axiosError = erro as { response?: { data?: { detail?: string } } }
      mensagem = axiosError.response?.data?.detail || mensagem
    }

    mensagemErro.value = mensagem
  } finally {
    carregandoPagamento.value = false
  }
}

onMounted(async () => {
  try {
    await cartStore.loadCart()
  } catch (erro) {
    console.error('Erro ao carregar carrinho:', erro)

    mensagemErro.value = 'Não foi possível carregar o carrinho.'
  }
})
</script>

<template>
  <div class="cart-page">
    <header class="cart-header">
      <button @click="goBack" class="back-btn" aria-label="Voltar">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12" />

          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <h1>Seu Carrinho</h1>
    </header>

    <section class="cart-items">
      <!-- ERRO -->
      <div v-if="mensagemErro" class="cart-error">
        {{ mensagemErro }}
      </div>

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
                <h2>
                  {{ item.name }}
                </h2>

                <div class="details">
                  <span v-if="item.color">
                    {{ item.color }}
                  </span>

                  <span v-if="item.color && item.size"> | </span>

                  <span v-if="item.size">
                    {{ item.size }}
                  </span>
                </div>
              </div>

              <p class="price">R$ {{ Number(item.price).toFixed(2) }}</p>
            </div>

            <div class="item-actions">
              <span class="unique-item"> Peça única </span>

              <button class="remove-btn" @click="removeItem(item)">REMOVER</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer v-if="!isEmpty" class="cart-footer">
      <div class="subtotal">
        <span> Subtotal </span>

        <span> R$ {{ Number(subtotal).toFixed(2) }} </span>
      </div>

      <button class="checkout-btn" @click="checkout" :disabled="carregandoPagamento">
        {{ carregandoPagamento ? 'REDIRECIONANDO...' : 'SEGUIR PARA PAGAMENTO' }}
      </button>
    </footer>
  </div>
</template>

<style scoped src="/src/css/cart.css"></style>
```
