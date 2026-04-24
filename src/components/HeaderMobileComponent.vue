<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

/* emit para abrir o menu lateral */
const emit = defineEmits(['open-menu'])

interface MenuItem {
  aria: string
  icon: string
  route: string
}

/*
removemos o route do menu,
porque agora ele abre o sidebar
e não navega para /menu
*/
const items: MenuItem[] = [
  { aria: 'Notificações', icon: 'notifications', route: '/notificacoes' },
  { aria: 'Carrinho', icon: 'shopping_cart', route: '/carrinho' },
]

/* abrir sidebar */
function openMenu() {
  emit('open-menu')
}

/* navegação normal */
function handleClick(item: MenuItem) {
  router.push(item.route)
}

/* voltar para home */
function goHome() {
  router.push('/')
}
</script>

<template>
  <header class="header-mobile">
    <!-- lado esquerdo -->
    <div class="left">
      <button
        class="headermobile-button"
        @click="openMenu"
      >
        <span class="material-symbols-outlined1">
          menu
        </span>
      </button>
    </div>

    <!-- título -->
    <button
      class="title-button"
      @click="goHome"
    >
      ReVeste
    </button>

    <!-- lado direito -->
    <div class="right">
      <button
        v-for="(item, index) in items"
        :key="index"
        class="headermobile-button"
        @click="handleClick(item)"
      >
        <span class="material-symbols-outlined">
          {{ item.icon }}
        </span>
      </button>
    </div>
  </header>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');

/* =========================
   HEADER MOBILE
========================= */
.header-mobile {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px;
  background: white;
  border-bottom: 1px solid #eee;

  position: relative;
}

/* =========================
   LADOS
========================= */
.left {
  display: flex;
}

.right {
  display: flex;
  gap: 10px;
}

/* =========================
   LOGO / TÍTULO
========================= */
.title-button {
  all: unset;
  cursor: pointer;

  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  font-family: "Playfair Display", serif;
  font-size: 35px;
  font-weight: 540;
  color: black;

  transition: opacity 0.2s ease,
              letter-spacing 0.2s ease;
}

.title-button:hover {
  opacity: 0.7;
  letter-spacing: 1px;
}

/* =========================
   BOTÕES
========================= */
.headermobile-button {
  background: transparent;
  border: none;
  cursor: pointer;

  padding: 4px 0 0 15px;
}

/* =========================
   ÍCONES
========================= */
.material-symbols-outlined {
  font-size: 20px;
  color: black;
}

.material-symbols-outlined1 {
  font-size: 24px;
  color: black;
}

/* =========================
   DESKTOP
========================= */
@media (min-width: 768px) {
  .header-mobile {
    display: none;
  }
}
</style>