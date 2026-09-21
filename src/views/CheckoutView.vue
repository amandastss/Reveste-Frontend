<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { hasCartAuthToken, getCartAuthRedirectPath } from '@/utils/cartAuth'
import { getCheckoutResultState, getFriendlyCheckoutError } from '@/utils/checkoutPayment'

interface CheckoutResponse {
  total?: number | string
  preference_id?: string
  init_point?: string
  pedido_id?: number | string
  [key: string]: unknown
}

const router = useRouter()
const cartStore = useCartStore()

const carregando = ref(true)
const mensagemErro = ref('')
const submetendo = ref(false)
const showLoginRequiredModal = ref(false)
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const retornoPagamento = computed(() => {
  const params = new URLSearchParams(window.location.search)

  if (!params.get('status')) {
    return null
  }

  return getCheckoutResultState(window.location.search)
})

const temRetornoPagamento = computed(() => !!retornoPagamento.value)

function getHeaders() {
  const token = localStorage.getItem('token')

  return {
    'Content-Type': 'application/json',
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  }
}

function voltarParaCarrinho() {
  router.push('/carrinho')
}

function obterMensagemErro(data: unknown, mensagemPadrao: string): string {
  if (typeof data === 'object' && data !== null) {
    const erro = data as Record<string, unknown>

    return String(erro.detail || erro.message || erro.erro || erro.error || mensagemPadrao)
  }

  return mensagemPadrao
}

async function criarCheckout(): Promise<CheckoutResponse> {
  if (!API_URL) {
    throw new Error('A URL da API não foi encontrada no arquivo .env.')
  }

  const checkoutUrl = `${API_URL}/api/pagamentos/criar-checkout/`

  console.log('URL FINAL DO CHECKOUT:', checkoutUrl)

  const response = await fetch(checkoutUrl, {
    method: 'POST',
    headers: getHeaders(),
  })

  const contentType = response.headers.get('content-type') || ''
  let data: unknown

  if (contentType.includes('application/json')) {
    data = await response.json()
  } else {
    const texto = await response.text()

    console.error('Resposta recebida do checkout:', texto)
    throw new Error('O servidor retornou uma resposta inesperada.')
  }

  if (!response.ok) {
    console.error('Erro retornado pelo backend no checkout:', data)

    const mensagem = getFriendlyCheckoutError(
      response.status,
      obterMensagemErro(data, 'Não foi possível criar o checkout.'),
    )

    throw new Error(mensagem)
  }

  console.log('Checkout criado com sucesso:', data)

  return data as CheckoutResponse
}

function closeLoginRequiredModal() {
  showLoginRequiredModal.value = false
}

function redirectToAuth(mode: 'login' | 'register') {
  localStorage.setItem('isLogin', mode === 'login' ? 'true' : 'false')
  closeLoginRequiredModal()
  router.push(getCartAuthRedirectPath())
}

async function finalizarCompra() {
  if (submetendo.value) {
    return
  }

  if (!hasCartAuthToken()) {
    showLoginRequiredModal.value = true
    return
  }

  carregando.value = true
  mensagemErro.value = ''
  submetendo.value = true

  try {
    await cartStore.loadCart()

    if (cartStore.items.length === 0) {
      router.push('/carrinho')
      return
    }

    const checkout = await criarCheckout()
    const total = Number(checkout.total ?? cartStore.totalPrice)

    if (!Number.isFinite(total) || total <= 0) {
      throw new Error('O valor total do pedido é inválido.')
    }

    if (checkout.init_point) {
      window.location.href = checkout.init_point
      return
    }

    if (checkout.preference_id) {
      throw new Error('O checkout foi criado, mas o link de pagamento não foi retornado.')
    }

    throw new Error('Não foi possível iniciar o pagamento no momento.')
  } catch (error: unknown) {
    console.error('Erro ao iniciar checkout:', error)

    let mensagem = 'Não foi possível concluir a compra.'

    if (typeof error === 'object' && error !== null && 'message' in error) {
      const err = error as { message?: string }
      mensagem = err.message || mensagem
    }

    mensagemErro.value = mensagem
  } finally {
    carregando.value = false
    submetendo.value = false
  }
}

onMounted(async () => {
  if (temRetornoPagamento.value) {
    carregando.value = false
    return
  }

  try {
    await cartStore.loadCart()

    if (cartStore.items.length === 0) {
      router.push('/carrinho')
      return
    }
  } catch (error: unknown) {
    console.error('Erro ao carregar carrinho no checkout:', error)
    mensagemErro.value = 'Não foi possível carregar seu carrinho. Tente novamente.'
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <main class="checkout-page">
    <header class="checkout-header">
      <button class="back-button" @click="voltarParaCarrinho">← Voltar ao carrinho</button>

      <h1>Finalizar compra</h1>
    </header>

    <section
      v-if="temRetornoPagamento && retornoPagamento"
      class="payment-result"
      :class="{
        success: retornoPagamento.state === 'success',
        pending: retornoPagamento.state === 'pending',
        failure: retornoPagamento.state === 'failure',
      }"
    >
      <h2 v-if="retornoPagamento.state === 'success'">Pagamento aprovado! 🎉</h2>
      <h2 v-else-if="retornoPagamento.state === 'pending'">Pagamento em processamento</h2>
      <h2 v-else>Pagamento não concluído</h2>

      <p>{{ retornoPagamento.message }}</p>

      <p v-if="retornoPagamento.state === 'success'">
        Seu pedido foi confirmado e você pode acompanhar em "Meus pedidos".
      </p>

      <button @click="router.push('/pedidos')">VER MEUS PEDIDOS</button>
    </section>

    <section v-else class="checkout-content">
      <div class="checkout-summary">
        <h2>Resumo do pedido</h2>

        <div v-for="item in cartStore.items" :key="item.id" class="summary-item">
          <img v-if="item.image" :src="item.image" :alt="item.name" />

          <div>
            <h3>
              {{ item.name }}
            </h3>

            <p v-if="item.size">
              Tamanho:
              {{ item.size }}
            </p>

            <p>Peça única</p>
          </div>

          <strong>
            R$
            {{ Number(item.price).toFixed(2).replace('.', ',') }}
          </strong>
        </div>

        <div class="checkout-total">
          <span>Total</span>

          <strong>
            R$
            {{ Number(cartStore.totalPrice).toFixed(2).replace('.', ',') }}
          </strong>
        </div>
      </div>

      <div class="payment-section">
        <h2>Pagamento</h2>

        <div v-if="carregando" class="loading">Carregando seu checkout...</div>

        <div v-if="mensagemErro" class="checkout-error">
          {{ mensagemErro }}
        </div>

        <button class="finalize-btn" :disabled="carregando || submetendo" @click="finalizarCompra">
          {{ submetendo ? 'Redirecionando...' : 'Finalizar compra' }}
        </button>
      </div>
    </section>

    <div
      v-if="showLoginRequiredModal"
      class="auth-overlay"
      @click.self="closeLoginRequiredModal"
    >
      <div class="auth-modal">
        <div class="auth-modal-icon">🔒</div>

        <h2>Faça login para continuar</h2>

        <p>
          Para finalizar a compra, você precisa entrar na sua conta ou criar uma nova.
        </p>

        <div class="auth-actions">
          <button class="btn-secondary auth-btn" @click="redirectToAuth('login')">
            Fazer login
          </button>

          <button class="btn-primary auth-btn" @click="redirectToAuth('register')">
            Criar conta
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.checkout-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 80px;
  font-family: 'Montserrat', sans-serif;
}

.checkout-header {
  margin-bottom: 32px;
  font-family: 'Montserrat', sans-serif;
}

.checkout-header h1 {
  margin-top: 20px;
}

.back-button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
}

.checkout-content {
  display: grid;
  grid-template-columns:
    minmax(280px, 1fr)
    minmax(400px, 1.5fr);
  gap: 32px;
  align-items: start;
}

.checkout-summary,
.payment-section {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 24px;
}

.summary-item {
  display: grid;
  grid-template-columns: 70px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eeeeee;
}

.summary-item img {
  width: 70px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
}

.summary-item h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.summary-item p {
  margin: 4px 0;
  font-size: 14px;
}

.checkout-total {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  font-size: 20px;
}

.loading {
  padding: 30px 0;
  text-align: center;
}

.checkout-error {
  margin: 16px 0;
  padding: 14px;
  border-radius: 8px;
  background: #fff0f0;
  color: #a00000;
}

.payment-result {
  max-width: 600px;
  margin: 60px auto;
  padding: 40px;
  text-align: center;
  border-radius: 16px;
}

.success {
  background: #f2fff5;
}

.pending {
  background: #fff9e8;
}

.failure {
  background: #fff0f0;
}

.payment-result button,
.finalize-btn {
  margin-top: 20px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #1d1d1d;
  color: white;
}

.finalize-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

@media (max-width: 800px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .checkout-page {
    padding: 24px 16px 50px;
  }
}
</style>
