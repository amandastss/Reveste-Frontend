<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const email = ref(localStorage.getItem('email') || '')
const password = ref('')

function register() {
  if (!name.value || !email.value || !password.value) {
    alert('Preencha todos os campos')
    return
  }

  // Aqui você pode chamar a API de registro
  alert('Conta criada com sucesso!')
  router.push('/home')
}
</script>

<template>
  <div class="register">
    <h1>Criar conta</h1>
    <input v-model="name" placeholder="Nome completo" />
    <input v-model="email" placeholder="Email" type="email" />
    <input v-model="password" placeholder="Senha" type="password" />
    <button @click="register">Registrar</button>
  </div>
</template>

<style scoped>
.register {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
