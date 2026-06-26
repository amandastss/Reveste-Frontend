<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable vue/block-lang -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '../../api/authApi'

const password = ref('')
const showPassword = ref(false)
const email = ref('')
const isLogin = ref(false)
const router = useRouter()

onMounted(() => {
  email.value = localStorage.getItem('email')
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

    // Login - email já existe
    const res = await authApi.login(email.value, password.value)
    const existingUser = JSON.parse(localStorage.getItem('user') || '{}')
    const currentEmail = email.value?.toLowerCase() || ''
    const storedEmail = existingUser.email?.toLowerCase() || ''

    // const mergedUser = storedEmail === currentEmail
    //   ? {
    //       ...existingUser,
    //       ...res.data,
    //       email: email.value,
    //       name: existingUser.name || res.data.name || res.data.username || res.data.first_name || undefined,
    //       phone: existingUser.phone || res.data.phone,
    //       photo: existingUser.photo || res.data.profile_image || res.data.photo || res.data.avatar || res.data.image,
    //       date_of_birth: existingUser.date_of_birth || res.data.date_of_birth || res.data.birthdate || res.data.birth_date,
    //     }
    //   : {
    //       ...res.data,
    //       email: email.value,
    //     }

    localStorage.setItem('user', JSON.stringify(res))
    if (res.data && res.data.access) {
      try {
        localStorage.setItem('token', res.data.access)
      } catch {}
    }
    localStorage.setItem('email', email.value)


    try {
      const token = res.data?.token || localStorage.getItem('token')
      const candidateId = res.data?.user_id || res.data?.user?.id || mergedUser.user_id || mergedUser.id
      if (token) {
        const serverUser = await authApi.fetchUserFromCandidates(token, candidateId)
        if (serverUser) {
          const enriched = {
            ...mergedUser,
            ...serverUser,
            photo: mergedUser.photo || serverUser.profile_image || serverUser.photo || serverUser.avatar || serverUser.image,
            date_of_birth: mergedUser.date_of_birth || serverUser.birth_date || serverUser.date_of_birth || serverUser.birthdate,
          }
          localStorage.setItem('user', JSON.stringify(enriched))
        }
      }
    } catch (e) {
      // ignore enrichment errors
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

    <div>
      <!-- VOLTAR -->
      <div class="back" @click="router.back()">←</div>

      <!-- TÍTULO -->
      <h1 class="title">{{ isLogin ? 'Insira a sua senha!' : 'Crie uma senha!' }}</h1>
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
        {{ isLogin ? 'ENTRAR' : 'REGISTRAR' }}
      </button>

      <!-- ESQUECI -->
      <p v-if="isLogin" class="forgot" @click="router.push('/auth/forgot')">
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
