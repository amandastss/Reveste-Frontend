<!-- eslint-disable vue/block-lang -->
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '../../api/authApi'

const email = ref('')
const router = useRouter()

const isValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
)

async function next() {
  if (!isValid.value) return

  await authApi.sendEmail(email.value)

  localStorage.setItem('email', email.value)

  router.push('/auth/password')
}
</script>

<template>
  <div class="screen">

    <!-- TOPO -->
    <div>
      <div class="back">←</div>

      <h1 class="title">
        Insira o seu email para<br />
        entrar ou se cadastrar
      </h1>

      <!-- INPUT -->
      <div class="input">
        <span class="icon">✉</span>
        <input
          v-model="email"
          type="email"
          placeholder="seu e-mail"
        />
      </div>

      <!-- BOTÃO -->
      <button
        class="button"
        :class="{ active: isValid }"
        :disabled="!isValid"
        @click="next"
      >
        CONTINUE
      </button>
    </div>

    <!-- SOCIAL -->
    <div class="social">
      <p>Ou continue com:</p>

      <div class="social-icons">
        <div class="circle fb">f</div>
        <div class="circle google">G</div>
        <div class="circle apple"></div>
      </div>
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: 'Inter', sans-serif;
}

/* TOPO */
.back {
  font-size: 20px;
  color: #000;
  margin-bottom: 24px;
  cursor: pointer;
}

/* TÍTULO */
.title {
  font-size: 26px;
  font-weight: 500;
  line-height: 1.35;
  color: #111;
  margin-bottom: 40px;
}

/* INPUT */
.input {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #dcdcdc;
  padding-bottom: 12px;
  margin-bottom: 30px;
}

.icon {
  font-size: 16px;
  color: #9e9e9e;
}

.input input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  flex: 1;
  color: #111;
}

.input input::placeholder {
  color: #bdbdbd;
}

/* BOTÃO */
.button {
  width: 100%;
  height: 52px;
  border-radius: 30px;
  border: none;
  background: #eaeaea;
  color: #bdbdbd;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  transition: 0.2s ease;
}

.button.active {
  background: #000;
  color: #fff;
}

/* SOCIAL */
.social {
  text-align: center;
  margin-bottom: 10px;
}

.social p {
  font-size: 14px;
  color: #555;
  margin-bottom: 18px;
}

/* ICONES */
.social-icons {
  display: flex;
  justify-content: center;
  gap: 18px;
}

.circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.fb { background: #1877f2; }
.google { background: #ea4335; }
.apple { background: #000; }
</style>
