<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable vue/block-lang -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '../../api/authApi'

const password = ref('')
const showPassword = ref(false)
const router = useRouter()

if (!email) {
  router.push('/auth/email')
}

async function login() {
  if (!password.value) return

  try {
    // tenta logar
    const res = await authApi.login(email, password.value)

    localStorage.setItem('user', JSON.stringify(res))

    router.push('/home')

  } catch (e) {
    try {
      // se falhar, cria conta
      const res = await authApi.register(email, password.value)

      localStorage.setItem('user', JSON.stringify(res))

      router.push('/home')

    } catch (err) {
      alert('Erro ao autenticar')
    }
  }
}

function togglePassword() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="screen">

    <div>
      <!-- VOLTAR -->
      <div class="back" @click="router.back()">←</div>

      <!-- TÍTULO -->
      <h1 class="title">Insira a sua senha!</h1>
      <p class="email">{{ email }}</p>

      <!-- INPUT -->
      <div class="input">
        <span class="icon">🔒</span>

        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="Senha"
        />

        <span class="eye" @click="togglePassword">
          {{ showPassword ? '🙈' : '👁' }}
        </span>
      </div>

      <!-- BOTÃO -->
      <button
        class="button"
        :class="{ active: password.length > 0 }"
        :disabled="!password"
        @click="login"
      >
        ENTRAR
      </button>

      <!-- ESQUECI -->
      <p class="forgot" @click="router.push('/auth/forgot')">
        ESQUECEU DA SUA SENHA?
      </p>
    </div>

  </div>
</template>

<style scoped>
.screen {
  height: 100vh;
  background: #f7f7f7;
  max-width: 390px;
  margin: 0 auto;
  padding: 24px 20px;
  font-family: 'Inter', sans-serif;
}

/* VOLTAR */
.back {
  font-size: 20px;
  margin-bottom: 24px;
  cursor: pointer;
}

/* TEXTO */
.title {
  font-size: 26px;
  margin-bottom: 8px;
}

.email {
  font-size: 14px;
  color: #888;
  margin-bottom: 30px;
}

/* INPUT */
.input {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
  gap: 10px;
  margin-bottom: 30px;
}

.icon {
  color: #999;
}

.input input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
}

.eye {
  cursor: pointer;
}

/* BOTÃO */
.button {
  width: 100%;
  height: 50px;
  border-radius: 30px;
  border: none;
  background: #eaeaea;
  color: #aaa;
  font-weight: bold;
}

.button.active {
  background: black;
  color: white;
}

/* ESQUECI */
.forgot {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  letter-spacing: 1px;
  cursor: pointer;
}
</style>
