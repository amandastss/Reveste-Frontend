<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { AxiosResponse } from 'axios'
import api, { API_BASE, getStoredToken } from '@/api/config'
import { canUserAccessQuestionReply, extractSellerKeysFromProduct } from '@/utils/questionAccess'

interface Produto {
  id: number
  nome?: string
  name?: string
  preco?: number | string
  imagem_url?: string | null
  imagem?: string | null
  [key: string]: unknown
}

interface PaginatedProdutos {
  results?: Produto[]
  next?: string | null
}

const router = useRouter()
const produtos = ref<Produto[]>([])
const carregando = ref(true)
const erro = ref('')

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}') as {
      id?: string | number
      email?: string
    }
  } catch {
    return {}
  }
}

const getCurrentIdentity = () => {
  const user = getCurrentUser()
  return {
    id: localStorage.getItem('user_id') || String(user.id || ''),
    email: localStorage.getItem('user_email') || user.email || '',
  }
}

const getLocallyPublishedProductIds = (): Set<string> => {
  const { id, email } = getCurrentIdentity()
  const currentUserKeys = new Set(
    [id, email].map((value) => value.trim().toLowerCase()).filter(Boolean),
  )

  try {
    const sellerProducts = JSON.parse(
      localStorage.getItem('reveste_seller_products_v1') || '{}',
    ) as Record<string, string[]>
    const productIds = Object.entries(sellerProducts)
      .filter(([sellerKey]) => currentUserKeys.has(sellerKey.trim().toLowerCase()))
      .flatMap(([, ids]) => ids.map(String))

    return new Set(productIds)
  } catch (error) {
    console.error('Não foi possível ler os produtos publicados neste dispositivo:', error)
    return new Set()
  }
}

const pertenceAoUsuario = (produto: Produto, localIds: Set<string>) => {
  const { id, email } = getCurrentIdentity()
  const productSellerKeys = extractSellerKeysFromProduct(produto)

  if (productSellerKeys.length) {
    return canUserAccessQuestionReply({
      currentUserId: id,
      currentUserEmail: email,
      productSellerKeys,
    })
  }

  return localIds.has(String(produto.id))
}

const formatMediaUrl = (url?: string | null) => {
  if (!url) return '/default.png'
  return url.startsWith('http') ? url : `${API_BASE}${url}`
}

const formatPrice = (value?: number | string) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const carregarProdutos = async () => {
  if (!getStoredToken()) {
    await router.replace('/auth/email')
    return
  }

  carregando.value = true
  erro.value = ''

  try {
    const localIds = getLocallyPublishedProductIds()
    const produtosApi: Produto[] = []
    let nextUrl: string | null = `${API_BASE}/api/produtos/`
    let firstPage = true

    while (nextUrl) {
      const response: AxiosResponse<PaginatedProdutos | Produto[]> = await api.get(nextUrl, {
        ...(firstPage ? { params: { page_size: 1000 } } : {}),
      })
      const payload: PaginatedProdutos | Produto[] = response.data
      const page = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.results)
          ? payload.results
          : []

      produtosApi.push(...page)

      const next: string | null = Array.isArray(payload) ? null : payload.next || null
      nextUrl = next ? new URL(next, nextUrl).toString() : null
      firstPage = false
    }

    produtos.value = produtosApi.filter((produto) => pertenceAoUsuario(produto, localIds))
  } catch (error) {
    console.error('Erro ao carregar produtos publicados:', error)
    erro.value = 'Não foi possível carregar seus produtos. Tente novamente.'
  } finally {
    carregando.value = false
  }
}

const abrirProduto = (id: number) => {
  router.push({ name: 'produto-detalhe', params: { id } })
}

onMounted(() => {
  void carregarProdutos()
})
</script>

<template>
  <div class="my-products-page">
    <header class="page-header">
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
        <h1>Meus produtos</h1>
      </div>
    </header>

    <p v-if="carregando" class="page-status" role="status">Carregando seus produtos...</p>

    <div v-else-if="erro" class="empty-state">
      <p>{{ erro }}</p>
      <button class="primary-button" type="button" @click="carregarProdutos">Tentar novamente</button>
    </div>

    <div v-else-if="!produtos.length" class="empty-state">
      <span class="material-symbols-outlined empty-icon">checkroom</span>
      <h2>Você ainda não publicou produtos</h2>
      <p>Quando anunciar uma peça, ela vai aparecer aqui.</p>
      <button class="primary-button" type="button" @click="router.push('/sell')">
        Publicar um produto
      </button>
    </div>

    <div v-else class="products-grid">
      <button
        v-for="produto in produtos"
        :key="produto.id"
        class="product-card"
        type="button"
        @click="abrirProduto(produto.id)"
      >
        <img
          :src="formatMediaUrl(produto.imagem_url || produto.imagem)"
          :alt="produto.nome || produto.name || 'Produto'"
        />
        <span class="product-info">
          <strong>{{ produto.nome || produto.name || 'Produto sem nome' }}</strong>
          <span>{{ formatPrice(produto.preco) }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.my-products-page {
  min-height: 100vh;
  padding-bottom: 32px;
  background: var(--app-bg);
  color: var(--text-color);
  font-family: 'Montserrat', sans-serif;
}

.page-header {
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

.page-header h1 {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
}

.page-status {
  padding: 32px 20px;
  color: var(--text-muted);
  text-align: center;
}

.empty-state {
  min-height: 58vh;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
  color: var(--text-muted);
  font-size: 48px;
}

.empty-state h2 {
  margin: 0 0 8px;
  font-size: 1.35rem;
}

.empty-state p {
  max-width: 290px;
  margin: 0 0 20px;
  color: var(--text-muted);
}

.primary-button {
  min-height: 46px;
  padding: 12px 20px;
  border: 0;
  border-radius: 999px;
  background: var(--surface-inverse);
  color: var(--primary-contrast);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 18px 16px 24px;
}

.product-card {
  min-width: 0;
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--surface-bg);
  color: var(--text-color);
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.product-card img {
  display: block;
  width: 100%;
  height: 190px;
  object-fit: cover;
  background: var(--app-bg);
  transition: transform 0.2s ease;
}

.product-card:focus-visible {
  outline: 2px solid var(--text-color);
  outline-offset: 3px;
}

@media (hover: hover) {
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  }

  .product-card:hover img {
    transform: scale(1.03);
  }
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
}

.product-info strong {
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-info > span {
  font-size: 14px;
  font-weight: 700;
}

@media (min-width: 600px) {
  .products-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    padding: 24px;
  }

  .product-card img {
    height: 220px;
  }
}

@media (min-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
    padding: 28px 32px;
  }
}
</style>
