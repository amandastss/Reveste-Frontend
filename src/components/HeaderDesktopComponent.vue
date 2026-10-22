<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { API_BASE } from '@/api/config'

const router = useRouter()
const showMenu = ref(false)
const showCategoriesMenu = ref(false)
const categorias = ref<Array<{ id: number; nome?: string; name?: string; title?: string }>>([])

interface NavItem {
  aria: string
  icon: string
  route: string
}

const navItems: NavItem[] = [{ aria: 'Home', icon: 'home', route: '/' }]

const rightItems: NavItem[] = [
  { aria: 'Notificações', icon: 'notifications', route: '/notificacoes' },
  { aria: 'Carrinho', icon: 'shopping_cart', route: '/carrinho' },
  { aria: 'Perfil', icon: 'person', route: '/profile' },
]

const searchNavItem: NavItem = {
  aria: 'Pesquisar',
  icon: 'search',
  route: '/search',
}

function handleNavClick(item: NavItem) {
  router.push(item.route)
  showMenu.value = false
}

async function fetchCategorias() {
  try {
    const res = await axios.get(`${API_BASE}/api/categorias/`)
    categorias.value = Array.isArray(res.data) ? res.data : res.data.results || []
  } catch (error) {
    console.error('Erro ao buscar categorias do header:', error)
    categorias.value = []
  }
}

function goToSell() {
  router.push('/sell')
  showMenu.value = false
  showCategoriesMenu.value = false
}

function toggleCategoriesMenu() {
  showCategoriesMenu.value = !showCategoriesMenu.value
}

function goToCategory(categoryId: number) {
  router.push({ name: 'categoria', params: { id: String(categoryId) } })
  showMenu.value = false
  showCategoriesMenu.value = false
}

onMounted(() => {
  fetchCategorias()
})
</script>

<template>
  <header class="header-desktop">
    <div class="header-inner">
      <!-- MENU -->
      <div v-if="showMenu" class="floating-menu">
        <div class="floating-menu-actions">
          <button class="category-button" @click="toggleCategoriesMenu">
            <span class="material-symbols-outlined">category</span>
            <span>Categorias</span>
          </button>
          <button class="sell-button" @click="goToSell">Vender</button>
        </div>

        <div v-if="showCategoriesMenu && categorias.length" class="categories-panel">
          <button
            v-for="item in categorias"
            :key="item.id"
            class="category-option"
            @click="goToCategory(item.id)"
          >
            {{ item.nome || item.name || item.title }}
          </button>
        </div>
      </div>

      <!-- ESQUERDA -->
      <nav class="nav-left">
        <button
          v-for="(item, index) in navItems"
          :key="index"
          class="nav-button home-button"
          :aria-label="item.aria"
          @click="handleNavClick(item)"
        >
          <span class="material-symbols-outlined home-icon">{{ item.icon }}</span>
        </button>
      </nav>

      <div v-if="!showMenu" class="header-actions">
        <button class="category-button header-category-button" @click="toggleCategoriesMenu">
          <span class="material-symbols-outlined">category</span>
          <span>Categorias</span>
        </button>
        <button class="sell-button header-sell-button" @click="goToSell">Vender</button>
      </div>

      <div
        v-if="showCategoriesMenu && categorias.length"
        class="categories-panel header-categories-panel"
      >
        <button
          v-for="item in categorias"
          :key="item.id"
          class="category-option"
          @click="goToCategory(item.id)"
        >
          {{ item.nome || item.name || item.title }}
        </button>
      </div>

      <!-- DIREITA -->
      <div class="right">
        <button
          class="headerdesktop-button search-button"
          :aria-label="searchNavItem.aria"
          @click="handleNavClick(searchNavItem)"
        >
          <span class="material-symbols-outlined">{{ searchNavItem.icon }}</span>
        </button>

        <button
          v-for="(item, index) in rightItems"
          :key="index"
          class="headerdesktop-button"
          :aria-label="item.aria"
          @click="handleNavClick(item)"
        >
          <span class="material-symbols-outlined">{{ item.icon }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* HEADER */
.header-desktop {
  width: 100%;
  background: var(--surface-bg);
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

/* CONTAINER CENTRAL */
.header-inner {
  width: 100%;
  padding: 12px 5%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0;
  position: relative;
}

/* MENU */
.floating-menu {
  position: absolute;
  top: 60px;
  left: 80px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeDown 0.2s ease;
}

.floating-menu-actions,
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 0;
  margin-right: 0;
}

.category-button,
.sell-button,
.category-option {
  font-family: 'Montserrat', sans-serif;
}

.category-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 8px 14px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
}

.header-category-button,
.header-sell-button {
  white-space: nowrap;
}

.sell-button {
  background: var(--accent);
  color: var(--surface-bg);
  border: none;
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.categories-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 8px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
  min-width: 220px;
}

.header-categories-panel {
  position: absolute;
  top: 70px;
  left: 110px;
  z-index: 20;
}

.category-option {
  border: none;
  background: transparent;
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--text-color);
  cursor: pointer;
  transition: 0.2s ease;
}

.category-option:hover {
  background: rgba(15, 23, 42, 0.04);
}

/* ANIMAÇÃO */
@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* NAV ESQUERDA */
.nav-left {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 0;
  flex-shrink: 0;
}

/* BOTÕES */
.nav-button {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: 10px;
  transition: 0.2s;
}

.nav-button:hover {
  background: rgba(15, 23, 42, 0.06);
}

.home-button {
  width: 42px;
  height: 42px;
  padding: 0;
}

.home-icon {
  font-size: 30px;
  line-height: 1;
}

.nav-text {
  display: none;
}

/* BUSCA */
.search-container {
  flex: 1;
  max-width: 400px;

  display: flex;
  align-items: center;

  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 8px 16px;
  background: var(--surface-elevated);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
}

.search-button {
  background: transparent;
  border: none;
  cursor: pointer;
}

/* DIREITA */
.right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.search-button {
  margin-right: 0;
}

.headerdesktop-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: 0.2s;
}

.headerdesktop-button:hover {
  background: rgba(15, 23, 42, 0.06);
}

/* ÍCONES */
.material-symbols-outlined {
  font-size: 24px;
  color: var(--text-color);
}

@media (max-width: 767px) {
  .header-desktop {
    display: none;
  }
}
</style>
