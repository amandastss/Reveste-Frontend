<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '@/api/authApi'

const router = useRouter()
const isSaving = ref(false)
const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

type StoredUser = Record<string, unknown>

const getStoredUser = (): StoredUser => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

const user = ref<StoredUser>(getStoredUser())
const form = ref({
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  bio: '',
})
const photoFile = ref<File | null>(null)
const photoPreview = ref('')

function getImagePreview(value: unknown): string {
  if (typeof value !== 'string' || !value) return ''
  return value.startsWith('http') ? value : `${import.meta.env.VITE_API_URL}/api${value}`
}

function handlePhotoChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  photoFile.value = file

  if (!file) {
    photoPreview.value = getImagePreview(
      user.value.photo || user.value.profile_image || user.value.avatar || user.value.image,
    )
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    photoPreview.value = (reader.result as string) || ''
  }
  reader.readAsDataURL(file)
}

onMounted(() => {
  const currentUser = getStoredUser()
  user.value = currentUser

  form.value = {
    name: typeof currentUser.name === 'string' ? currentUser.name : '',
    email: typeof currentUser.email === 'string' ? currentUser.email : '',
    phone: typeof currentUser.phone === 'string' ? currentUser.phone : '',
    birthDate:
      typeof currentUser.date_of_birth === 'string'
        ? currentUser.date_of_birth
        : typeof currentUser.birth_date === 'string'
          ? currentUser.birth_date
          : '',
    bio: typeof currentUser.bio === 'string' ? currentUser.bio : '',
  }

  photoPreview.value = getImagePreview(
    currentUser.photo || currentUser.profile_image || currentUser.avatar || currentUser.image,
  )
})

async function saveProfile() {
  if (!form.value.name.trim() || !form.value.email.trim()) {
    feedback.value = 'Preencha nome e e-mail para continuar.'
    feedbackType.value = 'error'
    return
  }

  isSaving.value = true
  feedback.value = ''

  try {
    const payload = {
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim(),
      birth_date: form.value.birthDate,
      bio: form.value.bio.trim(),
    }

    const serverUser = await authApi.updateProfile({
      ...payload,
      profile_image: photoFile.value || undefined,
    })

    const mergedUser = {
      ...(user.value || {}),
      ...payload,
      date_of_birth: form.value.birthDate,
      birth_date: form.value.birthDate,
      photo: photoPreview.value || (typeof user.value.photo === 'string' ? user.value.photo : ''),
      profile_image:
        photoPreview.value ||
        (typeof user.value.profile_image === 'string' ? user.value.profile_image : ''),
      ...(serverUser && typeof serverUser === 'object' ? (serverUser as StoredUser) : {}),
    }

    localStorage.setItem('user', JSON.stringify(mergedUser))
    localStorage.setItem('email', payload.email)

    feedback.value = 'Perfil atualizado com sucesso!'
    feedbackType.value = 'success'
    setTimeout(() => router.push('/profile'), 400)
  } catch (error: unknown) {
    console.error('Erro ao atualizar perfil:', error)

    const message = (() => {
      if (!error || typeof error !== 'object')
        return 'Não foi possível salvar agora. Tente novamente.'
      if ('response' in error && error.response && typeof error.response === 'object') {
        const resp = error.response as Record<string, unknown>
        const data = resp.data as Record<string, unknown> | undefined
        if (data?.detail && typeof data.detail === 'string') return data.detail
        if (data?.message && typeof data.message === 'string') return data.message
      }
      if ('message' in error && typeof error.message === 'string') return error.message
      return 'Não foi possível salvar agora. Tente novamente.'
    })()

    feedback.value = message
    feedbackType.value = 'error'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="page">
    <!-- HEADER -->
    <div class="topbar">
      <button class="back" @click="router.back()">
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
      <h1>Editar perfil</h1>
      <button class="save" @click="saveProfile" :disabled="isSaving">
        {{ isSaving ? 'Salvando...' : 'Salvar' }}
      </button>
    </div>

    <!-- FOTO -->
    <div class="photo-area">
      <div class="photo">
        <img v-if="photoPreview" :src="photoPreview" />
        <span v-else>+</span>
      </div>
      <label class="change-photo">
        Alterar foto
        <input type="file" accept="image/*" @change="handlePhotoChange" />
      </label>
    </div>

    <!-- FORM -->
    <div class="form-area">
      <div class="input-group">
        <label>Nome</label>
        <input v-model="form.name" placeholder="Seu nome completo" />
      </div>

      <div class="input-group">
        <label>E-mail</label>
        <input v-model="form.email" type="email" placeholder="seu@email.com" />
      </div>

      <div class="input-group">
        <label>Telefone</label>
        <input v-model="form.phone" placeholder="(xx) xxxxx-xxxx" />
      </div>

      <div class="input-group">
        <label>Data de nascimento</label>
        <input v-model="form.birthDate" type="date" />
      </div>

      <div class="input-group">
        <label>Bio</label>
        <textarea v-model="form.bio" placeholder="Fale sobre você..." />
      </div>

      <p v-if="feedback" class="feedback" :class="feedbackType">
        {{ feedback }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--app-bg);
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
}

/* TOPBAR */
.topbar {
  position: sticky;
  top: 0;
  background: var(--surface-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  box-shadow: 0 2px 10px var(--shadow-color);
  z-index: 10;
  padding: 10px 14px;
}

.topbar h1 {
  font-size: 16px;
  margin: 0;
}

.topbar button {
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.topbar .back {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.25),
    0 4px 10px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.topbar .back:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px var(--shadow-color);
}

.topbar .back:active {
  transform: scale(0.92);
}

.topbar .back svg {
  width: 20px;
  height: 20px;
  color: var(--text-color);
  transition: transform 0.25s ease;
}

.topbar .back:hover svg {
  transform: translateX(-2px);
}

.topbar .save {
  background: var(--primary-color);
  color: black;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.topbar .save:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.topbar .save:active {
  transform: scale(0.96);
}

.topbar .save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* FOTO */
.photo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px;
}

.photo {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: var(--text-muted);
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.change-photo {
  margin-top: 10px;
  font-size: 13px;
  color: var(--primary-color);
  cursor: pointer;
}

.change-photo input {
  display: none;
}

/* FORM */
.form-area {
  padding: 0 16px 30px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* INPUT CARD */
.input-group {
  background: var(--surface-bg);
  padding: 14px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 6px 15px var(--shadow-color);
}

.input-group label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

input,
textarea {
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-color);
}

input:focus,
textarea:focus {
  outline: none;
}

textarea {
  resize: none;
  min-height: 70px;
}

/* FEEDBACK */
.feedback {
  text-align: center;
  font-size: 13px;
  margin-top: 6px;
}

.feedback.success {
  color: #0f8a3f;
}

.feedback.error {
  color: #c0392b;
}
</style>
