<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const categorias = [
  { label: 'Informações do pedido', route: '/suporte/categoria' },
  { label: 'Pagamento e segurança', route: '/suporte/categoria' },
  { label: 'Compras e entregas', route: '/suporte/categoria' },
  { label: 'Produto e garantia', route: '/suporte/categoria' },
]

function goTo(route: string) {
  router.push(route)
}
</script>

<template>
  <div class="suporte">

    <div class="header">
      <img src="/suporte.png" />
      <h1>Como podemos<br>te ajudar?</h1>
    </div>

    <div class="card">
      <p class="titulo">Eu preciso de ajuda:</p>

      <div
        v-for="(item, index) in categorias"
        :key="index"
        class="item"
        @click="goTo(item.route)"
      >
        <span>{{ item.label }}</span>
        <span class="material-symbols-outlined">chevron_right</span>
      </div>
    </div>

    <div class="bottom">
      <button class="ligue">
        <span class="material-symbols-outlined">call</span>
        LIGUE
      </button>

      <button class="chat">
        <span class="material-symbols-outlined">chat</span>
        CHAT
      </button>
    </div>

  </div>
</template>

<style scoped>
.suporte {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  font-family: "Montserrat", sans-serif;
}

.header {
  position: relative;
}

.header img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.header h1 {
  position: absolute;
  bottom: 20px;
  left: 16px;
  color: white;
  font-size: 22px;
  font-weight: 600;
}

.card {
  background: white;
  margin-top: -20px;
  border-radius: 20px 20px 0 0;
  padding: 16px;
}

.titulo {
  font-size: 14px;
  color: #777;
  margin-bottom: 10px;
}

.item {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.bottom {
  margin-top: auto;
  display: flex;
  gap: 10px;
  padding: 16px;
}

.ligue, .chat {
  flex: 1;
  border-radius: 25px;
  padding: 12px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.ligue {
  background: white;
  border: 1px solid #ccc;
}

.chat {
  background: black;
  color: white;
}
</style>