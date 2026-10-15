<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loadMercadoPago } from '@mercadopago/sdk-js'
import { useCartStore } from '@/stores/cart'
import {
  consultarPedido,
  criarCheckout,
  finalizarCarrinho,
  isPedidoCancelado,
  isPedidoPago,
  PaymentApiError,
  processarPagamento,
  type CheckoutResponse,
  type PaymentBrickFormData,
  type PaymentResponse,
} from '@/api/pagamentosApi'

interface BrickController {
  unmount: () => void
}
interface PaymentBrickSettings {
  initialization: { amount: number; payer?: { email: string } }
  customization: {
    paymentMethods: {
      creditCard: string
      debitCard: string
      prepaidCard: string
    }
  }
  callbacks: {
    onReady: () => void
    onSubmit: (data: { formData: PaymentBrickFormData }) => Promise<void>
    onError: () => void
  }
}

declare global {
  interface Window {
    MercadoPago: new (
      key: string,
      options: { locale: string },
    ) => {
      bricks: () => {
        create: (
          type: 'payment',
          containerId: string,
          settings: PaymentBrickSettings,
        ) => Promise<BrickController>
      }
    }
  }
}

type EstadoCheckout =
  | 'carregando'
  | 'inicializando'
  | 'pronto'
  | 'enviando'
  | 'consultando'
  | 'aprovado'
  | 'pendente'
  | 'recusado'
  | 'cancelado'
  | 'desconhecido'
  | 'erro'

const router = useRouter()
const cartStore = useCartStore()
const estado = ref<EstadoCheckout>('carregando')
const erro = ref('')
const pedidoId = ref<number | null>(null)
const totalServidor = ref<number | null>(null)
const submitEmAndamento = ref(false)
const consultaEmAndamento = computed(() => estado.value === 'consultando')
const brickContainer = ref<HTMLElement | null>(null)
const resumoItens = ref<Array<{ id: number; nome: string; imagem: string; tamanho: string }>>([])
const apiUrlConfigured = Boolean(import.meta.env.VITE_API_URL)
const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY || ''
const totalFormatado = computed(() =>
  totalServidor.value === null
    ? ''
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        totalServidor.value,
      ),
)

let brickController: BrickController | null = null
let lastCheckout: CheckoutResponse | null = null
let lifecycleId = 0
let initializationPromise: Promise<void> | null = null

function isCurrentLifecycle(id: number): boolean {
  return id === lifecycleId
}

function friendlyError(error: unknown, fallback: string): string {
  return error instanceof PaymentApiError ? error.message : fallback
}

function atualizarItensResumo(items: typeof cartStore.items) {
  resumoItens.value = items.map((item) => ({
    id: item.id,
    nome: item.name || 'Peça única',
    imagem: item.image,
    tamanho: item.size,
  }))
}

async function atualizarCarrinhoSemApagarEmErro(): Promise<void> {
  try {
    await cartStore.loadCart()
  } catch {
    /* preserva o snapshot em caso de falha de rede */
  }
}

async function marcarResultadoDoPedido(
  id: number,
  lifecycle: number,
  gatewayStatus?: string | null,
): Promise<boolean> {
  if (!isCurrentLifecycle(lifecycle)) return false
  estado.value = 'consultando'
  erro.value = ''
  try {
    const pedido = await consultarPedido(id)
    if (!isCurrentLifecycle(lifecycle)) return false
    if (isPedidoPago(pedido.status)) {
      estado.value = 'aprovado'
      await atualizarCarrinhoSemApagarEmErro()
      await desmontarBrick()
      return true
    }
    if (isPedidoCancelado(pedido.status)) {
      estado.value = gatewayStatus?.toLowerCase() === 'rejected' ? 'recusado' : 'cancelado'
      await desmontarBrick()
      return false
    }
    estado.value = 'pendente'
    await desmontarBrick()
    return false
  } catch {
    if (isCurrentLifecycle(lifecycle)) {
      estado.value = 'desconhecido'
      erro.value =
        'Não foi possível confirmar o resultado. Consulte o pedido novamente antes de tentar outra vez.'
      await desmontarBrick()
    }
    return false
  }
}

async function desmontarBrick(): Promise<void> {
  const controller = brickController
  brickController = null
  if (controller) {
    try {
      controller.unmount()
    } catch {
      // Falha ao desmontar não altera o estado autoritativo do pedido.
    }
  }
}

async function enviarPagamento(formData: PaymentBrickFormData, lifecycle: number): Promise<void> {
  if (!isCurrentLifecycle(lifecycle) || submitEmAndamento.value || pedidoId.value === null) return
  submitEmAndamento.value = true
  estado.value = 'enviando'
  erro.value = ''
  try {
    const resposta: PaymentResponse = await processarPagamento(pedidoId.value, formData)
    if (!isCurrentLifecycle(lifecycle)) return
    // Um HTTP 200/status do gateway não confirma a compra: o pedido é a fonte oficial.
    if (Number(resposta.pedido_id) !== pedidoId.value) {
      estado.value = 'desconhecido'
      erro.value =
        'O servidor retornou um pedido diferente. Consulte seus pedidos para confirmar o resultado.'
      await desmontarBrick()
      return
    }
    await marcarResultadoDoPedido(pedidoId.value, lifecycle, resposta.status)
  } catch (error: unknown) {
    if (!isCurrentLifecycle(lifecycle)) return
    estado.value = 'desconhecido'
    erro.value = friendlyError(
      error,
      'Não foi possível confirmar o resultado. Consulte o pedido antes de tentar novamente.',
    )
    await atualizarCarrinhoSemApagarEmErro()
    await desmontarBrick()
  } finally {
    if (isCurrentLifecycle(lifecycle)) submitEmAndamento.value = false
  }
}

async function montarBrick(checkout: CheckoutResponse, lifecycle: number): Promise<void> {
  const amount = Number(checkout.amount)
  if (!Number.isFinite(amount) || amount <= 0)
    throw new Error('O servidor não retornou um total válido para o pedido.')
  if (!publicKey) throw new Error('O checkout não está configurado para este ambiente.')
  if (!brickContainer.value) throw new Error('Não foi possível abrir o formulário de pagamento.')

  estado.value = 'inicializando'
  await loadMercadoPago()
  if (!isCurrentLifecycle(lifecycle)) return
  if (!window.MercadoPago) throw new Error('Não foi possível carregar o formulário de pagamento.')

  const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' })
  const settings: PaymentBrickSettings = {
    initialization: {
      amount,
      ...(checkout.payer_email ? { payer: { email: checkout.payer_email } } : {}),
    },
    customization: {
      paymentMethods: {
        creditCard: 'all',
        debitCard: 'all',
        prepaidCard: 'all',
      },
    },
    callbacks: {
      onReady: () => {
        if (isCurrentLifecycle(lifecycle) && estado.value === 'inicializando')
          estado.value = 'pronto'
      },
      onSubmit: ({ formData }) => enviarPagamento(formData, lifecycle),
      onError: () => {
        if (isCurrentLifecycle(lifecycle)) {
          estado.value = submitEmAndamento.value ? 'desconhecido' : 'erro'
          erro.value = submitEmAndamento.value
            ? 'Não foi possível confirmar o resultado do pagamento. Consulte o pedido antes de tentar novamente.'
            : 'Não foi possível inicializar o formulário. Tente carregar o checkout novamente.'
          submitEmAndamento.value = false
          void desmontarBrick()
        }
      },
    },
  }

  const controller = await mp.bricks().create('payment', 'paymentBrick_container', settings)
  if (!isCurrentLifecycle(lifecycle)) {
    await controller.unmount()
    return
  }
  brickController = controller
}

async function iniciarCheckout(lifecycle: number): Promise<void> {
  if (!apiUrlConfigured) throw new Error('A API não está configurada para este ambiente.')
  estado.value = 'carregando'
  erro.value = ''
  await cartStore.loadCart()
  if (!isCurrentLifecycle(lifecycle)) return
  atualizarItensResumo(cartStore.items)
  if (cartStore.items.length === 0) {
    await router.replace('/carrinho')
    return
  }

  // O backend valida estoque, vendedor e valores; o browser apenas apresenta o retorno.
  const preparado = await finalizarCarrinho()
  if (!isCurrentLifecycle(lifecycle)) return
  const preparedId = Number(preparado.pedido_id)
  if (!Number.isSafeInteger(preparedId) || preparado.status.toUpperCase() !== 'PENDENTE') {
    if (preparado.status.toUpperCase() === 'PAGO') {
      pedidoId.value = preparedId
      await marcarResultadoDoPedido(preparedId, lifecycle)
      return
    }
    throw new Error('O pedido não está disponível para iniciar o pagamento.')
  }
  pedidoId.value = preparedId
  // GET após a preparação traz os preços/itens sincronizados que o backend acabou de validar.
  await cartStore.loadCart()
  if (!isCurrentLifecycle(lifecycle)) return
  atualizarItensResumo(cartStore.items)

  const checkout = await criarCheckout()
  if (!isCurrentLifecycle(lifecycle)) return
  if (Number(checkout.pedido_id) !== preparedId)
    throw new Error('Não foi possível confirmar que o pagamento corresponde ao pedido preparado.')
  if (checkout.status?.toUpperCase() === 'PAGO') {
    await marcarResultadoDoPedido(preparedId, lifecycle)
    return
  }
  lastCheckout = checkout
  totalServidor.value = Number(checkout.amount)
  await montarBrick(checkout, lifecycle)
}

function carregarCheckout(): Promise<void> {
  if (initializationPromise) return initializationPromise
  const lifecycle = lifecycleId
  initializationPromise = iniciarCheckout(lifecycle)
    .catch(async (error: unknown) => {
      if (!isCurrentLifecycle(lifecycle)) return
      estado.value = 'erro'
      erro.value = friendlyError(
        error,
        'Não foi possível preparar seu checkout. Atualize o carrinho e tente novamente.',
      )
      await atualizarCarrinhoSemApagarEmErro()
    })
    .finally(() => {
      if (isCurrentLifecycle(lifecycle)) initializationPromise = null
    })
  return initializationPromise
}

async function consultarNovamente(): Promise<void> {
  if (pedidoId.value === null || estado.value === 'consultando') return
  await marcarResultadoDoPedido(pedidoId.value, lifecycleId)
}

async function tentarNovamente(): Promise<void> {
  if (estado.value === 'desconhecido' || estado.value === 'pendente') {
    await consultarNovamente()
    return
  }
  if (estado.value !== 'erro') return
  if (brickController) {
    estado.value = 'pronto'
    erro.value = ''
    return
  }
  if (lastCheckout) {
    const lifecycle = lifecycleId
    erro.value = ''
    try {
      await montarBrick(lastCheckout, lifecycle)
    } catch {
      if (isCurrentLifecycle(lifecycle)) {
        estado.value = 'erro'
        erro.value = 'Não foi possível carregar o formulário. Tente novamente.'
      }
    }
    return
  }
  await carregarCheckout()
}

function voltarParaCarrinho(): void {
  void router.push('/carrinho')
}

onMounted(() => {
  void carregarCheckout()
})

onBeforeUnmount(() => {
  lifecycleId += 1
  const currentController = brickController
  brickController = null
  if (currentController) {
    try {
      currentController.unmount()
    } catch {
      // A desmontagem é best-effort durante a saída da tela.
    }
  }
})
</script>

<template>
  <main class="checkout-page">
    <header class="checkout-header">
      <button class="back-button" type="button" @click="voltarParaCarrinho">
        ← Voltar ao carrinho
      </button>
      <h1>Finalizar compra</h1>
    </header>
    <section v-if="estado === 'aprovado'" class="payment-result success" role="status">
      <h2>Pagamento aprovado</h2>
      <p>O backend confirmou o pagamento do pedido #{{ pedidoId }}.</p>
      <button type="button" @click="router.push('/pedidos')">VER MEUS PEDIDOS</button>
    </section>
    <section v-else-if="estado === 'pendente'" class="payment-result pending" role="status">
      <h2>Pagamento em processamento</h2>
      <p>O pedido #{{ pedidoId }} ainda aguarda confirmação. Não é necessário pagar novamente.</p>
      <button type="button" :disabled="consultaEmAndamento" @click="consultarNovamente">
        CONSULTAR PEDIDO
      </button>
    </section>
    <section v-else-if="estado === 'recusado'" class="payment-result declined" role="status">
      <h2>Pagamento não concluído</h2>
      <p>O pagamento foi recusado. Consulte seus pedidos para ver as opções disponíveis.</p>
      <button type="button" @click="router.push('/pedidos')">VER MEUS PEDIDOS</button>
    </section>
    <section v-else-if="estado === 'cancelado'" class="payment-result cancelled" role="status">
      <h2>Pedido cancelado ou reserva expirada</h2>
      <p>
        Este pedido não pode receber uma cobrança. Atualize o carrinho para verificar a
        disponibilidade.
      </p>
      <button type="button" @click="router.push('/carrinho')">ATUALIZAR CARRINHO</button>
    </section>
    <section v-else-if="estado === 'desconhecido'" class="payment-result pending" role="status">
      <h2>Resultado aguardando confirmação</h2>
      <p>
        {{
          erro ||
          'Não foi possível confirmar o resultado. Não envie outro pagamento até consultar o pedido.'
        }}
      </p>
      <button type="button" :disabled="consultaEmAndamento" @click="consultarNovamente">
        CONSULTAR PEDIDO
      </button>
    </section>
    <section v-else class="checkout-content">
      <div class="checkout-summary">
        <h2>Resumo do pedido</h2>
        <div v-for="item in resumoItens" :key="item.id" class="summary-item">
          <img v-if="item.imagem" :src="item.imagem" :alt="item.nome" />
          <div>
            <h3>{{ item.nome }}</h3>
            <p v-if="item.tamanho">Tamanho: {{ item.tamanho }}</p>
            <p>Peça única · quantidade 1</p>
          </div>
        </div>
        <div v-if="totalServidor !== null" class="checkout-total">
          <span>Total calculado pelo servidor</span>
          <strong>{{ totalFormatado }}</strong>
        </div>
      </div>
      <div class="payment-section">
        <h2>Pagamento seguro</h2>
        <p v-if="estado === 'carregando'" class="loading">
          Validando disponibilidade e preparando pedido...
        </p>
        <p v-else-if="estado === 'inicializando'" class="loading">
          Carregando formulário de pagamento...
        </p>
        <p v-else-if="estado === 'enviando' || estado === 'consultando'" class="loading">
          {{
            estado === 'enviando'
              ? 'Enviando pagamento com segurança...'
              : 'Consultando confirmação do pedido...'
          }}
        </p>
        <div v-if="erro" class="checkout-error" role="alert">{{ erro }}</div>
        <button
          v-if="estado === 'erro'"
          class="retry-button"
          type="button"
          @click="tentarNovamente"
        >
          TENTAR NOVAMENTE
        </button>
        <div
          v-show="estado === 'inicializando' || estado === 'pronto' || estado === 'enviando'"
          id="paymentBrick_container"
          ref="brickContainer"
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
  font-family: 'Montserrat', sans-serif;
}
.checkout-header {
  margin-bottom: 32px;
}
.checkout-header h1 {
  margin-top: 20px;
}
.back-button {
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
}
.checkout-content {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(400px, 1.5fr);
  gap: 32px;
  align-items: start;
}
.checkout-summary,
.payment-section {
  padding: 24px;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  background: white;
}
.summary-item {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
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
  gap: 12px;
  margin-top: 24px;
  font-size: 18px;
}
.loading {
  padding: 24px 0;
  text-align: center;
}
.checkout-error {
  margin: 16px 0;
  padding: 14px;
  border-radius: 8px;
  background: #fff0f0;
  color: #8a0000;
}
.retry-button,
.payment-result button {
  margin-top: 16px;
  padding: 12px 20px;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
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
.declined,
.cancelled {
  background: #fff0f0;
}
button:disabled {
  cursor: wait;
  opacity: 0.65;
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
