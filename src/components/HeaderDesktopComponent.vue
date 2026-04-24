<!-- eslint-disable vue/block-lang -->
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();
const searchQuery = ref('');

const navItems = [
  { aria: 'Home', icon: 'home', route: '/' },
  { aria: 'Vender', icon: 'add', route: '/vender' },
];

const rightItems = [
  { aria: 'Notificações', icon: 'notifications', route: '/notificacoes' },
  { aria: 'Carrinho', icon: 'shopping_cart', route: '/carrinho' },
  { aria: 'Perfil', icon: 'person', route: '/perfil' },
];

function handleNavClick(item: typeof navItems[number]) {
  router.push(item.route);
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } });
  }
}
</script>

<template>
  <header class="header-desktop">

    <div class="center">
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
    </div>

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

  </header>
</template>

<style scoped>
.header-desktop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #eee;
  gap: 40px;
}

.center {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 40px;
  justify-content: flex-start;
}

.nav-left {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.nav-button {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.nav-button:hover {
  background: rgba(0, 0, 0, 0.06);
}

.nav-button .material-symbols-outlined {
  font-size: 22px;
  color: #000;
}

.nav-text {
  font-size: 14px;
  color: #000;
  font-weight: 500;
}

.search-container {
  flex: 0 1 300px;
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
  font-size: 14px;
  color: #000;
}

.search-input::placeholder {
  color: #999;
}

.search-button {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

.search-button .material-symbols-outlined {
  font-size: 20px;
  color: #666;
}

.right {
  flex-shrink: 0;
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
  transition: background-color 0.2s;
}

.headerdesktop-button:hover {
  background: rgba(0, 0, 0, 0.06);
}

.headerdesktop-button:active {
  background: rgba(0, 0, 0, 0.12);
}

.material-symbols-outlined {
  font-size: 24px;
  color: black;
}

@media (max-width: 767px) {
  .header-desktop {
    display: none;
  }
}
</style>

