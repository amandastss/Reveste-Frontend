<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

interface Produto {
  id: number
  name: string /* Alterado de 'nome' para 'name' conforme o padrão do seu carrinho se necessário, mas mantido a lógica */
  nome: string
  preco: number
  imagem_url?: string | null
}

interface Categoria {
  id: number
  nome: string
  imagem_url: string | null
  name?: string
  title?: string
}

const router = useRouter()
const produtos = ref<Produto[]>([])
const categorias = ref<Categoria[]>([])

const goToProduto = (id: number) => {
  router.push({ name: 'produto-detalhe', params: { id } })
}

const goToSearch = () => {
  router.push({ name: 'search' })
}

const goToCategory = (cat: Categoria) => {
  router.push({
    name: 'categoria',
    params: { id: String(cat.id) }
  })
}

const formatMediaUrl = (url?: string | null) => {
  if (!url) return '/default.png'
  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`
}

// PRODUTOS
const fetchProdutos = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/produtos/`)
    produtos.value = res.data.results
  } catch (err) {
    console.error(err)
  }
}

// CATEGORIAS
const fetchCategorias = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/categorias/`)
    categorias.value = res.data.results
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  fetchProdutos()
  fetchCategorias()
})
</script>

<template>
  <div class="home">
    <!-- Search bar -->
    <div class="search-bar" @click="goToSearch">
      <div class="search-input-wrapper">
        <input type="text" placeholder="Pesquisar itens..." readonly />
        <span class="search-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
            <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      </div>
    </div>
    <!-- Banner -->
    <div class="banner">
      <img src="/banner.jpg" alt="Promoção" />
    </div>

    <div class="categories">
      <div v-for="cat in categorias" :key="cat.id" class="item" @click="goToCategory(cat)">
        <img class="circle" :src="formatMediaUrl(cat.imagem_url)" />
        <span>{{ cat.nome || cat.name || cat.title }}</span>
      </div>
    </div>

    <div class="products">
      <h3>Para você</h3>

      <div class="grid">
        <div class="card" v-for="p in produtos" :key="p.id" @click="goToProduto(p.id)">
          <img :src="formatMediaUrl(p.imagem_url)" />
          <p class="name">{{ p.nome }}</p>
          <p class="price">R$ {{ p.preco }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
  max-width: none; /* Remove a limitação de 420px mobile */
  margin: 0;
  padding: 12px;
  padding-bottom: 80px;
  background: white; /* Corrigido de #f6f6f7 para white para unificar as cores de fundo */
  font-family: 'Montserrat', sans-serif;
}

/* SEARCH BAR */
.search-bar {
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 420px; /* same max width as .home for visual alignment */
}

.search-input-wrapper input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 44px 10px 14px;
  border-radius: 20px;
  border: 1px solid #00000066;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  font-size: 14px;
  color: #333;
  line-height: 1;
}

.search-input-wrapper input::placeholder {
  color: #9a9a9a;
}

.search-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9a9a9a;
  pointer-events: none;
}

@media (max-width: 420px) {
  .search-bar { padding: 10px; }
  .search-input-wrapper { max-width: 100%; }
  .search-input-wrapper input { padding: 10px 42px 10px 12px; font-size: 14px; }
}

/* BANNER */
.banner {
  padding: 0;
  margin-bottom: 16px;
}

.banner img {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* CATEGORIAS */
.categories {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  padding: 12px 0;
}

.item {
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.item:active {
  transform: scale(0.95);
}

.circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin: 0 auto 6px;
  object-fit: cover;
}

.categories span {
  color: #222;
  font-weight: 500;
}

/* PRODUTOS */
.products {
  padding: 12px 0;
}

.products h3 {
  font-size: 18px;
  margin-bottom: 14px;
  color: #111;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

/* CARD */
.card {
  background: white;
  border-radius: 16px;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:active {
  transform: scale(0.97);
}

@media (hover: hover) {
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  }
}

.card img {
  width: 100%;
  border-radius: 12px;
  aspect-ratio: 1/1;
  object-fit: cover;
}

/* TEXTO */
.name {
  font-size: 13px;
  margin-top: 8px;
  color: #222;
}

.price {
  font-size: 14px;
  font-weight: 600;
  margin-top: 2px;
  color: black;
}

/* DESKTOP */
@media (min-width: 768px) {
  .home {
    padding: 20px;
    padding-bottom: 40px;
  }

  .banner {
    margin-bottom: 24px;
  }

  .categories {
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
    padding: 20px 0;
  }

  .circle {
    width: 65px;
    height: 65px;
  }

  .item {
    font-size: 13px;
  }

  .products h3 {
    font-size: 22px;
    margin-bottom: 20px;
  }

  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}
</style>
