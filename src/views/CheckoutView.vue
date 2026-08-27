<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loadMercadoPago } from '@mercadopago/sdk-js'
import { useCartStore } from '@/stores/cart'

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
        ) => Promise<{
          unmount: () => Promise<void>
        }>
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
  [key: string]: unknown
}

interface CheckoutResponse {
  total: number
  preference_id?: string
  [key: string]: unknown
}

const router = useRouter()
const cartStore = useCartStore()

const carregando = ref(true)
const mensagemErro = ref('')
const pagamentoConcluido = ref(false)
const pagamentoPendente = ref(false)

let paymentBrickController: {
  unmount: () => Promise<void>
} | null = null

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const PUBLIC_KEY =
  import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY || ''

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

async function lerResposta(response: Response): Promise<unknown> {
  const contentType =
    response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return await response.json()
  }

  const texto = await response.text()

  console.error(
    'Resposta não JSON recebida do backend:',
    texto,
  )

  throw new Error(
    `O servidor retornou uma resposta inesperada. Status: ${response.status}`,
  )
}

function obterMensagemErro(
  data: unknown,
  mensagemPadrao: string,
): string {
  if (
    typeof data === 'object' &&
    data !== null
  ) {
    const erro = data as Record<string, unknown>

    return (
      String(
        erro.detail ||
          erro.message ||
          erro.erro ||
          mensagemPadrao,
      )
    )
  }

  return mensagemPadrao
}

async function criarCheckout(): Promise<CheckoutResponse> {
  const checkoutUrl =
    `${API_URL}/api/pagamentos/criar-checkout/`

  console.log(
    'URL FINAL DO CHECKOUT:',
    checkoutUrl,
  )

  const response = await fetch(checkoutUrl, {
    method: 'POST',
    headers: getHeaders(),
  })

  console.log(
    'STATUS DO CHECKOUT:',
    response.status,
  )

  const contentType =
    response.headers.get('content-type') || ''

  let data: unknown

  if (contentType.includes('application/json')) {
    data = await response.json()
  } else {
    const texto = await response.text()

    console.error(
      'Resposta recebida do checkout:',
      texto,
    )

    throw new Error(
      `Erro inesperado ao criar checkout. Status: ${response.status}`,
    )
  }

  if (!response.ok) {
    console.error(
      'Erro retornado pelo backend no checkout:',
      data,
    )

    throw new Error(
      obterMensagemErro(
        data,
        `Não foi possível criar o checkout. Status: ${response.status}`,
      ),
    )
  }

  console.log(
    'Checkout criado com sucesso:',
    data,
  )

  return data as CheckoutResponse
}

async function processarPagamento(
  formData: FormDataPayment,
): Promise<PaymentResponse> {
  const pagamentoUrl =
    `${API_URL}/api/pagamentos/processar/`

  console.log(
    'URL FINAL DO PAGAMENTO:',
    pagamentoUrl,
  )

  const response = await fetch(pagamentoUrl, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(formData),
  })

  console.log(
    'STATUS DO PAGAMENTO:',
    response.status,
  )

  const data = await lerResposta(response)

  if (!response.ok) {
    console.error(
      'Erro retornado pelo backend:',
      data,
    )

    throw new Error(
      obterMensagemErro(
        data,
        'Não foi possível processar o pagamento.',
      ),
    )
  }

  return data as PaymentResponse
}

async function renderizarPaymentBrick() {
  try {
    carregando.value = true
    mensagemErro.value = ''

    if (!API_URL) {
      throw new Error(
        'A URL da API não foi encontrada no arquivo .env.',
      )
    }

    if (!PUBLIC_KEY) {
      throw new Error(
        'A Public Key do Mercado Pago não foi encontrada no arquivo .env.',
      )
    }

    console.log('API URL:', API_URL)

    await cartStore.loadCart()

    console.log(
      'Itens do carrinho:',
      cartStore.items,
    )

    if (cartStore.items.length === 0) {
      router.push('/carrinho')
      return
    }

    const checkout = await criarCheckout()

    const total = Number(checkout.total)

    console.log(
      'Total recebido do checkout:',
      total,
    )

    if (!total || total <= 0) {
      throw new Error(
        'O valor total do pedido é inválido.',
      )
    }

    await loadMercadoPago()

    const mp = new window.MercadoPago(
      PUBLIC_KEY,
      {
        locale: 'pt-BR',
      },
    )

    const bricksBuilder = mp.bricks()

    const settings = {
      initialization: {
        amount: total,

        ...(checkout.preference_id
          ? {
              preferenceId:
                checkout.preference_id,
            }
          : {}),
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
          console.log(
            'Payment Brick carregado com sucesso',
          )

          carregando.value = false
        },

        onSubmit: ({
          formData,
        }: {
          formData: FormDataPayment
        }) => {
          return new Promise<void>(
            (resolve, reject) => {
              ;(async () => {
                mensagemErro.value = ''

                try {
                  console.log(
                    'Dados enviados para pagamento:',
                    formData,
                  )

                  const resultado =
                    await processarPagamento(
                      formData,
                    )

                  console.log(
                    'Resultado do pagamento:',
                    resultado,
                  )

                  if (
                    resultado.status ===
                    'approved'
                  ) {
                    pagamentoConcluido.value = true

                    await cartStore.loadCart()

                    resolve()

                    setTimeout(() => {
                      router.push('/pedidos')
                    }, 2500)

                    return
                  }

                  if (
                    resultado.status ===
                      'pending' ||
                    resultado.status ===
                      'in_process'
                  ) {
                    pagamentoPendente.value =
                      true

                    resolve()

                    return
                  }

                  mensagemErro.value =
                    resultado.status_detail ||
                    'O pagamento não foi aprovado.'

                  reject(
                    new Error(
                      mensagemErro.value,
                    ),
                  )
                } catch (
                  error: unknown
                ) {
                  console.error(
                    'Erro ao processar pagamento:',
                    error,
                  )

                  let mensagem =
                    'Não foi possível processar o pagamento.'

                  if (
                    typeof error ===
                      'object' &&
                    error !== null &&
                    'message' in error
                  ) {
                    const err = error as {
                      message?: string
                    }

                    mensagem =
                      err.message ||
                      mensagem
                  }

                  mensagemErro.value =
                    mensagem

                  reject(error)
                }
              })()
            },
          )
        },

        onError: (
          error: unknown,
        ) => {
          console.error(
            'Erro no Mercado Pago:',
            error,
          )

          mensagemErro.value =
            'Ocorreu um erro ao carregar o pagamento.'

          carregando.value = false
        },
      },
    }

    paymentBrickController =
      await bricksBuilder.create(
        'payment',
        'paymentBrick_container',
        settings,
      )
  } catch (error: unknown) {
    console.error(
      'Erro ao iniciar checkout:',
      error,
    )

    carregando.value = false

    let mensagem =
      'Não foi possível carregar o checkout.'

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error
    ) {
      const err = error as {
        message?: string
      }

      mensagem =
        err.message || mensagem
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
      console.error(
        'Erro ao remover Payment Brick:',
        error,
      )
    }
  }
})
</script>

<template>
  <main class="checkout-page">
    <header class="checkout-header">
      <button
        class="back-button"
        @click="voltarParaCarrinho"
      >
        ← Voltar ao carrinho
      </button>

      <h1>Finalizar compra</h1>
    </header>

    <section
      v-if="pagamentoConcluido"
      class="payment-result success"
    >
      <h2>Pagamento aprovado! 🎉</h2>

      <p>
        Sua compra foi realizada com sucesso.
      </p>

      <p>
        Você será redirecionado para seus pedidos.
      </p>
    </section>

    <section
      v-else-if="pagamentoPendente"
      class="payment-result pending"
    >
      <h2>
        Pagamento em processamento
      </h2>

      <p>
        Estamos aguardando a confirmação do pagamento.
      </p>

      <p>
        Assim que o pagamento for confirmado,
        seu pedido será atualizado.
      </p>

      <button
        @click="router.push('/pedidos')"
      >
        VER MEUS PEDIDOS
      </button>
    </section>

    <section
      v-else
      class="checkout-content"
    >
      <div class="checkout-summary">
        <h2>Resumo do pedido</h2>

        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="summary-item"
        >
          <img
            v-if="item.image"
            :src="item.image"
            :alt="item.name"
          />

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
            {{
              Number(item.price)
                .toFixed(2)
                .replace('.', ',')
            }}
          </strong>
        </div>

        <div class="checkout-total">
          <span>Total</span>

          <strong>
            R$
            {{
              Number(cartStore.totalPrice)
                .toFixed(2)
                .replace('.', ',')
            }}
          </strong>
        </div>
      </div>

      <div class="payment-section">
        <h2>Pagamento</h2>

        <div
          v-if="carregando"
          class="loading"
        >
          Carregando formas de pagamento...
        </div>

        <div
          v-if="mensagemErro"
          class="checkout-error"
        >
          {{ mensagemErro }}
        </div>

        <div
          id="paymentBrick_container"
        ></div>
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
