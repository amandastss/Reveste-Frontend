<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

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
const productId = String(route.params.id || '')

const productData = ref<Produto | null>(null)
const loading = ref(true)
const error = ref('')

const mainImage = computed(() => {
  if (!productData.value?.imagem_url) {
    return 'https://via.placeholder.com/600x600?text=Sem+imagem'
  }
  return productData.value.imagem_url.startsWith('http')
    ? productData.value.imagem_url
    : `http://127.0.0.1:8000${productData.value.imagem_url}`
})

const goBack = () => router.back()
const toggleFavorite = () => alert('Adicionado aos favoritos!')
const openCart = () => alert('Abrindo o carrinho...')
const openReviews = () => router.push({ name: 'produto-avaliacoes', params: { id: productId } })

const fetchProduct = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get(`http://127.0.0.1:8000/api/produtos/${productId}/`)
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
        <button class="icon-btn" @click="openCart">🛒</button>
      </div>
    </header>

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
  </div>
</template>

<style scoped>
@import '../css/product-detail.css';
</style>
