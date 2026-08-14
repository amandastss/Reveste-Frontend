<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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

const router = useRouter()

const produtos = ref<Produto[]>([])
const categorias = ref<Categoria[]>([])

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

const formatMediaUrl = (url?: string | null) => {
  if (!url) return '/default.png'

  return url.startsWith('http')
    ? url
    : `${import.meta.env.VITE_API_URL}${url}`
}


// =========================
// PRODUTOS
// =========================

const fetchProdutos = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/produtos/`
    )

    produtos.value = res.data.results
  } catch (err) {
    console.error('Erro ao buscar produtos:', err)
  }
}

const featuredProduct = computed(() => {
  return (
    produtos.value.find((produto) => produto.imagem_url) ??
    produtos.value[0] ??
    null
  )
})

const bannerImage = computed(() => {
  if (featuredProduct.value?.imagem_url) {
    return formatMediaUrl(featuredProduct.value.imagem_url)
  }

  return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'
})

const secondaryBannerImage = computed(() => {
  return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80'
})

const bannerTitle = computed(() => {
  return featuredProduct.value
    ? featuredProduct.value.nome
    : 'Nova coleção em destaque'
})


// =========================
// CATEGORIAS
// =========================

const fetchCategorias = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/categorias/`
    )

    categorias.value = res.data.results
  } catch (err) {
    console.error('Erro ao buscar categorias:', err)
  }
}


// =========================
// CARROSSEL PROMOCIONAL
// =========================

const promoMessages = [
  'Frete grátis acima de R$ 299,99',
  'Até 50% OFF em peças selecionadas',
  'Envio para todo o Brasil',
  'Novidades toda semana'
]

const currentPromo = ref(0)

let promoTimer: number | undefined

const nextPromo = () => {
  currentPromo.value =
    (currentPromo.value + 1) % promoMessages.length
}

const previousPromo = () => {
  currentPromo.value =
    (currentPromo.value - 1 + promoMessages.length) %
    promoMessages.length
}

const startPromo = () => {
  stopPromo()

  promoTimer = window.setInterval(() => {
    nextPromo()
  }, 3500)
}

const stopPromo = () => {
  if (promoTimer !== undefined) {
    window.clearInterval(promoTimer)
    promoTimer = undefined
  }
}


// =========================
// INICIALIZAÇÃO
// =========================

onMounted(() => {
  fetchProdutos()
  fetchCategorias()
  startPromo()
})
</script><template>
  <div class="home">

    <!-- =========================
         BARRA DE PESQUISA
    ========================== -->
    <div class="search-bar" @click="goToSearch">
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
            xmlns="http://www.w3.org/2000/svg"
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



    <!-- =========================
         BANNER PRINCIPAL
    ========================== -->
    <div class="hero-layout">

      <div
        v-if="featuredProduct"
        class="category-product-banner square-banner"
        @click="goToProduto(featuredProduct.id)"
      >

        <img
          :src="secondaryBannerImage"
          alt="Produto em destaque"
        />

        <div class="category-product-overlay"></div>

        <div class="category-product-copy">

          <span class="category-product-tag">
            Coleção
          </span>

          <h3>
            It pieces para o dia a dia
          </h3>

          <button type="button">
            Ver coleção
          </button>

        </div>

      </div>

    </div>
    <!-- =========================
         CARROSSEL PROMOCIONAL
    ========================== -->
    <div
      class="promo-carousel"
      @mouseenter="stopPromo"
      @mouseleave="startPromo"
    >

      <button
        class="promo-arrow promo-prev"
        type="button"
        aria-label="Mensagem anterior"
        @click="previousPromo"
      >
        ‹
      </button>


      <div class="promo-viewport">

        <Transition
          name="promo-slide"
          mode="out-in"
        >

          <span
            :key="currentPromo"
            class="promo-message"
          >
            {{ promoMessages[currentPromo] }}
          </span>

        </Transition>

      </div>


      <button
        class="promo-arrow promo-next"
        type="button"
        aria-label="Próxima mensagem"
        @click="nextPromo"
      >
        ›
      </button>


      <div class="promo-dots">

        <button
          v-for="(_, index) in promoMessages"
          :key="index"
          type="button"
          class="promo-dot"
          :class="{
            active: currentPromo === index
          }"
          :aria-label="`Ir para promoção ${index + 1}`"
          @click="currentPromo = index"
        ></button>

      </div>

    </div>



    <!-- =========================
         CATEGORIAS
    ========================== -->
    <div class="category-stack">

      <!-- PRIMEIRA LINHA -->
      <div class="categories-row">

        <div
          v-for="cat in categorias.slice(0, 4)"
          :key="cat.id"
          class="category-card"
          @click="goToCategory(cat)"
        >

          <img
            :src="formatMediaUrl(cat.imagem_url)"
            :alt="cat.nome || cat.name || cat.title"
          />

          <div class="category-overlay"></div>

          <div class="category-label">

            <span>
              {{ cat.nome || cat.name || cat.title }}
            </span>

            <span class="category-arrow">
              ›
            </span>

          </div>

        </div>

      </div>


      <!-- =========================
           BANNER 2
      ========================== -->
      <div
        class="banner"
        @click="
          featuredProduct
            ? goToProduto(featuredProduct.id)
            : goToSearch()
        "
      >

        <img
          :src="bannerImage"
          :alt="bannerTitle"
        />

        <div class="banner-overlay">

          <span class="banner-badge">
            Novo destaque
          </span>

          <h2>
            {{ bannerTitle }}
          </h2>

          <p>
            Peças escolhidas para o seu estilo
            com acabamento moderno e preço
            irresistível.
          </p>

          <button type="button">
            Comprar agora
          </button>

        </div>

      </div>


      <!-- SEGUNDA LINHA DE CATEGORIAS -->
      <div
        v-if="categorias.length > 4"
        class="categories-row second-row"
      >

        <div
          v-for="cat in categorias.slice(4)"
          :key="cat.id"
          class="category-card"
          @click="goToCategory(cat)"
        >

          <img
            :src="formatMediaUrl(cat.imagem_url)"
            :alt="cat.nome || cat.name || cat.title"
          />

          <div class="category-overlay"></div>

          <div class="category-label">

            <span>
              {{ cat.nome || cat.name || cat.title }}
            </span>

            <span class="category-arrow">
              ›
            </span>

          </div>

        </div>

      </div>

    </div>


    <!-- =========================
         DESTAQUES
    ========================== -->
    <div class="highlights">

      <div class="highlight-card primary">

        <span class="chip">
          Mais vendido
        </span>

        <h4>
          Peças com alto desempenho
        </h4>

        <p>
          Escolhas favoritas dos compradores.
        </p>

      </div>


      <div class="highlight-card secondary">

        <span class="chip">
          Promoção
        </span>

        <h4>
          Até 50% off
        </h4>

        <p>
          Ofertas selecionadas para você.
        </p>

      </div>


      <div class="highlight-card tertiary">

        <span class="chip">
          Loja em alta
        </span>

        <h4>
          Vendedores com mais vendas
        </h4>

        <p>
          Confira os favoritos da semana.
        </p>

      </div>

    </div>


    <!-- =========================
         LANÇAMENTOS
    ========================== -->
    <div
      class="launch-banner"
      @click="goToSearch"
    >

      <div class="launch-copy">

        <span class="launch-tag">
          Últimos lançamentos
        </span>

        <h3>
          Novidades escolhidas para o seu closet
        </h3>

      </div>

      <button type="button">
        Ver coleção
      </button>

    </div>


    <!-- =========================
         PRODUTOS
    ========================== -->
    <div class="products">

      <h3>
        Para você
      </h3>


      <div class="grid">

        <div
          v-for="p in produtos"
          :key="p.id"
          class="card"
          @click="goToProduto(p.id)"
        >

          <img
            :src="formatMediaUrl(p.imagem_url)"
            :alt="p.nome"
          />

          <p class="name">
            {{ p.nome }}
          </p>

          <p class="price">
            R$ {{ p.preco }}
          </p>

        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>
.home {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px 80px;
}/* SEARCH BAR */
.search-bar {
  padding: 12px 0;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 320px; /* Tamanho base no mobile */
}

.search-input-wrapper input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 48px 12px 24px;
  border-radius: 30px; /* Formato pílula */
  border: 1px solid transparent;
  background: var(--surface-elevated); /* Fundo cinza moderno */
  font-size: 15px;
  color: var(--text-color);
  cursor: pointer; /* Mostra a mãozinha de clique */
  transition: all 0.2s ease-in-out;
}

/* Como é readonly na Home, o hover imita o focus da outra tela para dar interatividade */
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

.search-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
/* BANNER */
.hero-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  margin-bottom: 18px;
}

.banner {
  position: relative;
  padding: 0;
  margin: 0;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.18);
  min-height: 200px;
  height: 200px;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
}

.banner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.76) 0%, rgba(15, 23, 42, 0.42) 38%, rgba(15, 23, 42, 0.12) 100%);
}

.banner img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 38%;
  filter: saturate(1.05) contrast(1.04);
}

.banner-overlay {
  position: absolute;
  inset: auto 20px 18px 20px;
  z-index: 1;
  color: #fff;
  max-width: 420px;
}

.banner-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  backdrop-filter: blur(6px);
}

.banner-overlay h2 {
  margin-top: 8px;
  font-size: clamp(1.4rem, 4vw, 2.3rem);
  line-height: 1.05;
  font-weight: 800;
}

.banner-overlay p {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.88rem;
  line-height: 1.45;
}

.banner-overlay button {
  margin-top: 12px;
  background: #fff;
  color: var(--text-color);
  border: none;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease;
  font-size: 0.8rem;
}

.banner-overlay button:hover {
  transform: translateY(-1px);
}

/* CATEGORIAS */
.category-stack {
  display: grid;
  gap: 22px;
  margin-bottom: 26px;
}

.categories-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.categories-row.second-row {
  margin-top: 2px;
}

.category-card {
  position: relative;
  min-height: 170px;
  aspect-ratio: 1 / 1;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.category-card img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.18), rgba(15, 23, 42, 0.56));
}

.category-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-align: center;
  z-index: 1;
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 8px;
}

.category-arrow {
  font-size: 2rem;
  line-height: 1;
  transform: translateY(-1px);
}

.category-product-banner {
  position: relative;
  min-height: 150px;
  height: 150px;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  width: 100%;
  margin: 0;
}

.square-banner {
  min-height: 180px;
  height: 180px;
  border-radius: 24px;
}

.category-product-banner img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 150px;
  object-fit: cover;
  object-position: center;
}

.category-product-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.18));
}

.category-product-copy {
  position: absolute;
  inset: auto 18px 14px 18px;
  z-index: 1;
  color: #fff;
  max-width: 360px;
}

.category-product-tag {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.category-product-copy h3 {
  margin: 8px 0 10px;
  font-size: clamp(1rem, 3vw, 1.7rem);
  line-height: 1.1;
  font-weight: 800;
}

.category-product-copy button {
  border: none;
  border-radius: 999px;
  background: #fff;
  color: #111827;
  font-weight: 700;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 0.8rem;
}
.category-product-banner {
  position: relative;
  overflow: hidden;
}

.category-product-banner::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.45),
    rgba(0, 0, 0, 0.05) 60%,
    transparent
  );
  pointer-events: none;
}
.category-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.category-card img {
  transition: transform 0.5s ease;
}

.category-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 35px rgba(15, 23, 42, 0.14);
}

.category-card:hover img {
  transform: scale(1.05);
}

.category-arrow {
  transition: transform 0.3s ease;
}

.category-card:hover .category-arrow {
  transform: translateX(5px);
}
.shipping-strip {
  width: 100%;
  margin: 0 0 18px;
  background: linear-gradient(135deg, #f5c56b 0%, #f9d77d 100%);
  color: #1f2937;
  text-align: center;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.74rem;
  padding: 10px 14px;
  box-sizing: border-box;
  border-radius: 0;
}

.shipping-strip span {
  display: block;
  width: 100%;
}

.launch-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 26px 0 30px;
  padding: 20px 22px;
  border-radius: 22px;
  background: linear-gradient(135deg, #111827 0%, #2f2f3a 100%);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.launch-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.launch-tag {
  display: inline-flex;
  align-self: flex-start;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.launch-copy h3 {
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  font-weight: 800;
  line-height: 1.2;
}

.launch-banner button {
  flex-shrink: 0;
  border: none;
  border-radius: 999px;
  background: #fff;
  color: #111827;
  font-weight: 700;
  padding: 10px 16px;
  cursor: pointer;
}

.highlights {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-top: 24px;
  margin-bottom: 12px;
}

.highlight-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 18px 16px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
}

.highlight-card.primary {
  background: linear-gradient(135deg, #111827 0%, #374151 100%);
  color: #fff;
}

.highlight-card.secondary {
  background: linear-gradient(135deg, #fef3c7 0%, #f5d0fe 100%);
  color: #1f2937;
}

.highlight-card.tertiary {
  background: linear-gradient(135deg, #ecfeff 0%, #dbeafe 100%);
  color: #0f172a;
}

.chip {
  display: inline-flex;
  align-self: flex-start;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.highlight-card h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.2;
}

.highlight-card p {
  margin: 0;
  font-size: 0.82rem;
  opacity: 0.85;
}

/* PRODUTOS */
.products {
  padding: 12px 0;
}

.products h3 {
  font-size: 18px;
  margin-bottom: 14px;
  color: var(--text-color);
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

/* CARD */
.card {
  background: var(--surface-bg);
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
  color: var(--text-color);
}@media (min-width: 768px) {

  .home {
    padding: 0 28px 70px;
  }

  /* BUSCA */
  .search-bar {
    margin-bottom: 28px;
  }

  /* BANNER 1 */
  .hero-layout {
    margin-bottom: 30px;
  }

  .square-banner {
    min-height: 320px;
    height: 320px;
  }

  .category-product-banner img {
    min-height: 320px;
  }


  /* FRETE */
  .shipping-strip {
    margin-bottom: 32px;
  }


  /* CATEGORIAS */
  .category-stack {
    gap: 16px;
    margin-bottom: 38px;
  }

  .categories-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 15px;
  }

  .category-card {
    min-height: 250px;
    height: 310px;
    aspect-ratio: 1 / 1;
    border-radius: 18px;
  }

  .category-label {
    font-size: 1.5rem;
  }

  .category-arrow {
    font-size: 1.8rem;
  }


  /* BANNER 2 */
  .banner {
    min-height: 280px;
    height: 280px;
    margin-bottom: 36px;
  }

  .banner img {
    min-height: 280px;
  }

  .banner-overlay {
    inset: auto auto 30px 32px;
  }

  .banner-overlay h2 {
    font-size: 2.3rem;
  }


  /* DESTAQUES */
  .highlights {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
    margin-bottom: 38px;
  }


  /* LANÇAMENTOS */
  .launch-banner {
    padding: 26px 30px;
    margin: 0 0 40px;
  }


  /* PRODUTOS */
  .products {
    padding-top: 0;
  }

  .products h3 {
    font-size: 22px;
    margin-bottom: 22px;
  }

  .grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 20px;
  }

  .card {
    padding: 8px;
    border-radius: 14px;
  }

  .card img {
    border-radius: 10px;
  }

  .name {
    font-size: 12px;
    margin-top: 7px;
  }

  .price {
    font-size: 13px;
    margin-top: 2px;
  }
}
/* =========================================================
   TEXT REVEAL SYSTEM
========================================================= */


/* -------------------------
   CLIP REVEAL
------------------------- */

.reveal-clip {
  display: block;
  overflow: hidden;
}


.reveal-clip > * {
  transform: translateY(110%);

  opacity: 0;

  transition:
    transform 0.9s cubic-bezier(.22, 1, .36, 1),
    opacity 0.5s ease;
}


[data-reveal].is-visible
.reveal-clip > * {

  transform: translateY(0);

  opacity: 1;
}


/* -------------------------
   STAGGER DO TEXTO
------------------------- */

.main-hero
.reveal-clip:nth-child(1) > * {

  transition-delay: 0.10s;
}


.main-hero
.reveal-clip:nth-child(2) > * {

  transition-delay: 0.25s;
}


.main-hero
.reveal-clip:nth-child(3) > * {

  transition-delay: 0.40s;
}


/* =========================================================
   ELEMENTOS PRINCIPAIS
========================================================= */

[data-reveal="search"] {

  opacity: 0;

  transform: translateY(-15px);

  transition:
    opacity 0.7s ease,
    transform 0.8s cubic-bezier(.22, 1, .36, 1);
}


[data-reveal="search"].is-visible {

  opacity: 1;

  transform: translateY(0);
}


/* =========================================================
   HERO
========================================================= */

.main-hero {

  opacity: 0;

  transform: scale(0.98);

  transition:
    opacity 0.9s ease,
    transform 1.1s cubic-bezier(.22, 1, .36, 1);
}


.main-hero.is-visible {

  opacity: 1;

  transform: scale(1);
}


/* =========================================================
   IMAGEM DO HERO
========================================================= */

.main-hero img {

  transition:
    transform 1.5s cubic-bezier(.22, 1, .36, 1);
}


.main-hero.is-visible img {

  transform: scale(1.03);
}


/* =========================================================
   SHIMMER
========================================================= */

.main-hero::before,
.secondary-banner::before {

  content: "";

  position: absolute;

  top: 0;
  left: -120%;

  width: 55%;
  height: 100%;

  z-index: 3;

  pointer-events: none;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.12),
      transparent
    );

  transform: skewX(-18deg);
}


.main-hero.is-visible::before,
.secondary-banner.is-visible::before {

  animation:
    banner-shimmer 1.4s
    cubic-bezier(.22, 1, .36, 1)
    0.4s forwards;
}


@keyframes banner-shimmer {

  from {
    left: -120%;
  }

  to {
    left: 140%;
  }

}


/* =========================================================
   FRETE
========================================================= */

[data-reveal="fade"] {

  opacity: 0;

  transform: translateY(15px);

  transition:
    opacity 0.7s ease,
    transform 0.7s cubic-bezier(.22, 1, .36, 1);
}


[data-reveal="fade"].is-visible {

  opacity: 1;

  transform: translateY(0);
}


/* =========================================================
   CATEGORIAS
========================================================= */

[data-reveal="category"] {

  opacity: 0;

  transform:
    translateY(35px)
    scale(0.97);

  transition:
    opacity 0.7s ease var(--delay),
    transform 0.8s cubic-bezier(.22, 1, .36, 1) var(--delay);
}


[data-reveal="category"].is-visible {

  opacity: 1;

  transform:
    translateY(0)
    scale(1);
}


/* =========================================================
   CATEGORIA — HOVER
========================================================= */

.category-card {

  transition:
    transform 0.45s cubic-bezier(.22, 1, .36, 1),
    box-shadow 0.45s ease;
}


.category-card img {

  transition:
    transform 0.8s cubic-bezier(.22, 1, .36, 1);
}


.category-card:hover {

  transform:
    translateY(-5px);
}


.category-card:hover img {

  transform:
    scale(1.045);
}


.category-arrow {

  transition:
    transform 0.4s cubic-bezier(.22, 1, .36, 1);
}


.category-card:hover
.category-arrow {

  transform:
    translateX(7px);
}


/* =========================================================
   BANNER 2 — WIPE
========================================================= */

[data-reveal="banner"] {

  opacity: 0;

  clip-path:
    inset(
      0 100% 0 0
      round 18px
    );

  transition:
    opacity 0.5s ease,
    clip-path 1.15s cubic-bezier(.7, 0, .2, 1);
}


[data-reveal="banner"].is-visible {

  opacity: 1;

  clip-path:
    inset(
      0 0 0 0
      round 18px
    );
}


/* imagem do banner */

.secondary-banner img {

  transition:
    transform 1.4s cubic-bezier(.22, 1, .36, 1);
}


.secondary-banner.is-visible img {

  transform:
    scale(1.035);
}


/* =========================================================
   BANNER 2 — TEXTO
========================================================= */

.secondary-banner
.reveal-clip:nth-child(1) > * {

  transition-delay: 0.25s;
}


.secondary-banner
.reveal-clip:nth-child(2) > * {

  transition-delay: 0.40s;
}


.secondary-banner
.reveal-clip:nth-child(3) > * {

  transition-delay: 0.55s;
}


.secondary-banner
.reveal-clip:nth-child(4) > * {

  transition-delay: 0.70s;
}


/* =========================================================
   HIGHLIGHTS
========================================================= */

[data-reveal="highlights"] {

  opacity: 0;

  transform: translateY(40px);

  transition:
    opacity 0.8s ease,
    transform 0.9s cubic-bezier(.22, 1, .36, 1);
}


[data-reveal="highlights"].is-visible {

  opacity: 1;

  transform: translateY(0);
}


/* =========================================================
   LAUNCH BANNER
========================================================= */

[data-reveal="launch"] {

  opacity: 0;

  transform:
    translateY(30px)
    scale(0.985);

  transition:
    opacity 0.8s ease,
    transform 0.9s cubic-bezier(.22, 1, .36, 1);
}


[data-reveal="launch"].is-visible {

  opacity: 1;

  transform:
    translateY(0)
    scale(1);
}


/* texto do lançamento */

[data-reveal="launch"]
.reveal-clip:nth-child(1) > * {

  transition-delay: 0.15s;
}


[data-reveal="launch"]
.reveal-clip:nth-child(2) > * {

  transition-delay: 0.30s;
}


/* =========================================================
   PRODUTOS
========================================================= */

[data-reveal="products"] {

  opacity: 0;

  transform: translateY(35px);

  transition:
    opacity 0.8s ease,
    transform 0.9s cubic-bezier(.22, 1, .36, 1);
}


[data-reveal="products"].is-visible {

  opacity: 1;

  transform: translateY(0);
}


/* produtos individuais */

[data-reveal="product"] {

  opacity: 0;

  transform:
    translateY(30px);

  transition:
    opacity 0.7s ease var(--delay),
    transform 0.8s cubic-bezier(.22, 1, .36, 1) var(--delay);
}


[data-reveal="product"].is-visible {

  opacity: 1;

  transform:
    translateY(0);
}


/* =========================================================
   PRODUTO — HOVER
========================================================= */

.product-image-wrap {

  overflow: hidden;
}


.product-image-wrap img {

  transition:
    transform 0.7s cubic-bezier(.22, 1, .36, 1);
}


.product-card:hover
.product-image-wrap img {

  transform:
    scale(1.035);
}


/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

  [data-reveal],
  [data-reveal] *,
  .reveal-clip > *,
  .category-card,
  .category-card img,
  .product-card,
  .product-image-wrap img {

    opacity: 1 !important;

    transform: none !important;

    clip-path: none !important;

    transition: none !important;

    animation: none !important;
  }

}
/* =========================================================
   CARROSSEL PROMOCIONAL
========================================================= */

.promo-carousel {
  position: relative;

  width: 100%;
  height: 52px;

  margin: 0 0 28px;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  background: var(--surface-elevated);

  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);

  color: var(--text-color);
}


/* ÁREA DO TEXTO */

.promo-viewport {
  position: relative;

  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
}


/* TEXTO */

.promo-message {
  position: absolute;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;

  padding: 0 70px;

  box-sizing: border-box;

  text-align: center;

  font-size: 0.76rem;
  font-weight: 800;

  letter-spacing: 0.08em;

  text-transform: uppercase;

  white-space: nowrap;
}


/* =========================================================
   SETAS
========================================================= */

.promo-arrow {
  position: absolute;

  top: 50%;

  transform: translateY(-50%);

  z-index: 5;

  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  background: transparent;

  color: var(--text-color);

  font-size: 25px;
  line-height: 1;

  cursor: pointer;

  opacity: 0;

  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}


.promo-carousel:hover .promo-arrow {
  opacity: 0.7;
}


.promo-arrow:hover {
  opacity: 1 !important;
}


.promo-prev {
  left: 18px;
}


.promo-next {
  right: 18px;
}


.promo-prev:hover {
  transform:
    translateY(-50%)
    translateX(-3px);
}


.promo-next:hover {
  transform:
    translateY(-50%)
    translateX(3px);
}


/* =========================================================
   DOTS
========================================================= */

.promo-dots {
  position: absolute;

  bottom: 5px;
  left: 50%;

  transform: translateX(-50%);

  display: flex;

  gap: 5px;

  z-index: 5;
}


.promo-dot {
  width: 5px;
  height: 5px;

  padding: 0;

  border: none;

  border-radius: 50%;

  background: var(--text-muted);

  opacity: 0.35;

  cursor: pointer;

  transition:
    width 0.3s ease,
    opacity 0.3s ease,
    transform 0.3s ease;
}


.promo-dot.active {
  width: 16px;

  border-radius: 999px;

  opacity: 0.8;
}
/* =========================================================
   CARROSSEL PROMOCIONAL
========================================================= */

.promo-carousel {
  position: relative;
  width: 100%;
  height: 54px;

  margin: 0 0 28px;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  background: #f5c56b;
  color: #171717;

  border-radius: 12px;

  box-shadow:
    0 8px 20px rgba(245, 197, 107, 0.22);
}


/* ÁREA DO TEXTO */

.promo-viewport {
  position: relative;

  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
}


.promo-message {
  position: absolute;

  width: 100%;

  padding: 0 70px;

  box-sizing: border-box;

  text-align: center;

  font-size: 0.76rem;
  font-weight: 800;

  letter-spacing: 0.07em;

  text-transform: uppercase;

  white-space: nowrap;
}


/* =========================================================
   SETAS
========================================================= */

.promo-arrow {
  position: absolute;

  top: 50%;
  transform: translateY(-50%);

  z-index: 5;

  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;
  background: transparent;

  color: #171717;

  font-size: 26px;
  line-height: 1;

  cursor: pointer;

  opacity: 0.55;

  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}


.promo-arrow:hover {
  opacity: 1;
}


.promo-prev {
  left: 14px;
}


.promo-next {
  right: 14px;
}


.promo-prev:hover {
  transform:
    translateY(-50%)
    translateX(-3px);
}


.promo-next:hover {
  transform:
    translateY(-50%)
    translateX(3px);
}


/* =========================================================
   INDICADORES
========================================================= */

.promo-dots {
  position: absolute;

  left: 50%;
  bottom: 4px;

  transform: translateX(-50%);

  display: flex;
  align-items: center;

  gap: 5px;

  z-index: 6;
}


.promo-dot {
  width: 5px;
  height: 5px;

  padding: 0;

  border: 0;
  border-radius: 999px;

  background: #171717;

  opacity: 0.28;

  cursor: pointer;

  transition:
    width 0.3s ease,
    opacity 0.3s ease;
}


.promo-dot.active {
  width: 15px;
  opacity: 0.75;
}


/* =========================================================
   TRANSIÇÃO
========================================================= */

.promo-slide-enter-active,
.promo-slide-leave-active {
  transition:
    transform 0.6s cubic-bezier(.22, 1, .36, 1),
    opacity 0.4s ease;
}


.promo-slide-enter-from {
  opacity: 0;
  transform: translateY(100%);
}


.promo-slide-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}


.promo-slide-enter-to,
.promo-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 767px) {

  .promo-carousel {
    height: 48px;
    margin-bottom: 22px;
    border-radius: 10px;
  }

  .promo-message {
    padding: 0 42px;

    font-size: 0.63rem;

    letter-spacing: 0.045em;
  }

  .promo-arrow {
    width: 24px;
    height: 24px;

    font-size: 21px;

    opacity: 0.65;
  }

  .promo-prev {
    left: 7px;
  }

  .promo-next {
    right: 7px;
  }

  .promo-dots {
    bottom: 3px;
  }
}

</style>
