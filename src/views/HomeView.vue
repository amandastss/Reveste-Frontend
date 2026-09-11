<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

interface Produto {
  id: number
  name: string
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

interface Estilo {
  id: number
  titulo: string
  descricao: string
  imagem: string
}

const router = useRouter()

const produtos = ref<Produto[]>([])
const categorias = ref<Categoria[]>([])
const carousel = ref<HTMLElement | null>(null)

/* =========================================
   ESTILOS DO CARROSSEL
========================================= */

const estilos = ref<Estilo[]>([
  {
    id: 1,
    titulo: 'Vintage',
    descricao: 'Peças com história e personalidade.',
    imagem: '/vintage.jpg'
  },
  {
    id: 2,
    titulo: 'Minimal',
    descricao: 'Menos é mais.',
    imagem: '/minimal.jpg'
  },
  {
    id: 3,
    titulo: 'Streetwear',
    descricao: 'Conforto e atitude.',
    imagem: '/streetwear.jpg'
  },
  {
    id: 4,
    titulo: 'Y2K',
    descricao: 'Diretamente dos anos 2000.',
    imagem: '/y2k.jpg'
  },
  {
    id: 5,
    titulo: 'Clássico',
    descricao: 'Peças que nunca saem de moda.',
    imagem: '/classico.jpg'
  }
])

/* =========================================
   NAVEGAÇÃO
========================================= */

const goToProduto = (id: number) => {
  router.push({
    name: 'produto-detalhe',
    params: { id }
  })
}

const goToSearch = () => {
  router.push({
    name: 'search'
  })
}

const goToCategory = (cat: Categoria) => {
  router.push({
    name: 'categoria',
    params: {
      id: String(cat.id)
    }
  })
}

const goToEstilo = (estilo: Estilo) => {
  router.push({
    name: 'search',
    query: {
      estilo: estilo.titulo
    }
  })
}

/* =========================================
   CARROSSEL
========================================= */

const scrollCarousel = (direcao: 'left' | 'right') => {
  if (!carousel.value) return

  const distancia = 260

  carousel.value.scrollBy({
    left: direcao === 'right' ? distancia : -distancia,
    behavior: 'smooth'
  })
}

/* =========================================
   IMAGENS
========================================= */

const formatMediaUrl = (url?: string | null) => {
  if (!url) return '/default.png'

  return url.startsWith('http')
    ? url
    : `${import.meta.env.VITE_API_URL}${url}`
}

/* =========================================
   PRODUTOS
========================================= */

const fetchProdutos = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/produtos/`
    )

    produtos.value = Array.isArray(res.data)
      ? res.data
      : res.data.results || []

  } catch (err) {
    console.error('Erro ao buscar produtos:', err)
  }
}

/* =========================================
   CATEGORIAS
========================================= */

const fetchCategorias = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/categorias/`
    )

    categorias.value = Array.isArray(res.data)
      ? res.data
      : res.data.results || []

  } catch (err) {
    console.error('Erro ao buscar categorias:', err)
  }
}

/* =========================================
   MONTAGEM
========================================= */

onMounted(() => {
  fetchProdutos()
  fetchCategorias()
})
</script>

<template>
  <div class="home">

    <!-- =========================================
         SEARCH BAR
    ========================================= -->

    <div
      class="search-bar"
      @click="goToSearch"
    >
      <div class="search-input-wrapper">

        <input
          type="text"
          placeholder="Pesquisar itens..."
          readonly
        />

        <span
          class="search-icon"
          aria-hidden="true"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              stroke-width="2"
            />

            <path
              d="M16.5 16.5L21 21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </span>

      </div>
    </div>

    <!-- =========================================
         CARROSSEL DE ESTILOS
    ========================================= -->

    <section class="style-section">

      <div class="section-header">

        <div>
          <span class="section-subtitle">
            ENCONTRE O SEU
          </span>

          <h2>
            Seu estilo, suas regras.
          </h2>
        </div>

        <button
          class="explore-btn"
          @click="goToSearch"
        >
          Explorar

          <span class="material-symbols-outlined">
            arrow_forward
          </span>
        </button>

      </div>

      <!-- CONTAINER DO CARROSSEL -->

      <div class="carousel-wrapper">

        <!-- SETA ESQUERDA -->

        <button
          class="carousel-btn carousel-btn-left"
          @click="scrollCarousel('left')"
          aria-label="Estilo anterior"
        >
          <span class="material-symbols-outlined">
            chevron_left
          </span>
        </button>

        <!-- CARROSSEL -->

        <div
          ref="carousel"
          class="style-carousel"
        >

          <article
            v-for="estilo in estilos"
            :key="estilo.id"
            class="style-card"
            @click="goToEstilo(estilo)"
          >

            <img
              :src="estilo.imagem"
              :alt="estilo.titulo"
            />

            <div class="style-overlay"></div>

            <div class="style-content">

              <h3>
                {{ estilo.titulo }}
              </h3>

              <p>
                {{ estilo.descricao }}
              </p>

              <span class="style-arrow">

                <span class="material-symbols-outlined">
                  arrow_outward
                </span>

              </span>

            </div>

          </article>

        </div>

        <!-- SETA DIREITA -->

        <button
          class="carousel-btn carousel-btn-right"
          @click="scrollCarousel('right')"
          aria-label="Próximo estilo"
        >
          <span class="material-symbols-outlined">
            chevron_right
          </span>
        </button>

      </div>

    </section>

    <!-- =========================================
         CATEGORIAS
    ========================================= -->

    <section class="categories-section">

      <h3 class="section-title">
        Categorias
      </h3>

      <div class="categories">

        <div
          v-for="cat in categorias"
          :key="cat.id"
          class="item"
          @click="goToCategory(cat)"
        >

          <img
            class="circle"
            :src="formatMediaUrl(cat.imagem_url)"
            :alt="cat.nome"
          />

          <span>
            {{ cat.nome || cat.name || cat.title }}
          </span>

        </div>

      </div>

    </section>

    <!-- =========================================
         PRODUTOS
    ========================================= -->

    <section class="products">

      <div class="products-header">

        <h3>
          Para você
        </h3>

        <button
          class="see-more"
          @click="goToSearch"
        >
          Ver tudo
        </button>

      </div>

      <div class="grid">

        <div
          v-for="p in produtos"
          :key="p.id"
          class="card"
          @click="goToProduto(p.id)"
        >

          <div class="product-image">

            <img
              :src="formatMediaUrl(p.imagem_url)"
              :alt="p.nome"
            />

          </div>

          <p class="name">
            {{ p.nome }}
          </p>

          <p class="price">
            R$ {{ Number(p.preco).toFixed(2).replace('.', ',') }}
          </p>

        </div>

      </div>

    </section>

  </div>
</template>

<style scoped>

/* =========================================
   HOME
========================================= */

.home {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 12px;
  padding-bottom: 80px;
  background: var(--surface-bg);
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
  overflow: hidden;
}

/* =========================================
   SEARCH BAR
========================================= */

.search-bar {
  padding: 16px 5%;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  width: 100%;
  cursor: pointer;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 700px;
}

.search-input-wrapper input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 48px 12px 24px;
  border-radius: 30px;
  border: 1px solid transparent;
  background: var(--surface-elevated);
  font-size: 15px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.search-input-wrapper:hover input {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.search-input-wrapper input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
}

.search-icon {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  pointer-events: none;
}

/* =========================================
   CARROSSEL DE ESTILOS
========================================= */

.style-section {
  margin-top: 10px;
  margin-bottom: 32px;
  font-family: 'Montserrat', sans-serif;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 8px;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.8px;
  color: var(--text-muted);
}

.section-header h2 {
  margin: 4px 0 0;
  font-family: 'Playfair Display', serif;
  font-size: 25px;
  font-weight: 500;
  color: var(--text-color);
}

.explore-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  border: none;
  background: transparent;
  color: var(--text-color);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  padding-bottom: 4px;
}

.explore-btn .material-symbols-outlined {
  font-size: 17px;
}

/* =========================================
   WRAPPER DO CARROSSEL
========================================= */

.carousel-wrapper {
  position: relative;
  width: 100%;
}

/* =========================================
   CARROSSEL
========================================= */

.style-carousel {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 0 8px 10px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  scroll-behavior: smooth;
}

.style-carousel::-webkit-scrollbar {
  display: none;
}

/* =========================================
   SETAS DO CARROSSEL
========================================= */

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  width: 42px;
  height: 42px;

  border: none;
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.95);
  color: var(--text-color);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);

  z-index: 10;

  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.carousel-btn:hover {
  transform: translateY(-50%) scale(1.08);
  background: var(--surface-bg);
}

.carousel-btn .material-symbols-outlined {
  font-size: 25px;
}

.carousel-btn-left {
  left: 12px;
}

.carousel-btn-right {
  right: 12px;
}

/* =========================================
   CARD
========================================= */

.style-card {
  position: relative;
  min-width: 240px;
  height: 320px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  scroll-snap-align: start;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.style-card:hover {
  transform: translateY(-4px);
}

.style-card:active {
  transform: scale(0.97);
}

.style-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.style-card:hover img {
  transform: scale(1.05);
}

/* =========================================
   OVERLAY
========================================= */

.style-overlay {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      to top,
      rgba(0, 0, 0, 0.72),
      rgba(0, 0, 0, 0.05) 65%
    );
}

/* =========================================
   TEXTO DO CARD
========================================= */

.style-content {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 18px;
  color: white;
}

.style-content h3 {
  margin: 0 0 5px;
  font-family: 'Playfair Display', serif;
  font-size: 27px;
  font-weight: 500;
}

.style-content p {
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
  opacity: 0.9;
  max-width: 170px;
}

.style-arrow {
  position: absolute;
  right: 0;
  bottom: 0;

  width: 38px;
  height: 38px;

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.9);
  color: #111;

  display: flex;
  align-items: center;
  justify-content: center;
}

.style-arrow .material-symbols-outlined {
  font-size: 19px;
}

/* =========================================
   CATEGORIAS
========================================= */

.categories-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  margin: 0 8px 14px;
  color: var(--text-color);
}

.categories {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  padding: 0 8px;
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
  display: block;
}

.categories span {
  color: var(--text-color);
  font-weight: 500;
}

/* =========================================
   PRODUTOS
========================================= */

.products {
  padding: 12px 8px;
}

.products-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.products h3 {
  font-size: 18px;
  margin: 0;
  color: var(--text-color);
}

.see-more {
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}

/* =========================================
   GRID
========================================= */

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

/* =========================================
   CARD PRODUTO
========================================= */

.card {
  background: var(--surface-bg);
  border-radius: 16px;
  padding: 0;
  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  overflow: hidden;
}

.card:active {
  transform: scale(0.97);
}

.product-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 14px;
  background: var(--surface-elevated);
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.card:hover img {
  transform: scale(1.03);
}

/* =========================================
   TEXTO PRODUTO
========================================= */

.name {
  font-size: 13px;
  margin: 8px 4px 2px;
  color: var(--text-color);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  font-size: 14px;
  font-weight: 600;
  margin: 0 4px 8px;
  color: var(--text-color);
}

/* =========================================
   DESKTOP
========================================= */

@media (min-width: 768px) {

  .home {
    padding: 20px;
    padding-bottom: 40px;
  }

  .style-section {
    margin-bottom: 40px;
  }

  .style-card {
    min-width: 280px;
    height: 360px;
  }

  .carousel-btn {
    width: 48px;
    height: 48px;
  }

  .categories {
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
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
  }

  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

}

@media (hover: hover) {

  .card:hover {
    transform: translateY(-4px);

    box-shadow:
      0 10px 24px rgba(0, 0, 0, 0.08);
  }

}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 768px) {

  .home {
    padding: 10px;
  }

  .style-card {
    min-width: 210px;
    height: 280px;
  }

  .style-content h3 {
    font-size: 24px;
  }

  .categories {
    gap: 12px;
  }

  .carousel-btn {
    width: 36px;
    height: 36px;
  }

  .carousel-btn-left {
    left: 5px;
  }

  .carousel-btn-right {
    right: 5px;
  }

}
</style>