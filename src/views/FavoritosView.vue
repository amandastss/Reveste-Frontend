<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

interface ProdutoFavorito {
  id: number
  nome: string
  descricao?: string
  preco: number
  marca?: string
  condicao?: string
  imagem_url?: string | null
}

const router = useRouter()

const favoritos = ref<ProdutoFavorito[]>([])

const isEmpty = computed(() => favoritos.value.length === 0)

function carregarFavoritos() {
  const favoritosSalvos = localStorage.getItem('favoritos')

  if (!favoritosSalvos) {
    favoritos.value = []
    return
  }

  try {
    favoritos.value = JSON.parse(favoritosSalvos)
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error)
    favoritos.value = []
  }
}

function removerFavorito(id: number) {
  favoritos.value = favoritos.value.filter((produto) => produto.id !== id)

  localStorage.setItem('favoritos', JSON.stringify(favoritos.value))
}

function abrirProduto(id: number) {
  router.push(`/produto/${id}`)
}

function continuarComprando() {
  router.push('/')
}

function voltar() {
  router.back()
}

function formatarPreco(preco: number) {
  return Number(preco).toFixed(2).replace('.', ',')
}

function getImagem(produto: ProdutoFavorito) {
  if (!produto.imagem_url) {
    return 'https://via.placeholder.com/500x650?text=Sem+imagem'
  }

  if (produto.imagem_url.startsWith('http')) {
    return produto.imagem_url
  }

  return `${import.meta.env.VITE_API_URL}/api${produto.imagem_url}`
}

onMounted(() => {
  carregarFavoritos()
})
</script>

<template>
  <div class="favoritos-page">
    <div class="favoritos-container">
      <header class="favoritos-header">
        <button class="back-btn" aria-label="Voltar" @click="voltar">
          <span class="material-symbols-outlined"> arrow_back </span>
        </button>

        <div class="header-content">
          <h1>Favoritos</h1>

          <p>
            {{ favoritos.length }}
            {{ favoritos.length === 1 ? 'peça salva' : 'peças salvas' }}
          </p>
        </div>
      </header>

      <main class="favoritos-content">
        <section v-if="isEmpty" class="empty-favorites">
          <div class="empty-content">
            <div class="empty-icon">
              <span class="material-symbols-outlined"> favorite_border </span>
            </div>

            <div class="empty-text">
              <span class="empty-label"> SUA SELEÇÃO </span>

              <h2>Seus favoritos estão vazios</h2>

              <p>
                Encontre peças que combinam com você e salve seus achados favoritos para
                encontrá-los novamente.
              </p>

              <button class="explore-btn" @click="continuarComprando">
                EXPLORAR PEÇAS

                <span class="material-symbols-outlined"> arrow_forward </span>
              </button>
            </div>
          </div>
        </section>

        <section v-else class="favorites-grid">
          <article v-for="produto in favoritos" :key="produto.id" class="favorite-card">
            <div class="product-image-wrapper">
              <button class="image-area" @click="abrirProduto(produto.id)">
                <img :src="getImagem(produto)" :alt="produto.nome" />
              </button>

              <button
                class="favorite-remove-btn"
                aria-label="Remover dos favoritos"
                @click="removerFavorito(produto.id)"
              >
                <span class="material-symbols-outlined"> favorite </span>
              </button>

              <span class="unique-badge"> Peça única </span>
            </div>

            <div class="card-info">
              <div class="product-header">
                <p v-if="produto.marca" class="brand">
                  {{ produto.marca }}
                </p>

                <h2>
                  {{ produto.nome }}
                </h2>
              </div>

              <p v-if="produto.condicao" class="condition">
                {{ produto.condicao }}
              </p>

              <div class="card-bottom">
                <strong class="price"> R$ {{ formatarPreco(produto.preco) }} </strong>

                <button class="view-product-btn" @click="abrirProduto(produto.id)">VER PEÇA</button>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   PÁGINA
======================================== */

.favoritos-page {
  width: 100%;
  min-height: 100vh;

  background: var(--app-bg);
  color: var(--text-color);

  padding: 56px 48px 100px;

  box-sizing: border-box;
}

.favoritos-container {
  width: 100%;
  max-width: 1400px;

  margin: 0 auto;
}

/* ========================================
   HEADER DESKTOP
======================================== */

.favoritos-header {
  position: relative;

  width: 100%;
  min-height: 110px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 60px;

  border-bottom: 1px solid var(--border-color);
}

/* ========================================
   BOTÃO VOLTAR
======================================== */

.back-btn {
  position: absolute;

  left: 0;
  top: 50%;

  transform: translateY(-50%);

  width: 48px;
  height: 48px;

  padding: 0;

  border: none;

  background: transparent;
  color: var(--text-color);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition:
    opacity 0.2s ease,
    background 0.2s ease;
}

.back-btn:hover {
  opacity: 0.6;
}

.back-btn span {
  font-size: 28px;
}

/* ========================================
   TÍTULO
======================================== */

.header-content {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
  pointer-events: none;
}

.header-content h1,
.header-content p {
  position: relative;
}

.header-content h1 {
  margin: 0;

  color: var(--text-color);

  font-family: inherit;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 500;
  line-height: 1.1;

  letter-spacing: 0;

  white-space: nowrap;
}

.header-content p {
  margin: 10px 0 0;

  font-family: inherit;
  font-size: 13px;

  letter-spacing: 0.3px;

  opacity: 0.55;
}

/* ========================================
   CONTEÚDO
======================================== */

.favoritos-content {
  width: 100%;
}

/* ========================================
   ESTADO VAZIO
======================================== */

.empty-favorites {
  width: 100%;

  min-height: 500px;

  display: flex;
  align-items: center;
  justify-content: center;
}

/*
  Layout horizontal pensado para desktop
*/

.empty-content {
  width: 100%;
  max-width: 820px;

  display: grid;
  grid-template-columns: 180px 1fr;

  align-items: center;

  gap: 70px;
}

/* ========================================
   ÍCONE
======================================== */

.empty-icon {
  width: 160px;
  height: 160px;

  border-radius: 50%;

  background: var(--surface-elevated);

  display: flex;
  align-items: center;
  justify-content: center;

  transition: transform 0.3s ease;
}

.empty-icon:hover {
  transform: scale(1.05);
}

.empty-icon span {
  font-size: 62px;
}

/* ========================================
   TEXTO ESTADO VAZIO
======================================== */

.empty-text {
  text-align: left;
}

.empty-label {
  display: block;

  margin-bottom: 14px;

  font-size: 11px;
  font-weight: 700;

  letter-spacing: 1.8px;

  opacity: 0.45;
}

.empty-text h2 {
  margin: 0 0 16px;

  font-family: inherit;
  font-size: clamp(28px, 3vw, 38px);
  font-weight: 500;

  line-height: 1.2;

  letter-spacing: -0.6px;
}

.empty-text p {
  max-width: 500px;

  margin: 0 0 30px;

  font-family: inherit;
  font-size: 16px;

  line-height: 1.7;

  opacity: 0.6;
}

/* ========================================
   BOTÃO EXPLORAR
======================================== */

.explore-btn {
  min-width: 210px;

  padding: 15px 20px;

  border: none;
  border-radius: 4px;

  background: #000;
  color: #fff;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 10px;

  font-family: inherit;
  font-size: 11px;
  font-weight: 700;

  letter-spacing: 1px;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.explore-btn span {
  font-size: 17px;

  transition: transform 0.2s ease;
}

.explore-btn:hover {
  opacity: 0.85;
  transform: translateY(-2px);
}

.explore-btn:hover span {
  transform: translateX(3px);
}

/* ========================================
   GRID DE FAVORITOS
======================================== */

.favorites-grid {
  width: 100%;

  display: grid;

  grid-template-columns: repeat(4, minmax(0, 1fr));

  gap: 32px 24px;
}

/* ========================================
   CARD
======================================== */

.favorite-card {
  min-width: 0;

  background: transparent;

  transition: transform 0.25s ease;
}

.favorite-card:hover {
  transform: translateY(-5px);
}

/* ========================================
   ÁREA DA IMAGEM
======================================== */

.product-image-wrapper {
  position: relative;

  width: 100%;

  overflow: hidden;

  background: var(--surface-elevated);
}

.image-area {
  width: 100%;
  aspect-ratio: 3 / 4;

  padding: 0;

  border: none;

  background: transparent;

  display: block;

  cursor: pointer;

  overflow: hidden;
}

.image-area img {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;

  transition: transform 0.5s ease;
}

.favorite-card:hover .image-area img {
  transform: scale(1.04);
}

/* ========================================
   BOTÃO CORAÇÃO
======================================== */

.favorite-remove-btn {
  position: absolute;

  top: 14px;
  right: 14px;

  width: 42px;
  height: 42px;

  padding: 0;

  border: none;
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.92);
  color: #111;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.favorite-remove-btn:hover {
  transform: scale(1.08);
}

.favorite-remove-btn span {
  font-size: 21px;
}

/* ========================================
   BADGE
======================================== */

.unique-badge {
  position: absolute;

  left: 14px;
  bottom: 14px;

  padding: 7px 11px;

  background: rgba(255, 255, 255, 0.92);
  color: #111;

  font-family: inherit;
  font-size: 10px;
  font-weight: 600;

  letter-spacing: 0.3px;
}

/* ========================================
   INFORMAÇÕES DO PRODUTO
======================================== */

.card-info {
  padding: 17px 2px 0;
}

.product-header {
  min-width: 0;
}

.brand {
  margin: 0 0 5px;

  font-family: inherit;
  font-size: 10px;
  font-weight: 700;

  letter-spacing: 0.9px;

  text-transform: uppercase;

  opacity: 0.5;
}

.card-info h2 {
  margin: 0;

  overflow: hidden;

  font-family: inherit;
  font-size: 17px;
  font-weight: 500;

  line-height: 1.4;

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ========================================
   CONDIÇÃO
======================================== */

.condition {
  margin: 8px 0 0;

  font-family: inherit;
  font-size: 12px;

  opacity: 0.5;
}

/* ========================================
   PARTE INFERIOR DO CARD
======================================== */

.card-bottom {
  margin-top: 14px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 14px;
}

.price {
  font-family: inherit;
  font-size: 17px;
  font-weight: 700;

  white-space: nowrap;
}

/* ========================================
   BOTÃO VER PEÇA
======================================== */

.view-product-btn {
  padding: 9px 14px;

  border: none;

  background: transparent;
  color: var(--text-color);

  font-family: inherit;
  font-size: 10px;
  font-weight: 700;

  letter-spacing: 0.8px;

  cursor: pointer;

  opacity: 0.65;

  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.view-product-btn:hover {
  opacity: 1;
  transform: translateX(3px);
}

/* ========================================
   DESKTOP MÉDIO
======================================== */

@media (max-width: 1200px) {
  .favoritos-page {
    padding-left: 36px;
    padding-right: 36px;
  }

  .favorites-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* ========================================
   TABLET
======================================== */

@media (max-width: 900px) {
  .favoritos-page {
    padding: 40px 28px 100px;
  }

  .favoritos-header {
    margin-bottom: 45px;
  }

  .empty-content {
    max-width: 650px;

    grid-template-columns: 130px 1fr;

    gap: 45px;
  }

  .empty-icon {
    width: 130px;
    height: 130px;
  }

  .empty-icon span {
    font-size: 50px;
  }

  .favorites-grid {
    gap: 28px 18px;
  }
}

/* ========================================
   MOBILE
   Aqui sim o layout passa a ficar vertical
======================================== */

@media (max-width: 700px) {
  .favoritos-page {
    padding: 24px 18px 100px;
  }

  .favoritos-header {
    min-height: 72px;

    margin-bottom: 32px;
  }

  .back-btn {
    width: 42px;
    height: 42px;
  }

  .header-content h1 {
    font-size: 28px;
  }

  .empty-favorites {
    min-height: 450px;
  }

  .empty-content {
    display: flex;
    flex-direction: column;

    align-items: center;

    gap: 25px;

    text-align: center;
  }

  .empty-icon {
    width: 90px;
    height: 90px;
  }

  .empty-icon span {
    font-size: 38px;
  }

  .empty-text {
    text-align: center;
  }

  .empty-text h2 {
    font-size: 25px;
  }

  .empty-text p {
    font-size: 14px;
  }

  .favorites-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    gap: 24px 14px;
  }

  .card-info h2 {
    font-size: 15px;
  }

  .price {
    font-size: 15px;
  }

  .view-product-btn {
    display: none;
  }

  .favorite-remove-btn {
    width: 36px;
    height: 36px;

    top: 10px;
    right: 10px;
  }
}

/* ========================================
   CELULAR PEQUENO
======================================== */

@media (max-width: 420px) {
  .favoritos-page {
    padding-left: 12px;
    padding-right: 12px;
  }

  .header-content h1 {
    font-size: 26px;
  }

  .header-content p {
    font-size: 11px;
  }

  .empty-text h2 {
    font-size: 22px;
  }

  .empty-text p {
    font-size: 13px;
  }

  .explore-btn {
    width: 100%;
    max-width: 250px;
  }

  .card-bottom {
    margin-top: 10px;
  }

  .condition {
    font-size: 10px;
  }

  .price {
    font-size: 14px;
  }
}
</style>
