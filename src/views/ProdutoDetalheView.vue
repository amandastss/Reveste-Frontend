<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '@/stores/cart'

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

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const productId = Number(route.params.id || 0)

const productData = ref<Produto | null>(null)
const categoriaNome = ref('')
const loading = ref(true)
const error = ref('')
const showAddToCartConfirm = ref(false)
const isAddingToCart = ref(false)
const addToCartError = ref('')
const addToCartSuccess = ref(false)

const mainImage = computed(() => {
  if (!productData.value?.imagem_url) {
    return 'https://via.placeholder.com/600x600?text=Sem+imagem'
  }
  return productData.value.imagem_url.startsWith('http')
    ? productData.value.imagem_url
    : `${import.meta.env.VITE_API_URL}/api${productData.value.imagem_url}`
})

const goBack = () => router.back()
const isFavorite = ref(false)
const isAnimating = ref(false)

const loadFavoriteState = () => {
  if (productId) {
    const saved = localStorage.getItem(`favorite-${productId}`)
    isFavorite.value = saved === 'true'
  }
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  if (productId) {
    localStorage.setItem(`favorite-${productId}`, String(isFavorite.value))
  }
  
  // Animação de pulsação
  isAnimating.value = true
  setTimeout(() => {
    isAnimating.value = false
  }, 600)
}
const openAddToCartConfirm = () => {
  showAddToCartConfirm.value = true
}
const closeAddToCartConfirm = () => {
  showAddToCartConfirm.value = false
  addToCartError.value = ''
}

const confirmAddToCart = async () => {
  if (!productData.value) return

  isAddingToCart.value = true
  addToCartError.value = ''

  try {
    await cartStore.addItem({
  id: productData.value.id,
  name: productData.value.nome,
  color: '',
  size: '',
  price: Number(productData.value.preco),
  quantity: 1,
  image: mainImage.value,
})

    closeAddToCartConfirm()
    handleAddToCartSuccess()
  } catch (err) {
    addToCartError.value = err instanceof Error ? err.message : 'Erro ao adicionar ao carrinho'
  } finally {
    isAddingToCart.value = false
  }
}

const openReviews = () => router.push({ name: 'produto-avaliacoes', params: { id: productId } })

const handleAddToCartSuccess = () => {
  addToCartSuccess.value = true
  setTimeout(() => {
    addToCartSuccess.value = false
  }, 3000)
}

const resolveCategoriaNome = async (produto: Produto) => {
  const categoria = produto.categoria

  if (typeof categoria === 'object' && categoria) {
    const nomeCategoria = categoria.nome || categoria.name || categoria.title || ''
    categoriaNome.value = nomeCategoria
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

    const categoriaEncontrada = categorias.find(
      (item: { id?: number; nome?: string; name?: string; title?: string }) =>
        Number(item.id) === categoriaId,
    )
    categoriaNome.value =
      categoriaEncontrada?.nome || categoriaEncontrada?.name || categoriaEncontrada?.title || ''
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

onMounted(() => {
  loadFavoriteState()
  fetchProduct()
})
</script>

<template>
  <div class="product-page-container">
    <!-- HEADER -->
    <header class="app-header">
      <div></div>
      <div class="header-actions"></div>
    </header>

    <!-- SUCCESS MESSAGE -->
    <Transition name="fade">
      <div v-if="addToCartSuccess" class="success-message">✓ Adicionado ao carrinho!</div>
    </Transition>

    <!-- CONTEÚDO -->
    <main class="scrollable-content">
      <!-- IMAGEM COM BOTÃO DE FAVORITO -->
      <div class="image-wrapper">
        <img :src="mainImage" class="main-product-image" />
        <button 
          class="back-btn" 
          @click="goBack"
          title="Voltar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button 
          class="favorite-btn" 
          :class="{ 'is-favorite': isFavorite, 'is-animating': isAnimating }"
          @click="toggleFavorite"
          title="Adicionar aos favoritos"
        >
          <svg v-if="!isFavorite" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="loading-state">Carregando produto...</div>

      <!-- ERRO -->
      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <!-- PRODUTO -->
      <div v-else class="content">
        <h1 class="product-title">
          {{ productData?.nome }}
        </h1>

        <p class="product-price">R$ {{ productData?.preco }}</p>

        <span class="category-badge">
          {{ categoriaNome || 'Sem categoria' }}
        </span>

        <!-- DESCRIÇÃO -->
        <div class="info-block">
          <h2>Descrição</h2>
          <p>{{ productData?.descricao }}</p>
        </div>

        <!-- MARCA + CONDIÇÃO -->
        <div class="info-row">
          <div>
            <h2>Marca</h2>
            <p>{{ productData?.marca }}</p>
          </div>

          <div>
            <h2>Condição</h2>
            <span class="badge-condition">
              {{ productData?.condicao || 'Não informado' }}
            </span>
          </div>
        </div>

        <!-- AVALIAÇÕES -->
        <div class="reviews-card" @click="openReviews">
          <span>Ver avaliações</span>
          <span>→</span>
        </div>
      </div>
    </main>

    <!-- BOTÃO FIXO (ÚNICO!) -->
    <div class="bottom-bar">
      <button class="buy-btn" @click="openAddToCartConfirm">Adicionar ao carrinho</button>
    </div>

    <!-- MODAL -->
    <div
      v-if="showAddToCartConfirm && productData"
      class="overlay"
      @click.self="closeAddToCartConfirm"
    >
      <div class="modal">
        <h2>Adicionar ao carrinho?</h2>

        <p>Esse produto possui apenas 1 unidade.</p>

        <div class="actions">
          <button class="btn-secondary" @click="closeAddToCartConfirm">Cancelar</button>

          <button class="btn-primary" @click="confirmAddToCart">Adicionar</button>
        </div>

        <p v-if="addToCartError" class="error-message">
          {{ addToCartError }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../css/product-detail.css';
</style>
