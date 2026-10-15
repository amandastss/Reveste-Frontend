// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CheckoutView from './CheckoutView.vue'

const mocks = vi.hoisted(() => ({
  cart: { items: [] as Array<Record<string, unknown>>, loadCart: vi.fn() },
  router: { push: vi.fn(), replace: vi.fn() },
  finalizarCarrinho: vi.fn(),
  criarCheckout: vi.fn(),
  processarPagamento: vi.fn(),
  consultarPedido: vi.fn(),
  loadMercadoPago: vi.fn(),
  brickCreate: vi.fn(),
}))

vi.mock('vue-router', () => ({ useRouter: () => mocks.router }))
vi.mock('@/stores/cart', () => ({ useCartStore: () => mocks.cart }))
vi.mock('@mercadopago/sdk-js', () => ({ loadMercadoPago: mocks.loadMercadoPago }))
vi.mock('@/api/pagamentosApi', () => ({
  finalizarCarrinho: mocks.finalizarCarrinho,
  criarCheckout: mocks.criarCheckout,
  processarPagamento: mocks.processarPagamento,
  consultarPedido: mocks.consultarPedido,
  isPedidoPago: (status?: string) => status?.toUpperCase() === 'PAGO',
  isPedidoCancelado: (status?: string) => status?.toUpperCase() === 'CANCELADO',
  PaymentApiError: class PaymentApiError extends Error {},
}))

type BrickSettings = {
  initialization: { amount: number; preferenceId?: string }
  callbacks: {
    onReady: () => void
    onSubmit: (data: {
      formData: { token: string; installments: number; payment_method_id: string }
    }) => Promise<void>
  }
}

function latestBrickSettings(): BrickSettings {
  return mocks.brickCreate.mock.calls.at(-1)?.[2] as BrickSettings
}

function mountCheckout() {
  return mount(CheckoutView, { attachTo: document.body })
}

async function initializeBrick() {
  const wrapper = mountCheckout()
  await flushPromises()
  latestBrickSettings().callbacks.onReady()
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.cart.items = [{ id: 71, name: 'Blusa', image: '', size: 'M', price: 0.01, quantity: 1 }]
  mocks.cart.loadCart.mockResolvedValue(undefined)
  mocks.finalizarCarrinho.mockResolvedValue({ pedido_id: 29, status: 'PENDENTE' })
  mocks.criarCheckout.mockResolvedValue({
    pedido_id: 29,
    amount: '89.90',
    payer_email: 'buyer@example.com',
    preference_id: 'do-not-use',
  })
  mocks.processarPagamento.mockResolvedValue({
    pedido_id: 29,
    id: 'mp-10',
    status: 'approved',
    status_detail: 'accredited',
  })
  mocks.consultarPedido.mockResolvedValue({ id: 29, status: 'PAGO' })
  mocks.loadMercadoPago.mockResolvedValue(undefined)
  mocks.brickCreate.mockResolvedValue({ unmount: vi.fn().mockResolvedValue(undefined) })
  window.MercadoPago = class {
    bricks() {
      return { create: mocks.brickCreate }
    }
  }
})

describe('CheckoutView / Payment Brick', () => {
  it('prepara o pedido no backend e inicializa o Brick com o total oficial', async () => {
    const wrapper = await initializeBrick()
    expect(mocks.finalizarCarrinho).toHaveBeenCalledOnce()
    expect(mocks.criarCheckout).toHaveBeenCalledOnce()
    expect(latestBrickSettings().initialization.amount).toBe(89.9)
    expect(latestBrickSettings().initialization.preferenceId).toBeUndefined()
    expect(wrapper.text().replace(/\s/g, '')).toContain('R$89,90')
    expect(wrapper.text()).not.toContain('0,01')
    wrapper.unmount()
  })

  it('mostra erro recuperável ao falhar a preparação do pedido', async () => {
    mocks.finalizarCarrinho.mockRejectedValue(new Error('falha interna'))
    const wrapper = mountCheckout()
    await flushPromises()
    expect(wrapper.text()).toContain('Não foi possível preparar seu checkout')
    expect(wrapper.text()).not.toContain('falha interna')
    wrapper.unmount()
  })

  it('permite repetir a carga do SDK sem preparar outro pedido', async () => {
    mocks.loadMercadoPago
      .mockRejectedValueOnce(new Error('script error'))
      .mockResolvedValue(undefined)
    const wrapper = mountCheckout()
    await flushPromises()
    expect(wrapper.text()).toContain('TENTAR NOVAMENTE')
    await wrapper.get('.retry-button').trigger('click')
    await flushPromises()
    expect(mocks.finalizarCarrinho).toHaveBeenCalledOnce()
    expect(mocks.criarCheckout).toHaveBeenCalledOnce()
    expect(mocks.brickCreate).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('permite repetir uma falha de inicialização sem repetir o checkout', async () => {
    mocks.brickCreate
      .mockRejectedValueOnce(new Error('brick init'))
      .mockResolvedValue({ unmount: vi.fn().mockResolvedValue(undefined) })
    const wrapper = mountCheckout()
    await flushPromises()
    await wrapper.get('.retry-button').trigger('click')
    await flushPromises()
    expect(mocks.criarCheckout).toHaveBeenCalledOnce()
    expect(mocks.brickCreate).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('envia os dados do Brick junto do pedido correto e só confirma após consultar o backend', async () => {
    const wrapper = await initializeBrick()
    const formData = { token: 'brick-token', installments: 2, payment_method_id: 'visa' }
    await latestBrickSettings().callbacks.onSubmit({ formData })
    expect(mocks.processarPagamento).toHaveBeenCalledWith(29, formData)
    expect(mocks.consultarPedido).toHaveBeenCalledWith(29)
    expect(wrapper.text()).toContain('Pagamento aprovado')
    expect(mocks.cart.loadCart).toHaveBeenCalledTimes(3)
    wrapper.unmount()
  })

  it('não considera approved do gateway suficiente quando o pedido continua aguardando', async () => {
    mocks.consultarPedido.mockResolvedValue({ id: 29, status: 'AGUARDANDO_PAGAMENTO' })
    const wrapper = await initializeBrick()
    await latestBrickSettings().callbacks.onSubmit({
      formData: { token: 't', installments: 1, payment_method_id: 'visa' },
    })
    expect(wrapper.text()).toContain('Pagamento em processamento')
    expect(wrapper.text()).not.toContain('Pagamento aprovado')
    wrapper.unmount()
  })

  it('diferencia uma recusa confirmada pelo estado do pedido', async () => {
    mocks.processarPagamento.mockResolvedValue({ pedido_id: 29, id: 'mp-10', status: 'rejected' })
    mocks.consultarPedido.mockResolvedValue({ id: 29, status: 'CANCELADO' })
    const wrapper = await initializeBrick()
    await latestBrickSettings().callbacks.onSubmit({
      formData: { token: 't', installments: 1, payment_method_id: 'visa' },
    })
    expect(wrapper.text()).toContain('Pagamento não concluído')
    wrapper.unmount()
  })

  it('não duplica submissões e oferece reconsulta após erro ambíguo', async () => {
    let rejectPayment: (error: Error) => void = () => undefined
    mocks.processarPagamento.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectPayment = reject
        }),
    )
    const wrapper = await initializeBrick()
    const submit = latestBrickSettings().callbacks.onSubmit
    const formData = { token: 't', installments: 1, payment_method_id: 'visa' }
    const first = submit({ formData })
    const second = submit({ formData })
    expect(mocks.processarPagamento).toHaveBeenCalledOnce()
    rejectPayment(new Error('timeout'))
    await Promise.all([first, second])
    expect(wrapper.text()).toContain('Resultado aguardando confirmação')
    mocks.consultarPedido.mockResolvedValue({ id: 29, status: 'AGUARDANDO_PAGAMENTO' })
    await wrapper.get('.payment-result button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Pagamento em processamento')
    expect(mocks.processarPagamento).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('desmonta a instância ao sair da tela', async () => {
    const unmountBrick = vi.fn().mockResolvedValue(undefined)
    mocks.brickCreate.mockResolvedValue({ unmount: unmountBrick })
    const wrapper = await initializeBrick()
    wrapper.unmount()
    await flushPromises()
    expect(unmountBrick).toHaveBeenCalledOnce()
  })
})
