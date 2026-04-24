<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const items = [
  { aria: 'Menu', icon: 'menu', route: '/menu' },
  { aria: 'Notificações', icon: 'notifications', route: '/notificacoes' },
  { aria: 'Carrinho', icon: 'shopping_cart', route: '/carrinho' },
];

function handleClick(item: typeof items[number]) {
  router.push(item.route);
}
</script>

<template>
  <header class="header-mobile">

    <div class="left">
      <button
        class="headermobile-button"
        @click="handleClick(items[0]!)"
      >
        <span class="material-symbols-outlined">
          {{ items[0]?.icon }}
        </span>
      </button>
    </div>

    <h1 class="title">ReVeste</h1>

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
  position: absolute;
  font-family: 'Times New Roman', Times, serif;
  left: 50%;
  transform: translateX(-50%);
  font-size: 35px;
  font-weight: 540;
  color: black;
}


.headermobile-button {
  background: transparent;
  border: none;
  cursor: pointer;
}

.material-symbols-outlined {
  font-size: 24px;
  color: black;
}


@media (min-width: 768px) {
  .header-mobile {
    display: none;
  }
}
</style>
