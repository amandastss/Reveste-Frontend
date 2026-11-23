
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/config'
import { formatCurrencyBRL } from '@/utils/currency'

interface ItemPedido {
  id: number
  nome: string
  preco: number
  quantidade: number
  imagem_url?: string
  tamanho?: string
  cor?: string
  subtotal?: number
}

interface Pedido {
  id: number
  status: string
  status_entrega?: string
  total: number
  itens: ItemPedido[]
  criado_em?: string
}

const router = useRouter()
const pedidos = ref<Pedido[]>([])
const carregando = ref(true)
const erro = ref('')

function listaPedidos(data: unknown): Pedido[] {
  if (Array.isArray(data)) {
    return data as Pedido[]
  }

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
    erro.value =
      'Não foi possível carregar seus pedidos. Entre novamente e tente atualizar a página.'
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

function statusEntrega(status?: string): string {
  if (!status) return ''

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
    <header class="header">
      <button
        class="back-button"
        type="button"
        aria-label="Voltar ao perfil"
        @click="router.push('/profile')"
      >
        <span class="material-symbols-outlined">arrow_back</span>
      </button>

      <div>
        <p class="eyebrow">Minha conta</p>
        <h1>Meus pedidos</h1>
      </div>
    </header>

    <p v-if="carregando" class="empty" role="status">
      Carregando seus pedidos...
    </p>

    <p v-else-if="erro" class="empty error">
      {{ erro }}
    </p>

    <p v-else-if="pedidos.length === 0" class="empty">
      Você ainda não possui pedidos.
    </p>

    <section v-else class="pedidos-lista">
      <button
        v-for="pedido in pedidos"
        :key="pedido.id"
        type="button"
        class="pedido-card"
        @click="abrirPedido(pedido.id)"
      >
        <img
          :src="
            pedido.itens?.[0]?.imagem_url ||
            'https://via.placeholder.com/80'
          "
          :alt="pedido.itens?.[0]?.nome || 'Produto do pedido'"
        />

        <div class="info">
          <span class="id">Pedido #{{ pedido.id }}</span>

          <h3>
            {{ pedido.itens?.[0]?.nome || 'Pedido' }}
          </h3>

          <p v-if="pedido.itens?.[0]">
            <span v-if="pedido.itens[0].cor">
              {{ pedido.itens[0].cor }}
            </span>

            <span
              v-if="pedido.itens[0].cor && pedido.itens[0].tamanho"
            >
              |
            </span>

            <span v-if="pedido.itens[0].tamanho">
              Tamanho {{ pedido.itens[0].tamanho }}
            </span>
          </p>

          <p>
            {{ pedido.itens?.length || 0 }}
            {{ pedido.itens?.length === 1 ? 'item' : 'itens' }}
          </p>

          <strong>
            {{ formatCurrencyBRL(Number(pedido.total || 0)) }}
          </strong>

          <span
            v-if="pedido.status_entrega"
            class="delivery"
          >
            {{ statusEntrega(pedido.status_entrega) }}
          </span>
        </div>

        <span
          class="status"
          :class="pedido.status === 'PAGO' ? 'green' : 'neutral'"
        >
          {{ statusPagamento(pedido.status) }}
        </span>
      </button>
    </section>
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
  gap: 12px;
  padding: 18px 20px 14px;
  background: var(--surface-bg);
  border-bottom: 1px solid var(--border-color);
}

.back-button {
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 50%;
  background: var(--app-bg);
  color: var(--text-color);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.eyebrow {
  margin: 0 0 2px;
  color: var(--text-muted);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.header h1 {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
}

.empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
}

.error {
  color: #a32626;
}

.pedidos-lista {
  width: 100%;
}

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

.info {
  flex: 1;
  min-width: 0;
}

.id {
  color: var(--text-muted);
  font-size: 12px;
}

.info h3 {
  margin: 5px 0;
  font-size: 15px;
}

.info p {
  margin: 5px 0;
  color: var(--text-muted);
  font-size: 13px;
}

.info strong {
  display: block;
  margin-top: 8px;
}

.delivery {
  display: block;
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
}

.status {
  max-width: 125px;
  padding: 6px 9px;
  border-radius: 20px;
  font-size: 11px;
  text-align: center;
}

.green {
  background: #e0f4e4;
  color: #176b31;
}

.neutral {
  background: var(--surface-elevated);
  color: var(--text-color);
}

@media (max-width: 600px) {
  .pedido-card {
    flex-wrap: wrap;
  }

  .status {
    margin-left: 95px;
    max-width: none;
  }
}
</style>
