import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './config'
import {
  consultarPedido,
  criarCheckout,
  finalizarCarrinho,
  getCarrinho,
  PaymentApiError,
  processarPagamento,
} from './pagamentosApi'

vi.mock('./config', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

const mockedApi = vi.mocked(api)

function axiosFailure(status?: number, data?: unknown, code?: string) {
  return Object.assign(new Error('request failed'), {
    isAxiosError: true,
    code,
    response: status === undefined ? undefined : { status, data },
  })
}

beforeEach(() => vi.clearAllMocks())

describe('pagamentosApi', () => {
  it('lê carrinho e prepara pedido usando as rotas acordadas', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { pedido_id: 8, status: 'PENDENTE', itens: [], total: '12.00' },
    } as never)
    mockedApi.post.mockResolvedValueOnce({
      data: { pedido_id: 8, status: 'PENDENTE', detail: 'Pedido preparado para pagamento.' },
    } as never)

    const cart = await getCarrinho()
    const prepared = await finalizarCarrinho()

    expect(cart.total).toBe('12.00')
    expect(prepared.pedido_id).toBe(8)
    expect(mockedApi.get).toHaveBeenCalledWith('/carrinho/')
    expect(mockedApi.post).toHaveBeenCalledWith('/carrinho/finalizar/')
  })

  it('interpreta amount e o identificador retornados pelo backend', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {
        pedido_id: 8,
        amount: 87.5,
        preference_id: 'pref-x',
        init_point: 'https://example.invalid',
      },
    } as never)
    const checkout = await criarCheckout()
    expect(checkout).toMatchObject({ pedido_id: 8, amount: 87.5 })
  })

  it('envia o pedido e os campos do Payment Brick sem confiar em preço do cliente', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { pedido_id: 8, id: 98, status: 'pending', status_detail: 'pending_waiting_payment' },
    } as never)
    const data = {
      token: 'sdk-token',
      installments: 1,
      payment_method_id: 'visa',
      issuer_id: '123',
    }
    await processarPagamento(8, data)
    expect(mockedApi.post).toHaveBeenCalledWith('/pagamentos/processar/', { ...data, pedido_id: 8 })
    expect(JSON.stringify(mockedApi.post.mock.calls[0]?.[1])).not.toContain('transaction_amount')
  })

  it('consulta somente o endpoint autenticado do pedido solicitado', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { id: 8, status: 'PAGO' } } as never)
    await expect(consultarPedido(8)).resolves.toMatchObject({ id: 8, status: 'PAGO' })
    expect(mockedApi.get).toHaveBeenCalledWith('/pedidos/8/')
  })

  it('aceita JSON serializado e rejeita resposta não JSON', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: '{"pedido_id":8,"status":"PENDENTE","itens":[],"total":0}',
    } as never)
    await expect(getCarrinho()).resolves.toMatchObject({ pedido_id: 8 })
    mockedApi.get.mockResolvedValueOnce({ data: '<html>gateway unavailable</html>' } as never)
    await expect(getCarrinho()).rejects.toBeInstanceOf(PaymentApiError)
  })

  it('converte erros HTTP em mensagem amigável sem expor detalhes internos', async () => {
    mockedApi.post.mockRejectedValueOnce(
      axiosFailure(502, { detail: 'traceback e credencial interna' }),
    )
    await expect(criarCheckout()).rejects.toMatchObject({
      message:
        'Não foi possível comunicar com o servidor. Consulte o pedido antes de tentar novamente.',
      statusCode: 502,
      communicationFailure: false,
    })
    mockedApi.post.mockRejectedValueOnce(axiosFailure(401, { detail: 'not authenticated' }))
    await expect(finalizarCarrinho()).rejects.toMatchObject({
      message: 'Sua sessão expirou. Entre novamente para continuar.',
    })
  })

  it('marca timeout/rede como resultado ambíguo, sem ocultá-lo como recusa', async () => {
    mockedApi.post.mockRejectedValueOnce(axiosFailure(undefined, undefined, 'ECONNABORTED'))
    await expect(
      processarPagamento(8, { token: 't', installments: 1, payment_method_id: 'visa' }),
    ).rejects.toMatchObject({
      communicationFailure: true,
      statusCode: undefined,
    })
  })
})
