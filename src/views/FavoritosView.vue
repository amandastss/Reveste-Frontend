<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getFavoriteCount, readFavorites, removeFavorite } from '@/utils/favorites'

const router = useRouter()
const favorites = ref(readFavorites())

const refreshFavorites = () => {
  favorites.value = readFavorites()
}

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))
}

const getImageUrl = (url?: string | null) => {
  if (!url) {
    return 'https://placehold.co/600x600?text=Produto'
  }

  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`
}

const abrirProduto = (id: number) => {
  router.push({ name: 'produto-detalhe', params: { id } })
}

const removerFavorito = (id: number) => {
  removeFavorite(id)
  refreshFavorites()
}

const voltar = () => router.back()

onMounted(() => {
  refreshFavorites()
  if (getFavoriteCount() === 0) {
    document.title = 'Favoritos - Reveste'
  }
})
</script>

<template>
  <div class="favorites-page">
    <header class="favorites-header">
      <button class="back-btn" @click="voltar" aria-label="Voltar">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <div class="header-title-wrap">
        <p class="eyebrow">Minha conta</p>
        <h1>Favoritos</h1>
      </div>
    </header>

    <div v-if="favorites.length === 0" class="empty-state">
      <div class="empty-icon">
        <span class="material-symbols-outlined">favorite_border</span>
      </div>
      <h2>Nenhum favorito ainda</h2>
      <p>Salve peças que você ama para ver aqui depois.</p>
      <button class="primary-button" @click="router.push('/')">Explorar produtos</button>
    </div>

    <div v-else class="favorites-grid">
      <article v-for="produto in favorites" :key="produto.id" class="favorite-card">
        <button class="favorite-remove" @click.stop="removerFavorito(produto.id)" aria-label="Remover favorito">
          <span class="material-symbols-outlined">close</span>
        </button>

        <div class="card-image" @click="abrirProduto(produto.id)">
          <img :src="getImageUrl(produto.imagem_url)" :alt="produto.nome" />
        </div>

        <div class="card-content" @click="abrirProduto(produto.id)">
          <h3>{{ produto.nome }}</h3>
          <p class="price">{{ formatPrice(produto.preco) }}</p>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background: #f7f7f7;
  color: #111111;
  font-family: 'Montserrat', sans-serif;
  padding-bottom: 92px;
}

.favorites-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px 14px;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.back-btn {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: #f2f2f2;
  color: #111111;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.header-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #666;
}

.favorites-header h1 {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 58vh;
  padding: 32px 24px;
}

.empty-icon {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: #f1e6cd;
  color: #8d6a1d;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon .material-symbols-outlined {
  font-size: 42px;
}

.empty-state h2 {
  margin: 0 0 8px;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 24px;
  color: #666;
  max-width: 260px;
}

.primary-button {
  border: none;
  background: #111111;
  color: #ffffff;
  padding: 14px 22px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 18px 16px 24px;
}

.favorite-card {
  position: relative;
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(17, 17, 17, 0.05);
}

.card-image {
  cursor: pointer;
}

.card-image img {
  width: 100%;
  height: 190px;
  object-fit: cover;
  display: block;
}

.card-content {
  padding: 12px 12px 14px;
  cursor: pointer;
}

.card-content h3 {
  margin: 0 0 6px;
  font-size: 0.96rem;
  font-weight: 600;
  line-height: 1.35;
  color: #1a1a1a;
}

.price {
  margin: 0;
  color: #111111;
  font-weight: 700;
  font-size: 1rem;
}

.favorite-remove {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(17, 17, 17, 0.72);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.favorite-remove .material-symbols-outlined {
  font-size: 18px;
}

@media (min-width: 768px) {
  .favorites-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px 110px;
  }

  .favorites-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
