<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
const heroIndex = ref(0)
const highlightIndex = ref(0)

const bannerHighlights: Array<{ icon: string; text: string }> = [
  { icon: 'local_shipping', text: 'Frete grátis acima de R$ 200' },
  { icon: 'credit_card', text: '12x sem juros' },
  { icon: 'verified', text: 'Produtos confiáveis' },
]

const currentHighlight = computed(
  () => bannerHighlights[highlightIndex.value] ?? bannerHighlights[0],
)

const heroSlides = ref<
  Array<{
    id: number
    productId?: number
    title: string
    subtitle: string
    image: string
    tag: string
    price: string
    ctaPrimary: string
    ctaSecondary: string
  }>
>([
  {
    id: 0,
    productId: 0,
    title: 'Coleção Reveste',
    subtitle: 'Peças selecionadas para o seu estilo.',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    tag: 'Novidades',
    price: 'Confira',
    ctaPrimary: 'Ver produto',
    ctaSecondary: 'Explorar loja',
  },
])

/* =========================================
   ESTILOS DO CARROSSEL
========================================= */

const estilos = ref<Estilo[]>([
  {
    id: 1,
    titulo: 'Vintage',
    descricao: 'Peças com história e personalidade.',
    imagem: '/vintage.jpg',
  },
  {
    id: 2,
    titulo: 'Minimal',
    descricao: 'Menos é mais.',
    imagem: '/minimal.jpg',
  },
  {
    id: 3,
    titulo: 'Streetwear',
    descricao: 'Conforto e atitude.',
    imagem: '/streetwear.jpg',
  },
  {
    id: 4,
    titulo: 'Y2K',
    descricao: 'Diretamente dos anos 2000.',
    imagem: '/y2k.jpg',
  },
  {
    id: 5,
    titulo: 'Clássico',
    descricao: 'Peças que nunca saem de moda.',
    imagem: '/classico.jpg',
  },
])

/* =========================================
   NAVEGAÇÃO
========================================= */

const goToProduto = (id: number) => {
  router.push({
    name: 'produto-detalhe',
    params: { id },
  })
}

const goToSearch = () => {
  router.push({
    name: 'search',
  })
}

const goToCategory = (cat: Categoria) => {
  router.push({
    name: 'categoria',
    params: {
      id: String(cat.id),
    },
  })
}

const goToEstilo = (estilo: Estilo) => {
  router.push({
    name: 'search',
    query: {
      estilo: estilo.titulo,
    },
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
    behavior: 'smooth',
  })
}

/* =========================================
   IMAGENS
========================================= */

const formatMediaUrl = (url?: string | null) => {
  if (!url) return '/default.png'

  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`
}

const formatPrice = (valor: number) =>
  `R$ ${Number(valor || 0)
    .toFixed(2)
    .replace('.', ',')}`

const buildHeroSlides = () => {
  const lista = produtos.value.slice(0, 4)

  if (lista.length === 0) return

  heroSlides.value = lista.map((produto, index) => ({
    id: produto.id,
    productId: produto.id,
    title: produto.nome || produto.name || 'Nova peça',
    subtitle:
      index === 0
        ? 'Lançamentos da semana'
        : index === 1
          ? 'Mais buscados'
          : index === 2
            ? 'Estilo em alta'
            : 'Seleções da loja',
    image: formatMediaUrl(produto.imagem_url),
    tag: index === 0 ? 'Novo' : index === 1 ? 'Popular' : 'Em alta',
    price: formatPrice(Number(produto.preco || 0)),
    ctaPrimary: 'Ver produto',
    ctaSecondary: 'Explorar loja',
  }))
}

const nextHeroSlide = () => {
  if (heroSlides.value.length <= 1) return
  heroIndex.value = (heroIndex.value + 1) % heroSlides.value.length
}

const prevHeroSlide = () => {
  if (heroSlides.value.length <= 1) return
  heroIndex.value = (heroIndex.value - 1 + heroSlides.value.length) % heroSlides.value.length
}

const nextHighlight = () => {
  highlightIndex.value = (highlightIndex.value + 1) % bannerHighlights.length
}

/* =========================================
   PRODUTOS
========================================= */

const fetchProdutos = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/produtos/`)

    produtos.value = Array.isArray(res.data) ? res.data : res.data.results || []

    buildHeroSlides()
  } catch (err) {
    console.error('Erro ao buscar produtos:', err)
  }
}

/* =========================================
   CATEGORIAS
========================================= */

const fetchCategorias = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/categorias/`)

    categorias.value = Array.isArray(res.data) ? res.data : res.data.results || []
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

  const heroTimer = window.setInterval(() => {
    nextHeroSlide()
  }, 5000)

  const highlightTimer = window.setInterval(() => {
    nextHighlight()
  }, 2600)

  // mantém os intervalos vivos enquanto a página estiver montada
  onUnmounted(() => {
    window.clearInterval(heroTimer)
    window.clearInterval(highlightTimer)
  })
})
</script>

<template>
  <div class="home">
    <section class="hero-banner">
      <div class="hero-slider" :style="{ transform: `translateX(-${heroIndex * 100}%)` }">
        <article
          v-for="slide in heroSlides"
          :key="slide.id"
          class="hero-slide"
          @click="slide.productId ? goToProduto(slide.productId) : goToSearch()"
        >
          <div class="hero-content">
            <p class="eyebrow">{{ slide.tag }}</p>
            <h1>{{ slide.title }}</h1>
            <p class="hero-copy">
              {{ slide.subtitle }}
            </p>

            <div class="hero-actions">
              <button
                class="hero-primary"
                @click.stop="slide.productId ? goToProduto(slide.productId) : goToSearch()"
              >
                {{ slide.ctaPrimary || (slide.productId ? 'Ver produto' : 'Explorar loja') }}
              </button>
              <button class="hero-secondary" @click.stop="goToSearch">
                {{ slide.ctaSecondary || 'Ver coleção' }}
              </button>
            </div>
          </div>

          <div class="hero-visual" aria-label="Produto em destaque">
            <div class="visual-backdrop"></div>

            <div class="visual-card main-card">
              <img :src="slide.image" :alt="slide.title" />
            </div>

            <div class="visual-card floating-card promo-card">
              <span class="promo-label">Produto</span>
              <strong>{{ slide.price }}</strong>
              <small>Disponível agora</small>
            </div>
          </div>
        </article>
      </div>

      <div class="highlight-bar" aria-live="polite">
        <div class="highlight-item active-highlight">
          <span class="material-symbols-outlined">{{
            currentHighlight?.icon ?? 'local_shipping'
          }}</span>
          <span>{{ currentHighlight?.text ?? 'Frete grátis acima de R$ 200' }}</span>
        </div>
      </div>

      <div class="hero-controls">
        <button class="nav-arrow" @click="prevHeroSlide" aria-label="Slide anterior">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>

        <div class="hero-dots" aria-label="Navegação do banner">
          <button
            v-for="(slide, index) in heroSlides"
            :key="`${slide.id}-dot`"
            class="dot"
            :class="{ active: index === heroIndex }"
            @click="heroIndex = index"
            :aria-label="`Ir para o slide ${index + 1}`"
          />
        </div>

        <button class="nav-arrow" @click="nextHeroSlide" aria-label="Próximo slide">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </section>

    <!-- =========================================
         SEARCH BAR
    ========================================= -->

    <div class="search-bar" @click="goToSearch">
      <div class="search-input-wrapper">
        <input type="text" placeholder="Pesquisar itens..." readonly />

        <span class="search-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />

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
          <span class="section-subtitle"> ENCONTRE O SEU </span>

          <h2>Seu estilo, suas regras.</h2>
        </div>

        <button class="explore-btn" @click="goToSearch">
          Explorar

          <span class="material-symbols-outlined"> arrow_forward </span>
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
          <span class="material-symbols-outlined"> chevron_left </span>
        </button>

        <!-- CARROSSEL -->

        <div ref="carousel" class="style-carousel">
          <article
            v-for="estilo in estilos"
            :key="estilo.id"
            class="style-card"
            @click="goToEstilo(estilo)"
          >
            <img :src="estilo.imagem" :alt="estilo.titulo" />

            <div class="style-overlay"></div>

            <div class="style-content">
              <h3>
                {{ estilo.titulo }}
              </h3>

              <p>
                {{ estilo.descricao }}
              </p>

              <span class="style-arrow">
                <span class="material-symbols-outlined"> arrow_outward </span>
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
          <span class="material-symbols-outlined"> chevron_right </span>
        </button>
      </div>
    </section>

    <!-- =========================================
         CATEGORIAS
    ========================================= -->

    <section class="categories-section">
      <h3 class="section-title">Categorias</h3>

      <div class="categories">
        <div v-for="cat in categorias" :key="cat.id" class="item" @click="goToCategory(cat)">
          <img class="circle" :src="formatMediaUrl(cat.imagem_url)" :alt="cat.nome" />

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
        <h3>Para você</h3>

        <button class="see-more" @click="goToSearch">Ver tudo</button>
      </div>

      <div class="grid">
        <div v-for="p in produtos" :key="p.id" class="card" @click="goToProduto(p.id)">
          <div class="product-image">
            <img :src="formatMediaUrl(p.imagem_url)" :alt="p.nome" />
          </div>

          <p class="name">
            {{ p.nome }}
          </p>

          <p class="price">R$ {{ Number(p.preco).toFixed(2).replace('.', ',') }}</p>
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
   HERO BANNER
========================================= */

.shop-highlights {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: min(100%, 1280px);
  margin: 0 auto 14px;
}

.highlight-bar {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.highlight-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: min(100%, 520px);
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #f7f2ea;
  font-size: 0.77rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.active-highlight {
  animation: fadeHighlight 0.35s ease;
}

.highlight-item .material-symbols-outlined {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.hero-banner {
  position: relative;
  width: min(100%, 1280px);
  margin: 0 auto 18px;
  padding: 22px 22px 12px;
  border-radius: 28px;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 52%, #121212 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.14);
}

.hero-slider {
  display: flex;
  width: 100%;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-slide {
  display: grid;
  grid-template-columns: 1.18fr 0.82fr;
  align-items: center;
  gap: 30px;
  min-width: 100%;
  min-height: 470px;
  padding: 18px 10px 12px;
  box-sizing: border-box;
  cursor: pointer;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: flex-end;
  padding-left: 6px;
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.hero-content h1 {
  margin: 0;
  max-width: 620px;
  font-size: clamp(2.7rem, 3.3vw, 5rem);
  line-height: 0.92;
  letter-spacing: -0.06em;
  font-weight: 700;
  color: #f7f2ea;
  animation: fadeUp 0.55s ease both;
}

.hero-copy {
  max-width: 500px;
  margin: 10px 0 0;
  font-size: 0.98rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.74);
  animation: fadeUp 0.55s ease 0.08s both;
}

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
  padding-top: 0;
  animation: fadeUp 0.55s ease 0.12s both;
  align-self: flex-start;
}

.hero-primary,
.hero-secondary,
.nav-arrow,
.dot {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    background 0.2s ease;
}

.hero-primary,
.hero-secondary {
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
}

.hero-primary {
  background: rgba(245, 241, 234, 0.96);
  color: #171717;
}

.hero-secondary {
  background: rgba(255, 255, 255, 0.04);
  color: #f8f4ef;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hero-primary:hover,
.hero-secondary:hover,
.nav-arrow:hover,
.dot:hover {
  transform: translateY(-1px);
}

.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 420px;
  width: 100%;
  animation: slideIn 0.7s ease both;
}

.visual-backdrop {
  position: absolute;
  width: 80%;
  height: 80%;
  right: 5%;
  bottom: 5%;
  border-radius: 30px;
  background: linear-gradient(135deg, rgba(255, 214, 170, 0.2), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.visual-card {
  position: absolute;
  background: rgba(20, 20, 20, 0.34);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
}

.main-card {
  right: 8%;
  bottom: 9%;
  width: min(100%, 390px);
  max-width: 390px;
  aspect-ratio: 0.92;
  border-radius: 24px;
  overflow: hidden;
}

.main-card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: linear-gradient(180deg, #f6f1ea 0%, #ece5dd 100%);
  display: block;
}

.floating-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 18px;
  color: #fff;
}

.promo-card {
  left: 4%;
  bottom: 15%;
  min-width: 150px;
  background: rgba(255, 255, 255, 0.08);
}

.promo-label {
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.74);
}

.promo-card strong {
  font-size: 1.8rem;
  line-height: 1;
  letter-spacing: -0.05em;
}

.promo-card small {
  font-size: 0.66rem;
  color: rgba(255, 255, 255, 0.72);
}

.hero-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 8px 0 2px;
}

.nav-arrow {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  color: #f7f2ea;
  cursor: pointer;
}

.hero-dots {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  padding: 0;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
}

.dot.active {
  width: 26px;
  border-radius: 999px;
  background: #f7f2ea;
}

@keyframes fadeUp {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateX(16px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeHighlight {
  0% {
    opacity: 0;
    transform: translateY(6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .shop-highlights {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 12px;
  }

  .highlight-bar {
    margin-top: 8px;
  }

  .highlight-item {
    justify-content: flex-start;
    font-size: 0.72rem;
    width: min(100%, 420px);
  }

  .hero-banner {
    width: min(100%, 100%);
    padding: 14px 12px 12px;
    border-radius: 20px;
  }

  .hero-slide {
    grid-template-columns: 1fr;
    gap: 16px;
    min-height: auto;
    padding: 8px 4px 10px;
  }

  .hero-content {
    padding-left: 2px;
    text-align: center;
  }

  .eyebrow {
    font-size: 10px;
    letter-spacing: 0.12em;
  }

  .hero-content h1 {
    font-size: clamp(2.2rem, 9vw, 3.4rem);
    line-height: 1;
  }

  .hero-copy {
    margin: 14px auto 0;
    font-size: 0.92rem;
    line-height: 1.6;
  }

  .hero-actions {
    justify-content: center;
    margin-top: 20px;
  }

  .hero-primary,
  .hero-secondary {
    flex: 1;
    min-width: 145px;
    padding: 12px 16px;
    font-size: 0.82rem;
  }

  .hero-visual {
    min-height: 280px;
  }

  .visual-backdrop {
    width: 92%;
    height: 76%;
    right: 4%;
  }

  .main-card {
    right: 50%;
    bottom: 10%;
    width: min(100%, 300px);
    max-width: 300px;
    transform: translateX(50%);
    aspect-ratio: 0.82;
  }

  .promo-card {
    left: 10px;
    bottom: 16px;
    min-width: 120px;
    z-index: 2;
  }

  .promo-card strong {
    font-size: 1.2rem;
  }

  .hero-controls {
    padding-top: 6px;
  }
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

  background: linear-gradient(to top, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.05) 65%);
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

  .hero-banner {
    padding: 30px 34px;
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

    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  }
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 768px) {
  .home {
    padding: 10px;
  }

  .hero-banner {
    flex-direction: column;
    padding: 22px 18px;
    text-align: center;
  }

  .hero-content,
  .hero-visual {
    width: 100%;
    flex: 1 1 100%;
  }

  .hero-copy {
    max-width: none;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-visual img {
    max-width: 100%;
    height: 280px;
  }

  .hero-badge {
    right: 12px;
    bottom: 12px;
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
