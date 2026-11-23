<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '../../api/authApi'
import { persistToken } from '../../api/config'
import {
  faCalendar,
  faEnvelope,
  faLock,
  faPhone,
  faUser,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons'
import reveste from '@/assets/reveste.png'

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
const showPassword = ref(false)
const showConfirmPassword = ref(false)

function goBack() {
  router.push('/auth/email')
}

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
      undefined,
    )

    const responseData = response.data || {}
    const responsePayload = responseData as Record<string, unknown>

    const userData = {
      ...responseData,
      name: name.value,
      email: email.value,
      phone: phone.value,
      photo: photoPreview.value,
      date_of_birth: birthdate.value,
    }

    const userId = String(
      responsePayload.id ?? responsePayload.user_id ?? (userData as Record<string, unknown>).id ?? '',
    )

    localStorage.setItem('email', email.value)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('user_email', String(email.value || '').trim().toLowerCase())
    localStorage.setItem('user_id', userId)
    localStorage.setItem('isLogin', 'true')

    const token =
      typeof responseData.token === 'string'
        ? responseData.token
        : typeof responseData.access === 'string'
          ? responseData.access
          : typeof responseData.access_token === 'string'
            ? responseData.access_token
            : undefined

    if (token) {
      persistToken(token)
    }

    // Exibe o overlay de sucesso
    showSuccessModal.value = true

    setTimeout(() => {
      if (token) {
        router.push('/profile')
      } else {
        router.push({ path: '/auth/email', query: { step: 'password' } })
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
  <div class="screen">
    <!-- Overlay de sucesso -->
    <div v-if="showSuccessModal" class="success-overlay">
      <div class="success-card">
        <span class="material-symbols-outlined success-icon"> check_circle </span>

        <h2>Conta criada!</h2>

        <p>
          Sua conta foi criada com sucesso.
          <br />
          Redirecionando...
        </p>
      </div>
    </div>

    <div class="desktop-layout">
      <div class="branding">
        <img :src="reveste" class="reveste" alt="Reveste" />
        <p>Seu brechó digital</p>
      </div>

      <div class="form-wrapper">
        <form class="register-card" novalidate @submit.prevent="register">
          <button class="back" type="button" aria-label="Voltar para o e-mail" @click="goBack">
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

          <h1 class="title">Crie sua conta</h1>
          <p class="subtitle">Preencha seus dados para fazer parte da Reveste.</p>

          <label class="input">
            <span class="icon"><font-awesome-icon :icon="faUser" /></span>
            <input v-model="name" placeholder="Nome completo" autocomplete="name" />
          </label>

          <label class="input">
            <span class="icon"><font-awesome-icon :icon="faEnvelope" /></span>
            <input
              v-model="email"
              type="email"
              placeholder="Seu e-mail"
              autocomplete="email"
            />
          </label>

          <div class="field-row">
            <label class="input field-group">
              <span class="icon"><font-awesome-icon :icon="faPhone" /></span>
              <input v-model="phone" type="tel" placeholder="Telefone" autocomplete="tel" />
            </label>

            <label class="input field-group">
              <span class="icon"><font-awesome-icon :icon="faCalendar" /></span>
              <input
                v-model="birthdate"
                type="date"
                aria-label="Data de nascimento"
                autocomplete="bday"
              />
            </label>
          </div>

          <label class="photo-field">
            <span class="icon"><font-awesome-icon :icon="faUserCircle" /></span>
            <span class="photo-copy">
              <strong>Foto de perfil</strong>
              <small>{{ photo ? photo.name : 'Opcional - escolha uma imagem' }}</small>
            </span>
            <input type="file" accept="image/*" @change="handlePhotoChange" />
            <span class="photo-action">ESCOLHER</span>
          </label>

          <div v-if="photoPreview" class="photo-preview">
            <img :src="photoPreview" alt="Prévia da foto de perfil" />
          </div>

          <div class="input">
            <span class="icon"><font-awesome-icon :icon="faLock" /></span>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Senha (mínimo 8 caracteres)"
              autocomplete="new-password"
            />
            <button
              class="password-toggle"
              type="button"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>

          <div class="input">
            <span class="icon"><font-awesome-icon :icon="faLock" /></span>
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirmar senha"
              autocomplete="new-password"
            />
            <button
              class="password-toggle"
              type="button"
              :aria-label="showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>

          <p v-if="confirmPassword && password !== confirmPassword" class="error-message">
            As senhas não coincidem.
          </p>

          <button class="button" type="submit">CRIAR CONTA</button>
        </form>
      </div>
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
  font-family: 'Montserrat', sans-serif;
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

.screen {
  min-height: 100vh;
  max-width: 390px;
  margin: 0 auto;
  padding: 24px 20px;
  background: #fff;
  font-family: 'Montserrat', sans-serif;
}

.desktop-layout {
  min-height: calc(100vh - 48px);
}

.branding {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.reveste {
  width: 100%;
  max-width: 120px;
  height: auto;
}

.branding p {
  margin: 0;
  color: var(--text-color);
}

.form-wrapper {
  width: 100%;
}

.register-card {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  gap: 0;
  position: relative;
}

.back {
  width: 42px;
  height: 42px;
  margin: 0 0 28px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: var(--text-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.back:hover {
  transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.back svg {
  width: 22px;
  height: 22px;
}

.title {
  margin: 0 0 8px;
  color: var(--text-color);
  font-size: 26px;
  font-weight: 500;
  line-height: 1.35;
}

.subtitle {
  margin: 0 0 26px;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.5;
}

.input {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 22px;
  padding: 0 0 12px;
  border: 0;
  border-bottom: 1px solid #dcdcdc;
}

.icon {
  flex: 0 0 auto;
  color: #9e9e9e;
  font-size: 16px;
}

.input input {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  outline: 0;
  background: transparent;
  color: var(--text-color);
  font-family: inherit;
  font-size: 15px;
}

.input input:focus {
  border: 0;
  box-shadow: none;
}

.input input::placeholder {
  color: #bdbdbd;
}

.input:focus-within {
  border-bottom-color: #000;
}

.field-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.field-group {
  flex: 1;
  margin: 0 0 22px;
  flex-direction: row;
}

.field-group input[type='date'] {
  color: var(--text-color);
  font-size: 13px;
}

.photo-field {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin: 0 0 22px;
  padding: 0 0 12px;
  border-bottom: 1px solid #dcdcdc;
  cursor: pointer;
  position: relative;
}

.photo-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  color: var(--text-color);
  font-size: 14px;
}

.photo-copy small {
  overflow: hidden;
  color: #999;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-field input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

.photo-field:focus-within {
  outline: 2px solid #000;
  outline-offset: 4px;
}

.photo-action {
  color: var(--text-color);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
}

.photo-preview {
  width: 76px;
  height: 76px;
  margin: -10px 0 22px 26px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #eee;
}

.password-toggle {
  flex: 0 0 auto;
  border: 0;
  margin: 0;
  padding: 4px 0 4px 8px;
  background: transparent;
  color: #777;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}

.password-toggle:hover {
  transform: none;
  box-shadow: none;
}

.error-message {
  margin: -10px 0 18px;
  color: #d32f2f;
  font-size: 13px;
}

.button {
  width: 100%;
  height: 52px;
  margin: 4px 0 0;
  padding: 0 12px;
  border: 0;
  border-radius: 30px;
  background: #000;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: 0.2s ease;
}

.button:hover {
  background: #222;
  transform: none;
  box-shadow: none;
}

.button:active {
  transform: scale(0.98);
}

.success-card {
  border-radius: 12px;
}

@media (max-width: 420px) {
  .field-row {
    flex-direction: column;
    gap: 0;
  }
}

@media (min-width: 768px) {
  .screen {
    max-width: 100%;
    margin: 0;
    padding: 40px 24px;
  }
}

@media (min-width: 1024px) {
  .screen {
    max-width: 100%;
    height: 100vh;
    min-height: 0;
    margin: 0;
    padding: 0;
  }

  .desktop-layout {
    display: flex;
    height: 100%;
    min-height: 0;
  }

  .branding {
    flex: 1;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    margin: 0;
    background: #fff;
  }

  .reveste {
    max-width: 600px;
    margin-bottom: 24px;
  }

  .branding p {
    font-size: 28px;
    opacity: 0.9;
  }

  .form-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    padding: 24px;
    overflow: auto;
    background: #000;
  }

  .register-card {
    max-height: 100%;
    padding: 32px 40px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
  }
}
</style>
