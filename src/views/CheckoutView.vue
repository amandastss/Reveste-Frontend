<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loadMercadoPago } from '@mercadopago/sdk-js'
import api from '@/api/config'
import { criarCheckout, processarPagamento, type CheckoutPreparado, type DadosPagamento } from '@/api/pagamentosApi'
import { useCartStore } from '@/stores/cart'
import { hasCartAuthToken, getCartAuthRedirectPath } from '@/utils/cartAuth'
import type { CheckoutResult } from '@/utils/checkoutPayment'

interface BrickFormData {
  token?: unknown
  payment_method_id?: unknown
  installments?: unknown
  issuer_id?: unknown
  payer?: unknown
  selectedPaymentMethod?: unknown
}

interface BrickController {
  unmount: () => Promise<void> | void
}

interface MercadoPagoWindow extends Window {
  MercadoPago?: new (
    publicKey: string,
    options?: { locale?: string },
  ) => {
    bricks: () => {
      create: (
        brick: string,
        containerId: string,
        settings: Record<string, unknown>,
      ) => Promise<BrickController>
    }
  }
}

const router = useRouter()
const cartStore = useCartStore()
const API_PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY?.trim()
const carregando = ref(true)
const submetendo = ref(false)
const mensagemErro = ref('')
const checkoutPreparado = ref<CheckoutPreparado | null>(null)
const resultadoPagamento = ref<CheckoutResult | null>(null)
const showLoginRequiredModal = ref(false)
const paymentInstructions = ref<{ qr_code?: string; qr_code_base64?: string; ticket_url?: string } | null>(null)
const boletoAddress = reactive({
  street_name: '',
  street_number: '',
  neighborhood: '',
  city: '',
  federal_unit: '',
  zip_code: '',
})
let brickController: BrickController | null = null

const temRetornoPagamento = computed(() => resultadoPagamento.value !== null)

function voltarParaCarrinho() {
  router.push('/carrinho')
}

function closeLoginRequiredModal() {
  showLoginRequiredModal.value = false
}

function redirectToAuth(mode: 'login' | 'register') {
  localStorage.setItem('isLogin', mode === 'login' ? 'true' : 'false')
  closeLoginRequiredModal()
  router.push(getCartAuthRedirectPath())
}

async function copiarCodigoPix() {
  if (!paymentInstructions.value?.qr_code) return
  try {
    await navigator.clipboard.writeText(paymentInstructions.value.qr_code)
  } catch {
    mensagemErro.value = 'Não foi possível copiar automaticamente. Selecione e copie o código Pix manualmente.'
  }
}

const buscandoCep = ref(false)
const cpfPagador = ref('')
const metodoEscolhido = ref<'cartao' | 'pix' | 'boleto'>('cartao')
const cepValidado = ref(false)
let cepRequestId = 0

async function consultarCep(_event?: Event) {
  const cep = boletoAddress.zip_code.replace(/\D/g, '').slice(0, 8)
  if (boletoAddress.zip_code !== cep) boletoAddress.zip_code = cep
  cepValidado.value = false
  if (cep.length !== 8) return

  const requestId = ++cepRequestId
  buscandoCep.value = true
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    if (!response.ok) throw new Error('Não foi possível consultar o CEP.')
    const data = await response.json()
    if (requestId !== cepRequestId) return
    if (data.erro) {
      cepValidado.value = false
      mensagemErro.value = 'CEP não encontrado. Confira os números digitados.'
      return
    }
    boletoAddress.street_name = data.logradouro || boletoAddress.street_name
    boletoAddress.neighborhood = data.bairro || boletoAddress.neighborhood
    boletoAddress.city = data.localidade || boletoAddress.city
    boletoAddress.federal_unit = data.uf || boletoAddress.federal_unit
    cepValidado.value = true
  } catch {
    if (requestId === cepRequestId) {
      mensagemErro.value = 'Não foi possível consultar o CEP agora. Confira sua conexão e tente novamente.'
    }
  } finally {
    if (requestId === cepRequestId) buscandoCep.value = false
  }
}

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function obterErroPagamento(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response
    if (typeof response?.data === 'object' && response.data !== null) {
      const data = response.data as Record<string, unknown>
      const detail = data.detail ?? data.error_message ?? data.message
      if (typeof detail === 'string' && detail.trim()) return detail
    }
  }
  return error instanceof Error ? error.message : 'Não foi possível processar o pagamento.'
}

async function carregarRetornoPagamento() {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('status')) return false

  carregando.value = true
  const pedidoId = params.get('pedido_id') ?? params.get('pedidoId')
  try {
    if (!pedidoId || !/^\d+$/.test(pedidoId)) {
      throw new Error('Não foi possível identificar o pedido para confirmar o pagamento.')
    }
    // Nunca confiamos no status da URL: a confirmação vem do backend autenticado.
    const response = await api.get<{ status: string; mercado_pago_status?: string }>(`/pedidos/${pedidoId}/`)
    const statusPedido = String(response.data.status || '').toUpperCase()
    const statusGateway = String(response.data.mercado_pago_status || '').toLowerCase()

    if (statusPedido === 'PAGO') {
      resultadoPagamento.value = {
        state: 'success',
        pedidoId,
        status: 'approved',
        message: 'Pagamento aprovado e pedido confirmado.',
      }
    } else if (statusPedido === 'CANCELADO' || ['rejected', 'cancelled'].includes(statusGateway)) {
      resultadoPagamento.value = {
        state: 'failure',
        pedidoId,
        status: statusGateway || 'rejected',
        message: 'O pagamento não foi aprovado. Você pode atualizar o carrinho e tentar novamente.',
      }
    } else {
      resultadoPagamento.value = {
        state: 'pending',
        pedidoId,
        status: statusGateway || 'pending',
        message: 'O pagamento ainda está sendo processado. Confira o status em Meus pedidos.',
      }
    }
  } catch (error: unknown) {
    resultadoPagamento.value = {
      state: 'failure',
      pedidoId,
      status: null,
      message: error instanceof Error
        ? error.message
        : 'Não foi possível confirmar o pagamento. Confira o pedido em Meus pedidos.',
    }
  } finally {
    carregando.value = false
  }
  return true
}

function cpfValido(valor: string): boolean {
  const cpf = valor.replace(/\D/g, '')
  if (cpf.length !== 11 || /^([0-9])\\1{10}$/.test(cpf)) return false
  const calcularDigito = (base: string, pesoInicial: number) => {
    const soma = [...base].reduce((total, digito, index) => total + Number(digito) * (pesoInicial - index), 0)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return calcularDigito(cpf.slice(0, 9), 10) === Number(cpf[9])
    && calcularDigito(cpf.slice(0, 10), 11) === Number(cpf[10])
}

async function processarEnvioBrick(payload: BrickFormData): Promise<void> {
  if (!checkoutPreparado.value || submetendo.value) return
  submetendo.value = true
  mensagemErro.value = ''

  try {
    if (typeof payload.payment_method_id !== 'string' || !payload.payment_method_id.trim()) {
      throw new Error('Não foi possível identificar o método de pagamento selecionado.')
    }
    const paymentMethod = payload.payment_method_id.trim()
    const isCard = !['pix', 'bolbradesco'].includes(paymentMethod)
    if (isCard && (typeof payload.token !== 'string' || !payload.token.trim())) {
      throw new Error('O Mercado Pago não gerou o token do cartão. Confira os dados e tente novamente.')
    }

    const payer = payload.payer && typeof payload.payer === 'object'
      ? { ...(payload.payer as NonNullable<DadosPagamento['payer']>) }
      : {}
    if (paymentMethod === 'bolbradesco') {
      if (!cpfValido(cpfPagador.value)) {
        throw new Error('Informe um CPF válido de 11 números para gerar o boleto.')
      }
      payer.identification = { type: 'CPF', number: cpfPagador.value.replace(/\D/g, '') }
      if (Object.values(boletoAddress).some((value) => !value.trim())) {
        throw new Error('Preencha todos os campos de endereço para gerar o boleto.')
      }
      if (!cepValidado.value) {
        throw new Error('Informe um CEP válido e aguarde a validação automática antes de gerar o boleto.')
      }
      payer.address = { ...boletoAddress }
    }

    const dadosPagamento: DadosPagamento = {
      pedido_id: checkoutPreparado.value.pedido_id,
      payment_method_id: paymentMethod,
      ...(typeof payload.token === 'string' && payload.token.trim() ? { token: payload.token } : {}),
      ...(payload.installments != null ? { installments: Number(payload.installments) } : {}),
      ...(payload.issuer_id ? { issuer_id: String(payload.issuer_id) } : {}),
      ...(Object.keys(payer).length ? { payer } : {}),
    }

    const resposta = await processarPagamento(dadosPagamento)
    const statusPagamento = String(resposta.status || '').toLowerCase()
    const pedidoId = String(resposta.pedido_id ?? checkoutPreparado.value.pedido_id)
    if (statusPagamento === 'pending' && (resposta.qr_code || resposta.qr_code_base64 || resposta.ticket_url)) {
      paymentInstructions.value = {
        qr_code: resposta.qr_code,
        qr_code_base64: resposta.qr_code_base64,
        ticket_url: resposta.ticket_url,
      }
    }

    if (statusPagamento === 'approved') {
      resultadoPagamento.value = {
        state: 'success',
        pedidoId,
        status: statusPagamento,
        message: 'Pagamento aprovado e pedido confirmado.',
      }
      cartStore.clearCart()
    } else if (statusPagamento === 'pending' || statusPagamento === 'in_process') {
      resultadoPagamento.value = {
        state: 'pending',
        pedidoId,
        status: statusPagamento,
        message: 'Pagamento enviado e aguardando confirmação do Mercado Pago.',
      }
    } else {
      resultadoPagamento.value = {
        state: 'failure',
        pedidoId,
        status: statusPagamento || null,
        message: 'O pagamento não foi aprovado. Tente novamente com outro cartão.',
      }
    }
  } catch (error: unknown) {
    mensagemErro.value = obterErroPagamento(error)
    throw error
  } finally {
    submetendo.value = false
  }
}

async function montarPaymentBrick(checkout: CheckoutPreparado) {
  if (!API_PUBLIC_KEY) {
    throw new Error('A chave pública do Mercado Pago não está configurada no ambiente do frontend.')
  }

  await loadMercadoPago()
  const MercadoPago = (window as MercadoPagoWindow).MercadoPago
  if (!MercadoPago) {
    throw new Error('Não foi possível carregar o formulário seguro do Mercado Pago.')
  }

  await nextTick()
  const mp = new MercadoPago(API_PUBLIC_KEY)
  brickController = await mp.bricks().create('payment', 'paymentBrick_container', {
    initialization: {
      amount: Number(checkout.amount),
      payer: checkout.payer_email ? { email: checkout.payer_email } : undefined,
    },
    customization: {
      paymentMethods: {
        creditCard: metodoEscolhido.value === 'cartao' ? 'all' : [],
        debitCard: metodoEscolhido.value === 'cartao' ? 'all' : [],
        prepaidCard: metodoEscolhido.value === 'cartao' ? 'all' : [],
        bankTransfer: metodoEscolhido.value === 'pix' ? ['pix'] : [],
        ticket: metodoEscolhido.value === 'boleto' ? ['bolbradesco'] : [],
      },
      visual: { style: { theme: 'default' } },
    },
    locale: 'pt-BR',
    callbacks: {
      onReady: () => { carregando.value = false },
      onSubmit: async ({ formData }: { formData: BrickFormData }) => processarEnvioBrick(formData),
      onError: (error: unknown) => {
        console.error('Erro no formulário do Mercado Pago:', error)
        if (!submetendo.value) {
          mensagemErro.value = 'O formulário de pagamento encontrou um problema. Recarregue o checkout e tente novamente.'
        }
      },
    },
  })
}

async function selecionarMetodo(metodo: 'cartao' | 'pix' | 'boleto') {
  if (metodoEscolhido.value === metodo || submetendo.value) return
  metodoEscolhido.value = metodo
  mensagemErro.value = ''
  if (brickController) {
    await Promise.resolve(brickController.unmount()).catch(() => undefined)
    brickController = null
  }
  if (checkoutPreparado.value) {
    carregando.value = true
    try {
      await montarPaymentBrick(checkoutPreparado.value)
    } catch (error: unknown) {
      mensagemErro.value = error instanceof Error
        ? error.message
        : 'Não foi possível carregar este método de pagamento.'
      carregando.value = false
    }
  }
}

async function iniciarPagamento() {
  if (submetendo.value || checkoutPreparado.value) return
  if (!hasCartAuthToken()) {
    showLoginRequiredModal.value = true
    return
  }

  carregando.value = true
  mensagemErro.value = ''
  try {
    await cartStore.loadCart()
    if (cartStore.items.length === 0) {
      await router.push('/carrinho')
      return
    }
    if (!API_PUBLIC_KEY) {
      throw new Error('O pagamento ainda não está configurado neste ambiente. Tente novamente mais tarde.')
    }

    const checkout = await criarCheckout()
    if (!Number.isFinite(Number(checkout.amount)) || Number(checkout.amount) <= 0) {
      throw new Error('O valor total do pedido retornado pelo servidor é inválido.')
    }
    if (checkout.payment_in_progress) {
      const statusExistente = String(checkout.payment_status || '').toLowerCase()
      if (checkout.qr_code || checkout.qr_code_base64 || checkout.ticket_url) {
        paymentInstructions.value = {
          qr_code: checkout.qr_code,
          qr_code_base64: checkout.qr_code_base64,
          ticket_url: checkout.ticket_url,
        }
      }
      // A aprovação do gateway não basta para declarar o pedido pago:
      // o backend precisa confirmar e conciliar a venda também.
      const aguardandoConciliacao = statusExistente === 'approved'
      const falhou = statusExistente === 'rejected' || statusExistente === 'cancelled'
      resultadoPagamento.value = {
        state: falhou ? 'failure' : 'pending',
        pedidoId: String(checkout.pedido_id),
        status: statusExistente || 'pending',
        message: falhou
          ? 'A tentativa anterior foi recusada ou cancelada. Consulte Meus pedidos antes de iniciar outra tentativa.'
          : aguardandoConciliacao
            ? 'O Mercado Pago informa aprovação, mas o backend ainda precisa confirmar a venda. Consulte Meus pedidos e não tente pagar novamente.'
            : 'Este pedido já possui uma tentativa de pagamento. Conclua o Pix/boleto abaixo ou consulte Meus pedidos. Não inicie outra cobrança para evitar pagamento duplicado.',
      }
      carregando.value = false
      return
    }

    checkoutPreparado.value = checkout
    await montarPaymentBrick(checkout)
  } catch (error: unknown) {
    console.error('Erro ao iniciar pagamento:', error)
    mensagemErro.value = error instanceof Error ? error.message : 'Não foi possível iniciar o pagamento.'
    checkoutPreparado.value = null
    carregando.value = false
    if (brickController) {
      await Promise.resolve(brickController.unmount()).catch(() => undefined)
      brickController = null
    }
  }
}

onMounted(async () => {
  if (await carregarRetornoPagamento()) return
  try {
    await cartStore.loadCart()
    if (cartStore.items.length === 0) await router.replace('/carrinho')
  } catch (error) {
    console.error('Erro ao carregar carrinho no checkout:', error)
    mensagemErro.value = 'Não foi possível carregar seu carrinho. Tente novamente.'
  } finally {
    carregando.value = false
  }
})

onBeforeUnmount(async () => {
  if (brickController) {
    await Promise.resolve(brickController.unmount()).catch(() => undefined)
    brickController = null
  }
})
</script>

<template>
  <main class="checkout-page">
    <header class="checkout-header">
      <button class="back-button" @click="voltarParaCarrinho">← Voltar ao carrinho</button>
      <h1>Finalizar compra</h1>
    </header>

    <section v-if="carregando && !checkoutPreparado && !temRetornoPagamento" class="loading">
      Preparando seu checkout seguro...
    </section>

    <section
      v-else-if="temRetornoPagamento && resultadoPagamento"
      class="payment-result"
      :class="{
        success: resultadoPagamento.state === 'success',
        pending: resultadoPagamento.state === 'pending',
        failure: resultadoPagamento.state === 'failure',
      }"
    >
      <h2 v-if="resultadoPagamento.state === 'success'">Pagamento aprovado!</h2>
      <h2 v-else-if="resultadoPagamento.state === 'pending'">Pagamento em processamento</h2>
      <h2 v-else>Pagamento não concluído</h2>
      <p>{{ resultadoPagamento.message }}</p>
      <p v-if="resultadoPagamento.pedidoId">Pedido #{{ resultadoPagamento.pedidoId }}</p>
      <div v-if="paymentInstructions" class="payment-instructions">
        <h3>Conclua seu pagamento</h3>
        <img v-if="paymentInstructions.qr_code_base64" :src="`data:image/png;base64,${paymentInstructions.qr_code_base64}`" alt="QR Code Pix" />
        <label v-if="paymentInstructions.qr_code">Pix Copia e Cola<input readonly :value="paymentInstructions.qr_code" /></label>
        <button v-if="paymentInstructions.qr_code" type="button" @click="copiarCodigoPix">Copiar código Pix</button>
        <a v-if="paymentInstructions.ticket_url" :href="paymentInstructions.ticket_url" target="_blank" rel="noopener noreferrer">Abrir boleto / instruções de pagamento</a>
        <p>Após pagar, a confirmação pode levar algum tempo. Consulte Meus pedidos para acompanhar o status.</p>
      </div>
      <button @click="router.push('/pedidos')">Ver meus pedidos</button>
      <button v-if="resultadoPagamento.state === 'failure'" class="secondary-btn" @click="router.push('/carrinho')">
        Voltar ao carrinho
      </button>
    </section>

    <section v-else class="checkout-content">
      <div class="checkout-summary">
        <h2>Resumo do pedido</h2>
        <div v-for="item in cartStore.items" :key="item.id" class="summary-item">
          <img v-if="item.image" :src="item.image" :alt="item.name" />
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p v-if="item.size">Tamanho: {{ item.size }}</p>
            <p>Peça única</p>
          </div>
          <strong>{{ formatarValor(Number(item.price)) }}</strong>
        </div>
        <div class="checkout-total">
          <span>Total</span>
          <strong>{{ formatarValor(checkoutPreparado ? Number(checkoutPreparado.amount) : cartStore.totalPrice) }}</strong>
        </div>
        <p v-if="checkoutPreparado" class="secure-note">Valor confirmado pelo servidor. A reserva da peça fica ativa durante o checkout.</p>
      </div>

      <div class="payment-section">
        <h2>Pagamento seguro</h2>
        <p class="payment-intro">Escolha entre cartão, Pix ou boleto. Os dados do cartão são processados pelo Mercado Pago; a Reveste não armazena os dados do cartão.</p>
        <div class="payment-choice" role="group" aria-label="Escolha o método de pagamento">
          <button type="button" :class="{ selected: metodoEscolhido === 'cartao' }" :disabled="submetendo" @click="selecionarMetodo('cartao')">Cartão</button>
          <button type="button" :class="{ selected: metodoEscolhido === 'pix' }" :disabled="submetendo" @click="selecionarMetodo('pix')">Pix</button>
          <button type="button" :class="{ selected: metodoEscolhido === 'boleto' }" :disabled="submetendo" @click="selecionarMetodo('boleto')">Boleto</button>
        </div>
        <p v-if="metodoEscolhido === 'pix'" class="address-hint">Ao selecionar Pix, o Mercado Pago exibirá o QR Code e o código Copia e Cola após a solicitação de pagamento.</p>
        <template v-if="metodoEscolhido === 'boleto'">
          <label class="payer-cpf">CPF do pagador
            <input v-model.trim="cpfPagador" autocomplete="off" inputmode="numeric" maxlength="14" placeholder="000.000.000-00" />
          </label>
        </template>
        <fieldset v-if="metodoEscolhido === 'boleto'" class="boleto-address">
          <legend>Endereço para boleto bancário</legend>
          <p class="address-hint">Preencha estes dados somente se escolher boleto. São exigidos pelo Mercado Pago para emitir a cobrança.</p>
          <label>CEP<input v-model.trim="boletoAddress.zip_code" autocomplete="postal-code" inputmode="numeric" maxlength="9" @input="consultarCep($event)" /> <small v-if="buscandoCep">Consultando CEP...</small><small v-else-if="cepValidado">CEP localizado</small></label>
          <label>Rua<input v-model.trim="boletoAddress.street_name" autocomplete="address-line1" /></label>
          <label>Número<input v-model.trim="boletoAddress.street_number" autocomplete="address-line2" /></label>
          <label>Bairro<input v-model.trim="boletoAddress.neighborhood" autocomplete="address-level3" /></label>
          <label>Cidade<input v-model.trim="boletoAddress.city" autocomplete="address-level2" /></label>
          <label>UF<input v-model.trim="boletoAddress.federal_unit" maxlength="2" autocomplete="address-level1" /></label>
        </fieldset>
        <div v-if="paymentInstructions" class="payment-instructions">
          <h3>Conclua seu pagamento</h3>
          <img v-if="paymentInstructions.qr_code_base64" :src="`data:image/png;base64,${paymentInstructions.qr_code_base64}`" alt="QR Code Pix" />
          <label v-if="paymentInstructions.qr_code">Pix Copia e Cola<input readonly :value="paymentInstructions.qr_code" /></label>
          <button v-if="paymentInstructions.qr_code" type="button" @click="copiarCodigoPix">Copiar código Pix</button>
          <a v-if="paymentInstructions.ticket_url" :href="paymentInstructions.ticket_url" target="_blank" rel="noopener noreferrer">Abrir boleto / instruções de pagamento</a>
        </div>
        <div v-if="mensagemErro" class="checkout-error" role="alert">{{ mensagemErro }}</div>
        <div v-if="submetendo" class="loading">Enviando pagamento com segurança...</div>
        <div v-if="checkoutPreparado" id="paymentBrick_container"></div>
        <div v-else>
          <p v-if="carregando" class="loading">Conferindo disponibilidade e valor...</p>
          <button class="finalize-btn" :disabled="carregando" @click="iniciarPagamento">
            {{ carregando ? 'Preparando...' : 'Continuar para pagamento' }}
          </button>
        </div>
      </div>
    </section>

    <div v-if="showLoginRequiredModal" class="auth-overlay" @click.self="closeLoginRequiredModal">
      <div class="auth-modal">
        <h2>Faça login para continuar</h2>
        <p>Para finalizar a compra, entre na sua conta ou crie uma nova.</p>
        <div class="auth-actions">
          <button class="btn-secondary auth-btn" @click="redirectToAuth('login')">Fazer login</button>
          <button class="btn-primary auth-btn" @click="redirectToAuth('register')">Criar conta</button>
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
.checkout-header { margin-bottom: 32px; }
.checkout-header h1 { margin-top: 20px; }
.back-button {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
}
.checkout-content {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(400px, 1.5fr);
  gap: 32px;
  align-items: start;
}
.checkout-summary, .payment-section {
  min-width: 0;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 24px;
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
.item-info h3 { margin: 0 0 8px; font-size: 16px; }
.item-info p { margin: 4px 0; font-size: 14px; }
.checkout-total {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
  font-size: 20px;
}
.payment-intro, .secure-note { color: #555; line-height: 1.5; font-size: 14px; }
.loading { padding: 24px 0; text-align: center; }
.payment-choice { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0; }
.payment-choice button { flex: 1; min-width: 90px; padding: 12px; border: 1px solid #ccc; border-radius: 8px; background: #fff; cursor: pointer; }
.payment-choice button.selected { border-color: #1d1d1d; background: #1d1d1d; color: #fff; }
.payment-choice button:disabled { opacity: .6; cursor: wait; }
.payer-cpf { display: grid; gap: 6px; margin-top: 16px; font-size: 14px; }
.payer-cpf input { width: 100%; max-width: 320px; padding: 10px; border: 1px solid #ccc; border-radius: 6px; }
.boleto-address { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 18px 0; padding: 14px; border: 1px solid #ddd; border-radius: 8px; }
.boleto-address legend { padding: 0 6px; font-weight: 600; }
.boleto-address label, .payment-instructions label { display: grid; gap: 5px; font-size: 13px; }
.boleto-address input, .payment-instructions input { width: 100%; min-width: 0; padding: 9px; border: 1px solid #ccc; border-radius: 6px; }
.address-hint { grid-column: 1 / -1; margin: 0; color: #555; font-size: 13px; }
.payment-instructions { display: grid; gap: 12px; margin: 20px 0; padding: 16px; border: 1px solid #ddd; border-radius: 8px; overflow-wrap: anywhere; }
.payment-instructions img { width: min(100%, 260px); margin: 0 auto; }
.payment-instructions a { color: #222; text-decoration: underline; }
.payment-instructions button { padding: 10px; border: 0; border-radius: 6px; cursor: pointer; }
@media (max-width: 520px) { .boleto-address { grid-template-columns: 1fr; } }
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
.success { background: #f2fff5; }
.pending { background: #fff9e8; }
.failure { background: #fff0f0; }
.payment-result button, .finalize-btn {
  margin: 12px 8px 0 0;
  padding: 12px 20px;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  background: #1d1d1d;
  color: white;
}
.secondary-btn { background: #555 !important; }
.finalize-btn:disabled { opacity: .7; cursor: wait; }
.auth-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(0 0 0 / 45%);
}
.auth-modal {
  width: min(100%, 440px);
  padding: 28px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 16px 48px rgb(0 0 0 / 18%);
}
.auth-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; }
.auth-btn {
  flex: 1;
  padding: 12px 16px;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
.btn-primary { background: #1d1d1d; color: white; }
.btn-secondary { background: #eee; color: #222; }
@media (max-width: 800px) {
  .checkout-content { grid-template-columns: 1fr; }
  .checkout-page { padding: 24px 16px 50px; }
}
</style>
