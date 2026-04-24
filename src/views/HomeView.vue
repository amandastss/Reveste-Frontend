<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('email')
  router.push('/auth/email')
}
</script>

<template>
  <main>
    <div class="home">
      <h1>Bem-vindo ao ReVeste!</h1>
      <p v-if="user.email">Email: {{ user.email }}</p>

      <button @click="logout">Sair</button>
    </div>
  </main>
</template>

<style scoped>
.home {
  padding: 20px;
  text-align: center;
}
</style>
