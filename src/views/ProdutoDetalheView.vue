<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '@/stores/cart'
import { hasCartAuthToken, getCartAuthRedirectPath } from '@/utils/cartAuth'
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
  isAnimating = ref(false)
const mainImage = computed(() =>
  !productData.value?.imagem_url
    ? 'https://via.placeholder.com/600x600?text=Sem+imagem'
    : productData.value.imagem_url.startsWith('http')
      ? productData.value.imagem_url
      : `${import.meta.env.VITE_API_URL}/api${productData.value.imagem_url}`,
)
const goBack = () => router.back(),
  openReviews = () => router.push({ name: 'produto-avaliacoes', params: { id: productId } })
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
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/categorias/`)
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
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/produtos/${productId}/`)
    productData.value = res.data
    await resolveCategoriaNome(res.data)
  } catch (err) {
    console.error(err)
    error.value = 'Erro ao carregar os dados do produto.'
  } finally {
    loading.value = false
  }
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
    <Transition name="fade"
      ><div v-if="addToCartSuccess" class="success-message">
        ✓ Adicionado ao carrinho!
      </div></Transition
    >
    <main class="scrollable-content">
      <div class="image-wrapper">
        <img :src="mainImage" class="main-product-image" /><button
          class="back-btn"
          @click="goBack"
          title="Voltar"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg></button
        ><button
          class="favorite-btn"
          :class="{ 'is-favorite': isFavorite, 'is-animating': isAnimating }"
          @click="toggleFavorite"
          title="Adicionar aos favoritos"
        >
          <svg
            v-if="!isFavorite"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            ></path></svg
          ><svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            ></path>
          </svg>
        </button>
      </div>
      <div v-if="loading" class="loading-state">Carregando produto...</div>
      <div v-else-if="error" class="error-state">{{ error }}</div>
      <div v-else class="content">
        <h1 class="product-title">{{ productData?.nome }}</h1>
        <p class="product-price">R$ {{ productData?.preco }}</p>
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
        <div class="reviews-card" @click="openReviews">
          <span>Ver avaliações</span><span>→</span>
        </div>
      </div>
    </main>
    <div class="bottom-bar">
      <button
        class="cart-btn"
        :disabled="isAddingToCart || !productData"
        @click="showAddToCartConfirm = true"
      >
        Adicionar ao carrinho</button
      ><button class="buy-now-btn" :disabled="isAddingToCart || !productData" @click="buyNow">
        <span v-if="isAddingToCart">Processando...</span><span v-else>Comprar agora</span>
      </button>
    </div>
    <div
      v-if="showAddToCartConfirm && productData"
      class="overlay"
      @click.self="closeAddToCartConfirm"
    >
      <div class="modal">
        <h2>Adicionar ao carrinho?</h2>
        <p>Esse produto possui apenas 1 unidade.</p>
        <div class="actions">
          <button class="btn-secondary" @click="closeAddToCartConfirm">Cancelar</button
          ><button class="btn-primary" @click="confirmAddToCart">Adicionar</button>
        </div>
        <p v-if="addToCartError" class="error-message">{{ addToCartError }}</p>
      </div>
    </div>

    <div
      v-if="showLoginRequiredModal"
      class="overlay auth-overlay"
      @click.self="closeLoginRequiredModal"
    >
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
  </div>
</template>

<style scoped>
@import '../css/product-detail.css';
</style>
