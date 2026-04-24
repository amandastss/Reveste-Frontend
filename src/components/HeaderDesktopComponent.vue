<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();
const searchQuery = ref('');
const showMenu = ref(false);

interface NavItem {
  aria: string;
  icon: string;
  route: string;
}

const navItems: NavItem[] = [
  { aria: 'Home', icon: 'home', route: '/' },
  { aria: '', icon: 'add', route: '' },
];

const rightItems: NavItem[] = [
  { aria: 'Notificações', icon: 'notifications', route: '/notificacoes' },
  { aria: 'Carrinho', icon: 'shopping_cart', route: '/carrinho' },
  { aria: 'Perfil', icon: 'person', route: '/perfil' },
];

function handleNavClick(item: NavItem) {
  if (item.icon === 'add') {
    showMenu.value = !showMenu.value;
  } else {
    router.push(item.route);
    showMenu.value = false;
  }
}

function goToSell() {
  router.push('/sell');
  showMenu.value = false;
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } });
  }
}
</script>

<template>
  <header class="header-desktop">
    
    <div class="header-inner">

      <!-- MENU FLUTUANTE -->
      <div v-if="showMenu" class="floating-menu">
        <button class="sell-button" @click="goToSell">
          Vender
        </button>
      </div>

      <!-- ESQUERDA -->
      <nav class="nav-left">
        <button
          v-for="(item, index) in navItems"
          :key="index"
          class="nav-button"
          :aria-label="item.aria"
          @click="handleNavClick(item)"
        >
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          <span class="nav-text">{{ item.aria }}</span>
        </button>
      </nav>

      <!-- CENTRO (BUSCA) -->
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Pesquisar..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button class="search-button" @click="handleSearch">
          <span class="material-symbols-outlined">search</span>
        </button>
      </div>

      <!-- DIREITA -->
      <div class="right">
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
/* HEADER FULL WIDTH */
.header-desktop {
  width: 100%;
  background: white;
  border-bottom: 1px solid #eee;
  position: relative;
}

/* CONTAINER CENTRAL */
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 24px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;

  position: relative;
}

/* MENU FLUTUANTE */
.floating-menu {
  position: absolute;
  top: 60px;
  left: 80px;
  animation: fadeDown 0.2s ease;
}

.sell-button {
  background: black;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
  gap: 12px;
}

/* BOTÕES */
.nav-button {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: 0.2s;
}

.nav-button:hover {
  background: rgba(0, 0, 0, 0.06);
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

/* BUSCA */
.search-container {
  flex: 1;
  max-width: 400px;

  display: flex;
  align-items: center;

  border: 1px solid #e5e5e5;
  border-radius: 24px;
  padding: 8px 16px;
  background: #f5f5f5;
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
  gap: 12px;
}

.headerdesktop-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: 0.2s;
}

.headerdesktop-button:hover {
  background: rgba(0, 0, 0, 0.06);
}

/* ÍCONES */
.material-symbols-outlined {
  font-size: 24px;
  color: black;
}

/* ESCONDER NO MOBILE */
@media (max-width: 767px) {
  .header-desktop {
    display: none;
  }
}
</style>