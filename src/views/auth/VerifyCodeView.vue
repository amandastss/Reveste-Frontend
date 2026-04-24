<!-- eslint-disable vue/block-lang -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '../../api/authApi';

const router = useRouter();
const email = localStorage.getItem('email');

const code = ref(['', '', '', '']);

function update(index, event) {
  code.value[index] = event.target.value;
}

async function verify() {
  try {
    const finalCode = code.value.join('');
    await authApi.verifyCode(email, finalCode);
    localStorage.setItem('code', finalCode);
    router.push('/auth/reset');
  } catch {
    alert('Código inválido');
  }
}
</script>

<template>
  <div class="container">
    <div class="card">
      <h2>Código</h2>

      <div>
        <input v-for="(c, i) in code"
               :key="i"
               maxlength="1"
               @input="e => update(i, e)" />
      </div>

      <button @click="verify">Verificar</button>
    </div>
  </div>
</template>
