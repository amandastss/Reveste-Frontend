<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

interface FooterItem {
  aria: string;
  icon: string;
  route: string;
}

const items: FooterItem[] = [
  { aria: 'Home', icon: 'home', route: '/' },
  { aria: 'Vender', icon: 'add', route: '/vender' },
  { aria: 'Perfil', icon: 'person', route: '/perfil' },
];

function handleClick(item: FooterItem) {
  router.push(item.route);
}
</script>

<template>
  <footer class="app-footer">
    <div class="footer-nav">

      <button
        v-for="(item, index) in items"
        :key="index"
        class="footer-button"
        :aria-label="item.aria"
        @click="handleClick(item)"
      >
        <span class="material-symbols-outlined">
          {{ item.icon }}
        </span>
      </button>

    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e5e5e5;
  padding: 12px;
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.05);
}

.footer-nav {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.footer-button {
  background: transparent;
  border: none;
  padding: 10px;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.footer-button:active {
  background: rgba(0, 0, 0, 0.08);
}

/* Ícones */
.material-symbols-outlined {
  font-size: 26px;
  color: #000;
}

/* espaço pro footer */
body {
  padding-bottom: 70px;
}
@media (min-width: 768px) {
  .app-footer {
    display: none;
  }
}
</style>