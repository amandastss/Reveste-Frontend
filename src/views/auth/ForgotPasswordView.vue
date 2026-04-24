<!-- eslint-disable vue/block-lang -->
<script setup>
import { useRouter } from 'vue-router';
import authApi from '../../api/authApi';

const router = useRouter();
const email = localStorage.getItem('email');

async function send() {
  try {
    await authApi.requestPasswordReset(email);
    router.push('/auth/verify');
  } catch {
    alert('Erro ao enviar código');
  }
}
</script>

<template>
  <div class="container">
    <div class="card">
      <h2>Recuperar senha</h2>
      <button @click="send">Enviar código</button>
    </div>
  </div>
</template>
