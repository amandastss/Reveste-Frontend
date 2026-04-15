<!-- eslint-disable vue/block-lang -->
<script setup>
import { ref } from 'vue';
import authApi from '../../api/authApi';

const password = ref('');
const email = localStorage.getItem('email');

async function reset() {
  await authApi.resetPassword(email, password.value);
}
</script>

<template>
  <div class="container">
    <div class="card">
      <h2>Nova senha</h2>
      <input type="password" v-model="password" />
      <button @click="reset">Salvar</button>
    </div>
  </div>
</template>
