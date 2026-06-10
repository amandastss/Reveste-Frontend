<!-- eslint-disable vue/block-lang -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '../../api/authApi';

const router = useRouter();
const password = ref('');
const email = localStorage.getItem('email');
const code = localStorage.getItem('code');

async function reset() {
  try {
    if (!password.value) {
      alert('Insira uma nova senha');
      return;
    }
    await authApi.resetPassword(email, code, password.value);
    localStorage.removeItem('email');
    localStorage.removeItem('code');
    router.push('/auth/email');
  } catch {
    alert('Erro ao resetar senha');
  }
}
</script>

<template>
  <div class="container">
    <div class="card">
      <h2>Nova senha</h2>
      <input type="password" v-model="password" placeholder="Nova senha" />
      <button @click="reset">Salvar</button>
    </div>
  </div>
</template>
