
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/config'
import { formatCurrencyBRL } from '@/utils/currency'

interface ItemPedido {
  id: number
  nome: string | null
  preco: string | number
  quantidade: number
  imagem_url: string | null
  tamanho: string | null
  cor: string | null
  subtotal: string | number
}

interface EnderecoEntrega {
  cep?: string
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
}

interface Pedido {
  id: number
  status: string
  status_entrega: string
  criado_em: string
  pago_em: string | null
  total: string | number
  endereco_entrega: EnderecoEntrega
  itens: ItemPedido[]
}

const route = useRoute()
const router = useRouter()

const pedido = ref<Pedido | null>(null)
const carregando = ref(true)
const erro = ref('')

const etapas = [
  { id: 'AGUARDANDO_PREPARACAO', label: 'Aguardando preparação' },
  { id: 'ENVIADO', label: 'Pedido enviado' },
  { id: 'EM_TRANSITO', label: 'Em trânsito' },
  { id: 'SAIU_PARA_ENTREGA', label: 'Saiu para entrega' },
  { id: 'ENTREGUE', label: 'Entregue' },
]

const etapaAtual = () =>
  etapas.findIndex((etapa) => etapa.id === pedido.value?.status_entrega)

function etapaConcluida(index: number): boolean {
  return etapaAtual() >= index && etapaAtual() >= 0
}

function statusPagamento(status: string): string {
  const labels: Record<string, string> = {
    PENDENTE: 'Pendente',
    AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
    PAGO: 'Pagamento aprovado',
    CANCELADO: 'Cancelado',
  }

  return labels[status] || status
}

async function carregarPedido(): Promise<void> {
  carregando.value = true
  erro.value = ''

  try {
    const id = Number(route.params.id)

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error('Número do pedido inválido.')
    }

    const response = await api.get(`/pedidos/${id}/`)
    pedido.value = response.data as Pedido
  } catch (error) {
    console.error('Erro ao carregar pedido:', error)
    erro.value =
      'Não foi possível carregar este pedido. Verifique se ele pertence à sua conta.'
  } finally {
    carregando.value = false
  }
}

onMounted(carregarPedido)
</script>

<template>
  <main class="detalhe-page">
    <header class="top">
      <button type="button" aria-label="Voltar" @click="router.back()">
        ←
      </button>
      <h2>MEU PEDIDO</h2>
    </header>

    <p v-if="carregando" class="message" role="status">
      Carregando pedido...
    </p>

    <p v-else-if="erro" class="message error">
      {{ erro }}
    </p>

    <template v-else-if="pedido">
      <section class="status-card">
        <h3>{{ statusPagamento(pedido.status) }}</h3>

        <p>Pedido #{{ pedido.id }}</p>

        <p v-if="pedido.pago_em">
          Pagamento confirmado em
          {{ new Date(pedido.pago_em).toLocaleString('pt-BR') }}
        </p>

        <p>
          Entrega: {{ pedido.status_entrega.replaceAll('_', ' ') }}
        </p>
      </section>

      <section v-if="pedido.status === 'PAGO'" class="timeline">
        <h3>Acompanhamento da entrega</h3>

        <p v-if="pedido.status_entrega === 'NAO_INICIADA'">
          O pagamento foi aprovado. A preparação da peça ainda não foi iniciada.
        </p>

        <div
          v-for="(etapa, index) in etapas"
          :key="etapa.id"
          class="timeline-item"
        >
          <span
            class="dot"
            :class="{ active: etapaConcluida(index) }"
          ></span>

          <strong :class="{ activeText: etapaConcluida(index) }">
            {{ etapa.label }}
          </strong>
        </div>
      </section>

      <section class="address-card">
        <h3>Endereço de entrega</h3>

        <p v-if="pedido.endereco_entrega?.rua">
          {{ pedido.endereco_entrega.rua }},
          {{ pedido.endereco_entrega.numero }}

          <span v-if="pedido.endereco_entrega.complemento">
            - {{ pedido.endereco_entrega.complemento }}
          </span>
        </p>

        <p v-if="pedido.endereco_entrega?.bairro">
          {{ pedido.endereco_entrega.bairro }}
        </p>

        <p v-if="pedido.endereco_entrega?.cidade">
          {{ pedido.endereco_entrega.cidade }} -
          {{ pedido.endereco_entrega.estado }}
        </p>

        <p v-if="pedido.endereco_entrega?.cep">
          CEP: {{ pedido.endereco_entrega.cep }}
        </p>

        <p v-if="!pedido.endereco_entrega?.rua">
          Endereço não registrado para este pedido.
        </p>
      </section>

      <section class="items">
        <h3>Produtos</h3>

        <article
          v-for="item in pedido.itens"
          :key="item.id"
          class="produto"
        >
          <img
            v-if="item.imagem_url"
            :src="item.imagem_url"
            :alt="item.nome || 'Produto'"
          />

          <div>
            <h4>{{ item.nome || 'Peça ReVeste' }}</h4>

            <p v-if="item.quantidade > 1">
              Quantidade: {{ item.quantidade }}
            </p>

            <p v-if="item.tamanho">
              Tamanho: {{ item.tamanho }}
            </p>

            <p v-if="item.cor">
              Cor: {{ item.cor }}
            </p>

            <strong>
              {{ formatCurrencyBRL(Number(item.subtotal ?? item.preco)) }}
            </strong>
          </div>
        </article>

        <div class="total">
          <span>Total do pedido</span>

          <strong>
            {{ formatCurrencyBRL(Number(pedido.total)) }}
          </strong>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.detalhe-page {
  min-height: 100vh;
  padding-bottom: 40px;
  background: var(--surface-elevated);
  font-family: 'Montserrat', sans-serif;
}

.top {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: var(--surface-bg);
}

.top h2 {
  margin: 0;
}

.top button {
  border: 0;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
}

.message {
  padding: 30px 20px;
  text-align: center;
}

.error {
  color: #a32626;
}

.status-card,
.timeline,
.address-card,
.items {
  margin: 20px;
  padding: 20px;
  border-radius: 14px;
  background: var(--surface-bg);
}

.status-card {
  background: #202020;
  color: white;
}

.status-card h3,
.timeline h3,
.address-card h3,
.items h3 {
  margin-top: 0;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}

.dot {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #ccc;
}

.dot.active {
  background: #5b9b69;
}

.activeText {
  color: #5b9b69;
}

.produto {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-color);
}

.produto img {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 8px;
  object-fit: cover;
  background: var(--surface-elevated);
}

.produto h4 {
  margin: 0 0 8px;
}

.produto p {
  margin: 4px 0;
  color: var(--text-muted);
  font-size: 14px;
}

.produto strong {
  display: block;
  margin-top: 8px;
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 18px;
  margin-top: 12px;
  font-size: 16px;
}

.total strong {
  font-size: 18px;
}
</style>
