<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable vue/block-lang -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '../../api/authApi'
import { getStoredToken, persistToken } from '../../api/config'

const password = ref('')
const showPassword = ref(false)
const email = ref('')
const isLogin = ref(false)
const router = useRouter()

onMounted(() => {
  email.value = localStorage.getItem('email') || ''
  isLogin.value = localStorage.getItem('isLogin') === 'true'

  if (!email.value) {
    router.push('/auth/email')
  }
})

async function login() {
  if (!password.value) return

  try {
    if (!isLogin.value) {
      router.push('/auth/register')
      return
    }

    const res = await authApi.login(email.value, password.value)

    const token =
      res.data?.access ||
      res.data?.token ||
      res.data?.access_token ||
      res.data?.jwt ||
      res.data?.authToken

    if (token) {
      persistToken(token)
    }

    const userData = await authApi.fetchUserProfile()
    const existingUser = JSON.parse(localStorage.getItem('user') || '{}')

    const mergedUser = {
      ...existingUser,
      ...userData,
      email: userData.email || email.value,
    }
    const existingUserId =
      existingUser?.id ??
      existingUser?.user_id ??
      userData?.id ??
      userData?.user_id ??
      ''

    localStorage.setItem('user', JSON.stringify(mergedUser))
    localStorage.setItem('email', email.value)
    localStorage.setItem('user_email', String(email.value || '').trim().toLowerCase())
    localStorage.setItem('user_id', String(existingUserId))

    try {
      const storedToken =
        token ||
        res.data?.token ||
        res.data?.access ||
        res.data?.access_token ||
        getStoredToken()

      const candidateId =
        userData?.id ??
        existingUser?.user_id ??
        existingUser?.id ??
        res.data?.user_id ??
        res.data?.user?.id

      if (storedToken) {
        const serverUser = await authApi.fetchUserFromCandidates(
          storedToken,
          candidateId,
        )

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
    } catch (error) {
      console.error('Erro ao complementar os dados do usuário:', error)
    }

    router.push('/')
  } catch (err) {
    alert(
      'Erro ao autenticar: ' +
        (err?.response?.data?.message || 'Tente novamente'),
    )
  }
}

function togglePassword() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <!-- VOLTAR -->
      <button class="back" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <h1>
        {{ isLogin ? 'Entrar' : 'Criar senha' }}
      </h1>

      <p class="email">{{ email }}</p>

      <!-- INPUT SENHA -->
      <div class="input-group">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="Senha"
        />

        <span class="eye" @click="togglePassword">
          <!-- olho aberto -->
          <svg
            v-if="!showPassword"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>

          <!-- olho fechado -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.94"
            />
            <path d="M1 1l22 22" />
          </svg>
        </span>
      </div>

      <!-- BOTÃO -->
      <button class="main-button" :disabled="!password" @click="login">
        {{ isLogin ? 'Entrar' : 'Registrar' }}
      </button>

      <!-- ESQUECI -->
      <p
        v-if="isLogin"
        class="forgot"
        @click="router.push('/auth/forgot-password')"
      >
        Esqueceu sua senha?
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fb, #e8ecf5);
  font-family: 'Montserrat', sans-serif;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  padding: 28px;
  border-radius: 20px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 2px 10px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.back {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
}

.back:hover {
  background: #eaeaea;
}

.auth-card h1 {
  font-size: 22px;
  font-weight: 600;
  margin-top: 40px;
  margin-bottom: 2px;
}

.email {
  font-size: 13px;
  color: #777;
  margin-bottom: 10px;
  margin-top: 0;
}

.input-group {
  display: flex;
  align-items: center;
  position: relative;
}

.input-group input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  transition: 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}

.eye {
  position: absolute;
  right: 12px;
  cursor: pointer;
  font-size: 14px;
}

.eye svg {
  width: 20px;
  height: 20px;
}

.main-button {
  margin-top: 10px;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: #000;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}

.main-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
}

.main-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.main-button:active {
  transform: scale(0.98);
}

.forgot {
  text-align: center;
  font-size: 13px;
  color: #666;
  margin-top: 10px;
  cursor: pointer;
}
</style>
