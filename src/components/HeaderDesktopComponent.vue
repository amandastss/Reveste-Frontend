<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navItems = [
  { aria: 'Home', icon: 'home', route: '/' },
  { aria: 'Vender', icon: 'add', route: '/sell' },
];

const rightItems = [
  { aria: 'Notificações', icon: 'notifications', route: '/notificacoes' },
  { aria: 'Carrinho', icon: 'shopping_cart', route: '/carrinho' },
  { aria: 'Perfil', icon: 'person', route: '/perfil' },
];

function handleNavClick(item) {
  router.push(item.route);
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

