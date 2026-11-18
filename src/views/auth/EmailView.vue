<!-- eslint-disable vue/block-lang -->
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '../../api/authApi'
import { getStoredToken, persistToken } from '../../api/config'

import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import reveste from '@/assets/reveste.png'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isPasswordStep = ref(false)
const router = useRouter()

const isValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))

function goHome() {
  if (isPasswordStep.value) {
    isPasswordStep.value = false
    password.value = ''
    return
  }

  router.push('/')
}

async function next() {
  if (isPasswordStep.value) {
    await login()
    return
  }

  if (!isValid.value) return

  localStorage.setItem('email', email.value)

  try {
    const response = await authApi.checkEmail(email.value)
    const emailExists = response.data.exists

    localStorage.setItem('isLogin', emailExists ? 'true' : 'false')
    if (emailExists) {
      isPasswordStep.value = true
    } else {
      router.push('/auth/register')
    }
  } catch (err) {
    console.error('Erro ao verificar email:', err)
    const existingUser = JSON.parse(localStorage.getItem('user') || '{}')
    const emailKnown =
      existingUser.email && existingUser.email.toLowerCase() === email.value.toLowerCase()
    localStorage.setItem('isLogin', emailKnown ? 'true' : 'false')
    if (emailKnown) {
      isPasswordStep.value = true
    } else {
      router.push('/auth/register')
    }
  }
}

async function login() {
  if (!password.value) return

  try {
    const res = await authApi.login(email.value, password.value)
    const token =
      res.data?.access ??
      res.data?.token ??
      res.data?.access_token ??
      res.data?.jwt ??
      res.data?.authToken
    if (token) {
      try {
        persistToken(token)
      } catch {}
    }
    const userData = await authApi.fetchUserProfile()
    const existingUser = JSON.parse(localStorage.getItem('user') || '{}')
    const existingUserId =
      existingUser?.id ?? existingUser?.user_id ?? userData?.id ?? userData?.user_id ?? ''

    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('email', email.value)
    localStorage.setItem('user_email', String(email.value || '').trim().toLowerCase())
    localStorage.setItem('user_id', String(existingUserId))

    try {
      const storedToken = res.data?.token || res.data?.access || res.data?.access_token || getStoredToken()
      const candidateId =
        userData?.id ??
        existingUser?.user_id ??
        existingUser?.id ??
        res.data?.user_id ??
        res.data?.user?.id
      if (storedToken) {
        const serverUser = await authApi.fetchUserFromCandidates(storedToken, candidateId)
        if (serverUser) {
          const enriched = {
            ...userData,
            ...serverUser,
            id: serverUser.id ?? userData.id ?? existingUserId,
            email: email.value,
            photo:
              userData.photo ||
              serverUser.profile_image ||
              serverUser.photo ||
              serverUser.avatar ||
              serverUser.image,
            date_of_birth:
              userData.date_of_birth ||
              serverUser.birth_date ||
              serverUser.date_of_birth ||
              serverUser.birthdate,
          }

          localStorage.setItem('user', JSON.stringify(enriched))
          localStorage.setItem('user_id', String(enriched.id ?? existingUserId))
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados adicionais do usuário:', err)
    }

    router.push('/')
  } catch (err) {
    alert('Erro ao autenticar: ' + (err.response?.data?.message || 'Tente novamente'))
  }
}

function togglePassword() {
  showPassword.value = !showPassword.value
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
          <button class="back" @click="goHome">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <h1 class="title">
            <template v-if="!isPasswordStep">
              Insira seu email para<br />
              entrar ou se cadastrar:
            </template>
            <template v-else>Digite sua senha para entrar:</template>
          </h1>

          <div v-if="!isPasswordStep" class="input">
            <span class="icon">
              <font-awesome-icon :icon="faEnvelope" />
            </span>

            <input
              v-model="email"
              type="email"
              placeholder="seu e-mail"
              autocomplete="email"
              @keyup.enter="next"
            />
          </div>

          <div v-else class="input">
            <span class="icon">
              <font-awesome-icon :icon="faLock" />
            </span>

            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="sua senha"
              autocomplete="current-password"
              @keyup.enter="next"
            />

            <button
              class="password-toggle"
              type="button"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="togglePassword"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>

          <button
            class="button"
            :class="{ active: isPasswordStep ? !!password : isValid }"
            :disabled="isPasswordStep ? !password : !isValid"
            @click="next"
          >
            {{ isPasswordStep ? 'ENTRAR' : 'CONTINUE' }}
          </button>

          <button
            v-if="isPasswordStep"
            class="forgot"
            type="button"
            @click="router.push('/auth/forgot-password')"
          >
            Esqueceu sua senha?
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
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
.password-toggle {
  border: 0;
  padding: 4px 0 4px 8px;
  background: transparent;
  color: #777;
  font-size: 12px;
  cursor: pointer;
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
.forgot {
  align-self: center;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
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
}

.branding {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
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
