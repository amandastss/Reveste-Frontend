<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import api, { API_BASE, getStoredToken } from '@/api/config'
import { useCartStore } from '@/stores/cart'
import { hasCartAuthToken, getCartAuthRedirectPath } from '@/utils/cartAuth'
import { canUserAccessQuestionReply, extractSellerKeysFromProduct } from '@/utils/questionAccess'
import { formatCurrencyBRL } from '@/utils/currency'
import {
  isFavoriteProduct,
  toggleFavorite as toggleFavoriteProduct,
  type FavoriteProduct,
} from '@/utils/favorites'

interface Produto {
  id: number
  nome: string
  descricao: string
  preco: number
  marca: string
  condicao?: string
  imagem_url?: string | null
  categoria?: number | string | { id?: number; nome?: string; name?: string; title?: string } | null
}

interface Categoria {
  id: number
  nome?: string
  name?: string
  title?: string
}

interface ProdutoEditDraft {
  nome: string
  descricao: string
  preco: string
  marca: string
  condicao: string
  categoria: string
}

const route = useRoute(),
  router = useRouter(),
  cartStore = useCartStore(),
  productId = Number(route.params.id || 0)
const productData = ref<Produto | null>(null),
  categoriaNome = ref(''),
  loading = ref(true),
  error = ref(''),
  showAddToCartConfirm = ref(false),
  showLoginRequiredModal = ref(false),
  isAddingToCart = ref(false),
  addToCartError = ref(''),
  addToCartSuccess = ref(false),
  isFavorite = ref(false),
  isAnimating = ref(false),
  showEditProduct = ref(false),
  isSavingProduct = ref(false),
  isDeletingProduct = ref(false),
  productActionError = ref(''),
  categorias = ref<Categoria[]>([]),
  replacementImage = ref<File | null>(null)
const editDraft = ref<ProdutoEditDraft>({
  nome: '',
  descricao: '',
  preco: '',
  marca: '',
  condicao: '',
  categoria: '',
})
const isProductOwner = computed(() => {
  if (!productData.value || !getStoredToken()) return false

  let storedUser: { id?: string | number; email?: string } = {}
  try {
    storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    storedUser = {}
  }

  const currentUserId = localStorage.getItem('user_id') || String(storedUser.id || '')
  const currentUserEmail = localStorage.getItem('user_email') || storedUser.email || ''
  let locallyKnownSellerKeys: string[] = []

  try {
    const sellersByProduct = JSON.parse(
      localStorage.getItem('reveste_product_sellers_v1') || '{}',
    ) as Record<string, string[]>
    locallyKnownSellerKeys = (sellersByProduct[String(productId)] || []).map(String)
  } catch (error) {
    console.error('Não foi possível verificar os dados locais do vendedor:', error)
  }

  const serverSellerKeys = extractSellerKeysFromProduct(productData.value)
  return canUserAccessQuestionReply({
    currentUserId,
    currentUserEmail,
    productSellerKeys: serverSellerKeys.length ? serverSellerKeys : locallyKnownSellerKeys,
  })
})
const mainImage = computed(() =>
  !productData.value?.imagem_url
    ? 'https://via.placeholder.com/600x600?text=Sem+imagem'
    : productData.value.imagem_url.startsWith('http')
      ? productData.value.imagem_url
      : `${API_BASE}/api${productData.value.imagem_url}`,
)
const goBack = () => router.back(),
  openQuestions = () => router.push({ name: 'produto-perguntas', params: { id: productId } })
const isDesktopHoverZoomEnabled = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches

const handleImageEnter = (event: MouseEvent) => {
  if (!isDesktopHoverZoomEnabled()) return

  const wrapper = event.currentTarget as HTMLElement
  const image = wrapper.querySelector('.main-product-image') as HTMLImageElement | null
  if (!image) return

  image.style.transition = 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)'
  image.style.transform = 'translate3d(0px, 0px, 0px) scale(1.08)'
}
const handleImageMove = (event: MouseEvent) => {
  if (!isDesktopHoverZoomEnabled()) return

  const wrapper = event.currentTarget as HTMLElement
  const image = wrapper.querySelector('.main-product-image') as HTMLImageElement | null
  if (!image) return

  const rect = wrapper.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height
  const translateX = (0.5 - x) * 170
  const translateY = (0.5 - y) * 140

  image.style.transition = 'transform 100ms ease-out'
  image.style.transform = `translate3d(${translateX}px, ${translateY}px, 0px) scale(1.85)`
}
const resetImageZoom = (event: MouseEvent) => {
  if (!isDesktopHoverZoomEnabled()) return

  const wrapper = event.currentTarget as HTMLElement
  const image = wrapper.querySelector('.main-product-image') as HTMLImageElement | null
  if (!image) return

  image.style.transition = 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)'
  image.style.transform = 'translate3d(0px, 0px, 0px) scale(1)'
}
const closeAddToCartConfirm = () => {
  showAddToCartConfirm.value = false
  addToCartError.value = ''
}
const loadFavoriteState = () => {
  isFavorite.value = isFavoriteProduct(productId)
}
const toggleFavorite = () => {
  if (!productData.value) return
  const favoritePayload: FavoriteProduct = {
    id: productData.value.id,
    nome: productData.value.nome,
    preco: Number(productData.value.preco || 0),
    imagem_url: productData.value.imagem_url,
    categoria: productData.value.categoria,
  }
  isFavorite.value = toggleFavoriteProduct(favoritePayload)
  isAnimating.value = true
  setTimeout(() => (isAnimating.value = false), 600)
}
const handleAddToCartSuccess = () => {
  addToCartSuccess.value = true
  setTimeout(() => (addToCartSuccess.value = false), 3000)
}
const closeLoginRequiredModal = () => {
  showLoginRequiredModal.value = false
}
const redirectToAuth = (mode: 'login' | 'register') => {
  localStorage.setItem('isLogin', mode === 'login' ? 'true' : 'false')
  closeLoginRequiredModal()
  router.push(getCartAuthRedirectPath())
}
const resolveCategoriaNome = async (produto: Produto) => {
  const categoria = produto.categoria
  if (typeof categoria === 'object' && categoria) {
    categoriaNome.value = categoria.nome || categoria.name || categoria.title || ''
    return
  }
  const categoriaId = Number(categoria)
  if (!Number.isFinite(categoriaId) || categoriaId <= 0) {
    categoriaNome.value = ''
    return
  }
  try {
    const res = await axios.get(`${API_BASE}/api/categorias/`)
    const categorias = Array.isArray(res.data?.results)
      ? res.data.results
      : Array.isArray(res.data)
        ? res.data
        : []
    const item = categorias.find(
      (x: { id?: number; nome?: string; name?: string; title?: string }) =>
        Number(x.id) === categoriaId,
    )
    categoriaNome.value = item?.nome || item?.name || item?.title || ''
  } catch (err) {
    console.error('Erro ao carregar categoria do produto:', err)
    categoriaNome.value = ''
  }
}
const fetchProduct = async () => {
  loading.value = true
  error.value = ''
  categoriaNome.value = ''
  try {
    const res = await axios.get(`${API_BASE}/api/produtos/${productId}/`)
    productData.value = res.data
    await resolveCategoriaNome(res.data)
  } catch (err) {
    console.error(err)
    error.value = 'Erro ao carregar os dados do produto.'
  } finally {
    loading.value = false
  }
}
const openProductEditor = async () => {
  if (!isProductOwner.value || !productData.value) return

  const product = productData.value
  const categoryId =
    typeof product.categoria === 'object' && product.categoria
      ? product.categoria.id
      : product.categoria

  editDraft.value = {
    nome: product.nome || '',
    descricao: product.descricao || '',
    preco: String(product.preco ?? ''),
    marca: product.marca || '',
    condicao: product.condicao || '',
    categoria: String(categoryId ?? ''),
  }
  replacementImage.value = null
  productActionError.value = ''
  showEditProduct.value = true

  try {
    const response = await api.get('/categorias/')
    categorias.value = Array.isArray(response.data?.results)
      ? response.data.results
      : Array.isArray(response.data)
        ? response.data
        : []
  } catch (error) {
    console.error('Erro ao carregar categorias para edição:', error)
    productActionError.value = 'Não foi possível carregar as categorias. Tente novamente.'
  }
}
const saveProductChanges = async () => {
  if (!isProductOwner.value || !productData.value || isSavingProduct.value) return

  const price = Number(String(editDraft.value.preco).replace(',', '.'))
  if (!editDraft.value.nome.trim() || !editDraft.value.descricao.trim()) {
    productActionError.value = 'Informe o nome e a descrição do produto.'
    return
  }
  if (!Number.isFinite(price) || price <= 0) {
    productActionError.value = 'Informe um preço válido maior que zero.'
    return
  }
  if (!editDraft.value.categoria) {
    productActionError.value = 'Selecione uma categoria para o produto.'
    return
  }

  isSavingProduct.value = true
  productActionError.value = ''
  const productPayload = {
    nome: editDraft.value.nome.trim(),
    descricao: editDraft.value.descricao.trim(),
    preco: price.toFixed(2),
    marca: editDraft.value.marca.trim(),
    condicao: editDraft.value.condicao.trim(),
    categoria: editDraft.value.categoria,
  }

  let payload: FormData | typeof productPayload = productPayload
  if (replacementImage.value) {
    const formData = new FormData()
    Object.entries(productPayload).forEach(([key, value]) => formData.append(key, value))
    formData.append('imagem', replacementImage.value)
    payload = formData
  }

  try {
    await api.patch(`/produtos/${productData.value.id}/`, payload)
    showEditProduct.value = false
    await fetchProduct()
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    productActionError.value = getProductActionError(
      error,
      'Não foi possível atualizar o produto. Tente novamente.',
    )
  } finally {
    isSavingProduct.value = false
  }
}
const selectReplacementImage = (event: Event) => {
  const input = event.target as HTMLInputElement
  replacementImage.value = input.files?.[0] ?? null
}
const deleteProduct = async () => {
  if (!isProductOwner.value || !productData.value || isDeletingProduct.value) return

  if (!window.confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
    return
  }

  isDeletingProduct.value = true
  productActionError.value = ''
  try {
    await api.delete(`/produtos/${productData.value.id}/`)

    try {
      const sellerProducts = JSON.parse(
        localStorage.getItem('reveste_seller_products_v1') || '{}',
      ) as Record<string, string[]>
      Object.keys(sellerProducts).forEach((sellerKey) => {
        sellerProducts[sellerKey] = (sellerProducts[sellerKey] || []).filter(
          (id) => String(id) !== String(productData.value?.id),
        )
      })
      localStorage.setItem('reveste_seller_products_v1', JSON.stringify(sellerProducts))

      const productSellers = JSON.parse(
        localStorage.getItem('reveste_product_sellers_v1') || '{}',
      ) as Record<string, string[]>
      delete productSellers[String(productData.value.id)]
      localStorage.setItem('reveste_product_sellers_v1', JSON.stringify(productSellers))
    } catch (error) {
      console.error('Produto removido, mas não foi possível limpar os dados locais:', error)
    }

    await router.push('/')
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    productActionError.value = getProductActionError(
      error,
      'Não foi possível excluir o produto. Tente novamente.',
    )
  } finally {
    isDeletingProduct.value = false
  }
}
function getProductActionError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return 'Entre novamente para gerenciar este produto.'
    if (error.response?.status === 403) return 'Você não tem permissão para alterar este produto.'
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
  }

  return fallback
}
const confirmAddToCart = async () => {
  if (!productData.value) return
  if (!hasCartAuthToken()) {
    closeAddToCartConfirm()
    showLoginRequiredModal.value = true
    return
  }
  isAddingToCart.value = true
  addToCartError.value = ''
  try {
    await cartStore.addItem(productData.value.id)
    closeAddToCartConfirm()
    handleAddToCartSuccess()
  } catch (err) {
    addToCartError.value = err instanceof Error ? err.message : 'Erro ao adicionar ao carrinho'
  } finally {
    isAddingToCart.value = false
  }
}
const buyNow = async () => {
  if (!productData.value) return
  if (!hasCartAuthToken()) {
    showLoginRequiredModal.value = true
    return
  }
  isAddingToCart.value = true
  addToCartError.value = ''
  try {
    const produtoJaNoCarrinho = cartStore.items.some((item) => item.id === productData.value!.id)
    if (!produtoJaNoCarrinho) await cartStore.addItem(productData.value.id)
    await router.push('/checkout')
  } catch (error) {
    console.error('Erro ao iniciar compra:', error)
    addToCartError.value = 'Não foi possível iniciar a compra. Tente novamente.'
  } finally {
    isAddingToCart.value = false
  }
}
watch(
  () => route.params.id,
  () => loadFavoriteState(),
)
onMounted(() => {
  loadFavoriteState()
  fetchProduct()
})
</script>

<template>
  <div class="product-page-container">
    <header class="app-header">
      <div></div>
      <div class="header-actions"></div>
    </header>
    <Transition name="fade">
      <div v-if="addToCartSuccess" class="success-message">
        ✓ Adicionado ao carrinho!
      </div>
    </Transition>
    <main class="scrollable-content">
      <div class="image-wrapper" @mouseenter="handleImageEnter" @mousemove="handleImageMove"
        @mouseleave="resetImageZoom">
        <img :src="mainImage" class="main-product-image" /><button class="back-btn" @click="goBack" title="Voltar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg></button><button class="favorite-btn"
          :class="{ 'is-favorite': isFavorite, 'is-animating': isAnimating }" @click="toggleFavorite"
          title="Adicionar aos favoritos">
          <svg v-if="!isFavorite" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
            </path>
          </svg><svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
            </path>
          </svg>
        </button>
      </div>
      <div v-if="loading" class="loading-state">Carregando produto...</div>
      <div v-else-if="error" class="error-state">{{ error }}</div>
      <div v-else class="content">
        <h1 class="product-title">{{ productData?.nome }}</h1>
        <p class="product-price">{{ formatCurrencyBRL(productData?.preco) }}</p>
        <span class="category-badge">{{ categoriaNome || 'Sem categoria' }}</span>
        <div class="info-block">
          <h2>Descrição</h2>
          <p>{{ productData?.descricao }}</p>
        </div>
        <div class="info-row">
          <div>
            <h2>Marca</h2>
            <p>{{ productData?.marca }}</p>
          </div>
          <div>
            <h2>Condição</h2>
            <span class="badge-condition">{{ productData?.condicao || 'Não informado' }}</span>
          </div>
        </div>
        <div class="questions-card" @click="openQuestions">
          <span>Perguntas ao vendedor</span><span>→</span>
        </div>
        <div v-if="isProductOwner" class="manage-product-actions">
          <p>Este produto foi publicado por você.</p>
          <div class="manage-product-buttons">
            <button type="button" class="edit-product-btn" @click="openProductEditor">
              Alterar produto
            </button>
            <button
              type="button"
              class="delete-product-btn"
              :disabled="isDeletingProduct"
              @click="deleteProduct"
            >
              {{ isDeletingProduct ? 'Excluindo...' : 'Excluir produto' }}
            </button>
          </div>
          <p v-if="productActionError && !showEditProduct" class="product-action-error" role="alert">
            {{ productActionError }}
          </p>
        </div>
      </div>
    </main>
    <div v-if="!isProductOwner" class="bottom-bar">
      <button class="cart-btn" :disabled="isAddingToCart || !productData" @click="showAddToCartConfirm = true">
        Adicionar ao carrinho</button><button class="buy-now-btn" :disabled="isAddingToCart || !productData"
        @click="buyNow">
        <span v-if="isAddingToCart">Processando...</span><span v-else>Comprar agora</span>
      </button>
    </div>
    <div v-if="showAddToCartConfirm && productData" class="overlay" @click.self="closeAddToCartConfirm">
      <div class="modal">
        <h2>Adicionar ao carrinho?</h2>
        <p>Esse produto possui apenas 1 unidade.</p>
        <div class="actions">
          <button class="btn-secondary" @click="closeAddToCartConfirm">Cancelar</button><button class="btn-primary"
            @click="confirmAddToCart">Adicionar</button>
        </div>
        <p v-if="addToCartError" class="error-message">{{ addToCartError }}</p>
      </div>
    </div>

    <div v-if="showLoginRequiredModal" class="overlay auth-overlay" @click.self="closeLoginRequiredModal">
      <div class="auth-modal">
        <div class="auth-modal-icon">🔒</div>

        <h2>Faça login para continuar</h2>

        <p>
          Para adicionar ao carrinho ou comprar, você precisa entrar na sua conta ou criar uma nova.
        </p>

        <div class="actions auth-actions">
          <button class="btn-secondary auth-btn" @click="redirectToAuth('login')">
            Fazer login
          </button>

          <button class="btn-primary auth-btn" @click="redirectToAuth('register')">
            Criar conta
          </button>
        </div>
      </div>
    </div>

    <div v-if="showEditProduct && productData" class="overlay edit-product-overlay" @click.self="showEditProduct = false">
      <form class="edit-product-modal" @submit.prevent="saveProductChanges">
        <div class="edit-product-header">
          <h2>Alterar produto</h2>
          <button type="button" aria-label="Fechar" @click="showEditProduct = false">×</button>
        </div>
        <label>
          Nome do produto
          <input v-model="editDraft.nome" maxlength="150" required />
        </label>
        <label>
          Descrição
          <textarea v-model="editDraft.descricao" maxlength="300" required />
        </label>
        <div class="edit-product-row">
          <label>
            Preço (R$)
            <input v-model="editDraft.preco" type="number" min="0.01" step="0.01" required />
          </label>
          <label>
            Marca
            <input v-model="editDraft.marca" maxlength="100" />
          </label>
        </div>
        <div class="edit-product-row">
          <label>
            Categoria
            <select v-model="editDraft.categoria" required>
              <option value="" disabled>Selecione</option>
              <option
                v-if="editDraft.categoria && !categorias.some((item) => String(item.id) === editDraft.categoria)"
                :value="editDraft.categoria"
              >
                {{ categoriaNome || `Categoria ${editDraft.categoria}` }}
              </option>
              <option v-for="categoria in categorias" :key="categoria.id" :value="String(categoria.id)">
                {{ categoria.nome || categoria.name || categoria.title || `Categoria ${categoria.id}` }}
              </option>
            </select>
          </label>
          <label>
            Condição
            <input v-model="editDraft.condicao" maxlength="80" />
          </label>
        </div>
        <label>
          Trocar foto (opcional)
          <input type="file" accept="image/*" @change="selectReplacementImage" />
        </label>
        <p v-if="replacementImage" class="selected-image-name">
          Nova foto: {{ replacementImage.name }}
        </p>
        <p v-if="productActionError" class="product-action-error" role="alert">
          {{ productActionError }}
        </p>
        <div class="actions">
          <button type="button" class="btn-secondary" @click="showEditProduct = false">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="isSavingProduct">
            {{ isSavingProduct ? 'Salvando...' : 'Salvar alterações' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import '../css/product-detail.css';
</style>
