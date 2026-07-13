<!-- eslint-disable vue/block-lang -->
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '../../api/authApi'

import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import reveste from '@/assets/reveste.png'

const email = ref('')
const router = useRouter()

const isValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))

function goHome() {
  router.push('/')
}

async function next() {
  if (!isValid.value) return

  localStorage.setItem('email', email.value)

  try {
    const response = await authApi.checkEmail(email.value)
    const emailExists = response.data.exists

    localStorage.setItem('isLogin', emailExists ? 'true' : 'false')
    router.push(emailExists ? '/auth/password' : '/auth/register')
  } catch (err) {
    console.error('Erro ao verificar email:', err)
    const existingUser = JSON.parse(localStorage.getItem('user') || '{}')
    const emailKnown =
      existingUser.email && existingUser.email.toLowerCase() === email.value.toLowerCase()
    localStorage.setItem('isLogin', emailKnown ? 'true' : 'false')
    router.push(emailKnown ? '/auth/password' : '/auth/register')
  }
}
</script>
<template>
  <div class="screen">
    <div class="desktop-layout">
      <div class="branding">
        <img :src="reveste" class="reveste" />
        <p>Seu brechó digital</p>
      </div>

      <div class="form-wrapper">
        <div class="form-content">
          <div class="back" @click="goHome">←</div>

          <h1 class="title">
            Insira seu email para<br />
            entrar ou se cadastrar:
          </h1>

          <div class="input">
            <span class="icon">
              <font-awesome-icon :icon="faEnvelope" />
            </span>

            <input v-model="email" type="email" placeholder="seu e-mail" />
          </div>

          <button class="button" :class="{ active: isValid }" :disabled="!isValid" @click="next">
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.screen {
  height: 100vh;
  background: white;
  max-width: 390px;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: 'Montserrat', sans-serif;
}
.back {
  font-size: 20px;
  color: var(--text-color);
  margin-bottom: 24px;
  cursor: pointer;
}
.title {
  font-size: 26px;
  font-weight: 500;
  line-height: 1.35;
  color: var(--text-color);
  margin-bottom: 40px;
}
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
  color: var(--text-color);
}
.input input::placeholder {
  color: #bdbdbd;
}
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
.button.active,
.button.login {
  background: #000;
  color: #fff;
}
.button.register {
  background: var(--surface-bg);
  color: var(--text-color);
  border: 1px solid #000;
}
.choice-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.choice-box p {
  margin-bottom: 8px;
  color: var(--text-color);
}
.social {
  text-align: center;
  margin-bottom: 10px;
}
.social p {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 18px;
}
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
}
.fb {
  background: #1877f2;
}
.google {
  background: #ea4335;
}
.apple {
  background: #000;
}

.reveste {
  width: 100%;
  max-width: 120px;
  height: auto;
  display: block;
  margin: 0 0 0;
}

.branding {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 20px;
}

/* DESKTOP LOGO */
@media (min-width: 1024px) {
  .reveste {
    max-width: 600px;
    margin-bottom: 24px;
  }
}

/* TABLET E DESKTOP */
@media (min-width: 768px) {
  .screen {
    max-width: 100%;
    margin: 0;
    padding: 40px 24px;
  }
}

/* DESKTOP GRANDE */
@media (min-width: 1024px) {
  body {
    background: #f5f5f5;
  }

  .screen {
    padding: 60px 20px;
  }
}

/* DESKTOP */
@media (min-width: 1024px) {
  .screen {
    max-width: 100%;
    margin: 0;
    padding: 0;
    height: 100vh;
  }

  .desktop-layout {
    display: flex;
    height: 100%;
  }

  /* lado esquerdo (branding) */
  .branding {
    flex: 1;
    background: #ffffff;
    color: rgb(0, 0, 0);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }

  .branding p {
    font-size: 28px;
    opacity: 0.9;
  }

  /* lado direito (form) */
  .form-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #000000;
  }

  /* card */
  .form-wrapper > div {
    width: 100%;
    max-width: 400px;
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
}
</style>
