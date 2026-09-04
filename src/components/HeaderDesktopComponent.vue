<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();
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
  { aria: 'Perfil', icon: 'person', route: '/profile' },
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

</script>

<template>
  <header class="header-desktop">

    <div class="header-inner">

      <!-- MENU -->
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
/* HEADER */
.header-desktop {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 20;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.03);
}

/* CONTAINER CENTRAL */
.header-inner {
  width: min(1280px, calc(100% - 32px));
  margin: 0 auto;
  padding: 14px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  position: relative;
}

/* MENU */
.floating-menu {
  position: absolute;
  top: 60px;
  left: 0;
  animation: fadeDown 0.2s ease;
}

.sell-button {
  background: var(--accent);
  color: var(--surface-bg);
  border: none;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
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
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 999px;
  transition: 0.2s;
}

.nav-button:hover {
  background: rgba(15, 23, 42, 0.04);
  transform: translateY(-1px);
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
  gap: 12px;
}

.headerdesktop-button {
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
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
  background: rgba(15, 23, 42, 0.04);
  transform: translateY(-1px);
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
