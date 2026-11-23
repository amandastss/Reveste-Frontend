<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import { formatCurrencyBRL } from '@/utils/currency'

const router = useRouter()

const favoritesStore = useFavoritesStore()

const favoritos = computed(() => favoritesStore.items)

const quantidadeFavoritos = computed(() => {
  return favoritesStore.items.length
})

const formatMediaUrl = (url?: string | null) => {
  if (!url) return '/default.png'

  return url.startsWith('http')
    ? url
    : `${import.meta.env.VITE_API_URL}${url}`
}

function removerFavorito(id: number) {
  favoritesStore.removeFavorite(id)
}

function goToProduto(id: number) {
  router.push({
    name: 'produto-detalhe',
    params: { id },
  })
}

function goToSearch() {
  router.push({
    name: 'search',
  })
}

function goBack() {
  router.back()
}

onMounted(() => {
  favoritesStore.loadFavorites()
})
</script>

<template>
  <div class="favorites-page">

    <!-- HEADER -->

    <header class="favorites-header">
      <button
        class="back-button"
        type="button"
        aria-label="Voltar ao perfil"
        @click="goBack"
      >
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <div>
        <p class="eyebrow">Minha conta</p>
        <h1>Meus favoritos</h1>
      </div>
    </header>


    <!-- ESTADO VAZIO -->

    <div
      v-if="favoritos.length === 0"
      class="empty-state"
    >

      <div class="empty-icon">

        <span class="material-symbols-outlined">
          favorite_border
        </span>

      </div>

      <h2>
        Ainda não tem favoritos
      </h2>

      <p>
        Salve as peças que você ama para
        encontrá-las facilmente depois.
      </p>

      <button
        class="explore-btn"
        @click="goToSearch"
      >

        Explorar produtos

        <span class="material-symbols-outlined">
          arrow_forward
        </span>

      </button>

    </div>


    <!-- LISTA DE FAVORITOS -->

    <main
      v-else
      class="favorites-content"
    >

      <div class="favorites-grid">

        <article
          v-for="produto in favoritos"
          :key="produto.id"
          class="favorite-card"
        >

          <!-- IMAGEM -->

          <div
            class="product-image"
            @click="goToProduto(produto.id)"
          >

            <img
              :src="formatMediaUrl(produto.imagem_url)"
              :alt="produto.nome"
            />

            <!-- BOTÃO REMOVER -->

            <button
              class="favorite-btn active"
              @click.stop="removerFavorito(produto.id)"
              aria-label="Remover dos favoritos"
            >

              <span class="material-symbols-outlined">
                favorite
              </span>

            </button>

          </div>


          <!-- INFORMAÇÕES -->

          <div
            class="product-info"
            @click="goToProduto(produto.id)"
          >

            <h3>
              {{ produto.nome }}
            </h3>

            <p class="price">{{ formatCurrencyBRL(produto.preco) }}</p>

          </div>

        </article>

      </div>

    </main>

  </div>
</template>


<style scoped>

/* =========================================
   PÁGINA
========================================= */

.favorites-page {
  width: 100%;
  min-height: 100vh;

  background: var(--surface-elevated);

  font-family: 'Montserrat', sans-serif;

  box-sizing: border-box;
}


/* =========================================
   HEADER
========================================= */

.favorites-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px 14px;
  background: var(--surface-bg);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 30px;
}

.back-button {
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 50%;
  background: var(--app-bg);
  color: var(--text-color);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.eyebrow {
  margin: 0 0 2px;
  color: var(--text-muted);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.favorites-header h1 {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
}

.favorites-content,
.empty-state {
  padding-inline: 18px;
}


/* =========================================
   GRID
========================================= */

.favorites-grid {
  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 16px;
}


/* =========================================
   CARD
========================================= */

.favorite-card {
  min-width: 0;

  cursor: pointer;
}

.product-image {
  position: relative;

  width: 100%;

  aspect-ratio: 1 / 1;

  overflow: hidden;

  border-radius: 16px;

  background: var(--surface-elevated);
}

.product-image img {
  width: 100%;
  height: 100%;

  object-fit: cover;

  display: block;

  transition: transform 0.3s ease;
}


/* =========================================
   BOTÃO FAVORITO
========================================= */

.favorite-btn {
  position: absolute;

  top: 10px;
  right: 10px;

  width: 38px;
  height: 38px;

  border: none;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  background: rgba(255, 255, 255, 0.92);

  color: var(--text-color);

  transition: transform 0.2s ease;
}

.favorite-btn:active {
  transform: scale(0.88);
}

.favorite-btn .material-symbols-outlined {
  font-size: 20px;
}


/* =========================================
   INFO PRODUTO
========================================= */

.product-info {
  padding: 9px 4px 4px;
}

.product-info h3 {
  margin: 0 0 4px;

  font-size: 13px;

  font-weight: 500;

  color: var(--text-color);

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;
}

.price {
  margin: 0;

  font-size: 14px;

  font-weight: 600;

  color: var(--text-color);
}


/* =========================================
   ESTADO VAZIO
========================================= */

.empty-state {
  min-height: 60vh;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  text-align: center;

  padding: 20px;
}

.empty-icon {
  width: 82px;
  height: 82px;

  border-radius: 50%;

  background: var(--surface-elevated);

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 20px;
}

.empty-icon .material-symbols-outlined {
  font-size: 38px;

  color: var(--text-color);
}

.empty-state h2 {
  margin: 0 0 10px;

  font-family: 'Playfair Display', serif;

  font-size: 25px;

  font-weight: 500;

  color: var(--text-color);
}

.empty-state p {
  max-width: 300px;

  margin: 0 0 24px;

  font-size: 13px;

  line-height: 1.6;

  color: var(--text-muted);
}


/* =========================================
   BOTÃO EXPLORAR
========================================= */

.explore-btn {
  display: flex;
  align-items: center;

  gap: 8px;

  padding: 12px 20px;

  border: none;

  border-radius: 30px;

  background: var(--text-color);

  color: var(--surface-bg);

  font-family: inherit;

  font-size: 12px;

  cursor: pointer;

  transition: transform 0.2s ease;
}

.explore-btn:active {
  transform: scale(0.96);
}

.explore-btn .material-symbols-outlined {
  font-size: 18px;
}


/* =========================================
   DESKTOP
========================================= */

@media (min-width: 768px) {

  .favorites-page {
    padding: 0 0 60px;
  }

  .favorites-content {
    padding-inline: 40px;
  }

  .favorites-grid {
    grid-template-columns: repeat(4, 1fr);

    gap: 22px;
  }

  .product-image:hover img {
    transform: scale(1.04);
  }

  .favorite-btn:hover {
    transform: scale(1.08);
  }

}

</style>