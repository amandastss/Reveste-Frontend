<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();

interface FooterItem {
  aria: string;
  icon: string;
  route: string;
}

const showMenu = ref(false);

const items: FooterItem[] = [
  { aria: 'Home', icon: 'home', route: '/' },
  { aria: 'Mais', icon: 'add', route: '' },
  { aria: 'Perfil', icon: 'person', route: '/profile' },
];

function handleClick(item: FooterItem) {
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
  <footer class="app-footer">
    
    <!-- MENU QUE ABRE -->
    <div v-if="showMenu" class="floating-menu">
      <button class="sell-button" @click="goToSell">
        Vender
      </button>
    </div>

    <!-- NAV PRINCIPAL -->
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

/* NAV */
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

.material-symbols-outlined {
  font-size: 22px;
  color: #000;
}

/* MENU QUE SOBE */
.floating-menu {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  animation: fadeUp 0.2s ease;
}

.sell-button {
  background: black;
  color: white;
  border: none;
  padding: 12px 22px;
  border-radius: 24px;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* animaçãozinha pq a gente é chique */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* esconder no desktop */
@media (min-width: 768px) {
  .app-footer {
    display: none;
  }
}
</style>