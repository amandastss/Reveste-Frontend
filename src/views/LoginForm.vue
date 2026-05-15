<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')

async function login() {

  try {

    // chamada da API
    console.log(email.value)
    console.log(password.value)

  } catch (err) {
    console.log(err)
  }

}
</script>
<template>
  <div class="container">

    <h1>Entrar</h1>

    <form @submit.prevent="login">

      <input
        type="email"
        v-model="email"
        placeholder="Email"
      />

      <input
        type="password"
        v-model="password"
        placeholder="Senha"
      />

      <button type="submit">
        Entrar
      </button>

    </form>

  </div>
</template>

