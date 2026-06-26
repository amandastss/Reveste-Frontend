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
}

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const productId = Number(route.params.id || 0)

const productData = ref<Produto | null>(null)
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
const toggleFavorite = () => alert('Adicionado aos favoritos!')
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
      productId: productData.value.id,
      name: productData.value.nome,
      color: '',
      size: '',
      price: Number(productData.value.preco),
      quantity: 1,
      image: mainImage.value
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

const fetchProduct = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/produtos/${productId}/`)
    productData.value = res.data
  } catch (err) {
    console.error(err)
    error.value = 'Erro ao carregar os dados do produto.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchProduct)
</script>

<template>
  <div class="product-page-container">

    <header class="app-header">
      <button class="icon-btn" @click="goBack">←</button>
      <div class="header-actions">
        <button class="icon-btn" @click="toggleFavorite">♡</button>
        <button class="icon-btn" @click="openAddToCartConfirm">🛒</button>
      </div>
    </header>

    <!-- Success Message -->
    <Transition name="fade">
      <div v-if="addToCartSuccess" class="success-message">
        ✓ Adicionado ao carrinho com sucesso!
      </div>
    </Transition>

    <main class="scrollable-content">

      <div class="image-slider-wrapper">
        <img :src="mainImage" alt="Imagem do Produto" class="main-product-image" />
      </div>

      <div v-if="loading" class="loading-state">
        Carregando produto...
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <div v-else>
        <section class="basic-info-section">
          <h1 class="product-title">{{ productData?.nome }}</h1>
          <div class="rating-container">
            <span>★★★★☆</span>
          </div>
          <p class="product-price">R$ {{ productData?.preco }}</p>
        </section>

        <hr class="divider" />

        <section class="detail-section">
          <h2>DESCRIÇÃO</h2>
          <p class="description-text">{{ productData?.descricao }}</p>
        </section>

        <section class="detail-section">
          <h2>MARCA</h2>
          <p class="brand-text">• {{ productData?.marca }}</p>
        </section>

        <section class="detail-section">
          <h2>CONDIÇÃO DO PRODUTO</h2>
          <span class="badge-condition">{{ productData?.condicao || 'Não informado' }}</span>
        </section>

        <section class="reviews-section" @click="openReviews">
          <div class="reviews-header">
            <span>Reviews</span>
            <span>★★★★☆ &nbsp; →</span>
          </div>
        </section>
      </div>
    </main>

    <!-- Add to Cart Confirmation -->
    <div v-if="showAddToCartConfirm && productData" class="confirm-overlay" @click.self="closeAddToCartConfirm">
      <div class="confirm-modal">
        <div class="confirm-header">
          <h2>Adicionar ao Carrinho</h2>
          <button class="close-btn" @click="closeAddToCartConfirm">✕</button>
        </div>

        <p class="confirm-text">
          Este produto tem apenas 1 unidade disponível.
          Deseja adicioná-lo ao carrinho?
        </p>

        <div class="confirm-actions">
          <button class="btn-secondary" @click="closeAddToCartConfirm">Cancelar</button>
          <button class="btn-primary" @click="confirmAddToCart" :disabled="isAddingToCart">
            {{ isAddingToCart ? 'Adicionando...' : 'Adicionar ao Carrinho' }}
          </button>
        </div>

        <p v-if="addToCartError" class="error-message">{{ addToCartError }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../css/product-detail.css';

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
}

.confirm-modal {
  width: min(100%, 420px);
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}

.confirm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.confirm-header h2 {
  font-size: 18px;
  margin: 0;
}

.confirm-text {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 22px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 10px;
}

.btn-secondary,
.btn-primary {
  min-width: 130px;
  padding: 12px 18px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.btn-secondary {
  background: #f2f2f2;
  color: #333;
}

.btn-primary {
  background: #2a6fdb;
  color: #fff;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: 2px 4px;
}

.error-message {
  margin-top: 14px;
  color: #d72d2d;
  font-size: 14px;
}
</style>
