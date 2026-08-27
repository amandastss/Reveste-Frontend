<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { useRouter } from 'vue-router'
import { loadMercadoPago } from '@mercadopago/sdk-js'

import { useCartStore } from '@/stores/cart'

// Extend Window interface para MercadoPago
declare global {
  interface Window {
    MercadoPago: new (
      publicKey: string,
      options: Record<string, unknown>,
    ) => {
      bricks: () => {
        create: (
          type: string,
          containerId: string,
          settings: Record<string, unknown>,
        ) => Promise<{ unmount: () => Promise<void> }>
      }
    }
  }
}

interface FormDataPayment {
  token?: string
  installments?: number
  [key: string]: unknown
}

interface PaymentResponse {
  status: string
  status_detail?: string
  total?: number
  preference_id?: string
  [key: string]: unknown
}

const router = useRouter()
const cartStore = useCartStore()

const carregando = ref(true)
const mensagemErro = ref('')
const pagamentoConcluido = ref(false)
const pagamentoPendente = ref(false)

let paymentBrickController: { unmount: () => Promise<void> } | null = null

const API_URL = import.meta.env.VITE_API_URL

const PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY

function getHeaders() {
  const token = localStorage.getItem('token')

  return {
    'Content-Type': 'application/json',

    Authorization: `Bearer ${token}`,
  }
}

function voltarParaCarrinho() {
  router.push('/carrinho')
}

async function criarCheckout() {
  const response = await fetch(`${API_URL}/api/pagamentos/criar-checkout/`, {
    method: 'POST',
    headers: getHeaders(),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || 'Não foi possível iniciar o pagamento.')
  }

  return data
}

async function processarPagamento(formData: FormDataPayment): Promise<PaymentResponse> {
  const response = await fetch(`${API_URL}/api/pagamentos/processar/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(formData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || 'Não foi possível processar o pagamento.')
  }

  return data
}

async function renderizarPaymentBrick() {
  try {
    carregando.value = true
    mensagemErro.value = ''

    if (!PUBLIC_KEY) {
      throw new Error('A Public Key do Mercado Pago não foi encontrada.')
    }

    await cartStore.loadCart()

    if (cartStore.items.length === 0) {
      router.push('/carrinho')

      return
    }

    const checkout = await criarCheckout()

    const total = Number(checkout.total)

    const preferenceId = checkout.preference_id

    await loadMercadoPago()

    const mp = new window.MercadoPago(PUBLIC_KEY, {
      locale: 'pt-BR',
    })

    const bricksBuilder = mp.bricks()

    const settings = {
      initialization: {
        amount: total,
        preferenceId: preferenceId,
      },

      customization: {
        paymentMethods: {
          creditCard: 'all',

          debitCard: 'all',

          prepaidCard: 'all',

          bankTransfer: 'all',
        },
      },

      callbacks: {
        onReady: () => {
          carregando.value = false
        },

        onSubmit: ({ formData }: { formData: FormDataPayment }) => {
          return new Promise<void>((resolve, reject) => {
            ;(async () => {
              mensagemErro.value = ''

              try {
                const resultado = await processarPagamento(formData)

                if (resultado.status === 'approved') {
                  pagamentoConcluido.value = true

                  await cartStore.loadCart()

                  resolve()

                  setTimeout(() => {
                    router.push('/pedidos')
                  }, 2500)

                  return
                }

                if (resultado.status === 'pending' || resultado.status === 'in_process') {
                  pagamentoPendente.value = true

                  resolve()

                  return
                }

                mensagemErro.value = resultado.status_detail || 'O pagamento não foi aprovado.'

                reject(new Error(mensagemErro.value))
              } catch (error: unknown) {
                console.error('Erro ao processar pagamento:', error)

                let mensagem = 'Não foi possível processar o pagamento.'
                if (typeof error === 'object' && error !== null && 'message' in error) {
                  const err = error as { message?: string }
                  mensagem = err.message || mensagem
                }
                mensagemErro.value = mensagem

                reject(error)
              }
            })()
          })
        },

        onError: (error: unknown) => {
          console.error('Erro no Mercado Pago:', error)

          mensagemErro.value = 'Ocorreu um erro ao carregar o pagamento.'

          carregando.value = false
        },
      },
    }

    paymentBrickController = await bricksBuilder.create(
      'payment',
      'paymentBrick_container',
      settings,
    )
  } catch (error: unknown) {
    console.error('Erro ao iniciar checkout:', error)

    carregando.value = false

    let mensagem = 'Não foi possível carregar o checkout.'
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const err = error as { message?: string }
      mensagem = err.message || mensagem
    }
    mensagemErro.value = mensagem
  }
}

onMounted(() => {
  renderizarPaymentBrick()
})

onBeforeUnmount(async () => {
  if (paymentBrickController) {
    try {
      await paymentBrickController.unmount()
    } catch (error) {
      console.error('Erro ao remover Payment Brick:', error)
    }
  }
})
</script>

<template>
  <main class="checkout-page">
    <header class="checkout-header">
      <button class="back-button" @click="voltarParaCarrinho">← Voltar ao carrinho</button>

      <h1>Finalizar compra</h1>
    </header>

    <!-- PAGAMENTO APROVADO -->

    <section v-if="pagamentoConcluido" class="payment-result success">
      <h2>Pagamento aprovado! 🎉</h2>

      <p>Sua compra foi realizada com sucesso.</p>

      <p>Você será redirecionado para seus pedidos.</p>
    </section>

    <!-- PAGAMENTO PENDENTE -->

    <section v-else-if="pagamentoPendente" class="payment-result pending">
      <h2>Pagamento em processamento</h2>

      <p>Estamos aguardando a confirmação do pagamento.</p>

      <p>Assim que o Mercado Pago confirmar o pagamento, o pedido será atualizado.</p>

      <button @click="router.push('/pedidos')">VER MEUS PEDIDOS</button>
    </section>

    <!-- CHECKOUT -->

    <section v-else class="checkout-content">
      <!-- RESUMO -->

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
          <span> Total </span>

          <strong>
            R$

            {{ Number(cartStore.subtotal).toFixed(2).replace('.', ',') }}
          </strong>
        </div>
      </div>

      <!-- PAGAMENTO -->

      <div class="payment-section">
        <h2>Pagamento</h2>

        <div v-if="carregando" class="loading">Carregando formas de pagamento...</div>

        <div v-if="mensagemErro" class="checkout-error">
          {{ mensagemErro }}
        </div>

        <!--
          Deve existir somente UM container
          com esse ID.
        -->

        <div id="paymentBrick_container"></div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.checkout-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 80px;
}

.checkout-header {
  margin-bottom: 32px;
}

.checkout-header h1 {
  margin-top: 20px;
}

.back-button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
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
  grid-template-columns:
    70px
    1fr
    auto;
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

.payment-result button {
  margin-top: 20px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
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
