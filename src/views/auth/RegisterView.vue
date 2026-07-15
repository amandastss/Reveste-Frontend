<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '../../api/authApi'

const router = useRouter()

const name = ref('')
const email = ref(localStorage.getItem('email') || '')
const password = ref('')
const confirmPassword = ref('')
const birthdate = ref('')
const phone = ref('')

const photo = ref<File | null>(null)
const photoPreview = ref('')

const showSuccessModal = ref(false)

function handlePhotoChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null

  photo.value = file

  if (!file) {
    photoPreview.value = ''
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    photoPreview.value = reader.result as string
  }

  reader.readAsDataURL(file)
}

async function register() {
  if (
    !name.value ||
    !email.value ||
    !phone.value ||
    !birthdate.value ||
    !password.value ||
    !confirmPassword.value
  ) {
    alert('Preencha todos os campos.')
    return
  }

  if (password.value.length < 8) {
    alert('A senha deve possuir pelo menos 8 caracteres.')
    return
  }

  if (password.value !== confirmPassword.value) {
    alert('As senhas não coincidem.')
    return
  }

  try {
    const response = await authApi.register(
      email.value,
      name.value,
      password.value,
      'buyer',
      phone.value,
      birthdate.value,
      photo.value ?? undefined,
      undefined
    )

    const responseData = response.data || {}

    const userData = {
      ...responseData,
      name: name.value,
      email: email.value,
      phone: phone.value,
      photo: photoPreview.value,
      date_of_birth: birthdate.value,
    }

    localStorage.setItem('email', email.value)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isLogin', 'true')

    const token =
      typeof responseData.token === 'string'
        ? responseData.token
        : undefined

    if (token) {
      localStorage.setItem('token', token)
    }

    // Exibe o overlay de sucesso
    showSuccessModal.value = true

    setTimeout(() => {
      if (token) {
        router.push('/profile')
      } else {
        router.push('/auth/password')
      }
    }, 2000)
  } catch (err: unknown) {
    console.error(err)

    if (err instanceof Error) {
      alert('Erro: ' + err.message)
    } else {
      alert('Erro ao criar conta.')
    }
  }
}
</script>

<template>
  <div class="register-wrapper">

    <!-- Overlay de sucesso -->
    <div
      v-if="showSuccessModal"
      class="success-overlay"
    >
      <div class="success-card">
        <span class="material-symbols-outlined success-icon">
          check_circle
        </span>

        <h2>Conta criada!</h2>

        <p>
          Sua conta foi criada com sucesso.
          <br>
          Redirecionando...
        </p>
      </div>
    </div>

    <div class="register-card">
      <h1>Criar conta</h1>

      <input
        v-model="name"
        placeholder="Nome completo"
      />

      <input
        v-model="email"
        type="email"
        placeholder="Email"
      />

      <div class="field-row">
        <div class="field-group">
          <label>Telefone</label>

          <input
            v-model="phone"
            type="tel"
            placeholder="(xx) xxxxx-xxxx"
          />
        </div>

        <div class="field-group">
          <label>Data de nascimento</label>

          <input
            v-model="birthdate"
            type="date"
          />
        </div>
      </div>

      <div class="photo-field">
        <label>Foto de perfil</label>

        <input
          type="file"
          accept="image/*"
          @change="handlePhotoChange"
        />

        <div
          v-if="photoPreview"
          class="photo-preview"
        >
          <img
            :src="photoPreview"
            alt="Prévia da foto"
          />
        </div>
      </div>

      <input
        v-model="password"
        type="password"
        placeholder="Senha"
      />

      <input
        v-model="confirmPassword"
        type="password"
        placeholder="Confirmar senha"
      />

      <p
        v-if="confirmPassword && password !== confirmPassword"
        class="error-message"
      >
        As senhas não coincidem.
      </p>

      <button @click="register">
        Criar conta
      </button>
    </div>

  </div>
</template>

<style scoped>
/* BACKGROUND */
.register-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fb, #e8ecf5);
  font-family: "Montserrat", sans-serif;
}

/* CARD */
.register-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  padding: 28px;
  border-radius: 20px;

  /* SOMBRA */
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 2px 10px rgba(0, 0, 0, 0.04);

  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* TITLE */
.register-card h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 10px;
}

/* INPUTS */
input {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  transition: 0.2s;
}

/* FOCUS */
input:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}

/* ROW */
.field-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.field-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group label {
  font-size: 12px;
  color: #666;
}
.error-message {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 6px;
}
/* FOTO */
.photo-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.photo-preview {
  width: 110px;
  height: 110px;
  border-radius: 20px;
  overflow: hidden;

  border: 2px solid #eee;

  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* BUTTON */
button {
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

/* HOVER */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
}

/* CLICK */
button:active {
  transform: scale(0.98);
}
.success-message {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #81c784;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  text-align: center;
  font-size: 0.95rem;
}

.error-message {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: -6px;
  margin-bottom: 12px;
}
/* ===========================
   OVERLAY
=========================== */

.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 9999;

  animation: fadeIn 0.25s ease;
}

.success-card {
  width: min(420px, 90%);
  background: #fff;
  border-radius: 20px;
  padding: 36px 28px;
  text-align: center;

  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.18);

  animation: popUp 0.3s ease;
}

.success-icon {
  font-size: 72px;
  color: #000000;
  margin-bottom: 16px;
}

.success-card h2 {
  margin: 0 0 12px;
  font-size: 1.8rem;
  color: #222;
}

.success-card p {
  margin: 0;
  color: #666;
  line-height: 1.6;
  font-size: 1rem;
}

/* ===========================
   MENSAGEM DE ERRO
=========================== */

.error-message {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: -8px;
  margin-bottom: 14px;
  text-align: left;
}

/* ===========================
   ANIMAÇÕES
=========================== */

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes popUp {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
