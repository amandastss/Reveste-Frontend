<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/config'
import { formatCurrencyBRL } from '@/utils/currency'

interface PedidoItem {
  id: number
  nome: string | null
  preco: string | number
  quantidade: number
  imagem_url: string | null
  tamanho: string | null
  cor: string | null
}

interface Pedido {
  id: number
  status: string
  status_entrega: string
  criado_em: string
  total: string | number
  itens: PedidoItem[]
}

const router = useRouter()
const pedidos = ref<Pedido[]>([])
const carregando = ref(true)
const erro = ref('')

function listaPedidos(data: unknown): Pedido[] {
  if (Array.isArray(data)) return data as Pedido[]
  if (data && typeof data === 'object' && 'results' in data) {
    const results = (data as { results?: unknown }).results
    return Array.isArray(results) ? results as Pedido[] : []
  }
  return []
}

async function loadPedidos(): Promise<void> {
  carregando.value = true
  erro.value = ''
  try {
    const response = await api.get('/pedidos/')
    pedidos.value = listaPedidos(response.data)
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error)
    erro.value = 'Não foi possível carregar seus pedidos. Entre novamente e tente atualizar a página.'
  } finally {
    carregando.value = false
  }
}

function abrirPedido(id: number): void {
  void router.push(`/pedido/${id}`)
}

function statusPagamento(status: string): string {
  const labels: Record<string, string> = {
    PENDENTE: 'Aguardando pagamento',
    AGUARDANDO_PAGAMENTO: 'Pagamento em processamento',
    PAGO: 'Pagamento aprovado',
    CANCELADO: 'Pedido cancelado',
  }
  return labels[status] || status
}

function statusEntrega(status: string): string {
  const labels: Record<string, string> = {
    NAO_INICIADA: 'Entrega ainda não iniciada',
    AGUARDANDO_PREPARACAO: 'Aguardando preparação',
    ENVIADO: 'Pedido enviado',
    EM_TRANSITO: 'Em trânsito',
    SAIU_PARA_ENTREGA: 'Saiu para entrega',
    ENTREGUE: 'Entregue',
  }
  return labels[status] || status
}
onMounted(loadPedidos)
</script>

<template>
  <div class="pedidos-page">
    <div class="header">
      <button class="back" type="button" @click="router.back()">←</button>
      <h2>MEUS PEDIDOS</h2>
    </div>

    <p v-if="carregando" class="empty" role="status">Carregando seus pedidos...</p>
    <p v-else-if="erro" class="empty error">{{ erro }}</p>
    <p v-else-if="pedidos.length === 0" class="empty">Você ainda não possui pedidos.</p>

    <button
      v-for="pedido in pedidos"
      :key="pedido.id"
      type="button"
      class="pedido-card"
      @click="abrirPedido(pedido.id)"
    >
      <img
        :src="pedido.itens?.[0]?.imagem_url || 'https://via.placeholder.com/80'"
        :alt="pedido.itens?.[0]?.nome || 'Produto do pedido'"
      />
      <div class="info">
        <span class="id">Pedido #{{ pedido.id }}</span>
        <h3>{{ pedido.itens?.[0]?.nome || 'Pedido ReVeste' }}</h3>
        <p>{{ pedido.itens?.length || 0 }} peça(s)</p>
        <strong>{{ formatCurrencyBRL(Number(pedido.total) || 0) }}</strong>
        <p class="delivery">{{ statusEntrega(pedido.status_entrega) }}</p>
      </div>
      <span class="status" :class="pedido.status === 'PAGO' ? 'green' : 'neutral'">
        {{ statusPagamento(pedido.status) }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.pedidos-page {
  min-height: 100vh;
  background: var(--surface-elevated);
  font-family: 'Montserrat', sans-serif;
}
.header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: var(--surface-bg);
}
.header h2 { margin: 0; }
.back {
  border: 0;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
}
.empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
}
.error { color: #a32626; }
.pedido-card {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 16px;
  border: 0;
  border-bottom: 1px solid var(--border-color);
  background: var(--surface-bg);
  text-align: left;
  cursor: pointer;
}
.pedido-card img {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
}
.info { flex: 1; min-width: 0; }
.id { color: var(--text-muted); font-size: 12px; }
.info h3 { margin: 5px 0; font-size: 15px; }
.info p { margin: 5px 0; color: var(--text-muted); font-size: 13px; }
.info strong { display: block; margin-top: 8px; }
.delivery { font-weight: 600; }
.status {
  max-width: 125px;
  padding: 6px 9px;
  border-radius: 20px;
  font-size: 11px;
  text-align: center;
}
.green { background: #e0f4e4; color: #176b31; }
.neutral { background: var(--surface-elevated); color: var(--text-color); }
@media (max-width: 600px) {
  .pedido-card { flex-wrap: wrap; }
  .status { margin-left: 95px; max-width: none; }
}
</style>
