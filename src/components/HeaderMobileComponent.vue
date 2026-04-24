<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

interface MenuItem {
  aria: string
  icon: string
  route: string
}

const items: MenuItem[] = [
  { aria: 'Menu', icon: 'menu', route: '/menu' },
  { aria: 'Notificações', icon: 'notifications', route: '/notificacoes' },
  { aria: 'Carrinho', icon: 'shopping_cart', route: '/carrinho' },
]

function handleClick(item: MenuItem) {
  router.push(item.route)
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <header class="header-mobile">
    <div class="left">
      <button class="headermobile-button" @click="handleClick(items[0]!)">
        <span class="material-symbols-outlined1">
          {{ items[0]!.icon }}
        </span>
      </button>
    </div>

    <button class="title-button" @click="goHome">ReVeste</button>

    <div class="right">
      <button
        v-for="(item, index) in items.slice(1)"
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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

.header-mobile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-bottom: 1px solid #eee;
  position: relative;
}

.left {
  display: flex;
}

.right {
  display: flex;
  gap: 10px;
}

.title {
  align-content: center;
  position: absolute;
  font-family: 'Playfair Display', serif;
  left: 50%;
  transform: translateX(-50%);
  font-size: 35px;
  font-weight: 540;
  color: black;
}

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

  transition: opacity 0.2s ease, letter-spacing 0.2s ease;
}

/* só hover */
.title-button:hover {
  opacity: 0.7;
  letter-spacing: 1px;
}

.headermobile-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 0 0 15px;
}

.material-symbols-outlined {
  font-size: 20px;
  color: black;
}

.material-symbols-outlined1 {
  font-size: 24px;
  color: black;
}

@media (min-width: 768px) {
  .header-mobile {
    display: none;
  }
}
</style>
