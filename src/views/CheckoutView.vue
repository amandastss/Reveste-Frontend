
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loadMercadoPago } from '@mercadopago/sdk-js'

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
} from '@/api/pagamentosApi'

import { useCartStore } from '@/stores/cart'

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

type MetodoPagamento = 'cartao' | 'pix' | 'boleto'

interface BrickController {
  unmount: () => void | Promise<void>
}

interface PaymentBrickSettings {
  initialization: {
    amount: number
    payer?: { email: string }
  }
  customization: {
    paymentMethods: {
      creditCard: string | string[]
      debitCard: string | string[]
      prepaidCard: string | string[]
      bankTransfer: string | string[]
      ticket: string | string[]
    }
  }
  callbacks: {
    onReady: () => void
    onSubmit: (data: { formData: PaymentBrickFormData }) => Promise<void>
    onError: (error?: unknown) => void
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

const router = useRouter()
const cartStore = useCartStore()

const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY?.trim() || ''

const estado = ref<EstadoCheckout>('carregando')
const erro = ref('')
const pedidoId = ref<number | null>(null)
const totalServidor = ref<number | null>(null)
const submitEmAndamento = ref(false)

const brickContainer = ref<HTMLElement | null>(null)

const resumoItens = ref<
  Array<{
    id: number
    nome: string
    imagem: string
    tamanho: string
    preco: number
  }>
>([])

const paymentInfo = ref<{
  paymentMethodId?: string
  qrCode?: string
  qrCodeBase64?: string
  ticketUrl?: string
} | null>(null)

const metodoEscolhido = ref<MetodoPagamento>('cartao')
const cpfPagador = ref('')
const buscandoCep = ref(false)
const cepValidado = ref(false)

const boletoAddress = reactive({
  street_name: '',
  street_number: '',
  neighborhood: '',
  city: '',
  federal_unit: '',
  zip_code: '',
})

let brickController: BrickController | null = null
let lastCheckout: CheckoutResponse | null = null
let lifecycleId = 0
let initializationPromise: Promise<void> | null = null
let cepRequestId = 0

const consultaEmAndamento = computed(() => estado.value === 'consultando')

const totalFormatado = computed(() =>
  totalServidor.value === null
    ? ''
    : new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(totalServidor.value),
)

const submetendo = computed(() =>
  estado.value === 'enviando' || submitEmAndamento.value,
)

function isCurrentLifecycle(id: number): boolean {
  return id === lifecycleId
}

function friendlyError(error: unknown, fallback: string): string {
  return error instanceof PaymentApiError ? error.message : fallback
}

function formatarValor(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function atualizarItensResumo(items: typeof cartStore.items): void {
  resumoItens.value = items.map((item) => ({
    id: item.id,
    nome: item.name || 'Peça única',
    imagem: item.image || '',
    tamanho: item.size || '',
    preco: Number(item.price) || 0,
  }))
}

async function atualizarCarrinhoSemApagarEmErro(): Promise<void> {
  try {
    await cartStore.loadCart()
  } catch {
    // Preserva o resumo do carrinho se houver falha de rede.
  }
}

async function desmontarBrick(): Promise<void> {
  const controller = brickController
  brickController = null

  if (!controller) return

  try {
    await Promise.resolve(controller.unmount())
  } catch {
    // A falha ao desmontar não altera o estado do pedido.
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
      estado.value =
        gatewayStatus?.toLowerCase() === 'rejected'
          ? 'recusado'
          : 'cancelado'

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

function cpfValido(valor: string): boolean {
  const cpf = valor.replace(/\D/g, '')

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  const calcularDigito = (base: string, pesoInicial: number): number => {
    const soma = [...base].reduce(
      (total, digito, index) =>
        total + Number(digito) * (pesoInicial - index),
      0,
    )

    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  return (
    calcularDigito(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
    calcularDigito(cpf.slice(0, 10), 11) === Number(cpf[10])
  )
}

async function consultarCep(): Promise<void> {
  const cep = boletoAddress.zip_code.replace(/\D/g, '').slice(0, 8)

  boletoAddress.zip_code = cep
  cepValidado.value = false

  const requestId = ++cepRequestId

  if (cep.length !== 8) {
    buscandoCep.value = false
    return
  }

  buscandoCep.value = true

  try {
    const response = await fetch(
      `https://viacep.com.br/ws/${cep}/json/`,
    )

    if (!response.ok) {
      throw new Error('Não foi possível consultar o CEP.')
    }

    const data: {
      erro?: boolean
      logradouro?: string
      bairro?: string
      localidade?: string
      uf?: string
    } = await response.json()

    if (requestId !== cepRequestId) return

    if (data.erro) {
      throw new Error('CEP não encontrado. Confira os números digitados.')
    }

    boletoAddress.street_name = data.logradouro || ''
    boletoAddress.neighborhood = data.bairro || ''
    boletoAddress.city = data.localidade || ''
    boletoAddress.federal_unit = data.uf || ''

    cepValidado.value = true
  } catch (error: unknown) {
    if (requestId === cepRequestId) {
      erro.value =
        error instanceof Error
          ? error.message
          : 'Não foi possível consultar o CEP.'
    }
  } finally {
    if (requestId === cepRequestId) {
      buscandoCep.value = false
    }
  }
}

function prepararDadosPagamento(
  formData: PaymentBrickFormData,
): PaymentBrickFormData | null {
  const paymentMethod = formData.payment_method_id?.trim()

  if (!paymentMethod) {
    erro.value = 'Não foi possível identificar o método de pagamento.'
    return null
  }

  const isCard = !['pix', 'bolbradesco'].includes(paymentMethod)

  if (isCard && !formData.token?.trim()) {
    erro.value =
      'O Mercado Pago não gerou o token do cartão. Confira os dados e tente novamente.'
    return null
  }

  const payer = {
    ...formData.payer,
  }

  if (paymentMethod === 'bolbradesco') {
    if (!cpfValido(cpfPagador.value)) {
      erro.value = 'Informe um CPF válido para gerar o boleto.'
      return null
    }

    const enderecoCompleto = Object.values(boletoAddress).every(
      (value) => value.trim().length > 0,
    )

    if (!enderecoCompleto) {
      erro.value = 'Preencha todos os campos de endereço para gerar o boleto.'
      return null
    }

    if (!cepValidado.value) {
      erro.value =
        'Informe um CEP válido e aguarde a validação antes de gerar o boleto.'
      return null
    }

    payer.identification = {
      type: 'CPF',
      number: cpfPagador.value.replace(/\D/g, ''),
    }

    payer.address = {
      ...boletoAddress,
    }
  }

  return {
    ...formData,
    payment_method_id: paymentMethod,
    payer: Object.keys(payer).length ? payer : undefined,
  }
}

async function enviarPagamento(
  formData: PaymentBrickFormData,
  lifecycle: number,
): Promise<void> {
  if (
    !isCurrentLifecycle(lifecycle) ||
    submitEmAndamento.value ||
    pedidoId.value === null
  ) {
    return
  }

  erro.value = ''

  const dadosPagamento = prepararDadosPagamento(formData)

  if (!dadosPagamento) {
    estado.value = 'pronto'
    return
  }

  submitEmAndamento.value = true
  estado.value = 'enviando'

  try {
    const resposta = await processarPagamento(
      pedidoId.value,
      dadosPagamento,
    )

    if (!isCurrentLifecycle(lifecycle)) return

    paymentInfo.value = {
      paymentMethodId:
        resposta.payment_method_id || dadosPagamento.payment_method_id,
      qrCode: resposta.qr_code,
      qrCodeBase64: resposta.qr_code_base64,
      ticketUrl: resposta.ticket_url,
    }

    if (Number(resposta.pedido_id) !== pedidoId.value) {
      estado.value = 'desconhecido'
      erro.value =
        'O servidor retornou um pedido diferente. Consulte seus pedidos para confirmar o resultado.'

      await desmontarBrick()
      return
    }

    await marcarResultadoDoPedido(
      pedidoId.value,
      lifecycle,
      resposta.status,
    )
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
    if (isCurrentLifecycle(lifecycle)) {
      submitEmAndamento.value = false
    }
  }
}

async function montarBrick(
  checkout: CheckoutResponse,
  lifecycle: number,
): Promise<void> {
  const amount = Number(checkout.amount)

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('O servidor não retornou um total válido para o pedido.')
  }

  if (!publicKey) {
    throw new Error(
      'A chave pública do Mercado Pago não está configurada neste ambiente.',
    )
  }

  estado.value = 'inicializando'

  await loadMercadoPago()
  await nextTick()

  if (!isCurrentLifecycle(lifecycle)) return

  if (!window.MercadoPago) {
    throw new Error('Não foi possível carregar o formulário de pagamento.')
  }

  if (!brickContainer.value) {
    throw new Error('Não foi possível abrir o formulário de pagamento.')
  }

  const mp = new window.MercadoPago(publicKey, {
    locale: 'pt-BR',
  })

  const settings: PaymentBrickSettings = {
    initialization: {
      amount,
      ...(checkout.payer_email
        ? { payer: { email: checkout.payer_email } }
        : {}),
    },
    customization: {
      paymentMethods: {
        creditCard: metodoEscolhido.value === 'cartao' ? 'all' : [],
        debitCard: metodoEscolhido.value === 'cartao' ? 'all' : [],
        prepaidCard: metodoEscolhido.value === 'cartao' ? 'all' : [],
        bankTransfer: metodoEscolhido.value === 'pix' ? ['pix'] : [],
        ticket:
          metodoEscolhido.value === 'boleto' ? ['bolbradesco'] : [],
      },
    },
    callbacks: {
      onReady: () => {
        if (
          isCurrentLifecycle(lifecycle) &&
          estado.value === 'inicializando'
        ) {
          estado.value = 'pronto'
        }
      },
      onSubmit: ({ formData }) =>
        enviarPagamento(formData, lifecycle),
      onError: (error) => {
        console.error('Erro no formulário do Mercado Pago:', error)

        if (isCurrentLifecycle(lifecycle)) {
          estado.value = submitEmAndamento.value
            ? 'desconhecido'
            : 'erro'

          erro.value = submitEmAndamento.value
            ? 'Não foi possível confirmar o resultado do pagamento. Consulte o pedido antes de tentar novamente.'
            : 'Não foi possível inicializar o formulário. Tente carregar o checkout novamente.'

          submitEmAndamento.value = false
          void desmontarBrick()
        }
      },
    },
  }

  const controller = await mp
    .bricks()
    .create('payment', 'paymentBrick_container', settings)

  if (!isCurrentLifecycle(lifecycle)) {
    await controller.unmount()
    return
  }

  brickController = controller
}

async function iniciarCheckout(lifecycle: number): Promise<void> {
  estado.value = 'carregando'
  erro.value = ''

  await cartStore.loadCart()

  if (!isCurrentLifecycle(lifecycle)) return

  atualizarItensResumo(cartStore.items)

  if (cartStore.items.length === 0) {
    await router.replace('/carrinho')
    return
  }

  if (!publicKey) {
    throw new Error(
      'O checkout não está configurado para este ambiente.',
    )
  }

  const preparado = await finalizarCarrinho()

  if (!isCurrentLifecycle(lifecycle)) return

  const preparedId = Number(preparado.pedido_id)
  const statusPreparado = preparado.status.toUpperCase()

  if (!Number.isSafeInteger(preparedId) || preparedId <= 0) {
    throw new Error('O servidor retornou um pedido inválido.')
  }

  if (statusPreparado === 'PAGO') {
    pedidoId.value = preparedId
    await marcarResultadoDoPedido(preparedId, lifecycle)
    return
  }

  if (
    !['PENDENTE', 'AGUARDANDO_PAGAMENTO'].includes(statusPreparado)
  ) {
    throw new Error(
      'O pedido não está disponível para iniciar o pagamento.',
    )
  }

  pedidoId.value = preparedId

  await cartStore.loadCart()

  if (!isCurrentLifecycle(lifecycle)) return

  atualizarItensResumo(cartStore.items)

  const checkout = await criarCheckout()

  if (!isCurrentLifecycle(lifecycle)) return

  if (Number(checkout.pedido_id) !== preparedId) {
    throw new Error(
      'Não foi possível confirmar que o pagamento corresponde ao pedido preparado.',
    )
  }

  if (checkout.payment_in_progress) {
    paymentInfo.value = {
      paymentMethodId: checkout.payment_method_id,
      qrCode: checkout.qr_code,
      qrCodeBase64: checkout.qr_code_base64,
      ticketUrl: checkout.ticket_url,
    }

    await marcarResultadoDoPedido(
      preparedId,
      lifecycle,
      checkout.payment_status,
    )

    return
  }

  if (checkout.status?.toUpperCase() === 'PAGO') {
    await marcarResultadoDoPedido(preparedId, lifecycle)
    return
  }

  lastCheckout = checkout
  totalServidor.value = Number(checkout.amount)

  await montarBrick(checkout, lifecycle)
}

function carregarCheckout(): Promise<void> {
  if (initializationPromise) {
    return initializationPromise
  }

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
      if (isCurrentLifecycle(lifecycle)) {
        initializationPromise = null
      }
    })

  return initializationPromise
}

async function selecionarMetodo(metodo: MetodoPagamento): Promise<void> {
  if (
    metodoEscolhido.value === metodo ||
    submitEmAndamento.value ||
    !lastCheckout ||
    !['pronto', 'erro'].includes(estado.value)
  ) {
    return
  }

  metodoEscolhido.value = metodo
  erro.value = ''

  await desmontarBrick()

  const lifecycle = lifecycleId

  try {
    await montarBrick(lastCheckout, lifecycle)
  } catch (error: unknown) {
    if (!isCurrentLifecycle(lifecycle)) return

    estado.value = 'erro'
    erro.value = friendlyError(
      error,
      'Não foi possível carregar este método de pagamento.',
    )
  }
}

async function consultarNovamente(): Promise<void> {
  if (pedidoId.value === null || estado.value === 'consultando') {
    return
  }

  await marcarResultadoDoPedido(pedidoId.value, lifecycleId)
}

async function tentarNovamente(): Promise<void> {
  if (
    estado.value === 'desconhecido' ||
    estado.value === 'pendente'
  ) {
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
    } catch (error: unknown) {
      if (!isCurrentLifecycle(lifecycle)) return

      estado.value = 'erro'
      erro.value = friendlyError(
        error,
        'Não foi possível carregar o formulário. Tente novamente.',
      )
    }

    return
  }

  await carregarCheckout()
}

function voltarParaCarrinho(): void {
  void router.push('/carrinho')
}

async function copiarCodigoPix(): Promise<void> {
  if (!paymentInfo.value?.qrCode) return

  try {
    await navigator.clipboard.writeText(paymentInfo.value.qrCode)
  } catch {
    erro.value =
      'Não foi possível copiar automaticamente. Selecione e copie o código Pix manualmente.'
  }
}

onMounted(() => {
  void carregarCheckout()
})

onBeforeUnmount(() => {
  lifecycleId += 1
  cepRequestId += 1

  const controller = brickController
  brickController = null

  if (controller) {
    try {
      void Promise.resolve(controller.unmount()).catch(() => undefined)
    } catch {
      // A desmontagem é best-effort ao sair da tela.
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

    <section
      v-if="estado === 'carregando'"
      class="loading"
      role="status"
    >
      Preparando seu checkout seguro...
    </section>

    <section
      v-else-if="estado === 'consultando'"
      class="loading"
      role="status"
    >
      Consultando o status do pedido...
    </section>

    <section
      v-else-if="estado === 'aprovado'"
      class="payment-result success"
      role="status"
    >
      <h2>Pagamento aprovado!</h2>
      <p>O backend confirmou o pagamento do pedido #{{ pedidoId }}.</p>

      <button type="button" @click="router.push('/pedidos')">
        VER MEUS PEDIDOS
      </button>
    </section>

    <section
      v-else-if="estado === 'pendente'"
      class="payment-result pending"
      role="status"
    >
      <h2>Pagamento em processamento</h2>

      <p>
        O pedido #{{ pedidoId }} ainda aguarda confirmação.
        Não é necessário pagar novamente.
      </p>

      <div
        v-if="paymentInfo?.qrCode || paymentInfo?.qrCodeBase64"
        class="payment-instructions"
      >
        <h3>Pagamento via Pix</h3>

        <img
          v-if="paymentInfo.qrCodeBase64"
          :src="`data:image/png;base64,${paymentInfo.qrCodeBase64}`"
          alt="QR Code Pix"
        />

        <label v-if="paymentInfo.qrCode">
          Pix Copia e Cola
          <input readonly :value="paymentInfo.qrCode" />
        </label>

        <button
          v-if="paymentInfo.qrCode"
          type="button"
          @click="copiarCodigoPix"
        >
          Copiar código Pix
        </button>
      </div>

      <p v-if="paymentInfo?.ticketUrl">
        <a
          :href="paymentInfo.ticketUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir boleto bancário
        </a>
      </p>

      <button
        type="button"
        :disabled="consultaEmAndamento"
        @click="consultarNovamente"
      >
        CONSULTAR PEDIDO
      </button>
    </section>

    <section
      v-else-if="estado === 'recusado'"
      class="payment-result declined"
      role="status"
    >
      <h2>Pagamento não concluído</h2>
      <p>
        O pagamento foi recusado. Consulte seus pedidos para verificar
        as opções disponíveis.
      </p>

      <button type="button" @click="router.push('/pedidos')">
        VER MEUS PEDIDOS
      </button>
    </section>

    <section
      v-else-if="estado === 'cancelado'"
      class="payment-result cancelled"
      role="status"
    >
      <h2>Pedido cancelado ou reserva expirada</h2>

      <p>
        Este pedido não pode receber uma cobrança.
        Atualize o carrinho para verificar a disponibilidade.
      </p>

      <button type="button" @click="router.push('/carrinho')">
        ATUALIZAR CARRINHO
      </button>
    </section>

    <section
      v-else-if="estado === 'desconhecido'"
      class="payment-result pending"
      role="status"
    >
      <h2>Resultado aguardando confirmação</h2>

      <p>
        {{
          erro ||
          'Não foi possível confirmar o resultado. Não envie outro pagamento até consultar o pedido.'
        }}
      </p>

      <button
        type="button"
        :disabled="consultaEmAndamento"
        @click="consultarNovamente"
      >
        CONSULTAR PEDIDO
      </button>
    </section>

    <section v-else class="checkout-content">
      <div class="checkout-summary">
        <h2>Resumo do pedido</h2>

        <div
          v-for="item in resumoItens"
          :key="item.id"
          class="summary-item"
        >
          <img
            v-if="item.imagem"
            :src="item.imagem"
            :alt="item.nome"
          />

          <div class="item-info">
            <h3>{{ item.nome }}</h3>
            <p v-if="item.tamanho">
              Tamanho: {{ item.tamanho }}
            </p>
            <p>Peça única · quantidade 1</p>
          </div>

        </div>

        <div v-if="totalServidor !== null" class="checkout-total">
          <span>Total calculado pelo servidor</span>
          <strong>{{ totalFormatado }}</strong>
        </div>

        <p class="secure-note">
          O valor do pedido é validado pelo servidor.
          A reserva da peça fica ativa durante o checkout.
        </p>
      </div>

      <div class="payment-section">
        <h2>Pagamento seguro</h2>

        <p class="payment-intro">
          Escolha entre cartão, Pix ou boleto.
          Os dados do cartão são processados pelo Mercado Pago;
          a Reveste não armazena os dados do cartão.
        </p>

        <div
          v-if="lastCheckout && ['pronto', 'erro'].includes(estado)"
          class="payment-choice"
          role="group"
          aria-label="Escolha o método de pagamento"
        >
          <button
            type="button"
            :class="{ selected: metodoEscolhido === 'cartao' }"
            :disabled="submetendo"
            @click="selecionarMetodo('cartao')"
          >
            Cartão
          </button>

          <button
            type="button"
            :class="{ selected: metodoEscolhido === 'pix' }"
            :disabled="submetendo"
            @click="selecionarMetodo('pix')"
          >
            Pix
          </button>

          <button
            type="button"
            :class="{ selected: metodoEscolhido === 'boleto' }"
            :disabled="submetendo"
            @click="selecionarMetodo('boleto')"
          >
            Boleto
          </button>
        </div>

        <p
          v-if="metodoEscolhido === 'pix'"
          class="address-hint"
        >
          O Mercado Pago exibirá o QR Code e o código Copia e Cola
          após a solicitação de pagamento.
        </p>

        <template v-if="metodoEscolhido === 'boleto'">
          <label class="payer-cpf">
            CPF do pagador
            <input
              v-model.trim="cpfPagador"
              autocomplete="off"
              inputmode="numeric"
              maxlength="14"
              placeholder="000.000.000-00"
            />
          </label>

          <fieldset class="boleto-address">
            <legend>Endereço para boleto bancário</legend>

            <p class="address-hint">
              Preencha estes dados somente se escolher boleto.
              Eles são necessários para emitir a cobrança.
            </p>

            <label>
              CEP
              <input
                v-model.trim="boletoAddress.zip_code"
                autocomplete="postal-code"
                inputmode="numeric"
                maxlength="9"
                @input="consultarCep"
              />

              <small v-if="buscandoCep">Consultando CEP...</small>
              <small v-else-if="cepValidado">CEP localizado</small>
            </label>

            <label>
              Rua
              <input
                v-model.trim="boletoAddress.street_name"
                autocomplete="address-line1"
              />
            </label>

            <label>
              Número
              <input
                v-model.trim="boletoAddress.street_number"
                autocomplete="address-line2"
              />
            </label>

            <label>
              Bairro
              <input
                v-model.trim="boletoAddress.neighborhood"
                autocomplete="address-level3"
              />
            </label>

            <label>
              Cidade
              <input
                v-model.trim="boletoAddress.city"
                autocomplete="address-level2"
              />
            </label>

            <label>
              UF
              <input
                v-model.trim="boletoAddress.federal_unit"
                maxlength="2"
                autocomplete="address-level1"
              />
            </label>
          </fieldset>
        </template>

        <div
          v-if="paymentInfo?.qrCode || paymentInfo?.qrCodeBase64 || paymentInfo?.ticketUrl"
          class="payment-instructions"
        >
          <h3>Instruções de pagamento</h3>

          <img
            v-if="paymentInfo.qrCodeBase64"
            :src="`data:image/png;base64,${paymentInfo.qrCodeBase64}`"
            alt="QR Code Pix"
          />

          <label v-if="paymentInfo.qrCode">
            Pix Copia e Cola
            <input readonly :value="paymentInfo.qrCode" />
          </label>

          <button
            v-if="paymentInfo.qrCode"
            type="button"
            @click="copiarCodigoPix"
          >
            Copiar código Pix
          </button>

          <a
            v-if="paymentInfo.ticketUrl"
            :href="paymentInfo.ticketUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir boleto / instruções de pagamento
          </a>
        </div>

        <p
          v-if="estado === 'inicializando'"
          class="loading"
        >
          Carregando formulário de pagamento...
        </p>

        <p
          v-else-if="estado === 'enviando'"
          class="loading"
        >
          Enviando pagamento com segurança...
        </p>

        <div
          v-if="erro"
          class="checkout-error"
          role="alert"
        >
          {{ erro }}
        </div>

        <button
          v-if="estado === 'erro'"
          class="retry-button"
          type="button"
          @click="tentarNovamente"
        >
          TENTAR NOVAMENTE
        </button>

        <div
          v-show="['inicializando', 'pronto', 'enviando'].includes(estado)"
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
  min-width: 0;
  padding: 24px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
}

.summary-item {
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr) auto;
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

.item-info {
  min-width: 0;
}

.item-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.item-info p {
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

.payment-intro,
.secure-note {
  color: #555;
  line-height: 1.5;
  font-size: 14px;
}

.loading {
  padding: 24px 0;
  text-align: center;
}

.payment-choice {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 18px 0;
}

.payment-choice button {
  flex: 1;
  min-width: 90px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.payment-choice button.selected {
  border-color: #1d1d1d;
  background: #1d1d1d;
  color: #fff;
}

.payment-choice button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.payer-cpf {
  display: grid;
  gap: 7px;
  margin-top: 18px;
  font-size: 14px;
  font-weight: 600;
}

.payer-cpf input {
  box-sizing: border-box;
  width: 100%;
  max-width: 360px;
  padding: 12px;
  border: 1px solid #cfcfcf;
  border-radius: 8px;
  font: inherit;
  font-weight: 400;
}

.boleto-address {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;
  margin: 18px 0;
  padding: 18px;
  border: 1px solid #dedede;
  border-radius: 10px;
  min-width: 0;
}

.boleto-address legend {
  padding: 0 8px;
  font-weight: 600;
}

.boleto-address label,
.payment-instructions label {
  display: grid;
  align-content: start;
  gap: 7px;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
}

.boleto-address input,
.payment-instructions input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 11px 12px;
  border: 1px solid #cfcfcf;
  border-radius: 8px;
  background: #fff;
  color: #222;
  font: inherit;
  font-weight: 400;
}

.boleto-address input:focus,
.payer-cpf input:focus {
  outline: 2px solid #333;
  outline-offset: 1px;
  border-color: #333;
}

.boleto-address small {
  color: #555;
  font-weight: 400;
}

.address-hint {
  grid-column: 1 / -1;
  margin: 0;
  color: #555;
  font-size: 13px;
  line-height: 1.5;
}

.payment-instructions {
  display: grid;
  gap: 12px;
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow-wrap: anywhere;
}

.payment-instructions img {
  display: block;
  width: min(100%, 260px);
  margin: 0 auto;
}

.payment-instructions a {
  color: #222;
  text-decoration: underline;
}

.payment-instructions button {
  padding: 10px;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
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

@media (max-width: 520px) {
  .boleto-address {
    grid-template-columns: 1fr;
  }

  .summary-item {
    grid-template-columns: 60px minmax(0, 1fr);
  }

  .summary-item > strong {
    grid-column: 2;
  }
}
</style>
